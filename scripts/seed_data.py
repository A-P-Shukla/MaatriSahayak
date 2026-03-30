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
    table = dynamodb.Table('maatrisahayak-pregnancies-dev')
    
    print("  📝 Seeding pregnancies...")
    
    pregnancies = [
        {
            'id': 'preg_001',
            'patient_name': 'Sunita Devi',
            'age': 28,
            'phone': '+919876543210',
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Kalan',
            'latitude': Decimal('27.5706'),
            'longitude': Decimal('80.2792'),
            'lmp_date': (datetime.now() - timedelta(days=224)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=56)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 32,
            'blood_type': 'O+',
            'gravida': 2,
            'parity': 1,
            'previous_complications': ['gestational_diabetes'],
            'chronic_conditions': ['high_blood_pressure'],
            'risk_score': 75,
            'risk_level': 'HIGH',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_001',
            'asha_worker_name': 'Sunita Devi',
            'asha_worker_phone': '+919876543211',
            'created_at': (datetime.now() - timedelta(days=224)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_002',
            'patient_name': 'Priya Sharma',
            'age': 24,
            'phone': '+919876543220',
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Kalan',
            'latitude': Decimal('27.5706'),
            'longitude': Decimal('80.2792'),
            'lmp_date': (datetime.now() - timedelta(days=140)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=140)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 20,
            'blood_type': 'A+',
            'gravida': 1,
            'parity': 0,
            'previous_complications': [],
            'chronic_conditions': [],
            'risk_score': 25,
            'risk_level': 'LOW',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_001',
            'asha_worker_name': 'Sunita Devi',
            'asha_worker_phone': '+919876543211',
            'created_at': (datetime.now() - timedelta(days=140)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_003',
            'patient_name': 'Anita Singh',
            'age': 35,
            'phone': '+919876543230',
            'district': 'Sitapur',
            'block': 'Mahmudabad',
            'village': 'Madhubani',
            'latitude': Decimal('27.5800'),
            'longitude': Decimal('80.2900'),
            'lmp_date': (datetime.now() - timedelta(days=252)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=28)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 36,
            'blood_type': 'B+',
            'gravida': 3,
            'parity': 2,
            'previous_complications': ['previous_c_section', 'anemia'],
            'chronic_conditions': ['severe_preeclampsia'],
            'risk_score': 92,
            'risk_level': 'CRITICAL',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_002',
            'asha_worker_name': 'Rekha Devi',
            'asha_worker_phone': '+919876543212',
            'created_at': (datetime.now() - timedelta(days=252)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_004',
            'patient_name': 'Kavita Verma',
            'age': 26,
            'phone': '+919876543240',
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Khurd',
            'latitude': Decimal('27.5650'),
            'longitude': Decimal('80.2850'),
            'lmp_date': (datetime.now() - timedelta(days=168)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=112)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 24,
            'blood_type': 'AB+',
            'gravida': 2,
            'parity': 1,
            'previous_complications': [],
            'chronic_conditions': ['anemia'],
            'risk_score': 45,
            'risk_level': 'MEDIUM',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_003',
            'asha_worker_name': 'Meena Kumari',
            'asha_worker_phone': '+919876543213',
            'created_at': (datetime.now() - timedelta(days=168)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_005',
            'patient_name': 'Radha Gupta',
            'age': 22,
            'phone': '+919876543250',
            'district': 'Sitapur',
            'block': 'Mahmudabad',
            'village': 'Madhubani',
            'latitude': Decimal('27.5820'),
            'longitude': Decimal('80.2920'),
            'lmp_date': (datetime.now() - timedelta(days=84)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=196)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 12,
            'blood_type': 'O-',
            'gravida': 1,
            'parity': 0,
            'previous_complications': [],
            'chronic_conditions': [],
            'risk_score': 20,
            'risk_level': 'LOW',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_002',
            'asha_worker_name': 'Rekha Devi',
            'asha_worker_phone': '+919876543212',
            'created_at': (datetime.now() - timedelta(days=84)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_006',
            'patient_name': 'Geeta Yadav',
            'age': 31,
            'phone': '+919876543260',
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Kalan',
            'latitude': Decimal('27.5710'),
            'longitude': Decimal('80.2800'),
            'lmp_date': (datetime.now() - timedelta(days=196)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=84)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 28,
            'blood_type': 'A-',
            'gravida': 3,
            'parity': 2,
            'previous_complications': ['postpartum_hemorrhage'],
            'chronic_conditions': ['gestational_diabetes'],
            'risk_score': 68,
            'risk_level': 'HIGH',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_001',
            'asha_worker_name': 'Sunita Devi',
            'asha_worker_phone': '+919876543211',
            'created_at': (datetime.now() - timedelta(days=196)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_007',
            'patient_name': 'Pooja Mishra',
            'age': 29,
            'phone': '+919876543270',
            'district': 'Sitapur',
            'block': 'Mahmudabad',
            'village': 'Saraiya',
            'latitude': Decimal('27.5900'),
            'longitude': Decimal('80.3000'),
            'lmp_date': (datetime.now() - timedelta(days=112)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=168)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 16,
            'blood_type': 'B-',
            'gravida': 1,
            'parity': 0,
            'previous_complications': [],
            'chronic_conditions': [],
            'risk_score': 30,
            'risk_level': 'LOW',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_004',
            'asha_worker_name': 'Asha Devi',
            'asha_worker_phone': '+919876543214',
            'created_at': (datetime.now() - timedelta(days=112)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_008',
            'patient_name': 'Sita Pandey',
            'age': 33,
            'phone': '+919876543280',
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Khurd',
            'latitude': Decimal('27.5660'),
            'longitude': Decimal('80.2860'),
            'lmp_date': (datetime.now() - timedelta(days=238)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=42)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 34,
            'blood_type': 'O+',
            'gravida': 4,
            'parity': 3,
            'previous_complications': ['previous_c_section', 'preterm_labor'],
            'chronic_conditions': ['high_blood_pressure', 'anemia'],
            'risk_score': 85,
            'risk_level': 'CRITICAL',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_003',
            'asha_worker_name': 'Meena Kumari',
            'asha_worker_phone': '+919876543213',
            'created_at': (datetime.now() - timedelta(days=238)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_009',
            'patient_name': 'Lakshmi Tiwari',
            'age': 27,
            'phone': '+919876543290',
            'district': 'Sitapur',
            'block': 'Mahmudabad',
            'village': 'Saraiya',
            'latitude': Decimal('27.5910'),
            'longitude': Decimal('80.3010'),
            'lmp_date': (datetime.now() - timedelta(days=154)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=126)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 22,
            'blood_type': 'A+',
            'gravida': 2,
            'parity': 1,
            'previous_complications': [],
            'chronic_conditions': [],
            'risk_score': 35,
            'risk_level': 'LOW',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_004',
            'asha_worker_name': 'Asha Devi',
            'asha_worker_phone': '+919876543214',
            'created_at': (datetime.now() - timedelta(days=154)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'preg_010',
            'patient_name': 'Mamta Dubey',
            'age': 30,
            'phone': '+919876543300',
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Kalan',
            'latitude': Decimal('27.5720'),
            'longitude': Decimal('80.2810'),
            'lmp_date': (datetime.now() - timedelta(days=210)).strftime('%Y-%m-%d'),
            'edd': (datetime.now() + timedelta(days=70)).strftime('%Y-%m-%d'),
            'gestational_age_weeks': 30,
            'blood_type': 'B+',
            'gravida': 3,
            'parity': 2,
            'previous_complications': ['gestational_diabetes'],
            'chronic_conditions': ['high_blood_pressure'],
            'risk_score': 72,
            'risk_level': 'HIGH',
            'status': 'ACTIVE',
            'asha_worker_id': 'asha_001',
            'asha_worker_name': 'Sunita Devi',
            'asha_worker_phone': '+919876543211',
            'created_at': (datetime.now() - timedelta(days=210)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
    ]
    
    for pregnancy in pregnancies:
        table.put_item(Item=pregnancy)
    
    print(f"  ✅ Seeded {len(pregnancies)} pregnancies")


def seed_vital_signs(dynamodb):
    """Seed vital signs table with sample data."""
    table = dynamodb.Table('maatrisahayak-vital-signs-dev')
    
    print("  📝 Seeding vital signs...")
    
    vital_signs = []
    base_time = datetime.now()
    
    # Generate vital signs for multiple pregnancies
    pregnancy_vitals = [
        ('preg_001', 'asha_001', 130, 85, 145, Decimal('65.5'), ['headache', 'dizziness']),
        ('preg_002', 'asha_001', 115, 75, 140, Decimal('58.2'), []),
        ('preg_003', 'asha_002', 145, 95, 150, Decimal('72.8'), ['swelling', 'headache']),
        ('preg_004', 'asha_003', 120, 78, 142, Decimal('61.5'), []),
        ('preg_006', 'asha_001', 135, 88, 148, Decimal('68.3'), ['fatigue']),
    ]
    
    vital_id = 1
    for preg_id, asha_id, bp_sys, bp_dia, fhr, weight, symptoms in pregnancy_vitals:
        for i in range(5):  # 5 readings per pregnancy
            recorded_at = (base_time - timedelta(days=i*7)).isoformat() + 'Z'
            has_issues = i < 2 and len(symptoms) > 0
            
            vital_signs.append({
                'id': f'vital_{vital_id:03d}',
                'pregnancy_id': preg_id,
                'bp_systolic': bp_sys + random.randint(-10, 15),
                'bp_diastolic': bp_dia + random.randint(-5, 10),
                'heart_rate': 80 + random.randint(-5, 10),
                'temperature': Decimal(str(36.5 + random.uniform(0, 1.2))),
                'oxygen_saturation': 97 + random.randint(0, 2),
                'fetal_heart_rate': fhr + random.randint(-10, 10),
                'weight': weight + Decimal(str(i * 0.5)),
                'symptoms': symptoms if has_issues else [],
                'notes': f'Patient showing symptoms: {", ".join(symptoms)}' if has_issues else 'Normal checkup, all vitals stable',
                'recorded_by': asha_id,
                'recorded_at': recorded_at,
                'alerts': ['High Blood Pressure'] if bp_sys > 140 and has_issues else []
            })
            vital_id += 1
    
    for vital in vital_signs:
        table.put_item(Item=convert_floats_to_decimal(vital))
    
    print(f"  ✅ Seeded {len(vital_signs)} vital signs records")


def seed_emergency_events(dynamodb):
    """Seed emergency events table with sample data."""
    table = dynamodb.Table('maatrisahayak-emergency-events-dev')
    
    print("  📝 Seeding emergency events...")
    
    events = [
        {
            'id': 'emerg_001',
            'pregnancy_id': 'preg_001',
            'patient_name': 'Sunita Devi',
            'patient_phone': '+919876543210',
            'event_type': 'SEVERE_BLEEDING',
            'severity': 'CRITICAL',
            'description': 'Patient experiencing severe bleeding, immediate transport required',
            'latitude': Decimal('27.5706'),
            'longitude': Decimal('80.2792'),
            'location_address': 'Rampur Kalan, Biswan, Sitapur',
            'status': 'COMPLETED',
            'ambulance_id': 'amb_001',
            'hospital_id': 'hosp_001',
            'estimated_arrival_time': (datetime.now() - timedelta(hours=1, minutes=45)).isoformat() + 'Z',
            'actual_arrival_time': (datetime.now() - timedelta(hours=1, minutes=40)).isoformat() + 'Z',
            'completion_time': (datetime.now() - timedelta(hours=1)).isoformat() + 'Z',
            'response_time_seconds': 600,
            'triggered_by': 'asha_001',
            'triggered_at': (datetime.now() - timedelta(hours=2)).isoformat() + 'Z',
            'updated_at': (datetime.now() - timedelta(hours=1)).isoformat() + 'Z',
            'timeline': [
                {'status': 'INITIATED', 'timestamp': (datetime.now() - timedelta(hours=2)).isoformat() + 'Z'},
                {'status': 'DISPATCHED', 'timestamp': (datetime.now() - timedelta(hours=1, minutes=50)).isoformat() + 'Z'},
                {'status': 'ARRIVED', 'timestamp': (datetime.now() - timedelta(hours=1, minutes=40)).isoformat() + 'Z'},
                {'status': 'COMPLETED', 'timestamp': (datetime.now() - timedelta(hours=1)).isoformat() + 'Z'}
            ]
        },
        {
            'id': 'emerg_002',
            'pregnancy_id': 'preg_003',
            'patient_name': 'Anita Singh',
            'patient_phone': '+919876543230',
            'event_type': 'SEVERE_PREECLAMPSIA',
            'severity': 'CRITICAL',
            'description': 'Patient with severe preeclampsia, high BP 180/110, severe headache and vision problems',
            'latitude': Decimal('27.5800'),
            'longitude': Decimal('80.2900'),
            'location_address': 'Madhubani, Mahmudabad, Sitapur',
            'status': 'IN_TRANSIT',
            'ambulance_id': 'amb_002',
            'hospital_id': 'hosp_001',
            'estimated_arrival_time': (datetime.now() + timedelta(minutes=15)).isoformat() + 'Z',
            'actual_arrival_time': None,
            'completion_time': None,
            'response_time_seconds': 420,
            'triggered_by': 'asha_002',
            'triggered_at': (datetime.now() - timedelta(minutes=25)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z',
            'timeline': [
                {'status': 'INITIATED', 'timestamp': (datetime.now() - timedelta(minutes=25)).isoformat() + 'Z'},
                {'status': 'DISPATCHED', 'timestamp': (datetime.now() - timedelta(minutes=18)).isoformat() + 'Z'},
                {'status': 'ARRIVED', 'timestamp': (datetime.now() - timedelta(minutes=10)).isoformat() + 'Z'},
                {'status': 'IN_TRANSIT', 'timestamp': (datetime.now() - timedelta(minutes=5)).isoformat() + 'Z'}
            ]
        },
        {
            'id': 'emerg_003',
            'pregnancy_id': 'preg_008',
            'patient_name': 'Sita Pandey',
            'patient_phone': '+919876543280',
            'event_type': 'PRETERM_LABOR',
            'severity': 'HIGH',
            'description': 'Patient at 34 weeks experiencing regular contractions, possible preterm labor',
            'latitude': Decimal('27.5660'),
            'longitude': Decimal('80.2860'),
            'location_address': 'Rampur Khurd, Biswan, Sitapur',
            'status': 'COMPLETED',
            'ambulance_id': 'amb_003',
            'hospital_id': 'hosp_002',
            'estimated_arrival_time': (datetime.now() - timedelta(days=2, hours=3, minutes=30)).isoformat() + 'Z',
            'actual_arrival_time': (datetime.now() - timedelta(days=2, hours=3, minutes=25)).isoformat() + 'Z',
            'completion_time': (datetime.now() - timedelta(days=2, hours=2, minutes=45)).isoformat() + 'Z',
            'response_time_seconds': 540,
            'triggered_by': 'asha_003',
            'triggered_at': (datetime.now() - timedelta(days=2, hours=4)).isoformat() + 'Z',
            'updated_at': (datetime.now() - timedelta(days=2, hours=2, minutes=45)).isoformat() + 'Z',
            'timeline': [
                {'status': 'INITIATED', 'timestamp': (datetime.now() - timedelta(days=2, hours=4)).isoformat() + 'Z'},
                {'status': 'DISPATCHED', 'timestamp': (datetime.now() - timedelta(days=2, hours=3, minutes=51)).isoformat() + 'Z'},
                {'status': 'ARRIVED', 'timestamp': (datetime.now() - timedelta(days=2, hours=3, minutes=25)).isoformat() + 'Z'},
                {'status': 'COMPLETED', 'timestamp': (datetime.now() - timedelta(days=2, hours=2, minutes=45)).isoformat() + 'Z'}
            ]
        },
        {
            'id': 'emerg_004',
            'pregnancy_id': 'preg_006',
            'patient_name': 'Geeta Yadav',
            'patient_phone': '+919876543260',
            'event_type': 'SEVERE_ABDOMINAL_PAIN',
            'severity': 'HIGH',
            'description': 'Patient with gestational diabetes experiencing severe abdominal pain',
            'latitude': Decimal('27.5710'),
            'longitude': Decimal('80.2800'),
            'location_address': 'Rampur Kalan, Biswan, Sitapur',
            'status': 'COMPLETED',
            'ambulance_id': 'amb_001',
            'hospital_id': 'hosp_001',
            'estimated_arrival_time': (datetime.now() - timedelta(days=5, hours=2, minutes=20)).isoformat() + 'Z',
            'actual_arrival_time': (datetime.now() - timedelta(days=5, hours=2, minutes=18)).isoformat() + 'Z',
            'completion_time': (datetime.now() - timedelta(days=5, hours=1, minutes=30)).isoformat() + 'Z',
            'response_time_seconds': 480,
            'triggered_by': 'asha_001',
            'triggered_at': (datetime.now() - timedelta(days=5, hours=3)).isoformat() + 'Z',
            'updated_at': (datetime.now() - timedelta(days=5, hours=1, minutes=30)).isoformat() + 'Z',
            'timeline': [
                {'status': 'INITIATED', 'timestamp': (datetime.now() - timedelta(days=5, hours=3)).isoformat() + 'Z'},
                {'status': 'DISPATCHED', 'timestamp': (datetime.now() - timedelta(days=5, hours=2, minutes=52)).isoformat() + 'Z'},
                {'status': 'ARRIVED', 'timestamp': (datetime.now() - timedelta(days=5, hours=2, minutes=18)).isoformat() + 'Z'},
                {'status': 'COMPLETED', 'timestamp': (datetime.now() - timedelta(days=5, hours=1, minutes=30)).isoformat() + 'Z'}
            ]
        },
    ]
    
    for event in events:
        table.put_item(Item=convert_floats_to_decimal(event))
    
    print(f"  ✅ Seeded {len(events)} emergency events")


def seed_ambulances(dynamodb):
    """Seed ambulances table with sample data."""
    table = dynamodb.Table('maatrisahayak-ambulances-dev')
    
    print("  📝 Seeding ambulances...")
    
    ambulances = [
        {
            'id': 'amb_001',
            'vehicle_number': 'UP80AB1234',
            'district': 'Sitapur',
            'status': 'AVAILABLE',
            'latitude': Decimal('27.5706'),
            'longitude': Decimal('80.2792'),
            'driver_name': 'Ramesh Kumar',
            'driver_phone': '+919876543220',
            'equipment': ['OXYGEN', 'DEFIBRILLATOR', 'OBSTETRIC_KIT', 'STRETCHER'],
            'current_emergency_id': None,
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'amb_002',
            'vehicle_number': 'UP80AB5678',
            'district': 'Sitapur',
            'status': 'IN_USE',
            'latitude': Decimal('27.5750'),
            'longitude': Decimal('80.2850'),
            'driver_name': 'Suresh Singh',
            'driver_phone': '+919876543221',
            'equipment': ['OXYGEN', 'DEFIBRILLATOR', 'OBSTETRIC_KIT', 'STRETCHER', 'VENTILATOR'],
            'current_emergency_id': 'emerg_002',
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'amb_003',
            'vehicle_number': 'UP80AB9012',
            'district': 'Sitapur',
            'status': 'AVAILABLE',
            'latitude': Decimal('27.5650'),
            'longitude': Decimal('80.2870'),
            'driver_name': 'Dinesh Yadav',
            'driver_phone': '+919876543222',
            'equipment': ['OXYGEN', 'STRETCHER', 'OBSTETRIC_KIT'],
            'current_emergency_id': None,
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'amb_004',
            'vehicle_number': 'UP80AB3456',
            'district': 'Sitapur',
            'status': 'AVAILABLE',
            'latitude': Decimal('27.5900'),
            'longitude': Decimal('80.3000'),
            'driver_name': 'Vijay Sharma',
            'driver_phone': '+919876543223',
            'equipment': ['OXYGEN', 'DEFIBRILLATOR', 'OBSTETRIC_KIT', 'STRETCHER', 'VENTILATOR', 'INCUBATOR'],
            'current_emergency_id': None,
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'amb_005',
            'vehicle_number': 'UP80AB7890',
            'district': 'Sitapur',
            'status': 'MAINTENANCE',
            'latitude': Decimal('27.5706'),
            'longitude': Decimal('80.2792'),
            'driver_name': 'Anil Verma',
            'driver_phone': '+919876543224',
            'equipment': ['OXYGEN', 'STRETCHER'],
            'current_emergency_id': None,
            'last_updated': datetime.now().isoformat() + 'Z'
        },
    ]
    
    for ambulance in ambulances:
        table.put_item(Item=convert_floats_to_decimal(ambulance))
    
    print(f"  ✅ Seeded {len(ambulances)} ambulances")


def seed_hospitals(dynamodb):
    """Seed hospitals table with sample data."""
    table = dynamodb.Table('maatrisahayak-hospitals-dev')
    
    print("  📝 Seeding hospitals...")
    
    hospitals = [
        {
            'id': 'hosp_001',
            'name': 'District Hospital Sitapur',
            'type': 'DISTRICT',
            'district': 'Sitapur',
            'address': 'Civil Lines, Sitapur, Uttar Pradesh',
            'latitude': Decimal('27.5706'),
            'longitude': Decimal('80.2792'),
            'phone': '+915862221234',
            'total_beds': 100,
            'available_beds': 20,
            'maternity_beds': 30,
            'available_maternity_beds': 8,
            'nicu_beds': 10,
            'available_nicu_beds': 5,
            'has_blood_bank': True,
            'has_operation_theater': True,
            'specializations': ['MATERNITY', 'NICU', 'EMERGENCY', 'SURGERY'],
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'hosp_002',
            'name': 'Community Health Center Biswan',
            'type': 'CHC',
            'district': 'Sitapur',
            'address': 'Biswan, Sitapur, Uttar Pradesh',
            'latitude': Decimal('27.5000'),
            'longitude': Decimal('80.9900'),
            'phone': '+915862245678',
            'total_beds': 50,
            'available_beds': 15,
            'maternity_beds': 20,
            'available_maternity_beds': 6,
            'nicu_beds': 5,
            'available_nicu_beds': 3,
            'has_blood_bank': False,
            'has_operation_theater': True,
            'specializations': ['MATERNITY', 'EMERGENCY'],
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'hosp_003',
            'name': 'Primary Health Center Mahmudabad',
            'type': 'PHC',
            'district': 'Sitapur',
            'address': 'Mahmudabad, Sitapur, Uttar Pradesh',
            'latitude': Decimal('27.5800'),
            'longitude': Decimal('80.2900'),
            'phone': '+915862267890',
            'total_beds': 30,
            'available_beds': 12,
            'maternity_beds': 10,
            'available_maternity_beds': 4,
            'nicu_beds': 2,
            'available_nicu_beds': 1,
            'has_blood_bank': False,
            'has_operation_theater': False,
            'specializations': ['MATERNITY', 'EMERGENCY'],
            'last_updated': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'hosp_004',
            'name': 'Sub-District Hospital Laharpur',
            'type': 'SUB_DISTRICT',
            'district': 'Sitapur',
            'address': 'Laharpur, Sitapur, Uttar Pradesh',
            'latitude': Decimal('27.6200'),
            'longitude': Decimal('80.3200'),
            'phone': '+915862289012',
            'total_beds': 60,
            'available_beds': 18,
            'maternity_beds': 15,
            'available_maternity_beds': 5,
            'nicu_beds': 4,
            'available_nicu_beds': 2,
            'has_blood_bank': True,
            'has_operation_theater': True,
            'specializations': ['MATERNITY', 'EMERGENCY', 'SURGERY'],
            'last_updated': datetime.now().isoformat() + 'Z'
        },
    ]
    
    for hospital in hospitals:
        table.put_item(Item=convert_floats_to_decimal(hospital))
    
    print(f"  ✅ Seeded {len(hospitals)} hospitals")


def seed_asha_workers(dynamodb):
    """Seed ASHA workers table with sample data."""
    table = dynamodb.Table('maatrisahayak-asha-workers-dev')
    
    print("  📝 Seeding ASHA workers...")
    
    asha_workers = [
        {
            'id': 'asha_001',
            'name': 'Sunita Devi',
            'phone': '+919876543211',
            'email': 'sunita.devi@example.com',
            'age': 32,
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Kalan',
            'qualification': 'Class 12',
            'experience_years': 5,
            'languages': ['Hindi', 'Awadhi'],
            'status': 'ACTIVE',
            'pregnancies_managed': 45,
            'emergencies_handled': 8,
            'created_at': (datetime.now() - timedelta(days=365*5)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'asha_002',
            'name': 'Rekha Devi',
            'phone': '+919876543212',
            'email': 'rekha.devi@example.com',
            'age': 28,
            'district': 'Sitapur',
            'block': 'Mahmudabad',
            'village': 'Madhubani',
            'qualification': 'Class 10',
            'experience_years': 3,
            'languages': ['Hindi'],
            'status': 'ACTIVE',
            'pregnancies_managed': 32,
            'emergencies_handled': 5,
            'created_at': (datetime.now() - timedelta(days=365*3)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'asha_003',
            'name': 'Meena Kumari',
            'phone': '+919876543213',
            'email': 'meena.kumari@example.com',
            'age': 35,
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Khurd',
            'qualification': 'Class 12',
            'experience_years': 7,
            'languages': ['Hindi', 'Awadhi', 'English'],
            'status': 'ACTIVE',
            'pregnancies_managed': 68,
            'emergencies_handled': 12,
            'created_at': (datetime.now() - timedelta(days=365*7)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'asha_004',
            'name': 'Asha Devi',
            'phone': '+919876543214',
            'email': 'asha.devi@example.com',
            'age': 30,
            'district': 'Sitapur',
            'block': 'Mahmudabad',
            'village': 'Saraiya',
            'qualification': 'Class 12',
            'experience_years': 4,
            'languages': ['Hindi', 'Awadhi'],
            'status': 'ACTIVE',
            'pregnancies_managed': 38,
            'emergencies_handled': 6,
            'created_at': (datetime.now() - timedelta(days=365*4)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
        {
            'id': 'asha_005',
            'name': 'Poonam Singh',
            'phone': '+919876543215',
            'email': 'poonam.singh@example.com',
            'age': 26,
            'district': 'Sitapur',
            'block': 'Biswan',
            'village': 'Rampur Kalan',
            'qualification': 'Class 10',
            'experience_years': 2,
            'languages': ['Hindi'],
            'status': 'ACTIVE',
            'pregnancies_managed': 22,
            'emergencies_handled': 3,
            'created_at': (datetime.now() - timedelta(days=365*2)).isoformat() + 'Z',
            'updated_at': datetime.now().isoformat() + 'Z'
        },
    ]
    
    for asha in asha_workers:
        table.put_item(Item=convert_floats_to_decimal(asha))
    
    print(f"  ✅ Seeded {len(asha_workers)} ASHA workers")


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
        seed_asha_workers(dynamodb)
        
        print()
        print("=" * 70)
        print("🎉 Data seeding completed successfully!")
        print("=" * 70)
        print()
        print("📊 Seeded Data Summary:")
        print("   ✓ 10 Pregnancies (various risk levels)")
        print("   ✓ 25 Vital Signs records (across multiple pregnancies)")
        print("   ✓ 4 Emergency Events (completed and in-progress)")
        print("   ✓ 5 Ambulances (various statuses)")
        print("   ✓ 4 Hospitals (different types and capacities)")
        print("   ✓ 5 ASHA Workers (different experience levels)")
        print()
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error seeding data: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
