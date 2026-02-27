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
    validate_age
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


# Initialize Cognito client
cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')


def lambda_handler(event, context):
    """
    Register a new ASHA worker account.
    
    Expected Input:
    {
        "name": "string",
        "phone": "string",
        "email": "string" (optional),
        "password": "string",
        "age": int,
        "district": "string",
        "block": "string" (optional),
        "village": "string",
        "qualification": "string" (optional),
        "experience_years": int (optional),
        "languages": ["string"] (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "asha_xxx",
            "name": "...",
            "phone": "...",
            "status": "ACTIVE",
            ...
        },
        "message": "ASHA worker registered successfully"
    }
    """
    try:
        log_info("Register ASHA worker request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['name', 'phone', 'email', 'password', 'age', 'district', 'village']
        validate_required_fields(body, required_fields)
        
        # Validate specific fields
        validate_phone_number(body['phone'])
        validate_age(body['age'])
        
        # Validate password strength
        password = body['password']
        if len(password) < 8:
            raise ValidationError(
                "Password must be at least 8 characters long",
                field='password'
            )
        
        # Check for duplicate phone number
        existing_asha = check_existing_asha(body['phone'])
        if existing_asha:
            raise ConflictError(
                f"ASHA worker with phone number {body['phone']} already exists",
                details={'existing_asha_id': existing_asha[0]['id']}
            )
        
        # Generate unique ASHA worker ID
        asha_id = generate_id('asha_')
        timestamp = get_current_timestamp()
        
        # Prepare ASHA worker data
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
            'pregnancies_managed': 0,
            'emergencies_handled': 0,
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        # Create Cognito user
        try:
            user_attributes = [
                {'Name': 'name', 'Value': body['name']},
                {'Name': 'phone_number', 'Value': body['phone']},
                {'Name': 'custom:district', 'Value': body['district']},
                {'Name': 'custom:role', 'Value': 'ASHA'}
            ]
            
            # Use email as username (Cognito User Pool is configured for email)
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
            
            log_info("Cognito user created successfully", email=body['email'])
            
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
        
        # Save to DynamoDB
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        put_item(table_name, asha_data)
        
        log_info(
            "ASHA worker registered successfully",
            asha_id=asha_id,
            name=body['name'],
            district=body['district']
        )
        
        return create_success_response(
            asha_data,
            "ASHA worker registered successfully"
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
        log_error("Conflict error - duplicate ASHA worker", e)
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
            "An unexpected error occurred while registering ASHA worker",
            {'error': str(e)}
        )


def check_existing_asha(phone: str) -> list:
    """
    Check if ASHA worker with phone number already exists.
    
    Args:
        phone: Phone number to check
    
    Returns:
        List of existing ASHA workers (empty if none found)
    """
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        
        asha_workers = scan_items(
            table_name,
            filter_expression='phone = :phone',
            expression_attribute_values={':phone': phone},
            limit=1
        )
        
        return asha_workers
    
    except Exception as e:
        log_error("Error checking existing ASHA worker", e, phone=phone)
        return []
