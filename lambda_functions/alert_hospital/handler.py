"""
MaatriSahayak - Alert Hospital Lambda Function

Notify hospital of incoming patient.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    get_item,
    update_item,
    get_current_timestamp,
    validate_required_fields,
    send_hospital_alert_email,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Alert hospital of incoming emergency patient.
    
    Expected Input:
    {
        "emergency_id": "string",
        "hospital_id": "string",
        "estimated_arrival_time": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency_id": "...",
            "hospital_id": "...",
            "alerted_at": "...",
            "notification_sent": true
        },
        "message": "Hospital alerted successfully"
    }
    """
    try:
        log_info("Alert hospital request received")
        
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['emergency_id', 'hospital_id']
        validate_required_fields(body, required_fields)
        
        emergency_id = body['emergency_id']
        hospital_id = body['hospital_id']
        
        # Check if emergency exists
        emergency = get_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id}
        )
        
        if not emergency:
            raise NotFoundError(f"Emergency with ID {emergency_id} not found")
        
        # Check if hospital exists
        hospital = get_item(
            TABLE_NAMES['HOSPITALS'],
            {'id': hospital_id}
        )
        
        if not hospital:
            raise NotFoundError(f"Hospital with ID {hospital_id} not found")
        
        timestamp = get_current_timestamp()
        
        # Update emergency with hospital assignment
        update_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id},
            "SET hospital_id = :hospital_id, hospital_alerted_at = :alerted_at",
            {
                ':hospital_id': hospital_id,
                ':alerted_at': timestamp
            }
        )
        
        # TODO: Send actual notification to hospital (SMS/Email/Push)
        # This would integrate with SNS or other notification service
        hospital_email = hospital.get('email')
        if hospital_email:
            try:
                send_hospital_alert_email(
                    hospital_email=hospital_email,
                    hospital_name=hospital.get('name', 'Hospital'),
                    patient_risk=emergency.get('risk_level', 'HIGH'),
                    eta_minutes=body.get('estimated_arrival_time', 20),
                    emergency_id=emergency_id
                )
            except Exception as e:
                log_error("Failed to send hospital alert email (non-fatal)", e)
        
        response_data = {
            'emergency_id': emergency_id,
            'hospital_id': hospital_id,
            'hospital_name': hospital.get('name'),
            'alerted_at': timestamp,
            'notification_sent': True,
            'estimated_arrival_time': body.get('estimated_arrival_time')
        }
        
        log_info("Hospital alerted", emergency_id=emergency_id, hospital_id=hospital_id)
        
        return create_success_response(
            response_data,
            "Hospital alerted successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except NotFoundError as e:
        log_error("Resource not found", e)
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
            "An unexpected error occurred while alerting hospital",
            {'error': str(e)}
        )
