"""
MaatriSahayak - Update Hospital Capacity Lambda Function

Updates hospital bed availability in real-time.
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
    get_current_timestamp
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Update hospital bed capacity.
    
    Path Parameters:
        id: Hospital ID
    
    Expected Input:
    {
        "available_beds": int (optional),
        "available_maternity_beds": int (optional),
        "available_nicu_beds": int (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "hosp_xxx",
            "available_beds": 20,
            "available_maternity_beds": 5,
            "available_nicu_beds": 2,
            ...
        },
        "message": "Hospital capacity updated successfully"
    }
    """
    try:
        # Get hospital ID from path
        hospital_id = get_path_parameter(event, 'id')
        
        if not hospital_id:
            raise ValidationError("Hospital ID is required", field='id')
        
        log_info("Update hospital capacity request", hospital_id=hospital_id)
        
        # Parse request body
        body = parse_event_body(event)
        
        if not body:
            raise ValidationError("Update data is required")
        
        # Verify hospital exists
        hospital = get_item(TABLE_NAMES['HOSPITALS'], {'id': hospital_id})
        
        if not hospital:
            raise ResourceNotFoundError('Hospital', hospital_id)
        
        # Prepare updates
        updates = {}
        
        # Validate and add available_beds
        if 'available_beds' in body:
            available_beds = body['available_beds']
            if not isinstance(available_beds, int) or available_beds < 0:
                raise ValidationError("available_beds must be a non-negative integer")
            
            if available_beds > hospital['total_beds']:
                raise ValidationError(
                    f"available_beds ({available_beds}) cannot exceed total_beds ({hospital['total_beds']})"
                )
            
            updates['available_beds'] = available_beds
        
        # Validate and add available_maternity_beds
        if 'available_maternity_beds' in body:
            available_maternity_beds = body['available_maternity_beds']
            if not isinstance(available_maternity_beds, int) or available_maternity_beds < 0:
                raise ValidationError("available_maternity_beds must be a non-negative integer")
            
            if available_maternity_beds > hospital['maternity_beds']:
                raise ValidationError(
                    f"available_maternity_beds ({available_maternity_beds}) cannot exceed maternity_beds ({hospital['maternity_beds']})"
                )
            
            updates['available_maternity_beds'] = available_maternity_beds
        
        # Validate and add available_nicu_beds
        if 'available_nicu_beds' in body:
            available_nicu_beds = body['available_nicu_beds']
            if not isinstance(available_nicu_beds, int) or available_nicu_beds < 0:
                raise ValidationError("available_nicu_beds must be a non-negative integer")
            
            if available_nicu_beds > hospital.get('nicu_beds', 0):
                raise ValidationError(
                    f"available_nicu_beds ({available_nicu_beds}) cannot exceed nicu_beds ({hospital.get('nicu_beds', 0)})"
                )
            
            updates['available_nicu_beds'] = available_nicu_beds
        
        if not updates:
            raise ValidationError("No valid capacity fields to update")
        
        # Add updated timestamp
        updates['last_updated'] = get_current_timestamp()
        
        # Update in DynamoDB
        updated_hospital = update_item(
            TABLE_NAMES['HOSPITALS'],
            {'id': hospital_id},
            updates
        )
        
        log_info(
            "Hospital capacity updated successfully",
            hospital_id=hospital_id,
            updates=updates
        )
        
        return create_success_response(
            updated_hospital,
            "Hospital capacity updated successfully"
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
            "An unexpected error occurred while updating hospital capacity",
            {'error': str(e)}
        )
