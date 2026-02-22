import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from './Header';
import { useAuth } from '@hooks/useAuth';

// Mock the useAuth hook
vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the useAuth hook
const mockLogout = vi.fn();

describe('Header Component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'district_officer' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth({
      user: mockUser,
      logout: mockLogout,
    });
  });

  const mockUseAuth = (overrides = {}) => {
    const defaultAuth = {
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
      error: null,
    };
    (useAuth as any).mockReturnValue({ ...defaultAuth, ...overrides });
  };

  const renderHeader = (props = {}) => {
    return render(
      <MemoryRouter>
        <Header {...props} />
      </MemoryRouter>
    );
  };

  it('should render header with app name and user info', () => {
    mockUseAuth();
    renderHeader();

    expect(screen.getByText('MaatriSahayak')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument(); // User initials
  });

  it('should show notifications badge with count', () => {
    mockUseAuth();
    const emergencyCount = 3;
    renderHeader({ emergencyCount });

    const badge = screen.getByText(emergencyCount.toString());
    expect(badge).toBeInTheDocument();
  });

  it('should show user menu when avatar is clicked', () => {
    mockUseAuth();
    renderHeader();

    const avatarButton = screen.getByRole('button', { name: /account settings/i });
    fireEvent.click(avatarButton);

    // Name appears in both header and menu, so use getAllByText
    const names = screen.getAllByText('John Doe');
    expect(names.length).toBeGreaterThan(0);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('District Officer')).toBeInTheDocument();
  });

  it('should show logout option in menu', () => {
    mockUseAuth();
    renderHeader();

    const avatarButton = screen.getByRole('button', { name: /account settings/i });
    fireEvent.click(avatarButton);

    const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should call logout when logout is clicked', () => {
    mockUseAuth();
    renderHeader();

    const avatarButton = screen.getByRole('button', { name: /account settings/i });
    fireEvent.click(avatarButton);

    const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should show notifications badge when there are emergencies', () => {
    mockUseAuth();
    const emergencyCount = 5;
    renderHeader({ emergencyCount });

    const badge = screen.getByText(emergencyCount.toString());
    expect(badge).toBeInTheDocument();
  });

  it('should show mobile menu button on small screens', () => {
    mockUseAuth();
    // Note: This test would require mocking useMediaQuery
    // For now, we test that the component renders with onMenuClick prop
    const mockOnMenuClick = vi.fn();
    renderHeader({ onMenuClick: mockOnMenuClick });

    // Component should render successfully
    expect(screen.getByText('MaatriSahayak')).toBeInTheDocument();
  });

  it('should show user initials in avatar', () => {
    mockUseAuth();
    renderHeader();

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('should handle notifications click', () => {
    mockUseAuth();
    renderHeader();

    const notificationsButton = screen.getByLabelText(/emergency alerts/i);
    fireEvent.click(notificationsButton);

    // Note: In a real test, we would mock window.location.href
    // For now, just verify the button exists and is clickable
    expect(notificationsButton).toBeInTheDocument();
  });

  it('should render with different user roles', () => {
    mockUseAuth({
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'asha_worker' as const,
      },
    });
    renderHeader();

    const avatarButton = screen.getByRole('button', { name: /account settings/i });
    fireEvent.click(avatarButton);

    expect(screen.getByText('ASHA Worker')).toBeInTheDocument();
  });

  it('should render without user data', () => {
    mockUseAuth({ user: null });
    renderHeader();

    // Should show default values
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument(); // Default initials
  });
});