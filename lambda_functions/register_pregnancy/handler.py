"""
MaatriSahayak - Register Pregnancy Lambda Function

Registers a new pregnancy in the system with comprehensive validation.
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
    get_item,
    generate_id,
    get_current_timestamp,
    validate_pregnancy_data
)
from shared.constants import TABLE_NAMES, HTTP_STATUS
from shared.models import PregnancyModel


def lambda_handler(event, context):
    """
    Register a new pregnancy in the system.
    
    Expected Input:
    {
        "patient_name": "string",
        "age": int,
        "phone": "string",
        "district": "string",
        "block": "string" (optional),
        "village": "string",
        "latitude": float (optional),
        "longitude": float (optional),
        "lmp_date": "YYYY-MM-DD",
        "edd": "YYYY-MM-DD",
        "gestational_age_weeks": int (optional),
        "blood_type": "string",
        "gravida": int (optional),
        "parity": int (optional),
        "previous_complications": ["string"] (optional),
        "chronic_conditions": ["string"] (optional),
        "asha_worker_id": "string",
        "asha_worker_name": "string" (optional),
        "asha_worker_phone": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "preg_xxx",
            "patient_name": "...",
            ...
        },
        "message": "Pregnancy registered successfully"
    }
    """
    try:
        log_info("Register pregnancy request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields and data format
        validate_pregnancy_data(body)
        
        # Check for duplicate registration (same phone + active pregnancy)
        phone = body['phone']
        existing_pregnancies = check_existing_pregnancy(phone)
        
        if existing_pregnancies:
            raise ConflictError(
                f"Active pregnancy already exists for phone number {phone}",
                details={'existing_pregnancy_id': existing_pregnancies[0]['id']}
            )
        
        # Generate unique pregnancy ID
        pregnancy_id = generate_id('preg_')
        timestamp = get_current_timestamp()
        
        # Prepare pregnancy data
        pregnancy_data = {
            'id': pregnancy_id,
            'patient_name': body['patient_name'],
            'age': body['age'],
            'phone': phone,
            'district': body['district'],
            'block': body.get('block'),
            'village': body['village'],
            'latitude': body.get('latitude'),
            'longitude': body.get('longitude'),
            'lmp_date': body['lmp_date'],
            'edd': body['edd'],
            'gestational_age_weeks': body.get('gestational_age_weeks'),
            'blood_type': body['blood_type'],
            'gravida': body.get('gravida', 1),
            'parity': body.get('parity', 0),
            'previous_complications': body.get('previous_complications', []),
            'chronic_conditions': body.get('chronic_conditions', []),
            'risk_score': 0,  # Will be calculated by assess_risk function
            'risk_level': 'LOW',
            'status': 'ACTIVE',
            'asha_worker_id': body['asha_worker_id'],
            'asha_worker_name': body.get('asha_worker_name'),
            'asha_worker_phone': body.get('asha_worker_phone'),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        # Validate with Pydantic model
        pregnancy_model = PregnancyModel(**pregnancy_data)
        
        # Save to DynamoDB
        put_item(TABLE_NAMES['PREGNANCIES'], pregnancy_model.model_dump())
        
        log_info(
            "Pregnancy registered successfully",
            pregnancy_id=pregnancy_id,
            patient_name=body['patient_name'],
            asha_worker_id=body['asha_worker_id']
        )
        
        return create_success_response(
            pregnancy_model.model_dump(),
            "Pregnancy registered successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error during pregnancy registration", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except ConflictError as e:
        log_error("Conflict error - duplicate pregnancy", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except DatabaseError as e:
        log_error("Database error during pregnancy registration", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during pregnancy registration", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while registering pregnancy",
            {'error': str(e)}
        )


def check_existing_pregnancy(phone: str) -> list:
    """
    Check if there's an active pregnancy for the given phone number.
    
    Args:
        phone: Patient phone number
    
    Returns:
        List of active pregnancies (empty if none found)
    """
    try:
        from shared import scan_items
        
        # Scan for active pregnancies with this phone number
        pregnancies = scan_items(
            TABLE_NAMES['PREGNANCIES'],
            filter_expression='phone = :phone AND #status = :status',
            expression_attribute_values={
                ':phone': phone,
                ':status': 'ACTIVE'
            },
            expression_attribute_names={
                '#status': 'status'
            },
            limit=1
        )
        
        return pregnancies
    
    except Exception as e:
        log_error("Error checking existing pregnancy", e, phone=phone)
        return []
