#!/bin/bash
# Script to create a test user in Cognito User Pool

# Configuration
USER_POOL_ID="${COGNITO_USER_POOL_ID:-your-user-pool-id}"
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-Test@1234}"
NAME="${3:-Test User}"
PHONE="${4:-+919876543210}"
REGION="ap-south-1"

echo "Creating user in Cognito User Pool..."
echo "User Pool ID: $USER_POOL_ID"
echo "Email: $EMAIL"

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --user-attributes \
    Name=email,Value="$EMAIL" \
    Name=email_verified,Value=true \
    Name=name,Value="$NAME" \
    Name=phone_number,Value="$PHONE" \
  --message-action SUPPRESS \
  --region "$REGION"

if [ $? -eq 0 ]; then
  echo "✓ User created successfully"
  
  # Set permanent password
  echo "Setting password..."
  aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --password "$PASSWORD" \
    --permanent \
    --region "$REGION"
  
  if [ $? -eq 0 ]; then
    echo "✓ Password set successfully"
    echo ""
    echo "Login credentials:"
    echo "  Email: $EMAIL"
    echo "  Password: $PASSWORD"
  else
    echo "✗ Failed to set password"
  fi
else
  echo "✗ Failed to create user"
fi
