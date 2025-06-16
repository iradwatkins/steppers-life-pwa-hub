import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeviceSecurity } from '@/hooks/useDeviceSecurity';
import { 
  Shield, 
  Fingerprint, 
  Smartphone, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Eye
} from 'lucide-react';

export const DeviceSecurityStatus: React.FC = () => {
  const { capabilities, isSecureContext, isDeviceSecure } = useDeviceSecurity();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Device Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Secure Context</span>
            <Badge variant={isSecureContext ? "default" : "destructive"}>
              {isSecureContext ? "✓ HTTPS" : "⚠ Not Secure"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1">
              <Fingerprint className="w-4 h-4" />
              Biometric Auth
            </span>
            <Badge variant={capabilities.biometric ? "default" : "secondary"}>
              {capabilities.biometric ? "Available" : "Not Available"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Touch/Face ID
            </span>
            <Badge variant={capabilities.touchId || capabilities.faceId ? "default" : "secondary"}>
              {capabilities.touchId || capabilities.faceId ? "Supported" : "Not Supported"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              WebAuthn
            </span>
            <Badge variant={capabilities.webauthn ? "default" : "secondary"}>
              {capabilities.webauthn ? "Available" : "Not Available"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Device Credentials
            </span>
            <Badge variant={capabilities.deviceCredentials ? "default" : "secondary"}>
              {capabilities.deviceCredentials ? "Available" : "Not Available"}
            </Badge>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              {isDeviceSecure ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
              <span className="text-sm font-medium">
                Device Security: {isDeviceSecure ? "Enhanced" : "Standard"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DeviceAuthButton: React.FC<{
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: "biometric" | "webauthn" | "device";
  children?: React.ReactNode;
}> = ({ onSuccess, onError, variant = "device", children }) => {
  const { 
    capabilities, 
    isSecureContext,
    authenticateWithBiometrics,
    authenticateWithWebAuthn,
    requestDeviceAuthentication 
  } = useDeviceSecurity();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthentication = async () => {
    if (!isSecureContext) {
      onError?.("Secure context required for device authentication");
      return;
    }

    setIsAuthenticating(true);
    
    try {
      let success = false;
      
      switch (variant) {
        case "biometric":
          if (!capabilities.biometric) {
            onError?.("Biometric authentication not available");
            return;
          }
          success = await authenticateWithBiometrics();
          break;
          
        case "webauthn":
          if (!capabilities.webauthn) {
            onError?.("WebAuthn not available");
            return;
          }
          success = await authenticateWithWebAuthn();
          break;
          
        case "device":
        default:
          success = await requestDeviceAuthentication();
          break;
      }
      
      if (success) {
        onSuccess?.();
      } else {
        onError?.("Authentication failed or cancelled");
      }
    } catch (error) {
      onError?.(`Authentication error: ${error}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getButtonIcon = () => {
    switch (variant) {
      case "biometric":
        return <Fingerprint className="w-4 h-4" />;
      case "webauthn":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    if (isAuthenticating) return "Authenticating...";
    
    switch (variant) {
      case "biometric":
        return "Biometric Auth";
      case "webauthn":
        return "Device Auth";
      default:
        return "Authenticate";
    }
  };

  return (
    <Button
      onClick={handleAuthentication}
      disabled={isAuthenticating || !isSecureContext}
      variant="outline"
      className="w-full"
    >
      {getButtonIcon()}
      <span className="ml-2">{children || getButtonText()}</span>
    </Button>
  );
};

export const SecureActionWrapper: React.FC<{
  children: React.ReactNode;
  requireAuth?: boolean;
  authMessage?: string;
}> = ({ children, requireAuth = true, authMessage = "This action requires device authentication" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!requireAuth);
  const [authError, setAuthError] = useState<string | null>(null);
  const { isDeviceSecure } = useDeviceSecurity();

  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Authentication Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-muted-foreground">{authMessage}</p>
        
        <div className="space-y-2">
          {isDeviceSecure && (
            <DeviceAuthButton
              variant="device"
              onSuccess={() => {
                setIsAuthenticated(true);
                setAuthError(null);
              }}
              onError={setAuthError}
            >
              Authenticate with Device
            </DeviceAuthButton>
          )}
          
          <DeviceAuthButton
            variant="webauthn"
            onSuccess={() => {
              setIsAuthenticated(true);
              setAuthError(null);
            }}
            onError={setAuthError}
          >
            Use Security Key
          </DeviceAuthButton>
        </div>
      </CardContent>
    </Card>
  );
};