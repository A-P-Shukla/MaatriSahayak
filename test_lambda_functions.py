"""
MaatriSahayak - Lambda Functions Test Suite

Tests all newly implemented lambda functions without deployment.
Uses mock data and simulates Lambda execution environment.
"""

import sys
import os
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Add lambda_functions to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lambda_functions'))

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"{GREEN}[PASS]{RESET} {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append((test_name, error))
        print(f"{RED}[FAIL]{RESET} {test_name}: {error}")
    
    def print_summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"{BLUE}TEST SUMMARY{RESET}")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"{GREEN}Passed: {self.passed}{RESET}")
        print(f"{RED}Failed: {self.failed}{RESET}")
        
        if self.errors:
            print(f"\n{YELLOW}Failed Tests Details:{RESET}")
            for test_name, error in self.errors:
                print(f"  - {test_name}: {error}")
        
        print(f"{'='*60}\n")

results = TestResults()

# Mock AWS services
def setup_mocks():
    """Setup mock AWS services"""
    
    # Mock DynamoDB
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    
    # Mock pregnancy data
    mock_pregnancy = {
        'id': 'preg_test123',
        'patient_name': 'Test Patient',
        'age': 25,
        'phone': '+919876543210',
        'district': 'Sitapur',
        'village': 'Test Village',
        'latitude': 27.5706,
        'longitude': 80.2792,
        'lmp_date': '2024-01-01',
        'edd': '2024-10-08',
        'blood_type': 'O+',
        'status': 'ACTIVE',
        'asha_worker_id': 'asha_test456',
        'asha_worker_phone': '+919876543211',
        'created_at': '2024-01-15T10:00:00.000Z',
        'updated_at': '2024-01-15T10:00:00.000Z'
    }
    
    # Mock ambulances
    mock_ambulances = [
        {
            'id': 'amb_test1',
            'vehicle_number': 'UP80AB1234',
            'district': 'Sitapur',
            'status': 'AVAILABLE',
            'latitude': 27.5800,
            'longitude': 80.2800,
            'driver_name': 'Test Driver',
            'driver_phone': '+919876543212',
            'equipment': ['OXYGEN', 'STRETCHER'],
            'last_updated': '2024-01-15T10:00:00.000Z'
        }
    ]
    
    # Mock hospitals
    mock_hospitals = [
        {
            'id': 'hosp_test1',
            'name': 'Test District Hospital',
            'type': 'DISTRICT',
            'district': 'Sitapur',
            'address': 'Test Address',
            'latitude': 27.5900,
            'longitude': 80.2900,
            'phone': '+919876543213',
            'total_beds': 100,
            'available_beds': 20,
            'maternity_beds': 30,
            'available_maternity_beds': 5,
            'nicu_beds': 10,
            'available_nicu_beds': 2,
            'has_blood_bank': True,
            'has_operation_theater': True,
            'last_updated': '2024-01-15T10:00:00.000Z'
        }
    ]
    
    # Mock ASHA workers
    mock_asha_workers = [
        {
            'id': 'asha_test456',
            'name': 'Test ASHA Worker',
            'phone': '+919876543211',
            'email': 'test@example.com',
            'age': 30,
            'district': 'Sitapur',
            'village': 'Test Village',
            'status': 'ACTIVE',
            'pregnancies_managed': 25,
            'emergencies_handled': 3,
            'created_at': '2024-01-15T10:00:00.000Z',
            'updated_at': '2024-01-15T10:00:00.000Z'
        }
    ]
    
    # Configure mock responses
    mock_table.get_item.return_value = {'Item': mock_pregnancy}
    mock_table.scan.return_value = {'Items': mock_ambulances}
    mock_table.query.return_value = {'Items': []}
    mock_table.put_item.return_value = {}
    mock_table.update_item.return_value = {'Attributes': mock_pregnancy}
    
    mock_dynamodb.Table.return_value = mock_table
    
    # Mock SNS
    mock_sns = MagicMock()
    mock_sns.publish.return_value = {'MessageId': 'test-message-id'}
    
    # Mock Lambda
    mock_lambda = MagicMock()
    mock_lambda.invoke.return_value = {'StatusCode': 200}
    
    # Mock S3
    mock_s3 = MagicMock()
    mock_s3.put_object.return_value = {}
    
    # Mock Textract
    mock_textract = MagicMock()
    mock_textract.analyze_document.return_value = {
        'Blocks': [
            {
                'BlockType': 'LINE',
                'Text': 'Patient Name: Test Patient',
                'Confidence': 95.5
            }
        ]
    }
    
    return {
        'dynamodb': mock_dynamodb,
        'sns': mock_sns,
        'lambda': mock_lambda,
        's3': mock_s3,
        'textract': mock_textract,
        'pregnancy': mock_pregnancy,
        'ambulances': mock_ambulances,
        'hospitals': mock_hospitals,
        'asha_workers': mock_asha_workers
    }

