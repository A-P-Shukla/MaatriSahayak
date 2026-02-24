"""
MaatriSahayak - Login ASHA Lambda Function

Handle ASHA worker authentication using AWS Cognito.
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
    validate_required_fields,
    validate_phone_number
)
from shared.constants import HTTP_STATUS


# Initialize Cognito client
cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')


def lambda_handler(event, context):
    """
    Authenticate ASHA worker using Cognito.
    
    Expected Input:
    {
        "phone": "string",
        "password": "string"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "access_token": "...",
            "id_token": "...",
            "refresh_token": "...",
            "expires_in": 3600,
            "token_type": "Bearer",
            "user": {
                "id": "...",
                "phone": "...",
                "name": "...",
                "district": "..."
            }
        },
        "message": "Login successful"
    }
    """
    try:
        log_info("ASHA login request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['phone', 'password']
        validate_required_fields(body, required_fields)
        
        phone = body['phone']
        password = body['password']
        
        # Validate phone format
        validate_phone_number(phone)
        
        # Authenticate with Cognito
        try:
            response = cognito_client.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': phone,
                    'PASSWORD': password
                }
            )
            
            # Get user attributes
            user_response = cognito_client.get_user(
                AccessToken=response['AuthenticationResult']['AccessToken']
            )
            
            # Extract user attributes
            user_attributes = {}
            for attr in user_response['UserAttributes']:
                user_attributes[attr['Name']] = attr['Value']
            
            # Prepare response data
            auth_data = {
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'refresh_token': response['AuthenticationResult']['RefreshToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn'],
                'token_type': response['AuthenticationResult']['TokenType'],
                'user': {
                    'id': user_attributes.get('sub'),
                    'phone': user_attributes.get('phone_number', phone),
                    'name': user_attributes.get('name'),
                    'email': user_attributes.get('email'),
                    'district': user_attributes.get('custom:district'),
                    'role': user_attributes.get('custom:role', 'ASHA')
                }
            }
            
            log_info(
                "ASHA login successful",
                user_id=auth_data['user']['id'],
                phone=phone
            )
            
            return create_success_response(
                auth_data,
                "Login successful"
            )
        
        except cognito_client.exceptions.NotAuthorizedException:
            raise ValidationError(
                "Invalid phone number or password",
                field='credentials'
            )
        
        except cognito_client.exceptions.UserNotFoundException:
            raise ValidationError(
                "User not found. Please register first.",
                field='phone'
            )
        
        except cognito_client.exceptions.UserNotConfirmedException:
            raise ValidationError(
                "User account not confirmed. Please verify your account.",
                field='phone'
            )
    
    except ValidationError as e:
        log_error("Validation error during login", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during login", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred during login",
            {'error': str(e)}
        )
