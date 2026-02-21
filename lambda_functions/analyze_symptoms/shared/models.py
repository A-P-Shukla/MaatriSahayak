"""
MaatriSahayak - Data Models

Pydantic models for data validation and serialization.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator


class PregnancyModel(BaseModel):
    """Model for pregnancy data."""
    id: str
    patient_name: str
    age: int = Field(ge=15, le=50)
    phone: str
    district: str
    block: Optional[str] = None
    village: str
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    lmp_date: str
    edd: str
    gestational_age_weeks: Optional[int] = Field(None, ge=1, le=42)
    blood_type: str
    gravida: Optional[int] = Field(None, ge=1)
    parity: Optional[int] = Field(None, ge=0)
    previous_complications: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    risk_score: int = Field(default=0, ge=0, le=100)
    risk_level: str = Field(default='LOW')
    status: str = Field(default='ACTIVE')
    asha_worker_id: str
    asha_worker_name: Optional[str] = None
    asha_worker_phone: Optional[str] = None
    created_at: str
    updated_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "preg_123",
                "patient_name": "Patient Name",
                "age": 25,
                "phone": "+919876543210",
                "district": "Sitapur",
                "village": "Village Name",
                "lmp_date": "2024-01-01",
                "edd": "2024-10-08",
                "blood_type": "O+",
                "asha_worker_id": "asha_456",
                "created_at": "2024-01-15T10:00:00.000Z",
                "updated_at": "2024-01-15T10:00:00.000Z"
            }
        }


class VitalSignsModel(BaseModel):
    """Model for vital signs data."""
    id: str
    pregnancy_id: str
    bp_systolic: Optional[int] = Field(None, ge=60, le=250)
    bp_diastolic: Optional[int] = Field(None, ge=40, le=150)
    heart_rate: Optional[int] = Field(None, ge=40, le=200)
    temperature: Optional[float] = Field(None, ge=35.0, le=42.0)
    oxygen_saturation: Optional[int] = Field(None, ge=70, le=100)
    fetal_heart_rate: Optional[int] = Field(None, ge=80, le=200)
    weight: Optional[float] = Field(None, ge=30.0, le=200.0)
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None
    recorded_by: str
    recorded_at: str
    alerts: Optional[List[str]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "vital_123",
                "pregnancy_id": "preg_123",
                "bp_systolic": 120,
                "bp_diastolic": 80,
                "heart_rate": 75,
                "temperature": 37.0,
                "recorded_by": "asha_456",
                "recorded_at": "2024-01-15T10:00:00.000Z"
            }
        }


class EmergencyModel(BaseModel):
    """Model for emergency event data."""
    id: str
    pregnancy_id: str
    patient_name: str
    patient_phone: str
    event_type: str
    severity: str
    description: Optional[str] = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    location_address: Optional[str] = None
    status: str = Field(default='INITIATED')
    ambulance_id: Optional[str] = None
    hospital_id: Optional[str] = None
    estimated_arrival_time: Optional[str] = None
    actual_arrival_time: Optional[str] = None
    completion_time: Optional[str] = None
    response_time_seconds: Optional[int] = None
    triggered_by: str
    triggered_at: str
    updated_at: str
    timeline: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "emerg_123",
                "pregnancy_id": "preg_123",
                "patient_name": "Patient Name",
                "patient_phone": "+919876543210",
                "event_type": "SEVERE_BLEEDING",
                "severity": "CRITICAL",
                "latitude": 27.5706,
                "longitude": 80.2792,
                "status": "INITIATED",
                "triggered_by": "asha_456",
                "triggered_at": "2024-01-15T10:00:00.000Z",
                "updated_at": "2024-01-15T10:00:00.000Z"
            }
        }


class AmbulanceModel(BaseModel):
    """Model for ambulance data."""
    id: str
    vehicle_number: str
    district: str
    status: str = Field(default='AVAILABLE')
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    equipment: Optional[List[str]] = None
    current_emergency_id: Optional[str] = None
    last_updated: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "amb_123",
                "vehicle_number": "UP80AB1234",
                "district": "Sitapur",
                "status": "AVAILABLE",
                "latitude": 27.5706,
                "longitude": 80.2792,
                "driver_name": "Driver Name",
                "driver_phone": "+919876543210",
                "last_updated": "2024-01-15T10:00:00.000Z"
            }
        }


class HospitalModel(BaseModel):
    """Model for hospital data."""
    id: str
    name: str
    type: str
    district: str
    address: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    phone: str
    total_beds: int = Field(ge=0)
    available_beds: int = Field(ge=0)
    maternity_beds: int = Field(ge=0)
    available_maternity_beds: int = Field(ge=0)
    nicu_beds: int = Field(ge=0)
    available_nicu_beds: int = Field(ge=0)
    has_blood_bank: bool = Field(default=False)
    has_operation_theater: bool = Field(default=False)
    specializations: Optional[List[str]] = None
    last_updated: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "hosp_123",
                "name": "District Hospital",
                "type": "DISTRICT",
                "district": "Sitapur",
                "address": "Hospital Address",
                "latitude": 27.5706,
                "longitude": 80.2792,
                "phone": "+919876543210",
                "total_beds": 100,
                "available_beds": 20,
                "maternity_beds": 30,
                "available_maternity_beds": 5,
                "nicu_beds": 10,
                "available_nicu_beds": 2,
                "has_blood_bank": True,
                "has_operation_theater": True,
                "last_updated": "2024-01-15T10:00:00.000Z"
            }
        }


class RiskAssessmentModel(BaseModel):
    """Model for risk assessment result."""
    pregnancy_id: str
    risk_score: int = Field(ge=0, le=100)
    risk_level: str
    risk_factors: List[str]
    recommendations: List[str]
    assessed_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "pregnancy_id": "preg_123",
                "risk_score": 65,
                "risk_level": "HIGH",
                "risk_factors": ["High blood pressure", "Advanced maternal age"],
                "recommendations": ["Regular monitoring", "Specialist consultation"],
                "assessed_at": "2024-01-15T10:00:00.000Z"
            }
        }


class SymptomAnalysisModel(BaseModel):
    """Model for symptom analysis result."""
    pregnancy_id: str
    symptoms: List[str]
    analysis: str
    severity: str
    requires_emergency: bool
    recommendations: List[str]
    analyzed_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "pregnancy_id": "preg_123",
                "symptoms": ["Severe headache", "Blurred vision"],
                "analysis": "Possible preeclampsia symptoms detected",
                "severity": "HIGH",
                "requires_emergency": True,
                "recommendations": ["Immediate medical attention", "Blood pressure check"],
                "analyzed_at": "2024-01-15T10:00:00.000Z"
            }
        }


class NotificationModel(BaseModel):
    """Model for notification data."""
    recipient_phone: str
    message: str
    notification_type: str
    priority: str = Field(default='NORMAL')
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "recipient_phone": "+919876543210",
                "message": "Emergency alert: Ambulance dispatched",
                "notification_type": "EMERGENCY_ALERT",
                "priority": "HIGH"
            }
        }


class RouteModel(BaseModel):
    """Model for ambulance route data."""
    origin_lat: float = Field(ge=-90, le=90)
    origin_lon: float = Field(ge=-180, le=180)
    destination_lat: float = Field(ge=-90, le=90)
    destination_lon: float = Field(ge=-180, le=180)
    distance_km: float
    estimated_time_minutes: int
    route_points: Optional[List[Dict[str, float]]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "origin_lat": 27.5706,
                "origin_lon": 80.2792,
                "destination_lat": 27.5800,
                "destination_lon": 80.2900,
                "distance_km": 5.2,
                "estimated_time_minutes": 15
            }
        }
