"""
MaatriSahayak - Process ANC Card Lambda Function

Uses Amazon Textract to extract data from ANC (Antenatal Care) card images.
Handles both printed and handwritten text with confidence scoring.
"""

import json
import os
import boto3
import re
from datetime import datetime
from shared import (
    ValidationError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    generate_id,
    get_current_timestamp
)
from shared.constants import TABLE_NAMES, HTTP_STATUS

# Initialize AWS clients
textract_client = boto3.client('textract')
s3_client = boto3.client('s3')

# S3 bucket for ANC card images
ANC_CARDS_BUCKET = os.getenv('ANC_CARDS_BUCKET', 'maatrisahayak-anc-cards')


def lambda_handler(event, context):
    """
    Process ANC card image using Amazon Textract.
    
    Expected Input:
    {
        "image_key": "anc-cards/card_123.jpg",  // S3 key
        "pregnancy_id": "preg_123" (optional)
    }
    
    OR multipart/form-data with image file
    
    Returns:
    {
        "success": true,
        "data": {
            "extracted_data": {...},
            "confidence_score": 0.92,
            "requires_review": false,
            "raw_text": "...",
            "key_value_pairs": [...]
        }
    }
    """
    try:
        log_info("Process ANC card request received")
        
        # Parse request
        body = parse_event_body(event)
        
        # Get image from S3 or upload from request
        if body and 'image_key' in body:
            image_key = body['image_key']
        elif body and 'image_base64' in body:
            # Upload base64 image to S3
            image_key = upload_base64_to_s3(body['image_base64'])
        else:
            raise ValidationError("Either 'image_key' or 'image_base64' is required")
        
        pregnancy_id = body.get('pregnancy_id') if body else None
        
        log_info("Processing ANC card image", image_key=image_key)
        
        # Call Textract to analyze document
        textract_response = textract_client.analyze_document(
            Document={
                'S3Object': {
                    'Bucket': ANC_CARDS_BUCKET,
                    'Name': image_key
                }
            },
            FeatureTypes=['FORMS', 'TABLES']
        )
        
        # Extract and structure data
        extracted_data = extract_anc_data(textract_response)
        
        # Calculate confidence score
        confidence_score = calculate_confidence(textract_response)
        
        # Determine if human review is needed
        requires_review = confidence_score < 0.85 or extracted_data.get('missing_critical_fields', False)
        
        # Get raw text for reference
        raw_text = extract_raw_text(textract_response)
        
        # Get key-value pairs
        key_value_pairs = extract_key_value_pairs(textract_response)
        
        result = {
            'extraction_id': generate_id('extract_'),
            'image_key': image_key,
            'pregnancy_id': pregnancy_id,
            'extracted_data': extracted_data,
            'confidence_score': round(confidence_score, 2),
            'requires_review': requires_review,
            'raw_text': raw_text[:500],  # First 500 chars
            'key_value_pairs': key_value_pairs[:20],  # First 20 pairs
            'extracted_at': get_current_timestamp(),
            'textract_job_id': textract_response.get('JobId')
        }
        
        log_info(
            "ANC card processed successfully",
            confidence=confidence_score,
            requires_review=requires_review,
            fields_extracted=len(extracted_data)
        )
        
        return create_success_response(
            result,
            "ANC card processed successfully" + (" - Review recommended" if requires_review else "")
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error processing ANC card", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "Failed to process ANC card",
            {'error': str(e)}
        )


def upload_base64_to_s3(base64_data: str) -> str:
    """Upload base64 encoded image to S3."""
    import base64
    
    # Remove data URL prefix if present
    if ',' in base64_data:
        base64_data = base64_data.split(',')[1]
    
    # Decode base64
    image_bytes = base64.b64decode(base64_data)
    
    # Generate unique key
    image_key = f"anc-cards/{generate_id('card_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    
    # Upload to S3
    s3_client.put_object(
        Bucket=ANC_CARDS_BUCKET,
        Key=image_key,
        Body=image_bytes,
        ContentType='image/jpeg'
    )
    
    log_info("Image uploaded to S3", key=image_key)
    return image_key


