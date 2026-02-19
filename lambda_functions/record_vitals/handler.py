"""
MaatriSahayak - Record Vitals Lambda Function

Records vital signs for a pregnancy with automatic alert detection.
"""

import json
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
    generate_id,
    get_current_timestamp,
    validate_vital_signs,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, VITAL_THRESHOLDS, ALERT_TYPES
from shared.models import VitalSignsModel


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
        
        return create_success_response(
            vitals_model.model_dump(),
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
