"""
MaatriSahayak - Refresh Token Lambda Function

Refresh authentication tokens using refresh token.
"""

import json
import os
import boto3
from shared import (
    ValidationError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields
)
from shared.constants import HTTP_STATUS


# Initialize Cognito client
cognito_client = boto3.client('cognito-idp')
CLIENT_ID = os.environ.get('CLIENT_ID')


def lambda_handler(event, context):
    """
    Refresh authentication tokens.
    
    Expected Input:
    {
        "refresh_token": "string"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "access_token": "...",
            "id_token": "...",
            "expires_in": 3600,
            "token_type": "Bearer"
        },
        "message": "Token refreshed successfully"
    }
    """
    try:
        log_info("Token refresh request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['refresh_token']
        validate_required_fields(body, required_fields)
        
        refresh_token = body['refresh_token']
        
        # Refresh tokens with Cognito
        try:
            response = cognito_client.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token
                }
            )
            
            # Prepare response data
            auth_data = {
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn'],
                'token_type': response['AuthenticationResult']['TokenType']
            }
            
            log_info("Token refreshed successfully")
            
            return create_success_response(
                auth_data,
                "Token refreshed successfully"
            )
        
        except cognito_client.exceptions.NotAuthorizedException:
            raise ValidationError(
                "Invalid or expired refresh token",
                field='refresh_token'
            )
    
    except ValidationError as e:
        log_error("Validation error during token refresh", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during token refresh", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred during token refresh",
            {'error': str(e)}
        )
