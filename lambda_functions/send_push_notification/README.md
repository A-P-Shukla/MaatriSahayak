# Send Push Notification Lambda Function

## Purpose
Sends push notifications from officer dashboard to ASHA workers' mobile app.

## Functionality
- Retrieves ASHA worker's push token from DynamoDB
- Sends high-priority push notification via Expo Push API
- Validates ASHA worker exists and has registered for notifications

## Input
```json
{
  "asha_worker_id": "string",
  "title": "string",
  "message": "string",
  "type": "EMERGENCY|ALERT|GENERAL",
  "data": {}
}
```

## Output
```json
{
  "success": true,
  "data": {
    "message_id": "string",
    "asha_worker_id": "string",
    "notification_sent": true
  }
}
```

## Dependencies
- boto3
- requests (for Expo Push API)

## DynamoDB Tables
- MaatriSahayak-AshaWorkers (read push_token)
