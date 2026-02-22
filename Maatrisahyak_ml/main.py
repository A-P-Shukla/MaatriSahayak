from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np

# Initialize FastAPI
app = FastAPI(title="Maternal Health Risk Predictor")

# Load the model
try:
    with open("maatrisahyak.pkl", "rb") as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Define input data schema using Pydantic
class PatientData(BaseModel):
    Age: float
    Systolic_BP: float
    Diastolic: float
    BS: float
    Body_Temp: float
    BMI: float
    Previous_Complications: float
    Preexisting_Diabetes: float
    Gestational_Diabetes: float
    Mental_Health: float
    Heart_Rate: float

@app.get("/")
def read_root():
    return {"message": "Welcome to the Maternal Health Risk Predictor API!"}

@app.post("/predict")
def predict_risk(data: PatientData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
        
    try:
        # Convert input into the dataframe layout expected by the model
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
        
        # Predict using the model
        prediction = model.predict(input_data)[0]
        
        # We inverted it earlier: 0 is Low, 1 is High. Let's send back the literal as well depending on mapping
        # You can use the numbers or text. 
        risk_label = "High" if prediction == 1 else "Low"
        
        return {
            "prediction": int(prediction),
            "risk_level": risk_label
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

