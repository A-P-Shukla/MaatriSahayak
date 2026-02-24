"""
MaatriSahayak - Validate Emergency Lambda Function

Validate emergency request before triggering response.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    get_item,
    validate_required_fields,
    validate_coordinates
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Validate emergency request.
    
    Expected Input:
    {
        "pregnancy_id": "string",
        "event_type": "string",
        "severity": "string",
        "latitude": float,
        "longitude": float
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "valid": true,
            "pregnancy": {...},
            "validation_checks": {...}
        },
        "message": "Emergency request validated successfully"
    }
    """
    try:
        log_info("Validate emergency request received")
        
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['pregnancy_id', 'event_type', 'severity', 'latitude', 'longitude']
        validate_required_fields(body, required_fields)
        
        # Validate coordinates
        validate_coordinates(body['latitude'], body['longitude'])
        
        # Check if pregnancy exists
        pregnancy = get_item(
            TABLE_NAMES['PREGNANCIES'],
            {'id': body['pregnancy_id']}
        )
        
        if not pregnancy:
            raise NotFoundError(
                f"Pregnancy with ID {body['pregnancy_id']} not found"
            )
        
        # Validation checks
        validation_checks = {
            'pregnancy_exists': True,
            'pregnancy_active': pregnancy.get('status') == 'ACTIVE',
            'coordinates_valid': True,
            'severity_valid': body['severity'] in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        }
        
        is_valid = all(validation_checks.values())
        
        response_data = {
            'valid': is_valid,
            'pregnancy': pregnancy,
            'validation_checks': validation_checks
        }
        
        log_info("Emergency request validated", pregnancy_id=body['pregnancy_id'], valid=is_valid)
        
        return create_success_response(
            response_data,
            "Emergency request validated successfully"
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
        log_error("Pregnancy not found", e)
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
            "An unexpected error occurred during validation",
            {'error': str(e)}
        )
