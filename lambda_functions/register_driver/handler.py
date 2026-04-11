"""
MaatriSahayak - Register Driver Lambda Function

Registers a new ambulance driver in the system.
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
    get_item,
    generate_id,
    get_current_timestamp,
    validate_required_fields,
    validate_phone_number,
    validate_email,
    send_driver_registration_email,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


# Initialize clients
cognito_client = boto3.client('cognito-idp')
lambda_client = boto3.client('lambda')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')


def lambda_handler(event, context):
    """
    Register a new ambulance driver account.
    
    Expected Input:
    {
        "name": "string",
        "phone": "string",
        "email": "string",
        "password": "string",
        "license_number": "string",
        "license_photo": "string" (S3 URL),
        "ambulance_id": "string",
        "photo": "string" (S3 URL, optional),
        "emergency_contact": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "drv_xxx",
            "name": "...",
            "phone": "...",
            "ambulance_id": "...",
            "status": "AVAILABLE",
            ...
        },
        "message": "Driver registered successfully"
    }
    """
    try:
        log_info("Register driver request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields — ambulance_id is optional, assigned later by coordinator
        required_fields = ['name', 'phone', 'email', 'password', 'license_number']
        validate_required_fields(body, required_fields)
        
        # Validate specific fields
        validate_phone_number(body['phone'])
        validate_email(body['email'])
        
        # Validate password strength
        password = body['password']
        validate_password_strength(password)
        
        # Check for duplicate phone number
        existing_by_phone = check_existing_driver_by_phone(body['phone'])
        if existing_by_phone:
            raise ConflictError(
                "A driver with this phone number is already registered.",
                details={'field': 'phone'}
            )
        
        # Check for duplicate email
        existing_by_email = check_existing_driver_by_email(body['email'])
        if existing_by_email:
            raise ConflictError(
                "A driver with this email address is already registered.",
                details={'field': 'email'}
            )
        
        # Check for duplicate license number
        existing_by_license = check_existing_driver_by_license(body['license_number'])
        if existing_by_license:
            raise ConflictError(
                "A driver with this license number is already registered.",
                details={'field': 'license_number'}
            )
        
        # Optionally verify ambulance if provided
        ambulance_id = body.get('ambulance_id', '')
        if ambulance_id:
            ambulance = get_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': ambulance_id}
            )
            if not ambulance:
                raise ValidationError(
                    f"Ambulance with ID {ambulance_id} not found",
                    field='ambulance_id'
                )
            if ambulance.get('assignedDriverId'):
                raise ConflictError(
                    f"Ambulance {ambulance_id} already has a driver assigned",
                    details={'ambulance_id': ambulance_id}
                )
        
        # Generate unique driver ID
        driver_id = generate_id('drv_')
        timestamp = get_current_timestamp()
        
        # Prepare driver data
        driver_data = {
            'id': driver_id,
            'userId': None,  # Will be set after Cognito user creation
            'name': body['name'],
            'phone': body['phone'],
            'email': body['email'],
            'licenseNumber': body['license_number'],
            'licensePhotoUrl': body.get('license_photo', ''),
            'photo': body.get('photo', ''),
            'ambulanceId': ambulance_id if ambulance_id else 'UNASSIGNED',
            'status': 'AVAILABLE',
            'verificationStatus': 'PENDING',
            'currentLocation': {
                'latitude': 0.0,
                'longitude': 0.0,
                'lastUpdated': timestamp
            },
            'rating': 5.0,
            'totalRides': 0,
            'emergencyContact': body.get('emergency_contact', ''),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # Create Cognito user
        try:
            user_attributes = [
                {'Name': 'name', 'Value': body['name']},
                {'Name': 'email', 'Value': body['email']},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'phone_number', 'Value': body['phone']},
                {'Name': 'custom:role', 'Value': 'DRIVER'},
                {'Name': 'custom:driver_id', 'Value': driver_id}
            ]
            
            # Use email as username — created disabled until officer approves
            cognito_response = cognito_client.admin_create_user(
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

            # Disable account until officer approves
            cognito_client.admin_disable_user(
                UserPoolId=USER_POOL_ID,
                Username=body['email']
            )
            
            # Get Cognito user sub (userId)
            user_sub = cognito_response['User']['Username']
            driver_data['userId'] = user_sub
            
            log_info("Cognito user created successfully", email=body['email'], driver_id=driver_id)
            
        except cognito_client.exceptions.UsernameExistsException:
            raise ConflictError(
                f"User with email {body['email']} already exists in Cognito",
                details={'email': body['email']}
            )
        except Exception as cognito_error:
            log_error("Error creating Cognito user", cognito_error)
            raise ValidationError(
                f"Failed to create user account: {str(cognito_error)}",
                field='cognito'
            )
        
        # Save driver to DynamoDB — rollback Cognito user if this fails
        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')
        try:
            put_item(table_name, driver_data)
        except Exception as db_error:
            log_error("DynamoDB save failed, rolling back Cognito user", db_error)
            try:
                cognito_client.admin_delete_user(UserPoolId=USER_POOL_ID, Username=body['email'])
            except Exception:
                pass
            raise
        
        # Update ambulance with driver assignment only if ambulance_id was provided
        if ambulance_id:
            from shared.db_helper import update_item
            update_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': ambulance_id},
                {
                    'assignedDriverId': driver_id,
                    'driverName': body['name'],
                    'driverPhone': body['phone'],
                }
            )
        
        # Send registration confirmation email
        try:
            send_driver_registration_email(
                name=body['name'],
                email=body['email'],
                driver_id=driver_id,
                district=body.get('district', 'N/A')
            )
        except Exception as e:
            log_error("Failed to send registration email (non-fatal)", e)

        # Send WebSocket notification to dashboard
        try:
            send_registration_notification(
                registration_type='DRIVER',
                name=body['name'],
                reg_id=driver_id
            )
        except Exception as ws_error:
            log_error("Failed to send WebSocket notification (non-fatal)", ws_error)

        log_info(
            "Driver registered successfully",
            driver_id=driver_id,
            name=body['name'],
            ambulance_id=ambulance_id
        )
        
        return create_success_response(
            driver_data,
            "Driver registered successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except ConflictError as e:
        log_error("Conflict error - duplicate driver", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while registering driver",
            {'error': str(e)}
        )


def validate_password_strength(password: str) -> None:
    """
    Enforce strong password: min 8 chars, uppercase, lowercase, digit, special char.
    """
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


def check_existing_driver_by_phone(phone: str) -> list:
    try:
        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')
        return scan_items(
            table_name,
            filter_expression='phone = :phone',
            expression_attribute_values={':phone': phone},
            limit=1
        )
    except Exception as e:
        log_error("Error checking existing driver by phone", e)
        return []


def check_existing_driver_by_email(email: str) -> list:
    try:
        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')
        return scan_items(
            table_name,
            filter_expression='email = :email',
            expression_attribute_values={':email': email},
            limit=1
        )
    except Exception as e:
        log_error("Error checking existing driver by email", e)
        return []


def check_existing_driver_by_license(license_number: str) -> list:
    try:
        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')
        return scan_items(
            table_name,
            filter_expression='licenseNumber = :license',
            expression_attribute_values={':license': license_number},
            limit=1
        )
    except Exception as e:
        log_error("Error checking existing driver by license", e)
        return []


def send_registration_notification(registration_type: str, name: str, reg_id: str):
    """
    Send WebSocket notification about new registration to dashboard.
    """
    try:
        lambda_client.invoke(
            FunctionName='maatrisahayak-send-notifications',
            InvocationType='Event',  # Async
            Payload=json.dumps({
                'notification_type': 'NEW_REGISTRATION',
                'data': {
                    'registrationType': registration_type,
                    'name': name,
                    'registrationId': reg_id
                }
            })
        )
        log_info("Registration notification sent", registration_type=registration_type, reg_id=reg_id)
    except Exception as e:
        log_error("Failed to send registration notification", e)
        raise
