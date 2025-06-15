import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import Login from '../pages/auth/Login';
import { useHybridAuth } from '../hooks/useHybridAuth';

// Mock the hooks and dependencies
vi.mock('../hooks/useHybridAuth');
vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));
vi.mock('../components/ui/sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));
vi.mock('../utils/activateUser', () => ({
  activateUser: vi.fn(),
}));
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'test-user-id' } } }),
    },
  },
}));

// Mock components that might not be available in test environment
vi.mock('../components/auth/AuthDiagnostic', () => ({
  default: () => <div data-testid="auth-diagnostic">Auth Diagnostic Component</div>,
}));
vi.mock('../lib/env-check', () => ({
  default: () => <div data-testid="env-check">Environment Check Component</div>,
}));

const mockUseHybridAuth = vi.mocked(useHybridAuth);

const renderLoginWithRouter = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component - Backend Integration', () => {
  const mockSignIn = vi.fn();
  const mockUser = null;
  const mockLoading = false;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHybridAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      refreshBackendProfile: vi.fn(),
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      user: mockUser,
      session: null,
      loading: mockLoading,
      isAuthenticated: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render login form with all required elements', () => {
      renderLoginWithRouter();

      expect(screen.getByText('Welcome to SteppersLife!')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your stepping community account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('should render Google sign-in button', () => {
      renderLoginWithRouter();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('should render Magic Link option', () => {
      renderLoginWithRouter();
      expect(screen.getByRole('link', { name: /continue with magic link/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty email', async () => {
      renderLoginWithRouter();
      const user = userEvent.setup();

      const signInButton = screen.getByRole('button', { name: /^sign in$/i });
      await user.click(signInButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter your email');
    });

    it('should show error when submitting empty password', async () => {
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(signInButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter your password');
    });

    it('should accept valid email and password', async () => {
      mockSignIn.mockResolvedValue({ data: { user: { email: 'test@example.com' } }, error: null });
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  describe('Backend Authentication Integration', () => {
    it('should call hybrid auth sign-in method', async () => {
      mockSignIn.mockResolvedValue({ data: { user: { email: 'test@example.com' } }, error: null });
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(signInButton);

      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'validpassword');
    });

    it('should handle authentication errors correctly', async () => {
      const authError = { message: 'Invalid email or password' };
      mockSignIn.mockResolvedValue({ data: null, error: authError });
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid email or password. Please try again.');
      });
    });

    it('should show account not found error and suggest registration', async () => {
      const authError = { message: 'No account found with this email' };
      mockSignIn.mockResolvedValue({ data: null, error: authError });
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText(/no account found with this email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create a new account/i })).toBeInTheDocument();
      });
    });

    it('should handle successful authentication', async () => {
      const successData = { 
        data: { user: { email: 'test@example.com', id: 'test-user-id' } }, 
        error: null 
      };
      mockSignIn.mockResolvedValue(successData);
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Login successful!');
      });
    });
  });

  describe('User Experience Features', () => {
    it('should toggle password visibility', async () => {
      renderLoginWithRouter();
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      expect(passwordInput.type).toBe('password');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should show loading state during authentication', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(signInButton).toBeDisabled();
    });

    it('should show troubleshooting section when requested', async () => {
      renderLoginWithRouter();
      const user = userEvent.setup();

      const troubleButton = screen.getByText(/having trouble signing in/i);
      await user.click(troubleButton);

      expect(screen.getByText('Hide Troubleshooting')).toBeInTheDocument();
      expect(screen.getByTestId('env-check')).toBeInTheDocument();
    });
  });

  describe('Navigation and Links', () => {
    it('should have link to registration page', () => {
      renderLoginWithRouter();
      const registerLink = screen.getByRole('link', { name: /sign up here/i });
      expect(registerLink).toHaveAttribute('href', '/auth/register');
    });

    it('should have link to magic link login', () => {
      renderLoginWithRouter();
      const magicLinkButton = screen.getByRole('link', { name: /continue with magic link/i });
      expect(magicLinkButton).toHaveAttribute('href', '/auth/magic-link');
    });

    it('should redirect to register with prefilled email when account not found', async () => {
      const authError = { message: 'No account found' };
      mockSignIn.mockResolvedValue({ data: null, error: authError });
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      await waitFor(() => {
        const createAccountButton = screen.getByRole('button', { name: /create a new account/i });
        expect(createAccountButton).toBeInTheDocument();
      });
    });
  });

  describe('Backend Profile Integration', () => {
    it('should log backend profile information on successful login', async () => {
      const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      const successData = { 
        data: { user: { email: 'test@example.com', id: 'test-user-id' } }, 
        error: null 
      };
      mockSignIn.mockResolvedValue(successData);
      
      renderLoginWithRouter();
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith(
          'Login successful, user profile:',
          expect.objectContaining({
            supabaseUser: 'test@example.com',
          })
        );
      });

      mockConsoleLog.mockRestore();
    });
  });
});