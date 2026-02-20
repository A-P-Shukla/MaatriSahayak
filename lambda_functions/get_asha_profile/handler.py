"""
MaatriSahayak - Get ASHA Profile Lambda Function

Retrieves ASHA worker profile details.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    get_path_parameter,
    log_info,
    log_error,
    get_item,
    query_items
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, GSI_NAMES


def lambda_handler(event, context):
    """
    Get ASHA worker profile details.
    
    Path Parameters:
        id: ASHA worker ID
    
    Query Parameters:
        include_stats: "true" to include statistics (default: false)
    
    Returns:
    {
        "success": true,
        "data": {
            "asha": {...},
            "stats": {
                "total_pregnancies": 25,
                "active_pregnancies": 18,
                "high_risk_pregnancies": 3,
                "emergencies_handled": 2
            }
        }
    }
    """
    try:
        # Get ASHA worker ID from path
        asha_id = get_path_parameter(event, 'id')
        
        if not asha_id:
            raise ValidationError("ASHA worker ID is required", field='id')
        
        log_info("Get ASHA profile request", asha_id=asha_id)
        
        # Get ASHA worker from DynamoDB
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        asha = get_item(table_name, {'id': asha_id})
        
        if not asha:
            raise ResourceNotFoundError('ASHA Worker', asha_id)
        
        # Check if stats should be included
        query_params = event.get('queryStringParameters') or {}
        include_stats = query_params.get('include_stats', 'false').lower() == 'true'
        
        response_data = {
            'asha': asha
        }
        
        # Get statistics if requested
        if include_stats:
            stats = get_asha_statistics(asha_id)
            response_data['stats'] = stats
        
        log_info(
            "ASHA profile retrieved successfully",
            asha_id=asha_id,
            include_stats=include_stats
        )
        
        return create_success_response(response_data)
    
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
            "An unexpected error occurred while retrieving ASHA profile",
            {'error': str(e)}
        )


def get_asha_statistics(asha_id: str) -> dict:
    """
    Get statistics for ASHA worker.
    
    Args:
        asha_id: ASHA worker ID
    
    Returns:
        Statistics dictionary
    """
    try:
        # Query pregnancies managed by this ASHA worker
        pregnancies = query_items(
            TABLE_NAMES['PREGNANCIES'],
            key_condition_expression='asha_worker_id = :asha_id',
            expression_attribute_values={':asha_id': asha_id},
            index_name=GSI_NAMES.get('ASHA_WORKER_INDEX', 'asha-worker-index')
        )
        
        # Calculate statistics
        total_pregnancies = len(pregnancies)
        active_pregnancies = len([p for p in pregnancies if p.get('status') == 'ACTIVE'])
        high_risk_pregnancies = len([p for p in pregnancies if p.get('risk_level') in ['HIGH', 'CRITICAL']])
        
        # Query emergencies handled
        emergencies = query_items(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            key_condition_expression='triggered_by = :asha_id',
            expression_attribute_values={':asha_id': asha_id},
            index_name=GSI_NAMES.get('TRIGGERED_BY_INDEX', 'triggered-by-index')
        )
        
        return {
            'total_pregnancies': total_pregnancies,
            'active_pregnancies': active_pregnancies,
            'high_risk_pregnancies': high_risk_pregnancies,
            'emergencies_handled': len(emergencies),
            'delivered': len([p for p in pregnancies if p.get('status') == 'DELIVERED'])
        }
    
    except Exception as e:
        log_error("Error fetching ASHA statistics", e, asha_id=asha_id)
        return {
            'total_pregnancies': 0,
            'active_pregnancies': 0,
            'high_risk_pregnancies': 0,
            'emergencies_handled': 0,
            'delivered': 0
        }
