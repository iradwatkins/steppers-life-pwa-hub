import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';

const AppInstallPage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installationAttempts, setInstallationAttempts] = useState(0);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);
  const { 
    isInstallable, 
    isInstalled, 
    isInstalling, 
    install, 
    getInstallInstructions,
    deviceInfo
  } = usePWAInstall();

  // Main install handler
  const handlePlatformInstall = async () => {
    setInstallationAttempts(prev => prev + 1);
    const attemptNumber = installationAttempts + 1;
    console.log(`🚀 Install attempt #${attemptNumber} started`);
    
    // Show download message immediately
    setShowDownloadMessage(true);
    
    // Force user engagement for instant install
    sessionStorage.setItem('pwa-engagement', 'true');
    sessionStorage.setItem('user-interacted', 'true');
    localStorage.setItem('pwa-visited', 'true');
    
    // Check if we're in development mode
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      // Offer mock install for development
      if (typeof window.mockPWAInstall === 'function') {
        setShowDownloadMessage(false);
        toast.info('Development Mode', {
          description: 'Using mock install. In production, real PWA install will be used.',
          duration: 5000,
        });
        window.mockPWAInstall();
        return;
      }
    }
    
    // Check if we have HTTPS (required for PWA)
    if (!window.location.protocol.includes('https') && !isDevelopment) {
      console.error('❌ PWA requires HTTPS in production');
      toast.error('HTTPS Required', {
        description: 'PWA installation requires HTTPS (secure connection)',
        duration: 5000,
      });
      setShowDownloadMessage(false);
      return;
    }
    
    // Check if service worker is available
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      toast.error('Browser Not Supported', {
        description: 'Your browser does not support PWA installation',
        duration: 5000,
      });
      setShowDownloadMessage(false);
      return;
    }
    
    try {
      console.log('⚡ Attempting PWA install...');
      
      const success = await install();
      
      if (success) {
        console.log('✅ PWA install successful!');
        
        // Enhanced success message for different platforms
        if (deviceInfo.isAndroid) {
          toast.success('🎉 Added to Home Screen!', {
            description: 'SteppersLife has been added to your Android home screen. Look for the app icon!',
            duration: 8000,
          });
        } else if (deviceInfo.isIOS) {
          toast.success('🎉 iOS Installation Started!', {
            description: 'Use Safari\'s Share button (□↗) and select "Add to Home Screen" to complete installation.',
            duration: 10000,
          });
        } else {
          toast.success('🎉 Installation Started!', {
            description: 'The app is being installed. Check your desktop or app menu in a moment.',
            duration: 5000,
          });
        }
        
        // Hide the download message after successful install
        setTimeout(() => {
          setShowDownloadMessage(false);
        }, 3000);
        
      } else {
        console.log('❌ PWA install failed, showing guidance');
        setShowDownloadMessage(false);
        
        // Enhanced platform-specific guidance
        if (deviceInfo.isIOS) {
          // Enhanced iOS guidance
          if (deviceInfo.isSafari) {
            toast.info('🍎 Safari Installation Ready!', {
              description: 'Use Safari\'s Share button (□↗) at the bottom, then select "Add to Home Screen". The app will appear on your home screen!',
              duration: 12000,
            });
          } else {
            toast.info('🍎 Switch to Safari for iOS Installation', {
              description: 'For the best experience, open this page in Safari and use the Share button → "Add to Home Screen"',
              duration: 10000,
            });
          }
        } else if (deviceInfo.isAndroid) {
          toast.info('📱 Android Install Loading...', {
            description: 'Chrome is preparing the install option. Wait a few seconds and try again. The button will turn green when ready!',
            duration: 10000,
          });
        } else if (deviceInfo.isChrome) {
          toast.info('💻 Chrome Installation', {
            description: 'Look for the install icon in the address bar, or check Chrome menu → Install',
            duration: 8000,
          });
        } else {
          toast.info('🌐 Manual Installation', {
            description: 'Check your browser menu for "Install" or "Add to Home Screen" option',
            duration: 8000,
          });
        }
        
        // Fall back to scrolling to instructions
        document.getElementById('install-instructions')?.scrollIntoView({ behavior: 'smooth' });
      }
      
    } catch (error) {
      console.error('💥 Installation error:', error);
      setShowDownloadMessage(false);
      
      // Enhanced error reporting
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error('Installation Error', {
        description: `Failed to install: ${errorMessage}. Check console for details.`,
        duration: 8000,
      });
    }
  };

  useEffect(() => {
    // Online/offline detection
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const instructions = getInstallInstructions();

  // Reusable install button component
  const renderMainInstallButton = (position: 'top' | 'middle' | 'bottom') => {
    if (isInstalled) {
      return (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-800 font-medium">✅ App is already installed! You can open it from your home screen or desktop.</span>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="text-center space-y-6 relative bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-lg">
        {/* Show download message overlay if installing */}
        {showDownloadMessage && (
          <div className="absolute inset-0 bg-blue-50 border-4 border-blue-400 rounded-2xl z-10 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-blue-800 font-bold text-2xl mb-2">
                {deviceInfo.isIOS ? 'Follow Safari instructions...' : 'Download will begin shortly...'}
              </h3>
              <p className="text-blue-600 text-lg">
                {deviceInfo.isIOS 
                  ? 'Use Safari\'s Share button and select "Add to Home Screen"' 
                  : 'Please follow any browser prompts to complete installation.'}
              </p>
              <p className="text-blue-500 text-sm mt-2">
                {deviceInfo.isIOS ? '📱 Safari installation in progress!' : '✅ Installation process started!'}
              </p>
            </div>
          </div>
        )}

        {/* Installation Status Banner - Enhanced for iOS */}
        {(isInstallable || deviceInfo.isIOS) && (
          <div className={`border-2 rounded-lg p-4 mb-6 ${
            deviceInfo.isIOS 
              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300' 
              : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                deviceInfo.isIOS ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <span className={`font-bold text-lg ${
                deviceInfo.isIOS ? 'text-blue-800' : 'text-green-800'
              }`}>
                {deviceInfo.isIOS 
                  ? '🍎 Ready for iOS Installation! (Safari)'
                  : isInstallable && deviceInfo.isAndroid 
                  ? '🚀 Ready for One-Click Install! (Android)'
                  : '🚀 Ready for Installation!'}
              </span>
            </div>
            <p className={`text-center mt-2 ${
              deviceInfo.isIOS ? 'text-blue-700' : 'text-green-700'
            }`}>
              {deviceInfo.isIOS 
                ? 'Click below, then use Safari\'s Share button (□↗) → "Add to Home Screen"' 
                : deviceInfo.isAndroid 
                ? "Click below to add directly to your home screen!" 
                : "Install as a desktop app"}
            </p>
          </div>
        )}

        <Button 
          size="lg" 
          onClick={handlePlatformInstall}
          className={`h-24 w-full font-black text-2xl relative overflow-hidden transform transition-all duration-300 hover:scale-105 border-4 shadow-2xl ${
            deviceInfo.isIOS
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-600 border-blue-400 animate-pulse'
              : isInstallable 
              ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 hover:from-green-700 hover:via-emerald-700 hover:to-teal-600 border-green-400 animate-pulse' 
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 hover:from-blue-700 hover:via-purple-700 hover:to-yellow-600 border-yellow-400'
          }`}
          disabled={isInstalling}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
          <Download className="h-10 w-10 mr-6 animate-bounce" />
          <div className="text-center flex-1 relative z-10">
            <div className="font-black text-3xl mb-1">
              {isInstalling ? '🔄 INSTALLING...' : 
               deviceInfo.isIOS ? '🍎 ADD TO HOME SCREEN' :
               isInstallable ? '⚡ ADD TO HOME SCREEN' : 
               '⚡ INSTALL STEPPERS APP'}
            </div>
            <div className="text-lg opacity-95 font-bold">
              {isInstalling ? 'Please wait...' : 
               deviceInfo.isIOS ? '📱 Safari Share Button Required' :
               isInstallable && deviceInfo.isAndroid ? '📱 One-Click Android Install' :
               isInstallable ? '💻 Desktop Installation' :
               `${deviceInfo.isAndroid ? '📱 Android' : deviceInfo.isIOS ? '🍎 iOS' : deviceInfo.isMac ? '💻 Mac' : deviceInfo.isWindows ? '🖥️ Windows' : '📲 Device'} Installation`}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="text-5xl animate-bounce">
              {isInstalling ? '🔄' : 
               deviceInfo.isIOS ? '🍎' :
               isInstallable ? '🏠' : '⚡'}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
            {deviceInfo.isIOS ? 'SAFARI' : isInstallable ? 'ONE-CLICK' : 'GUIDED'}
          </div>
        </Button>

        <div className="space-y-2">
          <p className="text-gray-700 text-lg font-semibold">
            🎯 <strong>
              {deviceInfo.isIOS
                ? "Click above, then follow Safari's Share menu!"
                : isInstallable && deviceInfo.isAndroid 
                ? "Click above for instant home screen installation!" 
                : "Click above to start installation!"}
            </strong>
          </p>
          <p className="text-gray-600 text-sm">
            {deviceInfo.isIOS
              ? "Safari will show detailed instructions after clicking • Works offline • Faster than website"
              : deviceInfo.isAndroid && isInstallable 
              ? "Will show 'Add to Home Screen' dialog directly • Works offline • Faster than website"
              : "Works offline • Faster than website • Home screen access"}
          </p>
          
          {/* Enhanced iOS-specific guidance */}
          {deviceInfo.isIOS && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🍎</span>
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">iPhone/iPad Installation Steps:</h4>
                  <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Click the big button above</li>
                    <li>Look for Safari's <strong>Share button</strong> (□↗) at the bottom</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Customize the name if desired, then tap <strong>"Add"</strong></li>
                    <li>Find the SteppersLife app icon on your home screen!</li>
                  </ol>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                    <strong>💡 Pro tip:</strong> The app icon will appear on your home screen just like any other app. 
                    It works offline and loads much faster than the website!
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Platform-specific guidance for Android */}
          {deviceInfo.isAndroid && !isInstallable && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
              <p className="text-blue-800 text-sm">
                <strong>Android users:</strong> Wait a few seconds for Chrome to enable one-click install. 
                You'll see the button change to green when ready!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <div className="pt-4">
          <Link to="/">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-8 w-8 text-blue-600 animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-900">
              Download SteppersLife App
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay connected with the Steppers community! Find events, buy tickets, read our magazine, and host your own stepping events.
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-600" />
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Offline Mode
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* TOP INSTALL BUTTON */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Ready to Install?</h2>
            <p className="text-lg text-gray-600">Get started with one click!</p>
          </div>
          {renderMainInstallButton('top')}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Installation Instructions */}
          <Card id="install-instructions">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">
                  {deviceInfo.isAndroid ? '🤖' : 
                   deviceInfo.isIOS ? '🍎' : 
                   deviceInfo.isMac ? '🍎' : 
                   deviceInfo.isWindows ? '🖥️' : '💻'}
                </span>
                <span>{instructions.title}</span>
              </CardTitle>
              <CardDescription>
                {deviceInfo.isIOS 
                  ? "Safari's 'Add to Home Screen' creates a full app experience on your iPhone/iPad"
                  : instructions.canAutoInstall 
                  ? "Easy automatic installation available for your device"
                  : "Follow these steps to install the app on your device"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviceInfo.isIOS && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">🍎</span>
                    <h4 className="font-bold text-blue-800">iPhone/iPad Quick Guide:</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">📱 What to Look For:</h5>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Share button (□↗) in Safari toolbar</li>
                        <li>• Usually at bottom of screen</li>
                        <li>• "Add to Home Screen" option in menu</li>
                        <li>• App icon preview will appear</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">⚡ Benefits:</h5>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Works like a native app</li>
                        <li>• Opens without Safari address bar</li>
                        <li>• Available offline for core features</li>
                        <li>• Much faster than web version</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <ol className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
              
              {deviceInfo.isIOS && deviceInfo.isSafari && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Perfect Setup!</strong> You're using Safari on iOS - this is ideal for PWA installation. 
                    The "Add to Home Screen" feature will give you the full app experience.
                  </AlertDescription>
                </Alert>
              )}
              
              {deviceInfo.isIOS && !deviceInfo.isSafari && (
                <Alert className="mt-4 bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Recommendation:</strong> For the best iOS installation experience, 
                    try opening this page in Safari and using "Add to Home Screen".
                  </AlertDescription>
                </Alert>
              )}
              
              {instructions.canAutoInstall && !deviceInfo.isIOS && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your browser supports automatic PWA installation! The app will install with one click.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* App Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>App Features</span>
              </CardTitle>
              <CardDescription>
                What you can do with the SteppersLife app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Find & Buy Event Tickets</h4>
                    <p className="text-sm text-gray-600">Discover stepping events and purchase tickets instantly</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <QrCode className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Magazine & Community News</h4>
                    <p className="text-sm text-gray-600">Read the latest on what's happening in the Steppers community</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Host Your Own Events</h4>
                    <p className="text-sm text-gray-600">Host an event. Have people buy your tickets here.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <WifiOff className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Community Connection</h4>
                    <p className="text-sm text-gray-600">Find what you need when you need it in the Steppers community</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE INSTALL BUTTON */}
        <div className="space-y-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Install Now for Better Performance</h2>
            <p className="text-lg text-gray-600">Works offline and loads 3x faster than the website</p>
          </div>
          {renderMainInstallButton('middle')}
        </div>

        {/* User Types & Features */}
        <Card>
          <CardHeader>
            <CardTitle>Join the Steppers Community</CardTitle>
            <CardDescription>
              Connect, grow, and thrive in the stepping world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <Badge className="bg-blue-100 text-blue-800">Community Member</Badge>
                <h4 className="font-medium">Start Your Journey</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Find stepping events near you</li>
                  <li>• Read our community magazine</li>
                  <li>• Connect with other steppers</li>
                  <li>• Discover classes and instructors</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <Badge className="bg-green-100 text-green-800">Event Attendee</Badge>
                <h4 className="font-medium">Get Involved</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Buy tickets to amazing events</li>
                  <li>• Easy QR code check-ins</li>
                  <li>• Track your stepping journey</li>
                  <li>• Get early access to events</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <Badge className="bg-purple-100 text-purple-800">Event Host</Badge>
                <h4 className="font-medium">Host & Lead</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Host your own stepping events</li>
                  <li>• Sell tickets through our platform</li>
                  <li>• Build your stepping community</li>
                  <li>• Access host tools & analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              <span>Why Join SteppersLife?</span>
            </CardTitle>
            <CardDescription>
              Everything you need for the stepping community experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🎟️</div>
                <h5 className="font-medium">Easy Event Access</h5>
                <p className="text-xs text-gray-600 mt-1">Find and buy tickets to stepping events instantly</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📰</div>
                <h5 className="font-medium">Community Magazine</h5>
                <p className="text-xs text-gray-600 mt-1">Stay updated with the latest stepping community news</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🎉</div>
                <h5 className="font-medium">Host Events</h5>
                <p className="text-xs text-gray-600 mt-1">Create and promote your own stepping events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/events">
            <Button 
              size="lg" 
              className="h-16 w-full"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Find Events
            </Button>
          </Link>
          
          <Link to="/magazine">
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 w-full"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Read Magazine
            </Button>
          </Link>
        </div>

        {/* BOTTOM INSTALL BUTTON */}
        <div className="space-y-4 py-8 border-t-4 border-dashed border-blue-300">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Last Chance to Install!</h2>
            <p className="text-lg text-gray-600">Don't miss out on the superior app experience</p>
          </div>
          {renderMainInstallButton('bottom')}
        </div>

        {/* Technical Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Detected:</strong> {
              deviceInfo.isAndroid ? 'Android' : 
              deviceInfo.isIOS ? 'iOS' : 
              deviceInfo.isMac ? 'Mac' : 
              deviceInfo.isWindows ? 'Windows' : 
              'Unknown'
            } • {
              deviceInfo.isChrome ? 'Chrome' : 
              deviceInfo.isSafari ? 'Safari' : 
              'Other Browser'
            } • 
            <strong>PWA Support:</strong> {instructions.canAutoInstall ? 'Full' : 'Manual'} • 
            <strong>Offline:</strong> Full functionality available without internet
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AppInstallPage; 