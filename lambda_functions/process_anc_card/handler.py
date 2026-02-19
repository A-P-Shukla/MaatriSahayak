"""
MaatriSahayak - Process ANC Card Lambda Function

Processes ANC (Antenatal Care) card images using OCR to extract pregnancy data.
"""

import json
import os
import boto3
import base64
from shared import (
    ValidationError,
    DatabaseError,
    ResourceNotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    log_warning,
    get_item,
    update_item,
    generate_id,
    get_current_timestamp,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, S3_PREFIXES

# Initialize AWS clients
s3_client = boto3.client('s3')
textract_client = boto3.client('textract')

# S3 bucket name from environment
S3_BUCKET = os.getenv('S3_BUCKET', 'maatrisahayak-documents')


def lambda_handler(event, context):
    """
    Process ANC card image to extract pregnancy data.
    
    Expected Input:
    {
        "pregnancy_id": "string",
        "image_data": "base64_encoded_image" (optional if s3_key provided),
        "s3_key": "string" (optional if image_data provided),
        "auto_update": boolean (default: false)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "extracted_data": {
                "patient_name": "...",
                "lmp_date": "...",
                "blood_type": "...",
                ...
            },
            "confidence_scores": {...},
            "s3_key": "...",
            "updated_pregnancy": boolean
        }
    }
    """
    try:
        log_info("Process ANC card request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        validate_required_fields(body, ['pregnancy_id'])
        
        pregnancy_id = body['pregnancy_id']
        auto_update = body.get('auto_update', False)
        
        # Verify pregnancy exists
        pregnancy = get_item(TABLE_NAMES['PREGNANCIES'], {'id': pregnancy_id})
        
        if not pregnancy:
            raise ResourceNotFoundError('Pregnancy', pregnancy_id)
        
        # Get or upload image to S3
        s3_key = body.get('s3_key')
        
        if not s3_key:
            if 'image_data' not in body:
                raise ValidationError("Either 'image_data' or 's3_key' must be provided")
            
            # Upload image to S3
            s3_key = upload_image_to_s3(body['image_data'], pregnancy_id)
        
        log_info("Processing ANC card image", s3_key=s3_key)
        
        # Process image with AWS Textract
        extracted_text = extract_text_from_image(s3_key)
        
        # Parse extracted text to structured data
        extracted_data = parse_anc_card_data(extracted_text)
        
        # Calculate confidence scores
        confidence_scores = calculate_confidence_scores(extracted_data)
        
        # Auto-update pregnancy record if requested and confidence is high
        updated_pregnancy = False
        if auto_update and all(score > 0.8 for score in confidence_scores.values()):
            try:
                update_pregnancy_from_anc_data(pregnancy_id, extracted_data)
                updated_pregnancy = True
                log_info("Pregnancy record updated from ANC card", pregnancy_id=pregnancy_id)
            except Exception as e:
                log_error("Failed to update pregnancy record", e)
        
        log_info(
            "ANC card processed successfully",
            pregnancy_id=pregnancy_id,
            fields_extracted=len(extracted_data),
            updated=updated_pregnancy
        )
        
        return create_success_response(
            {
                'extracted_data': extracted_data,
                'confidence_scores': confidence_scores,
                's3_key': s3_key,
                'updated_pregnancy': updated_pregnancy
            },
            "ANC card processed successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except ResourceNotFoundError as e:
        log_error("Pregnancy not found", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while processing ANC card",
            {'error': str(e)}
        )


def upload_image_to_s3(image_data: str, pregnancy_id: str) -> str:
    """
    Upload base64 encoded image to S3.
    
    Args:
        image_data: Base64 encoded image
        pregnancy_id: Pregnancy ID
    
    Returns:
        S3 key of uploaded image
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Generate S3 key
        timestamp = get_current_timestamp().replace(':', '-').replace('.', '-')
        s3_key = f"{S3_PREFIXES['ANC_CARDS']}{pregnancy_id}/anc_card_{timestamp}.jpg"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=image_bytes,
            ContentType='image/jpeg'
        )
        
        log_info("Image uploaded to S3", s3_key=s3_key)
        
        return s3_key
    
    except Exception as e:
        log_error("Failed to upload image to S3", e)
        raise


def extract_text_from_image(s3_key: str) -> dict:
    """
    Extract text from image using AWS Textract.
    
    Args:
        s3_key: S3 key of the image
    
    Returns:
        Extracted text data
    """
    try:
        # Call Textract to analyze document
        response = textract_client.analyze_document(
            Document={
                'S3Object': {
                    'Bucket': S3_BUCKET,
                    'Name': s3_key
                }
            },
            FeatureTypes=['FORMS', 'TABLES']
        )
        
        # Extract text blocks
        text_blocks = []
        key_value_pairs = {}
        
        for block in response['Blocks']:
            if block['BlockType'] == 'LINE':
                text_blocks.append({
                    'text': block['Text'],
                    'confidence': block['Confidence']
                })
            
            elif block['BlockType'] == 'KEY_VALUE_SET':
                if 'KEY' in block.get('EntityTypes', []):
                    key_text = extract_text_from_relationship(block, response['Blocks'])
                    value_text = extract_value_from_key(block, response['Blocks'])
                    if key_text and value_text:
                        key_value_pairs[key_text] = value_text
        
        log_info("Text extracted from image", blocks_count=len(text_blocks))
        
        return {
            'text_blocks': text_blocks,
            'key_value_pairs': key_value_pairs
        }
    
    except Exception as e:
        log_error("Failed to extract text from image", e)
        raise


def extract_text_from_relationship(block: dict, all_blocks: list) -> str:
    """Extract text from block relationships."""
    text = ""
    if 'Relationships' in block:
        for relationship in block['Relationships']:
            if relationship['Type'] == 'CHILD':
                for child_id in relationship['Ids']:
                    child_block = next((b for b in all_blocks if b['Id'] == child_id), None)
                    if child_block and child_block['BlockType'] == 'WORD':
                        text += child_block['Text'] + " "
    return text.strip()


def extract_value_from_key(key_block: dict, all_blocks: list) -> str:
    """Extract value text from key block."""
    if 'Relationships' in key_block:
        for relationship in key_block['Relationships']:
            if relationship['Type'] == 'VALUE':
                for value_id in relationship['Ids']:
                    value_block = next((b for b in all_blocks if b['Id'] == value_id), None)
                    if value_block:
                        return extract_text_from_relationship(value_block, all_blocks)
    return ""


def parse_anc_card_data(extracted_text: dict) -> dict:
    """
    Parse extracted text to structured pregnancy data.
    
    Args:
        extracted_text: Extracted text from Textract
    
    Returns:
        Structured pregnancy data
    """
    parsed_data = {}
    key_value_pairs = extracted_text.get('key_value_pairs', {})
    
    # Map common ANC card fields
    field_mappings = {
        'name': ['name', 'patient name', 'mother name', 'mothers name'],
        'age': ['age', 'mother age', 'mothers age'],
        'blood_type': ['blood group', 'blood type', 'blood'],
        'lmp_date': ['lmp', 'last menstrual period', 'lmp date'],
        'edd': ['edd', 'expected date of delivery', 'due date'],
        'gravida': ['gravida', 'g'],
        'parity': ['parity', 'p'],
        'height': ['height'],
        'weight': ['weight', 'initial weight']
    }
    
    # Extract data from key-value pairs
    for field, keywords in field_mappings.items():
        for key, value in key_value_pairs.items():
            key_lower = key.lower()
            if any(keyword in key_lower for keyword in keywords):
                parsed_data[field] = value.strip()
                break
    
    # Clean and validate extracted data
    if 'age' in parsed_data:
        try:
            parsed_data['age'] = int(''.join(filter(str.isdigit, parsed_data['age'])))
        except:
            del parsed_data['age']
    
    if 'blood_type' in parsed_data:
        # Normalize blood type
        blood_type = parsed_data['blood_type'].upper().replace(' ', '')
        if blood_type in ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']:
            parsed_data['blood_type'] = blood_type
        else:
            del parsed_data['blood_type']
    
    log_info("ANC card data parsed", fields_extracted=len(parsed_data))
    
    return parsed_data


def calculate_confidence_scores(extracted_data: dict) -> dict:
    """
    Calculate confidence scores for extracted data.
    
    Args:
        extracted_data: Extracted pregnancy data
    
    Returns:
        Confidence scores for each field
    """
    confidence_scores = {}
    
    # Simple confidence calculation based on data completeness and format
    for field, value in extracted_data.items():
        if not value:
            confidence_scores[field] = 0.0
        elif field == 'age':
            # Age should be between 15-50
            confidence_scores[field] = 0.9 if 15 <= value <= 50 else 0.5
        elif field == 'blood_type':
            # Blood type should be valid
            confidence_scores[field] = 0.95
        elif field in ['lmp_date', 'edd']:
            # Date fields - check if they look like dates
            confidence_scores[field] = 0.85 if '/' in str(value) or '-' in str(value) else 0.6
        else:
            # Default confidence for text fields
            confidence_scores[field] = 0.8
    
    return confidence_scores


def update_pregnancy_from_anc_data(pregnancy_id: str, extracted_data: dict):
    """
    Update pregnancy record with extracted ANC card data.
    
    Args:
        pregnancy_id: Pregnancy ID
        extracted_data: Extracted data from ANC card
    """
    # Prepare updates (only include fields that were extracted)
    updates = {}
    
    field_mapping = {
        'name': 'patient_name',
        'age': 'age',
        'blood_type': 'blood_type',
        'lmp_date': 'lmp_date',
        'edd': 'edd',
        'gravida': 'gravida',
        'parity': 'parity'
    }
    
    for extracted_field, db_field in field_mapping.items():
        if extracted_field in extracted_data:
            updates[db_field] = extracted_data[extracted_field]
    
    if updates:
        updates['updated_at'] = get_current_timestamp()
        
        update_item(
            TABLE_NAMES['PREGNANCIES'],
            {'id': pregnancy_id},
            updates
        )
        
        log_info("Pregnancy updated from ANC card", pregnancy_id=pregnancy_id, fields_updated=len(updates))
