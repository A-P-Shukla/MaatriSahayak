"""
Update ASHA Worker Push Token
Stores push notification token for ASHA workers
"""

import json
import boto3
from shared import (
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields,
    get_item,
    update_item,
    get_current_timestamp,
    scan_items
)
from shared.constants import HTTP_STATUS, TABLE_NAMES
from shared.auth_helper import get_user_from_event

def lambda_handler(event, context):
    try:
        log_info("Update push token request received")
        body = parse_event_body(event)
        
        # Get user info from token
        user = get_user_from_event(event)
        cognito_user_id = user.get('user_id')
        
        if not cognito_user_id:
            return create_error_response(
                HTTP_STATUS['UNAUTHORIZED'],
                "Unauthorized",
                "User ID not found in token"
            )
        
        validate_required_fields(body, ['push_token'])
        push_token = body['push_token']
        
        # Find ASHA worker by cognito_user_id
        table_name = TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev')
        workers = scan_items(
            table_name,
            filter_expression='cognito_user_id = :user_id',
            expression_attribute_values={':user_id': cognito_user_id},
            limit=1
        )
        
        if not workers:
            return create_error_response(
                HTTP_STATUS['NOT_FOUND'],
                "AshaWorkerNotFound",
                "ASHA worker record not found"
            )
        
        asha_worker = workers[0]
        asha_worker_id = asha_worker['id']
        
        # Update push token in DynamoDB
        update_item(
            table_name,
            {'id': asha_worker_id},
            'SET push_token = :token, updated_at = :updated',
            {':token': push_token, ':updated': get_current_timestamp()}
        )
        
        log_info("Push token updated", asha_worker_id=asha_worker_id, cognito_user_id=cognito_user_id)
        
        return create_success_response({
            'asha_worker_id': asha_worker_id,
            'push_token_updated': True
        })
        
    except Exception as e:
        log_error("Error updating push token", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "UpdateTokenError",
            str(e)
        )