def test_check_hospital_capacity():
    """Test check_hospital_capacity function"""
    print(f"\n{BLUE}Testing: check_hospital_capacity{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            # Import after patching
            from check_hospital_capacity import handler
            
            # Test 1: Get specific hospital
            event = {
                'queryStringParameters': {
                    'hospital_id': 'hosp_test1'
                }
            }
            
            # Mock get_item to return hospital
            mocks['dynamodb'].Table().get_item.return_value = {'Item': mocks['hospitals'][0]}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    results.add_pass("check_hospital_capacity - Get specific hospital")
                else:
                    results.add_fail("check_hospital_capacity - Get specific hospital", "Response not successful")
            else:
                results.add_fail("check_hospital_capacity - Get specific hospital", f"Status code: {response['statusCode']}")
            
            # Test 2: Filter by district
            event = {
                'queryStringParameters': {
                    'district': 'Sitapur',
                    'min_maternity_beds': '3'
                }
            }
            
            # Mock scan to return hospitals
            mocks['dynamodb'].Table().scan.return_value = {'Items': mocks['hospitals']}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success'] and body['data']['count'] > 0:
                    results.add_pass("check_hospital_capacity - Filter by district")
                else:
                    results.add_fail("check_hospital_capacity - Filter by district", "No hospitals found")
            else:
                results.add_fail("check_hospital_capacity - Filter by district", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("check_hospital_capacity", str(e))

def test_find_nearest_ambulance():
    """Test find_nearest_ambulance function"""
    print(f"\n{BLUE}Testing: find_nearest_ambulance{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from find_nearest_ambulance import handler
            
            # Test: Find nearest ambulance
            event = {
                'body': json.dumps({
                    'latitude': 27.5706,
                    'longitude': 80.2792,
                    'district': 'Sitapur'
                })
            }
            
            # Mock scan to return ambulances
            mocks['dynamodb'].Table().scan.return_value = {'Items': mocks['ambulances']}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success'] and body['data']['count'] > 0:
                    ambulance = body['data']['ambulances'][0]
                    if 'distance_km' in ambulance and 'estimated_time_minutes' in ambulance:
                        results.add_pass("find_nearest_ambulance - Find with distance calculation")
                    else:
                        results.add_fail("find_nearest_ambulance", "Missing distance or time fields")
                else:
                    results.add_fail("find_nearest_ambulance", "No ambulances found")
            else:
                results.add_fail("find_nearest_ambulance", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("find_nearest_ambulance", str(e))

def test_update_ambulance_location():
    """Test update_ambulance_location function"""
    print(f"\n{BLUE}Testing: update_ambulance_location{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from update_ambulance_location import handler
            
            # Test: Update ambulance location
            event = {
                'body': json.dumps({
                    'ambulance_id': 'amb_test1',
                    'latitude': 27.5850,
                    'longitude': 80.2850,
                    'status': 'IN_TRANSIT'
                })
            }
            
            # Mock get_item and update_item
            mocks['dynamodb'].Table().get_item.return_value = {'Item': mocks['ambulances'][0]}
            mocks['dynamodb'].Table().update_item.return_value = {
                'Attributes': {**mocks['ambulances'][0], 'latitude': 27.5850, 'longitude': 80.2850}
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    results.add_pass("update_ambulance_location - Update location and status")
                else:
                    results.add_fail("update_ambulance_location", "Response not successful")
            else:
                results.add_fail("update_ambulance_location", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("update_ambulance_location", str(e))

def test_get_ambulance_route():
    """Test get_ambulance_route function"""
    print(f"\n{BLUE}Testing: get_ambulance_route{RESET}")
    
    try:
        with patch('boto3.resource'):
            from get_ambulance_route import handler
            
            # Test: Calculate route
            event = {
                'body': json.dumps({
                    'origin_lat': 27.5706,
                    'origin_lon': 80.2792,
                    'destination_lat': 27.5900,
                    'destination_lon': 80.2900
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    data = body['data']
                    if 'distance_km' in data and 'estimated_time_minutes' in data:
                        results.add_pass("get_ambulance_route - Calculate route with ETA")
                    else:
                        results.add_fail("get_ambulance_route", "Missing distance or time fields")
                else:
                    results.add_fail("get_ambulance_route", "Response not successful")
            else:
                results.add_fail("get_ambulance_route", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("get_ambulance_route", str(e))

def test_send_notifications():
    """Test send_notifications function"""
    print(f"\n{BLUE}Testing: send_notifications{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.client', return_value=mocks['sns']):
            from send_notifications import handler
            
            # Test 1: Emergency alert
            event = {
                'body': json.dumps({
                    'notification_type': 'EMERGENCY_ALERT',
                    'data': {
                        'emergency_id': 'emerg_test1',
                        'patient_name': 'Test Patient',
                        'patient_phone': '+919876543210',
                        'event_type': 'SEVERE_BLEEDING',
                        'severity': 'CRITICAL',
                        'location': 'Test Location',
                        'asha_worker_phone': '+919876543211'
                    }
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success'] and body['data']['sent_count'] > 0:
                    results.add_pass("send_notifications - Emergency alert")
                else:
                    results.add_fail("send_notifications - Emergency alert", "No notifications sent")
            else:
                results.add_fail("send_notifications - Emergency alert", f"Status code: {response['statusCode']}")
            
            # Test 2: General notification
            event = {
                'body': json.dumps({
                    'notification_type': 'GENERAL',
                    'recipients': [
                        {'phone': '+919876543210', 'name': 'Test User'}
                    ],
                    'message': 'Test notification message',
                    'priority': 'NORMAL'
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    results.add_pass("send_notifications - General notification")
                else:
                    results.add_fail("send_notifications - General notification", "Response not successful")
            else:
                results.add_fail("send_notifications - General notification", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("send_notifications", str(e))

def test_trigger_emergency():
    """Test trigger_emergency function"""
    print(f"\n{BLUE}Testing: trigger_emergency{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']), \
             patch('boto3.client') as mock_client:
            
            # Setup mock clients
            mock_client.side_effect = lambda service: {
                'lambda': mocks['lambda'],
                'sns': mocks['sns']
            }.get(service, MagicMock())
            
            from trigger_emergency import handler
            
            # Patch the imported functions in the handler module
            handler.get_item = lambda *args, **kwargs: mocks['pregnancy']
            handler.put_item = lambda *args, **kwargs: None
            handler.update_item = lambda *args, **kwargs: mocks['pregnancy']
            
            # Test: Trigger emergency
            event = {
                'body': json.dumps({
                    'pregnancy_id': 'preg_test123',
                    'event_type': 'SEVERE_BLEEDING',
                    'severity': 'CRITICAL',
                    'description': 'Test emergency',
                    'latitude': 27.5706,
                    'longitude': 80.2792,
                    'location_address': 'Test Location',
                    'triggered_by': 'asha_test456'
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    data = body['data']
                    if 'emergency' in data:
                        results.add_pass("trigger_emergency - Create emergency event")
                    else:
                        results.add_fail("trigger_emergency", "Missing emergency data")
                else:
                    results.add_fail("trigger_emergency", "Response not successful")
            else:
                results.add_fail("trigger_emergency", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("trigger_emergency", str(e))

def test_process_anc_card():
    """Test process_anc_card function"""
    print(f"\n{BLUE}Testing: process_anc_card{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']), \
             patch('boto3.client') as mock_client:
            
            # Setup mock clients
            mock_client.side_effect = lambda service: {
                's3': mocks['s3'],
                'textract': mocks['textract']
            }.get(service, MagicMock())
            
            from process_anc_card import handler
            
            # Test: Process ANC card with S3 key
            event = {
                'body': json.dumps({
                    'pregnancy_id': 'preg_test123',
                    's3_key': 'anc-cards/test.jpg',
                    'auto_update': False
                })
            }
            
            # Mock get_item for pregnancy
            mocks['dynamodb'].Table().get_item.return_value = {'Item': mocks['pregnancy']}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    data = body['data']
                    if 'extracted_data' in data and 'confidence_scores' in data:
                        results.add_pass("process_anc_card - Extract data from ANC card")
                    else:
                        results.add_fail("process_anc_card", "Missing extracted data or confidence scores")
                else:
                    results.add_fail("process_anc_card", "Response not successful")
            else:
                results.add_fail("process_anc_card", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("process_anc_card", str(e))

def test_register_asha():
    """Test register_asha function"""
    print(f"\n{BLUE}Testing: register_asha{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from register_asha import handler
            
            # Patch scan_items at the handler module level
            def mock_scan_items(table_name, filter_expression=None, **kwargs):
                # Return empty for duplicate check (phone filter)
                if filter_expression and 'phone' in filter_expression:
                    return []
                # Return default mock data for other scans
                return mocks['asha_workers']
            
            handler.scan_items = mock_scan_items
            
            # Test: Register new ASHA worker
            event = {
                'body': json.dumps({
                    'name': 'New ASHA Worker',
                    'phone': '+919876543299',
                    'email': 'newasha@example.com',
                    'age': 28,
                    'district': 'Sitapur',
                    'village': 'New Village',
                    'qualification': 'Class 10',
                    'experience_years': 2
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    data = body['data']
                    if 'id' in data and data['id'].startswith('asha_'):
                        results.add_pass("register_asha - Register new ASHA worker")
                    else:
                        results.add_fail("register_asha", "Missing or invalid ASHA ID")
                else:
                    results.add_fail("register_asha", "Response not successful")
            else:
                results.add_fail("register_asha", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("register_asha", str(e))

def test_get_asha_profile():
    """Test get_asha_profile function"""
    print(f"\n{BLUE}Testing: get_asha_profile{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from get_asha_profile import handler
            
            # Test 1: Get ASHA profile without stats
            event = {
                'pathParameters': {'id': 'asha_test456'},
                'queryStringParameters': None
            }
            
            # Mock get_item to return ASHA worker
            mocks['dynamodb'].Table().get_item.return_value = {'Item': mocks['asha_workers'][0]}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success'] and 'asha' in body['data']:
                    results.add_pass("get_asha_profile - Get ASHA profile")
                else:
                    results.add_fail("get_asha_profile", "Missing ASHA data")
            else:
                results.add_fail("get_asha_profile", f"Status code: {response['statusCode']}")
            
            # Test 2: Get ASHA profile with stats
            event = {
                'pathParameters': {'id': 'asha_test456'},
                'queryStringParameters': {'include_stats': 'true'}
            }
            
            # Mock query to return pregnancies
            mocks['dynamodb'].Table().query.return_value = {'Items': [mocks['pregnancy']]}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success'] and 'stats' in body['data']:
                    results.add_pass("get_asha_profile - Get ASHA profile with stats")
                else:
                    results.add_fail("get_asha_profile - with stats", "Missing stats data")
            else:
                results.add_fail("get_asha_profile - with stats", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("get_asha_profile", str(e))

def test_update_asha_profile():
    """Test update_asha_profile function"""
    print(f"\n{BLUE}Testing: update_asha_profile{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from update_asha_profile import handler
            
            # Test: Update ASHA profile
            event = {
                'pathParameters': {'id': 'asha_test456'},
                'body': json.dumps({
                    'name': 'Updated ASHA Worker',
                    'email': 'updated@example.com',
                    'experience_years': 5
                })
            }
            
            # Mock get_item and update_item
            mocks['dynamodb'].Table().get_item.return_value = {'Item': mocks['asha_workers'][0]}
            updated_asha = {**mocks['asha_workers'][0], 'name': 'Updated ASHA Worker'}
            mocks['dynamodb'].Table().update_item.return_value = {'Attributes': updated_asha}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    results.add_pass("update_asha_profile - Update ASHA profile")
                else:
                    results.add_fail("update_asha_profile", "Response not successful")
            else:
                results.add_fail("update_asha_profile", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("update_asha_profile", str(e))

def test_register_ambulance():
    """Test register_ambulance function"""
    print(f"\n{BLUE}Testing: register_ambulance{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from register_ambulance import handler
            
            # Patch scan_items at the handler module level
            def mock_scan_items(table_name, filter_expression=None, **kwargs):
                # Return empty for duplicate check (vehicle_number filter)
                if filter_expression and 'vehicle_number' in filter_expression:
                    return []
                # Return default mock data for other scans
                return mocks['ambulances']
            
            handler.scan_items = mock_scan_items
            
            # Test: Register new ambulance
            event = {
                'body': json.dumps({
                    'vehicle_number': 'UP80XY9999',
                    'district': 'Sitapur',
                    'latitude': 27.5800,
                    'longitude': 80.2800,
                    'driver_name': 'New Driver',
                    'driver_phone': '+919876543299',
                    'equipment': ['OXYGEN', 'STRETCHER'],
                    'type': 'ADVANCED'
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    data = body['data']
                    if 'id' in data and data['id'].startswith('amb_'):
                        results.add_pass("register_ambulance - Register new ambulance")
                    else:
                        results.add_fail("register_ambulance", "Missing or invalid ambulance ID")
                else:
                    results.add_fail("register_ambulance", "Response not successful")
            else:
                results.add_fail("register_ambulance", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("register_ambulance", str(e))

def test_register_hospital():
    """Test register_hospital function"""
    print(f"\n{BLUE}Testing: register_hospital{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from register_hospital import handler
            
            # Patch scan_items at the handler module level
            def mock_scan_items(table_name, filter_expression=None, **kwargs):
                # Return empty for duplicate check (name/district filter)
                if filter_expression and ('name' in filter_expression or 'district' in filter_expression):
                    return []
                # Return default mock data for other scans
                return mocks['hospitals']
            
            handler.scan_items = mock_scan_items
            
            # Test: Register new hospital
            event = {
                'body': json.dumps({
                    'name': 'New Community Health Center',
                    'type': 'CHC',
                    'district': 'Sitapur',
                    'address': 'New Hospital Address',
                    'latitude': 27.5900,
                    'longitude': 80.2900,
                    'phone': '+919876543299',
                    'total_beds': 50,
                    'maternity_beds': 15,
                    'nicu_beds': 5,
                    'has_blood_bank': True,
                    'has_operation_theater': True,
                    'specializations': ['MATERNITY', 'EMERGENCY']
                })
            }
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    data = body['data']
                    if 'id' in data and data['id'].startswith('hosp_'):
                        results.add_pass("register_hospital - Register new hospital")
                    else:
                        results.add_fail("register_hospital", "Missing or invalid hospital ID")
                else:
                    results.add_fail("register_hospital", "Response not successful")
            else:
                results.add_fail("register_hospital", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("register_hospital", str(e))

def test_update_hospital_capacity():
    """Test update_hospital_capacity function"""
    print(f"\n{BLUE}Testing: update_hospital_capacity{RESET}")
    
    try:
        mocks = setup_mocks()
        
        with patch('boto3.resource', return_value=mocks['dynamodb']):
            from update_hospital_capacity import handler
            
            # Test: Update hospital capacity
            event = {
                'pathParameters': {'id': 'hosp_test1'},
                'body': json.dumps({
                    'available_beds': 25,
                    'available_maternity_beds': 8,
                    'available_nicu_beds': 3
                })
            }
            
            # Mock get_item and update_item
            mocks['dynamodb'].Table().get_item.return_value = {'Item': mocks['hospitals'][0]}
            updated_hospital = {**mocks['hospitals'][0], 'available_beds': 25}
            mocks['dynamodb'].Table().update_item.return_value = {'Attributes': updated_hospital}
            
            response = handler.lambda_handler(event, None)
            
            if response['statusCode'] == 200:
                body = json.loads(response['body'])
                if body['success']:
                    results.add_pass("update_hospital_capacity - Update hospital capacity")
                else:
                    results.add_fail("update_hospital_capacity", "Response not successful")
            else:
                results.add_fail("update_hospital_capacity", f"Status code: {response['statusCode']}")
    
    except Exception as e:
        results.add_fail("update_hospital_capacity", str(e))

def main():
    """Run all tests"""
    print(f"\n{'='*60}")
    print(f"{BLUE}MaatriSahayak Lambda Functions Test Suite{RESET}")
    print(f"{'='*60}")
    print(f"Testing all implemented functions without deployment")
    print(f"{'='*60}\n")
    
    # Run all tests
    print(f"\n{YELLOW}=== Emergency & Core Functions ==={RESET}")
    test_check_hospital_capacity()
    test_find_nearest_ambulance()
    test_update_ambulance_location()
    test_get_ambulance_route()
    test_send_notifications()
    test_trigger_emergency()
    test_process_anc_card()
    
    print(f"\n{YELLOW}=== User Management Functions ==={RESET}")
    test_register_asha()
    test_get_asha_profile()
    test_update_asha_profile()
    test_register_ambulance()
    test_register_hospital()
    test_update_hospital_capacity()
    
    # Print summary
    results.print_summary()
    
    # Return exit code
    return 0 if results.failed == 0 else 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
