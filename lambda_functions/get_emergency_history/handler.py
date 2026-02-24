"""
MaatriSahayak - Get Emergency History Lambda Function

Retrieve emergency event history for a pregnancy.
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
    Get emergency history for a pregnancy.
    
    Path Parameters:
    - pregnancy_id: Pregnancy ID
    
    Query Parameters (optional):
    - limit: Maximum number of events (default: 50)
    - sort_order: ASC or DESC (default: DESC)
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancy_id": "preg_xxx",
            "emergencies": [...],
            "count": 3
        },
        "message": "Emergency history retrieved successfully"
    }
    """
    try:
        log_info("Get emergency history request received")
        
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
            raise NotFoundError(f"Pregnancy with ID {pregnancy_id} not found")
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 50))
        sort_order = query_params.get('sort_order', 'DESC').upper()
        
        # Query emergency events
        try:
            emergencies = query_items(
                TABLE_NAMES['EMERGENCY_EVENTS'],
                index_name='pregnancy-events-index',
                key_condition_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                scan_index_forward=(sort_order == 'ASC'),
                limit=limit
            )
        except Exception:
            from shared import scan_items
            emergencies = scan_items(
                TABLE_NAMES['EMERGENCY_EVENTS'],
                filter_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                limit=limit
            )
            emergencies.sort(
                key=lambda x: x.get('triggered_at', ''),
                reverse=(sort_order == 'DESC')
            )
        
        response_data = {
            'pregnancy_id': pregnancy_id,
            'emergencies': emergencies,
            'count': len(emergencies)
        }
        
        log_info("Emergency history retrieved", pregnancy_id=pregnancy_id, count=len(emergencies))
        
        return create_success_response(
            response_data,
            f"Found {len(emergencies)} emergency event(s)"
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
            "An unexpected error occurred while retrieving emergency history",
            {'error': str(e)}
        )
