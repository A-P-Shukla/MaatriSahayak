"""
MaatriSahayak - Record Vitals Lambda Function

Records vital signs for a pregnancy with automatic alert detection and ML risk assessment.
"""

import json
import os
import requests
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    log_warning,
    put_item,
    get_item,
    update_item,
    generate_id,
    get_current_timestamp,
    validate_vital_signs,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, VITAL_THRESHOLDS, ALERT_TYPES
from shared.models import VitalSignsModel

# ML API Configuration
ML_API_URL = os.getenv('ML_API_URL', 'https://maatrisahyak-ml.onrender.com')


def lambda_handler(event, context):
    """
    Record vital signs for a pregnancy.
    
    Expected Input:
    {
        "pregnancy_id": "string",
        "bp_systolic": int (optional),
        "bp_diastolic": int (optional),
        "heart_rate": int (optional),
        "temperature": float (optional),
        "oxygen_saturation": int (optional),
        "fetal_heart_rate": int (optional),
        "weight": float (optional),
        "symptoms": ["string"] (optional),
        "notes": "string" (optional),
        "recorded_by": "string"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "id": "vital_xxx",
            "pregnancy_id": "...",
            "alerts": ["..."],
            ...
        },
        "message": "Vital signs recorded successfully"
    }
    """
    try:
        log_info("Record vitals request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate input
        validate_vital_signs(body)
        
        # Verify pregnancy exists
        pregnancy_id = body['pregnancy_id']
        pregnancy = get_item(TABLE_NAMES['PREGNANCIES'], {'id': pregnancy_id})
        
        if not pregnancy:
            raise ResourceNotFoundError('Pregnancy', pregnancy_id)
        
        # Check if pregnancy is active
        if pregnancy.get('status') != 'ACTIVE':
            raise ValidationError(
                f"Cannot record vitals for pregnancy with status: {pregnancy.get('status')}",
                field='pregnancy_id'
            )
        
        # Generate unique vital signs ID
        vital_id = generate_id('vital_')
        timestamp = get_current_timestamp()
        
        # Detect alerts based on vital signs
        alerts = detect_alerts(body)
        
        # Prepare vital signs data
        vitals_data = {
            'id': vital_id,
            'pregnancy_id': pregnancy_id,
            'bp_systolic': body.get('bp_systolic'),
            'bp_diastolic': body.get('bp_diastolic'),
            'heart_rate': body.get('heart_rate'),
            'temperature': body.get('temperature'),
            'oxygen_saturation': body.get('oxygen_saturation'),
            'fetal_heart_rate': body.get('fetal_heart_rate'),
            'weight': body.get('weight'),
            'symptoms': body.get('symptoms', []),
            'notes': body.get('notes'),
            'recorded_by': body['recorded_by'],
            'recorded_at': timestamp,
            'alerts': alerts
        }
        
        # Validate with Pydantic model
        vitals_model = VitalSignsModel(**vitals_data)
        
        # Save to DynamoDB
        put_item(TABLE_NAMES['VITAL_SIGNS'], vitals_model.model_dump())
        
        # Trigger ML risk assessment asynchronously
        ml_risk_result = None
        try:
            ml_risk_result = assess_risk_with_ml(pregnancy, body)
            if ml_risk_result:
                log_info(
                    "ML risk assessment completed",
                    pregnancy_id=pregnancy_id,
                    risk_level=ml_risk_result.get('risk_level'),
                    risk_score=ml_risk_result.get('risk_score')
                )
        except Exception as ml_error:
            log_error("ML risk assessment failed (non-critical)", ml_error)
            # Continue execution - ML failure shouldn't block vitals recording
        
        # Log alerts if any
        if alerts:
            log_warning(
                "Vital signs alerts detected",
                vital_id=vital_id,
                pregnancy_id=pregnancy_id,
                alerts=alerts
            )
        
        log_info(
            "Vital signs recorded successfully",
            vital_id=vital_id,
            pregnancy_id=pregnancy_id,
            has_alerts=len(alerts) > 0
        )
        
        # Include ML risk result in response if available
        response_data = vitals_model.model_dump()
        if ml_risk_result:
            response_data['ml_risk_assessment'] = ml_risk_result
        
        return create_success_response(
            response_data,
            "Vital signs recorded successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error during vitals recording", e)
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
        log_error("Database error during vitals recording", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during vitals recording", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while recording vital signs",
            {'error': str(e)}
        )


def detect_alerts(vitals: dict) -> list:
    """
    Detect alerts based on vital sign thresholds.
    
    Args:
        vitals: Vital signs data
    
    Returns:
        List of alert messages
    """
    alerts = []
    
    # Check blood pressure
    bp_systolic = vitals.get('bp_systolic')
    bp_diastolic = vitals.get('bp_diastolic')
    
    if bp_systolic:
        if bp_systolic >= VITAL_THRESHOLDS['BP_SYSTOLIC_CRITICAL']:
            alerts.append(ALERT_TYPES['HIGH_BP'] + f" (Critical: {bp_systolic} mmHg)")
        elif bp_systolic >= VITAL_THRESHOLDS['BP_SYSTOLIC_HIGH']:
            alerts.append(ALERT_TYPES['HIGH_BP'] + f" ({bp_systolic} mmHg)")
    
    if bp_diastolic:
        if bp_diastolic >= VITAL_THRESHOLDS['BP_DIASTOLIC_CRITICAL']:
            alerts.append(ALERT_TYPES['HIGH_BP'] + f" (Critical diastolic: {bp_diastolic} mmHg)")
        elif bp_diastolic >= VITAL_THRESHOLDS['BP_DIASTOLIC_HIGH']:
            alerts.append(ALERT_TYPES['HIGH_BP'] + f" (Diastolic: {bp_diastolic} mmHg)")
    
    # Check temperature
    temperature = vitals.get('temperature')
    if temperature:
        if temperature >= VITAL_THRESHOLDS['TEMPERATURE_CRITICAL']:
            alerts.append(ALERT_TYPES['HIGH_TEMP'] + f" (Critical: {temperature}°C)")
        elif temperature >= VITAL_THRESHOLDS['TEMPERATURE_HIGH']:
            alerts.append(ALERT_TYPES['HIGH_TEMP'] + f" ({temperature}°C)")
        elif temperature <= VITAL_THRESHOLDS['TEMPERATURE_LOW']:
            alerts.append(f"Low Temperature ({temperature}°C)")
    
    # Check oxygen saturation
    oxygen_saturation = vitals.get('oxygen_saturation')
    if oxygen_saturation:
        if oxygen_saturation <= VITAL_THRESHOLDS['OXYGEN_SATURATION_CRITICAL']:
            alerts.append(ALERT_TYPES['LOW_OXYGEN'] + f" (Critical: {oxygen_saturation}%)")
        elif oxygen_saturation <= VITAL_THRESHOLDS['OXYGEN_SATURATION_LOW']:
            alerts.append(ALERT_TYPES['LOW_OXYGEN'] + f" ({oxygen_saturation}%)")
    
    # Check fetal heart rate
    fetal_heart_rate = vitals.get('fetal_heart_rate')
    if fetal_heart_rate:
        if (fetal_heart_rate < VITAL_THRESHOLDS['FETAL_HEART_RATE_LOW'] or 
            fetal_heart_rate > VITAL_THRESHOLDS['FETAL_HEART_RATE_HIGH']):
            alerts.append(ALERT_TYPES['ABNORMAL_FETAL_HR'] + f" ({fetal_heart_rate} bpm)")
    
    # Check heart rate
    heart_rate = vitals.get('heart_rate')
    if heart_rate:
        if (heart_rate < VITAL_THRESHOLDS['HEART_RATE_LOW'] or 
            heart_rate > VITAL_THRESHOLDS['HEART_RATE_HIGH']):
            alerts.append(f"Abnormal Heart Rate ({heart_rate} bpm)")
    
    # Check symptoms
    symptoms = vitals.get('symptoms', [])
    critical_symptoms = ['severe bleeding', 'severe pain', 'seizure', 'unconscious']
    
    for symptom in symptoms:
        if any(critical in symptom.lower() for critical in critical_symptoms):
            alerts.append(f"Critical Symptom: {symptom}")
    
    return alerts


def assess_risk_with_ml(pregnancy: dict, vitals: dict) -> dict:
    """
    Call external ML API to assess pregnancy risk based on vitals.
    
    Args:
        pregnancy: Pregnancy record from database
        vitals: Newly recorded vital signs
    
    Returns:
        Dict with risk_level and risk_score, or None if assessment fails
    """
    try:
        # Prepare ML model input (11 features)
        ml_input = {
            "Age": pregnancy.get('age', 25),
            "Systolic_BP": vitals.get('bp_systolic', 120),
            "Diastolic": vitals.get('bp_diastolic', 80),
            "BS": vitals.get('blood_sugar', 5.5),  # Blood sugar in mmol/L
            "Body_Temp": vitals.get('temperature', 98.6),
            "BMI": pregnancy.get('bmi', 22.0),
            "Previous_Complications": 1 if pregnancy.get('previous_complications') else 0,
            "Preexisting_Diabetes": 1 if pregnancy.get('medical_history', {}).get('diabetes') else 0,
            "Gestational_Diabetes": 1 if pregnancy.get('gestational_diabetes') else 0,
            "Mental_Health": 1 if pregnancy.get('mental_health_concerns') else 0,
            "Heart_Rate": vitals.get('heart_rate', 75)
        }
        
        log_info("Calling ML API for risk prediction", ml_api_url=ML_API_URL)
        
        # Call ML API
        response = requests.post(
            f"{ML_API_URL}/predict",
            json=ml_input,
            timeout=5  # 5 second timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            prediction = result.get('prediction', 0)
            risk_level = result.get('risk_level', 'Low').upper()
            
            # Convert to risk score (0-100 scale)
            risk_score = 85 if prediction == 1 else 15
            
            # Update pregnancy record with new risk assessment
            update_item(
                TABLE_NAMES['PREGNANCIES'],
                {'id': pregnancy['id']},
                {
                    'risk_level': risk_level,
                    'risk_score': risk_score,
                    'risk_category': 'high' if risk_level == 'HIGH' else 'low',
                    'last_risk_assessment': get_current_timestamp()
                }
            )
            
            return {
                'risk_level': risk_level,
                'risk_score': risk_score,
                'prediction': prediction,
                'assessed_at': get_current_timestamp()
            }
        else:
            log_error(f"ML API returned error: {response.status_code}", None)
            return None
            
    except requests.exceptions.Timeout:
        log_error("ML API timeout", None)
        return None
    except Exception as e:
        log_error("ML risk assessment error", e)
        return None
