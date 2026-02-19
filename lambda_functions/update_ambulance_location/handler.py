"""
MaatriSahayak - Update Ambulance Location Lambda Function

Updates ambulance GPS location and status for real-time tracking.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    get_item,
    update_item,
    get_current_timestamp,
    validate_required_fields,
    validate_coordinates
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, AMBULANCE_STATUS


def lambda_handler(event, context):
    """
    Update ambulance location and status.
    
    Expected Input:
    {
        "ambulance_id": "string",
        "latitude": float,
        "longitude": float,
        "status": "string" (optional - AVAILABLE, DISPATCHED, BUSY, etc.)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "ambulance_id": "...",
            "latitude": 27.5706,
            "longitude": 80.2792,
            "status": "IN_TRANSIT",
            "last_updated": "..."
        }
    }
    """
    try:
        log_info("Update ambulance location request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        validate_required_fields(body, ['ambulance_id', 'latitude', 'longitude'])
        validate_coordinates(body['latitude'], body['longitude'])
        
        ambulance_id = body['ambulance_id']
        
        # Verify ambulance exists
        ambulance = get_item(TABLE_NAMES['AMBULANCES'], {'id': ambulance_id})
        
        if not ambulance:
            raise ResourceNotFoundError('Ambulance', ambulance_id)
        
        # Prepare updates
        timestamp = get_current_timestamp()
        updates = {
            'latitude': body['latitude'],
            'longitude': body['longitude'],
            'last_updated': timestamp
        }
        
        # Update status if provided
        if 'status' in body:
            status = body['status']
            if status not in AMBULANCE_STATUS:
                raise ValidationError(
                    f"Invalid status. Must be one of: {', '.join(AMBULANCE_STATUS.keys())}",
                    field='status'
                )
            updates['status'] = status
        
        # Update ambulance in DynamoDB
        updated_ambulance = update_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': ambulance_id},
            updates
        )
        
        log_info(
            "Ambulance location updated",
            ambulance_id=ambulance_id,
            latitude=body['latitude'],
            longitude=body['longitude']
        )
        
        return create_success_response(
            updated_ambulance,
            "Ambulance location updated successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except ResourceNotFoundError as e:
        log_error("Ambulance not found", e)
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
            "An unexpected error occurred while updating ambulance location",
            {'error': str(e)}
        )
