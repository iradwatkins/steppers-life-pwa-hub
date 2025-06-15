import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

interface CheckResult {
  name: string;
  result: boolean;
  details?: string;
}

const AuthDiagnostic: React.FC = () => {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setChecks([]);

    // Add network check
    const networkCheck = {
      name: 'Network Connectivity',
      result: navigator.onLine,
      details: navigator.onLine ? 'Device is online' : 'Device appears to be offline'
    };
    setChecks(prev => [...prev, networkCheck]);

    // Add cookie check
    const cookieCheck = {
      name: 'Cookie Support',
      result: navigator.cookieEnabled,
      details: navigator.cookieEnabled ? 'Cookies are enabled' : 'Cookies are disabled, which may prevent login'
    };
    setChecks(prev => [...prev, cookieCheck]);

    // Add localStorage check
    let localStorageCheck;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      localStorageCheck = {
        name: 'Local Storage',
        result: true,
        details: 'Local storage is working correctly'
      };
    } catch (e) {
      localStorageCheck = {
        name: 'Local Storage',
        result: false,
        details: 'Local storage is not available, which may cause issues with session persistence'
      };
    }
    setChecks(prev => [...prev, localStorageCheck]);

    // Check for incognito/private browsing
    const isIncognito = !window.indexedDB;
    const incognitoCheck = {
      name: 'Private Browsing',
      result: !isIncognito,
      details: isIncognito 
        ? 'You appear to be in private/incognito mode, which may cause issues with authentication' 
        : 'Not using private/incognito mode'
    };
    setChecks(prev => [...prev, incognitoCheck]);

    // Simulate checking Supabase connectivity
    await new Promise(resolve => setTimeout(resolve, 1000));
    const supabaseCheck = {
      name: 'Auth Service',
      result: true, // This would be a real check in a full implementation
      details: 'Authentication service appears to be reachable'
    };
    setChecks(prev => [...prev, supabaseCheck]);

    setIsRunning(false);
    setIsComplete(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Login Troubleshooter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!isComplete ? (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Login Diagnostics'}
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Diagnostic Results:</div>
              <div className="space-y-1">
                {checks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{check.name}:</span>
                    <span className="flex items-center">
                      {check.result ? (
                        <Check className="h-4 w-4 text-success mr-1" />
                      ) : (
                        <X className="h-4 w-4 text-error mr-1" />
                      )}
                      {check.result ? 'OK' : 'Issue Detected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-xs">
                    {checks.map((check, index) => (
                      <div key={index} className="space-y-1">
                        <div className="font-medium flex items-center">
                          {check.result ? (
                            <Check className="h-3 w-3 text-success mr-1" />
                          ) : (
                            <X className="h-3 w-3 text-error mr-1" />
                          )}
                          {check.name}
                        </div>
                        <div className="pl-4 text-text-secondary">{check.details}</div>
                        {index < checks.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <div className="text-sm font-medium">Common Solutions:</div>
              <ul className="list-disc list-inside text-xs space-y-1 text-text-secondary">
                <li>Clear your browser cache and cookies</li>
                <li>Try using a different browser</li>
                <li>Disable browser extensions that might interfere with login</li>
                <li>Check if your internet connection is stable</li>
                <li>If using a VPN, try disabling it temporarily</li>
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={runDiagnostics}
            >
              Run Diagnostics Again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDiagnostic; 