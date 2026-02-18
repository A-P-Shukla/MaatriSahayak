# MaatriSahayak - Project Structure Summary

## ✅ Complete Folder Structure Initialized

All files and folders have been created and are ready for implementation.

---

## 📁 Directory Structure Overview

```
maatrisahayak/
├── 📂 frontend/                  # React + TypeScript Web Dashboard
│   ├── 📂 public/
│   │   └── vite.svg
│   ├── 📂 src/
│   │   ├── 📂 assets/           # Images, fonts, static files
│   │   │   └── .gitkeep
│   │   ├── 📂 components/       # Reusable React components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── 📂 hooks/            # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useEmergencies.ts
│   │   │   ├── usePregnancies.ts
│   │   │   └── useWebSocket.ts
│   │   ├── 📂 pages/            # Page components
│   │   │   ├── Analytics.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmergencyAlerts.tsx
│   │   │   ├── LiveTracking.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── PregnancyDetails.tsx
│   │   │   └── PregnanciesList.tsx
│   │   ├── 📂 services/         # API service layer
│   │   │   ├── ambulance.ts
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── emergency.ts
│   │   │   └── pregnancy.ts
│   │   ├── 📂 types/            # TypeScript type definitions
│   │   │   ├── ambulance.ts
│   │   │   ├── emergency.ts
│   │   │   ├── index.ts
│   │   │   ├── pregnancy.ts
│   │   │   └── user.ts
│   │   ├── 📂 utils/            # Utility functions
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── 📂 lambda_functions/          # 13 Lambda functions + shared layer
│   ├── 📂 shared/                # Shared utilities (Lambda Layer)
│   │   ├── __init__.py
│   │   ├── constants.py
│   │   ├── db_helper.py
│   │   ├── exceptions.py
│   │   ├── models.py
│   │   ├── requirements.txt
│   │   ├── utils.py
│   │   └── validators.py
│   │
│   ├── 📂 register_pregnancy/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 record_vitals/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 assess_risk/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 analyze_symptoms/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 trigger_emergency/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 find_nearest_ambulance/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 send_notifications/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 update_ambulance_location/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 get_ambulance_route/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 process_anc_card/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 get_pregnancy_details/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── 📂 list_pregnancies/
│   │   ├── handler.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   └── 📂 check_hospital_capacity/
│       ├── handler.py
│       ├── requirements.txt
│       └── README.md
│
├── 📂 infrastructure/            # AWS Infrastructure as Code
│   ├── template.yaml            # SAM template
│   ├── samconfig.toml           # SAM configuration
│   ├── parameters.json          # CloudFormation parameters
│   └── deploy.sh                # Deployment script
│
├── 📂 step_functions/           # Step Functions workflows
│   ├── emergency_workflow.json  # Emergency coordination workflow
│   └── README.md
│
├── 📂 tests/                    # Unit and integration tests
│   ├── __init__.py
│   ├── 📂 unit/
│   │   ├── test_register_pregnancy.py
│   │   ├── test_record_vitals.py
│   │   ├── test_assess_risk.py
│   │   ├── test_analyze_symptoms.py
│   │   └── test_trigger_emergency.py
│   ├── 📂 integration/
│   │   ├── test_emergency_flow.py
│   │   └── test_api_endpoints.py
│   └── 📂 fixtures/
│       ├── sample_pregnancy.json
│       └── sample_vitals.json
│
├── 📂 scripts/                  # Utility scripts
│   ├── setup_dynamodb.py       # Create DynamoDB tables
│   ├── seed_data.py            # Populate test data
│   ├── deploy_all.sh           # Deploy all functions
│   └── test_local.py           # Local testing script
│
├── 📂 docs/                     # Documentation
│   ├── 📂 api/
│   │   └── openapi.yaml        # API specification
│   ├── 📂 architecture/
│   │   └── 📂 diagrams/        # Architecture diagrams
│   └── 📂 deployment/
│       └── DEPLOYMENT_GUIDE.md # Deployment guide
│
├── 📂 .github/                  # GitHub Actions CI/CD
│   └── 📂 workflows/
│       ├── deploy.yml          # Deployment workflow
│       └── test.yml            # Testing workflow
│
├── 📂 database/                 # Sample data
│   ├── ambulance.json
│   ├── emergency.json
│   ├── hospital.json
│   ├── pregnancy.json
│   └── vitalsigns.json
│
├── .gitignore
├── Makefile
├── requirements-dev.txt
├── README.md
├── REQUIREMENTS.md
├── DESIGN.md
├── PROJECT_OVERVIEW.md
├── IMPLEMENTATION_ROADMAP.md
├── WINNING_STRATEGY.md
├── QUICK_CHECKLIST.md
└── LAMBDA_FUNCTIONS_STRUCTURE.md
```

