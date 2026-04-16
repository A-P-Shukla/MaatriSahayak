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
    send_asha_approved_email,
    send_driver_approved_email,
)
from shared.db_helper import update_item
from shared.constants import TABLE_NAMES, HTTP_STATUS
from shared.auth_helper import get_user_from_event

cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
APP_URL = os.environ.get('APP_URL', 'https://maatrisahayak.in')


def lambda_handler(event, context):
    try:
        body = parse_event_body(event)
        validate_required_fields(body, ['id', 'type', 'action'])

        reg_id   = body['id']
        reg_type = body['type'].upper()   # DRIVER | ASHA
        action   = body['action'].upper() # APPROVE | REJECT
        reason   = body.get('reason', '')
        
        # Get officer info from JWT token
        officer_info = {}
        try:
            user = get_user_from_event(event)
            officer_info = {
                'approved_by_id': user.get('user_id'),
                'approved_by_name': user.get('name'),
                'approved_by_email': user.get('email'),
                'approved_by_district': user.get('district'),
            }
        except Exception as e:
            log_error("Could not extract officer info (non-fatal)", e)

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

            # Update with officer info
            update_data = {
                'verificationStatus': 'APPROVED',
                'verifiedAt': timestamp,
                'rejectionReason': '',
                **officer_info  # Add officer details
            }
            update_item(table_name, {'id': reg_id}, update_data)
            message = f"{reg_type} approved successfully"

            if email:
                try:
                    if reg_type == 'ASHA':
                        send_asha_approved_email(name=record.get('name', ''), email=email)
                    else:
                        send_driver_approved_email(name=record.get('name', ''), email=email)
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

            update_data = {
                'verificationStatus': 'REJECTED',
                'verifiedAt': timestamp,
                'rejectionReason': reason,
                **officer_info  # Add officer details
            }
            update_item(table_name, {'id': reg_id}, update_data)
            message = f"{reg_type} rejected"

            if email:
                try:
                    send_rejection_email(email, record.get('name', ''), reg_id, reg_type, reason)
                except Exception as e:
                    log_error("Failed to send rejection email (non-fatal)", e)

        log_info(message, id=reg_id, type=reg_type, action=action, officer=officer_info.get('approved_by_name'))
        return create_success_response({'id': reg_id, 'status': action}, message)

    except ValidationError as e:
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)
    except Exception as e:
        log_error("Unexpected error in verify_registration", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'], "InternalServerError",
            "An unexpected error occurred", {'error': str(e)}
        )


def send_rejection_email(email: str, name: str, reg_id: str, reg_type: str, reason: str):
    from shared.email_service import _send, APP_URL
    role_label = 'ASHA Worker' if reg_type == 'ASHA' else 'Ambulance Driver'
    reason_html = f"<p style='color:#555;'><strong>Reason:</strong> {reason}</p>" if reason else ""
    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
      <div style="max-width:540px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;">
        <div style="background:#c0392b;padding:24px;text-align:center;">
          <p style="color:#fff;font-size:20px;font-weight:bold;margin:0;">MaatriSahayak</p>
          <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:4px 0 0;">National Health Mission</p>
        </div>
        <div style="padding:28px;">
          <p style="font-size:16px;color:#333;">Dear <strong>{name}</strong>,</p>
          <p style="color:#555;">Your <strong>{role_label}</strong> registration has been reviewed.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
            <tr style="background:#f9f9f9;"><td style="padding:10px;color:#888;width:140px;">Registration ID</td><td style="padding:10px;color:#333;font-weight:bold;">{reg_id}</td></tr>
            <tr><td style="padding:10px;color:#888;">Status</td><td style="padding:10px;"><span style="background:#f8d7da;color:#721c24;padding:3px 10px;border-radius:20px;font-size:12px;">❌ Not Approved</span></td></tr>
          </table>
          {reason_html}
          <p style="color:#555;font-size:13px;">If you believe this is an error, please contact your District Officer or reach us at <a href="mailto:support@maatrisahayak.in" style="color:#c0392b;">support@maatrisahayak.in</a>.</p>
        </div>
        <div style="background:#f4f4f4;padding:14px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="color:#aaa;font-size:11px;margin:0;">MaatriSahayak · National Health Mission · India</p>
        </div>
      </div>
    </body></html>"""
    _send(email, f"MaatriSahayak – Registration Update for {name}", html,
          f"Dear {name}, your {role_label} registration ({reg_id}) was not approved. {reason}")
    log_info("Rejection email sent", email=email, reg_id=reg_id)
