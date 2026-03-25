# MaatriSahayak Frontend Dashboard

AI-Powered Maternal Emergency Response Platform - Web Dashboard for District Health Officers

## Overview

The MaatriSahayak Dashboard provides real-time monitoring and management capabilities for maternal health emergencies in rural India. Built with React, TypeScript, and Material-UI, it integrates with AWS backend services to deliver a comprehensive view of pregnancies, emergency alerts, ambulance tracking, and analytics.

## Features

- 📊 **Dashboard Overview** - Real-time statistics and key metrics
- 🤰 **Pregnancy Management** - Track and monitor all registered pregnancies
- 🚨 **Emergency Alerts** - Real-time emergency monitoring and coordination
- 🚑 **Live Tracking** - Ambulance location tracking on interactive maps
- 📈 **Analytics** - Performance metrics and trend analysis
- 🔐 **Secure Authentication** - AWS Cognito integration
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js 18+ and npm
- AWS account with deployed backend services
- API Gateway endpoint URL
- AWS Cognito User Pool credentials

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and add your AWS configuration:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/dev
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```

### 3. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Routes

### Public
- `/role-select` — Choose Officer or Driver portal
- `/login` — District Officer login
- `/register` — District Officer registration
- `/driver/login` — Ambulance Driver login
- `/drivers/register` — Ambulance Driver registration

### Protected
- `/dashboard`
- `/pregnancies`
- `/pregnancies/:id`
- `/emergencies`
- `/tracking`
- `/analytics`
- `/asha`
- `/asha/:id`
- `/drivers`
- `/drivers/:id`
- `/hospitals`
- `/profile`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Root component
│   └── main.tsx        # Application entry point
├── .env.example        # Environment variables template
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint and Prettier rules
- Use functional components with hooks
- Implement proper error handling
- Write tests for critical functionality

### Component Structure

```typescript
// Example component structure
import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Box>
      <Typography variant="h5">{title}</Typography>
      {/* Component content */}
    </Box>
  );
};
```

### API Service Pattern

```typescript
// services/pregnancy.ts
import api from './api';
import { Pregnancy, PaginatedResponse } from '@types';

export const getPregnancies = async (params: any): Promise<PaginatedResponse<Pregnancy>> => {
  const response = await api.get('/pregnancies', { params });
  return response.data;
};
```

### Custom Hooks Pattern

```typescript
// hooks/usePregnancies.ts
import { useQuery } from '@tanstack/react-query';
import { getPregnancies } from '@services/pregnancy';

export const usePregnancies = (filters: any) => {
  return useQuery({
    queryKey: ['pregnancies', filters],
    queryFn: () => getPregnancies(filters),
    staleTime: 30000,
  });
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Test Title" onAction={() => {}} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## Deployment

### Option 1: AWS S3 + CloudFront

```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 2: AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings (auto-detected from package.json)
3. Add environment variables in Amplify Console
4. Deploy automatically on push to main branch

### Option 3: Vercel/Netlify

1. Connect your GitHub repository
2. Configure build command: `npm run build`
3. Configure output directory: `dist`
4. Add environment variables
5. Deploy

## Environment Variables

| Variable                    | Description             | Required |
| --------------------------- | ----------------------- | -------- |
| `VITE_API_BASE_URL`         | Backend API Gateway URL | Yes      |
| `VITE_AWS_REGION`           | AWS region              | Yes      |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID    | Yes      |
| `VITE_COGNITO_CLIENT_ID`    | Cognito App Client ID   | Yes      |
| `VITE_MAP_TILES_URL`        | Map tiles URL           | No       |
| `VITE_MAP_ATTRIBUTION`      | Map attribution text    | No       |

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to any available port
}
```

### API Connection Issues

1. Verify your API Gateway URL in `.env`
2. Check CORS configuration on backend
3. Ensure API Gateway is deployed
4. Check browser console for detailed errors

### Authentication Issues

1. Verify Cognito User Pool ID and Client ID
2. Check Cognito User Pool configuration
3. Ensure user exists in Cognito
4. Check browser console for auth errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and tests
5. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions:
- Check the documentation
- Review CloudWatch logs for backend errors
- Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: February 19, 2026  
**Status**: Development
