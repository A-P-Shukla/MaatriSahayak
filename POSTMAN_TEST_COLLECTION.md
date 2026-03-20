# MaatriSahayak API Testing Collection - Postman

**✅ CORRECT Base URL:** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev`

---

## 🔐 AUTHENTICATION APIs

### 1. Register ASHA Worker (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/register`

```json
{
  "phone_number": "+919876543201",
  "name": "Sunita Sharma",
  "email": "sunita.sharma@example.com",
  "password": "Asha@123",
  "village": "Rajpur",
  "district": "Varanasi",
  "state": "Uttar Pradesh"
}
```

### 2. Register ASHA Worker (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/register`

```json
{
  "phone_number": "+919876543202",
  "name": "Meera Devi",
  "email": "meera.devi@example.com",
  "password": "Asha@456",
  "village": "Sultanpur",
  "district": "Lucknow",
  "state": "Uttar Pradesh"
}
```

### 3. Login ASHA Worker (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/login`

```json
{
  "phone_number": "+919876543201",
  "password": "Asha@123"
}
```

**Save Response:** `access_token`, `id_token`, `refresh_token`, `asha_id`

### 4. Login ASHA Worker (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/login`

```json
{
  "phone_number": "+919876543202",
  "password": "Asha@456"
}
```

### 5. Refresh Token
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/auth/refresh`

```json
{
  "refresh_token": "<refresh_token_from_login>"
}
```

---

## 👤 ASHA PROFILE APIs

**Headers for all:** `Authorization: Bearer <access_token>`

### 6. Get ASHA Profile (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/{asha_id}`

### 7. Update ASHA Profile (Entry 1)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/{asha_id}`

```json
{
  "village": "Rajpur Kalan",
  "district": "Varanasi",
  "state": "Uttar Pradesh",
  "experience_years": 5
}
```

### 8. Update ASHA Profile (Entry 2)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/asha/{asha_id}`

```json
{
  "village": "Sultanpur",
  "district": "Lucknow",
  "state": "Uttar Pradesh",
  "experience_years": 3
}
```

---

## 🤰 PREGNANCY MANAGEMENT APIs

### 9. Register Pregnancy (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies`

```json
{
  "asha_id": "<asha_id>",
  "patient_name": "Priya Sharma",
  "patient_phone": "+919876501001",
  "patient_age": 26,
  "address": "House No. 45, Rajpur Village, Varanasi",
  "lmp_date": "2024-01-15",
  "edd": "2024-10-22",
  "blood_group": "O+",
  "previous_pregnancies": 1,
  "previous_complications": "None"
}
```

**Save Response:** `pregnancy_id`

### 10. Register Pregnancy (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies`

```json
{
  "asha_id": "<asha_id>",
  "patient_name": "Anjali Verma",
  "patient_phone": "+919876501002",
  "patient_age": 23,
  "address": "House No. 78, Sultanpur, Lucknow",
  "lmp_date": "2024-02-10",
  "edd": "2024-11-17",
  "blood_group": "B+",
  "previous_pregnancies": 0,
  "previous_complications": "None"
}
```

### 11. Get Pregnancy Details (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies/{pregnancy_id}`

### 12. List Pregnancies (ASHA 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies?asha_id={asha_id}`

### 13. Update Pregnancy (Entry 1)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies/{pregnancy_id}`

```json
{
  "risk_level": "MEDIUM",
  "current_status": "ACTIVE",
  "notes": "Patient showing signs of gestational diabetes"
}
```

---

## 🩺 ANC VISIT & VITALS APIs

### 14. Record ANC Visit (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/anc/visits`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "visit_number": 1,
  "visit_date": "2024-03-15",
  "weight": 62.5,
  "blood_pressure": "120/80",
  "hemoglobin": 11.2,
  "fundal_height": 12,
  "fetal_heart_rate": 145,
  "notes": "First trimester checkup completed",
  "next_visit_date": "2024-04-15"
}
```

### 15. Record ANC Visit (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/anc/visits`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "visit_number": 1,
  "visit_date": "2024-03-18",
  "weight": 58.0,
  "blood_pressure": "115/75",
  "hemoglobin": 10.8,
  "fundal_height": 10,
  "fetal_heart_rate": 142,
  "notes": "First ANC visit, advised iron supplements",
  "next_visit_date": "2024-04-18"
}
```

### 16. Get ANC History (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies/{pregnancy_id}/anc-history`

