"""
MaatriSahayak - Register ASHA Worker Lambda Function

Registers a new ASHA worker account in the system.
"""

import json
import os
import boto3
import base64
from shared import (
    ValidationError,
    DatabaseError,
    ConflictError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    put_item,
    scan_items,
    generate_id,
    get_current_timestamp,
    validate_required_fields,
    validate_phone_number,
    validate_email,
    validate_age,
    send_asha_registration_email,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


# Initialize clients
cognito_client = boto3.client('cognito-idp')
lambda_client = boto3.client('lambda')
s3_client = boto3.client('s3')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')
S3_BUCKET = os.environ.get('S3_BUCKET', 'maatrisahayak-assets-dev')


def lambda_handler(event, context):
    try:
        log_info("Register ASHA worker request received")

        body = parse_event_body(event)

        required_fields = ['name', 'phone', 'email', 'password', 'age', 'district', 'village']
        validate_required_fields(body, required_fields)

        validate_phone_number(body['phone'])
        validate_email(body['email'])
        validate_age(body['age'])

        password = body['password']
        validate_password_strength(password)

        existing_by_phone = check_existing_asha_by_phone(body['phone'])
        if existing_by_phone:
            raise ConflictError(
                "An ASHA worker with this phone number is already registered.",
                details={'field': 'phone'}
            )

        existing_by_email = check_existing_asha_by_email(body['email'])
        if existing_by_email:
            raise ConflictError(
                "An ASHA worker with this email address is already registered.",
                details={'field': 'email'}
            )

        # Generate sequential ASHA ID
        asha_id = generate_sequential_asha_id()
        timestamp = get_current_timestamp()

        # Handle photo upload if provided
        photo_url = None
        if body.get('photo'):
            try:
                photo_url = upload_photo_to_s3(body['photo'], asha_id)
                log_info("Photo uploaded successfully", asha_id=asha_id, photo_url=photo_url)
            except ValidationError as ve:
                log_error("Photo validation error (non-fatal)", ve)
            except Exception as photo_error:
                log_error("Failed to upload photo (non-fatal)", photo_error)

        # Create Cognito user (disabled until officer approves)
        cognito_user_id = None
        try:
            user_attributes = [
                {'Name': 'name', 'Value': body['name']},
                {'Name': 'email', 'Value': body['email']},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'phone_number', 'Value': body['phone']},
                {'Name': 'custom:district', 'Value': body['district']},
                {'Name': 'custom:role', 'Value': 'ASHA'}
            ]

            # Create user with permanent password directly
            cognito_response = cognito_client.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=body['email'],
                UserAttributes=user_attributes,
                MessageAction='SUPPRESS',
                TemporaryPassword=password
            )
            
            # Extract Cognito user ID (sub)
            for attr in cognito_response.get('User', {}).get('Attributes', []):
                if attr['Name'] == 'sub':
                    cognito_user_id = attr['Value']
                    break

            # Set permanent password
            cognito_client.admin_set_user_password(
                UserPoolId=USER_POOL_ID,
                Username=body['email'],
                Password=password,
                Permanent=True
            )

            # Disable user until approved
            cognito_client.admin_disable_user(
                UserPoolId=USER_POOL_ID,
                Username=body['email']
            )

            log_info("Cognito user created (disabled, pending approval)", email=body['email'], cognito_user_id=cognito_user_id)

        except cognito_client.exceptions.UsernameExistsException:
            raise ConflictError(
                f"User with email {body['email']} already exists.",
                details={'email': body['email']}
            )
        except Exception as cognito_error:
            log_error("Error creating Cognito user", cognito_error)
            raise ValidationError(
                f"Failed to create user account: {str(cognito_error)}",
                field='cognito'
            )

        # Create ASHA data record with Cognito user ID
        asha_data = {
            'id': asha_id,
            'name': body['name'],
            'phone': body['phone'],
            'email': body.get('email'),
            'age': body['age'],
            'district': body['district'],
            'block': body.get('block'),
            'village': body['village'],
            'photo_url': photo_url,
            'qualification': body.get('qualification'),
            'experience_years': body.get('experience_years', 0),
            'languages': body.get('languages', ['Hindi']),
            'status': 'ACTIVE',
            'verificationStatus': 'PENDING',
            'pregnancies_managed': 0,
            'emergencies_handled': 0,
            'cognito_user_id': cognito_user_id,
            'created_at': timestamp,
            'updated_at': timestamp
        }

        # Save to DynamoDB — rollback Cognito user if this fails
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        try:
            put_item(table_name, asha_data)
        except Exception as db_error:
            log_error("DynamoDB save failed, rolling back Cognito user", db_error)
            try:
                cognito_client.admin_delete_user(UserPoolId=USER_POOL_ID, Username=body['email'])
            except Exception:
                pass
            raise

        # Send registration confirmation email (welcome + pending approval details)
        try:
            send_asha_registration_email(
                name=body['name'],
                email=body['email'],
                asha_id=asha_id,
                district=body['district']
            )
        except Exception as e:
            log_error("Failed to send registration email (non-fatal)", e)

        # WebSocket notification to dashboard
        try:
            send_registration_notification(
                registration_type='ASHA',
                name=body['name'],
                reg_id=asha_id
            )
        except Exception as ws_error:
            log_error("Failed to send WebSocket notification (non-fatal)", ws_error)

        log_info("ASHA worker registered successfully", asha_id=asha_id, name=body['name'], district=body['district'])

        return create_success_response(asha_data, "ASHA worker registered successfully")

    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except ConflictError as e:
        log_error("Conflict error - duplicate ASHA worker", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'], "InternalServerError",
            "An unexpected error occurred while registering ASHA worker", {'error': str(e)}
        )


