"""
MaatriSahayak - Get ANC History Lambda Function

Retrieve ANC visit history for a pregnancy.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    get_item,
    query_items,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Get ANC visit history for a pregnancy.
    
    Path Parameters:
    - pregnancy_id: Pregnancy ID
    
    Query Parameters (optional):
    - limit: Maximum number of visits to return (default: 50)
    - sort_order: ASC or DESC (default: DESC - most recent first)
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancy_id": "preg_xxx",
            "visits": [
                {
                    "id": "anc_xxx",
                    "visit_number": 1,
                    "visit_date": "...",
                    ...
                }
            ],
            "count": 5
        },
        "message": "ANC history retrieved successfully"
    }
    """
    try:
        log_info("Get ANC history request received")
        
        # Get pregnancy_id from path parameters
        pregnancy_id = None
        if 'pathParameters' in event and event['pathParameters']:
            pregnancy_id = event['pathParameters'].get('pregnancy_id') or event['pathParameters'].get('id')
        
        if not pregnancy_id:
            raise ValidationError(
                "Missing required parameter: pregnancy_id",
                field='pregnancy_id'
            )
        
        # Check if pregnancy exists
        pregnancy = get_item(
            TABLE_NAMES['PREGNANCIES'],
            {'id': pregnancy_id}
        )
        
        if not pregnancy:
            raise NotFoundError(
                f"Pregnancy with ID {pregnancy_id} not found"
            )
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 50))
        sort_order = query_params.get('sort_order', 'DESC').upper()
        
        # Query ANC visits for this pregnancy
        # Using VITAL_SIGNS table for now (or ANC_VISITS if created)
        table_name = TABLE_NAMES.get('ANC_VISITS', TABLE_NAMES['VITAL_SIGNS'])
        
        try:
            anc_visits = query_items(
                table_name,
                index_name='pregnancy-events-index',
                key_condition_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                scan_index_forward=(sort_order == 'ASC'),
                limit=limit
            )
        except Exception:
            # Fallback to scan if query fails
            from shared import scan_items
            anc_visits = scan_items(
                table_name,
                filter_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                limit=limit
            )
            # Sort by visit_date
            anc_visits.sort(
                key=lambda x: x.get('visit_date', ''),
                reverse=(sort_order == 'DESC')
            )
        
        # Filter only ANC visit records (if stored in VITAL_SIGNS table)
        anc_visits = [v for v in anc_visits if v.get('id', '').startswith('anc_')]
        
        response_data = {
            'pregnancy_id': pregnancy_id,
            'visits': anc_visits,
            'count': len(anc_visits)
        }
        
        log_info(
            "ANC history retrieved successfully",
            pregnancy_id=pregnancy_id,
            visit_count=len(anc_visits)
        )
        
        return create_success_response(
            response_data,
            f"Found {len(anc_visits)} ANC visit(s)"
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
            "An unexpected error occurred while retrieving ANC history",
            {'error': str(e)}
        )
