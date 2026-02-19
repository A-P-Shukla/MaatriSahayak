#!/usr/bin/env python3
"""
MaatriSahayak - API Testing Script

Tests all implemented APIs with sample data.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'https://w4l9cd82rc.execute-api.ap-south-1.amazonaws.com/dev')
AUTH_TOKEN = os.getenv('AUTH_TOKEN', '')

# Headers
headers = {
    'Content-Type': 'application/json'
}

if AUTH_TOKEN:
    headers['Authorization'] = f'Bearer {AUTH_TOKEN}'


def print_response(title, response):
    """Print formatted API response."""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")
    
    print(f"{'='*60}\n")


def test_register_pregnancy():
    """Test pregnancy registration."""
    print("\n🏥 Testing: Register Pregnancy")
    
    # Calculate dates
    lmp_date = (datetime.now() - timedelta(days=56)).strftime('%Y-%m-%d')
    edd = (datetime.now() + timedelta(days=224)).strftime('%Y-%m-%d')
    
    payload = {
        "patient_name": "Priya Sharma",
        "age": 26,
        "phone": "+919876543210",
        "district": "Sitapur",
        "block": "Biswan",
        "village": "Rampur Kalan",
        "latitude": 27.5706,
        "longitude": 80.2792,
        "lmp_date": lmp_date,
        "edd": edd,
        "gestational_age_weeks": 8,
        "blood_type": "O+",
        "gravida": 2,
        "parity": 1,
        "previous_complications": [],
        "chronic_conditions": [],
        "asha_worker_id": "asha_001",
        "asha_worker_name": "Sunita Devi",
        "asha_worker_phone": "+919876543211"
    }
    
    response = requests.post(
        f"{API_BASE_URL}/pregnancies",
        headers=headers,
        json=payload
    )
    
    print_response("Register Pregnancy", response)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('data'):
            pregnancy_id = data['data']['id']
            print(f"✅ Pregnancy registered successfully!")
            print(f"📝 Pregnancy ID: {pregnancy_id}")
            return pregnancy_id
    
    print("❌ Failed to register pregnancy")
    return None


def test_record_vitals(pregnancy_id):
    """Test vital signs recording."""
    print("\n💉 Testing: Record Vital Signs")
    
    # Test 1: Normal vitals
    print("\n📊 Test 1: Normal Vitals")
    payload = {
        "pregnancy_id": pregnancy_id,
        "bp_systolic": 120,
        "bp_diastolic": 80,
        "heart_rate": 75,
        "temperature": 37.0,
        "oxygen_saturation": 98,
        "fetal_heart_rate": 140,
        "weight": 65.5,
        "symptoms": [],
        "notes": "Patient feeling well, no complaints",
        "recorded_by": "asha_001"
    }
    
    response = requests.post(
        f"{API_BASE_URL}/vitals",
        headers=headers,
        json=payload
    )
    
    print_response("Record Normal Vitals", response)
    
    # Test 2: High BP alert
    print("\n📊 Test 2: High Blood Pressure Alert")
    payload = {
        "pregnancy_id": pregnancy_id,
        "bp_systolic": 165,
        "bp_diastolic": 105,
        "heart_rate": 88,
        "temperature": 37.2,
        "oxygen_saturation": 97,
        "fetal_heart_rate": 145,
        "symptoms": ["headache", "blurred vision"],
        "notes": "Patient complaining of severe headache",
        "recorded_by": "asha_001"
    }
    
    response = requests.post(
        f"{API_BASE_URL}/vitals",
        headers=headers,
        json=payload
    )
    
    print_response("Record High BP Vitals", response)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('data', {}).get('alerts'):
            print(f"⚠️  Alerts detected: {data['data']['alerts']}")


def test_get_pregnancy_details(pregnancy_id):
    """Test getting pregnancy details."""
    print("\n📋 Testing: Get Pregnancy Details")
    
    response = requests.get(
        f"{API_BASE_URL}/pregnancies/{pregnancy_id}",
        headers=headers,
        params={
            'include_vitals': 'true',
            'vitals_limit': 10
        }
    )
    
    print_response("Get Pregnancy Details", response)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            pregnancy = data['data']['pregnancy']
            vitals_count = data['data'].get('vitals_count', 0)
            print(f"✅ Retrieved pregnancy: {pregnancy['patient_name']}")
            print(f"📊 Vital signs records: {vitals_count}")


def test_list_pregnancies():
    """Test listing pregnancies."""
    print("\n📑 Testing: List Pregnancies")
    
    # Test 1: List all
    print("\n📊 Test 1: List All Pregnancies")
    response = requests.get(
        f"{API_BASE_URL}/pregnancies",
        headers=headers,
        params={
            'page': 1,
            'page_size': 20
        }
    )
    
    print_response("List All Pregnancies", response)
    
    # Test 2: Filter by ASHA worker
    print("\n📊 Test 2: Filter by ASHA Worker")
    response = requests.get(
        f"{API_BASE_URL}/pregnancies",
        headers=headers,
        params={
            'asha_worker_id': 'asha_001',
            'status': 'ACTIVE',
            'page': 1,
            'page_size': 20
        }
    )
    
    print_response("List by ASHA Worker", response)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            count = data['data']['pagination']['returned_count']
            total = data['data']['pagination']['total_count']
            print(f"✅ Found {count} pregnancies (Total: {total})")


def main():
    """Run all API tests."""
    print("\n" + "="*60)
    print("🚀 MaatriSahayak API Testing")
    print("="*60)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Auth Token: {'✅ Set' if AUTH_TOKEN else '❌ Not Set'}")
    print("="*60)
    
    try:
        # Test 1: Register Pregnancy
        pregnancy_id = test_register_pregnancy()
        
        if not pregnancy_id:
            print("\n❌ Cannot continue without pregnancy ID")
            return
        
        # Test 2: Record Vitals
        test_record_vitals(pregnancy_id)
        
        # Test 3: Get Pregnancy Details
        test_get_pregnancy_details(pregnancy_id)
        
        # Test 4: List Pregnancies
        test_list_pregnancies()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60 + "\n")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to API")
        print(f"Please check if API is running at: {API_BASE_URL}")
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