def validate_password_strength(password: str) -> None:
    import re
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("one uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("one lowercase letter")
    if not re.search(r'\d', password):
        errors.append("one number")
    if not re.search(r'[^A-Za-z0-9]', password):
        errors.append("one special character")
    if errors:
        raise ValidationError(
            f"Password must contain: {', '.join(errors)}",
            field='password'
        )


def check_existing_asha_by_phone(phone: str) -> list:
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        return scan_items(table_name, filter_expression='phone = :phone',
                          expression_attribute_values={':phone': phone}, limit=1)
    except Exception as e:
        log_error("Error checking existing ASHA by phone", e)
        return []


def check_existing_asha_by_email(email: str) -> list:
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        return scan_items(table_name, filter_expression='email = :email',
                          expression_attribute_values={':email': email}, limit=1)
    except Exception as e:
        log_error("Error checking existing ASHA by email", e)
        return []


def send_registration_notification(registration_type: str, name: str, reg_id: str):
    try:
        lambda_client.invoke(
            FunctionName='maatrisahayak-send-notifications',
            InvocationType='Event',
            Payload=json.dumps({
                'notification_type': 'NEW_REGISTRATION',
                'data': {'registrationType': registration_type, 'name': name, 'registrationId': reg_id}
            })
        )
        log_info("Registration notification sent", registration_type=registration_type, reg_id=reg_id)
    except Exception as e:
        log_error("Failed to send registration notification", e)
        raise


def generate_sequential_asha_id() -> str:
    """
    Generate sequential ASHA ID like asha-001, asha-002, etc.
    """
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        # Scan to get all existing IDs
        response = scan_items(table_name)
        
        # Extract numeric parts from IDs like 'asha-001', 'asha-002'
        max_num = 0
        for item in response:
            asha_id = item.get('id', '')
            if asha_id.startswith('asha-') and len(asha_id.split('-')) == 2:
                try:
                    num = int(asha_id.split('-')[1])
                    max_num = max(max_num, num)
                except ValueError:
                    continue
        
        # Generate next sequential ID
        next_num = max_num + 1
        return f"asha-{next_num:03d}"
    except Exception as e:
        log_error("Error generating sequential ASHA ID", e)
        # Fallback to UUID-based ID
        return generate_id('asha_')


def upload_photo_to_s3(photo_base64: str, asha_id: str) -> str:
    """
    Upload ASHA worker photo to S3 and return the URL.
    Expects base64 encoded image data.
    """
    try:
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in photo_base64:
            photo_base64 = photo_base64.split(',')[1]
        
        # Validate base64 size (max 5MB)
        max_size = 5 * 1024 * 1024
        if len(photo_base64) > max_size:
            raise ValidationError("Photo size exceeds 5MB limit", field='photo')
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(photo_base64)
        except Exception as decode_error:
            log_error("Failed to decode base64 photo", decode_error)
            raise ValidationError("Invalid photo format. Please ensure it's a valid image.", field='photo')
        
        # Validate decoded image size
        if len(image_data) > max_size:
            raise ValidationError("Photo size exceeds 5MB limit", field='photo')
        
        # Generate S3 key
        file_extension = 'jpg'
        s3_key = f'asha-photos/{asha_id}.{file_extension}'
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg',
            ACL='public-read'
        )
        
        # Generate public URL
        photo_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"
        
        log_info("Photo uploaded to S3", s3_key=s3_key, photo_url=photo_url)
        return photo_url
        
    except ValidationError:
        raise
    except Exception as e:
        log_error("Error uploading photo to S3", e)
        raise ValidationError(f"Failed to upload photo: {str(e)}", field='photo')
