"""
MaatriSahayak - Shared Lambda Layer

This package contains shared utilities, models, and helpers used across all Lambda functions.
"""

__version__ = "1.0.0"

# Import commonly used utilities for easy access
from .exceptions import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    NotFoundError,
    UnauthorizedError,
    ConflictError,
    ServiceError
)

from .utils import (
    create_response,
    create_success_response,
    create_error_response,
    parse_event_body,
    get_path_parameter,
    get_query_parameter,
    log_info,
    log_error,
    log_warning,
    generate_id,
    get_current_timestamp,
    format_timestamp,
    calculate_distance,
    sanitize_input
)

from .db_helper import (
    get_item,
    put_item,
    update_item,
    delete_item,
    query_items,
    scan_items,
    batch_get_items,
    batch_write_items
)

from .validators import (
    validate_required_fields,
    validate_pregnancy_data,
    validate_vital_signs,
    validate_emergency_data,
    validate_email,
    validate_phone_number,
    validate_date,
    validate_pagination_params,
    validate_age,
    validate_blood_type,
    validate_coordinates
)

from .email_service import (
    send_asha_registration_email,
    send_asha_approved_email,
    send_driver_registration_email,
    send_driver_first_login_email,
    send_driver_approved_email,
    send_ambulance_dispatched_email,
    send_hospital_alert_email,
)

from .constants import (
    RISK_LEVELS,
    EMERGENCY_STATUS,
    AMBULANCE_STATUS,
    HTTP_STATUS,
    TABLE_NAMES,
    VITAL_THRESHOLDS,
    ALERT_TYPES,
    GSI_NAMES,
    PAGINATION,
    AGE_LIMITS,
    GESTATIONAL_LIMITS,
    BLOOD_TYPES,
    PREGNANCY_STATUS,
    DATE_FORMATS
)

__all__ = [
    # Exceptions
    'ValidationError',
    'DatabaseError',
    'ResourceNotFoundError',
    'NotFoundError',
    'UnauthorizedError',
    'ConflictError',
    'ServiceError',
    
    # Utils
    'create_response',
    'create_success_response',
    'create_error_response',
    'parse_event_body',
    'get_path_parameter',
    'get_query_parameter',
    'log_info',
    'log_error',
    'log_warning',
    'generate_id',
    'get_current_timestamp',
    'format_timestamp',
    'calculate_distance',
    'sanitize_input',
    
    # Database helpers
    'get_item',
    'put_item',
    'update_item',
    'delete_item',
    'query_items',
    'scan_items',
    'batch_get_items',
    'batch_write_items',
    
    # Validators
    'validate_required_fields',
    'validate_pregnancy_data',
    'validate_vital_signs',
    'validate_emergency_data',
    'validate_email',
    'validate_phone_number',
    'validate_date',
    'validate_pagination_params',
    'validate_age',
    'validate_blood_type',
    'validate_coordinates',
    
    # Email service
    'send_asha_registration_email',
    'send_asha_approved_email',
    'send_driver_registration_email',
    'send_driver_first_login_email',
    'send_driver_approved_email',
    'send_ambulance_dispatched_email',
    'send_hospital_alert_email',

    # Constants
    'RISK_LEVELS',
    'EMERGENCY_STATUS',
    'AMBULANCE_STATUS',
    'HTTP_STATUS',
    'TABLE_NAMES',
    'VITAL_THRESHOLDS',
    'ALERT_TYPES',
    'GSI_NAMES',
    'PAGINATION',
    'AGE_LIMITS',
    'GESTATIONAL_LIMITS',
    'BLOOD_TYPES',
    'PREGNANCY_STATUS',
    'DATE_FORMATS',
]
