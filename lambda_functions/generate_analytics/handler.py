"""
MaatriSahayak - Generate Analytics Lambda Function

Generate dashboard metrics and KPIs.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    scan_items
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Generate analytics and dashboard metrics.
    
    Query Parameters (optional):
    - district: Filter by district
    - date_from: Start date (YYYY-MM-DD)
    - date_to: End date (YYYY-MM-DD)
    
    Returns:
    {
        "success": true,
        "data": {
            "total_pregnancies": 150,
            "active_pregnancies": 120,
            "high_risk_count": 25,
            "emergency_count": 10,
            "ambulance_utilization": 75.5,
            "hospital_capacity": {...}
        },
        "message": "Analytics generated successfully"
    }
    """
    try:
        log_info("Generate analytics request received")
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        district = query_params.get('district')
        
        # Get all pregnancies
        filter_expr = None
        expr_values = None
        
        if district:
            filter_expr = 'district = :district'
            expr_values = {':district': district}
        
        pregnancies = scan_items(
            TABLE_NAMES['PREGNANCIES'],
            filter_expression=filter_expr,
            expression_attribute_values=expr_values
        )
        
        # Calculate metrics
        total_pregnancies = len(pregnancies)
        active_pregnancies = len([p for p in pregnancies if p.get('status') == 'ACTIVE'])
        high_risk_count = len([p for p in pregnancies if p.get('risk_level') in ['HIGH', 'CRITICAL']])
        
        # Get emergency events
        emergencies = scan_items(TABLE_NAMES['EMERGENCY_EVENTS'])
        emergency_count = len(emergencies)
        active_emergencies = len([e for e in emergencies if e.get('status') != 'COMPLETED'])
        
        # Get ambulances
        ambulances = scan_items(TABLE_NAMES['AMBULANCES'])
        total_ambulances = len(ambulances)
        busy_ambulances = len([a for a in ambulances if a.get('status') in ['EN_ROUTE', 'AT_SCENE']])
        ambulance_utilization = (busy_ambulances / total_ambulances * 100) if total_ambulances > 0 else 0
        
        # Get hospitals
        hospitals = scan_items(TABLE_NAMES['HOSPITALS'])
        total_hospitals = len(hospitals)
        total_beds = sum(h.get('maternity_beds', 0) for h in hospitals)
        available_beds = sum(h.get('available_maternity_beds', 0) for h in hospitals)
        
        available_ambulances = total_ambulances - busy_ambulances
        
        # Get recent emergencies (last 10, sorted by timestamp)
        recent_emergencies = sorted(
            emergencies,
            key=lambda e: e.get('timestamp', ''),
            reverse=True
        )[:10]
        
        # Get high-risk pregnancies with risk scores
        high_risk_pregnancies = [
            p for p in pregnancies 
            if p.get('risk_level') in ['HIGH', 'CRITICAL']
        ]
        # Sort by risk score if available
        high_risk_pregnancies = sorted(
            high_risk_pregnancies,
            key=lambda p: p.get('risk_score', 0),
            reverse=True
        )
        
        response_data = {
            'total_pregnancies': total_pregnancies,
            'active_pregnancies': active_pregnancies,
            'high_risk_count': high_risk_count,
            'high_risk_percentage': round((high_risk_count / total_pregnancies * 100) if total_pregnancies > 0 else 0, 2),
            'emergency_count': emergency_count,
            'active_emergencies': active_emergencies,
            'available_ambulances': available_ambulances,
            'ambulance_stats': {
                'total': total_ambulances,
                'busy': busy_ambulances,
                'available': available_ambulances,
                'utilization_percentage': round(ambulance_utilization, 2)
            },
            'hospital_capacity': {
                'total_hospitals': total_hospitals,
                'total_maternity_beds': total_beds,
                'available_maternity_beds': available_beds,
                'occupancy_percentage': round(((total_beds - available_beds) / total_beds * 100) if total_beds > 0 else 0, 2)
            },
            'recent_emergencies': recent_emergencies,
            'high_risk_pregnancies': high_risk_pregnancies,
            'district': district
        }
        
        log_info("Analytics generated", district=district, total_pregnancies=total_pregnancies)
        
        return create_success_response(
            response_data,
            "Analytics generated successfully"
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
            "An unexpected error occurred while generating analytics",
            {'error': str(e)}
        )
