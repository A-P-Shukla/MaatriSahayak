"""
MaatriSahayak - Email Service

Shared email utility using Resend (free tier: 3000 emails/month).
All transactional emails are defined here to avoid duplication.
"""

import os
import json
import urllib.request
import urllib.error
import boto3

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER = os.environ.get('SES_SENDER_EMAIL', 'noreply@maatrisahayak.in')
APP_URL = os.environ.get('APP_URL', 'https://maatrisahayak.in')
EMAIL_SUPPRESSION_TABLE = os.environ.get('EMAIL_SUPPRESSION_TABLE', 'EmailSuppressionList')

# Brand colors
GREEN = '#1a6b4a'
BLUE = '#1a3a6b'
RED = '#c0392b'
ORANGE = '#e67e22'

# Initialize DynamoDB resource for email suppression
dynamodb = boto3.resource('dynamodb')


def is_email_suppressed(email: str) -> bool:
    """
    Check if an email address is in the suppression list.
    Returns True if suppressed, False otherwise.
    """
    try:
        table = dynamodb.Table(EMAIL_SUPPRESSION_TABLE)
        resp = table.get_item(Key={'email': email.lower()})
        return 'Item' in resp
    except Exception as e:
        # If suppression table is unavailable, allow sending (fail open)
        print(f"[EMAIL SUPPRESSION CHECK FAILED] {str(e)} | Allowing email to {email}")
        return False


