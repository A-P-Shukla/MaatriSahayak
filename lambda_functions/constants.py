"""
MaatriSahayak - Constants

Application-wide constants and enumerations.
"""

# Risk Levels
RISK_LEVELS = {
    'LOW': {'min': 0, 'max': 30, 'color': '#4CAF50'},
    'MEDIUM': {'min': 31, 'max': 60, 'color': '#FFC107'},
    'HIGH': {'min': 61, 'max': 85, 'color': '#FF9900'},
    'CRITICAL': {'min': 86, 'max': 100, 'color': '#F44336'}
}

# Emergency Status
EMERGENCY_STATUS = {
    'INITIATED': 'Emergency initiated',
    'DISPATCHED': 'Ambulance dispatched',
    'IN_TRANSIT': 'Ambulance in transit',
    'ARRIVED': 'Ambulance arrived at patient location',
    'TRANSPORTING': 'Transporting patient to hospital',
    'COMPLETED': 'Emergency completed',
    'CANCELLED': 'Emergency cancelled'
}

# Ambulance Status
AMBULANCE_STATUS = {
    'AVAILABLE': 'Available for dispatch',
    'DISPATCHED': 'Dispatched to emergency',
    'BUSY': 'Currently occupied',
    'MAINTENANCE': 'Under maintenance',
    'OFFLINE': 'Offline'
}

# Hospital Types
HOSPITAL_TYPES = {
    'PHC': 'Primary Health Center',
    'CHC': 'Community Health Center',
    'DISTRICT': 'District Hospital',
    'MEDICAL_COLLEGE': 'Medical College Hospital'
}

# Pregnancy Status
PREGNANCY_STATUS = {
    'ACTIVE': 'Active pregnancy',
    'DELIVERED': 'Delivered',
    'TERMINATED': 'Terminated',
    'ARCHIVED': 'Archived'
}

# HTTP Status Codes
HTTP_STATUS = {
    'OK': 200,
    'CREATED': 201,
    'ACCEPTED': 202,
    'NO_CONTENT': 204,
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'CONFLICT': 409,
    'INTERNAL_ERROR': 500,
    'SERVICE_UNAVAILABLE': 503
}

# DynamoDB Table Names
import os

TABLE_NAMES = {
    'PREGNANCIES': os.getenv('PREGNANCIES_TABLE', 'maatrisahayak-pregnancies-dev'),
    'VITAL_SIGNS': os.getenv('VITAL_SIGNS_TABLE', 'maatrisahayak-vital-signs-dev'),
    'EMERGENCY_EVENTS': os.getenv('EMERGENCY_EVENTS_TABLE', 'maatrisahayak-emergency-events-dev'),
    'AMBULANCES': os.getenv('AMBULANCES_TABLE', 'maatrisahayak-ambulances-dev'),
    'HOSPITALS': os.getenv('HOSPITALS_TABLE', 'maatrisahayak-hospitals-dev')
}

# GSI Names
GSI_NAMES = {
    'ASHA_WORKER_INDEX': 'asha-worker-index',
    'DISTRICT_RISK_INDEX': 'district-risk-index',
    'DELIVERY_DATE_INDEX': 'delivery-date-index',
    'PREGNANCY_EVENTS_INDEX': 'pregnancy-events-index',
    'AMBULANCE_EVENTS_INDEX': 'ambulance-events-index',
    'STATUS_INDEX': 'status-index',
    'DISTRICT_STATUS_INDEX': 'district-status-index',
    'DISTRICT_TYPE_INDEX': 'district-type-index'
}

# Vital Signs Thresholds
VITAL_THRESHOLDS = {
    'BP_SYSTOLIC_HIGH': 140,
    'BP_SYSTOLIC_CRITICAL': 160,
    'BP_DIASTOLIC_HIGH': 90,
    'BP_DIASTOLIC_CRITICAL': 110,
    'HEART_RATE_LOW': 60,
    'HEART_RATE_HIGH': 100,
    'TEMPERATURE_LOW': 36.0,
    'TEMPERATURE_HIGH': 37.5,
    'TEMPERATURE_CRITICAL': 38.0,
    'OXYGEN_SATURATION_LOW': 95,
    'OXYGEN_SATURATION_CRITICAL': 90,
    'FETAL_HEART_RATE_LOW': 110,
    'FETAL_HEART_RATE_HIGH': 160
}

# Alert Types
ALERT_TYPES = {
    'HIGH_BP': 'High Blood Pressure',
    'LOW_BP': 'Low Blood Pressure',
    'HIGH_TEMP': 'High Temperature',
    'LOW_OXYGEN': 'Low Oxygen Saturation',
    'ABNORMAL_FETAL_HR': 'Abnormal Fetal Heart Rate',
    'SEVERE_BLEEDING': 'Severe Bleeding',
    'SEVERE_PAIN': 'Severe Pain',
    'PREECLAMPSIA': 'Preeclampsia Symptoms',
    'PREMATURE_LABOR': 'Premature Labor Signs'
}

