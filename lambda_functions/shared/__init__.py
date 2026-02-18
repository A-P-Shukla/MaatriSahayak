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
    UnauthorizedError,
    ServiceError
)

from .utils import (
    create_response,
    log_info,
    log_error,
    log_warning,
    generate_id,
    get_current_timestamp,
    format_timestamp
)

from .constants import (
    RISK_LEVELS,
    EMERGENCY_STATUS,
    AMBULANCE_STATUS,
    HTTP_STATUS
)

__all__ = [
    # Exceptions
    'ValidationError',
    'DatabaseError',
    'ResourceNotFoundError',
    'UnauthorizedError',
    'ServiceError',
    
    # Utils
    'create_response',
    'log_info',
    'log_error',
    'log_warning',
    'generate_id',
    'get_current_timestamp',
    'format_timestamp',
    
    # Constants
    'RISK_LEVELS',
    'EMERGENCY_STATUS',
    'AMBULANCE_STATUS',
    'HTTP_STATUS',
]
