"""
MaatriSahayak - Assess Risk Lambda Function via FastAPI & Mangum

AI-powered risk assessment using the pre-trained Random Forest model.
"""

import os
import pickle
import pandas as pd
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

