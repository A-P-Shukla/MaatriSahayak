# MaatriSahayak - Scripts Documentation

This folder contains utility scripts for setting up and managing the MaatriSahayak platform.

## 📋 Available Scripts

### 1. `setup_dynamodb.py`
Creates all required DynamoDB tables for the platform.

**Usage:**
```bash
python scripts/setup_dynamodb.py
```

**Features:**
- Creates 5 DynamoDB tables with proper schemas
- Checks for existing tables
- Prompts before deleting existing tables
- Creates Global Secondary Indexes (GSIs)
- Enables DynamoDB Streams where needed
- Uses PAY_PER_REQUEST billing mode (cost-effective)

**Tables Created:**
- `maatrisahayak-pregnancies` - Pregnancy records
- `maatrisahayak-vital-signs` - Vital signs history
- `maatrisahayak-emergency-events` - Emergency events
- `maatrisahayak-ambulances` - Ambulance fleet
- `maatrisahayak-hospitals` - Hospital information

---

### 2. `seed_data.py`
Populates DynamoDB tables with sample data for testing and demo.

**Usage:**
```bash
python scripts/seed_data.py
```

**Features:**
- Seeds realistic sample data
- Creates 3 pregnancies (LOW, HIGH, CRITICAL risk)
- Generates 7 days of vital signs
- Creates 1 completed emergency event
- Adds 3 ambulances (2 available, 1 in maintenance)
- Adds 2 hospitals with capacity information

**Sample Data:**
- 3 Pregnancies
- 7 Vital Signs records
- 1 Emergency Event
- 3 Ambulances
- 2 Hospitals

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

### 4. `deploy_all.sh`
Deploys the entire platform to AWS (Lambda functions, API Gateway, etc.).

**Usage:**
```bash
bash scripts/deploy_all.sh
```

**Features:**
- Checks prerequisites (AWS CLI, SAM CLI, Python)
- Installs dependencies
- Builds SAM application
- Deploys to AWS
- Optionally sets up DynamoDB tables
- Optionally seeds test data
- Retrieves API endpoint

---

## 🚀 Quick Start Guide

### Prerequisites

1. **Install Python 3.11+**
   ```bash
   # Check version
   python --version
   
   # Should be 3.11 or higher
   ```

2. **Install Required Packages**
   ```bash
   pip install boto3 python-dotenv
   
   # Or install from requirements file
   pip install -r scripts/requirements.txt
   ```

3. **Create .env File**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your AWS credentials
   # AWS_ACCESS_KEY_ID=your-access-key-id
   # AWS_SECRET_ACCESS_KEY=your-secret-access-key
   # AWS_DEFAULT_REGION=us-east-1
   ```

---

### Step 1: Configure AWS Credentials in .env

Create a `.env` file in the project root with your AWS credentials:

```bash
# .env file
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-east-1
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

### Step 2: Create DynamoDB Tables

```bash
python scripts/setup_dynamodb.py
```

The script will:
1. Load AWS credentials from `.env` file
2. Check for existing tables
3. Prompt before deleting (if tables exist)
4. Create 5 DynamoDB tables

**Expected Output:**
```
✅ Loaded environment variables from /path/to/.env
🔑 Using credentials from .env file
📍 Region: us-east-1

======================================================================
🏥 MaatriSahayak - DynamoDB Tables Setup
======================================================================

📝 Creating DynamoDB tables...

  📝 Creating table: maatrisahayak-pregnancies...
  ✅ Table created: maatrisahayak-pregnancies

  📝 Creating table: maatrisahayak-vital-signs...
  ✅ Table created: maatrisahayak-vital-signs

  ... (more tables)

======================================================================
📊 Setup Summary
======================================================================
✅ Successfully created: 5 tables

🎉 All tables created successfully!

📋 Created Tables:
   ✓ maatrisahayak-pregnancies
   ✓ maatrisahayak-vital-signs
   ✓ maatrisahayak-emergency-events
   ✓ maatrisahayak-ambulances
   ✓ maatrisahayak-hospitals
```

---

### Step 3: Seed Test Data

```bash
python scripts/seed_data.py
```

**Expected Output:**
```
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

### Step 4: Test Local Setup

```bash
python scripts/test_local.py
```

This validates your environment and setup.

---

### Step 5: Deploy to AWS (Optional)

```bash
bash scripts/deploy_all.sh
```

This deploys Lambda functions and API Gateway to AWS.

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

## 📊 Verifying Tables in AWS Console

1. Go to AWS Console → DynamoDB
2. Click "Tables" in the left sidebar
3. You should see 5 tables:
   - maatrisahayak-pregnancies
   - maatrisahayak-vital-signs
   - maatrisahayak-emergency-events
   - maatrisahayak-ambulances
   - maatrisahayak-hospitals

4. Click on any table to view:
   - Items (data)
   - Indexes (GSIs)
   - Monitoring
   - Streams (if enabled)

---

## 🧹 Cleaning Up

### Delete All Tables

```bash
python scripts/setup_dynamodb.py
# Answer 'yes' when prompted to delete existing tables
# Then press Ctrl+C to cancel creation
```

Or manually delete from AWS Console:
1. Go to DynamoDB → Tables
2. Select each table
3. Click "Delete"

---

## 📝 Script Execution Order

For first-time setup:

1. ✅ `setup_dynamodb.py` - Create tables
2. ✅ `seed_data.py` - Add sample data
3. ✅ `test_local.py` - Verify setup
4. ✅ `deploy_all.sh` - Deploy to AWS (optional)

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
