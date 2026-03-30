"""
MaatriSahayak - Handle SES Bounce & Complaint Notifications
Triggered by SNS when SES reports a bounce or complaint.
Adds bad emails to EmailSuppressionList DynamoDB table.
"""

import json
import os
import boto3
from datetime import datetime
from shared import log_info, log_error

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('EMAIL_SUPPRESSION_TABLE', 'EmailSuppressionList'))


def lambda_handler(event, context):
    try:
        for record in event['Records']:
            message = json.loads(record['Sns']['Message'])
            notification_type = message.get('notificationType')

            if notification_type == 'Bounce':
                _handle_bounce(message)
            elif notification_type == 'Complaint':
                _handle_complaint(message)

        return {'statusCode': 200}
    except Exception as e:
        log_error("Failed to process SES notification", e)
        return {'statusCode': 500}


def _handle_bounce(message):
    bounce = message['bounce']
    if bounce['bounceType'] != 'Permanent':
        return
    for recipient in bounce['bouncedRecipients']:
        _suppress(recipient['emailAddress'], 'bounce', bounce.get('bounceSubType', 'Unknown'))


def _handle_complaint(message):
    for recipient in message['complaint']['complainedRecipients']:
        _suppress(recipient['emailAddress'], 'complaint', 'Marked as spam')


def _suppress(email: str, reason: str, details: str):
    table.put_item(Item={
        'email': email.lower(),
        'reason': reason,
        'details': details,
        'suppressed_at': datetime.utcnow().isoformat(),
    })
    log_info("Email suppressed", email=email, reason=reason, details=details)
