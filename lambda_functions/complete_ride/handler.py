"""
MaatriSahayak - Complete Ride Lambda Function

Marks emergency as completed when patient reaches hospital.
"""

import json
import boto3
from datetime import datetime
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
    get_current_timestamp
)
from shared.constants import TABLE_NAMES, HTTP_STATUS
from shared.db_helper import update_item


# Initialize SNS client for notifications
sns_client = boto3.client('sns')


def lambda_handler(event, context):
    """
    Complete emergency ride.
    
    Expected Input:
    {
        "emergency_id": "string",
        "driver_id": "string",
        "outcome": "COMPLETED | CANCELLED | REFERRED",
        "notes": "string" (optional),
        "hospital_reached_at": "timestamp" (optional, defaults to now)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency_id": "emerg_xxx",
            "outcome": "COMPLETED",
            "response_time_minutes": 28,
            "distance_km": 12.5,
            "completed_at": "..."
        },
        "message": "Ride completed successfully"
    }
    """
    try:
        log_info("Complete ride request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        if 'emergency_id' not in body or 'driver_id' not in body or 'outcome' not in body:
            raise ValidationError(
                "Missing required fields: emergency_id, driver_id, outcome",
                details={'required_fields': ['emergency_id', 'driver_id', 'outcome']}
            )
        
        emergency_id = body['emergency_id']
        driver_id = body['driver_id']
        outcome = body['outcome']
        notes = body.get('notes', '')
        
        # Validate outcome
        valid_outcomes = ['COMPLETED', 'CANCELLED', 'REFERRED']
        if outcome not in valid_outcomes:
            raise ValidationError(
                f"Invalid outcome. Must be one of: {', '.join(valid_outcomes)}",
                field='outcome'
            )
        
        # Get emergency details
        emergency = get_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id}
        )
        
        if not emergency:
            raise NotFoundError(f"Emergency with ID {emergency_id} not found")
        
        # Get driver details
        driver = get_item(
            TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev'),
            {'id': driver_id}
        )
        
        if not driver:
            raise NotFoundError(f"Driver with ID {driver_id} not found")
        
        timestamp = get_current_timestamp()
        hospital_reached_at = body.get('hospital_reached_at', timestamp)
        
        # Calculate response time
        triggered_at = emergency.get('triggered_at', timestamp)
        response_time_seconds = calculate_response_time(triggered_at, hospital_reached_at)
        response_time_minutes = int(response_time_seconds / 60)
        
        # Update emergency status
        update_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id},
            "SET #status = :status, hospitalReachedAt = :hospital_reached, "
            "completionTime = :completion_time, responseTimeSeconds = :response_time, "
            "outcome = :outcome, completionNotes = :notes, updatedAt = :updated_at",
            {
                ':status': 'COMPLETED',
                ':hospital_reached': hospital_reached_at,
                ':completion_time': timestamp,
                ':response_time': response_time_seconds,
                ':outcome': outcome,
                ':notes': notes,
                ':updated_at': timestamp
            },
            {'#status': 'status'}
        )
        
        # Update driver status back to AVAILABLE
        current_total_rides = int(driver.get('totalRides', 0))
        new_total_rides = current_total_rides + 1
        
        update_item(
            TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev'),
            {'id': driver_id},
            "SET #status = :status, totalRides = :total_rides, updatedAt = :updated_at",
            {
                ':status': 'AVAILABLE',
                ':total_rides': new_total_rides,
                ':updated_at': timestamp
            },
            {'#status': 'status'}
        )
        
        # Update ambulance status back to AVAILABLE
        update_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': driver['ambulanceId']},
            "SET #status = :status, currentEmergencyId = :null_value, "
            "totalEmergenciesHandled = totalEmergenciesHandled + :increment",
            {
                ':status': 'AVAILABLE',
                ':null_value': None,
                ':increment': 1
            },
            {'#status': 'status'}
        )
        
        # Send completion notification to ASHA worker
        try:
            send_completion_notification(
                emergency.get('triggered_by'),
                emergency.get('patient_name'),
                outcome,
                response_time_minutes
            )
        except Exception as notif_error:
            log_error("Failed to send notification (non-fatal)", notif_error)
        
        # Prepare response data
        response_data = {
            'emergency_id': emergency_id,
            'outcome': outcome,
            'response_time_minutes': response_time_minutes,
            'response_time_seconds': response_time_seconds,
            'distance_km': emergency.get('distance_km', 0),
            'completed_at': timestamp,
            'driver_total_rides': new_total_rides
        }
        
        log_info(
            "Ride completed successfully",
            emergency_id=emergency_id,
            driver_id=driver_id,
            outcome=outcome,
            response_time_minutes=response_time_minutes
        )
        
        return create_success_response(
            response_data,
            "Ride completed successfully"
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
            "An unexpected error occurred while completing ride",
            {'error': str(e)}
        )


def calculate_response_time(triggered_at: str, completed_at: str) -> int:
    """
    Calculate response time in seconds between trigger and completion.
    
    Args:
        triggered_at: ISO timestamp when emergency was triggered
        completed_at: ISO timestamp when emergency was completed
    
    Returns:
        Response time in seconds
    """
    try:
        trigger_dt = datetime.fromisoformat(triggered_at.replace('Z', '+00:00'))
        complete_dt = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        delta = complete_dt - trigger_dt
        return int(delta.total_seconds())
    except Exception as e:
        log_error("Error calculating response time", e)
        return 0


def send_completion_notification(asha_id: str, patient_name: str, outcome: str, response_time: int):
    """Send notification to ASHA worker that emergency is completed."""
    # Get ASHA worker details
    asha = get_item(
        TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev'),
        {'id': asha_id}
    )
    
    if asha and asha.get('phone'):
        outcome_text = {
            'COMPLETED': 'successfully completed',
            'CANCELLED': 'cancelled',
            'REFERRED': 'referred to another facility'
        }.get(outcome, 'completed')
        
        message = (
            f"✅ Emergency for {patient_name} has been {outcome_text}. "
            f"Total response time: {response_time} minutes. "
            f"Thank you for your prompt action!"
        )
        
        # Send SMS via SNS
        sns_client.publish(
            PhoneNumber=asha['phone'],
            Message=message
        )
        
        log_info("Completion notification sent", asha_id=asha_id)
