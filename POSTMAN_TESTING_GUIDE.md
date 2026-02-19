# MaatriSahayak API Testing Guide - Postman

## API Endpoint
```
Base URL: https://w4l9cd82rc.execute-api.ap-south-1.amazonaws.com/dev
```

## Prerequisites
1. Install Postman (https://www.postman.com/downloads/)
2. Create a Cognito user account for authentication
3. Get authentication token

---

## Step 1: Create Cognito User

Since the API uses Cognito authentication, you first need to create a user.

### Using AWS CLI:
```bash
# Create user
aws cognito-idp sign-up \
  --client-id 74rve6t3ni2rj6smjo5oqn4bup \
  --username user@example.com \
  --password YourPassword123! \
  --user-attributes Name=name,Value="Test User" Name=email,Value=user@example.com

# Confirm user (admin command)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id ap-south-1_oDZeMxxL2 \
  --username user@example.com

# Get authentication token
aws cognito-idp initiate-auth \
  --client-id 74rve6t3ni2rj6smjo5oqn4bup \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=YourPassword123!
```

Copy the `IdToken` from the response - you'll need it for API calls.

---

## Step 2: Configure Postman

### Set Authorization Header
For all API requests, add this header:
```
Authorization: Bearer <YOUR_ID_TOKEN>
```

Or in Postman:
1. Go to Authorization tab
2. Select Type: "Bearer Token"
3. Paste your IdToken in the Token field

---

## API Endpoints to Test

### 1. Register Pregnancy

**Method:** POST  
**URL:** `{{BASE_URL}}/pregnancies`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <YOUR_ID_TOKEN>
```

**Body (JSON):**
```json
{
  "patient_name": "Priya Sharma",
  "age": 26,
  "phone": "+919876543210",
  "district": "Sitapur",
  "block": "Biswan",
  "village": "Rampur Kalan",
  "latitude": 27.5706,
  "longitude": 80.2792,
  "lmp_date": "2025-11-15",
  "edd": "2026-08-22",
  "gestational_age_weeks": 14,
  "blood_type": "O+",
  "gravida": 2,
  "parity": 1,
  "previous_complications": ["gestational_diabetes"],
  "chronic_conditions": [],
  "asha_worker_id": "asha_001",
  "asha_worker_name": "Sunita Devi",
  "asha_worker_phone": "+919876543211"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "preg_xxxxx",
    "patient_name": "Priya Sharma",
    "status": "ACTIVE",
    "risk_level": "LOW",
    ...
  },
  "message": "Pregnancy registered successfully"
}
```

---

### 2. Record Vital Signs

**Method:** POST  
**URL:** `{{BASE_URL}}/vitals`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <YOUR_ID_TOKEN>
```

**Body (JSON):**
```json
{
  "pregnancy_id": "preg_xxxxx",
  "bp_systolic": 120,
  "bp_diastolic": 80,
  "heart_rate": 75,
  "temperature": 37.0,
  "oxygen_saturation": 98,
  "fetal_heart_rate": 145,
  "weight": 65.5,
  "symptoms": ["mild headache"],
  "notes": "Patient feeling well overall",
  "recorded_by": "asha_001"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "vital_xxxxx",
    "pregnancy_id": "preg_xxxxx",
    "alerts": [],
    "recorded_at": "2026-02-19T10:30:00.000Z",
    ...
  },
  "message": "Vital signs recorded successfully"
}
```

**Test High BP Alert:**
```json
{
  "pregnancy_id": "preg_xxxxx",
  "bp_systolic": 165,
  "bp_diastolic": 105,
  "heart_rate": 85,
  "temperature": 37.2,
  "recorded_by": "asha_001"
}
```

---

### 3. Get Pregnancy Details

**Method:** GET  
**URL:** `{{BASE_URL}}/pregnancies/{pregnancy_id}`  
**Example:** `{{BASE_URL}}/pregnancies/preg_xxxxx`  
**Headers:**
```
Authorization: Bearer <YOUR_ID_TOKEN>
```

