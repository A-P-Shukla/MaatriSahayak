# MaatriSahayak - Emergency Workflow Testing Guide

## Overview
This guide will help you test the complete emergency workflow including Step Functions, Lambda functions, and notifications.

## Prerequisites
- AWS CLI configured with proper credentials
- AWS account with deployed MaatriSahayak stack
- Postman or curl for API testing
- Valid phone number for SMS testing (must be verified in SNS sandbox if in sandbox mode)

## Testing Components

### 1. Test SendNotifications Lambda Function

#### Test 1: Emergency Alert Notification

**Using AWS CLI:**
```bash
aws lambda invoke \
  --function-name maatrisahayak-send-notifications-dev \
  --payload '{
    "body": "{\"notification_type\": \"EMERGENCY_ALERT\", \"data\": {\"emergency_id\": \"test-001\", \"patient_name\": \"Test Patient\", \"patient_phone\": \"+919876543210\", \"asha_worker_phone\": \"+919876543211\", \"event_type\": \"SEVERE_BLEEDING\", \"severity\": \"CRITICAL\", \"location\": \"Test Location\", \"ambulance_number\": \"DL-01-AB-1234\", \"hospital_name\": \"Test Hospital\"}}"
  }' \
  response.json

cat response.json
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "data": {
      "sent_count": 2,
      "failed_count": 0,
      "results": [
        {
          "success": true,
          "phone": "+919876543210",
          "message_id": "..."
        },
        {
          "success": true,
          "phone": "+919876543211",
          "message_id": "..."
        }
      ]
    },
    "message": "Emergency alerts sent: 2 successful, 0 failed"
  }
}
```

#### Test 2: Risk Update Notification

```bash
aws lambda invoke \
  --function-name maatrisahayak-send-notifications-dev \
  --payload '{
    "body": "{\"notification_type\": \"RISK_UPDATE\", \"data\": {\"patient_name\": \"Test Patient\", \"risk_level\": \"HIGH\", \"risk_score\": 85, \"risk_factors\": [\"High Blood Pressure\", \"Gestational Diabetes\"], \"recommendations\": [\"Immediate medical consultation\", \"Monitor blood pressure daily\"], \"asha_worker_phone\": \"+919876543211\"}}"
  }' \
  response.json

cat response.json
```

#### Test 3: General Notification

```bash
aws lambda invoke \
  --function-name maatrisahayak-send-notifications-dev \
  --payload '{
    "body": "{\"notification_type\": \"GENERAL\", \"recipients\": [{\"phone\": \"+919876543210\", \"name\": \"Test User\"}], \"message\": \"This is a test notification from MaatriSahayak\", \"priority\": \"NORMAL\"}"
  }' \
  response.json

cat response.json
```

### 2. Test Step Functions Emergency Workflow

#### Method 1: Using AWS CLI

**Start Execution:**
```bash
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:ap-south-1:YOUR_ACCOUNT_ID:stateMachine:maatrisahayak-emergency-workflow-dev \
  --name test-emergency-$(date +%s) \
  --input '{
    "pregnancy_id": "test-pregnancy-001",
    "event_type": "SEVERE_BLEEDING",
    "severity": "CRITICAL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "district": "New Delhi",
    "patient_phone": "+919876543210",
    "asha_worker_phone": "+919876543211"
  }'
```

**Check Execution Status:**
```bash
# Get the execution ARN from the previous command output
aws stepfunctions describe-execution \
  --execution-arn <EXECUTION_ARN>
```

**View Execution History:**
```bash
aws stepfunctions get-execution-history \
  --execution-arn <EXECUTION_ARN> \
  --output json
```

#### Method 2: Using AWS Console

1. Go to AWS Step Functions console
2. Click on `maatrisahayak-emergency-workflow-dev`
3. Click "Start execution"
4. Paste this input:
```json
{
  "pregnancy_id": "test-pregnancy-001",
  "event_type": "SEVERE_BLEEDING",
  "severity": "CRITICAL",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "district": "New Delhi",
  "patient_phone": "+919876543210",
  "asha_worker_phone": "+919876543211"
}
```
5. Click "Start execution"
6. Watch the visual workflow execution in real-time

#### Method 3: Using API Gateway (if configured)

```bash
curl -X POST \
  https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/dev/emergency/workflow \
  -H 'Content-Type: application/json' \
  -d '{
    "pregnancy_id": "test-pregnancy-001",
    "event_type": "SEVERE_BLEEDING",
    "severity": "CRITICAL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "district": "New Delhi",
    "patient_phone": "+919876543210",
    "asha_worker_phone": "+919876543211"
  }'
```

### 3. Test Complete Emergency Flow

This tests the entire workflow from trigger to notification:

**Step 1: Prepare Test Data**

First, ensure you have test data in DynamoDB:

