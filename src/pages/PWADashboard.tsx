import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PWAStatus, OfflineIndicator } from '@/components/PWAComponents';
import { DeviceSecurityStatus } from '@/components/DeviceSecurityComponents';
import { PWATestButton } from '@/components/PWATestButton';
import { usePWAContext } from '@/contexts/PWAContext';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { 
  QrCode, 
  Users, 
  BarChart3, 
  CreditCard, 
  Calendar,
  Shield,
  Smartphone,
  RotateCcw
} from 'lucide-react';

const PWADashboard: React.FC = () => {
  const { user } = useAuth();
  const { canAccessPWAFeatures, syncStatus, lastSync, isOfflineReady } = usePWAContext();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!canAccessPWAFeatures) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              PWA features are only available to event organizers and staff members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = [
    {
      title: 'QR Check-in',
      description: 'Scan QR codes to check in attendees',
      icon: QrCode,
      href: '/pwa/checkin',
      available: true
    },
    {
      title: 'Attendee List',
      description: 'View and manage attendee information',
      icon: Users,
      href: '/pwa/attendees',
      available: true
    },
    {
      title: 'Live Statistics',
      description: 'Real-time event analytics and metrics',
      icon: BarChart3,
      href: '/pwa/stats',
      available: true
    },
    {
      title: 'Payment Processing',
      description: 'Process on-site payments and transactions',
      icon: CreditCard,
      href: '/pwa/payments',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="w-6 h-6" />
            Event Management PWA
          </h1>
          <PWAStatus />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Welcome, {user.user_metadata?.name || user.email}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                Status: {syncStatus}
              </div>
              {lastSync && (
                <div>
                  Last sync: {lastSync.toLocaleTimeString()}
                </div>
              )}
              {isOfflineReady && (
                <div className="text-green-600">
                  ✓ Offline ready
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Button 
                    className="w-full" 
                    disabled={!feature.available}
                    onClick={() => window.location.href = feature.href}
                  >
                    {feature.available ? 'Open' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>PWA Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>✓ Offline access</div>
                <div>✓ Push notifications</div>
                <div>✓ Camera integration</div>
                <div>✓ Real-time sync</div>
                <div>✓ Touch-optimized UI</div>
                <div>✓ Background sync</div>
              </div>
            </CardContent>
          </Card>

          <DeviceSecurityStatus />
        </div>

        {import.meta.env.DEV && <PWATestButton />}
      </div>
    </div>
  );
};

export default PWADashboard;