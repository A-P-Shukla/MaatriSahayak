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


# Initialize clients
cognito_client = boto3.client('cognito-idp')
ses_client = boto3.client('ses', region_name='ap-south-1')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'noreply.maatrisahayak@gmail.com')


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
            'verificationStatus': 'PENDING',
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

            # Disable account until officer approves
            cognito_client.admin_disable_user(
                UserPoolId=USER_POOL_ID,
                Username=body['email']
            )
            
            log_info("Cognito user created (disabled pending approval)", email=body['email'])
            
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
        
        # Send pending approval email
        try:
            send_pending_email(
                email=body['email'],
                name=body['name'],
                reg_id=asha_id,
                role='ASHA Worker',
                district=body['district']
            )
        except Exception as email_error:
            log_error("Failed to send pending email (non-fatal)", email_error)
        
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


def send_pending_email(email: str, name: str, reg_id: str, role: str, district: str):
    subject = "MatriSahayak – Registration Received, Pending Approval"
    html_body = f"""<html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#1a6b4a;padding:24px;text-align:center;">
      <p style="color:#ffffff;font-size:20px;font-weight:bold;margin:0;">MatriSahayak</p>
      <p style="color:#a8d5be;font-size:12px;margin:4px 0 0;">National Health Mission</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:16px;color:#333;">Dear <strong>{name}</strong>,</p>
      <p style="color:#555;">Your registration as an <strong>{role}</strong> has been received successfully.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;width:140px;">Registration ID</td><td style="padding:10px;color:#1a6b4a;font-weight:bold;">{reg_id}</td></tr>
        <tr><td style="padding:10px;color:#888;">Role</td><td style="padding:10px;color:#333;">{role}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;">District</td><td style="padding:10px;color:#333;">{district}</td></tr>
        <tr><td style="padding:10px;color:#888;">Status</td><td style="padding:10px;"><span style="background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-size:13px;">⏳ Pending Approval</span></td></tr>
      </table>
      <p style="color:#555;">A District Officer will review your application. You will receive another email once a decision is made.</p>
      <p style="color:#555;">Until then, your account login is temporarily disabled.</p>
    </div>
    <div style="background:#f4f4f4;padding:16px;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#aaa;font-size:12px;margin:0;">MatriSahayak &bull; No-Reply &bull; Do not reply to this email</p>
    </div>
  </div>
</body></html>"""
    ses_client.send_email(
        Source=f"MatriSahayak <{SES_SENDER_EMAIL}>",
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': subject, 'Charset': 'UTF-8'},
            'Body': {
                'Text': {'Data': f"Dear {name},\n\nYour {role} registration ({reg_id}) in {district} is pending approval.\n\nMatriSahayak", 'Charset': 'UTF-8'},
                'Html': {'Data': html_body, 'Charset': 'UTF-8'},
            }
        }
    )
    log_info("Pending approval email sent", email=email, reg_id=reg_id)


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
