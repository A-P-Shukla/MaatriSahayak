"""
MaatriSahayak - Complete Emergency Lambda Function

Close emergency event and update all related resources.
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
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Complete emergency event.
    
    Expected Input:
    {
        "emergency_id": "string",
        "outcome": "string" (RESOLVED, TRANSFERRED, CANCELLED),
        "notes": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency_id": "...",
            "outcome": "...",
            "completed_at": "...",
            "duration_minutes": 45
        },
        "message": "Emergency completed successfully"
    }
    """
    try:
        log_info("Complete emergency request received")
        
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['emergency_id', 'outcome']
        validate_required_fields(body, required_fields)
        
        emergency_id = body['emergency_id']
        outcome = body['outcome']
        
        # Validate outcome
        valid_outcomes = ['RESOLVED', 'TRANSFERRED', 'CANCELLED']
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
        
        timestamp = get_current_timestamp()
        
        # Calculate duration
        from datetime import datetime
        triggered_at = datetime.fromisoformat(emergency.get('triggered_at', timestamp).replace('Z', '+00:00'))
        completed_at = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        duration_minutes = int((completed_at - triggered_at).total_seconds() / 60)
        
        # Update emergency status
        update_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id},
            "SET #status = :status, outcome = :outcome, completed_at = :completed_at, duration_minutes = :duration, notes = :notes",
            {
                ':status': 'COMPLETED',
                ':outcome': outcome,
                ':completed_at': timestamp,
                ':duration': duration_minutes,
                ':notes': body.get('notes', '')
            },
            {'#status': 'status'}
        )
        
        # Release ambulance if assigned
        if emergency.get('ambulance_id'):
            update_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': emergency['ambulance_id']},
                "SET #status = :status, current_emergency_id = :null_value",
                {
                    ':status': 'AVAILABLE',
                    ':null_value': None
                },
                {'#status': 'status'}
            )
        
        response_data = {
            'emergency_id': emergency_id,
            'outcome': outcome,
            'completed_at': timestamp,
            'duration_minutes': duration_minutes
        }
        
        log_info("Emergency completed", emergency_id=emergency_id, outcome=outcome, duration_minutes=duration_minutes)
        
        return create_success_response(
            response_data,
            "Emergency completed successfully"
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
        log_error("Emergency not found", e)
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
            "An unexpected error occurred while completing emergency",
            {'error': str(e)}
        )
