"""
MaatriSahayak - Dispatch Ambulance Lambda Function

Assign ambulance to emergency event.
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
    send_ambulance_dispatched_email,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Dispatch ambulance to emergency.
    
    Expected Input:
    {
        "emergency_id": "string",
        "ambulance_id": "string"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency_id": "...",
            "ambulance_id": "...",
            "dispatched_at": "..."
        },
        "message": "Ambulance dispatched successfully"
    }
    """
    try:
        log_info("Dispatch ambulance request received")
        
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['emergency_id', 'ambulance_id']
        validate_required_fields(body, required_fields)
        
        emergency_id = body['emergency_id']
        ambulance_id = body['ambulance_id']
        
        # Check if emergency exists
        emergency = get_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id}
        )
        
        if not emergency:
            raise NotFoundError(f"Emergency with ID {emergency_id} not found")
        
        # Check if ambulance exists
        ambulance = get_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': ambulance_id}
        )
        
        if not ambulance:
            raise NotFoundError(f"Ambulance with ID {ambulance_id} not found")
        
        timestamp = get_current_timestamp()
        
        # Update emergency with ambulance assignment
        update_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id},
            "SET ambulance_id = :ambulance_id, #status = :status, dispatched_at = :dispatched_at",
            {
                ':ambulance_id': ambulance_id,
                ':status': 'AMBULANCE_DISPATCHED',
                ':dispatched_at': timestamp
            },
            {'#status': 'status'}
        )
        
        # Update ambulance status
        update_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': ambulance_id},
            "SET #status = :status, current_emergency_id = :emergency_id",
            {
                ':status': 'EN_ROUTE',
                ':emergency_id': emergency_id
            },
            {'#status': 'status'}
        )
        
        response_data = {
            'emergency_id': emergency_id,
            'ambulance_id': ambulance_id,
            'dispatched_at': timestamp
        }
        
        log_info("Ambulance dispatched", emergency_id=emergency_id, ambulance_id=ambulance_id)

        # Notify the ASHA worker who triggered the emergency
        asha_email = emergency.get('asha_email')
        asha_name = emergency.get('asha_name', 'ASHA Worker')
        if asha_email:
            try:
                send_ambulance_dispatched_email(
                    asha_name=asha_name,
                    asha_email=asha_email,
                    driver_name=ambulance.get('driver_name', 'Driver'),
                    vehicle_number=ambulance.get('vehicle_number', ambulance.get('registration_number', 'N/A')),
                    eta_minutes=body.get('eta_minutes', 20)
                )
            except Exception as e:
                log_error("Failed to send dispatch email (non-fatal)", e)

        return create_success_response(
            response_data,
            "Ambulance dispatched successfully"
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
            "An unexpected error occurred during ambulance dispatch",
            {'error': str(e)}
        )