def extract_anc_data(textract_response: dict) -> dict:
    """
    Extract structured ANC card data from Textract response.
    
    Typical ANC card fields:
    - Patient name, age, address
    - LMP (Last Menstrual Period)
    - EDD (Expected Date of Delivery)
    - Blood group, Rh factor
    - Height, weight
    - Previous pregnancy history
    - BP readings
    - Hemoglobin levels
    - Vaccination records
    """
    extracted = {}
    
    # Get all text blocks
    blocks = textract_response.get('Blocks', [])
    
    # Extract key-value pairs
    kv_pairs = {}
    for block in blocks:
        if block['BlockType'] == 'KEY_VALUE_SET':
            if 'KEY' in block.get('EntityTypes', []):
                key_text = get_text_from_block(block, blocks)
                value_block = get_value_block(block, blocks)
                if value_block:
                    value_text = get_text_from_block(value_block, blocks)
                    kv_pairs[key_text.lower()] = value_text
    
    # Map to structured fields
    extracted['patient_name'] = find_field(kv_pairs, ['name', 'patient name', 'mother name'])
    extracted['age'] = parse_number(find_field(kv_pairs, ['age', 'mother age']))
    extracted['address'] = find_field(kv_pairs, ['address', 'village', 'location'])
    extracted['phone'] = find_field(kv_pairs, ['phone', 'mobile', 'contact'])
    
    # Pregnancy details
    extracted['lmp'] = parse_date(find_field(kv_pairs, ['lmp', 'last menstrual period']))
    extracted['edd'] = parse_date(find_field(kv_pairs, ['edd', 'expected delivery', 'due date']))
    extracted['blood_group'] = find_field(kv_pairs, ['blood group', 'blood type'])
    extracted['rh_factor'] = find_field(kv_pairs, ['rh', 'rh factor'])
    
    # Physical measurements
    extracted['height'] = parse_number(find_field(kv_pairs, ['height']))
    extracted['weight'] = parse_number(find_field(kv_pairs, ['weight']))
    
    # Medical history
    extracted['gravida'] = parse_number(find_field(kv_pairs, ['gravida', 'g']))
    extracted['para'] = parse_number(find_field(kv_pairs, ['para', 'p']))
    extracted['abortion'] = parse_number(find_field(kv_pairs, ['abortion', 'a']))
    
    # Latest vitals (if present)
    extracted['bp_systolic'] = parse_number(find_field(kv_pairs, ['bp', 'blood pressure', 'systolic']))
    extracted['hemoglobin'] = parse_number(find_field(kv_pairs, ['hb', 'hemoglobin']))
    
    # Check for missing critical fields
    critical_fields = ['patient_name', 'lmp', 'edd']
    missing = [f for f in critical_fields if not extracted.get(f)]
    extracted['missing_critical_fields'] = len(missing) > 0
    extracted['missing_fields'] = missing
    
    # Remove None values
    extracted = {k: v for k, v in extracted.items() if v is not None}
    
    return extracted


def extract_key_value_pairs(textract_response: dict) -> list:
    """Extract all key-value pairs for display."""
    pairs = []
    blocks = textract_response.get('Blocks', [])
    
    for block in blocks:
        if block['BlockType'] == 'KEY_VALUE_SET' and 'KEY' in block.get('EntityTypes', []):
            key_text = get_text_from_block(block, blocks)
            value_block = get_value_block(block, blocks)
            if value_block:
                value_text = get_text_from_block(value_block, blocks)
                confidence = block.get('Confidence', 0)
                pairs.append({
                    'key': key_text,
                    'value': value_text,
                    'confidence': round(confidence, 2)
                })
    
    return pairs


def extract_raw_text(textract_response: dict) -> str:
    """Extract all text from document."""
    text_blocks = []
    for block in textract_response.get('Blocks', []):
        if block['BlockType'] == 'LINE':
            text_blocks.append(block.get('Text', ''))
    return '\n'.join(text_blocks)


def get_text_from_block(block: dict, all_blocks: list) -> str:
    """Get text content from a block."""
    text = []
    if 'Relationships' in block:
        for relationship in block['Relationships']:
            if relationship['Type'] == 'CHILD':
                for child_id in relationship['Ids']:
                    child_block = next((b for b in all_blocks if b['Id'] == child_id), None)
                    if child_block and child_block['BlockType'] == 'WORD':
                        text.append(child_block.get('Text', ''))
    return ' '.join(text)


def get_value_block(key_block: dict, all_blocks: list) -> dict:
    """Get the value block associated with a key block."""
    if 'Relationships' in key_block:
        for relationship in key_block['Relationships']:
            if relationship['Type'] == 'VALUE':
                for value_id in relationship['Ids']:
                    value_block = next((b for b in all_blocks if b['Id'] == value_id), None)
                    if value_block:
                        return value_block
    return None


def calculate_confidence(textract_response: dict) -> float:
    """Calculate average confidence score."""
    confidences = []
    for block in textract_response.get('Blocks', []):
        if 'Confidence' in block:
            confidences.append(block['Confidence'])
    
    return sum(confidences) / len(confidences) if confidences else 0.0


def find_field(kv_pairs: dict, possible_keys: list) -> str:
    """Find field value by checking multiple possible key names."""
    for key in possible_keys:
        for kv_key, value in kv_pairs.items():
            if key in kv_key:
                return value
    return None


def parse_number(text: str) -> float:
    """Extract number from text."""
    if not text:
        return None
    
    # Remove non-numeric characters except decimal point
    numbers = re.findall(r'\d+\.?\d*', text)
    if numbers:
        try:
            return float(numbers[0])
        except:
            return None
    return None


def parse_date(text: str) -> str:
    """Parse date from various formats."""
    if not text:
        return None
    
    # Try common date formats
    date_patterns = [
        r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})',  # DD/MM/YYYY or DD-MM-YYYY
        r'(\d{2,4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    
    return text  # Return as-is if no pattern matches
