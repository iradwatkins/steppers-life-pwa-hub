import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { toast } from '@/components/ui/sonner';
import { 
  Fingerprint, 
  Smartphone, 
  Shield, 
  Wifi, 
  WifiOff, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const PWALoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    loading,
    isOnline,
    isOfflineMode,
    signInWithRoles,
    authenticateWithBiometric,
    authenticateWithDevice,
    isBiometricAvailable,
    supportedBiometricTypes,
    refreshAuthCache,
    lastSyncTime
  } = usePWAAuth();

  const [activeTab, setActiveTab] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devicePin, setDevicePin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (user && !loading) {
    const from = location.state?.from?.pathname || '/pwa/dashboard';
    return <Navigate to={from} replace />;
  }

  // Handle credential-based login
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await signInWithRoles(email, password);
      if (result.success) {
        const from = location.state?.from?.pathname || '/pwa/dashboard';
        navigate(from, { replace: true });
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      setAuthError(error.message || 'An unexpected error occurred');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await authenticateWithBiometric();
      if (result.success) {
        const from = location.state?.from?.pathname || '/pwa/dashboard';
        navigate(from, { replace: true });
      } else {
        setAuthError(result.error || 'Biometric authentication failed');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Biometric authentication error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle device PIN authentication
  const handleDeviceAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devicePin || devicePin.length < 4) {
      setAuthError('Please enter a valid device PIN (at least 4 digits)');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await authenticateWithDevice(devicePin);
      if (result.success) {
        const from = location.state?.from?.pathname || '/pwa/dashboard';
        navigate(from, { replace: true });
      } else {
        setAuthError(result.error || 'Device authentication failed');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Device authentication error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle sync retry
  const handleSyncRetry = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      await refreshAuthCache();
      toast.success('Authentication data synchronized');
    } catch (error) {
      toast.error('Failed to sync authentication data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              <p className="text-sm text-muted-foreground">Loading PWA authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">SteppersLife PWA</CardTitle>
          <CardDescription>
            Secure access for event organizers and staff
          </CardDescription>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-600">Offline</span>
              </>
            )}
            
            {isOfflineMode && (
              <Badge variant="outline" className="ml-2">
                Offline Mode
              </Badge>
            )}
          </div>

          {/* Last Sync Time */}
          {lastSyncTime && (
            <div className="text-xs text-muted-foreground">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Offline Info */}
          {!isOnline && (
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You're offline. Use biometric or device authentication to access cached data.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={handleSyncRetry}
                  disabled={!isOnline}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry Sync
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                Credentials
              </TabsTrigger>
              <TabsTrigger 
                value="biometric" 
                disabled={!isBiometricAvailable}
                className="text-xs"
              >
                <Fingerprint className="w-3 h-3 mr-1" />
                Biometric
              </TabsTrigger>
              <TabsTrigger value="device" className="text-xs">
                <Smartphone className="w-3 h-3 mr-1" />
                Device
              </TabsTrigger>
            </TabsList>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-4">
              <form onSubmit={handleCredentialLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isAuthenticating || !isOnline}
                    className="h-12"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isAuthenticating || !isOnline}
                      className="h-12 pr-10"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isAuthenticating || !email || !password || !isOnline}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {!isOnline && (
                <p className="text-sm text-muted-foreground text-center">
                  Credential login requires internet connection
                </p>
              )}
            </TabsContent>

            {/* Biometric Tab */}
            <TabsContent value="biometric" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Fingerprint className="w-10 h-10 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="font-semibold">Biometric Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your fingerprint, face ID, or other biometric authentication
                  </p>
                </div>

                {supportedBiometricTypes.length > 0 && (
                  <div className="flex justify-center space-x-2">
                    {supportedBiometricTypes.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleBiometricAuth}
                  className="w-full h-12"
                  disabled={isAuthenticating || !isBiometricAvailable}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Authenticate with Biometrics
                    </>
                  )}
                </Button>

                {!isBiometricAvailable && (
                  <p className="text-sm text-muted-foreground">
                    Biometric authentication is not available on this device
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Device Tab */}
            <TabsContent value="device" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="font-semibold">Device Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your device PIN, pattern, or password
                  </p>
                </div>

                <form onSubmit={handleDeviceAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="devicePin">Device PIN</Label>
                    <Input
                      id="devicePin"
                      type="password"
                      value={devicePin}
                      onChange={(e) => setDevicePin(e.target.value)}
                      placeholder="Enter device PIN"
                      disabled={isAuthenticating}
                      className="h-12 text-center"
                      maxLength={6}
                      pattern="[0-9]*"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-12"
                    disabled={isAuthenticating || !devicePin || devicePin.length < 4}
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Device
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              For event organizers, staff, and sales agents only
            </p>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Secure PWA Authentication
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWALoginPage; 