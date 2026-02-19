# GitHub Actions Workflows

This directory contains CI/CD workflows for the MaatriSahayak project.

## Workflows

### 1. Test (`test.yml`)

**Trigger:** Pull requests and pushes to `develop` branch

**Purpose:** Run automated tests and checks on code changes

**Jobs:**
- **Lint**: Check code formatting with Black and Flake8
- **Validate SAM**: Validate CloudFormation template syntax
- **Test Lambda Functions**: Run unit tests for Lambda functions
- **Test Scripts**: Validate Python scripts
- **Security Scan**: Run Bandit security scanner
- **Check Dependencies**: Check for vulnerable dependencies with Safety

**Usage:**
- Automatically runs on every PR
- Must pass before merging to main

---

### 2. Deploy (`deploy.yml`)

**Trigger:** 
- Push to `main` or `production` branches
- Manual workflow dispatch

**Purpose:** Deploy the application to AWS

**Jobs:**
- Validate SAM template
- Build Lambda functions
- Deploy CloudFormation stack
- Seed test data (dev environment only)

**Manual Deployment:**
1. Go to Actions tab in GitHub
2. Select "Deploy to AWS" workflow
3. Click "Run workflow"
4. Choose environment (dev/staging/prod)
5. Click "Run workflow"

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Outputs:**
- API Endpoint URL
- Cognito User Pool ID
- Stack name and region

---

### 3. Seed Data (`seed-data.yml`)

**Trigger:** Manual workflow dispatch only

**Purpose:** Populate DynamoDB tables with test data

**Usage:**
1. Go to Actions tab in GitHub
2. Select "Seed Test Data" workflow
3. Click "Run workflow"
4. Choose environment (dev/staging)
5. Click "Run workflow"

**What it seeds:**
- 3 Pregnancies (LOW, HIGH, CRITICAL risk)
- 7 Vital Signs records
- 1 Emergency Event
- 3 Ambulances
- 2 Hospitals

**Note:** Only available for dev and staging environments

---

### 4. Cleanup (`cleanup.yml`)

**Trigger:** Manual workflow dispatch only

**Purpose:** Delete CloudFormation stack and all resources

**Usage:**
1. Go to Actions tab in GitHub
2. Select "Cleanup Stack" workflow
3. Click "Run workflow"
4. Enter stack name (default: maatrisahayak)
5. Type "DELETE" to confirm
6. Click "Run workflow"

**⚠️ Warning:** This will permanently delete:
- All DynamoDB tables and data
- All Lambda functions
- API Gateway
- Cognito User Pool
- IAM roles and policies

---

## Setting Up GitHub Secrets

To use these workflows, you need to configure the following secrets:

### Repository Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

**Required Secrets:**

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCY...` |

### Environment Secrets (Optional)

For environment-specific deployments:

1. Go to Settings → Environments
2. Create environments: `dev`, `staging`, `prod`
3. Add environment-specific secrets if needed

---

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![Test](https://github.com/YOUR_USERNAME/MaatriSahayak/workflows/Test/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/MaatriSahayak/workflows/Deploy%20to%20AWS/badge.svg)
```

---

## Deployment Environments

### Development (dev)
- **Branch:** `main`
- **Auto-deploy:** Yes
- **Seed data:** Yes (automatic)
- **Stack name:** `maatrisahayak`

### Staging (staging)
- **Branch:** Manual trigger
- **Auto-deploy:** No
- **Seed data:** Manual only
- **Stack name:** `maatrisahayak`

### Production (prod)
- **Branch:** `production`
- **Auto-deploy:** Yes
- **Seed data:** No
- **Stack name:** `maatrisahayak`

---

## Troubleshooting

### Deployment Fails

**Check:**
1. AWS credentials are valid
2. IAM user has required permissions
3. CloudFormation template is valid
4. No resource limits exceeded

**Common Issues:**
- Lambda layer size too large
- DynamoDB table already exists
- IAM role name conflicts

### Test Failures

**Check:**
1. Python version matches (3.13)
2. All dependencies installed
3. Code follows linting rules
4. SAM template syntax is correct

### Seed Data Fails

**Check:**
1. DynamoDB tables exist
2. Tables have correct names with environment suffix
3. AWS credentials have DynamoDB write permissions
4. Region is correct (ap-south-1)

---

## Best Practices

1. **Always test locally first** before pushing to GitHub
2. **Use pull requests** for code changes
3. **Review workflow logs** if deployment fails
4. **Don't commit secrets** to the repository
5. **Use environments** for production deployments
6. **Monitor AWS costs** after deployments
7. **Clean up unused stacks** to avoid charges

---

## Workflow Permissions

Each workflow requires specific AWS IAM permissions:

### Deploy Workflow
- CloudFormation: Full access
- Lambda: Create, update, delete functions
- API Gateway: Create, update, delete APIs
- DynamoDB: Create, update, delete tables
- Cognito: Create, update, delete user pools
- IAM: Create, update, delete roles

### Seed Data Workflow
- DynamoDB: PutItem, BatchWriteItem
- DynamoDB: DescribeTable

### Cleanup Workflow
- CloudFormation: DeleteStack
- All resources: Delete permissions

---

## Manual Deployment (Alternative)

If you prefer not to use GitHub Actions:

```bash
# Build
cd infrastructure
sam build

# Deploy
sam deploy --guided

# Seed data
cd ..
python scripts/seed_data.py
```

---

## Support

For issues with workflows:
1. Check workflow logs in Actions tab
2. Review CloudFormation events in AWS Console
3. Check Lambda function logs in CloudWatch
4. Verify IAM permissions

---

**Last Updated:** February 2026
