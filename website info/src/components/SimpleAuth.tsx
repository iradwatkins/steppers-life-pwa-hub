import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { User, Session } from '@supabase/supabase-js';
import { Separator } from '@/components/ui/separator';

interface SimpleAuthProps {
  onAuthChange: (user: User | null) => void;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ onAuthChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        onAuthChange(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in!");
        } else if (event === 'SIGNED_OUT') {
          toast.success("Successfully signed out!");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      onAuthChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [onAuthChange]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        
        toast.success("Check your email for the magic link!");
        setEmail('');
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          toast.success("Check your email for verification link!");
        } else {
          toast.success("Account created successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      
      // Clear form on success
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Invalid email or password");
      } else if (error.message.includes('User already registered')) {
        toast.error("This email is already registered. Try signing in instead.");
      } else if (error.message.includes('Email not confirmed')) {
        toast.error("Please check your email and click the confirmation link before signing in.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error("Failed to sign out: " + error.message);
    }
  };

  if (user) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Signed in as: {user.email}
            </p>
            <p className="text-xs text-green-600">
              You can now upload files to Supabase Storage
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <h3 className="text-sm font-medium text-yellow-800 mb-3">
        Sign in to upload files to Supabase Storage
      </h3>
      
      {/* Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGoogleSignIn}
        className="w-full mb-4 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <Separator className="my-4" />
      
      <form onSubmit={handleAuth} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="text-sm"
        />
        {!isMagicLink && (
          <Input
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isMagicLink}
            minLength={6}
            className="text-sm"
          />
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            className="flex-1"
          >
            {isLoading ? 'Loading...' : (
              isMagicLink ? 'Send Magic Link' :
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (isMagicLink) {
                setIsMagicLink(false);
              } else {
                setIsSignUp(!isSignUp);
              }
            }}
            className="flex-1"
          >
            {isMagicLink ? 'Use Password' : (isSignUp ? 'Sign In' : 'Sign Up')}
          </Button>
        </div>
      </form>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsMagicLink(!isMagicLink)}
        className="mt-2 text-xs w-full"
      >
        {isMagicLink ? 'Use password instead' : 'Sign in with magic link'}
      </Button>

      <div className="mt-3 text-xs text-yellow-700">
        {isMagicLink ? 
          "We'll send you a magic link to your email" :
          isSignUp ? 
            "Create a new account to start uploading files" : 
            "Sign in with your existing account"
        }
      </div>
    </div>
  );
};

export default SimpleAuth;
