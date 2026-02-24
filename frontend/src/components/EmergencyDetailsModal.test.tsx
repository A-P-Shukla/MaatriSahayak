import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmergencyDetailsModal from './EmergencyDetailsModal';
import * as emergencyHooks from '../hooks/useEmergencies';

// Mock the useEmergency hook
vi.mock('../hooks/useEmergencies', () => ({
  useEmergency: vi.fn(),
}));

const mockEmergency = {
  event_id: 'EMG001',
  pregnancy_id: 'PREG001',
  patient_name: 'Test Patient',
  patient_phone: '+91-9876543210',
  patient_village: 'Test Village',
  event_type: 'High Blood Pressure',
  severity_level: 'high' as const,
  status: 'in_transit' as const,
  trigger_timestamp: '2024-02-24T10:00:00Z',
  dispatch_timestamp: '2024-02-24T10:05:00Z',
  arrival_timestamp: null,
  completion_timestamp: null,
  ambulance_id: 'AMB001',
  hospital_id: 'HOSP001',
  response_time_seconds: 300,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('EmergencyDetailsModal', () => {
  it('renders loading state', () => {
    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Failed to load emergency details/i)).toBeInTheDocument();
  });

  it('renders emergency details', () => {
    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: mockEmergency,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Emergency Details')).toBeInTheDocument();
    expect(screen.getByText('Test Patient')).toBeInTheDocument();
    expect(screen.getByText('High Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText(/HIGH SEVERITY/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: mockEmergency,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('displays status timeline', () => {
    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: mockEmergency,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Status Timeline')).toBeInTheDocument();
    expect(screen.getByText('Emergency Initiated')).toBeInTheDocument();
    expect(screen.getByText('Ambulance Dispatched')).toBeInTheDocument();
    expect(screen.getByText('En Route to Patient')).toBeInTheDocument();
  });

  it('displays ambulance details when available', () => {
    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: mockEmergency,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Ambulance Details')).toBeInTheDocument();
    expect(screen.getByText('AMB001')).toBeInTheDocument();
  });

  it('displays hospital details when available', () => {
    vi.mocked(emergencyHooks.useEmergency).mockReturnValue({
      data: mockEmergency,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <EmergencyDetailsModal emergencyId="EMG001" open={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Hospital Details')).toBeInTheDocument();
    expect(screen.getByText('HOSP001')).toBeInTheDocument();
  });
});
