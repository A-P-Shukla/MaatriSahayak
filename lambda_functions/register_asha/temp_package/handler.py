"""
MaatriSahayak - Register ASHA Worker Lambda Function

Registers a new ASHA worker account in the system.
"""

import json
import os
import boto3
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
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')


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

        asha_id = generate_id('asha_')
        timestamp = get_current_timestamp()

        asha_data = {
            'id': asha_id,
            'name': body['name'],
            'phone': body['phone'],
            'email': body.get('email'),
            'age': body['age'],
            'district': body['district'],
            'block': body.get('block'),
            'village': body['village'],
            'qualification': body.get('qualification'),
            'experience_years': body.get('experience_years', 0),
            'languages': body.get('languages', ['Hindi']),
            'status': 'ACTIVE',
            'verificationStatus': 'PENDING',
            'pregnancies_managed': 0,
            'emergencies_handled': 0,
            'created_at': timestamp,
            'updated_at': timestamp
        }

        # Create Cognito user (disabled until officer approves)
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
            cognito_client.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=body['email'],
                UserAttributes=user_attributes,
                MessageAction='SUPPRESS',
                TemporaryPassword=password
            )

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

            log_info("Cognito user created (disabled, pending approval)", email=body['email'])

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
