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
lambda_client = boto3.client('lambda')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'noreply.maatrisahayak@gmail.com')


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
                {'Name': 'custom:role', 'Value': 'ASHA'},
                {'Name': 'custom:asha_id', 'Value': asha_id}
            ]

            cognito_client.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=body['email'],
                UserAttributes=user_attributes,
                MessageAction='SUPPRESS',
                TemporaryPassword=password
            )

            cognito_client.admin_set_user_password(
                UserPoolId=USER_POOL_ID,
                Username=body['email'],
                Password=password,
                Permanent=True
            )

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

        # Email 1 — Welcome email
        try:
            send_welcome_email(email=body['email'], name=body['name'], role='ASHA Worker')
        except Exception as e:
            log_error("Failed to send welcome email (non-fatal)", e)

        # Email 2 — Pending approval notice with registration details
        try:
            send_pending_email(
                email=body['email'],
                name=body['name'],
                reg_id=asha_id,
                role='ASHA Worker',
                district=body['district']
            )
        except Exception as e:
            log_error("Failed to send pending email (non-fatal)", e)

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


def send_welcome_email(email: str, name: str, role: str):
    subject = "Welcome to MaatriSahayak!"
    html_body = f"""<html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#1a6b4a;padding:32px;text-align:center;">
      <p style="color:#ffffff;font-size:24px;font-weight:bold;margin:0;">MaatriSahayak</p>
      <p style="color:#a8d5be;font-size:13px;margin:6px 0 0;">National Health Mission &bull; Maternal Care</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:20px;color:#1a6b4a;font-weight:bold;margin:0 0 8px;">Welcome, {name}!</p>
      <p style="color:#555;line-height:1.6;">Thank you for joining MaatriSahayak as an <strong>{role}</strong>. You are now part of a mission to improve maternal health outcomes across rural India.</p>
      <div style="background:#f0faf5;border-left:4px solid #1a6b4a;padding:16px;border-radius:6px;margin:24px 0;">
        <p style="color:#1a6b4a;font-weight:bold;margin:0 0 6px;">What happens next?</p>
        <p style="color:#555;margin:0;line-height:1.6;">Your registration is being reviewed by a District Officer. You will receive a separate email with the approval decision shortly. Once approved, you can log in to the MaatriSahayak app.</p>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px;">Questions? Contact us at <a href="mailto:support@maatrisahayak.org" style="color:#1a6b4a;">support@maatrisahayak.org</a></p>
    </div>
    <div style="background:#f4f4f4;padding:16px;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#aaa;font-size:12px;margin:0;">MaatriSahayak &bull; National Health Mission &bull; India</p>
    </div>
  </div>
</body></html>"""
    ses_client.send_email(
        Source=f"MaatriSahayak <{SES_SENDER_EMAIL}>",
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': subject, 'Charset': 'UTF-8'},
            'Body': {
                'Text': {'Data': f"Welcome {name}!\n\nThank you for joining MaatriSahayak as an {role}. Your registration is under review. You will receive another email with the approval decision.\n\nMaatriSahayak", 'Charset': 'UTF-8'},
                'Html': {'Data': html_body, 'Charset': 'UTF-8'},
            }
        }
    )
    log_info("Welcome email sent", email=email)


def send_pending_email(email: str, name: str, reg_id: str, role: str, district: str):
    subject = "MaatriSahayak - Registration Received, Pending Approval"
    html_body = f"""<html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#1a6b4a;padding:24px;text-align:center;">
      <p style="color:#ffffff;font-size:20px;font-weight:bold;margin:0;">MaatriSahayak</p>
      <p style="color:#a8d5be;font-size:12px;margin:4px 0 0;">National Health Mission</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:16px;color:#333;">Dear <strong>{name}</strong>,</p>
      <p style="color:#555;">Your registration as an <strong>{role}</strong> has been received successfully. Here are your registration details:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;width:140px;">Registration ID</td><td style="padding:10px;color:#1a6b4a;font-weight:bold;">{reg_id}</td></tr>
        <tr><td style="padding:10px;color:#888;">Role</td><td style="padding:10px;color:#333;">{role}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;">District</td><td style="padding:10px;color:#333;">{district}</td></tr>
        <tr><td style="padding:10px;color:#888;">Login Email</td><td style="padding:10px;color:#333;">{email}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;">Status</td><td style="padding:10px;"><span style="background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-size:13px;">&#9203; Pending Approval</span></td></tr>
      </table>
      <p style="color:#555;">A District Officer will review your application. You will receive another email once a decision is made.</p>
      <p style="color:#888;font-size:12px;">If you did not register, please contact <a href="mailto:support@maatrisahayak.org" style="color:#1a6b4a;">support@maatrisahayak.org</a> immediately.</p>
    </div>
    <div style="background:#f4f4f4;padding:16px;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#aaa;font-size:12px;margin:0;">MaatriSahayak &bull; support@maatrisahayak.org</p>
    </div>
  </div>
</body></html>"""
    ses_client.send_email(
        Source=f"MaatriSahayak <{SES_SENDER_EMAIL}>",
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': subject, 'Charset': 'UTF-8'},
            'Body': {
                'Text': {'Data': f"Dear {name},\n\nYour {role} registration ({reg_id}) in {district} has been received and is pending approval by a District Officer.\n\nYou will receive another email once a decision is made.\n\nMaatriSahayak", 'Charset': 'UTF-8'},
                'Html': {'Data': html_body, 'Charset': 'UTF-8'},
            }
        }
    )
    log_info("Pending approval email sent", email=email, reg_id=reg_id)


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