### 17. Record Vitals (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/vitals`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "blood_pressure": "125/82",
  "heart_rate": 78,
  "temperature": 98.4,
  "weight": 63.0,
  "notes": "Regular monitoring"
}
```

### 18. Record Vitals (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/vitals`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "blood_pressure": "118/76",
  "heart_rate": 75,
  "temperature": 98.2,
  "weight": 58.5,
  "notes": "Patient feeling well"
}
```

### 19. Get Vitals History (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies/{pregnancy_id}/vitals-history`

---

## 🔬 SYMPTOM ANALYSIS APIs

### 20. Analyze Symptoms (Entry 1 - High Risk)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/symptoms/analyze`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "symptoms": [
    "severe headache",
    "blurred vision",
    "swelling in hands and feet",
    "upper abdominal pain"
  ],
  "severity": "HIGH",
  "duration_hours": 6
}
```

### 21. Analyze Symptoms (Entry 2 - Medium Risk)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/symptoms/analyze`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "symptoms": [
    "mild nausea",
    "fatigue",
    "back pain"
  ],
  "severity": "MEDIUM",
  "duration_hours": 24
}
```

### 22. Process ANC Card (OCR) - Entry 1
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/anc-card/process`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "image_base64": "<base64_encoded_image>",
  "card_type": "MCP_CARD"
}
```

---

## 🏥 HOSPITAL MANAGEMENT APIs

### 23. Register Hospital (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals`

```json
{
  "name": "District Hospital Varanasi",
  "phone": "+915422501234",
  "email": "dhvaranasi@gov.in",
  "address": "Kabir Chaura, Varanasi, UP - 221001",
  "location": {
    "latitude": 25.3176,
    "longitude": 82.9739
  },
  "total_beds": 200,
  "available_beds": 45,
  "has_nicu": true,
  "has_blood_bank": true,
  "specialties": ["Obstetrics", "Gynecology", "Pediatrics", "Emergency"]
}
```

**Save Response:** `hospital_id`

### 24. Register Hospital (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals`

```json
{
  "name": "Community Health Centre Lucknow",
  "phone": "+915222401234",
  "email": "chclucknow@gov.in",
  "address": "Gomti Nagar, Lucknow, UP - 226010",
  "location": {
    "latitude": 26.8467,
    "longitude": 80.9462
  },
  "total_beds": 100,
  "available_beds": 25,
  "has_nicu": false,
  "has_blood_bank": true,
  "specialties": ["Obstetrics", "Gynecology", "General Medicine"]
}
```

### 25. List Hospitals
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals`

### 26. Check Hospital Capacity (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals/capacity?hospital_id={hospital_id}`

### 27. Update Hospital Capacity (Entry 1)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals/{hospital_id}/capacity`

```json
{
  "available_beds": 40,
  "available_icu_beds": 5,
  "available_nicu_beds": 3
}
```

### 28. Update Hospital Capacity (Entry 2)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/hospitals/{hospital_id}/capacity`

```json
{
  "available_beds": 20,
  "available_icu_beds": 2,
  "available_nicu_beds": 0
}
```

---

## 🚑 AMBULANCE MANAGEMENT APIs

### 29. Register Ambulance (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances`

```json
{
  "vehicle_number": "UP32AB1234",
  "vehicle_type": "ALS",
  "driver_name": "Rajesh Kumar",
  "driver_phone": "+919876543210",
  "current_location": {
    "latitude": 25.3176,
    "longitude": 82.9739
  },
  "base_hospital_id": "<hospital_id>",
  "equipment": ["Oxygen", "Defibrillator", "Stretcher", "First Aid Kit"]
}
```

**Save Response:** `ambulance_id`

### 30. Register Ambulance (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances`

```json
{
  "vehicle_number": "UP32CD5678",
  "vehicle_type": "BLS",
  "driver_name": "Amit Singh",
  "driver_phone": "+919876543211",
  "current_location": {
    "latitude": 26.8467,
    "longitude": 80.9462
  },
  "base_hospital_id": "<hospital_id>",
  "equipment": ["Oxygen", "Stretcher", "First Aid Kit"]
}
```

### 31. Get Ambulance Status (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/{ambulance_id}/status`

### 32. Update Ambulance Location (Entry 1)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/{ambulance_id}/location`

```json
{
  "latitude": 25.3200,
  "longitude": 82.9800,
  "speed": 45,
  "heading": 90
}
```

### 33. Update Ambulance Location (Entry 2)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/{ambulance_id}/location`

