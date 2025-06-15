
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBackendProfile?: boolean; // Whether to require backend profile
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireBackendProfile = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" className="text-brand-primary" />
          <div className="text-lg text-text-secondary">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
