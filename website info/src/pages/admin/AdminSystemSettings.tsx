import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Shield, 
  Zap, 
  Database, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  
  // Email Settings
  emailProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFromName: string;
  emailFromAddress: string;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPasswords: boolean;
  enableTwoFactor: boolean;
  allowPasswordReset: boolean;
  
  // Feature Toggles
  enableBlog: boolean;
  enableStores: boolean;
  enableChat: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableMaintenance: boolean;
  
  // API Settings
  apiRateLimit: number;
  enableApiLogs: boolean;
  apiVersion: string;
  enableCors: boolean;
  
  // Performance Settings
  enableCaching: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  maxFileSize: number;
}

const defaultSettings: SystemSettings = {
  siteName: 'SteppersLife',
  siteDescription: 'Your premier destination for dance events and community',
  siteUrl: 'https://stepperslife.com',
  adminEmail: 'admin@stepperslife.com',
  timezone: 'America/New_York',
  language: 'en',
  allowRegistration: true,
  requireEmailVerification: true,
  
  emailProvider: 'smtp',
  smtpHost: 'smtp.stepperslife.com',
  smtpPort: 587,
  smtpUser: 'noreply@stepperslife.com',
  smtpPassword: '',
  emailFromName: 'SteppersLife Team',
  emailFromAddress: 'noreply@stepperslife.com',
  
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireStrongPasswords: true,
  enableTwoFactor: false,
  allowPasswordReset: true,
  
  enableBlog: true,
  enableStores: true,
  enableChat: false,
  enableNotifications: true,
  enableAnalytics: true,
  enableMaintenance: false,
  
  apiRateLimit: 100,
  enableApiLogs: true,
  apiVersion: 'v1',
  enableCors: true,
  
  enableCaching: true,
  cacheTimeout: 3600,
  enableCompression: true,
  maxFileSize: 10
};

const AdminSystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('adminSystemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('adminSystemSettings', JSON.stringify(settings));
      
      toast.success('System settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test email sent successfully to ' + settings.adminEmail);
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleMaintenanceToggle = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enableMaintenance: enabled }));
    if (enabled) {
      toast.warning('Maintenance mode enabled - site will be unavailable to users');
    } else {
      toast.success('Maintenance mode disabled - site is now accessible');
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure platform-wide settings and integrations
          </p>
        </div>
        <div className="flex gap-2">
          {settings.enableMaintenance && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Maintenance Mode
            </Badge>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                
                <div>
                  <Label>Site URL</Label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <Label>Admin Email</Label>
                  <Input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => updateSetting('adminEmail', e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                
                <div>
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Site Description</Label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">New users must verify email</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email Provider</Label>
                  <Select value={settings.emailProvider} onValueChange={(value) => updateSetting('emailProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="aws">AWS SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>

                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>

                <div>
                  <Label>SMTP Username</Label>
                  <Input
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting('smtpUser', e.target.value)}
                    placeholder="username@example.com"
                  />
                </div>

                <div>
                  <Label>From Name</Label>
                  <Input
                    value={settings.emailFromName}
                    onChange={(e) => updateSetting('emailFromName', e.target.value)}
                    placeholder="Your App Name"
                  />
                </div>

                <div>
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    value={settings.emailFromAddress}
                    onChange={(e) => updateSetting('emailFromAddress', e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>

              <div>
                <Label>SMTP Password</Label>
                <Input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                  placeholder="Enter SMTP password"
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {testingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>

                <div>
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>

                <div>
                  <Label>Password Min Length</Label>
                  <Input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Strong Passwords</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enforce uppercase, lowercase, numbers, symbols</p>
                  </div>
                  <Switch
                    checked={settings.requireStrongPasswords}
                    onCheckedChange={(checked) => updateSetting('requireStrongPasswords', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow users to enable 2FA</p>
                  </div>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Password Reset</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Users can reset forgotten passwords</p>
                  </div>
                  <Switch
                    checked={settings.allowPasswordReset}
                    onCheckedChange={(checked) => updateSetting('allowPasswordReset', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Blog System</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable blog posts and articles</p>
                  </div>
                  <Switch
                    checked={settings.enableBlog}
                    onCheckedChange={(checked) => updateSetting('enableBlog', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Store Directory</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable store listings and directory</p>
                  </div>
                  <Switch
                    checked={settings.enableStores}
                    onCheckedChange={(checked) => updateSetting('enableStores', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Chat System</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable real-time messaging</p>
                  </div>
                  <Switch
                    checked={settings.enableChat}
                    onCheckedChange={(checked) => updateSetting('enableChat', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable push notification system</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable user behavior tracking</p>
                  </div>
                  <Switch
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-red-600 dark:text-red-400">Maintenance Mode</Label>
                    <p className="text-sm text-red-600 dark:text-red-400">Site unavailable to users (admins only)</p>
                  </div>
                  <Switch
                    checked={settings.enableMaintenance}
                    onCheckedChange={handleMaintenanceToggle}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Rate Limit (requests/minute)</Label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                    min="10"
                    max="1000"
                  />
                </div>

                <div>
                  <Label>API Version</Label>
                  <Select value={settings.apiVersion} onValueChange={(value) => updateSetting('apiVersion', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">Version 1</SelectItem>
                      <SelectItem value="v2">Version 2 (Beta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable API Logging</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Log all API requests and responses</p>
                  </div>
                  <Switch
                    checked={settings.enableApiLogs}
                    onCheckedChange={(checked) => updateSetting('enableApiLogs', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable CORS</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow cross-origin requests</p>
                  </div>
                  <Switch
                    checked={settings.enableCors}
                    onCheckedChange={(checked) => updateSetting('enableCors', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Performance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cache Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.cacheTimeout}
                    onChange={(e) => updateSetting('cacheTimeout', parseInt(e.target.value))}
                    min="300"
                    max="86400"
                  />
                </div>

                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Caching</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cache responses for better performance</p>
                  </div>
                  <Switch
                    checked={settings.enableCaching}
                    onCheckedChange={(checked) => updateSetting('enableCaching', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Compression</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compress responses to reduce bandwidth</p>
                  </div>
                  <Switch
                    checked={settings.enableCompression}
                    onCheckedChange={(checked) => updateSetting('enableCompression', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 dark:text-green-100">Database</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Connected</p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 dark:text-green-100">Email</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Configured</p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">API</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Running</p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Users</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">1,247 Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemSettings; 