```json
{
  "latitude": 26.8500,
  "longitude": 80.9500,
  "speed": 50,
  "heading": 180
}
```

### 34. Find Nearest Ambulance (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/nearest`

```json
{
  "location": {
    "latitude": 25.3150,
    "longitude": 82.9700
  },
  "required_type": "ALS",
  "max_distance_km": 10
}
```

### 35. Find Nearest Ambulance (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/nearest`

```json
{
  "location": {
    "latitude": 26.8450,
    "longitude": 80.9450
  },
  "required_type": "BLS",
  "max_distance_km": 15
}
```

---

## 🚨 EMERGENCY MANAGEMENT APIs

### 36. Trigger Emergency (Entry 1 - High Risk)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "emergency_type": "SEVERE_BLEEDING",
  "symptoms": ["heavy bleeding", "severe abdominal pain", "dizziness"],
  "severity": "CRITICAL",
  "location": {
    "latitude": 25.3176,
    "longitude": 82.9739,
    "address": "House No. 45, Rajpur Village, Varanasi"
  },
  "patient_condition": "Patient is bleeding heavily, appears weak"
}
```

**Save Response:** `emergency_id`

### 37. Trigger Emergency (Entry 2 - Medium Risk)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency`

```json
{
  "pregnancy_id": "<pregnancy_id>",
  "asha_id": "<asha_id>",
  "emergency_type": "LABOR_COMPLICATIONS",
  "symptoms": ["contractions", "water broke", "back pain"],
  "severity": "HIGH",
  "location": {
    "latitude": 26.8467,
    "longitude": 80.9462,
    "address": "House No. 78, Sultanpur, Lucknow"
  },
  "patient_condition": "Labor started, contractions every 5 minutes"
}
```

### 38. Monitor Emergency (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency/{emergency_id}/status`

### 39. Get Ambulance Route (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/{ambulance_id}/route`

```json
{
  "origin": {
    "latitude": 25.3200,
    "longitude": 82.9750
  },
  "destination": {
    "latitude": 25.3176,
    "longitude": 82.9739
  }
}
```

### 40. Get Ambulance Route (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/ambulances/{ambulance_id}/route`

```json
{
  "origin": {
    "latitude": 26.8500,
    "longitude": 80.9480
  },
  "destination": {
    "latitude": 26.8467,
    "longitude": 80.9462
  }
}
```

### 41. Complete Emergency (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency/{emergency_id}/complete`

```json
{
  "outcome": "SUCCESSFUL",
  "hospital_id": "<hospital_id>",
  "arrival_time": "2024-03-19T10:45:00Z",
  "notes": "Patient admitted to ICU, condition stable"
}
```

### 42. Complete Emergency (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergency/{emergency_id}/complete`

```json
{
  "outcome": "SUCCESSFUL",
  "hospital_id": "<hospital_id>",
  "arrival_time": "2024-03-19T11:30:00Z",
  "notes": "Normal delivery, mother and baby healthy"
}
```

### 43. List Emergencies (ASHA 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/emergencies?asha_id={asha_id}`

### 44. Get Emergency History (Pregnancy 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies/{pregnancy_id}/emergencies`

---

## 🚗 DRIVER MANAGEMENT APIs

### 45. Register Driver (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/register`

```json
{
  "phone_number": "+919876543210",
  "name": "Rajesh Kumar",
  "email": "rajesh.kumar@example.com",
  "license_number": "DL-0420210012345",
  "license_expiry": "2028-12-31",
  "ambulance_id": "<ambulance_id>",
  "password": "Driver@123"
}
```

**Save Response:** `driver_id`

### 46. Register Driver (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/register`

```json
{
  "phone_number": "+919876543211",
  "name": "Amit Singh",
  "email": "amit.singh@example.com",
  "license_number": "DL-0720210054321",
  "license_expiry": "2027-06-30",
  "ambulance_id": "<ambulance_id>",
  "password": "Driver@456"
}
```

### 47. Get Driver Profile (Entry 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/{driver_id}`

**Headers:** `Authorization: Bearer <driver_access_token>`

### 48. Update Driver Status (Entry 1 - Available)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/status`

```json
{
  "driver_id": "<driver_id>",
  "status": "AVAILABLE"
}
```

### 49. Update Driver Status (Entry 2 - Available)
**PUT** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/status`

```json
{
  "driver_id": "<driver_id>",
  "status": "AVAILABLE"
}
```

### 50. Get Assigned Emergencies (Driver 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/emergencies?driver_id={driver_id}`

