"""
MaatriSahayak - Get Assigned Emergencies Lambda Function

Retrieves emergency events assigned to a driver's ambulance.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    get_query_parameter,
    log_info,
    log_error,
    get_item,
    scan_items
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Get emergencies assigned to driver's ambulance.
    
    Query Parameters:
        ambulance_id: Ambulance ID (required)
        status: Filter by status (optional) - PENDING, DISPATCHED, IN_TRANSIT, etc.
    
    Returns:
    {
        "success": true,
        "data": {
            "pending_emergencies": [...],
            "active_emergency": {...} or null,
            "count": 5
        }
    }
    """
    try:
        log_info("Get assigned emergencies request received")
        
        # Get ambulance ID from query parameter
        ambulance_id = get_query_parameter(event, 'ambulance_id')
        status_filter = get_query_parameter(event, 'status')
        
        if not ambulance_id:
            raise ValidationError(
                "Ambulance ID is required",
                field='ambulance_id'
            )
        
        # Verify ambulance exists
        ambulance = get_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': ambulance_id}
        )
        
        if not ambulance:
            raise NotFoundError(f"Ambulance with ID {ambulance_id} not found")
        
        # Build filter expression
        filter_expression = 'ambulance_id = :ambulance_id'
        expression_values = {':ambulance_id': ambulance_id}
        
        # Add status filter if provided
        if status_filter:
            filter_expression += ' AND #status = :status'
            expression_values[':status'] = status_filter
        
        # Query emergencies
        table_name = TABLE_NAMES['EMERGENCY_EVENTS']
        emergencies = scan_items(
            table_name,
            filter_expression=filter_expression,
            expression_attribute_values=expression_values,
            expression_attribute_names={'#status': 'status'} if status_filter else None
        )
        
        # Separate pending and active emergencies
        pending_emergencies = []
        active_emergency = None
        
        for emergency in emergencies:
            status = emergency.get('status', '')
            
            # PENDING or DISPATCHED = pending (driver hasn't accepted yet)
            if status in ['INITIATED', 'AMBULANCE_DISPATCHED']:
                pending_emergencies.append(format_emergency_response(emergency))
            
            # IN_TRANSIT, ARRIVED, TRANSPORTING = active (driver accepted)
            elif status in ['IN_TRANSIT', 'ARRIVED', 'TRANSPORTING']:
                active_emergency = format_emergency_response(emergency)
        
        response_data = {
            'pending_emergencies': pending_emergencies,
            'active_emergency': active_emergency,
            'count': len(emergencies)
        }
        
        log_info(
            "Assigned emergencies retrieved successfully",
            ambulance_id=ambulance_id,
            count=len(emergencies)
        )
        
        return create_success_response(
            response_data,
            "Assigned emergencies retrieved successfully"
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
            "An unexpected error occurred while retrieving assigned emergencies",
            {'error': str(e)}
        )


def format_emergency_response(emergency: dict) -> dict:
    """Format emergency data for response."""
    return {
        'id': emergency.get('id'),
        'pregnancy_id': emergency.get('pregnancy_id'),
        'patient_name': emergency.get('patient_name'),
        'patient_phone': emergency.get('patient_phone'),
        'event_type': emergency.get('event_type'),
        'severity': emergency.get('severity'),
        'description': emergency.get('description', ''),
        'pickup_location': {
            'latitude': float(emergency.get('latitude', 0)),
            'longitude': float(emergency.get('longitude', 0)),
            'address': emergency.get('location_address', '')
        },
        'hospital_location': {
            'latitude': float(emergency.get('hospital_latitude', 0)),
            'longitude': float(emergency.get('hospital_longitude', 0)),
            'name': emergency.get('hospital_name', ''),
            'id': emergency.get('hospital_id', '')
        },
        'status': emergency.get('status'),
        'triggered_at': emergency.get('triggered_at'),
        'dispatched_at': emergency.get('dispatched_at'),
        'estimated_arrival_time': emergency.get('estimated_arrival_time'),
        'symptoms': emergency.get('symptoms', []),
        'vital_signs': emergency.get('vital_signs', {})
    }
