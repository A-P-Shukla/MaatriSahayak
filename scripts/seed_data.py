#!/usr/bin/env python3
"""
MaatriSahayak - Seed Data Script

This script populates DynamoDB tables with sample data for testing and demo purposes.

Usage:
    python scripts/seed_data.py
"""

import boto3
import json
import sys
import os
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from {env_path}")
else:
    print(f"⚠️  No .env file found at {env_path}")
    print("   Using system environment variables or AWS CLI configuration")


def get_dynamodb_resource():
    """Create and return DynamoDB resource."""
    try:
        # Get AWS credentials from environment variables
        aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        
        # Create resource with explicit credentials if provided
        if aws_access_key and aws_secret_key:
            print(f"🔑 Using credentials from .env file")
            print(f"📍 Region: {aws_region}")
            return boto3.resource(
                'dynamodb',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=aws_region
            )
        else:
            print(f"🔑 Using AWS CLI configuration or IAM role")
            print(f"📍 Region: {aws_region}")
            return boto3.resource('dynamodb', region_name=aws_region)
            
    except Exception as e:
        print(f"❌ Error creating DynamoDB resource: {e}")
        print("\n💡 Make sure you have either:")
        print("   1. Created a .env file with AWS credentials (see .env.example)")
        print("   2. Configured AWS CLI: aws configure")
        print("   3. Set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
        sys.exit(1)


def convert_floats_to_decimal(obj):
    """Convert float values to Decimal for DynamoDB."""
    if isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    return obj


def seed_pregnancies(dynamodb):
    """Seed pregnancies table with sample data."""
    table = dynamodb.Table('maatrisahayak-pregnancies')
    
    print("  📝 Seeding pregnancies...")
    
    pregnancies = [
        {
            'pregnancy_id': 'PREG-001',
            'patient_id': 'PAT-001',
            'patient_name': 'Sunita Devi',
            'age': 28,
            'blood_type': 'O+',
            'risk_level': 'HIGH',
            'risk_score': Decimal('75'),
            'gestational_age': 32,
            'estimated_due_date': int((datetime.now() + timedelta(days=56)).timestamp()),
            'asha_worker_id': 'ASHA-001',
            'village': 'Rampur',
            'district': 'Patna',
            'assigned_hospital_id': 'HOSP-001',
            'last_updated': int(datetime.now().timestamp()),
            'created_at': int((datetime.now() - timedelta(days=224)).timestamp()),
            'medical_history': ['gestational_diabetes'],
            'current_conditions': ['high_blood_pressure'],
            'emergency_contact': {
                'name': 'Rajesh Kumar',
                'phone': '+919876543210'
            },
            'status': 'ACTIVE'
        },
        {
            'pregnancy_id': 'PREG-002',
            'patient_id': 'PAT-002',
            'patient_name': 'Priya Sharma',
            'age': 24,
            'blood_type': 'A+',
            'risk_level': 'LOW',
            'risk_score': Decimal('25'),
            'gestational_age': 20,
            'estimated_due_date': int((datetime.now() + timedelta(days=140)).timestamp()),
            'asha_worker_id': 'ASHA-001',
            'village': 'Rampur',
            'district': 'Patna',
            'assigned_hospital_id': 'HOSP-001',
            'last_updated': int(datetime.now().timestamp()),
            'created_at': int((datetime.now() - timedelta(days=140)).timestamp()),
            'medical_history': [],
            'current_conditions': [],
            'emergency_contact': {
                'name': 'Amit Sharma',
                'phone': '+919876543211'
            },
            'status': 'ACTIVE'
        },
        {
            'pregnancy_id': 'PREG-003',
            'patient_id': 'PAT-003',
            'patient_name': 'Anita Singh',
            'age': 35,
            'blood_type': 'B+',
            'risk_level': 'CRITICAL',
            'risk_score': Decimal('92'),
            'gestational_age': 36,
            'estimated_due_date': int((datetime.now() + timedelta(days=28)).timestamp()),
            'asha_worker_id': 'ASHA-002',
            'village': 'Madhubani',
            'district': 'Patna',
            'assigned_hospital_id': 'HOSP-001',
            'last_updated': int(datetime.now().timestamp()),
            'created_at': int((datetime.now() - timedelta(days=252)).timestamp()),
            'medical_history': ['previous_c_section', 'anemia'],
            'current_conditions': ['severe_preeclampsia'],
            'emergency_contact': {
                'name': 'Vijay Singh',
                'phone': '+919876543212'
            },
            'status': 'ACTIVE'
        },
    ]
    
    for pregnancy in pregnancies:
        table.put_item(Item=pregnancy)
    
    print(f"  ✅ Seeded {len(pregnancies)} pregnancies")


def seed_vital_signs(dynamodb):
    """Seed vital signs table with sample data."""
    table = dynamodb.Table('maatrisahayak-vital-signs')
    
    print("  📝 Seeding vital signs...")
    
    # Generate vital signs for PREG-001 (last 7 days)
    vital_signs = []
    base_time = datetime.now()
    
    for i in range(7):
        timestamp = int((base_time - timedelta(days=i)).timestamp())
        vital_signs.append({
            'pregnancy_id': 'PREG-001',
            'timestamp': timestamp,
            'vital_sign_id': f'VS-001-{i}',
            'heart_rate': 80 + random.randint(-5, 10),
            'temperature': Decimal('37.2'),
            'oxygen_saturation': 98,
            'fetal_heart_rate': 145 + random.randint(-10, 10),
            'contraction_frequency': 0,
            'blood_pressure': {
                'systolic': 130 + random.randint(-10, 20),
                'diastolic': 85 + random.randint(-5, 10)
            },
            'weight': Decimal('65.5'),
            'alert_triggered': True if i < 2 else False,
            'alert_type': 'HIGH_BP' if i < 2 else None,
            'symptoms': 'Headache and dizziness' if i < 2 else 'Normal',
            'recorded_by': 'ASHA-001'
        })
    
    for vital in vital_signs:
        table.put_item(Item=convert_floats_to_decimal(vital))
    
    print(f"  ✅ Seeded {len(vital_signs)} vital signs records")


def seed_emergency_events(dynamodb):
    """Seed emergency events table with sample data."""
    table = dynamodb.Table('maatrisahayak-emergency-events')
    
    print("  📝 Seeding emergency events...")
    
    events = [
        {
            'event_id': 'EVENT-001',
            'pregnancy_id': 'PREG-001',
            'timestamp': int((datetime.now() - timedelta(hours=2)).timestamp()),
            'event_type': 'SEVERE_BLEEDING',
            'severity': 'CRITICAL',
            'status': 'COMPLETED',
            'location': {
                'latitude': Decimal('25.5941'),
                'longitude': Decimal('85.1376'),
                'address': 'Rampur Village, Patna'
            },
            'assigned_ambulance_id': 'AMB-001',
            'assigned_hospital_id': 'HOSP-001',
            'estimated_arrival_time': int((datetime.now() - timedelta(hours=1, minutes=45)).timestamp()),
            'actual_arrival_time': int((datetime.now() - timedelta(hours=1, minutes=40)).timestamp()),
            'response_time_seconds': 600,
            'notes': 'Patient experiencing severe bleeding, immediate transport required',
            'resolved_at': int((datetime.now() - timedelta(hours=1)).timestamp()),
            'outcome': 'SUCCESSFUL',
            'triggered_by': 'ASHA-001'
        },
    ]
    
    for event in events:
        table.put_item(Item=convert_floats_to_decimal(event))
    
    print(f"  ✅ Seeded {len(events)} emergency events")


def seed_ambulances(dynamodb):
    """Seed ambulances table with sample data."""
    table = dynamodb.Table('maatrisahayak-ambulances')
    
    print("  📝 Seeding ambulances...")
    
    ambulances = [
        {
            'ambulance_id': 'AMB-001',
            'vehicle_number': 'BR-01-AB-1234',
            'status': 'AVAILABLE',
            'base_hospital_id': 'HOSP-001',
            'district': 'Patna',
            'driver_name': 'Ramesh Kumar',
            'driver_phone': '+919876543220',
            'last_updated': int(datetime.now().timestamp()),
            'equipment': ['OXYGEN', 'DEFIBRILLATOR', 'OBSTETRIC_KIT', 'STRETCHER'],
            'current_location': {
                'latitude': Decimal('25.5941'),
                'longitude': Decimal('85.1376')
            }
        },
        {
            'ambulance_id': 'AMB-002',
            'vehicle_number': 'BR-01-AB-5678',
            'status': 'AVAILABLE',
            'base_hospital_id': 'HOSP-001',
            'district': 'Patna',
            'driver_name': 'Suresh Singh',
            'driver_phone': '+919876543221',
            'last_updated': int(datetime.now().timestamp()),
            'equipment': ['OXYGEN', 'DEFIBRILLATOR', 'OBSTETRIC_KIT', 'STRETCHER', 'VENTILATOR'],
            'current_location': {
                'latitude': Decimal('25.6093'),
                'longitude': Decimal('85.1235')
            }
        },
        {
            'ambulance_id': 'AMB-003',
            'vehicle_number': 'BR-01-AB-9012',
            'status': 'MAINTENANCE',
            'base_hospital_id': 'HOSP-001',
            'district': 'Patna',
            'driver_name': 'Dinesh Yadav',
            'driver_phone': '+919876543222',
            'last_updated': int(datetime.now().timestamp()),
            'equipment': ['OXYGEN', 'STRETCHER'],
            'current_location': {
                'latitude': Decimal('25.5941'),
                'longitude': Decimal('85.1376')
            }
        },
    ]
    
    for ambulance in ambulances:
        table.put_item(Item=convert_floats_to_decimal(ambulance))
    
    print(f"  ✅ Seeded {len(ambulances)} ambulances")


def seed_hospitals(dynamodb):
    """Seed hospitals table with sample data."""
    table = dynamodb.Table('maatrisahayak-hospitals')
    
    print("  📝 Seeding hospitals...")
    
    hospitals = [
        {
            'hospital_id': 'HOSP-001',
            'name': 'Patna Medical College and Hospital',
            'type': 'DISTRICT',
            'address': 'Ashok Rajpath, Patna',
            'city': 'Patna',
            'district': 'Patna',
            'capacity': 50,
            'current_occupancy': 35,
            'contact_number': '+916122301080',
            'specializations': ['MATERNITY', 'NICU', 'EMERGENCY', 'SURGERY'],
            'emergency_department': {
                'available': True,
                'wait_time': 15
            },
            'maternity_ward': {
                'beds_available': 8,
                'nicu_available': True,
                'nicu_beds': 5
            },
            'location': {
                'latitude': Decimal('25.5941'),
                'longitude': Decimal('85.1376')
            }
        },
        {
            'hospital_id': 'HOSP-002',
            'name': 'Indira Gandhi Institute of Medical Sciences',
            'type': 'DISTRICT',
            'address': 'Sheikhpura, Patna',
            'city': 'Patna',
            'district': 'Patna',
            'capacity': 40,
            'current_occupancy': 28,
            'contact_number': '+916122451070',
            'specializations': ['MATERNITY', 'NICU', 'EMERGENCY'],
            'emergency_department': {
                'available': True,
                'wait_time': 20
            },
            'maternity_ward': {
                'beds_available': 6,
                'nicu_available': True,
                'nicu_beds': 3
            },
            'location': {
                'latitude': Decimal('25.6093'),
                'longitude': Decimal('85.1235')
            }
        },
    ]
    
    for hospital in hospitals:
        table.put_item(Item=convert_floats_to_decimal(hospital))
    
    print(f"  ✅ Seeded {len(hospitals)} hospitals")


def main():
    """Main function to seed all tables."""
    print("=" * 70)
    print("🌱 MaatriSahayak - Seed Data Script")
    print("=" * 70)
    print()
    
    # Get DynamoDB resource
    dynamodb = get_dynamodb_resource()
    
    # Confirm with user
    response = input("This will populate tables with sample data. Continue? (yes/no): ").strip().lower()
    
    if response not in ['yes', 'y']:
        print("\n❌ Seeding cancelled by user.")
        sys.exit(0)
    
    print("\n🌱 Seeding data...")
    print()
    
    try:
        # Seed all tables
        seed_pregnancies(dynamodb)
        seed_vital_signs(dynamodb)
        seed_emergency_events(dynamodb)
        seed_ambulances(dynamodb)
        seed_hospitals(dynamodb)
        
        print()
        print("=" * 70)
        print("🎉 Data seeding completed successfully!")
        print("=" * 70)
        print()
        print("📊 Seeded Data Summary:")
        print("   ✓ 3 Pregnancies")
        print("   ✓ 7 Vital Signs records")
        print("   ✓ 1 Emergency Event")
        print("   ✓ 3 Ambulances")
        print("   ✓ 2 Hospitals")
        print()
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error seeding data: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
