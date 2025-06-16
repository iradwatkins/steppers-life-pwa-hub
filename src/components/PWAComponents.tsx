import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { Download, RefreshCw, Wifi, WifiOff, Smartphone } from 'lucide-react';

export const PWAStatus: React.FC = () => {
  const { isOnline, isInstalled, needRefresh, updateServiceWorker } = usePWA();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"}>
        {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      
      {isInstalled && (
        <Badge variant="secondary">
          <Smartphone className="w-3 h-3 mr-1" />
          Installed
        </Badge>
      )}
      
      {needRefresh && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => updateServiceWorker(true)}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Update
        </Button>
      )}
    </div>
  );
};

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installPWA } = usePWA();

  if (!isInstallable) return null;

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Install Steppers Life
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Install the app for a better experience with offline access and native features.
        </p>
        <Button onClick={installPWA} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
};

export const PWAUpdatePrompt: React.FC = () => {
  const { needRefresh, updateServiceWorker } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!needRefresh) return null;

  const handleUpdate = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      console.log('User clicked update button');
      
      // Set a timeout to ensure we don't get stuck (shorter for dev mode)
      const updateTimeout = setTimeout(() => {
        console.log('Update timeout - forcing reload');
        window.location.reload();
      }, 2000);
      
      await updateServiceWorker(true);
      clearTimeout(updateTimeout);
      
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      // Fallback: force reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Card className="m-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <RefreshCw className="w-5 h-5" />
          Update Available
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
          A new version of the app is available. Update now for the latest features and improvements.
        </p>
        <Button 
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Updating...' : 'Update & Reload'}
        </Button>
      </CardContent>
    </Card>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm z-50">
      <WifiOff className="w-4 h-4 inline mr-2" />
      You're offline. Some features may be limited.
    </div>
  );
};