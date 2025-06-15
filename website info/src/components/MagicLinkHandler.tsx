import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const MagicLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMagicLink = async () => {
      // Check if this is a magic link redirect with hash tokens
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('Magic link detected, processing...');
        
        try {
          // The session should be automatically set by Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Magic link session error:', error);
            toast.error('Magic link authentication failed');
            return;
          }
          
          if (session) {
            console.log('Magic link login successful:', session.user.email);
            toast.success('Successfully signed in with magic link!');
            
            // Clean the URL hash
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect to dashboard or intended page
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error processing magic link:', error);
          toast.error('Authentication failed');
        }
      }
    };

    handleMagicLink();
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default MagicLinkHandler;