```bash
# Create a test pregnancy record
aws lambda invoke \
  --function-name maatrisahayak-register-pregnancy-dev \
  --payload '{
    "body": "{\"patient_name\": \"Test Patient\", \"age\": 25, \"lmp\": \"2025-12-01\", \"edd\": \"2026-09-08\", \"phone\": \"+919876543210\", \"address\": \"Test Address, New Delhi\", \"district\": \"New Delhi\", \"asha_worker_id\": \"asha-001\", \"asha_worker_phone\": \"+919876543211\", \"latitude\": 28.6139, \"longitude\": 77.2090}"
  }' \
  response.json

# Note the pregnancy_id from the response
cat response.json
```

**Step 2: Trigger Emergency**

```bash
# Use the pregnancy_id from Step 1
aws lambda invoke \
  --function-name maatrisahayak-trigger-emergency-dev \
  --payload '{
    "body": "{\"pregnancy_id\": \"<PREGNANCY_ID_FROM_STEP_1>\", \"event_type\": \"SEVERE_BLEEDING\", \"severity\": \"CRITICAL\", \"symptoms\": \"Heavy bleeding, dizziness\", \"latitude\": 28.6139, \"longitude\": 77.2090}"
  }' \
  response.json

cat response.json
```

**Step 3: Verify Notifications Sent**

Check your phone for SMS notifications. You should receive:
- Emergency alert with patient details
- Ambulance information (if available)
- Hospital information (if available)

**Step 4: Check CloudWatch Logs**

```bash
# View SendNotifications logs
aws logs tail /aws/lambda/maatrisahayak-send-notifications-dev --follow

# View TriggerEmergency logs
aws logs tail /aws/lambda/maatrisahayak-trigger-emergency-dev --follow

# View Step Functions execution logs
aws logs tail /aws/states/maatrisahayak-emergency-workflow-dev --follow
```

### 4. Test Parallel Execution

The Step Functions workflow executes two branches in parallel:
1. Find nearest ambulance
2. Send emergency notifications

**Test Parallel Execution:**

```bash
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:ap-south-1:YOUR_ACCOUNT_ID:stateMachine:maatrisahayak-emergency-workflow-dev \
  --name test-parallel-$(date +%s) \
  --input '{
    "pregnancy_id": "test-pregnancy-001",
    "event_type": "SEVERE_BLEEDING",
    "severity": "CRITICAL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "district": "New Delhi",
    "patient_phone": "+919876543210",
    "asha_worker_phone": "+919876543211"
  }'
```

**Verify Parallel Execution:**
1. Go to Step Functions console
2. Click on the execution
3. You should see both branches executing simultaneously:
   - FindAmbulance branch
   - SendEmergencyNotifications branch

### 5. Test Error Handling and Retries

#### Test 1: Invalid Phone Number

```bash
aws lambda invoke \
  --function-name maatrisahayak-send-notifications-dev \
  --payload '{
    "body": "{\"notification_type\": \"EMERGENCY_ALERT\", \"data\": {\"emergency_id\": \"test-001\", \"patient_name\": \"Test Patient\", \"patient_phone\": \"invalid-phone\", \"asha_worker_phone\": \"+919876543211\", \"event_type\": \"SEVERE_BLEEDING\", \"severity\": \"CRITICAL\"}}"
  }' \
  response.json

cat response.json
```

**Expected:** Should handle gracefully and report failed notification

#### Test 2: Missing Required Fields

```bash
aws lambda invoke \
  --function-name maatrisahayak-send-notifications-dev \
  --payload '{
    "body": "{\"notification_type\": \"GENERAL\", \"message\": \"Test\"}"
  }' \
  response.json

cat response.json
```

**Expected:** Should return validation error

#### Test 3: Step Functions Retry Logic

Simulate a Lambda failure to test retry logic:

```bash
# This will trigger retries in Step Functions
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:ap-south-1:YOUR_ACCOUNT_ID:stateMachine:maatrisahayak-emergency-workflow-dev \
  --name test-retry-$(date +%s) \
  --input '{
    "pregnancy_id": "non-existent-id",
    "event_type": "SEVERE_BLEEDING",
    "severity": "CRITICAL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "district": "New Delhi"
  }'
```

Watch the execution in the console - you should see retry attempts.

### 6. Test SNS Integration

#### Verify SNS Topic

```bash
aws sns list-topics --query "Topics[?contains(TopicArn, 'maatrisahayak-emergency-notifications')]"
```

#### Test Direct SNS Publish

```bash
aws sns publish \
  --phone-number "+919876543210" \
  --message "Test SMS from MaatriSahayak" \
  --message-attributes '{
    "AWS.SNS.SMS.SMSType": {
      "DataType": "String",
      "StringValue": "Transactional"
    }
  }'
```

