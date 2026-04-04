"""
MaatriSahayak - Update Hospital Capacity Lambda Function

Updates hospital bed availability in real-time.
"""

import json
import traceback
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
        # Log incoming request for debugging
        log_info("Update hospital capacity - incoming request", 
                 path_params=event.get('pathParameters'),
                 has_body=bool(event.get('body')))
        
        # Get hospital ID from path
        hospital_id = get_path_parameter(event, 'id')
        
        if not hospital_id:
            log_error("Hospital ID missing from path", 
                     path_parameters=event.get('pathParameters'))
            raise ValidationError("Hospital ID is required in the URL path", field='id')
        
        log_info("Processing capacity update", hospital_id=hospital_id)
        
        # Parse request body
        body = parse_event_body(event)
        
        if not body:
            raise ValidationError("Update data is required")
        
        # Verify hospital exists
        hospital = get_item(TABLE_NAMES['HOSPITALS'], {'id': hospital_id})
        
        if not hospital:
            raise ResourceNotFoundError('Hospital', hospital_id)
        
        # Log hospital data for debugging
        log_info("Hospital data retrieved", 
                 hospital_id=hospital_id,
                 has_maternity_beds='maternity_beds' in hospital,
                 has_total_maternity_beds='total_maternity_beds' in hospital,
                 has_capacity='capacity' in hospital,
                 has_total_beds='total_beds' in hospital)
        
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
            
            # Try different field names for total capacity
            total_capacity = (
                hospital.get('maternity_beds') or 
                hospital.get('total_maternity_beds') or 
                hospital.get('capacity') or 
                hospital.get('total_beds')
            )
            
            # Only validate against total capacity if we have it
            if total_capacity is not None and available_maternity_beds > total_capacity:
                raise ValidationError(
                    f"available_maternity_beds ({available_maternity_beds}) cannot exceed total capacity ({total_capacity})"
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
        log_error("Unexpected error in update hospital capacity", 
                 error=str(e),
                 error_type=type(e).__name__,
                 traceback=traceback.format_exc(),
                 hospital_id=locals().get('hospital_id'),
                 event_path=event.get('path'),
                 event_method=event.get('httpMethod'))
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while updating hospital capacity",
            {'error': str(e), 'type': type(e).__name__}
        )
