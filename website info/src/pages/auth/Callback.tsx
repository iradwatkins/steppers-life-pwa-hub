import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('Processing auth callback...', { 
          hasCode: !!searchParams.get('code'),
          hasAccessToken: !!searchParams.get('access_token'),
          hasRefreshToken: !!searchParams.get('refresh_token')
        });
        
        // Check for error in URL parameters
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        // Handle magic link authentication (hash-based tokens)
        if (window.location.hash) {
          console.log('Processing magic link with hash tokens...');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Magic link session error:', error);
            throw error;
          }
          
          if (data.session) {
            console.log('Magic link session found:', data.session.user.email);
            await ensureNewUserRole(data.session.user.id);
            toast.success('Successfully signed in with magic link!');
            setProcessing(false);
            
            // Redirect immediately for magic links
            navigate('/', { replace: true });
            return;
          }
        }

        // Handle OAuth flow with code parameter
        const code = searchParams.get('code');
        if (code) {
          console.log('Processing OAuth code exchange...');
          const exchangeError = await handleAuthCode();
          if (exchangeError) {
            throw new Error(exchangeError);
          }
        }

        // Final session check
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Final session error:', error);
          throw error;
        }
        
        if (data.session) {
          console.log('Auth successful:', data.session.user.email);
          await ensureNewUserRole(data.session.user.id);
          toast.success('Successfully signed in!');
          setProcessing(false);
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } else {
          throw new Error('No session found after authentication');
        }
        
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'Authentication failed');
        setProcessing(false);
      }
    };

    processAuthCallback();
  }, [navigate, searchParams]);
  
  // Ensure new OAuth users have a role
  const ensureNewUserRole = async (userId: string): Promise<void> => {
    try {
      // Check if user already has a role
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      // If user doesn't have roles yet, create default buyer role
      if (!existingRoles || existingRoles.length === 0) {
        console.log('Creating default role for new OAuth user');
        
        // Insert default buyer role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: 'buyer', 
            is_primary: true 
          });
        
        if (insertError) {
          console.error('Error creating user role:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user role:', error);
    }
  };
  
  // Handle auth code exchange (for OAuth PKCE flow)
  const handleAuthCode = async (): Promise<string | null> => {
    try {
      // Get code verifier from storage
      const codeVerifier = localStorage.getItem('supabase.auth.code_verifier');
      const code = searchParams.get('code');
      
      if (!code) {
        return 'No authorization code found in URL';
      }
      
      if (!codeVerifier) {
        return 'No code verifier found in storage';
      }
      
      // Exchange the code
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Code exchange error:', error);
        return error.message;
      }
      
      // Ensure the user's role is set if this is a new OAuth user
      if (data?.session?.user) {
        await ensureNewUserRole(data.session.user.id);
      }
      
      return null;
    } catch (err: any) {
      console.error('Error exchanging auth code:', err);
      return err.message;
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-red-700">Authentication Error</h1>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <Spinner size="lg" />
        <h2 className="mt-4 text-xl font-semibold">
          {processing ? 'Processing authentication...' : 'Completing login...'}
        </h2>
        <p className="mt-2 text-gray-600">
          {processing 
            ? 'Please wait while we verify your credentials' 
            : 'Please wait while we redirect you'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback; 