**Note:** If you're in SNS sandbox mode, you need to verify phone numbers first:

```bash
# Verify a phone number
aws sns create-sms-sandbox-phone-number --phone-number "+919876543210"

# Check verification status
aws sns list-sms-sandbox-phone-numbers
```

### 7. Performance Testing

#### Test Response Times

```bash
# Test SendNotifications performance
time aws lambda invoke \
  --function-name maatrisahayak-send-notifications-dev \
  --payload '{
    "body": "{\"notification_type\": \"GENERAL\", \"recipients\": [{\"phone\": \"+919876543210\"}], \"message\": \"Performance test\", \"priority\": \"NORMAL\"}"
  }' \
  response.json
```

#### Test Concurrent Executions

```bash
# Run 10 concurrent emergency workflows
for i in {1..10}; do
  aws stepfunctions start-execution \
    --state-machine-arn arn:aws:states:ap-south-1:YOUR_ACCOUNT_ID:stateMachine:maatrisahayak-emergency-workflow-dev \
    --name test-concurrent-$i-$(date +%s) \
    --input "{
      \"pregnancy_id\": \"test-pregnancy-$i\",
      \"event_type\": \"SEVERE_BLEEDING\",
      \"severity\": \"CRITICAL\",
      \"latitude\": 28.6139,
      \"longitude\": 77.2090,
      \"district\": \"New Delhi\"
    }" &
done
wait
```

### 8. Monitoring and Debugging

#### CloudWatch Metrics

```bash
# Get Lambda invocation count
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=maatrisahayak-send-notifications-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Get Lambda error count
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=maatrisahayak-send-notifications-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

#### View Recent Logs

```bash
# View last 50 log events
aws logs tail /aws/lambda/maatrisahayak-send-notifications-dev --since 1h

# Filter logs for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/maatrisahayak-send-notifications-dev \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

## Test Checklist

Use this checklist to verify all functionality:

### SendNotifications Lambda
- [ ] Emergency alert notification sent successfully
- [ ] Risk update notification sent successfully
- [ ] General notification sent successfully
- [ ] SMS received on phone
- [ ] Multiple recipients handled correctly
- [ ] Invalid phone number handled gracefully
- [ ] Missing required fields return validation error
- [ ] CloudWatch logs show successful execution

### Step Functions Workflow
- [ ] Workflow starts successfully
- [ ] TriggerEmergency task executes
- [ ] Parallel branches execute simultaneously
- [ ] FindAmbulance task completes
- [ ] SendNotifications task completes
- [ ] Workflow completes successfully
- [ ] Retry logic works on failures
- [ ] Error handling catches failures
- [ ] Execution history is visible in console

### End-to-End Emergency Flow
- [ ] Pregnancy registered successfully
- [ ] Emergency triggered successfully
- [ ] Ambulance found (if available)
- [ ] Notifications sent to patient
- [ ] Notifications sent to ASHA worker
- [ ] Emergency event stored in DynamoDB
- [ ] Complete flow takes < 10 seconds

### SNS Integration
- [ ] SNS topic exists
- [ ] Direct SNS publish works
- [ ] Phone numbers verified (if in sandbox)
- [ ] SMS delivery confirmed

### Performance
- [ ] Lambda cold start < 3 seconds
- [ ] Lambda warm execution < 1 second
- [ ] Step Functions execution < 10 seconds
- [ ] Concurrent executions handled correctly

## Troubleshooting

### Issue: SMS not received

**Solutions:**
1. Check if phone number is verified in SNS sandbox
2. Verify phone number format (+91XXXXXXXXXX)
3. Check SNS spending limits
4. Check CloudWatch logs for SNS errors

### Issue: Step Functions execution fails

**Solutions:**
1. Check Lambda function permissions
2. Verify Lambda function ARNs in state machine definition
3. Check input format matches expected schema
4. Review execution history for specific error

### Issue: Lambda timeout

**Solutions:**
1. Increase Lambda timeout in template.yaml
2. Optimize Lambda code
3. Check DynamoDB query performance
4. Review CloudWatch logs for bottlenecks

### Issue: Permission denied errors

**Solutions:**
1. Check IAM roles and policies
2. Verify Lambda execution role has required permissions
3. Check Step Functions role has Lambda invoke permissions
4. Verify SNS publish permissions

## Next Steps

After successful testing:

1. **Update phone numbers** in test scripts with real numbers
2. **Move out of SNS sandbox** for production use
3. **Set up CloudWatch alarms** for failures
4. **Configure SNS spending limits**
5. **Test with mobile app** integration
6. **Perform load testing** with realistic traffic
7. **Set up monitoring dashboard**

## Resources

- [AWS Step Functions Documentation](https://docs.aws.amazon.com/step-functions/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

---

**Last Updated:** February 20, 2026
**Status:** All components deployed and ready for testing
