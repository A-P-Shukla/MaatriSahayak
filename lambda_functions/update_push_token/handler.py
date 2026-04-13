"""
Update ASHA Worker Push Token
Stores push notification token for ASHA workers
"""

import json
import boto3
from datetime import datetime
from shared import (
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields
)
from shared.constants import HTTP_STATUS

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    try:
        log_info("Update push token request received")
        body = parse_event_body(event)
        
        # Get ASHA worker ID from auth context
        asha_worker_id = event.get('requestContext', {}).get('authorizer', {}).get('claims', {}).get('sub')
        
        if not asha_worker_id:
            return create_error_response(
                HTTP_STATUS['UNAUTHORIZED'],
                "Unauthorized",
                "ASHA worker ID not found in token"
            )
        
        validate_required_fields(body, ['push_token'])
        push_token = body['push_token']
        
        # Update push token in DynamoDB
        asha_table = dynamodb.Table('MaatriSahayak-AshaWorkers')
        asha_table.update_item(
            Key={'asha_worker_id': asha_worker_id},
            UpdateExpression='SET push_token = :token, updated_at = :updated',
            ExpressionAttributeValues={
                ':token': push_token,
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        log_info("Push token updated", asha_worker_id=asha_worker_id)
        
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
