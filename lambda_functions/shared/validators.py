"""
MaatriSahayak - Input Validators

Validation functions for input data across Lambda functions.
"""

import re
from typing import Dict, Any, List, Optional
from datetime import datetime

from .exceptions import ValidationError
from .constants import (
    AGE_LIMITS,
    GESTATIONAL_LIMITS,
    BLOOD_TYPES,
    RISK_LEVELS,
    EMERGENCY_STATUS,
    AMBULANCE_STATUS,
    PREGNANCY_STATUS,
    VITAL_THRESHOLDS
)


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> None:
    """
    Validate that all required fields are present.
    
    Args:
        data: Input data dictionary
        required_fields: List of required field names
    
    Raises:
        ValidationError: If any required field is missing
    """
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            details={'missing_fields': missing_fields}
        )


def validate_phone_number(phone: str) -> bool:
    """
    Validate Indian phone number format.
    
    Args:
        phone: Phone number string
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If phone number is invalid
    """
    # Indian phone number: 10 digits, optionally starting with +91 or 91
    pattern = r'^(\+91|91)?[6-9]\d{9}$'
    
    if not re.match(pattern, phone):
        raise ValidationError(
            "Invalid phone number format. Must be a valid Indian phone number.",
            field='phone'
        )
    
    return True


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email string
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If email is invalid
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        raise ValidationError(
            "Invalid email format.",
            field='email'
        )
    
    return True


def validate_age(age: int) -> bool:
    """
    Validate maternal age.
    
    Args:
        age: Age in years
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If age is invalid
    """
    if not isinstance(age, int) or age < AGE_LIMITS['MIN_MATERNAL_AGE'] or age > AGE_LIMITS['MAX_MATERNAL_AGE']:
        raise ValidationError(
            f"Age must be between {AGE_LIMITS['MIN_MATERNAL_AGE']} and {AGE_LIMITS['MAX_MATERNAL_AGE']} years.",
            field='age'
        )
    
    return True


def validate_gestational_age(weeks: int) -> bool:
    """
    Validate gestational age in weeks.
    
    Args:
        weeks: Gestational age in weeks
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If gestational age is invalid
    """
    if not isinstance(weeks, int) or weeks < GESTATIONAL_LIMITS['MIN_WEEKS'] or weeks > GESTATIONAL_LIMITS['MAX_WEEKS']:
        raise ValidationError(
            f"Gestational age must be between {GESTATIONAL_LIMITS['MIN_WEEKS']} and {GESTATIONAL_LIMITS['MAX_WEEKS']} weeks.",
            field='gestational_age_weeks'
        )
    
    return True


def validate_blood_type(blood_type: str) -> bool:
    """
    Validate blood type.
    
    Args:
        blood_type: Blood type string
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If blood type is invalid
    """
    if blood_type not in BLOOD_TYPES:
        raise ValidationError(
            f"Invalid blood type. Must be one of: {', '.join(BLOOD_TYPES)}",
            field='blood_type'
        )
    
    return True


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """
    Validate geographic coordinates.
    
    Args:
        latitude: Latitude value
        longitude: Longitude value
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If coordinates are invalid
    """
    if not isinstance(latitude, (int, float)) or not isinstance(longitude, (int, float)):
        raise ValidationError("Latitude and longitude must be numeric values.")
    
    if not (-90 <= latitude <= 90):
        raise ValidationError(
            "Latitude must be between -90 and 90 degrees.",
            field='latitude'
        )
    
    if not (-180 <= longitude <= 180):
        raise ValidationError(
            "Longitude must be between -180 and 180 degrees.",
            field='longitude'
        )
    
    return True


def validate_date(date_str: str, field_name: str = 'date') -> bool:
    """
    Validate date string in ISO format.
    
    Args:
        date_str: Date string
        field_name: Name of the field for error messages
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If date is invalid
    """
    try:
        datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return True
    except (ValueError, AttributeError):
        raise ValidationError(
            f"Invalid date format for {field_name}. Must be ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).",
            field=field_name
        )


def validate_pregnancy_data(data: Dict[str, Any]) -> bool:
    """
    Validate pregnancy registration data.
    
    Args:
        data: Pregnancy data dictionary
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If data is invalid
    """
    # Required fields
    required_fields = [
        'patient_name', 'age', 'phone', 'district', 'village',
        'lmp_date', 'edd', 'blood_type', 'asha_worker_id'
    ]
    validate_required_fields(data, required_fields)
    
    # Validate specific fields
    validate_age(data['age'])
    validate_phone_number(data['phone'])
    validate_blood_type(data['blood_type'])
    validate_date(data['lmp_date'], 'lmp_date')
    validate_date(data['edd'], 'edd')
    
    # Validate optional coordinates
    if 'latitude' in data and 'longitude' in data:
        validate_coordinates(data['latitude'], data['longitude'])
    
    return True


