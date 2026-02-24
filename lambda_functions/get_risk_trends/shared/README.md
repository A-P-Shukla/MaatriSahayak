# MaatriSahayak - Shared Lambda Layer

This directory contains the shared utilities, models, and helpers used across all Lambda functions in the MaatriSahayak platform.

## 📁 Files Overview

### `__init__.py`
Package initialization file that exports commonly used utilities for easy access across Lambda functions.

**Exports:**
- Exception classes (ValidationError, DatabaseError, etc.)
- Utility functions (create_response, logging, ID generation, etc.)
- Constants (RISK_LEVELS, EMERGENCY_STATUS, etc.)

### `constants.py`
Application-wide constants and enumerations.

**Key Constants:**
- `RISK_LEVELS`: Risk level definitions (LOW, MEDIUM, HIGH, CRITICAL)
- `EMERGENCY_STATUS`: Emergency event status values
- `AMBULANCE_STATUS`: Ambulance availability status
- `TABLE_NAMES`: DynamoDB table names
- `GSI_NAMES`: Global Secondary Index names
- `VITAL_THRESHOLDS`: Medical thresholds for vital signs
- `ALERT_TYPES`: Types of medical alerts
- `EVENT_TYPES`: Emergency event types
- `HTTP_STATUS`: HTTP status codes
- `ERROR_MESSAGES`: Standardized error messages
- `SUCCESS_MESSAGES`: Standardized success messages

### `exceptions.py`
Custom exception classes for better error handling.

**Exception Classes:**
- `MaatriSahayakException`: Base exception class
- `ValidationError`: Input validation failures (400)
- `DatabaseError`: Database operation failures (500)
- `ResourceNotFoundError`: Resource not found (404)
- `UnauthorizedError`: Authentication/authorization failures (401)
- `ServiceError`: External service failures (503)
- `ConflictError`: Data conflicts (409)
- `RateLimitError`: Rate limit exceeded (429)

**Usage Example:**
```python
from shared import ValidationError

if not data.get('phone'):
    raise ValidationError("Phone number is required", field='phone')
```

### `utils.py`
Common utility functions used across Lambda functions.

**Key Functions:**

**Response Helpers:**
- `create_response(status_code, body, headers)`: Create API Gateway response
- `create_success_response(data, message)`: Create success response
- `create_error_response(status_code, error, message, details)`: Create error response

**Logging:**
- `log_info(message, **kwargs)`: Log info with structured data
- `log_error(message, error, **kwargs)`: Log error with structured data
- `log_warning(message, **kwargs)`: Log warning with structured data

**ID and Timestamp:**
- `generate_id(prefix)`: Generate unique ID with optional prefix
- `get_current_timestamp()`: Get current timestamp in ISO format
- `format_timestamp(timestamp, format_type)`: Format timestamp

**Event Parsing:**
- `parse_event_body(event)`: Parse API Gateway event body
- `get_path_parameter(event, param_name)`: Get path parameter
- `get_query_parameter(event, param_name, default)`: Get query parameter

**Utilities:**
- `calculate_distance(lat1, lon1, lat2, lon2)`: Calculate distance using Haversine formula
- `sanitize_input(data, max_length)`: Sanitize user input
- `chunk_list(items, chunk_size)`: Split list into chunks
- `convert_decimals(obj)`: Convert Decimal objects to int/float

**Usage Example:**
```python
from shared import create_success_response, log_info, generate_id

pregnancy_id = generate_id('preg_')
log_info("Creating pregnancy", pregnancy_id=pregnancy_id)
return create_success_response({'id': pregnancy_id})
```

### `db_helper.py`
Helper functions for DynamoDB operations.

**Key Functions:**

**Basic Operations:**
- `get_table(table_name)`: Get DynamoDB table resource
- `put_item(table_name, item)`: Insert item into table
- `get_item(table_name, key, consistent_read)`: Get item by key
- `update_item(table_name, key, updates, return_values)`: Update item
- `delete_item(table_name, key)`: Delete item

**Query and Scan:**
- `query_items(table_name, key_condition_expression, ...)`: Query items
- `scan_items(table_name, filter_expression, ...)`: Scan items

**Batch Operations:**
- `batch_write_items(table_name, items)`: Batch write items
- `batch_get_items(table_name, keys)`: Batch get items

**Utilities:**
- `item_exists(table_name, key)`: Check if item exists
- `convert_to_decimals(obj)`: Convert floats to Decimals for DynamoDB

**Usage Example:**
```python
from shared import put_item, get_item
from shared.constants import TABLE_NAMES

# Insert pregnancy
put_item(TABLE_NAMES['PREGNANCIES'], pregnancy_data)

# Get pregnancy
pregnancy = get_item(
    TABLE_NAMES['PREGNANCIES'],
    {'id': pregnancy_id}
)
```

### `validators.py`
Input validation functions for data validation.

**Key Functions:**

**General Validation:**
- `validate_required_fields(data, required_fields)`: Check required fields
- `validate_phone_number(phone)`: Validate Indian phone number
- `validate_email(email)`: Validate email format
- `validate_age(age)`: Validate maternal age
- `validate_gestational_age(weeks)`: Validate gestational age
- `validate_blood_type(blood_type)`: Validate blood type
- `validate_coordinates(latitude, longitude)`: Validate GPS coordinates
- `validate_date(date_str, field_name)`: Validate date format

