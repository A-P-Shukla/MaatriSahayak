"""
MaatriSahayak - Monitor Emergency Lambda Function

Track emergency progress and status.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    get_item
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Monitor emergency event progress.
    
    Path Parameters:
    - emergency_id: Emergency ID
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency_id": "...",
            "status": "...",
            "ambulance_location": {...},
            "eta_minutes": 15,
            "timeline": [...]
        },
        "message": "Emergency status retrieved successfully"
    }
    """
    try:
        log_info("Monitor emergency request received")
        
        # Get emergency_id from path
        emergency_id = None
        if 'pathParameters' in event and event['pathParameters']:
            emergency_id = event['pathParameters'].get('emergency_id') or event['pathParameters'].get('id')
        
        if not emergency_id:
            raise ValidationError(
                "Missing required parameter: emergency_id",
                field='emergency_id'
            )
        
        # Get emergency details
        emergency = get_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id}
        )
        
        if not emergency:
            raise NotFoundError(f"Emergency with ID {emergency_id} not found")
        
        # Get ambulance location if assigned
        ambulance_location = None
        if emergency.get('ambulance_id'):
            ambulance = get_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': emergency['ambulance_id']}
            )
            if ambulance:
                ambulance_location = {
                    'latitude': ambulance.get('latitude'),
                    'longitude': ambulance.get('longitude'),
                    'status': ambulance.get('status'),
                    'last_updated': ambulance.get('last_location_update')
                }
        
        # Build timeline
        timeline = []
        if emergency.get('triggered_at'):
            timeline.append({'event': 'Emergency Triggered', 'timestamp': emergency['triggered_at']})
        if emergency.get('dispatched_at'):
            timeline.append({'event': 'Ambulance Dispatched', 'timestamp': emergency['dispatched_at']})
        if emergency.get('hospital_alerted_at'):
            timeline.append({'event': 'Hospital Alerted', 'timestamp': emergency['hospital_alerted_at']})
        
        response_data = {
            'emergency_id': emergency_id,
            'status': emergency.get('status'),
            'severity': emergency.get('severity'),
            'ambulance_location': ambulance_location,
            'eta_minutes': emergency.get('eta_minutes'),
            'timeline': timeline,
            'pregnancy_id': emergency.get('pregnancy_id'),
            'hospital_id': emergency.get('hospital_id')
        }
        
        log_info("Emergency status retrieved", emergency_id=emergency_id, status=emergency.get('status'))
        
        return create_success_response(
            response_data,
            "Emergency status retrieved successfully"
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
            "An unexpected error occurred while monitoring emergency",
            {'error': str(e)}
        )