**Query Parameters (Optional):**
- `include_vitals=true` (default: true)
- `vitals_limit=10` (default: 10)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "pregnancy": {
      "id": "preg_xxxxx",
      "patient_name": "Priya Sharma",
      "status": "ACTIVE",
      ...
    },
    "recent_vitals": [...],
    "vitals_count": 5
  }
}
```

---

### 4. List Pregnancies

**Method:** GET  
**URL:** `{{BASE_URL}}/pregnancies`  
**Headers:**
```
Authorization: Bearer <YOUR_ID_TOKEN>
```

**Query Parameters (Optional):**
- `asha_worker_id=asha_001` - Filter by ASHA worker
- `district=Sitapur` - Filter by district
- `risk_level=HIGH` - Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)
- `status=ACTIVE` - Filter by status
- `page=1` - Page number (default: 1)
- `page_size=20` - Items per page (default: 20, max: 100)

**Example URLs:**
```
{{BASE_URL}}/pregnancies?asha_worker_id=asha_001
{{BASE_URL}}/pregnancies?district=Sitapur&risk_level=HIGH
{{BASE_URL}}/pregnancies?page=1&page_size=10
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "pregnancies": [...],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_count": 45,
      "has_more": true,
      "returned_count": 20
    }
  }
}
```

---

## Common Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "ValidationError",
    "message": "Invalid input data",
    "details": {
      "field": "age",
      "error": "Age must be between 15 and 50"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```
**Solution:** Check your Authorization token is valid and not expired.

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "ResourceNotFoundError",
    "message": "Pregnancy not found: preg_xxxxx"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "ConflictError",
    "message": "Active pregnancy already exists for phone number +919876543210",
    "details": {
      "existing_pregnancy_id": "preg_12345"
    }
  }
}
```

---

## Postman Collection Setup

### Create Environment Variables
1. Click "Environments" in Postman
2. Create new environment "MaatriSahayak Dev"
3. Add variables:
   - `BASE_URL`: `https://w4l9cd82rc.execute-api.ap-south-1.amazonaws.com/dev`
   - `ID_TOKEN`: `<your_cognito_id_token>`
   - `PREGNANCY_ID`: `<save_from_register_response>`

### Use Variables in Requests
- URL: `{{BASE_URL}}/pregnancies`
- Authorization: `Bearer {{ID_TOKEN}}`
- Body: `"pregnancy_id": "{{PREGNANCY_ID}}"`

---

## Testing Workflow

1. **Create User & Get Token** (using AWS CLI)
2. **Register Pregnancy** → Save `pregnancy_id` from response
3. **Record Vitals** → Use saved `pregnancy_id`
4. **Get Pregnancy Details** → Verify vitals are included
5. **List Pregnancies** → Test different filters
6. **Test Error Cases:**
   - Register duplicate pregnancy (same phone)
   - Record vitals with invalid pregnancy_id
   - Test with expired token
   - Test with missing required fields

---

## Tips

- **Token Expiration:** Cognito tokens expire after 1 hour. Get a new token if you see 401 errors.
- **Save Responses:** Use Postman's "Tests" tab to auto-save IDs from responses to environment variables.
- **Test Alerts:** Try recording vitals with high BP (>160/110) or low oxygen (<90%) to trigger alerts.
- **Pagination:** Test with different page sizes to verify pagination works correctly.

---

## Quick Test Script

```javascript
// Add this to Postman "Tests" tab to auto-save pregnancy_id
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.id) {
        pm.environment.set("PREGNANCY_ID", response.data.id);
        console.log("Saved pregnancy_id:", response.data.id);
    }
}
```

---

## Need Help?

- Check CloudWatch Logs for Lambda function errors
- Verify Cognito user is confirmed
- Ensure all required fields are included in request body
- Check that table names match in Lambda environment variables