def validate_vital_signs(data: Dict[str, Any]) -> bool:
    """
    Validate vital signs data.
    
    Args:
        data: Vital signs data dictionary
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If data is invalid
    """
    # Required fields
    required_fields = ['pregnancy_id', 'recorded_by']
    validate_required_fields(data, required_fields)
    
    # Validate blood pressure if provided
    if 'bp_systolic' in data:
        if not isinstance(data['bp_systolic'], (int, float)) or data['bp_systolic'] < 60 or data['bp_systolic'] > 250:
            raise ValidationError(
                "Systolic blood pressure must be between 60 and 250 mmHg.",
                field='bp_systolic'
            )
    
    if 'bp_diastolic' in data:
        if not isinstance(data['bp_diastolic'], (int, float)) or data['bp_diastolic'] < 40 or data['bp_diastolic'] > 150:
            raise ValidationError(
                "Diastolic blood pressure must be between 40 and 150 mmHg.",
                field='bp_diastolic'
            )
    
    # Validate heart rate if provided
    if 'heart_rate' in data:
        if not isinstance(data['heart_rate'], (int, float)) or data['heart_rate'] < 40 or data['heart_rate'] > 200:
            raise ValidationError(
                "Heart rate must be between 40 and 200 bpm.",
                field='heart_rate'
            )
    
    # Validate temperature if provided
    if 'temperature' in data:
        if not isinstance(data['temperature'], (int, float)) or data['temperature'] < 35.0 or data['temperature'] > 42.0:
            raise ValidationError(
                "Temperature must be between 35.0 and 42.0 °C.",
                field='temperature'
            )
    
    # Validate oxygen saturation if provided
    if 'oxygen_saturation' in data:
        if not isinstance(data['oxygen_saturation'], (int, float)) or data['oxygen_saturation'] < 70 or data['oxygen_saturation'] > 100:
            raise ValidationError(
                "Oxygen saturation must be between 70 and 100%.",
                field='oxygen_saturation'
            )
    
    # Validate fetal heart rate if provided
    if 'fetal_heart_rate' in data:
        if not isinstance(data['fetal_heart_rate'], (int, float)) or data['fetal_heart_rate'] < 80 or data['fetal_heart_rate'] > 200:
            raise ValidationError(
                "Fetal heart rate must be between 80 and 200 bpm.",
                field='fetal_heart_rate'
            )
    
    return True


def validate_emergency_data(data: Dict[str, Any]) -> bool:
    """
    Validate emergency trigger data.
    
    Args:
        data: Emergency data dictionary
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If data is invalid
    """
    # Required fields
    required_fields = ['pregnancy_id', 'event_type', 'severity', 'latitude', 'longitude']
    validate_required_fields(data, required_fields)
    
    # Validate severity
    if data['severity'] not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
        raise ValidationError(
            "Severity must be one of: LOW, MEDIUM, HIGH, CRITICAL",
            field='severity'
        )
    
    # Validate coordinates
    validate_coordinates(data['latitude'], data['longitude'])
    
    return True


def validate_ambulance_data(data: Dict[str, Any]) -> bool:
    """
    Validate ambulance data.
    
    Args:
        data: Ambulance data dictionary
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If data is invalid
    """
    # Required fields for registration
    required_fields = ['vehicle_number', 'district', 'latitude', 'longitude']
    validate_required_fields(data, required_fields)
    
    # Validate coordinates
    validate_coordinates(data['latitude'], data['longitude'])
    
    # Validate status if provided
    if 'status' in data and data['status'] not in AMBULANCE_STATUS:
        raise ValidationError(
            f"Invalid ambulance status. Must be one of: {', '.join(AMBULANCE_STATUS.keys())}",
            field='status'
        )
    
    # Validate phone if provided
    if 'driver_phone' in data:
        validate_phone_number(data['driver_phone'])
    
    return True


def validate_risk_score(risk_score: int) -> bool:
    """
    Validate risk score value.
    
    Args:
        risk_score: Risk score (0-100)
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If risk score is invalid
    """
    if not isinstance(risk_score, int) or risk_score < 0 or risk_score > 100:
        raise ValidationError(
            "Risk score must be an integer between 0 and 100.",
            field='risk_score'
        )
    
    return True


def validate_pagination_params(page: Optional[int] = None, page_size: Optional[int] = None) -> bool:
    """
    Validate pagination parameters.
    
    Args:
        page: Page number
        page_size: Items per page
    
    Returns:
        True if valid
    
    Raises:
        ValidationError: If parameters are invalid
    """
    if page is not None:
        if not isinstance(page, int) or page < 1:
            raise ValidationError(
                "Page number must be a positive integer.",
                field='page'
            )
    
    if page_size is not None:
        if not isinstance(page_size, int) or page_size < 1 or page_size > 100:
            raise ValidationError(
                "Page size must be between 1 and 100.",
                field='page_size'
            )
    
    return True
