"""
MaatriSahayak - Get Risk Trends Lambda Function

Time-series risk analysis for a pregnancy.
"""

import json
from datetime import datetime, timedelta
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
    Get risk trend analysis for a pregnancy.
    
    Path Parameters:
    - pregnancy_id: Pregnancy ID
    
    Query Parameters (optional):
    - days: Number of days to analyze (default: 30)
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancy_id": "preg_xxx",
            "current_risk_level": "MEDIUM",
            "current_risk_score": 45,
            "trend": "INCREASING",
            "risk_history": [...],
            "analysis_period_days": 30
        },
        "message": "Risk trends retrieved successfully"
    }
    """
    try:
        log_info("Get risk trends request received")
        
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
        days = int(query_params.get('days', 30))
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Query vitals to track risk changes
        try:
            vitals = query_items(
                TABLE_NAMES['VITAL_SIGNS'],
                index_name='pregnancy-events-index',
                key_condition_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                },
                scan_index_forward=True
            )
        except Exception:
            from shared import scan_items
            vitals = scan_items(
                TABLE_NAMES['VITAL_SIGNS'],
                filter_expression='pregnancy_id = :pregnancy_id',
                expression_attribute_values={
                    ':pregnancy_id': pregnancy_id
                }
            )
            vitals.sort(key=lambda x: x.get('recorded_at', ''))
        
        # Analyze risk trend
        risk_scores = [v.get('risk_score', 0) for v in vitals if v.get('risk_score')]
        
        trend = "STABLE"
        if len(risk_scores) >= 2:
            recent_avg = sum(risk_scores[-3:]) / len(risk_scores[-3:])
            older_avg = sum(risk_scores[:3]) / min(3, len(risk_scores))
            
            if recent_avg > older_avg + 10:
                trend = "INCREASING"
            elif recent_avg < older_avg - 10:
                trend = "DECREASING"
        
        response_data = {
            'pregnancy_id': pregnancy_id,
            'current_risk_level': pregnancy.get('risk_level', 'LOW'),
            'current_risk_score': pregnancy.get('risk_score', 0),
            'trend': trend,
            'risk_history': vitals[-10:],  # Last 10 records
            'analysis_period_days': days
        }
        
        log_info(
            "Risk trends retrieved successfully",
            pregnancy_id=pregnancy_id,
            trend=trend
        )
        
        return create_success_response(
            response_data,
            "Risk trends retrieved successfully"
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
            "An unexpected error occurred while retrieving risk trends",
            {'error': str(e)}
        )