---

## 📊 File Count Summary

### Frontend (React + TypeScript)
- **43 files:** Components, pages, services, hooks, types, utils, config
  - 5 Components (Header, Sidebar, Footer, Loading, ErrorBoundary)
  - 7 Pages (Dashboard, Login, PregnanciesList, PregnancyDetails, LiveTracking, EmergencyAlerts, Analytics)
  - 4 Hooks (useAuth, usePregnancies, useEmergencies, useWebSocket)
  - 5 Services (api, auth, pregnancy, emergency, ambulance)
  - 5 Types (index, user, pregnancy, emergency, ambulance)
  - 3 Utils (constants, helpers, validators)
  - 14 Config/Setup files (package.json, tsconfig.json, vite.config.ts, etc.)

### Lambda Functions
- **13 Lambda Functions** (each with 3 files: handler.py, requirements.txt, README.md)
- **1 Shared Layer** (8 files: utilities, models, validators, etc.)
- **Total Lambda Files:** 47 files

### Infrastructure
- **4 files:** SAM template, config, parameters, deploy script

### Tests
- **9 files:** 5 unit tests, 2 integration tests, 2 fixtures

### Scripts
- **4 files:** Setup, seed, deploy, test scripts

### Documentation
- **10 files:** API spec, deployment guide, project docs

### CI/CD
- **2 files:** GitHub Actions workflows

### Database
- **5 files:** Sample JSON data

### Configuration
- **4 files:** .gitignore, Makefile, requirements-dev.txt, lifecycle.json

---

## 📋 Total Files Created

**Grand Total: 128 files** across the entire project structure
- **Frontend:** 43 files
- **Backend (Lambda):** 47 files
- **Infrastructure:** 4 files
- **Tests:** 9 files
- **Scripts:** 4 files
- **Documentation:** 10 files
- **CI/CD:** 2 files
- **Database:** 5 files
- **Configuration:** 4 files

---

## 🎯 Next Steps - Implementation Priority

### Week 1: Core Backend (Priority 1)

#### Day 1-2: Shared Layer
1. ✅ `lambda_functions/shared/constants.py` - Define constants and enums
2. ✅ `lambda_functions/shared/exceptions.py` - Custom exception classes
3. ✅ `lambda_functions/shared/utils.py` - Common utility functions
4. ✅ `lambda_functions/shared/db_helper.py` - DynamoDB operations
5. ✅ `lambda_functions/shared/validators.py` - Input validation
6. ✅ `lambda_functions/shared/models.py` - Pydantic data models
7. ✅ `lambda_functions/shared/requirements.txt` - Dependencies

#### Day 3-4: Core Lambda Functions
1. ✅ `lambda_functions/register_pregnancy/handler.py`
2. ✅ `lambda_functions/record_vitals/handler.py`
3. ✅ `lambda_functions/trigger_emergency/handler.py`

#### Day 5: AI Integration
1. ✅ `lambda_functions/assess_risk/handler.py` (SageMaker)
2. ✅ `lambda_functions/analyze_symptoms/handler.py` (Bedrock)

