"""
MaatriSahayak - Get Vitals History Lambda Function

Retrieve vital signs history for a pregnancy.
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
    query_items
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Get vital signs history for a pregnancy.
    
    Path Parameters:
    - pregnancy_id: Pregnancy ID
    
    Query Parameters (optional):
    - limit: Maximum number of records (default: 50)
    - sort_order: ASC or DESC (default: DESC)
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancy_id": "preg_xxx",
            "vitals": [...],
            "count": 10
        },
        "message": "Vitals history retrieved successfully"
    }
    """
    try:
        log_info("Get vitals history request received")
        
        # Get pregnancy_id from path
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
        
        # Query vitals for this pregnancy
        try:
            vitals = query_items(
                TABLE_NAMES['VITAL_SIGNS'],
                index_name='pregnancy-events-index',
                key_condition_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                scan_index_forward=(sort_order == 'ASC'),
                limit=limit
            )
        except Exception:
            # Fallback to scan
            from shared import scan_items
            vitals = scan_items(
                TABLE_NAMES['VITAL_SIGNS'],
                filter_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                limit=limit
            )
            vitals.sort(
                key=lambda x: x.get('recorded_at', ''),
                reverse=(sort_order == 'DESC')
            )
        
        response_data = {
            'pregnancy_id': pregnancy_id,
            'vitals': vitals,
            'count': len(vitals)
        }
        
        log_info(
            "Vitals history retrieved successfully",
            pregnancy_id=pregnancy_id,
            vitals_count=len(vitals)
        )
        
        return create_success_response(
            response_data,
            f"Found {len(vitals)} vital sign record(s)"
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
            "An unexpected error occurred while retrieving vitals history",
            {'error': str(e)}
        )
