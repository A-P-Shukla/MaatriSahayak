"""
MaatriSahayak - Update ASHA Profile Lambda Function

Updates ASHA worker profile information.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    get_path_parameter,
    log_info,
    log_error,
    get_item,
    update_item,
    get_current_timestamp,
    validate_phone_number
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Update ASHA worker profile.
    
    Path Parameters:
        id: ASHA worker ID
    
    Expected Input:
    {
        "name": "string" (optional),
        "phone": "string" (optional),
        "email": "string" (optional),
        "qualification": "string" (optional),
        "experience_years": int (optional),
        "languages": ["string"] (optional),
        "status": "string" (optional - ACTIVE, INACTIVE, SUSPENDED)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "asha_xxx",
            "name": "...",
            ...
        },
        "message": "ASHA profile updated successfully"
    }
    """
    try:
        # Get ASHA worker ID from path
        asha_id = get_path_parameter(event, 'id')
        
        if not asha_id:
            raise ValidationError("ASHA worker ID is required", field='id')
        
        log_info("Update ASHA profile request", asha_id=asha_id)
        
        # Parse request body
        body = parse_event_body(event)
        
        if not body:
            raise ValidationError("Update data is required")
        
        # Verify ASHA worker exists
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        asha = get_item(table_name, {'id': asha_id})
        
        if not asha:
            raise ResourceNotFoundError('ASHA Worker', asha_id)
        
        # Validate phone if provided
        if 'phone' in body:
            validate_phone_number(body['phone'])
        
        # Validate status if provided
        if 'status' in body:
            valid_statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED']
            if body['status'] not in valid_statuses:
                raise ValidationError(
                    f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
                    field='status'
                )
        
        # Prepare updates
        updates = {}
        updatable_fields = [
            'name', 'phone', 'email', 'qualification',
            'experience_years', 'languages', 'status'
        ]
        
        for field in updatable_fields:
            if field in body:
                updates[field] = body[field]
        
        if not updates:
            raise ValidationError("No valid fields to update")
        
        # Add updated timestamp
        updates['updated_at'] = get_current_timestamp()
        
        # Update in DynamoDB
        updated_asha = update_item(
            table_name,
            {'id': asha_id},
            updates
        )
        
        log_info(
            "ASHA profile updated successfully",
            asha_id=asha_id,
            fields_updated=len(updates)
        )
        
        return create_success_response(
            updated_asha,
            "ASHA profile updated successfully"
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
        log_error("ASHA worker not found", e)
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
            "An unexpected error occurred while updating ASHA profile",
            {'error': str(e)}
        )
