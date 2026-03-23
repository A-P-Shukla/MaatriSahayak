"""
MaatriSahayak - Verify Registration Lambda

Officer approves or rejects pending ASHA / Driver registrations.
POST /admin/verify
{
    "id": "drv_xxx" | "asha_xxx",
    "type": "DRIVER" | "ASHA",
    "action": "APPROVE" | "REJECT",
    "reason": "optional rejection reason"
}
"""

import os
import boto3
from shared import (
    ValidationError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    get_item,
    validate_required_fields,
    get_current_timestamp,
)
from shared.db_helper import update_item
from shared.constants import TABLE_NAMES, HTTP_STATUS

cognito_client = boto3.client('cognito-idp')
ses_client = boto3.client('ses', region_name='ap-south-1')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'noreply.maatrisahayak@gmail.com')


def lambda_handler(event, context):
    try:
        body = parse_event_body(event)
        validate_required_fields(body, ['id', 'type', 'action'])

        reg_id   = body['id']
        reg_type = body['type'].upper()   # DRIVER | ASHA
        action   = body['action'].upper() # APPROVE | REJECT
        reason   = body.get('reason', '')

        if reg_type not in ('DRIVER', 'ASHA'):
            raise ValidationError("type must be DRIVER or ASHA", field='type')
        if action not in ('APPROVE', 'REJECT'):
            raise ValidationError("action must be APPROVE or REJECT", field='action')

        table_name = TABLE_NAMES['DRIVERS'] if reg_type == 'DRIVER' else TABLE_NAMES['ASHA_WORKERS']
        record = get_item(table_name, {'id': reg_id})

        if not record:
            raise ValidationError(f"{reg_type} with id {reg_id} not found", field='id')

        email = record.get('email')
        timestamp = get_current_timestamp()

        if action == 'APPROVE':
            # Enable Cognito user
            if email:
                try:
                    cognito_client.admin_enable_user(
                        UserPoolId=USER_POOL_ID,
                        Username=email
                    )
                except Exception as e:
                    log_error("Failed to enable Cognito user (non-fatal)", e)

            update_item(table_name, {'id': reg_id}, {
                'verificationStatus': 'APPROVED',
                'verifiedAt': timestamp,
                'rejectionReason': '',
            })
            message = f"{reg_type} approved successfully"

            if email:
                try:
                    send_decision_email(email, record.get('name', ''), reg_id, reg_type, 'APPROVED', '')
                except Exception as e:
                    log_error("Failed to send approval email (non-fatal)", e)

        else:  # REJECT
            # Disable / delete Cognito user
            if email:
                try:
                    cognito_client.admin_disable_user(
                        UserPoolId=USER_POOL_ID,
                        Username=email
                    )
                except Exception as e:
                    log_error("Failed to disable Cognito user (non-fatal)", e)

            update_item(table_name, {'id': reg_id}, {
                'verificationStatus': 'REJECTED',
                'verifiedAt': timestamp,
                'rejectionReason': reason,
            })
            message = f"{reg_type} rejected"

            if email:
                try:
                    send_decision_email(email, record.get('name', ''), reg_id, reg_type, 'REJECTED', reason)
                except Exception as e:
                    log_error("Failed to send rejection email (non-fatal)", e)

        log_info(message, id=reg_id, type=reg_type, action=action)
        return create_success_response({'id': reg_id, 'status': action}, message)

    except ValidationError as e:
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)
    except Exception as e:
        log_error("Unexpected error in verify_registration", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'], "InternalServerError",
            "An unexpected error occurred", {'error': str(e)}
        )


def send_decision_email(email: str, name: str, reg_id: str, reg_type: str, action: str, reason: str):
    role_label = 'ASHA Worker' if reg_type == 'ASHA' else 'Ambulance Driver'
    if action == 'APPROVED':
        subject = "MatriSahayak – Registration Approved ✓"
        status_html = "<span style='background:#d4edda;color:#155724;padding:3px 10px;border-radius:20px;font-size:13px;'>✅ Approved</span>"
        body_text = f"Congratulations {name}, your {role_label} registration has been approved. You can now log in to the MatriSahayak app."
        extra_html = "<p style='color:#555;'>You can now log in to the MatriSahayak mobile app using your registered email and password.</p>"
    else:
        subject = "MatriSahayak – Registration Update"
        status_html = "<span style='background:#f8d7da;color:#721c24;padding:3px 10px;border-radius:20px;font-size:13px;'>❌ Rejected</span>"
        reason_line = f"<p style='color:#555;'><strong>Reason:</strong> {reason}</p>" if reason else ""
        body_text = f"Dear {name}, your {role_label} registration has been rejected. {reason}"
        extra_html = reason_line + "<p style='color:#555;'>If you believe this is an error, please contact your District Officer.</p>"

    html_body = f"""<html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#1a6b4a;padding:24px;text-align:center;">
      <p style="color:#ffffff;font-size:20px;font-weight:bold;margin:0;">MatriSahayak</p>
      <p style="color:#a8d5be;font-size:12px;margin:4px 0 0;">National Health Mission</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:16px;color:#333;">Dear <strong>{name}</strong>,</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;width:140px;">Registration ID</td><td style="padding:10px;color:#1a6b4a;font-weight:bold;">{reg_id}</td></tr>
        <tr><td style="padding:10px;color:#888;">Role</td><td style="padding:10px;color:#333;">{role_label}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;">Status</td><td style="padding:10px;">{status_html}</td></tr>
      </table>
      {extra_html}
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
                'Text': {'Data': body_text, 'Charset': 'UTF-8'},
                'Html': {'Data': html_body, 'Charset': 'UTF-8'},
            }
        }
    )
    log_info("Decision email sent", email=email, action=action, reg_id=reg_id)
