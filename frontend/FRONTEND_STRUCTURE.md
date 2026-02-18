# MaatriSahayak - Frontend Structure (React + TypeScript)

## 📁 Complete Frontend Structure

```
frontend/
├── public/
│   └── vite.svg                 # Vite logo
│
├── src/
│   ├── assets/                  # Static assets (images, fonts, etc.)
│   │   └── .gitkeep
│   │
│   ├── components/              # Reusable React components
│   │   ├── ErrorBoundary.tsx   # Error boundary wrapper
│   │   ├── Footer.tsx          # Footer component
│   │   ├── Header.tsx          # Header with navigation
│   │   ├── Loading.tsx         # Loading spinner
│   │   └── Sidebar.tsx         # Sidebar navigation
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useEmergencies.ts   # Emergency data hook
│   │   ├── usePregnancies.ts   # Pregnancy data hook
│   │   └── useWebSocket.ts     # WebSocket connection hook
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Analytics.tsx       # Analytics dashboard
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── EmergencyAlerts.tsx # Emergency alerts page
│   │   ├── LiveTracking.tsx    # Live ambulance tracking
│   │   ├── Login.tsx           # Login page
│   │   ├── PregnancyDetails.tsx # Single pregnancy details
│   │   └── PregnanciesList.tsx # List of all pregnancies
│   │
│   ├── services/                # API service layer
│   │   ├── ambulance.ts        # Ambulance API calls
│   │   ├── api.ts              # Base API configuration
│   │   ├── auth.ts             # Authentication API
│   │   ├── emergency.ts        # Emergency API calls
│   │   └── pregnancy.ts        # Pregnancy API calls
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── ambulance.ts        # Ambulance types
│   │   ├── emergency.ts        # Emergency types
│   │   ├── index.ts            # Barrel exports
│   │   ├── pregnancy.ts        # Pregnancy types
│   │   └── user.ts             # User types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.ts        # App constants
│   │   ├── helpers.ts          # Helper functions
│   │   └── validators.ts       # Validation functions
│   │
│   ├── App.css                  # App-level styles
│   ├── App.tsx                  # Main App component
│   ├── index.css                # Global styles
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite type definitions
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── README.md                    # Frontend documentation
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

---

## 📦 Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Routing
- **React Router v6** - Client-side routing

### State Management
- **React Query (TanStack Query)** - Server state management
- **Zustand** or **Context API** - Client state management

### UI Components
- **Material-UI (MUI)** or **Ant Design** - Component library
- **Tailwind CSS** (optional) - Utility-first CSS

### Maps & Charts
- **Mapbox GL JS** or **Google Maps** - Map visualization
- **Recharts** or **Apache ECharts** - Data visualization

### Real-time
- **AWS AppSync** - GraphQL subscriptions
- **WebSocket** - Real-time updates

### HTTP Client
- **Axios** - HTTP requests

### Forms
- **React Hook Form** - Form management
- **Zod** - Schema validation

---

## 📋 File Descriptions

### Components (5 files)

#### `Header.tsx`
- Top navigation bar
- User profile dropdown
- Notifications bell
- Emergency alert indicator

#### `Sidebar.tsx`
- Left navigation menu
- Dashboard, Pregnancies, Live Tracking, Analytics links
- Collapsible on mobile

#### `Footer.tsx`
- Copyright information
- Links to documentation
- Version information

#### `Loading.tsx`
- Reusable loading spinner
- Used across the app for async operations

#### `ErrorBoundary.tsx`
- Catches React errors
- Displays fallback UI
- Logs errors for debugging

---

### Pages (7 files)

#### `Login.tsx`
- District officer login
- Cognito authentication
- Form validation
- Redirect to dashboard on success

#### `Dashboard.tsx`
- Overview KPIs (total pregnancies, high-risk count, emergencies today)
- Recent emergencies list
- Quick stats cards
- Real-time updates

#### `PregnanciesList.tsx`
- Table of all pregnancies
- Filters (risk level, district, ASHA worker)
- Search functionality
- Pagination
- Click to view details

#### `PregnancyDetails.tsx`
- Patient information
- Vitals history (line chart)
- Risk score trend
- Emergency history
- Action buttons (trigger emergency)

#### `LiveTracking.tsx`
- Map with ambulance locations
- High-risk pregnancy markers
- Hospital markers
- Real-time position updates
- Click markers for details

#### `EmergencyAlerts.tsx`
- List of active emergencies
- Emergency status (initiated, dispatched, in transit, arrived)
- ETA countdown
- Ambulance tracking link

#### `Analytics.tsx`
- Response time chart (line chart)
- Risk distribution (pie chart)
- Emergencies by district (bar chart)
- Outcome metrics
- Date range filters

---

### Services (5 files)

#### `api.ts`
- Axios instance configuration
- Base URL setup
- Request/response interceptors
- Error handling
- Authentication token injection

#### `auth.ts`
- Login function
- Logout function
- Token refresh
- Get current user
- Cognito integration

#### `pregnancy.ts`
- Get all pregnancies
- Get pregnancy by ID
- Register new pregnancy
- Update pregnancy
- Get vitals history

#### `emergency.ts`
- Trigger emergency
- Get active emergencies
- Get emergency by ID
- Update emergency status
- Get emergency history

#### `ambulance.ts`
- Get all ambulances
- Get ambulance by ID
- Get ambulance location
- Get ambulance route
- Update ambulance status

---

### Hooks (4 files)

#### `useAuth.ts`
- Authentication state
- Login/logout functions
- User information
- Token management
- Protected route logic

#### `usePregnancies.ts`
- Fetch pregnancies list
- Fetch single pregnancy
- Create/update pregnancy
- Loading and error states
- React Query integration

#### `useEmergencies.ts`
- Fetch active emergencies
- Fetch emergency history
- Trigger emergency
- Real-time updates
- Loading and error states

#### `useWebSocket.ts`
- WebSocket connection management
- Subscribe to events
- Handle reconnection
- Message parsing
- Connection status

---

### Types (5 files)

#### `index.ts`
- Barrel exports for all types
- Re-exports from other type files

#### `user.ts`
```typescript
export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'DISTRICT_OFFICER' | 'ANM' | 'ADMIN';
  district: string;
}
```

#### `pregnancy.ts`
```typescript
export interface Pregnancy {
  pregnancyId: string;
  patientName: string;
  age: number;
  bloodType: string;
  gestationalAge: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  ashaWorkerId: string;
  village: string;
  district: string;
  lastUpdated: number;
}

