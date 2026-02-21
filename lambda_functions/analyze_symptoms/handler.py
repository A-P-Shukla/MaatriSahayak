"""
MaatriSahayak - Analyze Symptoms Lambda Function

AI-powered symptom analysis using Amazon Bedrock for natural language understanding.
"""

import json
import os
import boto3
from shared import (
    ValidationError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields
)
from shared.constants import HTTP_STATUS

# Initialize Bedrock client
bedrock_client = boto3.client('bedrock-runtime')

# Model configuration
BEDROCK_MODEL_ID = os.getenv('BEDROCK_MODEL_ID', 'anthropic.claude-v2')


def lambda_handler(event, context):
    """
    Analyze pregnancy-related symptoms using AI.
    
    Expected Input:
    {
        "symptoms": "string or array of strings",
        "gestational_age_weeks": int (optional),
        "medical_history": {...} (optional)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "analysis": "...",
            "severity": "LOW|MODERATE|HIGH|EMERGENCY",
            "recommendations": [...],
            "requires_immediate_attention": boolean
        }
    }
    """
    try:
        log_info("Analyze symptoms request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        validate_required_fields(body, ['symptoms'])
        
        # Normalize symptoms to array
        symptoms = body['symptoms']
        if isinstance(symptoms, str):
            symptoms = [symptoms]
        
        gestational_age = body.get('gestational_age_weeks')
        medical_history = body.get('medical_history', {})
        
        log_info("Analyzing symptoms", symptom_count=len(symptoms))
        
        # Analyze symptoms using AI
        analysis_result = analyze_symptoms_with_ai(symptoms, gestational_age, medical_history)
        
        log_info(
            "Symptom analysis completed",
            severity=analysis_result['severity'],
            requires_attention=analysis_result['requires_immediate_attention']
        )
        
        return create_success_response(
            analysis_result,
            "Symptom analysis completed successfully"
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
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred during symptom analysis",
            {'error': str(e)}
        )


def analyze_symptoms_with_ai(symptoms: list, gestational_age: int = None, medical_history: dict = None) -> dict:
    """
    Analyze symptoms using Amazon Bedrock AI.
    
    This is a rule-based fallback implementation. In production, integrate with:
    - Amazon Bedrock (Claude, Titan)
    - Custom medical AI model
    
    Args:
        symptoms: List of symptom descriptions
        gestational_age: Gestational age in weeks
        medical_history: Medical history dictionary
    
    Returns:
        Analysis result dictionary
    """
    # Emergency symptoms that require immediate attention
    emergency_keywords = [
        'severe bleeding', 'heavy bleeding', 'hemorrhage',
        'severe headache', 'blurred vision', 'vision changes',
        'severe abdominal pain', 'chest pain',
        'difficulty breathing', 'shortness of breath',
        'seizure', 'convulsion',
        'no fetal movement', 'baby not moving',
        'water broke', 'rupture of membranes',
        'severe swelling', 'sudden swelling'
    ]
    
    # High priority symptoms
    high_priority_keywords = [
        'bleeding', 'spotting',
        'persistent headache', 'headache',
        'swelling', 'edema',
        'reduced fetal movement',
        'fever', 'high temperature',
        'vomiting', 'nausea',
        'dizziness', 'fainting'
    ]
    
    # Moderate priority symptoms
    moderate_priority_keywords = [
        'back pain', 'backache',
        'leg cramps',
        'heartburn',
        'constipation',
        'fatigue', 'tiredness',
        'frequent urination'
    ]
    
    # Analyze symptoms
    symptoms_text = ' '.join(symptoms).lower()
    
    severity = "LOW"
    requires_immediate_attention = False
    recommendations = []
    analysis_parts = []
    
    # Check for emergency symptoms
    emergency_found = []
    for keyword in emergency_keywords:
        if keyword in symptoms_text:
            emergency_found.append(keyword)
    
    if emergency_found:
        severity = "EMERGENCY"
        requires_immediate_attention = True
        analysis_parts.append(f"EMERGENCY: Detected critical symptoms - {', '.join(emergency_found)}")
        recommendations.append("CALL EMERGENCY SERVICES IMMEDIATELY")
        recommendations.append("Do not wait - seek immediate medical attention")
        recommendations.append("Go to nearest hospital emergency department")
    
    # Check for high priority symptoms
    elif any(keyword in symptoms_text for keyword in high_priority_keywords):
        severity = "HIGH"
        requires_immediate_attention = True
        analysis_parts.append("High priority symptoms detected that require prompt medical evaluation")
        recommendations.append("Contact healthcare provider within 24 hours")
        recommendations.append("Monitor symptoms closely")
        recommendations.append("Seek immediate care if symptoms worsen")
    
    # Check for moderate priority symptoms
    elif any(keyword in symptoms_text for keyword in moderate_priority_keywords):
        severity = "MODERATE"
        analysis_parts.append("Common pregnancy symptoms detected")
        recommendations.append("Discuss with healthcare provider at next scheduled visit")
        recommendations.append("Monitor symptoms and note any changes")
    
    else:
        severity = "LOW"
        analysis_parts.append("Symptoms appear to be minor or non-specific")
        recommendations.append("Continue routine prenatal care")
        recommendations.append("Mention symptoms at next antenatal visit")
    
    # Add gestational age-specific recommendations
    if gestational_age:
        if gestational_age < 12:
            analysis_parts.append(f"First trimester (week {gestational_age})")
            recommendations.append("Ensure adequate folic acid supplementation")
        elif gestational_age < 28:
            analysis_parts.append(f"Second trimester (week {gestational_age})")
            recommendations.append("Continue regular antenatal check-ups")
        else:
            analysis_parts.append(f"Third trimester (week {gestational_age})")
            recommendations.append("Monitor fetal movements daily")
            if gestational_age >= 37:
                recommendations.append("Be prepared for labor - know warning signs")
    
    # Add medical history considerations
    if medical_history:
        if medical_history.get('diabetes'):
            recommendations.append("Monitor blood glucose levels regularly")
        if medical_history.get('hypertension'):
            recommendations.append("Monitor blood pressure regularly")
    
    # General recommendations
    recommendations.append("Stay hydrated and maintain adequate nutrition")
    recommendations.append("Get adequate rest")
    
    analysis = ". ".join(analysis_parts)
    
    return {
        'analysis': analysis,
        'severity': severity,
        'requires_immediate_attention': requires_immediate_attention,
        'recommendations': recommendations,
        'symptoms_analyzed': symptoms
    }


def invoke_bedrock_model(prompt: str) -> str:
    """
    Invoke Amazon Bedrock model for symptom analysis.
    
    This is a placeholder for production implementation.
    
    Args:
        prompt: Prompt for the AI model
    
    Returns:
        AI model response
    """
    try:
        # Prepare request body for Claude model
        request_body = {
            "prompt": f"\n\nHuman: {prompt}\n\nAssistant:",
            "max_tokens_to_sample": 500,
            "temperature": 0.5,
            "top_p": 0.9
        }
        
        # Invoke Bedrock model
        response = bedrock_client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        completion = response_body.get('completion', '')
        
        return completion.strip()
    
    except Exception as e:
        log_error("Failed to invoke Bedrock model", e)
        raise
