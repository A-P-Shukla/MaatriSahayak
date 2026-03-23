. Register Hospital (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals

{
  "name": "District Hospital Varanasi",
  "type": "DISTRICT",
  "district": "Varanasi",
  "address": "Kabir Chaura, Varanasi, Uttar Pradesh 221001",
  "latitude": 25.3176,
  "longitude": 82.9739,
  "phone": "+915422501234",
  "total_beds": 200,
  "maternity_beds": 40,
  "nicu_beds": 10,
  "has_blood_bank": true,
  "has_operation_theater": true,
  "specializations": ["MATERNITY", "NICU", "EMERGENCY", "SURGERY"]
}

Copy
json
2. Register Hospital (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals

{
  "name": "Community Health Centre Lucknow",
  "type": "CHC",
  "district": "Lucknow",
  "address": "Gomti Nagar, Lucknow, Uttar Pradesh 226010",
  "latitude": 26.8467,
  "longitude": 80.9462,
  "phone": "+915222401234",
  "total_beds": 100,
  "maternity_beds": 20,
  "nicu_beds": 0,
  "has_blood_bank": true,
  "has_operation_theater": false,
  "specializations": ["MATERNITY", "GYNECOLOGY"]
}

Copy
json
3. Register Ambulance (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances

{
  "vehicle_number": "UP32AB1234",
  "district": "Varanasi",
  "latitude": 25.3176,
  "longitude": 82.9739,
  "driver_name": "Rajesh Kumar",
  "driver_phone": "+919876543210",
  "type": "ADVANCED",
  "equipment": ["OXYGEN", "DEFIBRILLATOR", "STRETCHER", "OBSTETRIC_KIT"],
  "status": "AVAILABLE"
}

Copy
json
4. Register Ambulance (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances

{
  "vehicle_number": "UP32CD5678",
  "district": "Lucknow",
  "latitude": 26.8467,
  "longitude": 80.9462,
  "driver_name": "Amit Singh",
  "driver_phone": "+919876543211",
  "type": "BASIC",
  "equipment": ["OXYGEN", "STRETCHER", "IV_EQUIPMENT"],
  "status": "AVAILABLE"
}

Copy
json
5. Register ASHA Worker (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/register

{
  "name": "Sunita Sharma",
  "phone": "+919876543201",
  "email": "sunita.sharma@maatrisahayak.in",
  "password": "Sunita@123",
  "age": 32,
  "district": "Varanasi",
  "block": "Rajpur",
  "village": "Rajpur Kalan",
  "qualification": "ANM",
  "experience_years": 5,
  "languages": ["Hindi", "Bhojpuri"]
}

Copy
json
6. Register ASHA Worker (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/register

{
  "name": "Meera Devi",
  "phone": "+919876543202",
  "email": "meera.devi@maatrisahayak.in",
  "password": "Meera@456",
  "age": 28,
  "district": "Lucknow",
  "block": "Gomti Nagar",
  "village": "Sultanpur",
  "qualification": "ANM",
  "experience_years": 3,
  "languages": ["Hindi", "Urdu"]
}

Copy
json
7. Login ASHA Worker (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/login

{
  "email": "sunita.sharma@maatrisahayak.in",
  "password": "Sunita@123"
}

Copy
json
8. Login ASHA Worker (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/login

{
  "email": "meera.devi@maatrisahayak.in",
  "password": "Meera@456"
}

Copy
json
9. Register Pregnancy (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies

{
  "patient_name": "Priya Sharma",
  "age": 26,
  "phone": "+919876501001",
  "district": "Varanasi",
  "block": "Rajpur",
  "village": "Rajpur Kalan",
  "latitude": 25.3150,
  "longitude": 82.9700,
  "lmp_date": "2024-08-01",
  "edd": "2025-05-08",
  "gestational_age_weeks": 12,
  "blood_type": "O+",
  "gravida": 2,
  "parity": 1,
  "previous_complications": [],
  "chronic_conditions": [],
  "asha_worker_id": "<asha_id_from_login>",
  "asha_worker_name": "Sunita Sharma",
  "asha_worker_phone": "+919876543201"
}


Copy
json
10. Register Pregnancy (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies

{
  "patient_name": "Anjali Verma",
  "age": 23,
  "phone": "+919876501002",
  "district": "Lucknow",
  "block": "Gomti Nagar",
  "village": "Sultanpur",
  "latitude": 26.8450,
  "longitude": 80.9450,
  "lmp_date": "2024-09-10",
  "edd": "2025-06-17",
  "gestational_age_weeks": 8,
  "blood_type": "B+",
  "gravida": 1,
  "parity": 0,
  "previous_complications": [],
  "chronic_conditions": [],
  "asha_worker_id": "<asha_id_from_login>",
  "asha_worker_name": "Meera Devi",
  "asha_worker_phone": "+919876543202"
}


Copy
json
11. Record Vitals (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/vitals

{
  "pregnancy_id": "<pregnancy_id>",
  "bp_systolic": 118,
  "bp_diastolic": 76,
  "heart_rate": 82,
  "temperature": 37.1,
  "oxygen_saturation": 98,
  "fetal_heart_rate": 145,
  "weight": 62.5,
  "symptoms": [],
  "notes": "Routine checkup, all normal",
  "recorded_by": "<asha_id>"
}

Copy
json
12. Record Vitals (Entry 2 - High BP Alert)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/vitals

{
  "pregnancy_id": "<pregnancy_id>",
  "bp_systolic": 148,
  "bp_diastolic": 95,
  "heart_rate": 92,
  "temperature": 37.8,
  "oxygen_saturation": 96,
  "fetal_heart_rate": 162,
  "weight": 58.0,
  "symptoms": ["severe headache", "swelling in feet"],
  "notes": "Patient complaining of headache and swelling",
  "recorded_by": "<asha_id>"
}

Copy
json
13. Record ANC Visit (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/anc/visits

{
  "pregnancy_id": "<pregnancy_id>",
  "visit_number": 1,
  "visit_date": "2025-01-15",
  "gestational_age_weeks": 12,
  "weight_kg": 62.5,
  "bp_systolic": 118,
  "bp_diastolic": 76,
  "hemoglobin": 11.2,
  "fundal_height_cm": 12.0,
  "fetal_heart_rate": 145,
  "fetal_movement": "Normal",
  "edema": "NONE",
  "complaints": [],
  "medications_prescribed": ["Iron tablets", "Folic acid"],
  "tests_ordered": ["CBC", "Urine routine"],
  "next_visit_date": "2025-02-15",
  "notes": "First ANC visit completed, all parameters normal",
  "recorded_by": "<asha_id>",
  "recorded_by_name": "Sunita Sharma"
}


Copy
json
14. Record ANC Visit (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/anc/visits

{
  "pregnancy_id": "<pregnancy_id>",
  "visit_number": 1,
  "visit_date": "2025-01-18",
  "gestational_age_weeks": 8,
  "weight_kg": 58.0,
  "bp_systolic": 115,
  "bp_diastolic": 74,
  "hemoglobin": 10.8,
  "fundal_height_cm": 8.0,
  "fetal_heart_rate": 142,
  "fetal_movement": "Normal",
  "edema": "NONE",
  "complaints": ["mild nausea"],
  "medications_prescribed": ["Iron tablets", "Folic acid", "Vitamin B6"],
  "tests_ordered": ["CBC", "Blood sugar", "Thyroid"],
  "next_visit_date": "2025-02-18",
  "notes": "First trimester, advised rest and nutrition",
  "recorded_by": "<asha_id>",
  "recorded_by_name": "Meera Devi"
}


Copy
json
15. Trigger Emergency (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency

{
  "pregnancy_id": "<pregnancy_id>",
  "event_type": "SEVERE_BLEEDING",
  "severity": "CRITICAL",
  "description": "Patient experiencing heavy vaginal bleeding with severe abdominal pain",
  "latitude": 25.3150,
  "longitude": 82.9700,
  "location_address": "House No. 45, Rajpur Kalan, Varanasi",
  "triggered_by": "<asha_id>"
}

Copy
json
16. Trigger Emergency (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency

{
  "pregnancy_id": "<pregnancy_id>",
  "event_type": "HIGH_BP_EMERGENCY",
  "severity": "HIGH",
  "description": "Patient BP 160/110, severe headache, blurred vision, possible preeclampsia",
  "latitude": 26.8450,
  "longitude": 80.9450,
  "location_address": "House No. 78, Sultanpur, Lucknow",
  "triggered_by": "<asha_id>"
}

Copy
json
17. Register Driver (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/register

{
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "email": "rajesh.kumar@maatrisahayak.in",
  "password": "Rajesh@123",
  "license_number": "UP3220210012345",
  "ambulance_id": "<ambulance_id>"
}

Copy
json
18. Register Driver (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/register

{
  "name": "Amit Singh",
  "phone": "+919876543211",
  "email": "amit.singh@maatrisahayak.in",
  "password": "Amit@4567",
  "license_number": "UP3220210054321",
  "ambulance_id": "<ambulance_id>"
}

Copy
json
19. Update Driver Status (Entry 1)
PUT https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/status

{
  "driver_id": "<driver_id>",
  "status": "AVAILABLE"
}

Copy
json
20. Update Driver Status (Entry 2)
PUT https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/status

{
  "driver_id": "<driver_id>",
  "status": "OFFLINE"
}

Copy
json
21. Accept Emergency (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/emergency/<emergency_id>/accept

{
  "driver_id": "<driver_id>",
  "current_location": {
    "latitude": 25.3200,
    "longitude": 82.9750
  },
  "estimated_arrival": 12
}

Copy
json
22. Accept Emergency (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/emergency/<emergency_id>/accept

{
  "driver_id": "<driver_id>",
  "current_location": {
    "latitude": 26.8500,
    "longitude": 80.9480
  },
  "estimated_arrival": 18
}

Copy
json
23. Complete Ride (Entry 1)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/ride/<emergency_id>/complete

{
  "driver_id": "<driver_id>",
  "hospital_id": "<hospital_id>",
  "hospital_name": "District Hospital Varanasi",
  "drop_location": {
    "latitude": 25.3176,
    "longitude": 82.9739
  },
  "notes": "Patient delivered safely, admitted to maternity ward"
}

Copy
json
24. Complete Ride (Entry 2)
POST https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/ride/<emergency_id>/complete

{
  "driver_id": "<driver_id>",
  "hospital_id": "<hospital_id>",
  "hospital_name": "Community Health Centre Lucknow",
  "drop_location": {
    "latitude": 26.8467,
    "longitude": 80.9462
  },
  "notes": "Patient stable, BP controlled, admitted to ICU"
}

Copy
json
✅ Testing Order: