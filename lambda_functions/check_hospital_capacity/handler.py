"""
MaatriSahayak - Check Hospital Capacity Lambda Function

Checks hospital bed availability and capacity for emergency routing.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    get_query_parameter,
    log_info,
    log_error,
    get_item,
    scan_items,
    calculate_distance
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, HOSPITAL_TYPES


def lambda_handler(event, context):
    """
    Check hospital capacity and availability.
    
    Query Parameters (for GET):
        hospital_id: Specific hospital ID (optional)
        district: Filter by district (optional)
        latitude: Patient latitude for distance calculation (optional)
        longitude: Patient longitude for distance calculation (optional)
        min_maternity_beds: Minimum maternity beds required (optional)
        min_nicu_beds: Minimum NICU beds required (optional)
        has_blood_bank: Filter hospitals with blood bank (optional)
        hospital_type: Filter by type (PHC, CHC, DISTRICT, MEDICAL_COLLEGE) (optional)
    
    Returns:
    {
        "success": true,
        "data": {
            "hospitals": [
                {
                    "id": "...",
                    "name": "...",
                    "available_maternity_beds": 5,
                    "available_nicu_beds": 2,
                    "distance_km": 10.5,
                    ...
                }
            ],
            "count": 3
        }
    }
    """
    try:
        log_info("Check hospital capacity request received")
        
        # Get query parameters
        hospital_id = get_query_parameter(event, 'hospital_id')
        district = get_query_parameter(event, 'district')
        latitude = get_query_parameter(event, 'latitude')
        longitude = get_query_parameter(event, 'longitude')
        min_maternity_beds = get_query_parameter(event, 'min_maternity_beds')
        min_nicu_beds = get_query_parameter(event, 'min_nicu_beds')
        has_blood_bank = get_query_parameter(event, 'has_blood_bank')
        hospital_type = get_query_parameter(event, 'hospital_type')
        
        # If specific hospital ID provided, get that hospital
        if hospital_id:
            hospital = get_item(TABLE_NAMES['HOSPITALS'], {'id': hospital_id})
            
            if not hospital:
                raise ResourceNotFoundError('Hospital', hospital_id)
            
            # Calculate distance if coordinates provided
            if latitude and longitude:
                distance = calculate_distance(
                    float(latitude),
                    float(longitude),
                    hospital['latitude'],
                    hospital['longitude']
                )
                hospital['distance_km'] = distance
            
            return create_success_response(
                {'hospital': hospital},
                "Hospital details retrieved successfully"
            )
        
        # Build filter expression for scanning
        filter_parts = []
        expression_values = {}
        expression_names = {}
        
        if district:
            filter_parts.append('district = :district')
            expression_values[':district'] = district
        
        if min_maternity_beds:
            filter_parts.append('available_maternity_beds >= :min_maternity')
            expression_values[':min_maternity'] = int(min_maternity_beds)
        
        if min_nicu_beds:
            filter_parts.append('available_nicu_beds >= :min_nicu')
            expression_values[':min_nicu'] = int(min_nicu_beds)
        
        if has_blood_bank and has_blood_bank.lower() == 'true':
            filter_parts.append('has_blood_bank = :has_blood_bank')
            expression_values[':has_blood_bank'] = True
        
        if hospital_type:
            filter_parts.append('#type = :hospital_type')
            expression_values[':hospital_type'] = hospital_type
            expression_names['#type'] = 'type'
        
        filter_expression = ' AND '.join(filter_parts) if filter_parts else None
        
        # Scan hospitals with filters
        hospitals = scan_items(
            TABLE_NAMES['HOSPITALS'],
            filter_expression=filter_expression,
            expression_attribute_values=expression_values if expression_values else None,
            expression_attribute_names=expression_names if expression_names else None
        )
        
        # Calculate distances if coordinates provided
        if latitude and longitude:
            for hospital in hospitals:
                distance = calculate_distance(
                    float(latitude),
                    float(longitude),
                    hospital['latitude'],
                    hospital['longitude']
                )
                hospital['distance_km'] = distance
            
            # Sort by distance
            hospitals.sort(key=lambda x: x.get('distance_km', float('inf')))
        
        # Calculate capacity utilization
        for hospital in hospitals:
            if hospital['total_beds'] > 0:
                hospital['occupancy_rate'] = round(
                    ((hospital['total_beds'] - hospital['available_beds']) / hospital['total_beds']) * 100,
                    2
                )
            
            if hospital['maternity_beds'] > 0:
                hospital['maternity_occupancy_rate'] = round(
                    ((hospital['maternity_beds'] - hospital['available_maternity_beds']) / hospital['maternity_beds']) * 100,
                    2
                )
        
        log_info(
            "Hospital capacity check completed",
            count=len(hospitals),
            district=district
        )
        
        return create_success_response(
            {
                'hospitals': hospitals,
                'count': len(hospitals)
            },
            f"Found {len(hospitals)} hospital(s) matching criteria"
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
        log_error("Hospital not found", e)
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
            "An unexpected error occurred while checking hospital capacity",
            {'error': str(e)}
        )
