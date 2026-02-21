"""
MaatriSahayak - Assess Risk Lambda Function

AI-powered risk assessment for pregnancy using machine learning.
"""

import json
import os
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    get_path_parameter,
    log_info,
    log_error,
    get_item,
    query_items,
    update_item,
    get_current_timestamp
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, RISK_LEVELS, GSI_NAMES


def lambda_handler(event, context):
    """
    Assess pregnancy risk using AI/ML model.
    
    Path Parameters:
        pregnancy_id: Pregnancy ID
    
    Returns:
    {
        "success": true,
        "data": {
            "pregnancy_id": "...",
            "risk_level": "LOW|MODERATE|HIGH|CRITICAL",
            "risk_score": 0.75,
            "risk_factors": [...],
            "recommendations": [...]
        }
    }
    """
    try:
        # Get pregnancy ID from path
        pregnancy_id = get_path_parameter(event, 'pregnancy_id')
        
        if not pregnancy_id:
            raise ValidationError("Pregnancy ID is required", field='pregnancy_id')
        
        log_info("Assess risk request", pregnancy_id=pregnancy_id)
        
        # Get pregnancy data
        pregnancy = get_item(TABLE_NAMES['PREGNANCIES'], {'id': pregnancy_id})
        
        if not pregnancy:
            raise ResourceNotFoundError('Pregnancy', pregnancy_id)
        
        # Get recent vital signs
        vital_signs = query_items(
            TABLE_NAMES['VITAL_SIGNS'],
            key_condition_expression='pregnancy_id = :pregnancy_id',
            expression_attribute_values={':pregnancy_id': pregnancy_id},
            index_name=GSI_NAMES.get('PREGNANCY_EVENTS_INDEX', 'pregnancy-events-index'),
            scan_index_forward=False,
            limit=10
        )
        
        # Calculate risk assessment
        risk_assessment = calculate_risk_score(pregnancy, vital_signs)
        
        # Update pregnancy with new risk level if changed
        if pregnancy.get('risk_level') != risk_assessment['risk_level']:
            update_item(
                TABLE_NAMES['PREGNANCIES'],
                {'id': pregnancy_id},
                {
                    'risk_level': risk_assessment['risk_level'],
                    'risk_score': risk_assessment['risk_score'],
                    'updated_at': get_current_timestamp()
                }
            )
            log_info(
                "Pregnancy risk level updated",
                pregnancy_id=pregnancy_id,
                old_risk=pregnancy.get('risk_level'),
                new_risk=risk_assessment['risk_level']
            )
        
        log_info(
            "Risk assessment completed",
            pregnancy_id=pregnancy_id,
            risk_level=risk_assessment['risk_level'],
            risk_score=risk_assessment['risk_score']
        )
        
        return create_success_response(
            risk_assessment,
            "Risk assessment completed successfully"
        )
    
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
            "An unexpected error occurred during risk assessment",
            {'error': str(e)}
        )


def calculate_risk_score(pregnancy: dict, vital_signs: list) -> dict:
    """
    Calculate risk score based on pregnancy data and vital signs.
    
    This is a rule-based implementation. In production, integrate with:
    - Amazon SageMaker ML model
    - Custom trained model
    
    Args:
        pregnancy: Pregnancy data
        vital_signs: List of recent vital signs
    
    Returns:
        Risk assessment dictionary
    """
    risk_score = 0.0
    risk_factors = []
    recommendations = []
    
    # Age-based risk
    age = pregnancy.get('age', 25)
    if age < 18:
        risk_score += 0.15
        risk_factors.append("Maternal age below 18")
        recommendations.append("Increased monitoring required for teenage pregnancy")
    elif age > 35:
        risk_score += 0.10
        risk_factors.append("Advanced maternal age (>35)")
        recommendations.append("Additional screening for chromosomal abnormalities recommended")
    
    # Parity-based risk
    gravida = pregnancy.get('gravida', 1)
    if gravida > 4:
        risk_score += 0.10
        risk_factors.append("Grand multiparity (>4 pregnancies)")
        recommendations.append("Monitor for uterine complications")
    
    # Medical history risk factors
    medical_history = pregnancy.get('medical_history', {})
    
    if medical_history.get('diabetes'):
        risk_score += 0.20
        risk_factors.append("Pre-existing diabetes")
        recommendations.append("Regular blood glucose monitoring required")
    
    if medical_history.get('hypertension'):
        risk_score += 0.20
        risk_factors.append("Pre-existing hypertension")
        recommendations.append("Monitor blood pressure regularly")
    
    if medical_history.get('previous_cesarean'):
        risk_score += 0.10
        risk_factors.append("Previous cesarean delivery")
        recommendations.append("Plan for delivery at facility with surgical capabilities")
    
    # Vital signs analysis
    if vital_signs:
        latest_vitals = vital_signs[0]
        
        # Blood pressure
        bp_systolic = latest_vitals.get('blood_pressure_systolic', 120)
        bp_diastolic = latest_vitals.get('blood_pressure_diastolic', 80)
        
        if bp_systolic >= 140 or bp_diastolic >= 90:
            risk_score += 0.25
            risk_factors.append("Elevated blood pressure")
            recommendations.append("Immediate evaluation for preeclampsia")
        
        # Hemoglobin
        hemoglobin = latest_vitals.get('hemoglobin', 12.0)
        if hemoglobin < 10.0:
            risk_score += 0.15
            risk_factors.append("Severe anemia")
            recommendations.append("Iron supplementation and dietary counseling")
        elif hemoglobin < 11.0:
            risk_score += 0.10
            risk_factors.append("Moderate anemia")
            recommendations.append("Iron supplementation recommended")
        
        # Weight gain
        weight = latest_vitals.get('weight', 60)
        initial_weight = pregnancy.get('initial_weight', 55)
        weight_gain = weight - initial_weight
        
        if weight_gain < 5 and pregnancy.get('trimester') == 3:
            risk_score += 0.10
            risk_factors.append("Inadequate weight gain")
            recommendations.append("Nutritional assessment and counseling")
    
    # Gestational age considerations
    gestational_age = pregnancy.get('gestational_age_weeks', 20)
    if gestational_age > 42:
        risk_score += 0.20
        risk_factors.append("Post-term pregnancy")
        recommendations.append("Consider induction of labor")
    
    # Cap risk score at 1.0
    risk_score = min(risk_score, 1.0)
    
    # Determine risk level
    if risk_score < 0.25:
        risk_level = "LOW"
    elif risk_score < 0.50:
        risk_level = "MODERATE"
    elif risk_score < 0.75:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"
    
    # Add general recommendations
    if risk_level in ["HIGH", "CRITICAL"]:
        recommendations.append("Refer to higher-level facility for specialized care")
        recommendations.append("Increase frequency of antenatal visits")
    
    return {
        'pregnancy_id': pregnancy['id'],
        'risk_level': risk_level,
        'risk_score': round(risk_score, 2),
        'risk_factors': risk_factors,
        'recommendations': recommendations,
        'assessed_at': get_current_timestamp()
    }
