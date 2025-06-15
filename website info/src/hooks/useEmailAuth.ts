import { useState } from 'react';
import { sendEmailCode, verifyEmailCode } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

export const useEmailAuth = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const { toast } = useToast();

  /**
   * Send verification code to the provided email
   */
  const sendCode = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    
    try {
      await sendEmailCode(email);
      setEmailSubmitted(true);
      toast({
        title: "Code sent",
        description: "Check your email for a one-time login code",
      });
      return true;
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: "An error occurred while sending the verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify the submitted code
   */
  const verifyCode = async () => {
    if (!code) {
      toast({
        title: "Code required",
        description: "Please enter the verification code sent to your email",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    
    try {
      const result = await verifyEmailCode(email, code);
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome to Steppers Life!",
        });
        return true;
      } else {
        toast({
          title: "Invalid code",
          description: "The code you entered is invalid or expired",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the email submission state
   */
  const resetEmailSubmission = () => {
    setEmailSubmitted(false);
    setCode('');
  };

  /**
   * Resend the verification code
   */
  const resendCode = async () => {
    setLoading(true);
    try {
      await sendEmailCode(email);
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      });
      return true;
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: "An error occurred while sending a new verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    code,
    setCode,
    loading,
    emailSubmitted,
    sendCode,
    verifyCode,
    resetEmailSubmission,
    resendCode
  };
}; 