**Domain-Specific Validation:**
- `validate_pregnancy_data(data)`: Validate pregnancy registration data
- `validate_vital_signs(data)`: Validate vital signs data
- `validate_emergency_data(data)`: Validate emergency trigger data
- `validate_ambulance_data(data)`: Validate ambulance data
- `validate_risk_score(risk_score)`: Validate risk score (0-100)
- `validate_pagination_params(page, page_size)`: Validate pagination

**Usage Example:**
```python
from shared import validate_pregnancy_data, ValidationError

try:
    validate_pregnancy_data(pregnancy_data)
except ValidationError as e:
    return create_error_response(
        e.status_code,
        e.__class__.__name__,
        e.message,
        e.details
    )
```

### `models.py`
Pydantic models for data validation and serialization.

**Available Models:**
- `PregnancyModel`: Pregnancy data structure
- `VitalSignsModel`: Vital signs data structure
- `EmergencyModel`: Emergency event data structure
- `AmbulanceModel`: Ambulance data structure
- `HospitalModel`: Hospital data structure
- `RiskAssessmentModel`: Risk assessment result
- `SymptomAnalysisModel`: Symptom analysis result
- `NotificationModel`: Notification data
- `RouteModel`: Ambulance route data

**Usage Example:**
```python
from shared.models import PregnancyModel
from pydantic import ValidationError

try:
    pregnancy = PregnancyModel(**pregnancy_data)
    # Use pregnancy.model_dump() to get dict
except ValidationError as e:
    # Handle validation errors
    pass
```

### `requirements.txt`
Python dependencies for the shared layer.

**Dependencies:**
- `boto3`: AWS SDK for Python
- `botocore`: Low-level AWS SDK
- `pydantic`: Data validation and serialization
- `python-dotenv`: Environment variable management
- `python-dateutil`: Date/time utilities
- `simplejson`: JSON with Decimal support

## 🚀 Usage in Lambda Functions

### Import Examples

```python
# Import from shared layer
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    generate_id,
    get_current_timestamp,
    put_item,
    get_item,
    validate_pregnancy_data
)
from shared.constants import TABLE_NAMES, RISK_LEVELS
from shared.models import PregnancyModel
```

### Lambda Handler Example

```python
import json
from shared import (
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    ValidationError,
    DatabaseError,
    put_item,
    generate_id,
    get_current_timestamp,
    validate_pregnancy_data
)
from shared.constants import TABLE_NAMES

def lambda_handler(event, context):
    try:
        # Parse request body
        body = parse_event_body(event)
        
        # Validate input
        validate_pregnancy_data(body)
        
        # Generate ID and timestamp
        pregnancy_id = generate_id('preg_')
        timestamp = get_current_timestamp()
        
        # Prepare data
        pregnancy_data = {
            'id': pregnancy_id,
            'created_at': timestamp,
            'updated_at': timestamp,
            **body
        }
        
        # Save to database
        put_item(TABLE_NAMES['PREGNANCIES'], pregnancy_data)
        
        log_info("Pregnancy registered", pregnancy_id=pregnancy_id)
        
        return create_success_response(
            pregnancy_data,
            "Pregnancy registered successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            500,
            "InternalServerError",
            "An unexpected error occurred",
            {'error': str(e)}
        )
```

## 📦 Deployment as Lambda Layer

This shared code will be packaged as a Lambda Layer and attached to all Lambda functions.

### Layer Structure:
```
python/
└── shared/
    ├── __init__.py
    ├── constants.py
    ├── exceptions.py
    ├── utils.py
    ├── db_helper.py
    ├── validators.py
    ├── models.py
    └── requirements.txt
```

### Packaging Command:
```bash
# Create layer directory
mkdir -p layer/python

# Copy shared code
cp -r lambda_functions/shared layer/python/

# Install dependencies
pip install -r lambda_functions/shared/requirements.txt -t layer/python/

# Create zip file
cd layer
zip -r ../shared-layer.zip .
cd ..
```

### SAM Template Configuration:
```yaml
SharedLayer:
  Type: AWS::Serverless::LayerVersion
  Properties:
    LayerName: maatrisahayak-shared-layer
    Description: Shared utilities for MaatriSahayak Lambda functions
    ContentUri: layer/
    CompatibleRuntimes:
      - python3.11
    RetentionPolicy: Retain
```

## 🧪 Testing

### Unit Test Example:
```python
import unittest
from shared import generate_id, validate_phone_number, ValidationError

class TestSharedUtils(unittest.TestCase):
    def test_generate_id(self):
        id1 = generate_id('preg_')
        self.assertTrue(id1.startswith('preg_'))
    
    def test_validate_phone_number(self):
        # Valid phone
        self.assertTrue(validate_phone_number('+919876543210'))
        
        # Invalid phone
        with self.assertRaises(ValidationError):
            validate_phone_number('123')
```

## 📝 Best Practices

1. **Error Handling**: Always use custom exceptions for better error tracking
2. **Logging**: Use structured logging with `log_info`, `log_error`, `log_warning`
3. **Validation**: Validate all inputs before processing
4. **Type Safety**: Use Pydantic models for complex data structures
5. **Constants**: Use constants from `constants.py` instead of hardcoding values
6. **DynamoDB**: Use `db_helper` functions for consistent error handling
7. **Responses**: Use `create_success_response` and `create_error_response` for API responses

## 🔧 Maintenance

When updating the shared layer:
1. Update the code in `lambda_functions/shared/`
2. Increment version in `__init__.py`
3. Update this README if adding new functions
4. Run tests to ensure compatibility
5. Redeploy the Lambda Layer
6. Update Lambda functions to use new layer version

## 📚 Additional Resources

- [AWS Lambda Layers Documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Boto3 DynamoDB Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/dynamodb.html)
