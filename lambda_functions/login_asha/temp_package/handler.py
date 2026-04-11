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
        "email": "string",
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
                "email": "...",
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
        required_fields = ['email', 'password']
        validate_required_fields(body, required_fields)
        
        email = body['email']
        password = body['password']
        
        # Authenticate with Cognito
        try:
            # Check if user exists and is enabled before attempting auth
            try:
                user_info = cognito_client.admin_get_user(
                    UserPoolId=USER_POOL_ID,
                    Username=email
                )
                if not user_info.get('Enabled', True):
                    raise ValidationError(
                        "Your registration is pending approval. You will receive an email once your account is activated by a District Officer.",
                        field='credentials'
                    )
            except cognito_client.exceptions.UserNotFoundException:
                raise ValidationError(
                    "No account found with this email. Please register first.",
                    field='email'
                )

            response = cognito_client.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
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
                    'phone': user_attributes.get('phone_number'),
                    'name': user_attributes.get('name'),
                    'email': user_attributes.get('email', email),
                    'district': user_attributes.get('custom:district'),
                    'role': user_attributes.get('custom:role', 'ASHA')
                }
            }
            
            log_info(
                "ASHA login successful",
                user_id=auth_data['user']['id'],
                email=email
            )
            
            return create_success_response(
                auth_data,
                "Login successful"
            )
        
        except cognito_client.exceptions.NotAuthorizedException:
            # Could be wrong password OR a disabled (pending approval) user
            # Re-check user status to give the correct message
            try:
                user_info = cognito_client.admin_get_user(
                    UserPoolId=USER_POOL_ID,
                    Username=email
                )
                if not user_info.get('Enabled', True):
                    raise ValidationError(
                        "Your registration is pending approval. You will receive an email once your account is activated by a District Officer.",
                        field='credentials'
                    )
            except ValidationError:
                raise
            except Exception:
                pass
            raise ValidationError(
                "Incorrect password. Please try again.",
                field='credentials'
            )
        
        except cognito_client.exceptions.UserNotFoundException:
            raise ValidationError(
                "No account found with this email. Please register first.",
                field='email'
            )
        
        except cognito_client.exceptions.UserNotConfirmedException:
            raise ValidationError(
                "Your registration is pending approval. You will receive an email once your account is activated.",
                field='email'
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
