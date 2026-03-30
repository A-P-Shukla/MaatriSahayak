"""
MaatriSahayak - Get Driver Profile Lambda Function

Retrieves driver profile information including assigned ambulance details.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    get_path_parameter,
    log_info,
    log_error,
    get_item
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Get driver profile by driver ID.
    
    Path Parameter:
        driver_id: Driver ID
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "drv_xxx",
            "name": "...",
            "phone": "...",
            "ambulance_id": "...",
            "ambulance_details": {...},
            "status": "AVAILABLE",
            "rating": 4.5,
            "total_rides": 25,
            ...
        }
    }
    """
    try:
        log_info("Get driver profile request received")
        
        # Get driver ID from path parameter
        driver_id = get_path_parameter(event, 'driver_id')
        
        if not driver_id:
            raise ValidationError(
                "Driver ID is required",
                field='driver_id'
            )
        
        # Get driver from DynamoDB
        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')
        driver = get_item(table_name, {'id': driver_id})
        
        if not driver:
            raise ResourceNotFoundError('Driver', driver_id)
        
        # Get ambulance details if assigned
        ambulance_details = None
        if driver.get('ambulanceId'):
            ambulance = get_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': driver['ambulanceId']}
            )
            if ambulance:
                ambulance_details = {
                    'id': ambulance.get('id'),
                    'vehicle_number': ambulance.get('vehicle_number'),
                    'district': ambulance.get('district'),
                    'status': ambulance.get('status'),
                    'equipment': ambulance.get('equipment', []),
                    'type': ambulance.get('type', 'BASIC')
                }
        
        # Prepare response data
        response_data = {
            'id': driver.get('id'),
            'userId': driver.get('userId'),
            'name': driver.get('name'),
            'phone': driver.get('phone'),
            'email': driver.get('email'),
            'photo': driver.get('photo', ''),
            'licenseNumber': driver.get('licenseNumber'),
            'licensePhotoUrl': driver.get('licensePhotoUrl', ''),
            'ambulanceId': driver.get('ambulanceId'),
            'ambulance_details': ambulance_details,
            'status': driver.get('status', 'AVAILABLE'),
            'currentLocation': driver.get('currentLocation', {}),
            'rating': float(driver.get('rating', 5.0)),
            'totalRides': int(driver.get('totalRides', 0)),
            'emergencyContact': driver.get('emergencyContact', ''),
            'createdAt': driver.get('createdAt'),
            'updatedAt': driver.get('updatedAt')
        }
        
        log_info("Driver profile retrieved successfully", driver_id=driver_id)
        
        return create_success_response(
            response_data,
            "Driver profile retrieved successfully"
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
        log_error("Driver not found", e)
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
            "An unexpected error occurred while retrieving driver profile",
            {'error': str(e)}
        )
