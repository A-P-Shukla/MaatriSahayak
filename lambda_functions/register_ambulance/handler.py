"""
MaatriSahayak - Register Ambulance Lambda Function

Registers a new ambulance in the system.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    ConflictError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    put_item,
    scan_items,
    generate_id,
    get_current_timestamp,
    validate_required_fields,
    validate_phone_number,
    validate_coordinates
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, AMBULANCE_STATUS, EQUIPMENT_TYPES


def lambda_handler(event, context):
    """
    Register a new ambulance in the system.
    
    Expected Input:
    {
        "vehicle_number": "string",
        "district": "string",
        "latitude": float,
        "longitude": float,
        "driver_name": "string",
        "driver_phone": "string",
        "equipment": ["string"] (optional),
        "type": "string" (optional - BASIC, ADVANCED, NICU),
        "status": "string" (optional - default: AVAILABLE)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "amb_xxx",
            "vehicle_number": "...",
            "status": "AVAILABLE",
            ...
        },
        "message": "Ambulance registered successfully"
    }
    """
    try:
        log_info("Register ambulance request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['vehicle_number', 'district', 'latitude', 'longitude', 'driver_name', 'driver_phone']
        validate_required_fields(body, required_fields)
        
        # Validate specific fields
        validate_phone_number(body['driver_phone'])
        validate_coordinates(body['latitude'], body['longitude'])
        
        # Check for duplicate vehicle number
        existing_ambulance = check_existing_ambulance(body['vehicle_number'])
        if existing_ambulance:
            raise ConflictError(
                f"Ambulance with vehicle number {body['vehicle_number']} already exists",
                details={'existing_ambulance_id': existing_ambulance[0]['id']}
            )
        
        # Validate equipment if provided
        equipment = body.get('equipment', [])
        if equipment:
            invalid_equipment = [eq for eq in equipment if eq not in EQUIPMENT_TYPES]
            if invalid_equipment:
                raise ValidationError(
                    f"Invalid equipment types: {', '.join(invalid_equipment)}",
                    field='equipment'
                )
        
        # Validate status if provided
        status = body.get('status', 'AVAILABLE')
        if status not in AMBULANCE_STATUS:
            raise ValidationError(
                f"Invalid status. Must be one of: {', '.join(AMBULANCE_STATUS.keys())}",
                field='status'
            )
        
        # Generate unique ambulance ID
        ambulance_id = generate_id('amb_')
        timestamp = get_current_timestamp()
        
        # Prepare ambulance data
        ambulance_data = {
            'id': ambulance_id,
            'vehicle_number': body['vehicle_number'].upper(),
            'district': body['district'],
            'latitude': body['latitude'],
            'longitude': body['longitude'],
            'driver_name': body['driver_name'],
            'driver_phone': body['driver_phone'],
            'equipment': equipment,
            'type': body.get('type', 'BASIC'),
            'status': status,
            'current_emergency_id': None,
            'total_emergencies_handled': 0,
            'created_at': timestamp,
            'last_updated': timestamp
        }
        
        # Save to DynamoDB
        put_item(TABLE_NAMES['AMBULANCES'], ambulance_data)
        
        log_info(
            "Ambulance registered successfully",
            ambulance_id=ambulance_id,
            vehicle_number=body['vehicle_number'],
            district=body['district']
        )
        
        return create_success_response(
            ambulance_data,
            "Ambulance registered successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except ConflictError as e:
        log_error("Conflict error - duplicate ambulance", e)
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
            "An unexpected error occurred while registering ambulance",
            {'error': str(e)}
        )


def check_existing_ambulance(vehicle_number: str) -> list:
    """
    Check if ambulance with vehicle number already exists.
    
    Args:
        vehicle_number: Vehicle number to check
    
    Returns:
        List of existing ambulances (empty if none found)
    """
    try:
        ambulances = scan_items(
            TABLE_NAMES['AMBULANCES'],
            filter_expression='vehicle_number = :vehicle_number',
            expression_attribute_values={':vehicle_number': vehicle_number.upper()},
            limit=1
        )
        
        return ambulances
    
    except Exception as e:
        log_error("Error checking existing ambulance", e, vehicle_number=vehicle_number)
        return []
