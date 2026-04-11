"""
MaatriSahayak - Send Welcome Email Lambda
POST /officer/welcome-email
Called by frontend after officer Cognito signup succeeds.
"""

import os
import json
import urllib.request
import urllib.error
import boto3
from shared import (
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields,
)
from shared.constants import HTTP_STATUS

dynamodb = boto3.resource('dynamodb')
SENDER = os.environ.get('SES_SENDER_EMAIL', 'noreply@maatrisahayak.in')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
EMAIL_SUPPRESSION_TABLE = os.environ.get('EMAIL_SUPPRESSION_TABLE', 'EmailSuppressionList')


def is_suppressed(email: str) -> bool:
    try:
        table = dynamodb.Table(EMAIL_SUPPRESSION_TABLE)
        resp = table.get_item(Key={'email': email.lower()})
        return 'Item' in resp
    except Exception:
        # If suppression table is unavailable, allow sending
        return False


def lambda_handler(event, context):
    try:
        body = parse_event_body(event)
        validate_required_fields(body, ['name', 'email', 'district', 'designation', 'employee_id'])

        if is_suppressed(body['email']):
            log_info("Email suppressed, skipping", email=body['email'])
            return create_success_response({}, "Email skipped (suppressed)")

        send_officer_welcome_email(
            email=body['email'],
            name=body['name'],
            district=body['district'],
            designation=body['designation'],
            employee_id=body['employee_id'],
        )

        log_info("Officer welcome email sent", email=body['email'])
        return create_success_response({}, "Welcome email sent successfully")

    except Exception as e:
        log_error("Failed to send officer welcome email", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'], "InternalServerError",
            "Failed to send welcome email", {'error': str(e)}
        )


def send_officer_welcome_email(email: str, name: str, district: str, designation: str, employee_id: str):
    subject = "Welcome to MatriSahayak – District Officer Account Created"
    html_body = f"""<html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:linear-gradient(135deg,#2D0A4E 0%,#6B2FA0 100%);padding:28px;text-align:center;">
      <p style="color:#ffffff;font-size:22px;font-weight:bold;margin:0;">MatriSahayak</p>
      <p style="color:#F9A8D4;font-size:12px;margin:6px 0 0;letter-spacing:1.5px;text-transform:uppercase;">District Officer Portal</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#333;">Dear <strong>{name}</strong>,</p>
      <p style="color:#555;line-height:1.7;">Welcome to <strong>MatriSahayak</strong>! Your District Officer account has been successfully created. You can now log in to the portal to manage ASHA workers and ambulance drivers in your district.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <tr style="background:#f9f9f9;"><td style="padding:11px 14px;color:#888;width:150px;">Name</td><td style="padding:11px 14px;color:#333;font-weight:600;">{name}</td></tr>
        <tr><td style="padding:11px 14px;color:#888;">Email</td><td style="padding:11px 14px;color:#333;">{email}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:11px 14px;color:#888;">District</td><td style="padding:11px 14px;color:#333;">{district}</td></tr>
        <tr><td style="padding:11px 14px;color:#888;">Designation</td><td style="padding:11px 14px;color:#333;">{designation}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:11px 14px;color:#888;">Employee ID</td><td style="padding:11px 14px;color:#6B2FA0;font-weight:bold;">{employee_id}</td></tr>
        <tr><td style="padding:11px 14px;color:#888;">Role</td><td style="padding:11px 14px;"><span style="background:#ede9fe;color:#5b21b6;padding:3px 10px;border-radius:20px;font-size:13px;">District Officer</span></td></tr>
      </table>
      <div style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="color:#6B2FA0;font-weight:700;margin:0 0 8px;font-size:14px;">⚠️ Next Step</p>
        <p style="color:#555;margin:0;font-size:13px;line-height:1.6;">Please verify your email address by clicking the link sent by AWS Cognito. Once verified, you can log in at the District Officer Portal.</p>
      </div>
      <p style="color:#555;font-size:13px;">Keep your Employee ID and login credentials safe. Do not share them with anyone.</p>
    </div>
    <div style="background:#f4f4f4;padding:16px;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#aaa;font-size:12px;margin:0;">MatriSahayak &bull; National Health Mission &bull; No-Reply</p>
      <p style="color:#aaa;font-size:11px;margin:4px 0 0;">Do not reply to this email</p>
    </div>
  </div>
</body></html>"""

    if not RESEND_API_KEY:
        log_info(f"[EMAIL SKIP] RESEND_API_KEY not set. Would send welcome email to {email}")
        return

    text = f"Welcome {name}!\n\nYour District Officer account has been created.\nDistrict: {district}\nDesignation: {designation}\nEmployee ID: {employee_id}\n\nPlease verify your email to log in.\n\nMatriSahayak"

    try:
        payload = json.dumps({
            'from': f'MaatriSahayak <{SENDER}>',
            'to': [email],
            'subject': subject,
            'html': html_body,
            'text': text,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://api.resend.com/emails',
            data=payload,
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json',
                'User-Agent': 'curl/7.68.0',
            },
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            log_info(f"[EMAIL OK] Welcome email sent to {email} | status={resp.status}")
    except urllib.error.HTTPError as e:
        log_error(f"[EMAIL ERROR] HTTP {e.code}: {e.read().decode()} | to={email}", Exception(e))
    except Exception as e:
        log_error(f"[EMAIL ERROR] {str(e)} | to={email}", e)