def _send(to_email: str, subject: str, html_body: str, text_body: str = '') -> bool:
    """Send email via Resend API. Returns True on success, False on failure (non-fatal)."""
    # Check email suppression list first
    if is_email_suppressed(to_email):
        print(f"[EMAIL SUPPRESSED] Email address {to_email} is in suppression list. Skipping '{subject}'")
        return False
    
    if not RESEND_API_KEY:
        print(f"[EMAIL SKIP] RESEND_API_KEY not set. Would send '{subject}' to {to_email}")
        return False
    try:
        payload = json.dumps({
            'from': f'MaatriSahayak <{SENDER}>',
            'to': [to_email],
            'subject': subject,
            'html': html_body,
            'text': text_body or subject,
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
            print(f"[EMAIL OK] '{subject}' sent to {to_email} | status={resp.status}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[EMAIL ERROR] HTTP {e.code}: {e.read().decode()} | to={to_email}")
        return False
    except Exception as e:
        print(f"[EMAIL ERROR] {str(e)} | to={to_email}")
        return False


def _header(color: str, subtitle: str = 'National Health Mission · Maternal Care') -> str:
    return f"""
    <div style="background:{color};padding:28px;text-align:center;">
      <p style="color:#fff;font-size:22px;font-weight:bold;margin:0;">MaatriSahayak</p>
      <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:4px 0 0;">{subtitle}</p>
    </div>"""


def _footer() -> str:
    return """
    <div style="background:#f4f4f4;padding:14px;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#aaa;font-size:11px;margin:0;">
        MaatriSahayak · National Health Mission · India<br/>
        <a href="mailto:support@maatrisahayak.in" style="color:#aaa;">support@maatrisahayak.in</a>
      </p>
    </div>"""


def _wrap(header: str, body: str) -> str:
    return f"""
    <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;margin:0;">
      <div style="max-width:540px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;">
        {header}
        <div style="padding:28px;">{body}</div>
        {_footer()}
      </div>
    </body></html>"""


# ─────────────────────────────────────────────
# ASHA Worker Emails
# ─────────────────────────────────────────────

def send_asha_registration_email(name: str, email: str, asha_id: str, district: str) -> bool:
    """
    Sent immediately after a new ASHA worker registers.
    Confirms receipt and explains the pending approval flow.
    """
    subject = "MaatriSahayak – Registration Received, Pending Approval"
    body = f"""
      <p style="font-size:18px;color:{GREEN};font-weight:bold;margin:0 0 8px;">Welcome, {name}!</p>
      <p style="color:#555;line-height:1.6;">
        Thank you for registering as an <strong>ASHA Worker</strong> on MaatriSahayak.
        Your application has been received and is currently <strong>under review</strong> by your District Officer.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;width:150px;">Registration ID</td>
          <td style="padding:10px;color:{GREEN};font-weight:bold;">{asha_id}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Role</td>
          <td style="padding:10px;color:#333;">ASHA Worker</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;">District</td>
          <td style="padding:10px;color:#333;">{district}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Login Email</td>
          <td style="padding:10px;color:#333;">{email}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;">Status</td>
          <td style="padding:10px;">
            <span style="background:#fff3cd;color:#856404;padding:3px 12px;border-radius:20px;font-size:12px;">⏳ Pending Approval</span>
          </td>
        </tr>
      </table>
      <div style="background:#f0faf5;border-left:4px solid {GREEN};padding:14px;border-radius:6px;margin:16px 0;">
        <strong style="color:{GREEN};">What happens next?</strong><br/>
        <span style="color:#555;font-size:13px;">A District Officer will review your application within <strong>24–48 hours</strong>.
        You will receive another email once a decision is made. Your account will be activated upon approval.</span>
      </div>
      <p style="color:#888;font-size:12px;">
        If you did not register, contact us at
        <a href="mailto:support@maatrisahayak.in" style="color:{GREEN};">support@maatrisahayak.in</a> immediately.
      </p>"""
    html = _wrap(_header(GREEN), body)
    text = f"Welcome {name}!\n\nYour ASHA Worker registration ({asha_id}) in {district} has been received and is pending approval.\n\nYou will be notified by email once approved.\n\nMaatriSahayak"
    return _send(email, subject, html, text)


def send_asha_approved_email(name: str, email: str) -> bool:
    """Sent when a District Officer approves the ASHA worker account."""
    subject = "MaatriSahayak – Your Account Has Been Approved!"
    body = f"""
      <p style="font-size:18px;color:{GREEN};font-weight:bold;margin:0 0 8px;">Great news, {name}!</p>
      <p style="color:#555;line-height:1.6;">
        Your <strong>ASHA Worker</strong> account on MaatriSahayak has been <strong>approved</strong> by your District Officer.
        You can now log in and start managing pregnancies and emergency alerts in your area.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{APP_URL}/login"
           style="background:{GREEN};color:#fff;padding:13px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
          Login to MaatriSahayak
        </a>
      </div>
      <p style="color:#555;font-size:13px;line-height:1.6;">
        <strong>Getting started:</strong><br/>
        · Register pregnancies in your area<br/>
        · Record vital signs during ANC visits<br/>
        · Trigger emergency alerts when needed
      </p>
      <p style="color:#888;font-size:12px;margin-top:20px;">
        Need help? Contact <a href="mailto:support@maatrisahayak.in" style="color:{GREEN};">support@maatrisahayak.in</a>
      </p>"""
    html = _wrap(_header(GREEN), body)
    text = f"Congratulations {name}! Your ASHA Worker account has been approved. Login at {APP_URL}/login\n\nMaatriSahayak"
    return _send(email, subject, html, text)


# ─────────────────────────────────────────────
# Driver Emails
# ─────────────────────────────────────────────

def send_driver_registration_email(name: str, email: str, driver_id: str, district: str = 'N/A') -> bool:
    """
    Sent immediately after a new driver registers.
    Confirms receipt and explains the pending approval flow.
    """
    subject = "MaatriSahayak – Driver Registration Received, Pending Approval"
    body = f"""
      <p style="font-size:18px;color:{BLUE};font-weight:bold;margin:0 0 8px;">Welcome, {name}!</p>
      <p style="color:#555;line-height:1.6;">
        Thank you for registering as an <strong>Ambulance Driver</strong> on MaatriSahayak.
        Your application has been received and is currently <strong>under review</strong> by your District Officer.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;width:150px;">Driver ID</td>
          <td style="padding:10px;color:{BLUE};font-weight:bold;">{driver_id}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Role</td>
          <td style="padding:10px;color:#333;">Ambulance Driver</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;">District</td>
          <td style="padding:10px;color:#333;">{district}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Login Email</td>
          <td style="padding:10px;color:#333;">{email}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;">Status</td>
          <td style="padding:10px;">
            <span style="background:#fff3cd;color:#856404;padding:3px 12px;border-radius:20px;font-size:12px;">⏳ Pending Approval</span>
          </td>
        </tr>
      </table>
      <div style="background:#f0f4fa;border-left:4px solid {BLUE};padding:14px;border-radius:6px;margin:16px 0;">
        <strong style="color:{BLUE};">What happens next?</strong><br/>
        <span style="color:#555;font-size:13px;">A District Officer will verify your license and details within <strong>24–48 hours</strong>.
        You will receive another email once your account is activated.</span>
      </div>
      <p style="color:#888;font-size:12px;">
        If you did not register, contact us at
        <a href="mailto:support@maatrisahayak.in" style="color:{BLUE};">support@maatrisahayak.in</a> immediately.
      </p>"""
    html = _wrap(_header(BLUE, 'National Health Mission · Emergency Response'), body)
    text = f"Welcome {name}!\n\nYour Ambulance Driver registration ({driver_id}) has been received and is pending approval.\n\nYou will be notified by email once approved.\n\nMaatriSahayak"
    return _send(email, subject, html, text)


def send_driver_first_login_email(name: str, email: str, driver_id: str) -> bool:
    """
    Sent on the driver's very first successful login.
    Provides portal overview and key responsibilities.
    """
    subject = "MaatriSahayak – Welcome to the Driver Portal"
    body = f"""
      <p style="font-size:18px;color:{BLUE};font-weight:bold;margin:0 0 8px;">You're in, {name}!</p>
      <p style="color:#555;line-height:1.6;">
        You have successfully logged into the <strong>MaatriSahayak Driver Portal</strong> for the first time.
        You are now part of the emergency response network saving maternal lives across rural India.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;width:150px;">Driver ID</td>
          <td style="padding:10px;color:{BLUE};font-weight:bold;">{driver_id}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Portal URL</td>
          <td style="padding:10px;"><a href="{APP_URL}" style="color:{BLUE};">{APP_URL}</a></td>
        </tr>
      </table>
      <div style="background:#f0f4fa;border-left:4px solid {BLUE};padding:14px;border-radius:6px;margin:16px 0;">
        <strong style="color:{BLUE};">Key Responsibilities</strong><br/>
        <ul style="color:#555;font-size:13px;margin:8px 0 0;padding-left:18px;line-height:1.8;">
          <li>Keep your <strong>availability status</strong> updated at all times</li>
          <li>Respond to emergency dispatch alerts <strong>within 2 minutes</strong></li>
          <li>Update your <strong>GPS location</strong> regularly during active emergencies</li>
          <li>Mark trips as complete after patient handover at hospital</li>
        </ul>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{APP_URL}/login"
           style="background:{BLUE};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
          Go to Driver Portal
        </a>
      </div>
      <p style="color:#888;font-size:12px;">
        Need help? Contact <a href="mailto:support@maatrisahayak.in" style="color:{BLUE};">support@maatrisahayak.in</a>
      </p>"""
    html = _wrap(_header(BLUE, 'National Health Mission · Emergency Response'), body)
    text = f"Welcome {name}!\n\nYou have successfully logged into MaatriSahayak Driver Portal for the first time.\nDriver ID: {driver_id}\nPortal: {APP_URL}\n\nMaatriSahayak"
    return _send(email, subject, html, text)


def send_driver_approved_email(name: str, email: str) -> bool:
    """Sent when a District Officer approves the driver account."""
    subject = "MaatriSahayak – Your Driver Account Has Been Approved!"
    body = f"""
      <p style="font-size:18px;color:{BLUE};font-weight:bold;margin:0 0 8px;">Approved, {name}!</p>
      <p style="color:#555;line-height:1.6;">
        Your <strong>Ambulance Driver</strong> account on MaatriSahayak has been <strong>approved</strong>.
        You can now log in to the driver portal and start accepting emergency dispatch requests.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{APP_URL}/login"
           style="background:{BLUE};color:#fff;padding:13px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
          Login to Driver Portal
        </a>
      </div>
      <p style="color:#888;font-size:12px;margin-top:20px;">
        Need help? Contact <a href="mailto:support@maatrisahayak.in" style="color:{BLUE};">support@maatrisahayak.in</a>
      </p>"""
    html = _wrap(_header(BLUE, 'National Health Mission · Emergency Response'), body)
    text = f"Congratulations {name}! Your Driver account has been approved. Login at {APP_URL}/login\n\nMaatriSahayak"
    return _send(email, subject, html, text)


# ─────────────────────────────────────────────
# Emergency Emails
# ─────────────────────────────────────────────

def send_ambulance_dispatched_email(
    asha_name: str, asha_email: str,
    driver_name: str, vehicle_number: str, eta_minutes: int
) -> bool:
    """Sent to the ASHA worker who triggered the emergency when ambulance is dispatched."""
    subject = "MaatriSahayak – Ambulance Dispatched"
    body = f"""
      <p style="font-size:18px;color:{ORANGE};font-weight:bold;margin:0 0 8px;">Ambulance On The Way</p>
      <p style="color:#555;line-height:1.6;">
        Dear <strong>{asha_name}</strong>, an ambulance has been dispatched for the emergency you reported.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;width:150px;">Driver</td>
          <td style="padding:10px;color:#333;font-weight:bold;">{driver_name}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Vehicle No.</td>
          <td style="padding:10px;color:#333;">{vehicle_number}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;">ETA</td>
          <td style="padding:10px;color:{ORANGE};font-weight:bold;">~{eta_minutes} minutes</td>
        </tr>
      </table>
      <div style="background:#fff8f0;border-left:4px solid {ORANGE};padding:14px;border-radius:6px;">
        <strong style="color:{ORANGE};">Please ensure:</strong>
        <ul style="color:#555;font-size:13px;margin:8px 0 0;padding-left:18px;line-height:1.8;">
          <li>Patient is ready for transport</li>
          <li>Stay at the pickup location</li>
          <li>Keep the patient calm</li>
        </ul>
      </div>"""
    html = _wrap(_header(ORANGE, 'Emergency Response · MaatriSahayak'), body)
    text = f"Ambulance dispatched for your emergency.\nDriver: {driver_name} | Vehicle: {vehicle_number} | ETA: ~{eta_minutes} mins\n\nMaatriSahayak"
    return _send(asha_email, subject, html, text)


def send_hospital_alert_email(
    hospital_email: str, hospital_name: str,
    patient_risk: str, eta_minutes: int, emergency_id: str
) -> bool:
    """Sent to hospital when an emergency patient is en route."""
    color = RED if patient_risk == 'HIGH' else ORANGE
    subject = f"[URGENT] Incoming Emergency Patient – MaatriSahayak"
    body = f"""
      <p style="font-size:18px;color:{color};font-weight:bold;margin:0 0 8px;">Incoming Emergency Patient</p>
      <p style="color:#555;line-height:1.6;">
        Dear <strong>{hospital_name}</strong>, please prepare for an incoming maternal emergency patient.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;width:150px;">Emergency ID</td>
          <td style="padding:10px;color:#333;font-weight:bold;">{emergency_id}</td>
        </tr>
        <tr>
          <td style="padding:10px;color:#888;">Risk Level</td>
          <td style="padding:10px;color:{color};font-weight:bold;">{patient_risk}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px;color:#888;">ETA</td>
          <td style="padding:10px;color:{color};font-weight:bold;">~{eta_minutes} minutes</td>
        </tr>
      </table>
      <div style="background:#fff0f0;border-left:4px solid {color};padding:14px;border-radius:6px;">
        <strong style="color:{color};">Action Required:</strong>
        <ul style="color:#555;font-size:13px;margin:8px 0 0;padding-left:18px;line-height:1.8;">
          <li>Ensure maternity ward is on standby</li>
          <li>Alert the emergency medical team</li>
          <li>Prepare for immediate admission</li>
        </ul>
      </div>"""
    html = _wrap(_header(color, 'Emergency Alert · MaatriSahayak'), body)
    text = f"URGENT: Incoming maternal emergency patient.\nEmergency ID: {emergency_id} | Risk: {patient_risk} | ETA: ~{eta_minutes} mins\n\nMaatriSahayak"
    return _send(hospital_email, subject, html, text)
