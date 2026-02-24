"""
MaatriSahayak - Record ANC Visit Lambda Function

Record Antenatal Care (ANC) visit details for a pregnancy.
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
    put_item,
    generate_id,
    get_current_timestamp,
    validate_required_fields,
    validate_date
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Record an ANC visit for a pregnancy.
    
    Expected Input:
    {
        "pregnancy_id": "string",
        "visit_number": int,
        "visit_date": "YYYY-MM-DD",
        "gestational_age_weeks": int,
        "weight_kg": float (optional),
        "bp_systolic": int (optional),
        "bp_diastolic": int (optional),
        "hemoglobin": float (optional),
        "urine_test": "string" (optional),
        "fundal_height_cm": float (optional),
        "fetal_heart_rate": int (optional),
        "fetal_movement": "string" (optional),
        "edema": "string" (optional - NONE, MILD, MODERATE, SEVERE),
        "complaints": ["string"] (optional),
        "medications_prescribed": ["string"] (optional),
        "tests_ordered": ["string"] (optional),
        "next_visit_date": "YYYY-MM-DD" (optional),
        "notes": "string" (optional),
        "recorded_by": "string",
        "recorded_by_name": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "anc_xxx",
            "pregnancy_id": "...",
            ...
        },
        "message": "ANC visit recorded successfully"
    }
    """
    try:
        log_info("Record ANC visit request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = [
            'pregnancy_id', 'visit_number', 'visit_date',
            'gestational_age_weeks', 'recorded_by'
        ]
        validate_required_fields(body, required_fields)
        
        pregnancy_id = body['pregnancy_id']
        
        # Validate dates
        validate_date(body['visit_date'], 'visit_date')
        if 'next_visit_date' in body:
            validate_date(body['next_visit_date'], 'next_visit_date')
        
        # Check if pregnancy exists
        pregnancy = get_item(
            TABLE_NAMES['PREGNANCIES'],
            {'id': pregnancy_id}
        )
        
        if not pregnancy:
            raise NotFoundError(
                f"Pregnancy with ID {pregnancy_id} not found"
            )
        
        # Generate unique ANC visit ID
        anc_visit_id = generate_id('anc_')
        timestamp = get_current_timestamp()
        
        # Prepare ANC visit data
        anc_visit_data = {
            'id': anc_visit_id,
            'pregnancy_id': pregnancy_id,
            'visit_number': body['visit_number'],
            'visit_date': body['visit_date'],
            'gestational_age_weeks': body['gestational_age_weeks'],
            'weight_kg': body.get('weight_kg'),
            'bp_systolic': body.get('bp_systolic'),
            'bp_diastolic': body.get('bp_diastolic'),
            'hemoglobin': body.get('hemoglobin'),
            'urine_test': body.get('urine_test'),
            'fundal_height_cm': body.get('fundal_height_cm'),
            'fetal_heart_rate': body.get('fetal_heart_rate'),
            'fetal_movement': body.get('fetal_movement'),
            'edema': body.get('edema', 'NONE'),
            'complaints': body.get('complaints', []),
            'medications_prescribed': body.get('medications_prescribed', []),
            'tests_ordered': body.get('tests_ordered', []),
            'next_visit_date': body.get('next_visit_date'),
            'notes': body.get('notes'),
            'recorded_by': body['recorded_by'],
            'recorded_by_name': body.get('recorded_by_name'),
            'created_at': timestamp
        }
        
        # Save to DynamoDB (using VITAL_SIGNS table for now, or create ANC_VISITS table)
        # For now, we'll use a separate table structure
        table_name = TABLE_NAMES.get('ANC_VISITS', TABLE_NAMES['VITAL_SIGNS'])
        put_item(table_name, anc_visit_data)
        
        log_info(
            "ANC visit recorded successfully",
            anc_visit_id=anc_visit_id,
            pregnancy_id=pregnancy_id,
            visit_number=body['visit_number']
        )
        
        return create_success_response(
            anc_visit_data,
            "ANC visit recorded successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error during ANC visit recording", e)
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
    
    except DatabaseError as e:
        log_error("Database error during ANC visit recording", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during ANC visit recording", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while recording ANC visit",
            {'error': str(e)}
        )
