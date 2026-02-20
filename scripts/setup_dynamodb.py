#!/usr/bin/env python3
"""
MaatriSahayak - DynamoDB Tables Setup Script

This script creates all required DynamoDB tables for the MaatriSahayak platform.
It will prompt before deleting existing tables.

Usage:
    python scripts/setup_dynamodb.py
"""

import boto3
import sys
import os
from pathlib import Path
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from {env_path}")
else:
    print(f"⚠️  No .env file found at {env_path}")
    print("   Using system environment variables or AWS CLI configuration")


# Table configurations
TABLES_CONFIG = {
    'maatrisahayak-pregnancies-dev': {
        'AttributeDefinitions': [
            {'AttributeName': 'id', 'AttributeType': 'S'},
            {'AttributeName': 'asha_worker_id', 'AttributeType': 'S'},
            {'AttributeName': 'district', 'AttributeType': 'S'},
            {'AttributeName': 'risk_score', 'AttributeType': 'N'},
            {'AttributeName': 'expected_delivery_date', 'AttributeType': 'N'},
        ],
        'KeySchema': [
            {'AttributeName': 'id', 'KeyType': 'HASH'},
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'asha-worker-index',
                'KeySchema': [
                    {'AttributeName': 'asha_worker_id', 'KeyType': 'HASH'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
            {
                'IndexName': 'district-risk-index',
                'KeySchema': [
                    {'AttributeName': 'district', 'KeyType': 'HASH'},
                    {'AttributeName': 'risk_score', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
            {
                'IndexName': 'delivery-date-index',
                'KeySchema': [
                    {'AttributeName': 'expected_delivery_date', 'KeyType': 'HASH'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
        ],
        'BillingMode': 'PAY_PER_REQUEST',
    },
    'maatrisahayak-vital-signs-dev': {
        'AttributeDefinitions': [
            {'AttributeName': 'pregnancy_id', 'AttributeType': 'S'},
            {'AttributeName': 'timestamp', 'AttributeType': 'N'},
        ],
        'KeySchema': [
            {'AttributeName': 'pregnancy_id', 'KeyType': 'HASH'},
            {'AttributeName': 'timestamp', 'KeyType': 'RANGE'},
        ],
        'BillingMode': 'PAY_PER_REQUEST',
        'StreamSpecification': {
            'StreamEnabled': True,
            'StreamViewType': 'NEW_AND_OLD_IMAGES'
        },
    },
    'maatrisahayak-emergency-events-dev': {
        'AttributeDefinitions': [
            {'AttributeName': 'id', 'AttributeType': 'S'},
            {'AttributeName': 'pregnancy_id', 'AttributeType': 'S'},
            {'AttributeName': 'timestamp', 'AttributeType': 'N'},
            {'AttributeName': 'ambulance_id', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
        ],
        'KeySchema': [
            {'AttributeName': 'id', 'KeyType': 'HASH'},
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'pregnancy-events-index',
                'KeySchema': [
                    {'AttributeName': 'pregnancy_id', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
            {
                'IndexName': 'ambulance-events-index',
                'KeySchema': [
                    {'AttributeName': 'ambulance_id', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
            {
                'IndexName': 'status-index',
                'KeySchema': [
                    {'AttributeName': 'status', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
        ],
        'BillingMode': 'PAY_PER_REQUEST',
        'StreamSpecification': {
            'StreamEnabled': True,
            'StreamViewType': 'NEW_AND_OLD_IMAGES'
        },
    },
    'maatrisahayak-ambulances-dev': {
        'AttributeDefinitions': [
            {'AttributeName': 'id', 'AttributeType': 'S'},
            {'AttributeName': 'district', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
        ],
        'KeySchema': [
            {'AttributeName': 'id', 'KeyType': 'HASH'},
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'district-status-index',
                'KeySchema': [
                    {'AttributeName': 'district', 'KeyType': 'HASH'},
                    {'AttributeName': 'status', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
        ],
        'BillingMode': 'PAY_PER_REQUEST',
    },
    'maatrisahayak-hospitals-dev': {
        'AttributeDefinitions': [
            {'AttributeName': 'id', 'AttributeType': 'S'},
            {'AttributeName': 'district', 'AttributeType': 'S'},
            {'AttributeName': 'type', 'AttributeType': 'S'},
        ],
        'KeySchema': [
            {'AttributeName': 'id', 'KeyType': 'HASH'},
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'district-type-index',
                'KeySchema': [
                    {'AttributeName': 'district', 'KeyType': 'HASH'},
                    {'AttributeName': 'type', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
        ],
        'BillingMode': 'PAY_PER_REQUEST',
    },
    'maatrisahayak-asha-workers-dev': {
        'AttributeDefinitions': [
            {'AttributeName': 'id', 'AttributeType': 'S'},
            {'AttributeName': 'district', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
        ],
        'KeySchema': [
            {'AttributeName': 'id', 'KeyType': 'HASH'},
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'district-status-index',
                'KeySchema': [
                    {'AttributeName': 'district', 'KeyType': 'HASH'},
                    {'AttributeName': 'status', 'KeyType': 'RANGE'},
                ],
                'Projection': {'ProjectionType': 'ALL'},
            },
        ],
        'BillingMode': 'PAY_PER_REQUEST',
    },
}


def get_dynamodb_client():
    """Create and return DynamoDB client."""
    try:
        # Get AWS credentials from environment variables
        aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        
        # Create client with explicit credentials if provided
        if aws_access_key and aws_secret_key:
            print(f"🔑 Using credentials from .env file")
            print(f"📍 Region: {aws_region}")
            return boto3.client(
                'dynamodb',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=aws_region
            )
        else:
            print(f"🔑 Using AWS CLI configuration or IAM role")
            print(f"📍 Region: {aws_region}")
            return boto3.client('dynamodb', region_name=aws_region)
            
    except Exception as e:
        print(f"❌ Error creating DynamoDB client: {e}")
        print("\n💡 Make sure you have either:")
        print("   1. Created a .env file with AWS credentials (see .env.example)")
        print("   2. Configured AWS CLI: aws configure")
        print("   3. Set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
        sys.exit(1)


def table_exists(client, table_name):
    """Check if a table exists."""
    try:
        client.describe_table(TableName=table_name)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            return False
        raise


def delete_table(client, table_name):
    """Delete a DynamoDB table."""
    try:
        print(f"  🗑️  Deleting table: {table_name}...")
        client.delete_table(TableName=table_name)
        
        # Wait for table to be deleted
        waiter = client.get_waiter('table_not_exists')
        waiter.wait(TableName=table_name)
        
        print(f"  ✅ Table deleted: {table_name}")
        return True
    except ClientError as e:
        print(f"  ❌ Error deleting table {table_name}: {e}")
        return False


def create_table(client, table_name, config):
    """Create a DynamoDB table."""
    try:
        print(f"  📝 Creating table: {table_name}...")
        
        # Prepare table creation parameters
        params = {
            'TableName': table_name,
            'AttributeDefinitions': config['AttributeDefinitions'],
            'KeySchema': config['KeySchema'],
            'BillingMode': config['BillingMode'],
        }
        
        # Add GSIs if present
        if 'GlobalSecondaryIndexes' in config:
            params['GlobalSecondaryIndexes'] = config['GlobalSecondaryIndexes']
        
        # Add Stream specification if present
        if 'StreamSpecification' in config:
            params['StreamSpecification'] = config['StreamSpecification']
        
        # Create table
        client.create_table(**params)
        
        # Wait for table to be active
        waiter = client.get_waiter('table_exists')
        waiter.wait(TableName=table_name)
        
        print(f"  ✅ Table created: {table_name}")
        return True
    except ClientError as e:
        print(f"  ❌ Error creating table {table_name}: {e}")
        return False


def main():
    """Main function to setup DynamoDB tables."""
    print("=" * 70)
    print("🏥 MaatriSahayak - DynamoDB Tables Setup")
    print("=" * 70)
    print()
    
    # Get DynamoDB client
    client = get_dynamodb_client()
    
    # Check which tables exist
    existing_tables = []
    new_tables = []
    
    for table_name in TABLES_CONFIG.keys():
        if table_exists(client, table_name):
            existing_tables.append(table_name)
        else:
            new_tables.append(table_name)
    
    # Show status
    if existing_tables:
        print("ℹ️  The following tables already exist (will be skipped):")
        for table_name in existing_tables:
            print(f"   ✓ {table_name}")
        print()
    
    if not new_tables:
        print("✅ All tables already exist. Nothing to create.")
        print()
        print("=" * 70)
        return
    
    print("📝 The following tables will be created:")
    for table_name in new_tables:
        print(f"   • {table_name}")
    print()
    
    response = input("Do you want to proceed? (yes/no): ").strip().lower()
    
    if response not in ['yes', 'y']:
        print("\n❌ Setup cancelled by user.")
        sys.exit(0)
    
    # Create new tables only
    print("\n📝 Creating DynamoDB tables...")
    print()
    
    success_count = 0
    failed_count = 0
    
    for table_name in new_tables:
        config = TABLES_CONFIG[table_name]
        if create_table(client, table_name, config):
            success_count += 1
        else:
            failed_count += 1
        print()
    
    # Summary
    print("=" * 70)
    print("📊 Setup Summary")
    print("=" * 70)
    print(f"✅ Successfully created: {success_count} tables")
    print(f"⏭️  Skipped (already exist): {len(existing_tables)} tables")
    if failed_count > 0:
        print(f"❌ Failed to create: {failed_count} tables")
    print()
    
    if failed_count == 0:
        print("🎉 Setup completed successfully!")
        print()
        print("📋 All Tables:")
        for table_name in TABLES_CONFIG.keys():
            status = "✓ (existing)" if table_name in existing_tables else "✓ (new)"
            print(f"   {status} {table_name}")
    else:
        print("⚠️  Some tables failed to create. Please check the errors above.")
    
    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
