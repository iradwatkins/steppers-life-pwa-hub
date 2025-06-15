import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertCircle, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
  requireOrganizer?: boolean;
  fallbackPath?: string;
  customFallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
  requireOrganizer = false,
  fallbackPath = '/login',
  customFallback
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: rolesLoading, hasOrganizer, canCreateEvents } = useRoles();
  const location = useLocation();

  // Show loading state
  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 animate-pulse" />
              Verifying Access
            </CardTitle>
            <CardDescription>Checking your permissions...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based permissions
  if (requiredRole && !hasPermission(requiredRole)) {
    if (customFallback) {
      return <>{customFallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Lock className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This page requires {Array.isArray(requiredRole) 
                  ? requiredRole.join(' or ') 
                  : requiredRole} permissions.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check organizer requirements
  if (requireOrganizer && !canCreateEvents()) {
    if (customFallback) {
      return <>{customFallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <User className="h-5 w-5" />
              Organizer Profile Required
            </CardTitle>
            <CardDescription>
              You need an organizer profile to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Set up your organizer profile to create and manage events.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = '/organizer/setup'}>
                Set Up Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for common protection patterns
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={['admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

export const OrganizerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireOrganizer>
    {children}
  </ProtectedRoute>
);

export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);