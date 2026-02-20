"""
MaatriSahayak - Register Hospital Lambda Function

Registers a new hospital in the system.
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
from shared.constants import TABLE_NAMES, HTTP_STATUS, HOSPITAL_TYPES, SPECIALIZATIONS


def lambda_handler(event, context):
    """
    Register a new hospital in the system.
    
    Expected Input:
    {
        "name": "string",
        "type": "string" (PHC, CHC, DISTRICT, MEDICAL_COLLEGE),
        "district": "string",
        "address": "string",
        "latitude": float,
        "longitude": float,
        "phone": "string",
        "total_beds": int,
        "maternity_beds": int,
        "nicu_beds": int (optional),
        "has_blood_bank": boolean (optional),
        "has_operation_theater": boolean (optional),
        "specializations": ["string"] (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "hosp_xxx",
            "name": "...",
            "type": "...",
            ...
        },
        "message": "Hospital registered successfully"
    }
    """
    try:
        log_info("Register hospital request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = [
            'name', 'type', 'district', 'address',
            'latitude', 'longitude', 'phone',
            'total_beds', 'maternity_beds'
        ]
        validate_required_fields(body, required_fields)
        
        # Validate specific fields
        validate_phone_number(body['phone'])
        validate_coordinates(body['latitude'], body['longitude'])
        
        # Validate hospital type
        if body['type'] not in HOSPITAL_TYPES:
            raise ValidationError(
                f"Invalid hospital type. Must be one of: {', '.join(HOSPITAL_TYPES.keys())}",
                field='type'
            )
        
        # Validate bed counts
        if body['total_beds'] < 0 or body['maternity_beds'] < 0:
            raise ValidationError("Bed counts must be non-negative")
        
        if body['maternity_beds'] > body['total_beds']:
            raise ValidationError("Maternity beds cannot exceed total beds")
        
        # Validate specializations if provided
        specializations = body.get('specializations', [])
        if specializations:
            invalid_specs = [spec for spec in specializations if spec not in SPECIALIZATIONS]
            if invalid_specs:
                raise ValidationError(
                    f"Invalid specializations: {', '.join(invalid_specs)}",
                    field='specializations'
                )
        
        # Check for duplicate hospital (same name + district)
        existing_hospital = check_existing_hospital(body['name'], body['district'])
        if existing_hospital:
            raise ConflictError(
                f"Hospital '{body['name']}' already exists in {body['district']} district",
                details={'existing_hospital_id': existing_hospital[0]['id']}
            )
        
        # Generate unique hospital ID
        hospital_id = generate_id('hosp_')
        timestamp = get_current_timestamp()
        
        # Prepare hospital data
        nicu_beds = body.get('nicu_beds', 0)
        hospital_data = {
            'id': hospital_id,
            'name': body['name'],
            'type': body['type'],
            'district': body['district'],
            'address': body['address'],
            'latitude': body['latitude'],
            'longitude': body['longitude'],
            'phone': body['phone'],
            'total_beds': body['total_beds'],
            'available_beds': body['total_beds'],  # Initially all beds available
            'maternity_beds': body['maternity_beds'],
            'available_maternity_beds': body['maternity_beds'],
            'nicu_beds': nicu_beds,
            'available_nicu_beds': nicu_beds,
            'has_blood_bank': body.get('has_blood_bank', False),
            'has_operation_theater': body.get('has_operation_theater', False),
            'specializations': specializations,
            'status': 'ACTIVE',
            'created_at': timestamp,
            'last_updated': timestamp
        }
        
        # Save to DynamoDB
        put_item(TABLE_NAMES['HOSPITALS'], hospital_data)
        
        log_info(
            "Hospital registered successfully",
            hospital_id=hospital_id,
            name=body['name'],
            district=body['district'],
            type=body['type']
        )
        
        return create_success_response(
            hospital_data,
            "Hospital registered successfully"
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
        log_error("Conflict error - duplicate hospital", e)
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
            "An unexpected error occurred while registering hospital",
            {'error': str(e)}
        )


def check_existing_hospital(name: str, district: str) -> list:
    """
    Check if hospital with same name exists in district.
    
    Args:
        name: Hospital name
        district: District name
    
    Returns:
        List of existing hospitals (empty if none found)
    """
    try:
        hospitals = scan_items(
            TABLE_NAMES['HOSPITALS'],
            filter_expression='#name = :name AND district = :district',
            expression_attribute_values={
                ':name': name,
                ':district': district
            },
            expression_attribute_names={
                '#name': 'name'
            },
            limit=1
        )
        
        return hospitals
    
    except Exception as e:
        log_error("Error checking existing hospital", e, name=name, district=district)
        return []
