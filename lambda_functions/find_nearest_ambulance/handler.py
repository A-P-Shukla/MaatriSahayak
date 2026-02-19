"""
MaatriSahayak - Find Nearest Ambulance Lambda Function

Finds the nearest available ambulance for emergency response.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    log_warning,
    scan_items,
    calculate_distance,
    validate_required_fields,
    validate_coordinates
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, AMBULANCE_STATUS


def lambda_handler(event, context):
    """
    Find nearest available ambulance.
    
    Expected Input:
    {
        "latitude": float,
        "longitude": float,
        "district": "string",
        "required_equipment": ["string"] (optional),
        "max_distance_km": float (optional, default: 50)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "ambulances": [
                {
                    "id": "...",
                    "vehicle_number": "...",
                    "distance_km": 5.2,
                    "estimated_time_minutes": 15,
                    ...
                }
            ],
            "count": 3
        }
    }
    """
    try:
        log_info("Find nearest ambulance request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        validate_required_fields(body, ['latitude', 'longitude', 'district'])
        validate_coordinates(body['latitude'], body['longitude'])
        
        latitude = body['latitude']
        longitude = body['longitude']
        district = body['district']
        required_equipment = body.get('required_equipment', [])
        max_distance_km = body.get('max_distance_km', 50)
        
        # Get available ambulances in the district
        ambulances = scan_items(
            TABLE_NAMES['AMBULANCES'],
            filter_expression='#status = :status AND district = :district',
            expression_attribute_values={
                ':status': 'AVAILABLE',
                ':district': district
            },
            expression_attribute_names={
                '#status': 'status'
            }
        )
        
        if not ambulances:
            log_warning("No available ambulances found", district=district)
            return create_success_response(
                {'ambulances': [], 'count': 0},
                "No available ambulances found in the district"
            )
        
        # Filter by required equipment if specified
        if required_equipment:
            ambulances = [
                amb for amb in ambulances
                if all(eq in amb.get('equipment', []) for eq in required_equipment)
            ]
        
        # Calculate distances and estimated times
        nearby_ambulances = []
        for ambulance in ambulances:
            distance = calculate_distance(
                latitude,
                longitude,
                ambulance['latitude'],
                ambulance['longitude']
            )
            
            # Filter by max distance
            if distance <= max_distance_km:
                # Estimate time (assuming average speed of 40 km/h in emergency)
                estimated_time_minutes = int((distance / 40) * 60)
                
                ambulance['distance_km'] = distance
                ambulance['estimated_time_minutes'] = estimated_time_minutes
                nearby_ambulances.append(ambulance)
        
        # Sort by distance (nearest first)
        nearby_ambulances.sort(key=lambda x: x['distance_km'])
        
        log_info(
            "Ambulances found",
            count=len(nearby_ambulances),
            district=district
        )
        
        return create_success_response(
            {
                'ambulances': nearby_ambulances,
                'count': len(nearby_ambulances)
            },
            f"Found {len(nearby_ambulances)} available ambulance(s)"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
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
            "An unexpected error occurred while finding ambulances",
            {'error': str(e)}
        )