#### Day 6-7: Emergency Workflow
1. ✅ `lambda_functions/find_nearest_ambulance/handler.py`
2. ✅ `lambda_functions/send_notifications/handler.py`
3. ✅ `step_functions/emergency_workflow.json`

### Week 2: Supporting Functions & Frontend

#### Day 8-9: Query & Data Functions
1. ✅ `lambda_functions/get_pregnancy_details/handler.py`
2. ✅ `lambda_functions/list_pregnancies/handler.py`
3. ✅ `lambda_functions/check_hospital_capacity/handler.py`
4. ✅ `lambda_functions/process_anc_card/handler.py` (Textract)

#### Day 10-11: IoT & Tracking
1. ✅ `lambda_functions/update_ambulance_location/handler.py`
2. ✅ `lambda_functions/get_ambulance_route/handler.py`

#### Day 12-14: Frontend Development
1. ✅ `frontend/src/services/*.ts` - API service layer
2. ✅ `frontend/src/types/*.ts` - TypeScript types
3. ✅ `frontend/src/components/*.tsx` - Reusable components
4. ✅ `frontend/src/pages/*.tsx` - Page components
5. ✅ `frontend/src/hooks/*.ts` - Custom hooks
6. ✅ `frontend/package.json` - Dependencies setup

### Week 3: Integration, Testing & Deployment

#### Day 15-17: Infrastructure & Testing
1. ✅ `infrastructure/template.yaml` - Complete SAM template
2. ✅ `tests/unit/*.py` - Unit tests for all functions
3. ✅ `tests/integration/*.py` - Integration tests
4. ✅ `scripts/setup_dynamodb.py` - DynamoDB setup script
5. ✅ `scripts/seed_data.py` - Test data seeding

#### Day 18-21: Documentation & Deployment
1. ✅ `docs/api/openapi.yaml` - Complete API specification
2. ✅ `docs/deployment/DEPLOYMENT_GUIDE.md` - Step-by-step guide
3. ✅ Update all function README.md files
4. ✅ `.github/workflows/test.yml` - Automated testing
5. ✅ `.github/workflows/deploy.yml` - Automated deployment
6. ✅ `Makefile` - Common commands
7. ✅ Deploy to AWS

---

## 🚀 Quick Start Commands

Once implementation begins, you can use these commands:

### Backend (Lambda Functions)
```bash
# Install dependencies
make install

# Run tests
make test

# Deploy to AWS
make deploy

# Clean build artifacts
make clean

# Setup DynamoDB tables
python scripts/setup_dynamodb.py

# Seed test data
python scripts/seed_data.py

# Test locally
python scripts/test_local.py
```

