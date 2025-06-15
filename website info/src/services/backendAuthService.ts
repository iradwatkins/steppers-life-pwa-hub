import apiService from './apiService';

export interface BackendUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'admin' | 'organizer' | 'attendee' | 'staff';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role?: 'organizer' | 'attendee' | 'staff';
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: BackendUser;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  reset_token: string;
  new_password: string;
}

/**
 * Backend Authentication Service
 * Handles authentication with the FastAPI backend
 */
class BackendAuthService {
  private static instance: BackendAuthService;

  static getInstance(): BackendAuthService {
    if (!BackendAuthService.instance) {
      BackendAuthService.instance = new BackendAuthService();
    }
    return BackendAuthService.instance;
  }

  /**
   * Register a new user
   */
  async register(userData: UserRegistration): Promise<BackendUser> {
    try {
      return await apiService.post<BackendUser>('/auth/register', userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: UserLogin): Promise<TokenResponse> {
    try {
      return await apiService.post<TokenResponse>('/auth/login', credentials);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<BackendUser> {
    try {
      return await apiService.get<BackendUser>('/auth/me');
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/password-reset', { email });
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/password-reset/confirm', data);
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/verify-email', { token });
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<BackendUser>): Promise<BackendUser> {
    try {
      return await apiService.put<BackendUser>('/auth/profile', updates);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      return await apiService.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken });
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}

export default BackendAuthService.getInstance();