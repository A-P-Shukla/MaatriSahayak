# MaatriSahayak - AI-Powered Maternal Emergency Response Platform

## Overview

MaatriSahayak is an AI-powered maternal emergency response platform designed to reduce maternal mortality in rural India by providing real-time risk assessment, emergency response coordination, and ambulance tracking.

## Architecture

- **Backend**: AWS Lambda (Python 3.12) + API Gateway
- **Database**: Amazon DynamoDB
- **Authentication**: Amazon Cognito
- **AI/ML**: Amazon Bedrock + SageMaker
- **Infrastructure**: AWS SAM (Serverless Application Model)

## Project Structure

```
MaatriSahayak/
├── infrastructure/          # AWS SAM templates
│   ├── template.yaml       # CloudFormation template
│   └── samconfig.toml      # SAM configuration
├── lambda_functions/        # Lambda function code
│   ├── shared/             # Shared utilities and models
│   ├── register_pregnancy/ # Register new pregnancy
│   ├── record_vitals/      # Record vital signs
│   ├── list_pregnancies/   # List pregnancies with filters
│   └── get_pregnancy_details/ # Get pregnancy details
├── frontend/               # React web dashboard
├── docs/                   # Documentation
│   └── api/               # API documentation
│       ├── openapi.yaml
│       └── postman_collection.json
└── database/              # Sample data
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- AWS SAM CLI installed
- Python 3.12
- Node.js (for frontend)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MaatriSahayak
```

### 2. Deploy Backend Infrastructure

```bash
cd infrastructure
sam build
sam deploy --guided
```

During deployment, provide:
- Stack name: `maatrisahayak`
- AWS Region: `ap-south-1` (or your preferred region)
- Environment: `dev`
- Confirm changes: `y`
- Allow IAM role creation: `y`

### 3. Note the API Endpoint

After deployment, save the `ApiEndpoint` from the outputs:
```
https://<api-id>.execute-api.<region>.amazonaws.com/dev
```

### 4. Test the APIs

#### Using Browser
```
https://<api-endpoint>/dev/pregnancies
```

#### Using Postman
1. Import collection: `docs/api/postman_collection.json`
2. Update `base_url` variable with your API endpoint
3. Test the requests

## API Endpoints

### Pregnancies

- **POST /pregnancies** - Register new pregnancy
- **GET /pregnancies** - List all pregnancies (with pagination)
- **GET /pregnancies/{id}** - Get pregnancy details

### Vital Signs

- **POST /vitals** - Record vital signs

## Environment Variables

The Lambda functions use these environment variables (automatically set by SAM):

- `PREGNANCIES_TABLE` - DynamoDB pregnancies table name
- `VITAL_SIGNS_TABLE` - DynamoDB vital signs table name
- `EMERGENCY_EVENTS_TABLE` - DynamoDB emergency events table name
- `AMBULANCES_TABLE` - DynamoDB ambulances table name
- `HOSPITALS_TABLE` - DynamoDB hospitals table name

## DynamoDB Tables

- **maatrisahayak-pregnancies-dev** - Pregnancy records
- **maatrisahayak-vital-signs-dev** - Vital signs records
- **maatrisahayak-emergency-events-dev** - Emergency events
- **maatrisahayak-ambulances-dev** - Ambulance fleet data
- **maatrisahayak-hospitals-dev** - Hospital information

## Development

### Updating Lambda Functions

After making changes to Lambda code:

```bash
cd infrastructure
sam build
sam deploy
```

### Updating Shared Module

If you update the shared module, copy it to all Lambda functions:

```bash
cd lambda_functions
xcopy shared register_pregnancy\shared\ /E /I /Y
xcopy shared record_vitals\shared\ /E /I /Y
xcopy shared list_pregnancies\shared\ /E /I /Y
xcopy shared get_pregnancy_details\shared\ /E /I /Y
cd ..\infrastructure
sam build
sam deploy
```

### Viewing Logs

```bash
# List pregnancies function logs
aws logs tail /aws/lambda/maatrisahayak-list-pregnancies-dev --follow

# Register pregnancy function logs
aws logs tail /aws/lambda/maatrisahayak-register-pregnancy-dev --follow

# Record vitals function logs
aws logs tail /aws/lambda/maatrisahayak-record-vitals-dev --follow
```

## Testing

### Sample Request - Register Pregnancy

```bash
curl -X POST https://<api-endpoint>/dev/pregnancies \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Priya Sharma",
    "age": 26,
    "phone": "+919876543210",
    "district": "Sitapur",
    "village": "Rampur Kalan",
    "lmp_date": "2024-01-15",
    "edd": "2024-10-22",
    "blood_type": "O+",
    "asha_worker_id": "asha_001"
  }'
```

### Sample Request - Record Vitals

```bash
curl -X POST https://<api-endpoint>/dev/vitals \
  -H "Content-Type: application/json" \
  -d '{
    "pregnancy_id": "<pregnancy-id>",
    "bp_systolic": 120,
    "bp_diastolic": 80,
    "heart_rate": 75,
    "temperature": 37.0,
    "recorded_by": "asha_001"
  }'
```

## Troubleshooting

### Import Errors

If you see `ImportModuleError` in CloudWatch logs:

1. Ensure the shared module is copied to all Lambda functions
2. Check that `__init__.py` exports all required functions
3. Rebuild and redeploy

### Authentication Errors

If you see "Missing Authentication Token":

- Authentication is currently disabled for testing
- Ensure you're hitting the correct endpoint path (e.g., `/pregnancies` not just `/`)

### DynamoDB Errors

Check that:
- Tables exist in DynamoDB console
- Lambda functions have proper IAM permissions
- Environment variables are set correctly

## AWS Resources Created

- **Lambda Functions**: 4 functions (register, record, list, get)
- **API Gateway**: REST API with CORS enabled
- **DynamoDB Tables**: 5 tables with GSIs
- **Cognito User Pool**: For authentication (configured but not enforced)
- **IAM Roles**: Lambda execution roles with DynamoDB permissions
- **CloudWatch Log Groups**: For Lambda function logs

## Cleanup

To delete all AWS resources:

```bash
cd infrastructure
sam delete
```

This will remove:
- Lambda functions
- API Gateway
- DynamoDB tables (data will be lost)
- IAM roles
- CloudWatch logs

## Next Steps

1. Enable Cognito authentication
2. Implement remaining Lambda functions (emergency, ambulance tracking)
3. Deploy frontend dashboard
4. Integrate AI/ML models (Bedrock, SageMaker)
5. Set up monitoring and alerts

## Support

For issues or questions:
- Check CloudWatch logs for detailed error messages
- Review AWS SAM documentation: https://docs.aws.amazon.com/serverless-application-model/
- Check Lambda function code in `lambda_functions/` directory

## License

[Your License Here]

## Contributors

[Your Name/Team]

---

**Last Updated**: February 19, 2026
**Version**: 1.0.0
**Status**: Development