### Frontend (React + TypeScript)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npm run type-check
```

---

## 📝 File Status Legend

- ✅ **Created** - File exists but is empty (ready for implementation)
- 🔄 **In Progress** - Currently being implemented
- ✔️ **Complete** - Implementation finished
- 🧪 **Testing** - Under testing
- 🚀 **Deployed** - Deployed to AWS

---

## 🎯 Implementation Checklist

### Frontend (43 files)
#### Components (5 files)
- [ ] Header.tsx
- [ ] Sidebar.tsx
- [ ] Footer.tsx
- [ ] Loading.tsx
- [ ] ErrorBoundary.tsx

#### Pages (7 files)
- [ ] Login.tsx
- [ ] Dashboard.tsx
- [ ] PregnanciesList.tsx
- [ ] PregnancyDetails.tsx
- [ ] LiveTracking.tsx
- [ ] EmergencyAlerts.tsx
- [ ] Analytics.tsx

#### Services (5 files)
- [ ] api.ts
- [ ] auth.ts
- [ ] pregnancy.ts
- [ ] emergency.ts
- [ ] ambulance.ts

#### Hooks (4 files)
- [ ] useAuth.ts
- [ ] usePregnancies.ts
- [ ] useEmergencies.ts
- [ ] useWebSocket.ts

#### Types (5 files)
- [ ] index.ts
- [ ] user.ts
- [ ] pregnancy.ts
- [ ] emergency.ts
- [ ] ambulance.ts

#### Utils (3 files)
- [ ] constants.ts
- [ ] helpers.ts
- [ ] validators.ts

#### Configuration (14 files)
- [ ] package.json
- [ ] tsconfig.json
- [ ] vite.config.ts
- [ ] index.html
- [ ] .env.example
- [ ] .gitignore
- [ ] README.md
- [ ] App.tsx
- [ ] App.css
- [ ] main.tsx
- [ ] index.css
- [ ] vite-env.d.ts
- [ ] public/vite.svg
- [ ] src/assets/.gitkeep

### Shared Layer (8 files)
- [ ] constants.py
- [ ] exceptions.py
- [ ] utils.py
- [ ] db_helper.py
- [ ] validators.py
- [ ] models.py
- [ ] requirements.txt
- [ ] __init__.py

### Lambda Functions (13 functions × 3 files = 39 files)
- [ ] register_pregnancy (handler.py, requirements.txt, README.md)
- [ ] record_vitals (handler.py, requirements.txt, README.md)
- [ ] assess_risk (handler.py, requirements.txt, README.md)
- [ ] analyze_symptoms (handler.py, requirements.txt, README.md)
- [ ] trigger_emergency (handler.py, requirements.txt, README.md)
- [ ] find_nearest_ambulance (handler.py, requirements.txt, README.md)
- [ ] send_notifications (handler.py, requirements.txt, README.md)
- [ ] update_ambulance_location (handler.py, requirements.txt, README.md)
- [ ] get_ambulance_route (handler.py, requirements.txt, README.md)
- [ ] process_anc_card (handler.py, requirements.txt, README.md)
- [ ] get_pregnancy_details (handler.py, requirements.txt, README.md)
- [ ] list_pregnancies (handler.py, requirements.txt, README.md)
- [ ] check_hospital_capacity (handler.py, requirements.txt, README.md)

### Infrastructure (4 files)
- [ ] template.yaml
- [ ] samconfig.toml
- [ ] parameters.json
- [ ] deploy.sh

### Step Functions (2 files)
- [ ] emergency_workflow.json
- [ ] README.md

### Tests (9 files)
- [ ] Unit tests (5 files)
- [ ] Integration tests (2 files)
- [ ] Fixtures (2 files)

### Scripts (4 files)
- [ ] setup_dynamodb.py
- [ ] seed_data.py
- [ ] deploy_all.sh
- [ ] test_local.py

### Documentation (3 files)
- [ ] openapi.yaml
- [ ] DEPLOYMENT_GUIDE.md
- [ ] Architecture diagrams

### CI/CD (2 files)
- [ ] deploy.yml
- [ ] test.yml

### Configuration (4 files)
- [ ] Makefile
- [ ] requirements-dev.txt
- [ ] .gitignore (already exists)
- [ ] lifecycle.json (already exists)

---

## 🎉 Status

**All 128 files have been initialized and are ready for implementation!**

The complete project structure is now in place, including:
- ✅ **Frontend:** React + TypeScript web dashboard (43 files)
- ✅ **Backend:** 13 Lambda functions + shared layer (47 files)
- ✅ **Infrastructure:** SAM templates and deployment scripts (4 files)
- ✅ **Tests:** Unit and integration tests (9 files)
- ✅ **Scripts:** Setup and utility scripts (4 files)
- ✅ **Documentation:** API specs and guides (10 files)
- ✅ **CI/CD:** GitHub Actions workflows (2 files)
- ✅ **Database:** Sample data (5 files)
- ✅ **Configuration:** Project config files (4 files)

You can start implementing the functions following the priority order outlined in the IMPLEMENTATION_ROADMAP.md.

---

**Next Action:** Start implementing the shared layer utilities, then move on to the core Lambda functions.

Good luck with the implementation! 🚀
