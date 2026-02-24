"""
MaatriSahayak - Utility Functions

Common utility functions used across Lambda functions.
"""

import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from decimal import Decimal

from .constants import HTTP_STATUS, DATE_FORMATS


# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def create_response(
    status_code: int,
    body: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Create a standardized API Gateway response.
    
    Args:
        status_code: HTTP status code
        body: Response body dictionary
        headers: Additional headers
    
    Returns:
        API Gateway response dictionary
    """
    default_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
    
    if headers:
        default_headers.update(headers)
    
    response = {
        'statusCode': status_code,
        'headers': default_headers,
        'body': json.dumps(body or {}, cls=DecimalEncoder)
    }
    
    return response


def create_success_response(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
    """Create a success response with data."""
    body = {
        'success': True,
        'data': data
    }
    if message:
        body['message'] = message
    
    return create_response(HTTP_STATUS['OK'], body)


def create_error_response(
    status_code: int,
    error: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create an error response."""
    body = {
        'success': False,
        'error': error,
        'message': message
    }
    if details:
        body['details'] = details
    
    return create_response(status_code, body)


def log_info(message: str, **kwargs):
    """Log info message with structured data."""
    log_data = {'level': 'INFO', 'message': message}
    log_data.update(kwargs)
    logger.info(json.dumps(log_data))


def log_error(message: str, error: Optional[Exception] = None, **kwargs):
    """Log error message with structured data."""
    log_data = {'level': 'ERROR', 'message': message}
    if error:
        log_data['error'] = str(error)
        log_data['error_type'] = type(error).__name__
    log_data.update(kwargs)
    logger.error(json.dumps(log_data))


def log_warning(message: str, **kwargs):
    """Log warning message with structured data."""
    log_data = {'level': 'WARNING', 'message': message}
    log_data.update(kwargs)
    logger.warning(json.dumps(log_data))


def generate_id(prefix: str = '') -> str:
    """
    Generate a unique ID with optional prefix.
    
    Args:
        prefix: Optional prefix for the ID
    
    Returns:
        Unique ID string
    """
    unique_id = str(uuid.uuid4())
    return f"{prefix}{unique_id}" if prefix else unique_id


def get_current_timestamp() -> str:
    """
    Get current timestamp in ISO format.
    
    Returns:
        ISO formatted timestamp string
    """
    return datetime.now(timezone.utc).strftime(DATE_FORMATS['ISO'])


def format_timestamp(timestamp: str, format_type: str = 'DISPLAY') -> str:
    """
    Format timestamp string to different formats.
    
    Args:
        timestamp: ISO formatted timestamp
        format_type: Format type from DATE_FORMATS
    
    Returns:
        Formatted timestamp string
    """
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        return dt.strftime(DATE_FORMATS.get(format_type, DATE_FORMATS['DISPLAY']))
    except Exception as e:
        log_error(f"Error formatting timestamp: {timestamp}", e)
        return timestamp


def parse_event_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse API Gateway event body.
    
    Args:
        event: API Gateway event
    
    Returns:
        Parsed body dictionary
    """
    body = event.get('body', '{}')
    
    if isinstance(body, str):
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}
    
    return body


def get_path_parameter(event: Dict[str, Any], param_name: str) -> Optional[str]:
    """
    Get path parameter from API Gateway event.
    
    Args:
        event: API Gateway event
        param_name: Parameter name
    
    Returns:
        Parameter value or None
    """
    path_params = event.get('pathParameters') or {}
    return path_params.get(param_name)


def get_query_parameter(
    event: Dict[str, Any],
    param_name: str,
    default: Optional[str] = None
) -> Optional[str]:
    """
    Get query parameter from API Gateway event.
    
    Args:
        event: API Gateway event
        param_name: Parameter name
        default: Default value if not found
    
    Returns:
        Parameter value or default
    """
    query_params = event.get('queryStringParameters') or {}
    return query_params.get(param_name, default)


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula.
    
    Args:
        lat1, lon1: First coordinate
        lat2, lon2: Second coordinate
    
    Returns:
        Distance in kilometers
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)
    
    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)


def sanitize_input(data: str, max_length: int = 1000) -> str:
    """
    Sanitize user input by removing potentially harmful characters.
    
    Args:
        data: Input string
        max_length: Maximum allowed length
    
    Returns:
        Sanitized string
    """
    if not data:
        return ''
    
    # Truncate to max length
    sanitized = str(data)[:max_length]
    
    # Remove null bytes and control characters
    sanitized = ''.join(char for char in sanitized if ord(char) >= 32 or char in '\n\r\t')
    
    return sanitized.strip()


def chunk_list(items: List[Any], chunk_size: int) -> List[List[Any]]:
    """
    Split a list into chunks of specified size.
    
    Args:
        items: List to chunk
        chunk_size: Size of each chunk
    
    Returns:
        List of chunks
    """
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


class DecimalEncoder(json.JSONEncoder):
    """JSON encoder that handles Decimal types from DynamoDB."""
    
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert Decimal to int if it's a whole number, otherwise to float
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def convert_decimals(obj: Any) -> Any:
    """
    Recursively convert Decimal objects to int or float.
    
    Args:
        obj: Object to convert
    
    Returns:
        Converted object
    """
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    return obj
