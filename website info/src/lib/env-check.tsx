import React, { useState } from 'react';
import { getAllEnv } from './env';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const AuthDiagnosticComponent: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const envVars = getAllEnv();

  // Check for critical environment variables
  const criticalVars = [
    { key: 'VITE_SUPABASE_URL', value: envVars.VITE_SUPABASE_URL },
    { key: 'VITE_SUPABASE_ANON_KEY', value: envVars.VITE_SUPABASE_ANON_KEY },
    { key: 'VITE_API_URL', value: envVars.VITE_API_URL },
  ];

  const isSupabaseConfigured = !!envVars.VITE_SUPABASE_URL && !!envVars.VITE_SUPABASE_ANON_KEY;
  
  // Check network connectivity
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'online' | 'offline'>(
    navigator.onLine ? 'online' : 'offline'
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Copied to clipboard');
      },
      (err) => {
        toast.error('Could not copy: ' + err);
      }
    );
  };

  const getSystemInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      connectionType: (navigator as any).connection?.type || 'unknown',
      connectionSpeed: (navigator as any).connection?.effectiveType || 'unknown',
    };
  };

  const systemInfo = getSystemInfo();

  return (
    <Card className="w-full border-warning-border bg-warning-light text-warning-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Authentication Diagnostic Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <h3 className="font-medium">Critical Configuration Check</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>Supabase Configuration:</div>
            <div className="flex items-center">
              {isSupabaseConfigured ? (
                <Check className="h-4 w-4 text-success mr-1" />
              ) : (
                <AlertCircle className="h-4 w-4 text-error mr-1" />
              )}
              {isSupabaseConfigured ? 'Configured' : 'Missing or incomplete'}
            </div>
            
            <div>Network Status:</div>
            <div className="flex items-center">
              {networkStatus === 'online' ? (
                <Check className="h-4 w-4 text-success mr-1" />
              ) : (
                <AlertCircle className="h-4 w-4 text-error mr-1" />
              )}
              {networkStatus === 'online' ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Detailed Diagnostic Information
        </Button>
        
        {showDetails && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Environment Variables</h3>
              <div className="bg-surface-card p-2 rounded text-xs font-mono overflow-x-auto">
                {criticalVars.map(({ key, value }) => (
                  <div key={key} className="flex justify-between items-start gap-4">
                    <span>{key}:</span>
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[200px]">
                        {value ? 
                          (key.includes('KEY') ? 
                            value.substring(0, 10) + '...' + value.substring(value.length - 5) 
                            : value) 
                          : 'Not set'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={() => copyToClipboard(value || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">System Information</h3>
              <div className="bg-surface-card p-2 rounded text-xs font-mono overflow-x-auto">
                {Object.entries(systemInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="truncate max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-xs italic">
              This information is useful for troubleshooting authentication issues.
              Share this with support if you need assistance.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDiagnosticComponent; 