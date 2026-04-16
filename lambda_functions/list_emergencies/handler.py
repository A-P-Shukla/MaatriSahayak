"""
MaatriSahayak - List Emergencies Lambda Function

List all emergency events with filtering and pagination support.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    scan_items,
    validate_pagination_params
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, PAGINATION
from shared.auth_helper import get_user_from_event


def lambda_handler(event, context):
    """
    List all emergency events with optional filtering.
    
    Query Parameters (optional):
    - status: Filter by emergency status (INITIATED, DISPATCHED, IN_TRANSIT, ARRIVED, COMPLETED)
    - severity_level: Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
    - district: Filter by district
    - start_date: Filter emergencies after this date (ISO format)
    - end_date: Filter emergencies before this date (ISO format)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    
    Returns:
    {
        "success": true,
        "data": {
            "emergencies": [...],
            "pagination": {
                "page": 1,
                "page_size": 20,
                "total_count": 50,
                "has_more": true
            }
        },
        "message": "Found 20 emergency event(s)"
    }
    """
    try:
        log_info("List emergencies request received")
        
        # Get user info and enforce district-based access
        user = get_user_from_event(event)
        user_district = user.get('district')
        user_role = user.get('role', 'ASHA')
        
        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}
        
        status = query_params.get('status')
        severity_level = query_params.get('severity_level')
        start_date = query_params.get('start_date')
        end_date = query_params.get('end_date')
        
        # For non-admin users, enforce their district
        if user_role not in ['ADMIN', 'SUPER_ADMIN']:
            district = user_district
        else:
            # Admins can optionally filter by district
            district = query_params.get('district')
        
        page = int(query_params.get('page', '1'))
        page_size = int(query_params.get('page_size', str(PAGINATION['DEFAULT_PAGE_SIZE'])))
        
        # Validate pagination parameters
        validate_pagination_params(page, page_size)
        
        # Limit page size to maximum
        if page_size > PAGINATION['MAX_PAGE_SIZE']:
            page_size = PAGINATION['MAX_PAGE_SIZE']
        
        # Scan with filters
        emergencies = scan_with_filters(
            status=status,
            severity_level=severity_level,
            district=district,
            start_date=start_date,
            end_date=end_date,
            limit=page_size * page  # Get enough items for pagination
        )
        
        # Sort by triggered_at descending (most recent first)
        emergencies.sort(key=lambda x: x.get('triggered_at', ''), reverse=True)
        
        # Calculate pagination info
        total_count = len(emergencies)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_emergencies = emergencies[start_idx:end_idx]
        has_more = end_idx < total_count
        
        response_data = {
            'emergencies': paginated_emergencies,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'has_more': has_more,
                'returned_count': len(paginated_emergencies)
            }
        }
        
        log_info(
            "Emergencies listed successfully",
            count=len(paginated_emergencies),
            total=total_count,
            status=status,
            severity=severity_level,
            district=district
        )
        
        return create_success_response(
            response_data,
            f"Found {len(paginated_emergencies)} emergency event(s)"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
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
            "An unexpected error occurred while listing emergencies",
            {'error': str(e)}
        )


def scan_with_filters(
    status: str = None,
    severity_level: str = None,
    district: str = None,
    start_date: str = None,
    end_date: str = None,
    limit: int = 100
) -> list:
    """
    Scan emergency events table with optional filters.
    
    Args:
        status: Optional status filter
        severity_level: Optional severity level filter
        district: Optional district filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        limit: Maximum items to return
    
    Returns:
        List of emergency events
    """
    try:
        filter_parts = []
        expression_values = {}
        expression_names = {}
        
        if status:
            filter_parts.append('#status = :status')
            expression_values[':status'] = status
            expression_names['#status'] = 'status'
        
        if severity_level:
            filter_parts.append('severity_level = :severity_level')
            expression_values[':severity_level'] = severity_level
        
        if district:
            filter_parts.append('district = :district')
            expression_values[':district'] = district
        
        if start_date:
            filter_parts.append('triggered_at >= :start_date')
            expression_values[':start_date'] = start_date
        
        if end_date:
            filter_parts.append('triggered_at <= :end_date')
            expression_values[':end_date'] = end_date
        
        filter_expression = ' AND '.join(filter_parts) if filter_parts else None
        
        emergencies = scan_items(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            filter_expression=filter_expression,
            expression_attribute_values=expression_values if expression_values else None,
            expression_attribute_names=expression_names if expression_names else None,
            limit=limit
        )
        
        return emergencies
    
    except Exception as e:
        log_error("Error scanning emergencies", e)
        return []
