"""
MaatriSahayak - Get Pregnancy Details Lambda Function

Retrieves detailed information about a specific pregnancy including recent vitals.
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
from shared.constants import TABLE_NAMES, GSI_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Get detailed information about a pregnancy.
    
    Path Parameters:
        id: Pregnancy ID
    
    Query Parameters:
        include_vitals: "true" to include recent vital signs (default: true)
        vitals_limit: Number of recent vitals to include (default: 10)
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancy": {...},
            "recent_vitals": [...] (if include_vitals=true)
        }
    }
    """
    try:
        # Get pregnancy ID from path
        pregnancy_id = get_path_parameter(event, 'id')
        
        if not pregnancy_id:
            raise ValidationError("Pregnancy ID is required", field='id')
        
        log_info("Get pregnancy details request", pregnancy_id=pregnancy_id)
        
        # Get pregnancy from DynamoDB
        pregnancy = get_item(TABLE_NAMES['PREGNANCIES'], {'id': pregnancy_id})
        
        if not pregnancy:
            raise ResourceNotFoundError('Pregnancy', pregnancy_id)
        
        # Check if vitals should be included
        query_params = event.get('queryStringParameters') or {}
        include_vitals = query_params.get('include_vitals', 'true').lower() == 'true'
        vitals_limit = int(query_params.get('vitals_limit', '10'))
        
        response_data = {
            'pregnancy': pregnancy
        }
        
        # Get recent vital signs if requested
        if include_vitals:
            recent_vitals = get_recent_vitals(pregnancy_id, vitals_limit)
            response_data['recent_vitals'] = recent_vitals
            response_data['vitals_count'] = len(recent_vitals)
        
        log_info(
            "Pregnancy details retrieved successfully",
            pregnancy_id=pregnancy_id,
            include_vitals=include_vitals
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
            "An unexpected error occurred while retrieving pregnancy details",
            {'error': str(e)}
        )


def get_recent_vitals(pregnancy_id: str, limit: int = 10) -> list:
    """
    Get recent vital signs for a pregnancy.
    
    Args:
        pregnancy_id: Pregnancy ID
        limit: Maximum number of vitals to return
    
    Returns:
        List of recent vital signs (sorted by recorded_at descending)
    """
    try:
        vitals = query_items(
            TABLE_NAMES['VITAL_SIGNS'],
            key_condition_expression='pregnancy_id = :pregnancy_id',
            expression_attribute_values={':pregnancy_id': pregnancy_id},
            index_name=GSI_NAMES['PREGNANCY_EVENTS_INDEX'],
            limit=limit,
            scan_forward=False  # Descending order (most recent first)
        )
        
        return vitals
    
    except Exception as e:
        log_error("Error fetching recent vitals", e, pregnancy_id=pregnancy_id)
        return []
