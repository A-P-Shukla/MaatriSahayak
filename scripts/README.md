# MaatriSahayak - Scripts Documentation

This folder contains utility scripts for setting up and managing the MaatriSahayak platform.

## 📋 Available Scripts

### 1. `seed_data.py`
Populates DynamoDB tables with sample data for testing and demo.

**Usage:**
```bash
python scripts/seed_data.py
```

**Features:**
- Seeds realistic sample data into deployed DynamoDB tables
- Creates 3 pregnancies (LOW, HIGH, CRITICAL risk)
- Generates 7 days of vital signs
- Creates 1 completed emergency event
- Adds 3 ambulances (2 available, 1 in maintenance)
- Adds 2 hospitals with capacity information
- Uses environment suffix for table names (e.g., maatrisahayak-pregnancies-dev)

**Sample Data:**
- 3 Pregnancies
- 7 Vital Signs records
- 1 Emergency Event
- 3 Ambulances
- 2 Hospitals

---

### 2. `test_apis.py`
Tests deployed API endpoints with sample requests.

**Usage:**
```bash
# Set environment variables first
export API_BASE_URL=https://w4l9cd82rc.execute-api.ap-south-1.amazonaws.com/dev
export AUTH_TOKEN=your_cognito_id_token

# Run tests
python scripts/test_apis.py
```

**Features:**
- Tests all API endpoints
- Validates request/response formats
- Tests error handling
- Checks authentication

---

### 3. `test_local.py`
Tests Lambda functions and validates setup locally.

**Usage:**
```bash
python scripts/test_local.py
```

**Features:**
- Tests environment setup
- Validates database schema
- Checks API structure
- Tests data validation
- Verifies AWS credentials
- Checks Python dependencies

---

### 4. `setup_dynamodb.py`
**Note:** This script is for local development only. The CloudFormation stack already creates all required tables.

Creates DynamoDB tables manually if needed for testing.

**Usage:**
```bash
python scripts/setup_dynamodb.py
```

---

## 🚀 Quick Start Guide

### Prerequisites

1. **AWS Account with Deployed Stack**
   - The MaatriSahayak stack should already be deployed
   - API Endpoint: `https://w4l9cd82rc.execute-api.ap-south-1.amazonaws.com/dev`
   - Tables are created with `-dev` suffix

2. **Install Python 3.11+**
   ```bash
   # Check version
   python --version
   
   # Should be 3.11 or higher
   ```

3. **Install Required Packages**
   ```bash
   pip install boto3 python-dotenv requests
   
   # Or install from requirements file
   pip install -r scripts/requirements.txt
   ```

4. **Create .env File**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your AWS credentials
   # AWS_ACCESS_KEY_ID=your-access-key-id
   # AWS_SECRET_ACCESS_KEY=your-secret-access-key
   # AWS_DEFAULT_REGION=ap-south-1
   # ENVIRONMENT=dev
   ```

---

### Step 1: Configure AWS Credentials in .env

Create a `.env` file in the project root with your AWS credentials:

```bash
# .env file
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=ap-south-1
ENVIRONMENT=dev
API_BASE_URL=https://w4l9cd82rc.execute-api.ap-south-1.amazonaws.com/dev
```

**To get AWS credentials:**
1. Log in to AWS Console
2. Go to IAM → Users → Your User
3. Security Credentials tab
4. Create Access Key
5. Download and save the credentials
6. Add them to your `.env` file

**⚠️ Important:** Never commit the `.env` file to Git! It's already in `.gitignore`.

---

### Step 2: Seed Test Data

The DynamoDB tables are already created by CloudFormation. Now populate them with test data:

```bash
python scripts/seed_data.py
```

The script will:
1. Load AWS credentials from `.env` file
2. Connect to deployed DynamoDB tables (with -dev suffix)
3. Insert sample pregnancy, vital signs, emergency, ambulance, and hospital data

**Expected Output:**
```
✅ Loaded environment variables from /path/to/.env
🔑 Using credentials from .env file
📍 Region: ap-south-1

======================================================================
🌱 MaatriSahayak - Seed Data Script
======================================================================

This will populate tables with sample data. Continue? (yes/no): yes

🌱 Seeding data...

  📝 Seeding pregnancies...
  ✅ Seeded 3 pregnancies
  📝 Seeding vital signs...
  ✅ Seeded 7 vital signs records
  ... (more data)

