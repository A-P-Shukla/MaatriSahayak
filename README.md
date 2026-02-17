# MaatriSahayak - AI-Powered Maternal Emergency Response Platform

> Reducing maternal mortality in rural India by cutting emergency response times from 134 minutes to under 30 minutes using AWS AI services.

[![AWS](https://img.shields.io/badge/AWS-Powered-orange)](https://aws.amazon.com/)
[![Bedrock](https://img.shields.io/badge/Amazon-Bedrock-blue)](https://aws.amazon.com/bedrock/)
[![SageMaker](https://img.shields.io/badge/Amazon-SageMaker-green)](https://aws.amazon.com/sagemaker/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Problem Statement

In rural India:
- **93 maternal deaths per 100,000 live births**
- **134-minute average ambulance response time**
- **70%+ unfilled medical positions**
- **Thousands of preventable deaths annually**

## 💡 Our Solution

MaatriSahayak is an AI-powered platform that:
- ✅ Detects high-risk pregnancies early using ML
- ✅ Coordinates emergency response in real-time
- ✅ Reduces response time to < 30 minutes (77% faster)
- ✅ Saves 5000+ lives annually at scale
- ✅ Works offline in low-connectivity areas

## 🏗️ Architecture

```
Mobile App (ASHA Workers) ──┐
                            │
Web Dashboard (Officers) ───┼──> API Gateway / AppSync
                            │
Ambulance GPS (IoT) ────────┘
                            │
                            ↓
                    ┌───────────────┐
                    │  AWS Lambda   │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Bedrock │        │SageMaker│        │Textract │
   │ (LLM)   │        │  (ML)   │        │  (OCR)  │
   └─────────┘        └─────────┘        └─────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ↓
                    ┌───────────────┐
                    │   DynamoDB    │
                    │   S3 Storage  │
                    │  Timestream   │
                    └───────────────┘
```

## 🚀 Key Features

### For ASHA Workers (Mobile App)
- 📱 Offline-first pregnancy registration
- 🎤 Hindi voice input for data entry
- 📸 OCR for handwritten ANC cards
- 🚨 One-tap emergency alert
- 📊 AI-powered risk assessment
- 🗺️ Real-time ambulance tracking

### For District Officers (Web Dashboard)
- 📈 Live monitoring of all pregnancies
- 🚑 Real-time ambulance locations
- 📉 Analytics and response time trends
- 🎯 Resource allocation insights
- 📋 Exportable reports

### For Emergency Response
- ⚡ < 15 second workflow initiation
- 🔍 Automatic nearest ambulance dispatch
- 🏥 Hospital bed availability checking
- 📞 Multi-party notifications (SMS/Push/Voice)
- 🛰️ GPS tracking with ETA updates

## 🛠️ Technology Stack

### AWS Services
- **AI/ML**: Amazon Bedrock, SageMaker, Textract
- **Compute**: Lambda, Step Functions
- **Storage**: DynamoDB, S3, Timestream
- **IoT**: IoT Core, Location Service
- **API**: API Gateway, AppSync
- **Communication**: SNS, Amazon Connect
- **Security**: KMS, Cognito, IAM
- **DevOps**: CodePipeline, CloudWatch

### Application Stack
- **Mobile**: React Native (Android)
- **Web**: React.js + TypeScript
- **Backend**: Node.js / Python
- **Database**: DynamoDB + SQLite (offline)

## 📦 Project Structure

```
maatrisahayak/
├── docs/
│   ├── REQUIREMENTS.md          # Detailed requirements
│   ├── DESIGN.md                # Technical architecture
│   ├── PROJECT_OVERVIEW.md      # Complete guide
│   └── API_DOCUMENTATION.md     # API specs
├── mobile-app/
│   ├── src/
│   │   ├── screens/             # UI screens
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   ├── store/               # Redux store
│   │   └── utils/               # Utilities
│   └── package.json
├── backend/
│   ├── lambda/
│   │   ├── register-pregnancy/
│   │   ├── record-vitals/
│   │   ├── assess-risk/
│   │   ├── trigger-emergency/
│   │   └── ...
│   ├── step-functions/
│   │   └── emergency-workflow.json
│   └── infrastructure/
│       └── cdk/                 # AWS CDK code
├── web-dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── ml-models/
│   ├── risk-prediction/
│   │   ├── train.py
│   │   ├── model.py
│   │   └── deploy.py
│   └── data/
└── README.md
```

## 🚦 Quick Start

### Prerequisites
- AWS Account with free tier enabled
- Node.js 18+ and npm
- Python 3.11+
- Android Studio (for mobile development)
- AWS CLI configured

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/maatrisahayak.git
cd maatrisahayak
```

### 2. Deploy Backend Infrastructure
```bash
cd backend/infrastructure/cdk
npm install
cdk bootstrap
cdk deploy --all
```

### 3. Deploy Lambda Functions
```bash
cd backend/lambda
./deploy-all.sh
```

### 4. Train & Deploy ML Model
```bash
cd ml-models/risk-prediction
pip install -r requirements.txt
python train.py
python deploy.py
```

### 5. Run Mobile App
```bash
cd mobile-app
npm install
npx react-native run-android
```

### 6. Run Web Dashboard
```bash
cd web-dashboard
npm install
npm start
```

## 📊 Impact Metrics

### Target Outcomes
- **Response Time**: 134 min → < 30 min (77% reduction)
- **Lives Saved**: 5000+ annually at national scale
- **High-Risk Detection**: 90%+ sensitivity
- **System Uptime**: 99.9% availability
- **User Adoption**: 80%+ of ASHA workers

### Pilot Results (Projected)
- 50 Primary Health Centers
- 500 ASHA workers trained
- 2000+ pregnancies registered
- 100+ emergency responses
- < 30 min average response time

## 💰 Cost Analysis

### AWS Costs (1000 Active Pregnancies)
| Service | Monthly Cost |
|---------|--------------|
| Lambda | $50 |
| DynamoDB | $100 |
| Bedrock | $200 |
| SageMaker | $150 |
| IoT Core | $40 |
| Other | $240 |
| **Total** | **$780/month** |

**Cost per Emergency**: ~$15
**Cost per Life Saved**: ~$2000/year

## 🗺️ Roadmap

### Phase 1: MVP (Months 1-3) ✅
- Core mobile app features
- Backend APIs and database
- Basic AI risk assessment
- Emergency workflow
- Web dashboard

### Phase 2: Pilot (Months 4-6) 🚧
- Deploy in 1 district
- Train 500 ASHA workers
- Real-world testing
- Feedback and iteration

### Phase 3: Scale (Months 7-12) 📅
- Expand to 5 districts
- Multi-language support
- Advanced analytics
- iOS app

### Phase 4: National (Year 2+) 🎯
- 28 states, 700+ districts
- 100,000+ ASHA workers
- 5000+ lives saved annually

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution
- Mobile app features
- ML model improvements
- Documentation
- Testing
- Translations (regional languages)

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend Developer**: [Name]
- **Mobile Developer**: [Name]
- **ML Engineer**: [Name]
- **DevOps Engineer**: [Name]

## 📞 Contact

- **Email**: contact@maatrisahayak.org
- **Website**: https://maatrisahayak.org
- **Twitter**: @MaatriSahayak
- **LinkedIn**: [Company Page]

## 🙏 Acknowledgments

- National Health Mission, Government of India
- ASHA workers and ANMs in rural India
- AWS for providing cloud infrastructure
- Open-source community

## 📚 Documentation

- [Requirements Specification](REQUIREMENTS.md)
- [Technical Design](DESIGN.md)
- [Complete Project Overview](PROJECT_OVERVIEW.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [User Manual](docs/USER_MANUAL.md)

## 🏆 Awards & Recognition

- AWS AI Hackathon 2026 (Submission)
- [Add awards as received]

---

**MaatriSahayak** - Technology for Life. AI for Good.

*Saving mothers, one emergency at a time.* 💙
