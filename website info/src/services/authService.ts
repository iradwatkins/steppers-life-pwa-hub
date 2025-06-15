import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// User types matching backend models
export type UserRole = 'admin' | 'organizer' | 'attendee' | 'staff';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface User extends SupabaseUser {
  role?: UserRole;
  status?: UserStatus;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false
  };
  
  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    this.initializeAuth();
    this.setupAuthListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
      this.updateAuthState({
        user: session.user as User,
        session,
        isAuthenticated: true,
        isLoading: false
      });
    }
  }

  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.updateAuthState({
          user: session.user as User,
          session,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        this.clearAuth();
      }
    });
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.authState);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Update auth state
  private updateAuthState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  // Clear authentication state
  private clearAuth(): void {
    this.updateAuthState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  // Get current auth state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Get current session
  getSession(): Session | null {
    return this.authState.session;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.session;
  }

  // Login with email/password
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    this.updateAuthState({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        return { success: true, user: data.user as User };
      }

      throw new Error('Login failed');
    } catch (error) {
      this.updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  // Login with Google
  async loginWithGoogle(): Promise<{
    success: boolean;
    error?: string;
  }> {
    this.updateAuthState({ isLoading: true });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      this.updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google login failed' 
      };
    }
  }

  // Send magic link
  async sendMagicLink(email: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    this.updateAuthState({ isLoading: true });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      this.updateAuthState({ isLoading: false });
      return { success: true };
    } catch (error) {
      this.updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send magic link' 
      };
    }
  }

  // Register new user
  async register(email: string, password: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    message?: string;
  }> {
    this.updateAuthState({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      this.updateAuthState({ isLoading: false });
      return { 
        success: true, 
        user: data.user as User,
        message: 'Registration successful! Please check your email to verify your account.' 
      };
    } catch (error) {
      this.updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    this.updateAuthState({ isLoading: true });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      this.updateAuthState({ isLoading: false });
      return { success: true };
    } catch (error) {
      this.updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset request failed' 
      };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    this.updateAuthState({ isLoading: true });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      this.updateAuthState({ isLoading: false });
      return { success: true };
    } catch (error) {
      this.updateAuthState({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password update failed' 
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.clearAuth();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Check if user has specific role
  hasRole(role: UserRole): boolean {
    return this.authState.user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: UserRole[]): boolean {
    return !!this.authState.user?.role && roles.includes(this.authState.user.role);
  }
}

export const authService = AuthService.getInstance(); 