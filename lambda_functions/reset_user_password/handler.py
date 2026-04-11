"""
MaatriSahayak - Reset User Password (Admin Tool)

Admin can reset a user's password in Cognito.
POST /admin/reset-password
{
    "email": "user@email.com",
    "new_password": "NewPassword@123"
}
"""

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
)
from shared.constants import HTTP_STATUS

cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('USER_POOL_ID')


def lambda_handler(event, context):
    try:
        body = parse_event_body(event)
        validate_required_fields(body, ['email', 'new_password'])

        email = body['email']
        new_password = body['new_password']

        # Validate password strength
        if len(new_password) < 8:
            raise ValidationError("Password must be at least 8 characters", field='new_password')

        # Check if user exists
        try:
            user_info = cognito_client.admin_get_user(
                UserPoolId=USER_POOL_ID,
                Username=email
            )
        except cognito_client.exceptions.UserNotFoundException:
            raise ValidationError(f"User with email {email} not found", field='email')

        # Set new permanent password
        cognito_client.admin_set_user_password(
            UserPoolId=USER_POOL_ID,
            Username=email,
            Password=new_password,
            Permanent=True
        )

        # Ensure user is enabled
        if not user_info.get('Enabled', True):
            cognito_client.admin_enable_user(
                UserPoolId=USER_POOL_ID,
                Username=email
            )

        log_info("Password reset successfully", email=email)
        return create_success_response(
            {'email': email, 'message': 'Password reset successfully'},
            "Password has been reset"
        )

    except ValidationError as e:
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)
    except Exception as e:
        log_error("Unexpected error in reset_user_password", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred",
            {'error': str(e)}
        )
