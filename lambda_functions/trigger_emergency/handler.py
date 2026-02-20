"""
MaatriSahayak - Trigger Emergency Lambda Function

Triggers emergency response workflow for pregnancy complications.
"""

import json
import boto3
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
    validate_emergency_data
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, EMERGENCY_STATUS, EVENT_TYPES
from shared.models import EmergencyModel

# Initialize AWS clients
lambda_client = boto3.client('lambda')
sns_client = boto3.client('sns')


def lambda_handler(event, context):
    """
    Trigger emergency response for a pregnancy.
    
    Expected Input:
    {
        "pregnancy_id": "string",
        "event_type": "string" (SEVERE_BLEEDING, HIGH_BP_EMERGENCY, etc.),
        "severity": "string" (LOW, MEDIUM, HIGH, CRITICAL),
        "description": "string" (optional),
        "latitude": float,
        "longitude": float,
        "location_address": "string" (optional),
        "triggered_by": "string"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency": {...},
            "ambulance": {...},
            "hospital": {...}
        },
        "message": "Emergency triggered successfully"
    }
    """
    try:
        log_info("Trigger emergency request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate input
        validate_emergency_data(body)
        
        # Verify pregnancy exists
        pregnancy_id = body['pregnancy_id']
        pregnancy = get_item(TABLE_NAMES['PREGNANCIES'], {'id': pregnancy_id})
        
        if not pregnancy:
            raise ResourceNotFoundError('Pregnancy', pregnancy_id)
        
        # Check if pregnancy is active
        if pregnancy.get('status') != 'ACTIVE':
            raise ValidationError(
                f"Cannot trigger emergency for pregnancy with status: {pregnancy.get('status')}",
                field='pregnancy_id'
            )
        
        # Generate emergency ID and timestamp
        emergency_id = generate_id('emerg_')
        timestamp = get_current_timestamp()
        
        # Prepare emergency data
        emergency_data = {
            'id': emergency_id,
            'pregnancy_id': pregnancy_id,
            'patient_name': pregnancy['patient_name'],
            'patient_phone': pregnancy['phone'],
            'event_type': body['event_type'],
            'severity': body['severity'],
            'description': body.get('description'),
            'latitude': body['latitude'],
            'longitude': body['longitude'],
            'location_address': body.get('location_address'),
            'status': 'INITIATED',
            'triggered_by': body['triggered_by'],
            'triggered_at': timestamp,
            'updated_at': timestamp,
            'ambulance_id': 'PENDING',  # Placeholder for GSI requirement
            'timeline': [
                {
                    'status': 'INITIATED',
                    'timestamp': timestamp,
                    'description': 'Emergency initiated'
                }
            ]
        }
        
        # Validate with Pydantic model
        emergency_model = EmergencyModel(**emergency_data)
        
        # Save emergency to DynamoDB
        put_item(TABLE_NAMES['EMERGENCY_EVENTS'], emergency_model.model_dump())
        
        log_info(
            "Emergency event created",
            emergency_id=emergency_id,
            pregnancy_id=pregnancy_id,
            severity=body['severity']
        )
        
        # Find nearest ambulance
        ambulance = None
        try:
            ambulance = find_nearest_ambulance(
                body['latitude'],
                body['longitude'],
                pregnancy['district']
            )
            
            if ambulance:
                # Update emergency with ambulance info
                update_item(
                    TABLE_NAMES['EMERGENCY_EVENTS'],
                    {'id': emergency_id},
                    {
                        'ambulance_id': ambulance['id'],
                        'status': 'DISPATCHED',
                        'updated_at': get_current_timestamp()
                    }
                )
                
                # Update ambulance status
                update_item(
                    TABLE_NAMES['AMBULANCES'],
                    {'id': ambulance['id']},
                    {
                        'status': 'DISPATCHED',
                        'current_emergency_id': emergency_id,
                        'last_updated': get_current_timestamp()
                    }
                )
                
                log_info("Ambulance dispatched", ambulance_id=ambulance['id'])
        
        except Exception as e:
            log_error("Failed to find/dispatch ambulance", e)
        
        # Find suitable hospital
        hospital = None
        try:
            hospital = find_suitable_hospital(
                body['latitude'],
                body['longitude'],
                pregnancy['district'],
                body['severity']
            )
            
            if hospital:
                update_item(
                    TABLE_NAMES['EMERGENCY_EVENTS'],
                    {'id': emergency_id},
                    {
                        'hospital_id': hospital['id'],
                        'updated_at': get_current_timestamp()
                    }
                )
                
                log_info("Hospital assigned", hospital_id=hospital['id'])
        
        except Exception as e:
            log_error("Failed to find suitable hospital", e)
        
        # Send notifications
        try:
            send_emergency_notifications(emergency_model.model_dump(), pregnancy, ambulance, hospital)
        except Exception as e:
            log_error("Failed to send notifications", e)
        
        # Prepare response
        response_data = {
            'emergency': emergency_model.model_dump(),
            'ambulance': ambulance,
            'hospital': hospital
        }
        
        log_info(
            "Emergency triggered successfully",
            emergency_id=emergency_id,
            has_ambulance=ambulance is not None,
            has_hospital=hospital is not None
        )
        
        return create_success_response(
            response_data,
            "Emergency triggered successfully"
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
            "An unexpected error occurred while triggering emergency",
            {'error': str(e)}
        )


def find_nearest_ambulance(latitude: float, longitude: float, district: str) -> dict:
    """
    Find nearest available ambulance.
    
    Args:
        latitude: Patient latitude
        longitude: Patient longitude
        district: Patient district
    
    Returns:
        Ambulance data or None
    """
    try:
        from shared import scan_items, calculate_distance
        
        # Get available ambulances in the district
        ambulances = scan_items(
            TABLE_NAMES['AMBULANCES'],
            filter_expression='#status = :status AND district = :district',
            expression_attribute_values={
                ':status': 'AVAILABLE',
                ':district': district
            },
            expression_attribute_names={
                '#status': 'status'
            }
        )
        
        if not ambulances:
            log_warning("No available ambulances found", district=district)
            return None
        
        # Calculate distances and find nearest
        for ambulance in ambulances:
            distance = calculate_distance(
                latitude,
                longitude,
                ambulance['latitude'],
                ambulance['longitude']
            )
            ambulance['distance_km'] = distance
        
        # Sort by distance
        ambulances.sort(key=lambda x: x['distance_km'])
        
        return ambulances[0]
    
    except Exception as e:
        log_error("Error finding nearest ambulance", e)
        return None


def find_suitable_hospital(latitude: float, longitude: float, district: str, severity: str) -> dict:
    """
    Find suitable hospital based on location and severity.
    
    Args:
        latitude: Patient latitude
        longitude: Patient longitude
        district: Patient district
        severity: Emergency severity
    
    Returns:
        Hospital data or None
    """
    try:
        from shared import scan_items, calculate_distance
        
        # Get hospitals with available maternity beds
        hospitals = scan_items(
            TABLE_NAMES['HOSPITALS'],
            filter_expression='district = :district AND available_maternity_beds > :min_beds',
            expression_attribute_values={
                ':district': district,
                ':min_beds': 0
            }
        )
        
        if not hospitals:
            log_warning("No hospitals with available beds found", district=district)
            return None
        
        # For critical cases, prefer hospitals with NICU
        if severity == 'CRITICAL':
            hospitals = [h for h in hospitals if h.get('available_nicu_beds', 0) > 0]
        
        if not hospitals:
            log_warning("No suitable hospitals found for critical case", district=district)
            return None
        
        # Calculate distances
        for hospital in hospitals:
            distance = calculate_distance(
                latitude,
                longitude,
                hospital['latitude'],
                hospital['longitude']
            )
            hospital['distance_km'] = distance
        
        # Sort by distance
        hospitals.sort(key=lambda x: x['distance_km'])
        
        return hospitals[0]
    
    except Exception as e:
        log_error("Error finding suitable hospital", e)
        return None


def send_emergency_notifications(emergency: dict, pregnancy: dict, ambulance: dict, hospital: dict):
    """
    Send emergency notifications to stakeholders.
    
    Args:
        emergency: Emergency data
        pregnancy: Pregnancy data
        ambulance: Ambulance data (optional)
        hospital: Hospital data (optional)
    """
    try:
        # Prepare notification data
        notification_data = {
            'emergency_id': emergency['id'],
            'patient_name': pregnancy['patient_name'],
            'patient_phone': pregnancy['phone'],
            'event_type': emergency['event_type'],
            'severity': emergency['severity'],
            'location': f"{emergency.get('location_address', 'Unknown location')}",
            'asha_worker_phone': pregnancy.get('asha_worker_phone'),
            'ambulance_number': ambulance.get('vehicle_number') if ambulance else None,
            'hospital_name': hospital.get('name') if hospital else None
        }
        
        # Invoke send_notifications lambda
        lambda_client.invoke(
            FunctionName='maatrisahayak-send-notifications',
            InvocationType='Event',  # Async
            Payload=json.dumps({
                'notification_type': 'EMERGENCY_ALERT',
                'data': notification_data
            })
        )
        
        log_info("Emergency notifications triggered", emergency_id=emergency['id'])
    
    except Exception as e:
        log_error("Failed to trigger notifications", e)
        raise
