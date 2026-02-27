#!/usr/bin/env python3
"""
Script to create a test user in Cognito User Pool
"""
import boto3
import sys
import os
from getpass import getpass

def create_cognito_user(user_pool_id, email, password, name, phone_number, role="asha_worker", district="Mumbai"):
    """Create a user in Cognito User Pool"""
    client = boto3.client('cognito-idp', region_name='ap-south-1')
    
    try:
        # Create user
        response = client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=email,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'name', 'Value': name},
                {'Name': 'phone_number', 'Value': phone_number},
                {'Name': 'custom:role', 'Value': role},
                {'Name': 'custom:district', 'Value': district}
            ],
            MessageAction='SUPPRESS'  # Don't send welcome email
        )
        
        print(f"✓ User created: {email}")
        
        # Set permanent password
        client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=email,
            Password=password,
            Permanent=True
        )
        
        print(f"✓ Password set for user: {email}")
        print(f"\nUser Details:")
        print(f"  Email: {email}")
        print(f"  Name: {name}")
        print(f"  Role: {role}")
        print(f"  District: {district}")
        
        return True
        
    except client.exceptions.UsernameExistsException:
        print(f"✗ User {email} already exists")
        return False
    except Exception as e:
        print(f"✗ Error creating user: {str(e)}")
        return False

def get_user_pool_id_from_stack(stack_name="maatrisahayak-dev"):
    """Get User Pool ID from CloudFormation stack outputs"""
    client = boto3.client('cloudformation', region_name='ap-south-1')
    
    try:
        response = client.describe_stacks(StackName=stack_name)
        outputs = response['Stacks'][0]['Outputs']
        
        for output in outputs:
            if output['OutputKey'] == 'UserPoolId':
                return output['OutputValue']
        
        print(f"✗ UserPoolId not found in stack outputs")
        return None
        
    except Exception as e:
        print(f"✗ Error getting stack outputs: {str(e)}")
        return None

if __name__ == "__main__":
    print("=== Cognito User Creation Tool ===\n")
    
    # Get User Pool ID
    user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
    
    if not user_pool_id:
        print("Attempting to get User Pool ID from CloudFormation...")
        user_pool_id = get_user_pool_id_from_stack()
    
    if not user_pool_id:
        print("\nPlease provide User Pool ID:")
        user_pool_id = input("User Pool ID: ").strip()
    
    if not user_pool_id:
        print("✗ User Pool ID is required")
        sys.exit(1)
    
    print(f"\nUsing User Pool ID: {user_pool_id}\n")
    
    # Get user details
    email = input("Email: ").strip()
    name = input("Full Name: ").strip()
    phone_number = input("Phone Number (format: +919876543210): ").strip()
    password = getpass("Password (min 8 chars, uppercase, lowercase, number): ")
    role = input("Role [asha_worker]: ").strip() or "asha_worker"
    district = input("District [Mumbai]: ").strip() or "Mumbai"
    
    # Create user
    success = create_cognito_user(
        user_pool_id=user_pool_id,
        email=email,
        password=password,
        name=name,
        phone_number=phone_number,
        role=role,
        district=district
    )
    
    if success:
        print("\n✓ User created successfully! You can now login with these credentials.")
    else:
        print("\n✗ Failed to create user")
        sys.exit(1)
