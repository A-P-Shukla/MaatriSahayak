"""
Send notification to ASHA worker for connectivity issues.
"""

import json
import boto3
from datetime import datetime

sns_client = boto3.client('sns')
dynamodb = boto3.resource('dynamodb')


def send_connectivity_alert(asha_worker_id: str, asha_name: str, phone: str) -> dict:
    """
    Send connectivity alert to ASHA worker.
    
    Args:
        asha_worker_id: ASHA worker ID
        asha_name: ASHA worker name
        phone: Phone number
    
    Returns:
        Result dictionary
    """
    try:
        # Format phone number for SNS
        if not phone.startswith('+'):
            if phone.startswith('91'):
                phone = '+' + phone
            else:
                phone = '+91' + phone
        
        # Concise message for ASHA worker
        message = f"""नमस्ते {asha_name},

🌐 नेटवर्क समस्या
कृपया अपना इंटरनेट कनेक्शन जांचें।

यदि समस्या बनी रहे तो:
• WiFi को बंद/चालू करें
• डेटा को बंद/चालू करें
• ऐप को पुनः शुरू करें

धन्यवाद,
MaatriSahayak टीम"""
        
        # Send SMS via SNS
        response = sns_client.publish(
            PhoneNumber=phone,
            Message=message,
            MessageAttributes={
                'AWS.SNS.SMS.SMSType': {
                    'DataType': 'String',
                    'StringValue': 'Transactional'
                }
            }
        )
        
        return {
            'success': True,
            'asha_worker_id': asha_worker_id,
            'asha_name': asha_name,
            'phone': phone,
            'message_id': response.get('MessageId'),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            'success': False,
            'asha_worker_id': asha_worker_id,
            'error': str(e)
        }


# Example usage for Nitya Mishra
if __name__ == '__main__':
    result = send_connectivity_alert(
        asha_worker_id='nitya_mishra_001',
        asha_name='Nitya Mishra',
        phone='9876543210'  # Replace with actual phone
    )
    print(json.dumps(result, indent=2))
