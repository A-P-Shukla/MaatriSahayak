"""
MaatriSahayak - Accept Emergency Lambda Function

Driver accepts an emergency request and starts navigation.
"""

import json
import boto3
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    get_item,
    get_current_timestamp,
    calculate_distance
)
from shared.constants import TABLE_NAMES, HTTP_STATUS
from shared.db_helper import update_item


# Initialize SNS client for notifications
sns_client = boto3.client('sns')


def lambda_handler(event, context):
    """
    Driver accepts emergency request.
    
    Expected Input:
    {
        "emergency_id": "string",
        "driver_id": "string"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "emergency_id": "emerg_xxx",
            "patient_details": {...},
            "pickup_location": {...},
            "hospital_location": {...},
            "route": {...},
            "eta_minutes": 15
        },
        "message": "Emergency accepted successfully"
    }
    """
    try:
        log_info("Accept emergency request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        if 'emergency_id' not in body or 'driver_id' not in body:
            raise ValidationError(
                "Missing required fields: emergency_id, driver_id",
                details={'required_fields': ['emergency_id', 'driver_id']}
            )
        
        emergency_id = body['emergency_id']
        driver_id = body['driver_id']
        
        # Get emergency details
        emergency = get_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id}
        )
        
        if not emergency:
            raise NotFoundError(f"Emergency with ID {emergency_id} not found")
        
        # Check if emergency is already accepted
        if emergency.get('status') not in ['INITIATED', 'AMBULANCE_DISPATCHED']:
            raise ValidationError(
                f"Emergency is already in {emergency.get('status')} status",
                field='status'
            )
        
        # Get driver details
        driver = get_item(
            TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev'),
            {'id': driver_id}
        )
        
        if not driver:
            raise NotFoundError(f"Driver with ID {driver_id} not found")
        
        # Verify driver is assigned to the ambulance
        if driver.get('ambulanceId') != emergency.get('ambulance_id'):
            raise ValidationError(
                "Driver is not assigned to the ambulance for this emergency",
                field='ambulance_id'
            )
        
        timestamp = get_current_timestamp()
        
        # Update emergency status
        update_item(
            TABLE_NAMES['EMERGENCY_EVENTS'],
            {'id': emergency_id},
            "SET #status = :status, driverAcceptedAt = :accepted_at, updatedAt = :updated_at",
            {
                ':status': 'IN_TRANSIT',
                ':accepted_at': timestamp,
                ':updated_at': timestamp
            },
            {'#status': 'status'}
        )
        
        # Update driver status
        update_item(
            TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev'),
            {'id': driver_id},
            "SET #status = :status, updatedAt = :updated_at",
            {
                ':status': 'ON_RIDE',
                ':updated_at': timestamp
            },
            {'#status': 'status'}
        )
        
        # Update ambulance status
        update_item(
            TABLE_NAMES['AMBULANCES'],
            {'id': driver['ambulanceId']},
            "SET #status = :status",
            {':status': 'IN_TRANSIT'},
            {'#status': 'status'}
        )
        
        # Calculate route and ETA
        driver_location = driver.get('currentLocation', {})
        pickup_lat = float(emergency.get('latitude', 0))
        pickup_lon = float(emergency.get('longitude', 0))
        driver_lat = float(driver_location.get('latitude', 0))
        driver_lon = float(driver_location.get('longitude', 0))
        
        distance_km = calculate_distance(driver_lat, driver_lon, pickup_lat, pickup_lon)
        eta_minutes = int(distance_km * 3)  # Rough estimate: 3 minutes per km
        
        # Send notification to ASHA worker
        try:
            send_acceptance_notification(
                emergency.get('triggered_by'),
                driver.get('name'),
                driver.get('phone'),
                eta_minutes
            )
        except Exception as notif_error:
            log_error("Failed to send notification (non-fatal)", notif_error)
        
        # Prepare response data
        response_data = {
            'emergency_id': emergency_id,
            'patient_details': {
                'name': emergency.get('patient_name'),
                'phone': emergency.get('patient_phone'),
                'age': emergency.get('patient_age'),
                'symptoms': emergency.get('description', ''),
                'severity': emergency.get('severity')
            },
            'pickup_location': {
                'latitude': pickup_lat,
                'longitude': pickup_lon,
                'address': emergency.get('location_address', '')
            },
            'hospital_location': {
                'latitude': float(emergency.get('hospital_latitude', 0)),
                'longitude': float(emergency.get('hospital_longitude', 0)),
                'name': emergency.get('hospital_name', ''),
                'id': emergency.get('hospital_id', '')
            },
            'route': {
                'distance_km': distance_km,
                'eta_minutes': eta_minutes
            },
            'accepted_at': timestamp
        }
        
        log_info(
            "Emergency accepted successfully",
            emergency_id=emergency_id,
            driver_id=driver_id,
            eta_minutes=eta_minutes
        )
        
        return create_success_response(
            response_data,
            "Emergency accepted successfully"
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
        log_error("Resource not found", e)
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
            "An unexpected error occurred while accepting emergency",
            {'error': str(e)}
        )


def send_acceptance_notification(asha_id: str, driver_name: str, driver_phone: str, eta_minutes: int):
    """Send notification to ASHA worker that driver accepted."""
    # Get ASHA worker details
    asha = get_item(
        TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev'),
        {'id': asha_id}
    )
    
    if asha and asha.get('phone'):
        message = (
            f"🚑 Ambulance driver {driver_name} has accepted the emergency. "
            f"ETA: {eta_minutes} minutes. Driver contact: {driver_phone}"
        )
        
        # Send SMS via SNS
        sns_client.publish(
            PhoneNumber=asha['phone'],
            Message=message
        )
        
        log_info("Acceptance notification sent", asha_id=asha_id)
