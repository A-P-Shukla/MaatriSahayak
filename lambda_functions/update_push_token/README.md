# Update Push Token Lambda Function

## Purpose
Updates ASHA worker's push notification token in DynamoDB when they login to mobile app.

## Functionality
- Receives push token from mobile app
- Updates token in DynamoDB for the authenticated ASHA worker
- Enables officers to send notifications to this device

## Input
```json
{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

## Output
```json
{
  "success": true,
  "data": {
    "asha_worker_id": "string",
    "push_token_updated": true
  }
}
```

## Authentication
Requires valid ASHA worker JWT token in Authorization header.

## Dependencies
- boto3

## DynamoDB Tables
- MaatriSahayak-AshaWorkers (update push_token field)
