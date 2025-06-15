import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const RegisterDetails = () => {
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('registration_email') || '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
    
    // If no email is found, redirect back to the first step
    if (!email) {
      navigate('/auth/register');
    }
  }, [user, navigate, email]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return { minLength, hasUpper, hasLower, hasNumber, isValid: minLength && hasUpper && hasLower && hasNumber };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName || !lastName || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Password must meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signUp(email, password, firstName, lastName);
      
      if (result.success) {
        // Create buyer profile with additional information
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Create buyer profile record
          await supabase
            .from('buyer_profiles')
            .insert({
              user_id: user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          // Create default event preferences
          await supabase
            .from('event_preferences')
            .insert({
              user_id: user.id,
              notification_settings: {
                email_recommendations: true,
                push_notifications: true
              }
            });
        }

        // Clean up localStorage
        localStorage.removeItem('registration_email');

        toast.success('Account created! Please check your email for verification.');
        navigate('/auth/login', { 
          state: { 
            message: 'Please check your email and click the verification link before signing in.' 
          } 
        });
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">SL</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {email}
          </p>
          <button 
            onClick={() => navigate('/auth/register')}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
        </div>

        <Card className="bg-white shadow-md border-gray-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input 
                    placeholder="First name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-10"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input 
                    placeholder="Last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a password"
                    className="pr-10 h-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password validation */}
                {password && (
                  <div className="space-y-1 mt-2">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="h-3 w-3" />
                        At least 6 characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm your password"
                    className="pr-10 h-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms agreement */}
              <div className="flex items-start space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 mt-6 bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterDetails; 