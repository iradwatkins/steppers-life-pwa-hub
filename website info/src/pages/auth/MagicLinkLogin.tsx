import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";

const MagicLinkLogin = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink, user } = useAuth();
  const navigate = useNavigate();
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
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signInWithMagicLink(email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success('Magic link sent! Check your email to sign in.');
      } else {
        toast.error(result.error || 'Failed to send magic link');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
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
            Sign in with a magic link sent to your email
          </p>
        </div>

        <Card className="bg-surface-card border-border-default">
          <CardHeader>
            <CardTitle className="text-center">Magic Link Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {emailSent ? (
              <Alert className="bg-success-light border-success-border text-success-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <AlertDescription>
                  We've sent a magic link to <strong>{email}</strong>. 
                  Please check your email and click the link to sign in.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input 
                      type="email" 
                      placeholder="Enter your email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>
            )}

            <div className="text-center space-y-2">
              <div>
                <span className="text-text-secondary">Want to use a password instead? </span>
                <Link to="/auth/login" className="text-brand-primary hover:text-brand-primary-hover font-medium">
                  Sign in with password
                </Link>
              </div>
              
              <div>
                <span className="text-text-secondary">Don't have an account? </span>
                <Link to="/auth/register" className="text-brand-primary hover:text-brand-primary-hover font-medium">
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MagicLinkLogin; 