======================================================================
🎉 Data seeding completed successfully!
======================================================================

📊 Seeded Data Summary:
   ✓ 3 Pregnancies
   ✓ 7 Vital Signs records
   ✓ 1 Emergency Event
   ✓ 3 Ambulances
   ✓ 2 Hospitals
```

---

### Step 3: Test APIs

Test the deployed API endpoints:

```bash
# First, get a Cognito authentication token
# See POSTMAN_TESTING_GUIDE.md for details

# Set the token in .env
echo "AUTH_TOKEN=your_cognito_id_token" >> .env

# Run API tests
python scripts/test_apis.py
```

---

### Step 4: Test Local Setup

```bash
python scripts/test_local.py
```

This validates your environment and setup.

---

## 🔧 Troubleshooting

### Error: "No .env file found"

**Solution:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your AWS credentials
nano .env  # or use any text editor
```

---

### Error: "AWS_ACCESS_KEY_ID: Not set"

**Solution:**
Open `.env` file and add your AWS credentials:
```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_DEFAULT_REGION=us-east-1
```

---

### Error: "You must specify a region"

**Solution:**
Add region to your `.env` file:
```bash
AWS_DEFAULT_REGION=us-east-1
```

---

### Error: "Unable to locate credentials"

**Solution:**
1. Check that `.env` file exists in project root
2. Verify credentials are correct in `.env` file
3. Make sure `python-dotenv` is installed:
   ```bash
   pip install python-dotenv
   ```

---

### Error: "ModuleNotFoundError: No module named 'dotenv'"

**Solution:**
```bash
pip install python-dotenv
```

---

### Error: "Table already exists"

**Solution:**
The script will prompt you to delete and recreate tables. Answer `yes` to proceed.

---

### Error: "Access Denied"

**Solution:**
Your AWS user needs the following permissions:
- `dynamodb:CreateTable`
- `dynamodb:DeleteTable`
- `dynamodb:DescribeTable`
- `dynamodb:PutItem`
- `dynamodb:GetItem`
- `dynamodb:Query`
- `dynamodb:Scan`

Add the `AmazonDynamoDBFullAccess` policy to your IAM user.

---

## 📊 Verifying Data in AWS Console

1. Go to AWS Console → DynamoDB
2. Click "Tables" in the left sidebar
3. You should see 5 tables with `-dev` suffix:
   - maatrisahayak-pregnancies-dev
   - maatrisahayak-vital-signs-dev
   - maatrisahayak-emergency-events-dev
   - maatrisahayak-ambulances-dev
   - maatrisahayak-hospitals-dev

4. Click on any table to view:
   - Items (data)
   - Indexes (GSIs)
   - Monitoring
   - Streams (if enabled)

---

## 🧹 Cleaning Up

### Delete Stack and All Resources

```bash
aws cloudformation delete-stack --stack-name maatrisahayak
```

This will delete:
- All DynamoDB tables
- All Lambda functions
- API Gateway
- Cognito User Pool
- IAM roles and policies

---

## 📝 Script Execution Order

For working with the deployed stack:

1. ✅ Configure `.env` file with AWS credentials
2. ✅ `seed_data.py` - Add sample data to deployed tables
3. ✅ `test_apis.py` - Test deployed API endpoints
4. ✅ `test_local.py` - Verify local environment setup

**Note:** The CloudFormation stack has already created all DynamoDB tables, Lambda functions, and API Gateway. You don't need to run `setup_dynamodb.py` or deploy scripts.

---

## 🔐 Security Best Practices

1. **Never commit AWS credentials** to Git
2. **Use IAM roles** for production
3. **Enable MFA** on your AWS account
4. **Use least privilege** IAM policies
5. **Rotate access keys** regularly
6. **Enable CloudTrail** for audit logging

---

## 💡 Tips

- Run `test_local.py` before deploying to catch issues early
- Use `seed_data.py` to quickly populate tables for demos
- Check CloudWatch Logs if Lambda functions fail
- Use DynamoDB Streams for real-time processing
- Monitor costs in AWS Cost Explorer

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Verify AWS credentials are configured
3. Ensure you have the required IAM permissions
4. Check AWS service quotas
5. Review CloudWatch Logs for detailed errors

---

**Happy Coding! 🚀**
