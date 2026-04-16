"""
District-based Authorization Helper

Extracts user district from JWT token and enforces location-based access control.
"""

import json
import base64
from typing import Optional, Dict, Any
from .exceptions import ValidationError


def decode_jwt_payload(token: str) -> Dict[str, Any]:
    """Decode JWT token payload without verification (already verified by API Gateway)."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise ValidationError("Invalid token format")
        
        payload = parts[1]
        # Add padding if needed
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        raise ValidationError(f"Failed to decode token: {str(e)}")


def get_user_from_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Extract user info from API Gateway authorizer context or JWT token."""
    # Try authorizer context first (preferred)
    authorizer = event.get('requestContext', {}).get('authorizer', {})
    if authorizer:
        claims = authorizer.get('claims', {})
        if claims:
            return {
                'user_id': claims.get('sub'),
                'email': claims.get('email'),
                'district': claims.get('custom:district'),
                'role': claims.get('custom:role', 'ASHA'),
                'name': claims.get('name')
            }
    
    # Fallback: decode from Authorization header
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization') or headers.get('authorization')
    
    if not auth_header:
        raise ValidationError("No authorization token provided")
    
    token = auth_header.replace('Bearer ', '').strip()
    payload = decode_jwt_payload(token)
    
    return {
        'user_id': payload.get('sub'),
        'email': payload.get('email'),
        'district': payload.get('custom:district'),
        'role': payload.get('custom:role', 'ASHA'),
        'name': payload.get('name')
    }


def get_user_district(event: Dict[str, Any]) -> Optional[str]:
    """Get the district of the authenticated user."""
    try:
        user = get_user_from_event(event)
        return user.get('district')
    except Exception:
        return None


def enforce_district_access(event: Dict[str, Any], resource_district: str) -> None:
    """
    Enforce district-based access control.
    Raises ValidationError if user tries to access resources outside their district.
    """
    user = get_user_from_event(event)
    user_district = user.get('district')
    user_role = user.get('role', 'ASHA')
    
    # Admin/Super users can access all districts
    if user_role in ['ADMIN', 'SUPER_ADMIN']:
        return
    
    if not user_district:
        raise ValidationError("User district not found in token")
    
    if user_district != resource_district:
        raise ValidationError(
            f"Access denied. You can only access resources in your district ({user_district})",
            field='district'
        )


def apply_district_filter(event: Dict[str, Any], filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply district filter to query parameters based on user's district.
    Returns updated filters with district constraint.
    """
    user = get_user_from_event(event)
    user_district = user.get('district')
    user_role = user.get('role', 'ASHA')
    
    # Admin/Super users can see all districts
    if user_role in ['ADMIN', 'SUPER_ADMIN']:
        return filters
    
    # Enforce district filter for regular users
    if user_district:
        filters['district'] = user_district
    
    return filters
