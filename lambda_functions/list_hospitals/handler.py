"""
MaatriSahayak - List Hospitals Lambda Function

Get list of hospitals by district/type with filtering.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    query_items,
    scan_items
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    List hospitals with optional filtering.
    
    Query Parameters (optional):
    - district: Filter by district
    - type: Filter by hospital type (PHC, CHC, DISTRICT, MEDICAL_COLLEGE)
    - has_blood_bank: Filter by blood bank availability (true/false)
    - has_nicu: Filter by NICU availability (true/false)
    - limit: Maximum results (default: 50)
    
    Returns:
    {
        "success": true,
        "data": {
            "hospitals": [...],
            "count": 10
        },
        "message": "Found 10 hospital(s)"
    }
    """
    try:
        log_info("List hospitals request received")
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        district = query_params.get('district')
        hospital_type = query_params.get('type')
        has_blood_bank = query_params.get('has_blood_bank')
        has_nicu = query_params.get('has_nicu')
        limit = int(query_params.get('limit', 50))
        
        hospitals = []
        
        # Query by district and type if provided
        if district and hospital_type:
            try:
                hospitals = query_items(
                    TABLE_NAMES['HOSPITALS'],
                    index_name='district-type-index',
                    key_condition_expression='district = :district AND #type = :type',
                    expression_attribute_values={
                        ':district': district,
                        ':type': hospital_type
                    },
                    expression_attribute_names={
                        '#type': 'type'
                    },
                    limit=limit
                )
            except Exception:
                pass
        elif district:
            try:
                hospitals = query_items(
                    TABLE_NAMES['HOSPITALS'],
                    index_name='district-type-index',
                    key_condition_expression='district = :district',
                    expression_attribute_values={
                        ':district': district
                    },
                    limit=limit
                )
            except Exception:
                pass
        
        # Fallback to scan if query not used
        if not hospitals:
            filter_expressions = []
            expression_values = {}
            expression_names = {}
            
            if district:
                filter_expressions.append('district = :district')
                expression_values[':district'] = district
            
            if hospital_type:
                filter_expressions.append('#type = :type')
                expression_values[':type'] = hospital_type
                expression_names['#type'] = 'type'
            
            filter_expression = ' AND '.join(filter_expressions) if filter_expressions else None
            
            hospitals = scan_items(
                TABLE_NAMES['HOSPITALS'],
                filter_expression=filter_expression,
                expression_attribute_values=expression_values if expression_values else None,
                expression_attribute_names=expression_names if expression_names else None,
                limit=limit
            )
        
        # Apply additional filters
        if has_blood_bank:
            has_blood_bank_bool = has_blood_bank.lower() == 'true'
            hospitals = [h for h in hospitals if h.get('has_blood_bank') == has_blood_bank_bool]
        
        if has_nicu:
            hospitals = [h for h in hospitals if h.get('nicu_beds', 0) > 0]
        
        response_data = {
            'hospitals': hospitals,
            'count': len(hospitals)
        }
        
        log_info("Hospitals listed", count=len(hospitals), district=district, type=hospital_type)
        
        return create_success_response(
            response_data,
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
            "An unexpected error occurred while listing hospitals",
            {'error': str(e)}
        )
