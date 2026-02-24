"""
MaatriSahayak - Get Ambulance Status Lambda Function

Get ambulance availability and current status.
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
    Get ambulance status and availability.
    
    Path Parameters:
    - ambulance_id: Ambulance ID
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "amb_xxx",
            "status": "AVAILABLE",
            "location": {...},
            "current_emergency_id": null,
            "driver_info": {...}
        },
        "message": "Ambulance status retrieved successfully"
    }
    """
    try:
        log_info("Get ambulance status request received")
        
        # Get ambulance_id from path
        ambulance_id = None
        if 'pathParameters' in event and event['pathParameters']:
            ambulance_id = event['pathParameters'].get('ambulance_id') or event['pathParameters'].get('id')
        
        if not ambulance_id:
            raise ValidationError(
                "Missing required parameter: ambulance_id",
                field='ambulance_id'
            )
        
        # Get ambulance details
        ambulance = get_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': ambulance_id}
        )
        
        if not ambulance:
            raise NotFoundError(f"Ambulance with ID {ambulance_id} not found")
        
        # Build response
        response_data = {
            'id': ambulance['id'],
            'vehicle_number': ambulance.get('vehicle_number'),
            'status': ambulance.get('status', 'UNKNOWN'),
            'location': {
                'latitude': ambulance.get('latitude'),
                'longitude': ambulance.get('longitude'),
                'last_updated': ambulance.get('last_location_update')
            },
            'district': ambulance.get('district'),
            'current_emergency_id': ambulance.get('current_emergency_id'),
            'driver_info': {
                'name': ambulance.get('driver_name'),
                'phone': ambulance.get('driver_phone')
            },
            'equipment': ambulance.get('equipment', []),
            'last_maintenance': ambulance.get('last_maintenance_date')
        }
        
        log_info("Ambulance status retrieved", ambulance_id=ambulance_id, status=ambulance.get('status'))
        
        return create_success_response(
            response_data,
            "Ambulance status retrieved successfully"
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
        log_error("Ambulance not found", e)
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
            "An unexpected error occurred while retrieving ambulance status",
            {'error': str(e)}
        )
