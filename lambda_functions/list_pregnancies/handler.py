"""
MaatriSahayak - List Pregnancies Lambda Function

Lists pregnancies with filtering, pagination, and sorting support.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    get_query_parameter,
    log_info,
    log_error,
    scan_items,
    query_items,
    validate_pagination_params
)
from shared.constants import TABLE_NAMES, GSI_NAMES, HTTP_STATUS, PAGINATION
from shared.auth_helper import get_user_from_event


def lambda_handler(event, context):
    """
    List pregnancies with filtering and pagination.
    
    Query Parameters:
        asha_worker_id: Filter by ASHA worker (optional)
        district: Filter by district (optional)
        risk_level: Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL) (optional)
        status: Filter by status (ACTIVE, DELIVERED, etc.) (optional)
        page: Page number (default: 1)
        page_size: Items per page (default: 20, max: 100)
        sort_by: Sort field (default: created_at)
        sort_order: asc or desc (default: desc)
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancies": [...],
            "pagination": {
                "page": 1,
                "page_size": 20,
                "total_count": 100,
                "has_more": true
            }
        }
    }
    """
    try:
        log_info("List pregnancies request received")
        
        # Parse query parameters first
        query_params = event.get('queryStringParameters') or {}
        
        asha_worker_id = query_params.get('asha_worker_id')
        risk_level = query_params.get('risk_level')
        # Normalize risk_level to uppercase for consistency with backend storage
        if risk_level:
            risk_level = risk_level.upper()
        status = query_params.get('status')
        # Normalize status to uppercase for consistency
        if status:
            status = status.upper()
        district = query_params.get('district')
        
        # Try to get user info for role-based filtering (optional for testing)
        user_district = None
        user_role = None
        try:
            user = get_user_from_event(event)
            user_district = user.get('district')
            user_role = user.get('role', 'ASHA')
            user_id = user.get('user_id')
            
            log_info("User info extracted", user_role=user_role, user_district=user_district)
            
            # For ASHA workers, enforce they only see their own registered patients
            if user_role == 'ASHA':
                # Get ASHA worker record to find their village/block
                try:
                    asha_worker = get_asha_worker_by_user_id(user_id)
                    if asha_worker:
                        asha_worker_id = asha_worker.get('id')
                        log_info("ASHA worker found", asha_worker_id=asha_worker_id)
                    else:
                        log_info("ASHA worker not found for user_id", user_id=user_id)
                except Exception as e:
                    log_error("Error fetching ASHA worker", e)
                district = user_district
            elif user_role not in ['ADMIN', 'SUPER_ADMIN']:
                # For non-admin users, enforce their district
                if not district:
                    district = user_district
        except Exception as auth_error:
            log_info("No auth token provided, allowing public access for testing")
            # Continue without user-based filtering if auth fails
            pass
        
        page = int(query_params.get('page', '1'))
        page_size = int(query_params.get('page_size', str(PAGINATION['DEFAULT_PAGE_SIZE'])))
        
        # Validate pagination parameters
        validate_pagination_params(page, page_size)
        
        # Limit page size to maximum
        if page_size > PAGINATION['MAX_PAGE_SIZE']:
            page_size = PAGINATION['MAX_PAGE_SIZE']
        
        # Determine query strategy based on filters
        if asha_worker_id:
            # Use GSI for ASHA worker filter
            pregnancies = query_by_asha_worker(
                asha_worker_id,
                status,
                risk_level,
                page_size * 10  # Get more for pagination
            )
        elif district and risk_level:
            # Use GSI for district + risk level filter
            pregnancies = query_by_district_risk(
                district,
                risk_level,
                status,
                page_size * 10
            )
        else:
            # Use scan with filters
            pregnancies = scan_with_filters(
                district,
                risk_level,
                status,
                page_size * 10
            )
        
        # Ensure pregnancies is a list
        if pregnancies is None:
            pregnancies = []
        
        # Normalize field names for consistency (handle both 'name' and 'patient_name')
        for pregnancy in pregnancies:
            # Ensure patient_name field exists (some old records might use 'name')
            if 'patient_name' not in pregnancy and 'name' in pregnancy:
                pregnancy['patient_name'] = pregnancy['name']
            # Ensure pregnancy_id field exists (some records might use 'id')
            if 'pregnancy_id' not in pregnancy and 'id' in pregnancy:
                pregnancy['pregnancy_id'] = pregnancy['id']
            # Normalize risk_category field (backend uses risk_level)
            if 'risk_category' not in pregnancy and 'risk_level' in pregnancy:
                pregnancy['risk_category'] = pregnancy['risk_level'].lower() if pregnancy['risk_level'] else 'low'
            # Normalize current_status field (backend uses status)
            if 'current_status' not in pregnancy and 'status' in pregnancy:
                pregnancy['current_status'] = pregnancy['status'].lower() if pregnancy['status'] else 'active'
            
            # Calculate risk_score if not present (map risk_level to numeric score)
            if 'risk_score' not in pregnancy or pregnancy.get('risk_score') == 0:
                risk_level_upper = (pregnancy.get('risk_level') or 'LOW').upper()
                risk_score_map = {
                    'CRITICAL': 85,
                    'HIGH': 70,
                    'MEDIUM': 50,
                    'LOW': 25
                }
                pregnancy['risk_score'] = risk_score_map.get(risk_level_upper, 25)
        
        # Calculate pagination info
        total_count = len(pregnancies)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_pregnancies = pregnancies[start_idx:end_idx]
        has_more = end_idx < total_count
        
        response_data = {
            'pregnancies': paginated_pregnancies,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'has_more': has_more,
                'returned_count': len(paginated_pregnancies)
            }
        }
        
        log_info(
            "Pregnancies listed successfully",
            count=len(paginated_pregnancies),
            total=total_count,
            asha_worker_id=asha_worker_id,
            district=district
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
            "An unexpected error occurred while listing pregnancies",
            {'error': str(e)}
        )


def query_by_asha_worker(
    asha_worker_id: str,
    status: str = None,
    risk_level: str = None,
    limit: int = 100
) -> list:
    """
    Query pregnancies by ASHA worker using GSI.
    
    Args:
        asha_worker_id: ASHA worker ID
        status: Optional status filter
        risk_level: Optional risk level filter
        limit: Maximum items to return
    
    Returns:
        List of pregnancies
    """
    try:
        # Build filter expression
        filter_parts = []
        expression_values = {':worker_id': asha_worker_id}
        expression_names = {}
        
        if status:
            filter_parts.append('#status = :status')
            expression_values[':status'] = status
            expression_names['#status'] = 'status'
        
        if risk_level:
            filter_parts.append('risk_level = :risk_level')
            expression_values[':risk_level'] = risk_level
        
        filter_expression = ' AND '.join(filter_parts) if filter_parts else None
        
        pregnancies = query_items(
            TABLE_NAMES['PREGNANCIES'],
            key_condition_expression='asha_worker_id = :worker_id',
            expression_attribute_values=expression_values,
            expression_attribute_names=expression_names if expression_names else None,
            index_name=GSI_NAMES['ASHA_WORKER_INDEX'],
            filter_expression=filter_expression,
            limit=limit,
            scan_forward=False
        )
        
        return pregnancies
    
    except Exception as e:
        log_error("Error querying by ASHA worker", e, asha_worker_id=asha_worker_id)
        return []


def query_by_district_risk(
    district: str,
    risk_level: str,
    status: str = None,
    limit: int = 100
) -> list:
    """
    Query pregnancies by district and risk level using GSI.
    Note: GSI queries require exact match, so we fall back to scan for partial matches.
    
    Args:
        district: District name
        risk_level: Risk level
        status: Optional status filter
        limit: Maximum items to return
    
    Returns:
        List of pregnancies
    """
    try:
        # Try exact match first with GSI
        expression_values = {
            ':district': district,
            ':risk_level': risk_level
        }
        expression_names = {}
        filter_expression = None
        
        if status:
            filter_expression = '#status = :status'
            expression_values[':status'] = status
            expression_names['#status'] = 'status'
        
        pregnancies = query_items(
            TABLE_NAMES['PREGNANCIES'],
            key_condition_expression='district = :district AND risk_level = :risk_level',
            expression_attribute_values=expression_values,
            expression_attribute_names=expression_names if expression_names else None,
            index_name=GSI_NAMES['DISTRICT_RISK_INDEX'],
            filter_expression=filter_expression,
            limit=limit,
            scan_forward=False
        )
        
        # If no results with exact match, try partial match with scan
        if not pregnancies:
            log_info("No exact district match, trying partial match", district=district)
            pregnancies = scan_with_filters(district, risk_level, status, limit)
        
        return pregnancies
    
    except Exception as e:
        log_error("Error querying by district and risk", e, district=district)
        # Fallback to scan on error
        return scan_with_filters(district, risk_level, status, limit)


def scan_with_filters(
    district: str = None,
    risk_level: str = None,
    status: str = None,
    limit: int = 100
) -> list:
    """
    Scan pregnancies table with optional filters.
    
    Args:
        district: Optional district filter
        risk_level: Optional risk level filter
        status: Optional status filter
        limit: Maximum items to return
    
    Returns:
        List of pregnancies
    """
    try:
        filter_parts = []
        expression_values = {}
        expression_names = {}
        
        if district:
            # Normalize district name (Kanpur and Kanpur Nagar are the same)
            district_normalized = district.replace(' Nagar', '').replace(' nagar', '').strip()
            # Use contains for district to handle variations like "Kanpur" vs "Kanpur Nagar"
            filter_parts.append('contains(district, :district)')
            expression_values[':district'] = district_normalized
        
        if risk_level:
            filter_parts.append('risk_level = :risk_level')
            expression_values[':risk_level'] = risk_level
        
        if status:
            filter_parts.append('#status = :status')
            expression_values[':status'] = status
            expression_names['#status'] = 'status'
        
        filter_expression = ' AND '.join(filter_parts) if filter_parts else None
        
        pregnancies = scan_items(
            TABLE_NAMES['PREGNANCIES'],
            filter_expression=filter_expression,
            expression_attribute_values=expression_values if expression_values else None,
            expression_attribute_names=expression_names if expression_names else None,
            limit=limit
        )
        
        return pregnancies
    
    except Exception as e:
        log_error("Error scanning pregnancies", e)
        return []


def get_asha_worker_by_user_id(user_id: str) -> dict:
    """
    Get ASHA worker record by Cognito user ID.
    
    Args:
        user_id: Cognito user ID (sub)
    
    Returns:
        ASHA worker record or None
    """
    try:
        workers = scan_items(
            TABLE_NAMES['ASHA_WORKERS'],
            filter_expression='cognito_user_id = :user_id',
            expression_attribute_values={':user_id': user_id},
            limit=1
        )
        return workers[0] if workers else None
    except Exception as e:
        log_error("Error fetching ASHA worker by user_id", e, user_id=user_id)
        return None
