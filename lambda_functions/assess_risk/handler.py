"""
MaatriSahayak - Assess Risk Lambda Function via FastAPI & Mangum

AI-powered risk assessment using the pre-trained Random Forest model.
"""

import os
import pickle
import pandas as pd
import boto3
from fastapi import FastAPI, HTTPException, Path, Body
from pydantic import BaseModel, Field
from mangum import Mangum

from shared import (
    get_item,
    update_item,
    get_current_timestamp,
    log_info,
    log_error
)
from shared.constants import TABLE_NAMES, RISK_LEVELS

# Initialize FastAPI app
app = FastAPI(title="MaatriSahayak Risk Predictor", root_path="/dev")

# Load the ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'maatrisahyak.pkl')
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Input Data Schema defining the 11 ML features
class PatientData(BaseModel):
    Age: float = Field(..., description="Age in years")
    Systolic_BP: float = Field(..., description="Systolic Blood Pressure (mmHg)")
    Diastolic: float = Field(..., description="Diastolic Blood Pressure (mmHg)")
    BS: float = Field(..., description="Blood Sugar in mmol/L")
    Body_Temp: float = Field(..., description="Body Temperature (Fahrenheit)")
    BMI: float = Field(..., description="Body Mass Index")
    Previous_Complications: float = Field(..., description="Binary 0/1 indicator")
    Preexisting_Diabetes: float = Field(..., description="Binary 0/1 indicator")
    Gestational_Diabetes: float = Field(..., description="Binary 0/1 indicator")
    Mental_Health: float = Field(..., description="Binary 0/1 indicator")
    Heart_Rate: float = Field(..., description="Heart rate (bpm)")


