import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { setupAndTestSuperAdmins, verifySuperAdminSetup } from '@/utils/setup-super-admins';
import { AdminService } from '@/services/adminService';
import { Shield, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

interface AdminUser {
  email: string;
  role: string;
  full_name?: string;
}

export const SuperAdminSetup: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const runSuperAdminSetup = async () => {
    setIsRunning(true);
    setStatus('idle');
    
    try {
      console.log('🚀 Running super admin setup...');
      await setupAndTestSuperAdmins();
      
      // Refresh admin users list
      const users = await AdminService.getAdminUsers();
      setAdminUsers(users);
      setLastRun(new Date());
      setStatus('success');
      
      console.log('✅ Super admin setup completed successfully');
      
    } catch (error) {
      console.error('❌ Super admin setup failed:', error);
      setStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const users = await AdminService.getAdminUsers();
      setAdminUsers(users);
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  };

  React.useEffect(() => {
    loadAdminUsers();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  const AUTHORIZED_EMAILS = Object.freeze(['bobbygwatkins@gmail.com', 'iradwatkins@gmail.com']);
  const superAdmins = adminUsers.filter(user => user.role === 'super_admin');
  const authorizedSuperAdmins = superAdmins.filter(user => AUTHORIZED_EMAILS.includes(user.email));
  const unauthorizedSuperAdmins = superAdmins.filter(user => !AUTHORIZED_EMAILS.includes(user.email));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super Admin Setup
          </CardTitle>
          <CardDescription>
            Ensure Bobby Watkins and Ira Watkins have super_admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">Setup Status</span>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={runSuperAdminSetup}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isRunning ? 'Setting Up...' : 'Run Super Admin Setup'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={loadAdminUsers}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Refresh Users
            </Button>
          </div>

          {lastRun && (
            <p className="text-sm text-muted-foreground">
              Last run: {lastRun.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Super Admins Status</CardTitle>
          <CardDescription>
            Status of required super admin accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AUTHORIZED_EMAILS.map(email => {
              const user = adminUsers.find(u => u.email === email);
              const isSuperAdmin = user?.role === 'super_admin';
              
              return (
                <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {isSuperAdmin ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium">{email}</span>
                      {user?.full_name && (
                        <p className="text-sm text-muted-foreground">{user.full_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user ? (
                      <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Found</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Alert for Unauthorized Super Admins */}
      {unauthorizedSuperAdmins.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              🚨 SECURITY ALERT: Unauthorized Super Admins Detected
            </CardTitle>
            <CardDescription className="text-red-600">
              The following users have super_admin privileges but are NOT authorized. This is a security violation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unauthorizedSuperAdmins.map(user => (
                <div key={user.email} className="flex items-center justify-between p-3 bg-red-100 border border-red-300 rounded">
                  <div>
                    <span className="font-medium text-red-800">🚨 {user.email}</span>
                    {user.full_name && (
                      <span className="text-sm text-red-600 ml-2">({user.full_name})</span>
                    )}
                  </div>
                  <Badge variant="destructive">UNAUTHORIZED SUPER_ADMIN</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Action Required:</strong> These users should be demoted immediately through database administration.
                Only the two authorized emails should have super_admin privileges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {adminUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Admin Users ({adminUsers.length})</CardTitle>
            <CardDescription>
              Complete list of users with admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adminUsers.map(user => (
                <div key={user.email} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{user.email}</span>
                    {user.full_name && (
                      <span className="text-sm text-muted-foreground ml-2">({user.full_name})</span>
                    )}
                  </div>
                  <Badge variant={user.role === 'super_admin' ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};