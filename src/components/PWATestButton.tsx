import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw, Zap } from 'lucide-react';

export const PWATestButton: React.FC = () => {
  const { needRefresh, updateServiceWorker } = usePWA();
  const [isSimulating, setIsSimulating] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);

  const simulateUpdate = async () => {
    setIsSimulating(true);
    console.log('🧪 Simulating PWA update...');
    
    try {
      // Force trigger an update check
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log('🔄 Checking for updates...');
          await registration.update();
          console.log('✅ Update check complete');
        }
      }
      
      // Test update mechanism
      if (needRefresh) {
        console.log('🚀 Update available, testing update mechanism...');
        await updateServiceWorker(true);
      } else {
        console.log('ℹ️ No updates available at this time');
      }
    } catch (error) {
      console.error('❌ Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="m-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Zap className="w-5 h-5" />
          PWA Update Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-green-600 dark:text-green-400">
          <p>Current status: {needRefresh || forceRefresh ? 'Update available' : 'Up to date'}</p>
          <p>Service Worker: {navigator.serviceWorker ? 'Supported' : 'Not supported'}</p>
          <p>Mode: Development (simulated updates)</p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={simulateUpdate}
            disabled={isSimulating}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Testing...' : 'Test Update Mechanism'}
          </Button>
          
          <Button 
            onClick={() => setForceRefresh(!forceRefresh)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {forceRefresh ? 'Hide Update Prompt' : 'Show Update Prompt'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
};