@app.post("/risk/assess/{pregnancy_id}")
def assess_risk(
    pregnancy_id: str = Path(..., description="The ID of the pregnancy"),
    data: PatientData = Body(..., description="The patient's clinical and physiological data")
):
    """
    Assess pregnancy risk using the Random Forest ML model.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="ML Model is not loaded.")

    try:
        log_info("FastAPI: Assess risk request", pregnancy_id=pregnancy_id)
        
        # 1. Verify the pregnancy exists
        pregnancy_table = TABLE_NAMES.get('PREGNANCIES', 'maatrisahayak-pregnancies-dev')
        pregnancy = get_item(pregnancy_table, {'id': pregnancy_id})
        
        if not pregnancy:
            raise HTTPException(status_code=404, detail=f"Pregnancy with ID {pregnancy_id} not found.")

        # 2. Format input for the model
        input_data = pd.DataFrame([{
            'Age': data.Age,
            'Systolic BP': data.Systolic_BP,
            'Diastolic': data.Diastolic,
            'BS': data.BS,
            'Body Temp': data.Body_Temp,
            'BMI': data.BMI,
            'Previous Complications': data.Previous_Complications,
            'Preexisting Diabetes': data.Preexisting_Diabetes,
            'Gestational Diabetes': data.Gestational_Diabetes,
            'Mental Health': data.Mental_Health,
            'Heart Rate': data.Heart_Rate
        }])
        
        # 3. Model Prediction
        # Prediction is 1 for High risk, 0 for Low risk.
        prediction_val = int(model.predict(input_data)[0])
        
        risk_level = "HIGH" if prediction_val == 1 else "LOW"
        risk_score = 0.85 if prediction_val == 1 else 0.15 # ML prediction to rough score equivalent

        # 4. Update the Pregnancies Table
        if pregnancy.get('risk_level') != risk_level or pregnancy.get('risk_score') != risk_score:
            update_item(
                pregnancy_table,
                {'id': pregnancy_id},
                {
                    'risk_level': risk_level,
                    'risk_score': risk_score,
                    'updated_at': get_current_timestamp()
                }
            )
            log_info(
                "Pregnancy risk level updated via ML",
                pregnancy_id=pregnancy_id,
                old_risk=pregnancy.get('risk_level'),
                new_risk=risk_level
            )

        log_info(
            "Risk assessment completed successfully",
            pregnancy_id=pregnancy_id,
            risk_level=risk_level,
            prediction=prediction_val
        )

        return {
            "success": True,
            "message": "Risk assessment completed successfully",
            "data": {
                "pregnancy_id": pregnancy_id,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "assessed_at": get_current_timestamp()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_error("Failed to assess risk", e)
        raise HTTPException(status_code=400, detail=str(e))

# Wrap the FastAPI app in Mangum for AWS Lambda
lambda_handler = Mangum(app)



# ==================== CONTINUOUS RISK MONITORING ====================
# This function is triggered by DynamoDB Streams on VitalSigns table
# It automatically reassesses risk whenever new vitals are recorded

def continuous_risk_monitor_handler(event, context):
    """
    DynamoDB Stream handler for continuous risk monitoring.
    Triggered automatically when vitals are recorded or pregnancy data changes.
    
    This implements the "AI model watches data between visits" feature.
    """
    try:
        log_info("Continuous risk monitoring triggered", record_count=len(event['Records']))
        
        for record in event['Records']:
            if record['eventName'] in ['INSERT', 'MODIFY']:
                # Get the new data
                new_image = record['dynamodb'].get('NewImage', {})
                old_image = record['dynamodb'].get('OldImage', {})
                
                # Extract pregnancy_id
                pregnancy_id = new_image.get('pregnancy_id', {}).get('S')
                
                if not pregnancy_id:
                    continue
                
                log_info("Processing risk update", pregnancy_id=pregnancy_id)
                
                # Get full pregnancy and vitals data
                pregnancy_table = TABLE_NAMES.get('PREGNANCIES')
                vitals_table = TABLE_NAMES.get('VITAL_SIGNS')
                
                pregnancy = get_item(pregnancy_table, {'id': pregnancy_id})
                if not pregnancy:
                    continue
                
                # Get latest vitals
                from shared.db_helper import query_items
                latest_vitals = query_items(
                    vitals_table,
                    'pregnancy-events-index',
                    'pregnancy_id = :pid',
                    {':pid': pregnancy_id},
                    scan_index_forward=False,
                    limit=1
                )
                
                if not latest_vitals:
                    continue
                
                vital = latest_vitals[0]
                
                # Build patient data for ML model
                patient_data = {
                    'Age': pregnancy.get('age', 25),
                    'Systolic_BP': vital.get('blood_pressure_systolic', 120),
                    'Diastolic': vital.get('blood_pressure_diastolic', 80),
                    'BS': vital.get('blood_sugar', 5.0),
                    'Body_Temp': vital.get('temperature', 98.6),
                    'BMI': pregnancy.get('bmi', 22.0),
                    'Previous_Complications': 1 if pregnancy.get('previous_complications') else 0,
                    'Preexisting_Diabetes': 1 if pregnancy.get('medical_history', {}).get('diabetes') else 0,
                    'Gestational_Diabetes': 1 if pregnancy.get('gestational_diabetes') else 0,
                    'Mental_Health': 1 if pregnancy.get('mental_health_concerns') else 0,
                    'Heart_Rate': vital.get('heart_rate', 75)
                }
                
                # Run ML prediction
                if model:
                    input_df = pd.DataFrame([{
                        'Age': patient_data['Age'],
                        'Systolic BP': patient_data['Systolic_BP'],
                        'Diastolic': patient_data['Diastolic'],
                        'BS': patient_data['BS'],
                        'Body Temp': patient_data['Body_Temp'],
                        'BMI': patient_data['BMI'],
                        'Previous Complications': patient_data['Previous_Complications'],
                        'Preexisting Diabetes': patient_data['Preexisting_Diabetes'],
                        'Gestational Diabetes': patient_data['Gestational_Diabetes'],
                        'Mental Health': patient_data['Mental_Health'],
                        'Heart Rate': patient_data['Heart_Rate']
                    }])
                    
                    prediction = int(model.predict(input_df)[0])
                    new_risk_level = "HIGH" if prediction == 1 else "LOW"
                    new_risk_score = 0.85 if prediction == 1 else 0.15
                    
                    old_risk_level = pregnancy.get('risk_level')
                    
                    # Update if risk changed
                    if old_risk_level != new_risk_level:
                        update_item(
                            pregnancy_table,
                            {'id': pregnancy_id},
                            {
                                'risk_level': new_risk_level,
                                'risk_score': new_risk_score,
                                'risk_updated_at': get_current_timestamp(),
                                'risk_change_detected': True
                            }
                        )
                        
                        log_info(
                            "RISK LEVEL CHANGED - Alert triggered",
                            pregnancy_id=pregnancy_id,
                            old_risk=old_risk_level,
                            new_risk=new_risk_level
                        )
                        
                        # Trigger alert if risk increased to HIGH
                        if new_risk_level == "HIGH" and old_risk_level != "HIGH":
                            send_risk_alert(pregnancy_id, pregnancy, new_risk_level, new_risk_score)
                    else:
                        # Update score even if level didn't change
                        update_item(
                            pregnancy_table,
                            {'id': pregnancy_id},
                            {
                                'risk_score': new_risk_score,
                                'risk_updated_at': get_current_timestamp()
                            }
                        )
        
        log_info("Continuous risk monitoring completed")
        return {'statusCode': 200, 'body': 'Risk monitoring completed'}
        
    except Exception as e:
        log_error("Error in continuous risk monitoring", e)
        return {'statusCode': 500, 'body': str(e)}


def send_risk_alert(pregnancy_id: str, pregnancy: dict, risk_level: str, risk_score: float):
    """
    Send alert when risk level increases.
    This implements the "raises the alarm when it detects a pattern heading toward danger" feature.
    """
    try:
        # Get ASHA worker details
        asha_id = pregnancy.get('asha_worker_id')
        if not asha_id:
            return
        
        asha_table = TABLE_NAMES.get('ASHA_WORKERS')
        asha = get_item(asha_table, {'id': asha_id})
        
        if not asha:
            return
        
        # Send SNS notification
        sns_client = boto3.client('sns')
        
        message = f"""
RISK ALERT - MaatriSahayak

Patient: {pregnancy.get('patient_name', 'Unknown')}
Pregnancy ID: {pregnancy_id}
New Risk Level: {risk_level}
Risk Score: {risk_score:.2f}

The AI model has detected a pattern indicating increased risk.
Please review the patient's recent vitals and consider scheduling an immediate check-up.

ASHA Worker: {asha.get('name')}
District: {pregnancy.get('district')}
"""
        
        # Send to ASHA worker
        if asha.get('phone'):
            sns_client.publish(
                PhoneNumber=asha.get('phone'),
                Message=message
            )
        
        log_info("Risk alert sent", pregnancy_id=pregnancy_id, asha_id=asha_id)
        
    except Exception as e:
        log_error("Failed to send risk alert", e)
