#!/usr/bin/env python3
"""
Reseed drivers table with correct field names
"""

import boto3
import os
from datetime import datetime, timedelta
from decimal import Decimal
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

# Initialize AWS clients
region = os.getenv('AWS_REGION', 'ap-south-1')
dynamodb = boto3.resource('dynamodb', region_name=region)

# Table name
DRIVERS_TABLE = 'maatrisahayak-dev-DriversTable-A304DXN8XIR6'

def convert_floats_to_decimal(obj):
    """Convert floats to Decimal for DynamoDB"""
    if isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    return obj

def clear_drivers():
    """Delete all existing drivers"""
    table = dynamodb.Table(DRIVERS_TABLE)
    
    # Scan all items
    response = table.scan()
    items = response.get('Items', [])
    
    # Delete each item
    for item in items:
        table.delete_item(Key={'id': item['id']})
    
    print(f"🗑️  Deleted {len(items)} old drivers")

def seed_drivers():
    """Seed drivers with correct field names"""
    table = dynamodb.Table(DRIVERS_TABLE)
    
    drivers = [
        {
            'id': 'driver-001',
            'name': 'Rajesh Kumar',
            'phone': '+919876543220',
            'email': 'rajesh.kumar@maatrisahayak.in',
            'licenseNumber': 'UP14-20190012345',
            'district': 'Kanpur',
            'verificationStatus': 'APPROVED',
            'ambulanceId': 'amb-001',
            'status': 'AVAILABLE',
            'totalRides': 45,
            'rating': Decimal('4.7'),
            'createdAt': (datetime.now() - timedelta(days=200)).isoformat(),
            'updatedAt': datetime.now().isoformat()
        },
        {
            'id': 'driver-002',
            'name': 'Amit Verma',
            'phone': '+919876543221',
            'email': 'amit.verma@maatrisahayak.in',
            'licenseNumber': 'UP14-20200023456',
            'district': 'Lucknow',
            'verificationStatus': 'APPROVED',
            'ambulanceId': 'amb-002',
            'status': 'ON_RIDE',
            'totalRides': 38,
            'rating': Decimal('4.5'),
            'createdAt': (datetime.now() - timedelta(days=180)).isoformat(),
            'updatedAt': datetime.now().isoformat()
        },
        {
            'id': 'driver-003',
            'name': 'Suresh Yadav',
            'phone': '+919876543222',
            'email': 'suresh.yadav@maatrisahayak.in',
            'licenseNumber': 'UP14-20210034567',
            'district': 'Kanpur',
            'verificationStatus': 'PENDING',
            'ambulanceId': 'amb-003',
            'status': 'OFFLINE',
            'totalRides': 0,
            'rating': Decimal('0'),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
    ]
    
    for driver in drivers:
        table.put_item(Item=convert_floats_to_decimal(driver))
    
    print(f"✅ Seeded {len(drivers)} drivers with correct structure")

if __name__ == '__main__':
    try:
        print("🔄 Reseeding drivers...")
        clear_drivers()
        seed_drivers()
        print("✅ Done!")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
