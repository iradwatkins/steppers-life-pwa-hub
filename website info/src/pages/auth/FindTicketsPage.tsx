import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';

const FindTicketsPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would send a request to your API to email the user their tickets
      // For demo purposes, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      
      toast({
        title: "Email sent",
        description: "We've sent an email with your ticket information",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-50"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')", 
        }}
      ></div>
      
      {/* Content Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 z-10">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.svg" 
            alt="Steppers Life" 
            className="h-8" 
          />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Find Your Tickets</h1>
        
        {!submitted ? (
          <>
            <p className="mb-6">
              Enter the email address you used to purchase tickets, and we'll send you a link to access them.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Processing..." : "Send Email"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Email Sent!</h2>
            <p className="mb-6">
              We've sent an email to <strong>{email}</strong> with information about your tickets.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link 
            to="/auth/login" 
            className="text-brand-primary hover:underline text-sm"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FindTicketsPage; 