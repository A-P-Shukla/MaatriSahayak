"""
MaatriSahayak - List Hospitals Lambda Function

Get list of hospitals by district/type with filtering, sorted by ownership then distance.
"""

import json
import math
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    query_items,
    scan_items
)
from shared.constants import TABLE_NAMES, HTTP_STATUS
from shared.auth_helper import get_user_from_event

# Ownership priority order (lower = higher priority)
OWNERSHIP_ORDER = {
    'GOVERNMENT': 0,
    'GOVT': 0,
    'PUBLIC': 0,
    'MUNICIPALITY': 1,
    'MUNICIPAL': 1,
    'PRIVATE': 2,
    'NGO': 3,
    'TRUST': 3,
}

# Hospital type priority (Government types first)
TYPE_ORDER = {
    'MEDICAL_COLLEGE': 0,
    'DISTRICT': 1,
    'CHC': 2,
    'PHC': 3,
}

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two coordinates."""
    R = 6371
    dlat = math.radians(float(lat2) - float(lat1))
    dlon = math.radians(float(lon2) - float(lon1))
    a = math.sin(dlat/2)**2 + math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def lambda_handler(event, context):
    """
    List hospitals with optional filtering, sorted by ownership type then distance.

    Query Parameters (optional):
    - district: Filter by district
    - type: Filter by hospital type
    - latitude: Patient latitude for distance sorting
    - longitude: Patient longitude for distance sorting
    - limit: Maximum results (default: 50)
    """
    try:
        log_info("List hospitals request received")
        
        # Get user info and enforce district-based access
        user = get_user_from_event(event)
        user_district = user.get('district')
        user_role = user.get('role', 'ASHA')

        query_params = event.get('queryStringParameters') or {}
        hospital_type = query_params.get('type')
        has_blood_bank = query_params.get('has_blood_bank')
        has_nicu      = query_params.get('has_nicu')
        limit         = int(query_params.get('limit', 50))
        pat_lat       = query_params.get('latitude')
        pat_lon       = query_params.get('longitude')
        
        # For non-admin users, enforce their district
        if user_role not in ['ADMIN', 'SUPER_ADMIN']:
            district = user_district
        else:
            # Admins can optionally filter by district
            district = query_params.get('district')

        hospitals = []

        # Try district+type GSI first
        if district and hospital_type:
            try:
                hospitals = query_items(
                    TABLE_NAMES['HOSPITALS'],
                    index_name='district-type-index',
                    key_condition_expression='district = :district AND #type = :type',
                    expression_attribute_values={':district': district, ':type': hospital_type},
                    expression_attribute_names={'#type': 'type'},
                    limit=limit
                )
            except Exception:
                pass
        elif district:
            try:
                hospitals = query_items(
                    TABLE_NAMES['HOSPITALS'],
                    index_name='district-type-index',
                    key_condition_expression='district = :district',
                    expression_attribute_values={':district': district},
                    limit=limit
                )
            except Exception:
                pass

        # Always fall back to full scan — district filter may yield nothing
        if not hospitals:
            filter_expressions = []
            expression_values  = {}
            expression_names   = {}

            if district:
                filter_expressions.append('district = :district')
                expression_values[':district'] = district
            if hospital_type:
                filter_expressions.append('#type = :type')
                expression_values[':type'] = hospital_type
                expression_names['#type'] = 'type'

            hospitals = scan_items(
                TABLE_NAMES['HOSPITALS'],
                filter_expression=' AND '.join(filter_expressions) if filter_expressions else None,
                expression_attribute_values=expression_values if expression_values else None,
                expression_attribute_names=expression_names if expression_names else None,
                limit=limit
            )

        # Additional filters
        if has_blood_bank:
            hospitals = [h for h in hospitals if h.get('has_blood_bank') == (has_blood_bank.lower() == 'true')]
        if has_nicu:
            hospitals = [h for h in hospitals if h.get('nicu_beds', 0) > 0]

        # Attach distance if patient coordinates provided
        if pat_lat and pat_lon:
            for h in hospitals:
                try:
                    h['distance_km'] = round(haversine(pat_lat, pat_lon, h['latitude'], h['longitude']), 1)
                    h['estimated_time_minutes'] = int(h['distance_km'] / 40 * 60)
                except Exception:
                    h['distance_km'] = None
                    h['estimated_time_minutes'] = None

        # Sort: ownership priority → type priority → distance
        def sort_key(h):
            ownership = (h.get('ownership_type') or h.get('ownership') or 'PRIVATE').upper()
            own_order  = OWNERSHIP_ORDER.get(ownership, 2)
            type_order = TYPE_ORDER.get((h.get('type') or '').upper(), 9)
            dist       = h.get('distance_km') or 999
            return (own_order, type_order, dist)

        hospitals.sort(key=sort_key)

        response_data = {'hospitals': hospitals, 'count': len(hospitals)}

        log_info("Hospitals listed", count=len(hospitals), district=district)

        return create_success_response(
            response_data,
            f"Found {len(hospitals)} hospital(s)"
        )

    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'], "InternalServerError",
            "An unexpected error occurred while listing hospitals", {'error': str(e)}
        )

