import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  // Debug logs for authentication state
  useEffect(() => {
    console.log('AdminLayout - Auth State:', { 
      user: user ? `${user.email} (${user.id})` : 'No user', 
      authLoading, 
      isAdmin, 
      adminLoading 
    });
  }, [user, authLoading, isAdmin, adminLoading]);

  // If we're loading auth or admin status, show loading
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg text-text-secondary">
            {authLoading ? 'Checking authentication...' : 'Checking admin permissions...'}
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login option
  if (!user) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <p className="text-text-secondary">Please sign in to access the admin dashboard.</p>
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-feedback-warning" />
              Insufficient Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <p className="text-text-secondary">You don't have admin privileges to access this dashboard.</p>
            <p className="text-xs text-muted-foreground">Logged in as: {user.email}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated and admin, render the admin layout
  return (
    <div className="flex h-screen bg-background-main">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                SteppersLife Admin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Platform Management Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.email}
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 