export interface VitalSigns {
  vitalSignId: string;
  pregnancyId: string;
  timestamp: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  weight: number;
}
```

#### `emergency.ts`
```typescript
export interface Emergency {
  eventId: string;
  pregnancyId: string;
  timestamp: number;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'INITIATED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';
  ambulanceId: string;
  hospitalId: string;
  estimatedArrivalTime: number;
}
```

#### `ambulance.ts`
```typescript
export interface Ambulance {
  ambulanceId: string;
  vehicleNumber: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'BUSY' | 'MAINTENANCE';
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  driverName: string;
  driverPhone: string;
  equipment: string[];
}
```

---

### Utils (3 files)

#### `constants.ts`
- API endpoints
- App configuration
- Risk level colors
- Status colors
- Map configuration

#### `helpers.ts`
- Date formatting
- Distance calculation
- Time ago formatting
- Risk level badge color
- Status badge color

#### `validators.ts`
- Form validation rules
- Input sanitization
- Data validation functions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- AWS account with API Gateway endpoint

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API endpoint
# VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
```

### Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Dependencies to Install

### Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "@mui/material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "mapbox-gl": "^3.0.0",
    "react-map-gl": "^7.1.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

---

## 🎨 UI/UX Guidelines

### Color Scheme
- **Primary:** AWS Orange (#FF9900)
- **Secondary:** Healthcare Blue (#0073BB)
- **Success:** Green (#4CAF50)
- **Warning:** Yellow (#FFC107)
- **Error:** Red (#F44336)
- **Critical:** Dark Red (#D32F2F)

### Risk Level Colors
- **LOW:** Green (#4CAF50)
- **MEDIUM:** Yellow (#FFC107)
- **HIGH:** Orange (#FF9900)
- **CRITICAL:** Red (#F44336)

### Typography
- **Font Family:** Roboto, sans-serif
- **Headings:** Bold, 24-32px
- **Body:** Regular, 14-16px
- **Small:** 12px

---

## 🔐 Authentication Flow

1. User enters credentials on Login page
2. Call `auth.login()` service
3. Cognito validates credentials
4. Receive JWT token
5. Store token in localStorage
6. Redirect to Dashboard
7. Token injected in all API requests via interceptor
8. Token refresh on expiry

---

## 🌐 API Integration

### Base Configuration
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📊 State Management Strategy

### Server State (React Query)
- Pregnancies list
- Emergency events
- Ambulance locations
- Hospital data
- Analytics data

### Client State (Zustand/Context)
- Authentication state
- UI state (sidebar open/closed)
- Selected filters
- Map viewport

---

## 🗺️ Map Integration

### Mapbox GL JS
```typescript
import Map, { Marker, Popup } from 'react-map-gl';

// Display ambulances, pregnancies, hospitals on map
// Real-time position updates via WebSocket
// Click markers for details
```

---

## 📈 Charts Integration

### Recharts
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Response time trends
// Risk score over time
// Vitals history
```

---

## 🔄 Real-time Updates

### WebSocket Connection
```typescript
// Connect to AWS AppSync or WebSocket endpoint
// Subscribe to emergency events
// Subscribe to ambulance location updates
// Update UI in real-time
```

---

## 🧪 Testing Strategy

### Unit Tests
- Component rendering
- Hook logic
- Utility functions

### Integration Tests
- API service calls
- Authentication flow
- Form submissions

### E2E Tests (Optional)
- User workflows
- Critical paths

---

## 📱 Responsive Design

- **Desktop:** Full layout with sidebar
- **Tablet:** Collapsible sidebar
- **Mobile:** Bottom navigation, stacked layout

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to S3 + CloudFront
```bash
# Upload dist/ folder to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 📝 Next Steps

1. Install dependencies (`npm install`)
2. Configure environment variables (`.env`)
3. Implement components (start with Login, Dashboard)
4. Implement services (API integration)
5. Implement pages (Dashboard, PregnanciesList, LiveTracking)
6. Add real-time updates (WebSocket)
7. Test and debug
8. Build and deploy

---

**Frontend is ready for implementation!** 🚀
