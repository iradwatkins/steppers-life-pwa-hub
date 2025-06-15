import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { toast } from '@/components/ui/sonner';
import {
  Settings,
  Smartphone,
  Database,
  Bell,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  User,
  LogOut,
  Info,
  AlertTriangle
} from 'lucide-react';

const PWASettingsPage: React.FC = () => {
  const {
    user,
    isOnline,
    isOfflineMode,
    refreshAuthCache,
    clearOfflineAuth,
    lastSyncTime,
    isBiometricAvailable,
    supportedBiometricTypes
  } = usePWAAuth();

  const [settings, setSettings] = useState({
    notifications: {
      checkInAlerts: true,
      syncNotifications: true,
      errorAlerts: true,
      soundEnabled: false
    },
    offline: {
      autoSync: true,
      cacheCheckIns: true,
      keepDataDays: 7
    },
    security: {
      biometricAuth: false,
      autoLock: true,
      lockTimeoutMinutes: 15
    },
    display: {
      darkMode: false,
      compactView: false,
      showTimestamps: true
    }
  });

  const handleSettingChange = (category: string, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    
    toast.success('Setting updated');
  };

  const handleClearOfflineData = () => {
    if (window.confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      clearOfflineAuth();
      localStorage.clear();
      toast.success('Offline data cleared');
    }
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      await refreshAuthCache();
      toast.success('Sync completed successfully');
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    }
  };

  const handleExportData = () => {
    // In a real app, this would export offline cached data
    const data = {
      user: user?.email,
      lastSync: lastSyncTime,
      settings: settings,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwa-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const getStorageUsage = () => {
    // Estimate storage usage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return (totalSize / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">PWA Settings</h1>
        <p className="text-gray-600">Manage your offline settings and preferences</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-500" />
            )}
            <span>Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-gray-600">
                {isOnline 
                  ? 'Connected to the internet'
                  : 'Working in offline mode'
                }
              </p>
              {lastSyncTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Last sync: {lastSyncTime.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isOfflineMode && (
                <Badge variant="secondary">Offline Mode</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceSync}
                disabled={!isOnline}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm bg-gray-50 p-2 rounded">{user?.email}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{user?.role || 'Staff'}</Badge>
              {user?.permissions && user.permissions.length > 0 && (
                <span className="text-xs text-gray-500">
                  {user.permissions.length} permissions
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Events Access</Label>
            <p className="text-sm text-gray-600">
              {user?.events?.length || 0} events assigned
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure alerts and notifications for check-in activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="checkin-alerts">Check-in Alerts</Label>
              <p className="text-sm text-gray-600">Get notified when attendees check in</p>
            </div>
            <Switch
              id="checkin-alerts"
              checked={settings.notifications.checkInAlerts}
              onCheckedChange={(checked) => 
                handleSettingChange('notifications', 'checkInAlerts', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-notifications">Sync Notifications</Label>
              <p className="text-sm text-gray-600">Notifications when data syncs</p>
            </div>
            <Switch
              id="sync-notifications"
              checked={settings.notifications.syncNotifications}
              onCheckedChange={(checked) => 
                handleSettingChange('notifications', 'syncNotifications', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="error-alerts">Error Alerts</Label>
              <p className="text-sm text-gray-600">Show error notifications</p>
            </div>
            <Switch
              id="error-alerts"
              checked={settings.notifications.errorAlerts}
              onCheckedChange={(checked) => 
                handleSettingChange('notifications', 'errorAlerts', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-enabled">Sound Effects</Label>
              <p className="text-sm text-gray-600">Play sounds for notifications</p>
            </div>
            <Switch
              id="sound-enabled"
              checked={settings.notifications.soundEnabled}
              onCheckedChange={(checked) => 
                handleSettingChange('notifications', 'soundEnabled', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>
            Manage authentication and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="biometric-auth">Biometric Authentication</Label>
              <p className="text-sm text-gray-600">
                {isBiometricAvailable 
                  ? 'Use fingerprint or face unlock'
                  : 'Biometric authentication not available'
                }
              </p>
              {supportedBiometricTypes.length > 0 && (
                <div className="flex space-x-1 mt-1">
                  {supportedBiometricTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Switch
              id="biometric-auth"
              checked={settings.security.biometricAuth}
              disabled={!isBiometricAvailable}
              onCheckedChange={(checked) => 
                handleSettingChange('security', 'biometricAuth', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-lock">Auto Lock</Label>
              <p className="text-sm text-gray-600">Automatically lock after inactivity</p>
            </div>
            <Switch
              id="auto-lock"
              checked={settings.security.autoLock}
              onCheckedChange={(checked) => 
                handleSettingChange('security', 'autoLock', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Offline Data</span>
          </CardTitle>
          <CardDescription>
            Manage cached data and offline functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync">Auto Sync</Label>
              <p className="text-sm text-gray-600">Automatically sync when online</p>
            </div>
            <Switch
              id="auto-sync"
              checked={settings.offline.autoSync}
              onCheckedChange={(checked) => 
                handleSettingChange('offline', 'autoSync', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cache-checkins">Cache Check-ins</Label>
              <p className="text-sm text-gray-600">Store check-ins locally when offline</p>
            </div>
            <Switch
              id="cache-checkins"
              checked={settings.offline.cacheCheckIns}
              onCheckedChange={(checked) => 
                handleSettingChange('offline', 'cacheCheckIns', checked)
              }
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Storage Usage</p>
                <p className="text-sm text-gray-600">{getStorageUsage()} used</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-3 h-3 mr-1" />
                Export Data
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Offline data is stored securely on your device and automatically synced when connected.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceSync}
                disabled={!isOnline}
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Force Sync
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearOfflineData}
                className="flex-1"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>PWA Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Version</p>
              <p className="text-gray-600">1.0.0</p>
            </div>
            <div>
              <p className="font-medium">Build</p>
              <p className="text-gray-600">PWA-{new Date().getFullYear()}</p>
            </div>
            <div>
              <p className="font-medium">Platform</p>
              <p className="text-gray-600">{navigator.platform}</p>
            </div>
            <div>
              <p className="font-medium">User Agent</p>
              <p className="text-gray-600 truncate" title={navigator.userAgent}>
                {navigator.userAgent.split(' ')[0]}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600">Sign Out</p>
              <p className="text-sm text-gray-600">Clear session and return to login</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  // Handle sign out
                  window.location.href = '/pwa/login';
                }
              }}
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWASettingsPage; 