import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Mail, User } from 'lucide-react';
import { useTheme } from "@/contexts/ThemeContext";
import { Separator } from '@/components/ui/separator';

const Register = () => {
  const location = useLocation();
  const prefillEmail = location.state?.prefillEmail || '';
  
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [step, setStep] = useState(prefillEmail ? 2 : 1); // Start on step 2 if email is prefilled
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const { signUp, signInWithGoogle, signIn, user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleContinueWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    setIsLoading(true);
    
    try {
      console.log('Checking email for registration:', email);
      
      // First test the connection to Supabase
      try {
        const { error: connError } = await supabase.from('user_roles').select('id', { head: true });
        if (connError) {
          console.error('Supabase connection error during registration:', connError);
          throw new Error('Connection error. Please try again later.');
        }
      } catch (connError) {
        console.error('Connection test failed:', connError);
        throw new Error('Connection error. Please try again later.');
      }
      
      // Skip email check for now and just go to the next step
      console.log('Email check skipped for:', email);
      toast.success('Please complete your registration.');
      setStep(2);
    } catch (error: any) {
      console.error('Error during registration process:', error);
      toast.error(error.message || 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      toast.error('Please provide your first and last name');
      return;
    }
    
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    toast.info('Creating your account, please wait...');
    
    try {
      // Clear any existing sessions first
      await supabase.auth.signOut();
      
      console.log('Creating account for:', email);
      
      // Direct Supabase signup - bypass role checking
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'buyer'
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Failed to complete registration');
        setIsLoading(false);
        return;
      }
      
      console.log('Registration successful:', data.user?.email);
      
      // Activate the user's account by updating their status in the user_profiles table
      if (data.user) {
        try {
          // Wait a moment for the Supabase trigger to create the user profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update the user status to active
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ status: 'active' })
            .eq('user_id', data.user.id);
            
          if (updateError) {
            console.error('Error activating user account:', updateError);
            // Continue anyway, since the account was created
          } else {
            console.log('User account activated successfully');
          }
        } catch (activationError) {
          console.error('Error during account activation:', activationError);
          // Continue since the account was still created
        }
      }
      
      toast.success('Registration successful!');
      
      // Instead of auto login, direct to login page to avoid session conflicts
      navigate('/auth/login', { 
        state: { 
          message: 'Registration successful! Please sign in with your new account.' 
        }
      });
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error('An unexpected error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        toast.error(result.error || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      toast.error('Failed to sign in with Google');
    } finally {
      setSocialLoading('');
    }
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
            {step === 1 ? "What's your email?" : "Complete your registration"}
          </p>
        </div>

        <Card className="bg-surface-card border-border-default">
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <>
                <form onSubmit={handleContinueWithEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                    {isLoading ? 'Checking...' : 'Continue'}
                  </Button>
                </form>

                <div className="relative flex items-center justify-center">
                  <Separator className="absolute w-full" />
                  <span className="relative bg-surface-card px-2 text-xs text-text-secondary">
                    OR
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-2 border border-border-default rounded-md shadow-sm"
                  onClick={handleGoogleLogin}
                  disabled={!!socialLoading}
                >
                  {socialLoading === 'google' ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="mr-2">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </>
            ) : (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <Input
                        type="text"
                        placeholder="First Name"
                        className="pl-10"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </form>
            )}

            <div className="text-center">
              <p className="text-sm text-text-secondary">
                By clicking Continue or using a social sign-in, you
                agree to SteppersLife's{' '}
                <Link to="/terms" className="text-brand-primary hover:text-brand-primary-hover">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-brand-primary hover:text-brand-primary-hover">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="text-center space-y-2">
              <Link to="/auth/login" className="text-brand-primary hover:text-brand-primary-hover block">
                Already have an account? Sign in
              </Link>
              <Link to="/auth/magic-link" className="block w-full">
                <Button 
                  type="button"
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Use magic link (passwordless login)</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
