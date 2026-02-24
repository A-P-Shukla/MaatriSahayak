"""
MaatriSahayak - Update Pregnancy Lambda Function

Update pregnancy information in the system.
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
    update_item,
    get_current_timestamp,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, PREGNANCY_STATUS


def lambda_handler(event, context):
    """
    Update pregnancy information.
    
    Expected Input:
    {
        "pregnancy_id": "string",
        "status": "string" (optional - ACTIVE, DELIVERED, TERMINATED, TRANSFERRED),
        "risk_level": "string" (optional - LOW, MEDIUM, HIGH, CRITICAL),
        "risk_score": int (optional),
        "gestational_age_weeks": int (optional),
        "chronic_conditions": ["string"] (optional),
        "notes": "string" (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "preg_xxx",
            ...updated fields...
        },
        "message": "Pregnancy updated successfully"
    }
    """
    try:
        log_info("Update pregnancy request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Get pregnancy_id from path parameters or body
        pregnancy_id = None
        if 'pathParameters' in event and event['pathParameters']:
            pregnancy_id = event['pathParameters'].get('id')
        if not pregnancy_id:
            pregnancy_id = body.get('pregnancy_id')
        
        if not pregnancy_id:
            raise ValidationError(
                "Missing required field: pregnancy_id",
                field='pregnancy_id'
            )
        
        # Check if pregnancy exists
        existing_pregnancy = get_item(
            TABLE_NAMES['PREGNANCIES'],
            {'id': pregnancy_id}
        )
        
        if not existing_pregnancy:
            raise NotFoundError(
                f"Pregnancy with ID {pregnancy_id} not found"
            )
        
        # Prepare update expression
        update_expression_parts = []
        expression_attribute_values = {}
        expression_attribute_names = {}
        
        # Build update expression dynamically
        updatable_fields = {
            'status': 'status',
            'risk_level': 'risk_level',
            'risk_score': 'risk_score',
            'gestational_age_weeks': 'gestational_age_weeks',
            'chronic_conditions': 'chronic_conditions',
            'notes': 'notes',
            'block': 'block',
            'latitude': 'latitude',
            'longitude': 'longitude'
        }
        
        for field, db_field in updatable_fields.items():
            if field in body:
                # Validate status if provided
                if field == 'status' and body[field] not in PREGNANCY_STATUS:
                    raise ValidationError(
                        f"Invalid status. Must be one of: {', '.join(PREGNANCY_STATUS.keys())}",
                        field='status'
                    )
                
                update_expression_parts.append(f"#{db_field} = :{db_field}")
                expression_attribute_names[f"#{db_field}"] = db_field
                expression_attribute_values[f":{db_field}"] = body[field]
        
        # Always update the updated_at timestamp
        update_expression_parts.append("#updated_at = :updated_at")
        expression_attribute_names["#updated_at"] = "updated_at"
        expression_attribute_values[":updated_at"] = get_current_timestamp()
        
        if not update_expression_parts:
            raise ValidationError(
                "No valid fields provided for update"
            )
        
        update_expression = "SET " + ", ".join(update_expression_parts)
        
        # Update pregnancy in DynamoDB
        updated_pregnancy = update_item(
            TABLE_NAMES['PREGNANCIES'],
            {'id': pregnancy_id},
            update_expression,
            expression_attribute_values,
            expression_attribute_names
        )
        
        log_info(
            "Pregnancy updated successfully",
            pregnancy_id=pregnancy_id,
            updated_fields=list(updatable_fields.keys())
        )
        
        return create_success_response(
            updated_pregnancy,
            "Pregnancy updated successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error during pregnancy update", e)
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
        log_error("Database error during pregnancy update", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during pregnancy update", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while updating pregnancy",
            {'error': str(e)}
        )