# Event Types
EVENT_TYPES = {
    'SEVERE_BLEEDING': 'Severe bleeding',
    'HIGH_BP_EMERGENCY': 'High blood pressure emergency',
    'PREMATURE_LABOR': 'Premature labor',
    'SEVERE_PAIN': 'Severe abdominal pain',
    'FETAL_DISTRESS': 'Fetal distress',
    'WATER_BREAK': 'Water broke',
    'SEIZURE': 'Seizure',
    'UNCONSCIOUS': 'Patient unconscious',
    'OTHER': 'Other emergency'
}

# Severity Levels
SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

# Blood Types
BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']

# Equipment Types
EQUIPMENT_TYPES = [
    'OXYGEN',
    'DEFIBRILLATOR',
    'OBSTETRIC_KIT',
    'STRETCHER',
    'VENTILATOR',
    'SUCTION_DEVICE',
    'IV_EQUIPMENT',
    'MONITORING_EQUIPMENT'
]

# Specializations
SPECIALIZATIONS = [
    'MATERNITY',
    'NICU',
    'EMERGENCY',
    'SURGERY',
    'PEDIATRICS',
    'GYNECOLOGY',
    'ANESTHESIA'
]

# Age Limits
AGE_LIMITS = {
    'MIN_MATERNAL_AGE': 15,
    'MAX_MATERNAL_AGE': 50,
    'HIGH_RISK_AGE_LOW': 18,
    'HIGH_RISK_AGE_HIGH': 35
}

# Gestational Age Limits (in weeks)
GESTATIONAL_LIMITS = {
    'MIN_WEEKS': 1,
    'MAX_WEEKS': 42,
    'PRETERM_THRESHOLD': 37,
    'TERM_START': 37,
    'TERM_END': 42
}

# Response Time Targets (in seconds)
RESPONSE_TIME_TARGETS = {
    'CRITICAL': 1800,  # 30 minutes
    'HIGH': 2700,      # 45 minutes
    'MEDIUM': 3600,    # 60 minutes
    'LOW': 5400        # 90 minutes
}

# Pagination
PAGINATION = {
    'DEFAULT_PAGE_SIZE': 20,
    'MAX_PAGE_SIZE': 100
}

# Cache TTL (in seconds)
CACHE_TTL = {
    'SHORT': 300,      # 5 minutes
    'MEDIUM': 1800,    # 30 minutes
    'LONG': 3600       # 1 hour
}

# AWS Region
DEFAULT_REGION = 'ap-south-1'

# S3 Bucket Prefixes
S3_PREFIXES = {
    'ANC_CARDS': 'anc-cards/',
    'MEDICAL_DOCS': 'medical-documents/',
    'PROFILE_PHOTOS': 'profile-photos/',
    'BACKUPS': 'backups/'
}

# Date Formats
DATE_FORMATS = {
    'ISO': '%Y-%m-%dT%H:%M:%S.%fZ',
    'DATE_ONLY': '%Y-%m-%d',
    'TIME_ONLY': '%H:%M:%S',
    'DISPLAY': '%d %b %Y, %I:%M %p'
}

# Error Messages
ERROR_MESSAGES = {
    'VALIDATION_ERROR': 'Validation error: {}',
    'NOT_FOUND': 'Resource not found: {}',
    'UNAUTHORIZED': 'Unauthorized access',
    'DATABASE_ERROR': 'Database operation failed: {}',
    'SERVICE_ERROR': 'Service error: {}',
    'INVALID_INPUT': 'Invalid input: {}',
    'MISSING_FIELD': 'Missing required field: {}',
    'INVALID_FORMAT': 'Invalid format for field: {}'
}

# Success Messages
SUCCESS_MESSAGES = {
    'CREATED': '{} created successfully',
    'UPDATED': '{} updated successfully',
    'DELETED': '{} deleted successfully',
    'OPERATION_SUCCESS': 'Operation completed successfully'
}

# Lambda Function Names
LAMBDA_FUNCTIONS = {
    'REGISTER_PREGNANCY': 'maatrisahayak-register-pregnancy',
    'RECORD_VITALS': 'maatrisahayak-record-vitals',
    'ASSESS_RISK': 'maatrisahayak-assess-risk-v2',
    'ANALYZE_SYMPTOMS': 'maatrisahayak-analyze-symptoms',
    'TRIGGER_EMERGENCY': 'maatrisahayak-trigger-emergency',
    'FIND_AMBULANCE': 'maatrisahayak-find-nearest-ambulance',
    'SEND_NOTIFICATIONS': 'maatrisahayak-send-notifications'
}

# SNS Topics
SNS_TOPICS = {
    'EMERGENCY_ALERTS': 'maatrisahayak-emergency-alerts',
    'RISK_UPDATES': 'maatrisahayak-risk-updates',
    'SYSTEM_NOTIFICATIONS': 'maatrisahayak-system-notifications'
}

# Step Functions
STEP_FUNCTIONS = {
    'EMERGENCY_WORKFLOW': 'maatrisahayak-emergency-workflow'
}
