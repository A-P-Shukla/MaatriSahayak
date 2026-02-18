# MaatriSahayak - Lambda Functions Structure

## 📁 Complete Folder Structure

```
maatrisahayak/
├── README.md
├── REQUIREMENTS.md
├── DESIGN.md
├── PROJECT_OVERVIEW.md
├── IMPLEMENTATION_ROADMAP.md
├── WINNING_STRATEGY.md
├── QUICK_CHECKLIST.md
├── LAMBDA_FUNCTIONS_STRUCTURE.md
│
├── database/                          # Sample data for testing
│   ├── ambulance.json
│   ├── emergency.json
│   ├── hospital.json
│   ├── pregnancy.json
│   └── vitalsigns.json
│
├── lambda_functions/                  # All Lambda functions
│   │
│   ├── shared/                        # Shared utilities (Lambda Layer)
│   │   ├── __init__.py
│   │   ├── db_helper.py              # DynamoDB operations
│   │   ├── validators.py             # Input validation
│   │   ├── models.py                 # Data models/schemas
│   │   ├── utils.py                  # Common utilities
│   │   ├── constants.py              # Constants and enums
│   │   ├── exceptions.py             # Custom exceptions
│   │   └── requirements.txt          # Shared dependencies
│   │
│   ├── register_pregnancy/           # Function 1
│   │   ├── handler.py                # Main Lambda handler
│   │   ├── requirements.txt          # Function-specific dependencies
│   │   └── README.md                 # Function documentation
│   │
│   ├── record_vitals/                # Function 2
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── assess_risk/                  # Function 3
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── analyze_symptoms/             # Function 4
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── trigger_emergency/            # Function 5
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── find_nearest_ambulance/       # Function 6
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── update_ambulance_location/    # Function 7
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── send_notifications/           # Function 8
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── process_anc_card/             # Function 9
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── get_ambulance_route/          # Function 10
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── get_pregnancy_details/        # Function 11
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── list_pregnancies/             # Function 12
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   └── check_hospital_capacity/      # Function 13
│       ├── handler.py
│       ├── requirements.txt
│       └── README.md
│
├── infrastructure/                    # AWS Infrastructure as Code
│   ├── template.yaml                 # SAM template
│   ├── samconfig.toml                # SAM configuration
│   ├── parameters.json               # CloudFormation parameters
│   └── deploy.sh                     # Deployment script
│
├── step_functions/                    # Step Functions workflows
│   ├── emergency_workflow.json       # Emergency coordination workflow
│   └── README.md
│
├── tests/                            # Unit and integration tests
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_register_pregnancy.py
│   │   ├── test_record_vitals.py
│   │   ├── test_assess_risk.py
│   │   └── ...
│   ├── integration/
│   │   ├── test_emergency_flow.py
│   │   └── test_api_endpoints.py
│   └── fixtures/
│       ├── sample_pregnancy.json
│       └── sample_vitals.json
│
├── scripts/                          # Utility scripts
│   ├── setup_dynamodb.py            # Create DynamoDB tables
│   ├── seed_data.py                 # Populate test data
│   ├── deploy_all.sh                # Deploy all functions
│   └── test_local.py                # Local testing script
│
├── docs/                             # Additional documentation
│   ├── api/
│   │   └── openapi.yaml             # API specification
│   ├── architecture/
│   │   └── diagrams/                # Architecture diagrams
│   └── deployment/
│       └── DEPLOYMENT_GUIDE.md      # Step-by-step deployment
│
├── .github/                          # GitHub Actions CI/CD
│   └── workflows/
│       ├── deploy.yml               # Deployment workflow
│       └── test.yml                 # Testing workflow
│
├── .gitignore
├── requirements-dev.txt              # Development dependencies
└── Makefile                          # Common commands
```

---

## 📋 Complete List of Lambda Functions

### Core Functions (Priority 1 - Week 1)

#### 1. **register_pregnancy**
- **Purpose:** Register new pregnancy in the system
- **Trigger:** API Gateway POST `/api/v1/pregnancy/register`
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** DynamoDB

#### 2. **record_vitals**
- **Purpose:** Record vital signs and symptoms
- **Trigger:** API Gateway POST `/api/v1/vitals/record`
- **Memory:** 1024 MB
- **Timeout:** 60 seconds
- **Services:** DynamoDB, Lambda (async invoke AssessRisk)

#### 3. **assess_risk**
- **Purpose:** Calculate risk score using SageMaker ML model
- **Trigger:** Invoked by record_vitals, API Gateway GET `/api/v1/risk/assess/{id}`
- **Memory:** 2048 MB
- **Timeout:** 120 seconds
- **Services:** SageMaker, DynamoDB

#### 4. **analyze_symptoms**
- **Purpose:** Analyze symptoms using Amazon Bedrock
- **Trigger:** API Gateway POST `/api/v1/symptoms/analyze`
- **Memory:** 1024 MB
- **Timeout:** 90 seconds
- **Services:** Bedrock, DynamoDB

