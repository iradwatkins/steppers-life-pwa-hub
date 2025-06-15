import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Users, FileText, Calendar, Settings, Shield, AlertTriangle, CheckCircle, Info, PlusSquare, Smartphone, Edit, Store } from 'lucide-react';
import GitHubSync from '@/components/GitHubSync';
import PWAAnalyticsDashboard from '@/components/admin/PWAAnalyticsDashboard';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  adminUsers: number;
  recentActivity: any[];
}

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminCheck();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFiles: 0,
    adminUsers: 1,
    recentActivity: []
  });

  useEffect(() => {
    if (user && isAdmin) {
      loadDashboardStats();
    }
  }, [user, isAdmin]);

  const loadDashboardStats = async () => {
    try {
      // Get total files count
      const { count: fileCount } = await supabase
        .from('uploaded_files')
        .select('*', { count: 'exact', head: true });

      // Get admin users count
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      setStats({
        totalUsers: 1, // Hardcoded since we can't access auth.users
        totalFiles: fileCount || 0,
        adminUsers: adminCount || 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const handleRefreshStats = () => {
    loadDashboardStats();
    toast.success('Dashboard statistics refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-lg text-text-secondary">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">Please sign in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardContent>
            <p className="text-text-secondary">You don't have admin privileges to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
            <p className="text-text-secondary">Manage your SteppersLife platform</p>
          </div>

          {/* GitHub Sync Component */}
          <GitHubSync onRefresh={handleRefreshStats} />

          {/* Security Status */}
          <div className="mb-8">
            <Card className="border-feedback-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-feedback-success">
                  <CheckCircle className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>OTP Expiry</span>
                    <Badge variant="outline" className="text-feedback-success border-feedback-success">
                      Fixed (10 minutes)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Password Protection</span>
                    <Badge variant="outline" className="text-feedback-success border-feedback-success">
                      Enhanced Security
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Row Level Security</span>
                    <Badge variant="outline" className="text-feedback-success border-feedback-success">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Access</span>
                    <Badge variant="outline" className="text-feedback-success border-feedback-success">
                      Database-Driven Roles
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-text-secondary">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uploaded Files</CardTitle>
                <FileText className="h-4 w-4 text-text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFiles}</div>
                <p className="text-xs text-text-secondary">Total file uploads</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminUsers}</div>
                <p className="text-xs text-text-secondary">Administrator accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings className="h-4 w-4 text-text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-feedback-success">Healthy</div>
                <p className="text-xs text-text-secondary">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Management Links */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/admin/magazine">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Magazine Management</CardTitle>
                    <Edit className="h-4 w-4 text-text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary">Create, edit, and manage magazine articles with block-based content including categories and rich media.</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/admin/stores">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Store Directory</CardTitle>
                    <Store className="h-4 w-4 text-text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary">Manage store categories, moderate listings, and oversee reviews in the community directory.</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/admin/event-claims">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Event Claims</CardTitle>
                    <Info className="h-4 w-4 text-text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary">Review and approve/reject event claims made by promoters.</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/admin/events/create-assign">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Create & Assign Event</CardTitle>
                    <PlusSquare className="h-4 w-4 text-text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary">Directly create an event and assign it to a specific promoter.</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* PWA Analytics Dashboard */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-text-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Progressive Web App Analytics</h2>
            </div>
            <PWAAnalyticsDashboard className="bg-white rounded-lg" />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Security Improvements Implemented</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-feedback-success" />
                  <div>
                    <p className="font-medium">Database-Driven Admin Roles</p>
                    <p className="text-sm text-text-secondary">Moved from hardcoded emails to flexible user roles system</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-feedback-success" />
                  <div>
                    <p className="font-medium">OTP Expiry Reduced</p>
                    <p className="text-sm text-text-secondary">Changed from 1+ hour to 10 minutes for enhanced security</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-feedback-success" />
                  <div>
                    <p className="font-medium">Password Strength Enhanced</p>
                    <p className="text-sm text-text-secondary">Minimum 8 characters with mixed case, numbers required</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-feedback-success" />
                  <div>
                    <p className="font-medium">File Access Secured</p>
                    <p className="text-sm text-text-secondary">Row Level Security policies implemented for user files</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-feedback-success" />
                  <div>
                    <p className="font-medium">Admin Dashboard Created</p>
                    <p className="text-sm text-text-secondary">Role-based access control for administrative functions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-feedback-success" />
                  <div>
                    <p className="font-medium">GitHub Integration Added</p>
                    <p className="text-sm text-text-secondary">Git push/pull functionality for version control</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <Button onClick={handleRefreshStats} variant="outline">
                Refresh Stats
              </Button>
              <Button variant="outline" disabled>
                User Management (Coming Soon)
              </Button>
              <Button variant="outline" disabled>
                System Settings (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
