"""
MaatriSahayak - Forgot Password Lambda
Generates a reset code, stores it in DynamoDB, sends via SES.
"""

import json
import os
import boto3
import random
import string
from datetime import datetime, timezone, timedelta
from shared import (
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
)
from shared.constants import HTTP_STATUS

cognito_client = boto3.client('cognito-idp')
ses_client = boto3.client('ses', region_name='ap-south-1')
dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')

USER_POOL_ID = os.environ.get('USER_POOL_ID')
SES_SENDER = os.environ.get('SES_SENDER_EMAIL', 'MatriSahayak <noreply@maatrisahayak.in>')
RESET_TABLE = os.environ.get('RESET_TABLE', 'maatrisahayak-password-resets-dev')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json',
}


def lambda_handler(event, context):
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

        body = parse_event_body(event)
        action = body.get('action', 'request')

        if action == 'request':
            return handle_request(body)
        elif action == 'confirm':
            return handle_confirm(body)
        else:
            return create_error_response(400, 'ValidationError', 'Invalid action')

    except Exception as e:
        log_error("Unexpected error in forgot_password", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            'InternalServerError',
            str(e)
        )


def handle_request(body):
    email = body.get('email', '').strip().lower()
    if not email:
        return create_error_response(400, 'ValidationError', 'Email is required')

    # Check user exists in Cognito
    try:
        cognito_client.admin_get_user(UserPoolId=USER_POOL_ID, Username=email)
    except cognito_client.exceptions.UserNotFoundException:
        # Return success anyway to prevent email enumeration
        return create_success_response({}, 'If this email is registered, a reset code has been sent.')

    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = int((datetime.now(timezone.utc) + timedelta(minutes=15)).timestamp())

    # Store in DynamoDB
    table = dynamodb.Table(RESET_TABLE)
    table.put_item(Item={
        'email': email,
        'code': code,
        'expires_at': expires_at,
        'used': False,
    })

    # Send via SES
    send_reset_email(email, code)
    log_info("Password reset code sent", email=email)

    return create_success_response({}, 'Reset code sent to your email.')


def handle_confirm(body):
    email = body.get('email', '').strip().lower()
    code = body.get('code', '').strip()
    new_password = body.get('new_password', '')

    if not email or not code or not new_password:
        return create_error_response(400, 'ValidationError', 'email, code and new_password are required')

    # Validate code from DynamoDB
    table = dynamodb.Table(RESET_TABLE)
    resp = table.get_item(Key={'email': email})
    item = resp.get('Item')

    if not item:
        return create_error_response(400, 'ValidationError', 'Invalid or expired reset code')

    if item.get('used'):
        return create_error_response(400, 'ValidationError', 'Reset code has already been used')

    now = int(datetime.now(timezone.utc).timestamp())
    if now > int(item.get('expires_at', 0)):
        return create_error_response(400, 'ValidationError', 'Reset code has expired. Please request a new one.')

    if item.get('code') != code:
        return create_error_response(400, 'ValidationError', 'Invalid reset code')

    # Set new password in Cognito
    try:
        cognito_client.admin_set_user_password(
            UserPoolId=USER_POOL_ID,
            Username=email,
            Password=new_password,
            Permanent=True
        )
    except cognito_client.exceptions.InvalidPasswordException as e:
        return create_error_response(400, 'ValidationError', str(e))

    # Mark code as used
    table.update_item(
        Key={'email': email},
        UpdateExpression='SET used = :t',
        ExpressionAttributeValues={':t': True}
    )

    log_info("Password reset successful", email=email)
    return create_success_response({}, 'Password reset successfully.')


def send_reset_email(email: str, code: str):
    html = f"""
    <html><body style="margin:0;padding:0;background:#f4f4f4;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;">
            <!-- Header -->
            <tr><td style="background:linear-gradient(135deg,#2D0A4E,#6B2FA0);padding:32px;text-align:center;">
              <p style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.3px;">Maatri<span style="color:#F9A8D4;">Sahayak</span></p>
              <p style="color:#E9D5FF;font-size:11px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">District Officer Portal</p>
            </td></tr>
            <!-- Body -->
            <tr><td style="padding:36px 40px;">
              <p style="font-size:15px;color:#1A0A2E;font-weight:600;margin:0 0 8px;">Password Reset Request</p>
              <p style="font-size:14px;color:#5C3A7A;margin:0 0 28px;line-height:1.6;">
                We received a request to reset your password. Use the code below — it expires in <strong>15 minutes</strong>.
              </p>
              <!-- Code box -->
              <div style="background:#F8F4FF;border:2px dashed #C0395B;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
                <p style="font-size:38px;font-weight:900;letter-spacing:12px;color:#A0294A;margin:0;font-family:monospace;">{code}</p>
                <p style="font-size:12px;color:#9580AA;margin:8px 0 0;">One-time password reset code</p>
              </div>
              <p style="font-size:13px;color:#9580AA;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
            </td></tr>
            <!-- Footer -->
            <tr><td style="background:#F8F4FF;padding:20px 40px;border-top:1px solid rgba(160,41,74,0.1);text-align:center;">
              <p style="font-size:11px;color:#9580AA;margin:0;">MaatriSahayak &bull; National Health Mission &bull; Government of India</p>
              <p style="font-size:11px;color:#C0B0D0;margin:4px 0 0;">Do not reply to this email</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """

    ses_client.send_email(
        Source=SES_SENDER,
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': 'MaatriSahayak – Your Password Reset Code', 'Charset': 'UTF-8'},
            'Body': {
                'Text': {'Data': f'Your MaatriSahayak password reset code is: {code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, ignore this email.', 'Charset': 'UTF-8'},
                'Html': {'Data': html, 'Charset': 'UTF-8'},
            }
        }
    )
