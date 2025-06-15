import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Mail, UserPlus, AlertCircle, Wrench } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from "@/contexts/ThemeContext";
import AuthDiagnostic from '@/components/auth/AuthDiagnostic';
import AuthDiagnosticComponent from '@/lib/env-check';
import { activateUser } from '@/utils/activateUser';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [notRegisteredError, setNotRegisteredError] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const { theme } = useTheme();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotRegisteredError('');

    try {
      if (!email) {
        toast.error('Please enter your email');
        setIsLoading(false);
        return;
      }

      if (!password) {
        toast.error('Please enter your password');
        setIsLoading(false);
        return;
      }

      console.log(`Attempting to sign in: ${email}`);
      
      // First verify if Supabase is reachable
      try {
        const { error: pingError } = await supabase.from('user_roles').select('id', { head: true });
        if (pingError) {
          console.error('Supabase connection error:', pingError);
          toast.error('Connection to authentication service failed. Please try again later.');
          setIsLoading(false);
          return;
        }
      } catch (pingError) {
        console.error('Failed to connect to Supabase:', pingError);
        toast.error('Authentication service is unavailable. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      // Attempt to sign in
      const result = await signIn(email, password);
      
      if (!result.success) {
        // Special handling for common errors
        if (result.error?.includes('Invalid email or password')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (result.error?.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else if (result.error?.includes('User already registered')) {
          setNotRegisteredError('You already have an account. Sign in with your credentials.');
        } else if (result.error?.toLowerCase().includes('not found') || result.error?.toLowerCase().includes('no account')) {
          setNotRegisteredError('No account found with this email. Would you like to create one?');
        } else {
          toast.error(result.error || 'Authentication failed. Please try again.');
        }
        
        setIsLoading(false);
        return;
      }
      
      // Check if the user account needs activation
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Try to activate the user if needed
          await activateUser(user.id);
        }
      } catch (activationError) {
        console.error('Error during user activation check:', activationError);
        // Continue with login anyway
      }
      
      // Successful login
      console.log('Login successful');
      toast.success('Login successful!');
      navigate(location.state?.from || '/');
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        toast.error(result.error || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      toast.error('Failed to sign in with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/auth/register', { state: { prefillEmail: email } });
  };

  return (
    <div className="min-h-screen bg-background-main flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-text-on-primary font-bold">SL</span>
            </div>
            <span className="font-serif font-semibold text-2xl text-text-primary">SteppersLife</span>
          </Link>
          <h2 className="font-serif text-3xl font-bold text-text-primary">
            Welcome to SteppersLife!
          </h2>
          <p className="mt-2 text-lg text-text-secondary">
            Sign in to your stepping community account
          </p>
        </div>

        {message && (
          <Alert className="bg-info-light border-info-border text-info-foreground mb-4">
            <Mail className="h-4 w-4 mr-2" />
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {notRegisteredError && (
          <Alert className="bg-warning-light border-warning-border text-warning-foreground mb-4">
            <UserPlus className="h-4 w-4 mr-2" />
            <AlertDescription className="flex flex-col">
              <span>{notRegisteredError}</span>
              <Button 
                variant="outline" 
                className="mt-2 border-warning-border text-warning-foreground hover:bg-warning-light/50"
                onClick={handleRegisterRedirect}
              >
                Create a new account
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-surface-card border-border-default">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full bg-white text-gray-800 border border-border-default hover:bg-gray-100 flex items-center justify-center gap-2"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Spinner size="sm" className="text-brand-primary" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            <Link to="/auth/magic-link" className="block w-full">
              <Button 
                type="button"
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Continue with Magic Link</span>
              </Button>
            </Link>

            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full" />
              <span className="relative bg-surface-card px-2 text-xs text-text-secondary">
                OR
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input 
                    id="email-input"
                    type="email" 
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password-input" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input 
                    id="password-input"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-text-secondary">Don't have an account? </span>
              <Link to="/auth/register" className="text-brand-primary hover:text-brand-primary-hover font-medium">
                Sign up here
              </Link>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-default">
              <button 
                onClick={() => setShowDiagnostic(!showDiagnostic)} 
                className="text-sm text-text-secondary flex items-center hover:text-brand-primary"
              >
                <Wrench className="h-3 w-3 mr-1" />
                {showDiagnostic ? 'Hide Troubleshooting' : 'Having trouble signing in?'}
              </button>
              
              {showDiagnostic && (
                <div className="mt-4">
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      If you're experiencing login issues, the diagnostic tool below can help identify the problem.
                    </AlertDescription>
                  </Alert>
                  <AuthDiagnosticComponent />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