#### 5. **trigger_emergency**
- **Purpose:** Initiate emergency response workflow
- **Trigger:** API Gateway POST `/api/v1/emergency/trigger`
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** Step Functions, SNS, DynamoDB

---

### Emergency Workflow Functions (Priority 1 - Week 1)

#### 6. **find_nearest_ambulance**
- **Purpose:** Find and dispatch nearest available ambulance
- **Trigger:** Step Functions workflow
- **Memory:** 1024 MB
- **Timeout:** 60 seconds
- **Services:** DynamoDB, Location Service

#### 7. **send_notifications**
- **Purpose:** Send multi-channel notifications (SMS, Push, Email)
- **Trigger:** Step Functions workflow, other Lambda functions
- **Memory:** 512 MB
- **Timeout:** 60 seconds
- **Services:** SNS, Connect (optional)

---

### IoT & Tracking Functions (Priority 2 - Week 2)

#### 8. **update_ambulance_location**
- **Purpose:** Process GPS updates from ambulance IoT devices
- **Trigger:** IoT Rule, API Gateway PUT `/api/v1/ambulance/location`
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** DynamoDB, Timestream, AppSync, IoT Core

#### 9. **get_ambulance_route**
- **Purpose:** Calculate optimal route for ambulance
- **Trigger:** Invoked by find_nearest_ambulance, API Gateway
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** Location Service

---

### Data Processing Functions (Priority 2 - Week 2)

#### 10. **process_anc_card**
- **Purpose:** Extract data from ANC card images using Textract
- **Trigger:** API Gateway POST `/api/v1/anc-card/process`
- **Memory:** 2048 MB
- **Timeout:** 180 seconds
- **Services:** Textract, S3, DynamoDB

---

### Query Functions (Priority 2 - Week 2)

#### 11. **get_pregnancy_details**
- **Purpose:** Retrieve detailed pregnancy information
- **Trigger:** API Gateway GET `/api/v1/pregnancy/{id}`
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** DynamoDB

#### 12. **list_pregnancies**
- **Purpose:** List pregnancies with filtering and pagination
- **Trigger:** API Gateway GET `/api/v1/pregnancies`
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** DynamoDB

#### 13. **check_hospital_capacity**
- **Purpose:** Check hospital bed availability
- **Trigger:** Step Functions workflow, API Gateway
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Services:** DynamoDB

---

## 📦 Shared Layer Structure

### lambda_functions/shared/

This will be packaged as a Lambda Layer and attached to all functions.

**Files:**

1. **`__init__.py`** - Package initialization
2. **`db_helper.py`** - DynamoDB CRUD operations
3. **`validators.py`** - Input validation functions
4. **`models.py`** - Pydantic models for data validation
5. **`utils.py`** - Common utility functions
6. **`constants.py`** - Constants, enums, configuration
7. **`exceptions.py`** - Custom exception classes
8. **`requirements.txt`** - Shared dependencies

---

## 🔧 Key Files in Each Function

### Example: `lambda_functions/register_pregnancy/`

#### `handler.py`
```python
"""
Lambda function to register a new pregnancy in the system.
"""
import json
import os
import uuid
from datetime import datetime
from decimal import Decimal

# Shared layer imports (will be available via Lambda Layer)
from shared.db_helper import put_item, get_item
from shared.validators import validate_pregnancy_data
from shared.models import PregnancyRegistration
from shared.exceptions import ValidationError, DatabaseError
from shared.utils import create_response, log_info, log_error

def lambda_handler(event, context):
    """
    Main Lambda handler for pregnancy registration.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate input
        pregnancy_data = validate_pregnancy_data(body)
        
        # Generate unique ID
        pregnancy_id = f"PREG-{str(uuid.uuid4())[:8].upper()}"
        
        # Prepare item for DynamoDB
        item = {
            'pregnancy_id': pregnancy_id,
            'patient_name': pregnancy_data['patientName'],
            'age': pregnancy_data['age'],
            'blood_type': pregnancy_data.get('bloodType', 'UNKNOWN'),
            'gestational_age': pregnancy_data['gestationalAge'],
            'estimated_due_date': pregnancy_data['estimatedDueDate'],
            'asha_worker_id': pregnancy_data['ashaWorkerId'],
            'village': pregnancy_data['village'],
            'district': pregnancy_data['district'],
            'risk_level': 'LOW',  # Initial risk level
            'risk_score': Decimal('0'),
            'medical_history': pregnancy_data.get('medicalHistory', []),
            'emergency_contact': pregnancy_data.get('emergencyContact', {}),
            'created_at': int(datetime.utcnow().timestamp()),
            'last_updated': int(datetime.utcnow().timestamp()),
            'status': 'ACTIVE'
        }
        
        # Save to DynamoDB
        table_name = os.environ['PREGNANCIES_TABLE']
        put_item(table_name, item)
        
        log_info(f"Pregnancy registered successfully: {pregnancy_id}")
        
        # Return success response
        return create_response(200, {
            'success': True,
            'pregnancyId': pregnancy_id,
            'message': 'Pregnancy registered successfully'
        })
        
    except ValidationError as e:
        log_error(f"Validation error: {str(e)}")
        return create_response(400, {'error': str(e)})
        
    except DatabaseError as e:
        log_error(f"Database error: {str(e)}")
        return create_response(500, {'error': 'Failed to register pregnancy'})
        
    except Exception as e:
        log_error(f"Unexpected error: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Internal server error'})
```

