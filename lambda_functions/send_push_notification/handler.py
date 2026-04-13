"""
Send Push Notification to ASHA Workers
Sends emergency notifications from officer dashboard to ASHA mobile app
"""

import json
import boto3
import requests
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
        log_info("Push notification request received")
        body = parse_event_body(event)
        
        validate_required_fields(body, ['asha_worker_id', 'title', 'message'])
        
        asha_worker_id = body['asha_worker_id']
        title = body['title']
        message = body['message']
        notification_type = body.get('type', 'GENERAL')
        data = body.get('data', {})
        
        # Get ASHA worker's push token from DynamoDB
        asha_table = dynamodb.Table('MaatriSahayak-AshaWorkers')
        response = asha_table.get_item(Key={'asha_worker_id': asha_worker_id})
        
        if 'Item' not in response:
            return create_error_response(
                HTTP_STATUS['NOT_FOUND'],
                "AshaWorkerNotFound",
                f"ASHA worker {asha_worker_id} not found"
            )
        
        asha_worker = response['Item']
        push_token = asha_worker.get('push_token')
        
        if not push_token:
            return create_error_response(
                HTTP_STATUS['BAD_REQUEST'],
                "NoPushToken",
                "ASHA worker has not registered for push notifications"
            )
        
        # Send push notification via Expo Push API
        notification_payload = {
            'to': push_token,
            'title': title,
            'body': message,
            'sound': 'default',
            'priority': 'high',
            'data': {
                'type': notification_type,
                **data
            }
        }
        
        expo_response = requests.post(
            'https://exp.host/--/api/v2/push/send',
            json=notification_payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if expo_response.status_code != 200:
            log_error("Expo push failed", Exception(expo_response.text))
            return create_error_response(
                HTTP_STATUS['INTERNAL_ERROR'],
                "ExpoPushError",
                f"Failed to send push notification: {expo_response.text}"
            )
        
        sns_response = expo_response.json()
        
        log_info("Push notification sent", 
                 asha_worker_id=asha_worker_id,
                 asha_name=asha_worker.get('name'))
        
        return create_success_response({
            'asha_worker_id': asha_worker_id,
            'asha_name': asha_worker.get('name'),
            'notification_sent': True,
            'title': title,
            'message': message
        })
        
    except Exception as e:
        log_error("Error sending push notification", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "PushNotificationError",
            str(e)
        )
