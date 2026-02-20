"""
MaatriSahayak - Register ASHA Worker Lambda Function

Registers a new ASHA worker account in the system.
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
    validate_age
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Register a new ASHA worker account.
    
    Expected Input:
    {
        "name": "string",
        "phone": "string",
        "email": "string" (optional),
        "age": int,
        "district": "string",
        "block": "string" (optional),
        "village": "string",
        "qualification": "string" (optional),
        "experience_years": int (optional),
        "languages": ["string"] (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "asha_xxx",
            "name": "...",
            "phone": "...",
            "status": "ACTIVE",
            ...
        },
        "message": "ASHA worker registered successfully"
    }
    """
    try:
        log_info("Register ASHA worker request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['name', 'phone', 'age', 'district', 'village']
        validate_required_fields(body, required_fields)
        
        # Validate specific fields
        validate_phone_number(body['phone'])
        validate_age(body['age'])
        
        # Check for duplicate phone number
        existing_asha = check_existing_asha(body['phone'])
        if existing_asha:
            raise ConflictError(
                f"ASHA worker with phone number {body['phone']} already exists",
                details={'existing_asha_id': existing_asha[0]['id']}
            )
        
        # Generate unique ASHA worker ID
        asha_id = generate_id('asha_')
        timestamp = get_current_timestamp()
        
        # Prepare ASHA worker data
        asha_data = {
            'id': asha_id,
            'name': body['name'],
            'phone': body['phone'],
            'email': body.get('email'),
            'age': body['age'],
            'district': body['district'],
            'block': body.get('block'),
            'village': body['village'],
            'qualification': body.get('qualification'),
            'experience_years': body.get('experience_years', 0),
            'languages': body.get('languages', ['Hindi']),
            'status': 'ACTIVE',
            'pregnancies_managed': 0,
            'emergencies_handled': 0,
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        # Save to DynamoDB (using a dedicated ASHA workers table)
        # For now, we'll store in a generic users table or create ASHA table
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        put_item(table_name, asha_data)
        
        log_info(
            "ASHA worker registered successfully",
            asha_id=asha_id,
            name=body['name'],
            district=body['district']
        )
        
        return create_success_response(
            asha_data,
            "ASHA worker registered successfully"
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
        log_error("Conflict error - duplicate ASHA worker", e)
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
            "An unexpected error occurred while registering ASHA worker",
            {'error': str(e)}
        )


def check_existing_asha(phone: str) -> list:
    """
    Check if ASHA worker with phone number already exists.
    
    Args:
        phone: Phone number to check
    
    Returns:
        List of existing ASHA workers (empty if none found)
    """
    try:
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        
        asha_workers = scan_items(
            table_name,
            filter_expression='phone = :phone',
            expression_attribute_values={':phone': phone},
            limit=1
        )
        
        return asha_workers
    
    except Exception as e:
        log_error("Error checking existing ASHA worker", e, phone=phone)
        return []
