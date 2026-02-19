"""
MaatriSahayak - Send Notifications Lambda Function

Sends SMS/WhatsApp notifications to stakeholders.
"""

import json
import os
import boto3
from shared import (
    ValidationError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields,
    validate_phone_number
)
from shared.constants import HTTP_STATUS
from shared.models import NotificationModel

# Initialize AWS SNS client
sns_client = boto3.client('sns')


def lambda_handler(event, context):
    """
    Send notifications to stakeholders.
    
    Expected Input:
    {
        "notification_type": "string" (EMERGENCY_ALERT, RISK_UPDATE, etc.),
        "recipients": [
            {
                "phone": "string",
                "name": "string" (optional)
            }
        ],
        "message": "string",
        "priority": "string" (LOW, NORMAL, HIGH, CRITICAL),
        "data": {} (optional metadata)
    }
    
    OR for emergency alerts:
    {
        "notification_type": "EMERGENCY_ALERT",
        "data": {
            "emergency_id": "...",
            "patient_name": "...",
            "patient_phone": "...",
            "asha_worker_phone": "...",
            ...
        }
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "sent_count": 3,
            "failed_count": 0,
            "results": [...]
        }
    }
    """
    try:
        log_info("Send notifications request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        notification_type = body.get('notification_type', 'GENERAL')
        
        # Handle different notification types
        if notification_type == 'EMERGENCY_ALERT':
            return handle_emergency_alert(body.get('data', {}))
        elif notification_type == 'RISK_UPDATE':
            return handle_risk_update(body.get('data', {}))
        else:
            return handle_general_notification(body)
    
    except ValidationError as e:
        log_error("Validation error", e)
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
            "An unexpected error occurred while sending notifications",
            {'error': str(e)}
        )


def handle_emergency_alert(data: dict) -> dict:
    """Handle emergency alert notifications."""
    try:
        results = []
        sent_count = 0
        failed_count = 0
        
        # Prepare emergency message
        message = f"""🚨 EMERGENCY ALERT - MaatriSahayak

Patient: {data.get('patient_name', 'Unknown')}
Emergency Type: {data.get('event_type', 'Unknown')}
Severity: {data.get('severity', 'Unknown')}
Location: {data.get('location', 'Unknown')}

"""
        
        if data.get('ambulance_number'):
            message += f"Ambulance: {data['ambulance_number']}\n"
        
        if data.get('hospital_name'):
            message += f"Hospital: {data['hospital_name']}\n"
        
        message += f"\nEmergency ID: {data.get('emergency_id', 'N/A')}"
        
        # Send to patient
        if data.get('patient_phone'):
            result = send_sms(data['patient_phone'], message, 'CRITICAL')
            results.append(result)
            if result['success']:
                sent_count += 1
            else:
                failed_count += 1
        
        # Send to ASHA worker
        if data.get('asha_worker_phone'):
            result = send_sms(data['asha_worker_phone'], message, 'CRITICAL')
            results.append(result)
            if result['success']:
                sent_count += 1
            else:
                failed_count += 1
        
        log_info(
            "Emergency alerts sent",
            sent_count=sent_count,
            failed_count=failed_count
        )
        
        return create_success_response(
            {
                'sent_count': sent_count,
                'failed_count': failed_count,
                'results': results
            },
            f"Emergency alerts sent: {sent_count} successful, {failed_count} failed"
        )
    
    except Exception as e:
        log_error("Error sending emergency alerts", e)
        raise


def handle_risk_update(data: dict) -> dict:
    """Handle risk update notifications."""
    try:
        results = []
        sent_count = 0
        failed_count = 0
        
        # Prepare risk update message
        message = f"""⚠️ RISK UPDATE - MaatriSahayak

Patient: {data.get('patient_name', 'Unknown')}
Risk Level: {data.get('risk_level', 'Unknown')}
Risk Score: {data.get('risk_score', 'N/A')}

Risk Factors:
"""
        
        for factor in data.get('risk_factors', []):
            message += f"• {factor}\n"
        
        message += "\nRecommendations:\n"
        for rec in data.get('recommendations', []):
            message += f"• {rec}\n"
        
        # Send to ASHA worker
        if data.get('asha_worker_phone'):
            result = send_sms(data['asha_worker_phone'], message, 'HIGH')
            results.append(result)
            if result['success']:
                sent_count += 1
            else:
                failed_count += 1
        
        log_info(
            "Risk update notifications sent",
            sent_count=sent_count,
            failed_count=failed_count
        )
        
        return create_success_response(
            {
                'sent_count': sent_count,
                'failed_count': failed_count,
                'results': results
            },
            f"Risk updates sent: {sent_count} successful, {failed_count} failed"
        )
    
    except Exception as e:
        log_error("Error sending risk updates", e)
        raise


def handle_general_notification(body: dict) -> dict:
    """Handle general notifications."""
    try:
        validate_required_fields(body, ['recipients', 'message'])
        
        recipients = body['recipients']
        message = body['message']
        priority = body.get('priority', 'NORMAL')
        
        results = []
        sent_count = 0
        failed_count = 0
        
        for recipient in recipients:
            phone = recipient.get('phone')
            if not phone:
                continue
            
            # Personalize message if name provided
            personalized_message = message
            if recipient.get('name'):
                personalized_message = f"Dear {recipient['name']},\n\n{message}"
            
            result = send_sms(phone, personalized_message, priority)
            results.append(result)
            
            if result['success']:
                sent_count += 1
            else:
                failed_count += 1
        
        log_info(
            "General notifications sent",
            sent_count=sent_count,
            failed_count=failed_count
        )
        
        return create_success_response(
            {
                'sent_count': sent_count,
                'failed_count': failed_count,
                'results': results
            },
            f"Notifications sent: {sent_count} successful, {failed_count} failed"
        )
    
    except Exception as e:
        log_error("Error sending general notifications", e)
        raise


def send_sms(phone: str, message: str, priority: str = 'NORMAL') -> dict:
    """
    Send SMS using AWS SNS.
    
    Args:
        phone: Phone number
        message: Message text
        priority: Message priority
    
    Returns:
        Result dictionary
    """
    try:
        # Validate phone number
        validate_phone_number(phone)
        
        # Format phone number for SNS (must start with +)
        if not phone.startswith('+'):
            if phone.startswith('91'):
                phone = '+' + phone
            else:
                phone = '+91' + phone
        
        # Send SMS via SNS
        response = sns_client.publish(
            PhoneNumber=phone,
            Message=message,
            MessageAttributes={
                'AWS.SNS.SMS.SMSType': {
                    'DataType': 'String',
                    'StringValue': 'Transactional' if priority in ['HIGH', 'CRITICAL'] else 'Promotional'
                }
            }
        )
        
        log_info("SMS sent successfully", phone=phone, message_id=response.get('MessageId'))
        
        return {
            'success': True,
            'phone': phone,
            'message_id': response.get('MessageId')
        }
    
    except Exception as e:
        log_error("Failed to send SMS", e, phone=phone)
        return {
            'success': False,
            'phone': phone,
            'error': str(e)
        }
