import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add the lambda functions directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Mock shared module to prevent real DynamoDB calls
mock_get_item = MagicMock(return_value={'id': 'preg_123', 'risk_score': 0, 'risk_level': 'LOW'})
mock_update_item = MagicMock()
mock_log_info = MagicMock()
mock_log_error = MagicMock()
mock_get_timestamp = MagicMock(return_value='2026-02-22T00:00:00Z')

with patch('shared.get_item', mock_get_item), \
     patch('shared.update_item', mock_update_item), \
     patch('shared.log_info', mock_log_info), \
     patch('shared.log_error', mock_log_error), \
     patch('shared.get_current_timestamp', mock_get_timestamp):
    
    from assess_risk.handler import app
    from fastapi.testclient import TestClient

    client = TestClient(app)

class TestAssessRiskML(unittest.TestCase):
    @patch('assess_risk.handler.get_item', mock_get_item)
    @patch('assess_risk.handler.update_item', mock_update_item)
    def test_assess_risk_success(self):
        payload = {
            "Age": 25.0,
            "Systolic_BP": 120.0,
            "Diastolic": 80.0,
            "BS": 5.5,
            "Body_Temp": 98.6,
            "BMI": 22.5,
            "Previous_Complications": 0.0,
            "Preexisting_Diabetes": 0.0,
            "Gestational_Diabetes": 0.0,
            "Mental_Health": 0.0,
            "Heart_Rate": 75.0
        }
        
        response = client.post("/risk/assess/preg_123", json=payload)
        
        print("\n--- Test Response ---")
        print("Status:", response.status_code)
        try:
            print("Body:", response.json())
        except:
            print("Body:", response.text)
            
        self.assertEqual(response.status_code, 200)
        json_resp = response.json()
        self.assertTrue(json_resp['success'])
        self.assertIn('risk_level', json_resp['data'])
        self.assertIn('risk_score', json_resp['data'])

if __name__ == '__main__':
    unittest.main(verbosity=2)
