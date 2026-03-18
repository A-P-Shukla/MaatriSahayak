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
    validate_age
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


# Initialize Cognito client
cognito_client = boto3.client('cognito-idp')
ses_client = boto3.client('ses')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'no-reply@maatrisahayak.in')


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
        validate_email(body['email'])
        validate_age(body['age'])
        
        # Validate password strength
        password = body['password']
        validate_password_strength(password)
        
        # Check for duplicate phone number
        existing_by_phone = check_existing_asha_by_phone(body['phone'])
        if existing_by_phone:
            raise ConflictError(
                "An ASHA worker with this phone number is already registered.",
                details={'field': 'phone'}
            )
        
        # Check for duplicate email in DynamoDB
        existing_by_email = check_existing_asha_by_email(body['email'])
        if existing_by_email:
            raise ConflictError(
                "An ASHA worker with this email address is already registered.",
                details={'field': 'email'}
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
        
        # Send ID card email
        try:
            send_id_card_email(
                email=body['email'],
                name=body['name'],
                asha_id=asha_id,
                phone=body['phone'],
                district=body['district'],
                village=body['village'],
                issue_date=timestamp[:10]
            )
        except Exception as email_error:
            log_error("Failed to send ID card email (non-fatal)", email_error)
        
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


def send_id_card_email(email: str, name: str, asha_id: str, phone: str, district: str, village: str, issue_date: str):
    """
    Send ASHA ID card details to the registered email via AWS SES.
    """
    subject = "Your MaatriSahayak ASHA Worker ID Card"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
      <div style="max-width: 480px; margin: auto; background: #0A1F1A; border-radius: 16px; overflow: hidden; border: 2px solid #FFD700;">
        <div style="background: #071A14; padding: 16px; text-align: center; border-bottom: 1px solid #1E3D33;">
          <div style="height: 6px; display: flex;">
            <div style="flex:1; background:#FF9933;"></div>
            <div style="flex:1; background:#FFFFFF;"></div>
            <div style="flex:1; background:#138808;"></div>
          </div>
          <p style="color: #FFD700; font-size: 11px; letter-spacing: 1.2px; margin: 12px 0 4px;">&#127470;&#127475; NATIONAL HEALTH MISSION</p>
          <p style="color: #FFFFFF; font-size: 16px; font-weight: bold; margin: 0;">ASHA Worker Identity Card</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; color: #FFFFFF; font-size: 14px;">
            <tr><td style="color: #B8D4CC; width: 100px;">Name</td><td><strong>{name}</strong></td></tr>
            <tr><td style="color: #B8D4CC;">Worker ID</td><td><strong style="color: #00E5A0;">{asha_id}</strong></td></tr>
            <tr><td style="color: #B8D4CC;">Phone</td><td>{phone}</td></tr>
            <tr><td style="color: #B8D4CC;">District</td><td>{district}</td></tr>
            <tr><td style="color: #B8D4CC;">Village</td><td>{village}</td></tr>
            <tr><td style="color: #B8D4CC;">Issued On</td><td>{issue_date}</td></tr>
          </table>
        </div>
        <div style="background: #071A14; padding: 12px; text-align: center; border-top: 1px solid #1E3D33;">
          <p style="color: #7A9E90; font-size: 11px; margin: 0;">MaatriSahayak &bull; Govt. of India</p>
          <p style="color: #7A9E90; font-size: 11px; margin: 4px 0 0;">Please keep this ID card safe. Do not share your password.</p>
        </div>
      </div>
    </body>
    </html>
    """
    text_body = (
        f"Your MaatriSahayak ASHA Worker ID Card\n\n"
        f"Name: {name}\n"
        f"Worker ID: {asha_id}\n"
        f"Phone: {phone}\n"
        f"District: {district}\n"
        f"Village: {village}\n"
        f"Issued On: {issue_date}\n\n"
        f"MaatriSahayak - Govt. of India"
    )
    ses_client.send_email(
        Source=SES_SENDER_EMAIL,
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': subject, 'Charset': 'UTF-8'},
            'Body': {
                'Text': {'Data': text_body, 'Charset': 'UTF-8'},
                'Html': {'Data': html_body, 'Charset': 'UTF-8'},
            }
        }
    )
    log_info("ID card email sent", email=email, asha_id=asha_id)


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


def check_existing_asha_by_phone(phone: str) -> list:
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        return scan_items(
            table_name,
            filter_expression='phone = :phone',
            expression_attribute_values={':phone': phone},
            limit=1
        )
    except Exception as e:
        log_error("Error checking existing ASHA by phone", e)
        return []


def check_existing_asha_by_email(email: str) -> list:
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        return scan_items(
            table_name,
            filter_expression='email = :email',
            expression_attribute_values={':email': email},
            limit=1
        )
    except Exception as e:
        log_error("Error checking existing ASHA by email", e)
        return []


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
