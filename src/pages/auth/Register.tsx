
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, sendMagicLink, user } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
      // Success message is shown in the useAuth hook
      // User will need to verify email before they can login
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };

  const handleMagicLink = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }

    setIsMagicLinkLoading(true);
    try {
      await sendMagicLink(formData.email);
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleEmailOnlySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    // If additional fields are provided, do regular signup
    if (formData.firstName || formData.lastName || formData.password) {
      await handleSubmit(e);
    } else {
      // Otherwise, send magic link
      await handleMagicLink();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to SteppersLife!</CardTitle>
          <CardDescription>
            What's your email?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Form */}
          <form onSubmit={handleEmailOnlySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-stepping-gradient"
              disabled={isLoading}
            >
              {isLoading ? 'Continuing...' : 'Continue'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Google Signup */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignup}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            By clicking Continue or using a social sign-in, you agree to SteppersLife's{' '}
            <Link to="/about" className="text-stepping-purple hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/about" className="text-stepping-purple hover:underline">
              Privacy Policy
            </Link>
            .
          </div>

          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-stepping-purple hover:underline">
                Sign in
              </Link>
            </div>
            <div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleMagicLink}
                disabled={!formData.email || isMagicLinkLoading}
              >
                {isMagicLinkLoading ? 'Sending Magic Link...' : 'Send Magic Link'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Prefer passwordless login? Send Magic Link
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
