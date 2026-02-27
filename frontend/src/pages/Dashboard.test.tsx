import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {  } from 'react-router-dom';
import { TestBrowserRouter, TestMemoryRouter } from '@test/testUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import * as useDashboardStatsModule from '../hooks/useDashboardStats';

// Mock the useDashboardStats hook
vi.mock('../hooks/useDashboardStats');

const mockUseDashboardStats = vi.mocked(useDashboardStatsModule.useDashboardStats);

// Helper to render with providers
const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TestBrowserRouter>
        <Dashboard />
      </TestBrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to fetch dashboard stats';
    mockUseDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage),
    } as any);

    renderDashboard();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render metric cards with correct data', async () => {
    const mockStats = {
      total_pregnancies: 1247,
      high_risk_count: 89,
      active_emergencies: 5,
      available_ambulances: 18,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('1,247')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Pregnancies')).toBeInTheDocument();
    expect(screen.getByText('High-Risk')).toBeInTheDocument();
    expect(screen.getByText('Active Emergencies')).toBeInTheDocument();
    expect(screen.getByText('Available Ambulances')).toBeInTheDocument();
  });

  it('should display recent emergencies when data is available', async () => {
    const mockStats = {
      total_pregnancies: 100,
      high_risk_count: 10,
      active_emergencies: 2,
      available_ambulances: 15,
      recent_emergencies: [
        {
          event_id: '1',
          patient_name: 'Jane Doe',
          status: 'in_transit',
          trigger_timestamp: '2024-01-15T10:30:00Z',
          pregnancy_id: 'p1',
          event_type: 'emergency',
          severity_level: 'high',
          location: { latitude: 0, longitude: 0 },
        },
        {
          event_id: '2',
          patient_name: 'Mary Smith',
          status: 'completed',
          trigger_timestamp: '2024-01-15T09:00:00Z',
          pregnancy_id: 'p2',
          event_type: 'emergency',
          severity_level: 'medium',
          location: { latitude: 0, longitude: 0 },
        },
      ],
      high_risk_pregnancies: [],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Mary Smith')).toBeInTheDocument();
    });

    expect(screen.getByText(/Status: in_transit/)).toBeInTheDocument();
    expect(screen.getByText(/Status: completed/)).toBeInTheDocument();
  });

  it('should display high-risk pregnancies when data is available', async () => {
    const mockStats = {
      total_pregnancies: 100,
      high_risk_count: 10,
      active_emergencies: 2,
      available_ambulances: 15,
      recent_emergencies: [],
      high_risk_pregnancies: [
        {
          pregnancy_id: 'p1',
          patient_name: 'Sarah Johnson',
          risk_score: 85,
          village: 'Village A',
          district: 'District 1',
          age: 28,
          phone: '1234567890',
          lmp_date: '2024-01-01',
          edd: '2024-10-08',
          blood_type: 'O+',
          asha_worker_id: 'asha1',
          risk_category: 'high' as const,
          current_status: 'active' as const,
          registration_date: '2024-01-15',
          last_updated: '2024-01-15',
        },
        {
          pregnancy_id: 'p2',
          patient_name: 'Emily Brown',
          risk_score: 78,
          village: 'Village B',
          district: 'District 2',
          age: 32,
          phone: '0987654321',
          lmp_date: '2024-02-01',
          edd: '2024-11-08',
          blood_type: 'A+',
          asha_worker_id: 'asha2',
          risk_category: 'high' as const,
          current_status: 'active' as const,
          registration_date: '2024-02-15',
          last_updated: '2024-02-15',
        },
      ],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Emily Brown')).toBeInTheDocument();
    });

    expect(screen.getByText(/Risk Score: 85/)).toBeInTheDocument();
    expect(screen.getByText(/Risk Score: 78/)).toBeInTheDocument();
  });

  it('should display empty state when no recent emergencies', async () => {
    const mockStats = {
      total_pregnancies: 100,
      high_risk_count: 10,
      active_emergencies: 0,
      available_ambulances: 15,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No recent emergencies')).toBeInTheDocument();
      expect(screen.getByText('All systems are operating normally')).toBeInTheDocument();
    });
  });

  it('should display empty state when no high-risk pregnancies', async () => {
    const mockStats = {
      total_pregnancies: 100,
      high_risk_count: 0,
      active_emergencies: 2,
      available_ambulances: 15,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No high-risk pregnancies')).toBeInTheDocument();
      expect(screen.getByText('All pregnancies are within normal risk levels')).toBeInTheDocument();
    });
  });

  it('should render View All buttons', async () => {
    const mockStats = {
      total_pregnancies: 100,
      high_risk_count: 10,
      active_emergencies: 2,
      available_ambulances: 15,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      const viewAllButtons = screen.getAllByText('View All');
      expect(viewAllButtons).toHaveLength(2);
    });
  });

  it('should render Quick Actions section', async () => {
    const mockStats = {
      total_pregnancies: 100,
      high_risk_count: 10,
      active_emergencies: 2,
      available_ambulances: 15,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };

    mockUseDashboardStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('View All Pregnancies')).toBeInTheDocument();
      expect(screen.getByText('View All Emergencies')).toBeInTheDocument();
      expect(screen.getByText('Live Ambulance Tracking')).toBeInTheDocument();
      expect(screen.getByText('View Analytics')).toBeInTheDocument();
    });
  });
});

