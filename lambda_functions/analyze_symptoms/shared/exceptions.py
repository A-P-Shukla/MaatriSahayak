"""
MaatriSahayak - Custom Exceptions

Custom exception classes for better error handling across Lambda functions.
"""

from typing import Optional, Dict, Any


class MaatriSahayakException(Exception):
    """Base exception class for all MaatriSahayak exceptions."""
    
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API response."""
        return {
            'error': self.__class__.__name__,
            'message': self.message,
            'details': self.details
        }


class ValidationError(MaatriSahayakException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        details = details or {}
        if field:
            details['field'] = field
        super().__init__(message, status_code=400, details=details)


class DatabaseError(MaatriSahayakException):
    """Raised when database operations fail."""
    
    def __init__(self, message: str, operation: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        details = details or {}
        if operation:
            details['operation'] = operation
        super().__init__(message, status_code=500, details=details)


class ResourceNotFoundError(MaatriSahayakException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, resource_type: str, resource_id: str, details: Optional[Dict[str, Any]] = None):
        message = f"{resource_type} with ID '{resource_id}' not found"
        details = details or {}
        details.update({
            'resource_type': resource_type,
            'resource_id': resource_id
        })
        super().__init__(message, status_code=404, details=details)


class UnauthorizedError(MaatriSahayakException):
    """Raised when authentication or authorization fails."""
    
    def __init__(self, message: str = "Unauthorized access", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=401, details=details)


class ServiceError(MaatriSahayakException):
    """Raised when external service calls fail."""
    
    def __init__(self, service_name: str, message: str, details: Optional[Dict[str, Any]] = None):
        details = details or {}
        details['service'] = service_name
        super().__init__(f"{service_name} error: {message}", status_code=503, details=details)


class ConflictError(MaatriSahayakException):
    """Raised when there's a conflict with existing data."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=409, details=details)


class RateLimitError(MaatriSahayakException):
    """Raised when rate limits are exceeded."""
    
    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=429, details=details)
