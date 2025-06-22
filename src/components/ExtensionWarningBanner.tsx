import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensionProtection } from '@/utils/extensionProtection';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';

interface ExtensionWarningBannerProps {
  onClose?: () => void;
  showOnlyIfDetected?: boolean;
}

export const ExtensionWarningBanner: React.FC<ExtensionWarningBannerProps> = ({
  onClose,
  showOnlyIfDetected = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [interferenceResult, setInterferenceResult] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this warning
    const dismissed = localStorage.getItem('extension-warning-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Check for extension interference
    const result = ExtensionProtection.detectExtensionInterference();
    setInterferenceResult(result);

    // Show banner if interference detected or if showOnlyIfDetected is false
    if (!showOnlyIfDetected || result.hasInterference) {
      setIsVisible(true);
    }
  }, [showOnlyIfDetected]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('extension-warning-dismissed', 'true');
    onClose?.();
  };

  const handleTryIncognito = () => {
    // Show instructions for incognito mode
    alert(
      'To use incognito mode:\n\n' +
      '• Chrome/Edge: Press Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)\n' +
      '• Firefox: Press Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)\n' +
      '• Safari: Press Cmd+Shift+N\n\n' +
      'Then visit this page again in the incognito window.'
    );
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Browser Extension Notice
            </h4>
            
            {interferenceResult?.hasInterference ? (
              <div className="space-y-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  We detected browser extensions that may interfere with ticket purchases:
                </p>
                
                {interferenceResult.detectedExtensions.length > 0 && (
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-md p-3">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Detected Extensions:
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {interferenceResult.detectedExtensions.join(', ')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Quick Solutions:
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    {interferenceResult.recommendations.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-amber-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Some browser extensions (like Honey, ad blockers, or shopping assistants) can interfere with ticket purchases. 
                If you experience issues, try using incognito mode or temporarily disabling extensions.
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTryIncognito}
                className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/30"
              >
                Try Incognito Mode
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/TICKET-PURCHASE-TROUBLESHOOTING.md', '_blank')}
                className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/30"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Full Guide
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/30 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 