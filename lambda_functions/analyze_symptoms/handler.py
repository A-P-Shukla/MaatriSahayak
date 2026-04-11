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
    Analyze pregnancy-related symptoms using AI with multilingual support.
    
    Expected Input:
    {
        "symptoms": "string or array of strings (in Hindi or English)",
        "language": "hi" or "en" (default: "en"),
        "gestational_age_weeks": int (optional),
        "medical_history": {...} (optional),
        "pregnancy_id": "string" (optional - for context)
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "analysis": "...",
            "severity": "LOW|MODERATE|HIGH|EMERGENCY",
            "recommendations": [...],
            "requires_immediate_attention": boolean,
            "action_plan": "Plain language action recommendation",
            "response_time_ms": int
        }
    }
    """
    import time
    start_time = time.time()
    
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
        
        language = body.get('language', 'en')
        gestational_age = body.get('gestational_age_weeks')
        medical_history = body.get('medical_history', {})
        pregnancy_id = body.get('pregnancy_id')
        
        log_info("Analyzing symptoms with AI", symptom_count=len(symptoms), language=language)
        
        # Use AI-powered analysis with Bedrock
        analysis_result = analyze_symptoms_with_bedrock(
            symptoms, 
            gestational_age, 
            medical_history,
            language,
            pregnancy_id
        )
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        analysis_result['response_time_ms'] = response_time_ms
        
        log_info(
            "Symptom analysis completed",
            severity=analysis_result['severity'],
            requires_attention=analysis_result['requires_immediate_attention'],
            response_time_ms=response_time_ms
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


def invoke_bedrock_model(prompt: str, language: str = 'en') -> str:
    """
    Invoke Amazon Bedrock Claude 3 for symptom analysis with multilingual support.
    
    Args:
        prompt: Prompt for the AI model
        language: Language code ('en' or 'hi')
    
    Returns:
        AI model response in requested language
    """
    try:
        # Enhanced system context for maternal health
        system_context = """You are an expert maternal health AI assistant specialized in obstetric emergencies in rural India.
Analyze symptoms, assess severity using clinical guidelines, and provide clear action recommendations.
Focus on: preeclampsia, eclampsia, postpartum hemorrhage, sepsis, obstructed labor, and fetal distress.
Always prioritize patient safety. For critical symptoms, recommend immediate medical attention."""

        language_instruction = ""
        if language == 'hi':
            language_instruction = "\n\nIMPORTANT: Provide your entire response in Hindi (Devanagari script). Use simple, clear medical terminology that ASHA workers and patients can understand. Avoid complex English medical terms."
        
        # Prepare request body for Claude 3 Sonnet
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": 0.3,
            "top_p": 0.9,
            "system": system_context + language_instruction,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        # Invoke Bedrock model
        response = bedrock_client.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps(request_body)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text']
    
    except Exception as e:
        log_error("Failed to invoke Bedrock model", e)
        # Fallback to rule-based if Bedrock fails
        raise


def analyze_symptoms_with_bedrock(symptoms: list, gestational_age: int = None, 
                                   medical_history: dict = None, language: str = 'en',
                                   pregnancy_id: str = None) -> dict:
    """
    AI-powered symptom analysis using Amazon Bedrock with natural language understanding.
    Parses symptoms in patient's own words (Hindi or English) and returns clinical assessment.
    
    Args:
        symptoms: List of symptom descriptions in natural language
        gestational_age: Gestational age in weeks
        medical_history: Medical history dictionary
        language: Response language ('en' or 'hi')
        pregnancy_id: Optional pregnancy ID for context
    
    Returns:
        Comprehensive analysis with severity, recommendations, and action plan
    """
    try:
        # Build context for AI
        context_parts = []
        context_parts.append(f"Patient symptoms: {', '.join(symptoms)}")
        
        if gestational_age:
            trimester = "first" if gestational_age < 13 else "second" if gestational_age < 28 else "third"
            context_parts.append(f"Gestational age: {gestational_age} weeks ({trimester} trimester)")
        
        if medical_history:
            history_items = []
            if medical_history.get('diabetes'): history_items.append("diabetes")
            if medical_history.get('hypertension'): history_items.append("hypertension")
            if medical_history.get('previous_cesarean'): history_items.append("previous cesarean")
            if medical_history.get('anemia'): history_items.append("anemia")
            if history_items:
                context_parts.append(f"Medical history: {', '.join(history_items)}")
        
        context = "\n".join(context_parts)
        
        # Create AI prompt
        prompt = f"""{context}

Task: Analyze these pregnancy symptoms and provide:
1. Clinical assessment of severity (LOW, MODERATE, HIGH, or EMERGENCY)
2. Specific clinical concerns identified
3. Clear action recommendations for ASHA worker
4. Whether immediate medical attention is required (yes/no)
5. Plain language explanation for the patient

Format your response as JSON:
{{
  "severity": "EMERGENCY|HIGH|MODERATE|LOW",
  "clinical_concerns": ["concern1", "concern2"],
  "requires_immediate_attention": true/false,
  "action_plan": "Clear, actionable steps in simple language",
  "recommendations": ["recommendation1", "recommendation2"],
  "patient_explanation": "Simple explanation for patient"
}}"""

        # Get AI response
        ai_response = invoke_bedrock_model(prompt, language)
        
        # Parse JSON from AI response
        import re
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            # Fallback if JSON parsing fails
            result = analyze_symptoms_with_ai(symptoms, gestational_age, medical_history)
            result['ai_powered'] = False
            return result
        
        # Enhance result with additional fields
        result['symptoms_analyzed'] = symptoms
        result['ai_powered'] = True
        result['language'] = language
        
        # Ensure all required fields exist
        if 'analysis' not in result:
            result['analysis'] = result.get('patient_explanation', result.get('action_plan', ''))
        
        return result
        
    except Exception as e:
        log_error("Bedrock analysis failed, using fallback", e)
        # Fallback to rule-based analysis
        result = analyze_symptoms_with_ai(symptoms, gestational_age, medical_history)
        result['ai_powered'] = False
        return result
