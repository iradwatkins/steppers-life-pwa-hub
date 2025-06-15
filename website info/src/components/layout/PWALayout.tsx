import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { toast } from '@/components/ui/sonner';
import { MobileLogo } from '@/components/ui/Logo';
import PWAInstallButton from '@/components/PWAInstallButton';
import {
  Shield,
  Home,
  QrCode,
  Users,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
  User,
  LogOut,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';

const PWALayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isOnline,
    isOfflineMode,
    hasRole,
    hasPermission,
    refreshAuthCache,
    lastSyncTime
  } = usePWAAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Navigation items based on user role and permissions
  const navigationItems = [
    {
      path: '/pwa/dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['organizer', 'event_staff', 'sales_agent']
    },
    {
      path: '/magazine',
      label: 'Magazine',
      icon: BookOpen,
      roles: ['organizer', 'event_staff', 'sales_agent']
    },
    {
      path: '/pwa/checkin',
      label: 'Check-in',
      icon: QrCode,
      roles: ['organizer', 'event_staff'],
      permission: 'check_in'
    },
    {
      path: '/pwa/attendance',
      label: 'Attendance',
      icon: Users,
      roles: ['organizer', 'event_staff'],
      permission: 'view_attendance'
    },
    {
      path: '/pwa/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['organizer'],
      permission: 'view_reports'
    },
    {
      path: '/pwa/settings',
      label: 'Settings',
      icon: Settings,
      roles: ['organizer', 'event_staff', 'sales_agent']
    }
  ];

  // Filter navigation items based on user permissions
  const visibleNavItems = navigationItems.filter(item => {
    if (!user) return false;
    
    // Check role requirement
    if (item.roles && !hasRole(item.roles as any)) return false;
    
    // Check permission requirement
    if (item.permission && !hasPermission(item.permission)) return false;
    
    return true;
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      await refreshAuthCache();
      toast.success('Data synchronized successfully');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

  const handleSignOut = () => {
    // In a real implementation, this would sign out the user
    navigate('/pwa/login');
    toast.success('Signed out successfully');
  };

  if (!user) {
    navigate('/pwa/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* PWA Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <MobileLogo />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SteppersLife</h1>
                <p className="text-xs text-gray-500">PWA Event Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Status and User Menu */}
            <div className="flex items-center space-x-3">
              {/* PWA Install Button */}
              <PWAInstallButton variant="ghost" size="sm" className="hidden sm:flex" />
              
              {/* Connection Status */}
              <div className="hidden sm:flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-600">Offline</span>
                  </>
                )}
              </div>

              {/* Sync Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={!isOnline}
                className="hidden sm:flex"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{user.role || 'User'}</Badge>
                        {isOfflineMode && (
                          <Badge variant="secondary">Offline</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSync}
                        disabled={!isOnline}
                        className="w-full justify-start px-4 py-2"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Data
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigation('/pwa/settings')}
                        className="w-full justify-start px-4 py-2"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      
                      <Separator className="my-1" />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full justify-start px-4 py-2 text-red-600 hover:text-red-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(item.path)}
                    className="w-full justify-start flex items-center space-x-3"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
              
              <Separator className="my-2" />
              
              {/* Mobile PWA Install */}
              <div className="px-3 py-2">
                <PWAInstallButton variant="outline" size="sm" className="w-full" />
              </div>
              
              {/* Mobile Status */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center space-x-2">
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
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={!isOnline}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Offline Alert */}
      {!isOnline && (
        <Alert className="mx-4 mt-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Some features may be limited.
            {lastSyncTime && (
              <span className="block text-xs mt-1">
                Last sync: {lastSyncTime.toLocaleString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Close dropdowns on outside click */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PWALayout; 