### 51. Accept Emergency (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/emergency/{emergency_id}/accept`

```json
{
  "driver_id": "<driver_id>",
  "current_location": {
    "latitude": 25.3200,
    "longitude": 82.9750
  },
  "estimated_arrival": 15
}
```

### 52. Accept Emergency (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/emergency/{emergency_id}/accept`

```json
{
  "driver_id": "<driver_id>",
  "current_location": {
    "latitude": 26.8500,
    "longitude": 80.9480
  },
  "estimated_arrival": 20
}
```

### 53. Complete Ride (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/ride/{emergency_id}/complete`

```json
{
  "driver_id": "<driver_id>",
  "hospital_id": "<hospital_id>",
  "hospital_name": "District Hospital Varanasi",
  "drop_location": {
    "latitude": 25.3176,
    "longitude": 82.9739
  },
  "notes": "Patient delivered safely to emergency ward"
}
```

### 54. Complete Ride (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/driver/ride/{emergency_id}/complete`

```json
{
  "driver_id": "<driver_id>",
  "hospital_id": "<hospital_id>",
  "hospital_name": "Community Health Centre Lucknow",
  "drop_location": {
    "latitude": 26.8467,
    "longitude": 80.9462
  },
  "notes": "Patient admitted to maternity ward"
}
```

---

## 📊 ANALYTICS & REPORTS APIs

### 55. Generate Analytics (ASHA 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/analytics?asha_id={asha_id}&start_date=2024-01-01&end_date=2024-03-31`

### 56. Get Risk Trends (Pregnancy 1)
**GET** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/pregnancies/{pregnancy_id}/risk-trends`

### 57. Export Reports (ASHA 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/reports/export`

```json
{
  "asha_id": "<asha_id>",
  "report_type": "MONTHLY_SUMMARY",
  "start_date": "2024-03-01",
  "end_date": "2024-03-31",
  "format": "PDF"
}
```

### 58. Export Reports (ASHA 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/reports/export`

```json
{
  "asha_id": "<asha_id>",
  "report_type": "EMERGENCY_LOG",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "format": "CSV"
}
```

---

## 📱 OFFLINE SYNC APIs

### 59. Sync Offline Data (Entry 1)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/sync`

```json
{
  "asha_id": "<asha_id>",
  "sync_data": [
    {
      "type": "VITALS",
      "pregnancy_id": "<pregnancy_id>",
      "data": {
        "blood_pressure": "120/80",
        "weight": 63.5,
        "recorded_at": "2024-03-18T14:30:00Z"
      }
    },
    {
      "type": "ANC_VISIT",
      "pregnancy_id": "<pregnancy_id>",
      "data": {
        "visit_number": 2,
        "visit_date": "2024-03-18",
        "notes": "Second trimester checkup"
      }
    }
  ]
}
```

### 60. Sync Offline Data (Entry 2)
**POST** `https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev/sync`

```json
{
  "asha_id": "<asha_id>",
  "sync_data": [
    {
      "type": "PREGNANCY_UPDATE",
      "pregnancy_id": "<pregnancy_id>",
      "data": {
        "current_status": "ACTIVE",
        "notes": "Patient progressing well"
      }
    }
  ]
}
```

---

## 📝 TESTING SEQUENCE

### Complete Flow Test (Recommended Order):

1. **Setup Phase** (1-8): Register & login ASHA workers
2. **Pregnancy Phase** (9-13): Register pregnancies
3. **Monitoring Phase** (14-22): Record ANC visits, vitals, symptoms
4. **Infrastructure Phase** (23-35): Register hospitals & ambulances
5. **Driver Phase** (45-49): Register drivers & update status
6. **Emergency Phase** (36-44): Trigger & manage emergencies
7. **Driver Response** (50-54): Accept & complete rides
8. **Analytics Phase** (55-58): Generate reports
9. **Sync** (59-60): Test offline sync

---

## 🔑 Important Notes:

1. **Save IDs**: After each POST request, save the returned IDs for subsequent requests
2. **Authentication**: Most endpoints require `Authorization: Bearer <token>` header
3. **Replace Placeholders**: Replace `{asha_id}`, `{pregnancy_id}`, `{hospital_id}`, etc. with actual values
4. **Test Order**: Follow the testing sequence for best results
5. **Error Handling**: Check response status codes (200, 400, 401, 500)

---

## 📊 Expected Success Responses:

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

---

**Total Test Cases: 60**
**Minimum Entries per Function: 2**
**Coverage: All Lambda Functions**
