"""
MaatriSahayak - Login Driver Lambda Function

Handle ambulance driver authentication using AWS Cognito.
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
    send_driver_first_login_email,
)
from shared.constants import HTTP_STATUS


# Initialize Cognito client
cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')


def lambda_handler(event, context):
    """
    Authenticate ambulance driver using Cognito.
    
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
                "role": "DRIVER"
            }
        },
        "message": "Login successful"
    }
    """
    try:
        log_info("Driver login request received")
        
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
                    'role': user_attributes.get('custom:role', 'DRIVER'),
                    'driver_id': user_attributes.get('custom:driver_id')
                }
            }
            
            log_info(
                "Driver login successful",
                user_id=auth_data['user']['id'],
                email=email
            )

            # Send first-login welcome email if this is the first login
            # Track first login via DynamoDB drivers table flag
            try:
                from shared.db_helper import get_item, update_item
                from shared.constants import TABLE_NAMES
                import os
                drivers_table = TABLE_NAMES.get('DRIVERS', os.environ.get('DRIVERS_TABLE', 'maatrisahayak-drivers-dev'))
                driver_id = auth_data['user'].get('driver_id') or auth_data['user']['id']
                driver_record = get_item(drivers_table, {'id': driver_id})
                if driver_record and not driver_record.get('firstLoginDone'):
                    send_driver_first_login_email(
                        name=auth_data['user']['name'] or 'Driver',
                        email=email,
                        driver_id=driver_id
                    )
                    update_item(
                        drivers_table,
                        {'id': driver_id},
                        'SET firstLoginDone = :val',
                        {':val': True}
                    )
            except Exception as e:
                log_error("Failed to send first-login email (non-fatal)", e)

            return create_success_response(
                auth_data,
                "Login successful"
            )
        
        except cognito_client.exceptions.NotAuthorizedException:
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
        log_error("Validation error during driver login", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error during driver login", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred during login",
            {'error': str(e)}
        )