#### `requirements.txt`
```txt
# Function-specific dependencies (if any)
# Most dependencies will be in shared layer
```

#### `README.md`
```markdown
# Register Pregnancy Lambda Function

## Purpose
Registers a new pregnancy in the MaatriSahayak system.

## Trigger
- API Gateway POST `/api/v1/pregnancy/register`

## Input
```json
{
  "patientName": "Jane Doe",
  "age": 28,
  "bloodType": "O+",
  "gestationalAge": 12,
  "estimatedDueDate": 1740000000,
  "ashaWorkerId": "ASHA-001",
  "village": "Village Name",
  "district": "District Name"
}
```

## Output
```json
{
  "success": true,
  "pregnancyId": "PREG-12345678",
  "message": "Pregnancy registered successfully"
}
```

## Environment Variables
- `PREGNANCIES_TABLE` - DynamoDB table name

## IAM Permissions Required
- `dynamodb:PutItem` on Pregnancies table
```

---

## 🛠️ Infrastructure Files

### `infrastructure/template.yaml` (SAM Template)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: MaatriSahayak - Maternal Health Emergency Response Platform

Globals:
  Function:
    Runtime: python3.11
    Timeout: 30
    MemorySize: 512
    Environment:
      Variables:
        PREGNANCIES_TABLE: !Ref PregnanciesTable
        VITAL_SIGNS_TABLE: !Ref VitalSignsTable
        EMERGENCY_EVENTS_TABLE: !Ref EmergencyEventsTable
        AMBULANCES_TABLE: !Ref AmbulancesTable
        HOSPITALS_TABLE: !Ref HospitalsTable
        SAGEMAKER_ENDPOINT: !Ref SageMakerEndpoint
        BEDROCK_MODEL_ID: anthropic.claude-3-haiku-20240307-v1:0
    Layers:
      - !Ref SharedLayer

Resources:
  # Lambda Layer for shared code
  SharedLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: maatrisahayak-shared
      Description: Shared utilities for MaatriSahayak Lambda functions
      ContentUri: lambda_functions/shared/
      CompatibleRuntimes:
        - python3.11

  # Lambda Functions
  RegisterPregnancyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: maatrisahayak-register-pregnancy
      CodeUri: lambda_functions/register_pregnancy/
      Handler: handler.lambda_handler
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /pregnancy/register
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref PregnanciesTable

  RecordVitalsFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: maatrisahayak-record-vitals
      CodeUri: lambda_functions/record_vitals/
      Handler: handler.lambda_handler
      MemorySize: 1024
      Timeout: 60
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /vitals/record
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref VitalSignsTable
        - DynamoDBCrudPolicy:
            TableName: !Ref PregnanciesTable
        - LambdaInvokePolicy:
            FunctionName: !Ref AssessRiskFunction

  # ... more functions ...

  # DynamoDB Tables
  PregnanciesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: maatrisahayak-pregnancies
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: pregnancy_id
          AttributeType: S
        - AttributeName: asha_worker_id
          AttributeType: S
        - AttributeName: district
          AttributeType: S
        - AttributeName: risk_score
          AttributeType: N
      KeySchema:
        - AttributeName: pregnancy_id
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: asha-worker-index
          KeySchema:
            - AttributeName: asha_worker_id
              KeyType: HASH
          Projection:
            ProjectionType: ALL
        - IndexName: district-risk-index
          KeySchema:
            - AttributeName: district
              KeyType: HASH
            - AttributeName: risk_score
              KeyType: RANGE
          Projection:
            ProjectionType: ALL

  # ... more tables ...

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
```

---

## 📝 Additional Files

### `.gitignore`
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# AWS SAM
.aws-sam/
samconfig.toml

# Environment
.env
*.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
.pytest_cache/
.coverage
htmlcov/

# Logs
*.log
```

### `Makefile`
```makefile
.PHONY: help install test deploy clean

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make test       - Run tests"
	@echo "  make deploy     - Deploy to AWS"
	@echo "  make clean      - Clean build artifacts"

install:
	pip install -r requirements-dev.txt
	cd lambda_functions/shared && pip install -r requirements.txt -t python/

test:
	pytest tests/ -v

deploy:
	sam build
	sam deploy --guided

clean:
	rm -rf .aws-sam
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
```

---

## 🚀 Next Steps

1. **Create the folder structure** (I can help with this)
2. **Implement shared utilities** (db_helper, validators, etc.)
3. **Implement core Lambda functions** (Week 1 priority)
4. **Create SAM template** for deployment
5. **Write tests** for each function
6. **Deploy to AWS** using SAM CLI

Would you like me to create this folder structure and start implementing the functions?
