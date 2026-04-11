"""
MaatriSahayak - Sync Cognito with DynamoDB

Fixes data inconsistencies between Cognito and DynamoDB.
For existing user: Creates missing Cognito user or updates DynamoDB email.

POST /admin/sync-user
{
    "asha_id": "asha_xxx",
    "action": "create_cognito" | "update_dynamodb",
    "password": "NewPassword@123"  // Required if action is create_cognito
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
    get_item,
    validate_required_fields,
)
from shared.db_helper import update_item
from shared.constants import TABLE_NAMES, HTTP_STATUS

cognito_client = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
USER_POOL_ID = os.environ.get('USER_POOL_ID')


def lambda_handler(event, context):
    try:
        body = parse_event_body(event)
        validate_required_fields(body, ['asha_id', 'action'])

        asha_id = body['asha_id']
        action = body['action']
        password = body.get('password')

        # Get ASHA record from DynamoDB
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        asha_record = get_item(table_name, {'id': asha_id})

        if not asha_record:
            raise ValidationError(f"ASHA worker with id {asha_id} not found", field='asha_id')

        db_email = asha_record.get('email')
        if not db_email:
            raise ValidationError("ASHA record has no email", field='email')

        if action == 'create_cognito':
            # Create Cognito user for existing DynamoDB record
            if not password:
                raise ValidationError("Password is required for create_cognito action", field='password')

            try:
                # Check if user already exists
                try:
                    cognito_client.admin_get_user(
                        UserPoolId=USER_POOL_ID,
                        Username=db_email
                    )
                    return create_error_response(
                        409, "ConflictError",
                        f"Cognito user with email {db_email} already exists",
                        {'email': db_email}
                    )
                except cognito_client.exceptions.UserNotFoundException:
                    pass  # User doesn't exist, we can create

                # Create Cognito user
                user_attributes = [
                    {'Name': 'name', 'Value': asha_record.get('name', '')},
                    {'Name': 'email', 'Value': db_email},
                    {'Name': 'email_verified', 'Value': 'true'},
                    {'Name': 'phone_number', 'Value': asha_record.get('phone', '')},
                    {'Name': 'custom:district', 'Value': asha_record.get('district', '')},
                    {'Name': 'custom:role', 'Value': 'ASHA'},
                    {'Name': 'custom:asha_id', 'Value': asha_id}
                ]

                cognito_client.admin_create_user(
                    UserPoolId=USER_POOL_ID,
                    Username=db_email,
                    UserAttributes=user_attributes,
                    MessageAction='SUPPRESS',
                    TemporaryPassword=password
                )

                cognito_client.admin_set_user_password(
                    UserPoolId=USER_POOL_ID,
                    Username=db_email,
                    Password=password,
                    Permanent=True
                )

                # Enable if already approved
                if asha_record.get('verificationStatus') == 'APPROVED':
                    cognito_client.admin_enable_user(
                        UserPoolId=USER_POOL_ID,
                        Username=db_email
                    )
                else:
                    cognito_client.admin_disable_user(
                        UserPoolId=USER_POOL_ID,
                        Username=db_email
                    )

                log_info("Cognito user created successfully", email=db_email, asha_id=asha_id)
                return create_success_response(
                    {'email': db_email, 'asha_id': asha_id, 'enabled': asha_record.get('verificationStatus') == 'APPROVED'},
                    "Cognito user created successfully"
                )

            except Exception as e:
                log_error("Failed to create Cognito user", e)
                raise ValidationError(f"Failed to create Cognito user: {str(e)}", field='cognito')

        elif action == 'update_dynamodb':
            # Find matching Cognito user and update DynamoDB email
            # List all Cognito users and find by phone or name
            phone = asha_record.get('phone', '')
            name = asha_record.get('name', '')

            try:
                # Search for user by phone in Cognito
                response = cognito_client.list_users(
                    UserPoolId=USER_POOL_ID,
                    Filter=f'phone_number = "{phone}"',
                    Limit=10
                )

                if not response.get('Users'):
                    raise ValidationError(
                        f"No Cognito user found with phone {phone}",
                        field='phone'
                    )

                # Get the first matching user
                cognito_user = response['Users'][0]
                cognito_email = cognito_user['Username']

                # Update DynamoDB with correct email
                update_item(table_name, {'id': asha_id}, {'email': cognito_email})

                log_info("DynamoDB email updated", asha_id=asha_id, old_email=db_email, new_email=cognito_email)
                return create_success_response(
                    {'asha_id': asha_id, 'old_email': db_email, 'new_email': cognito_email},
                    "DynamoDB email updated successfully"
                )

            except Exception as e:
                log_error("Failed to update DynamoDB", e)
                raise ValidationError(f"Failed to update DynamoDB: {str(e)}", field='dynamodb')

        else:
            raise ValidationError(
                "Invalid action. Must be 'create_cognito' or 'update_dynamodb'",
                field='action'
            )

    except ValidationError as e:
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)
    except Exception as e:
        log_error("Unexpected error in sync_cognito_dynamodb", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred",
            {'error': str(e)}
        )
