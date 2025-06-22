import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Navigation, Clock, CheckCircle } from 'lucide-react';

/**
 * Navigation test component to verify route changes are working
 * Only shows in development mode
 */
export const NavigationTest: React.FC = () => {
  const location = useLocation();
  const [renderCount, setRenderCount] = useState(0);
  const [lastRender, setLastRender] = useState<Date>(new Date());
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRender(new Date());
    setNavigationHistory(prev => [
      `${location.pathname}${location.search}`,
      ...prev.slice(0, 4) // Keep last 5 entries
    ]);
  }, [location.pathname, location.search, location.hash]);

  const testRoutes = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/classes', label: 'Classes' },
    { path: '/community', label: 'Community' },
    { path: '/about', label: 'About' },
    { path: '/blog', label: 'Blog' }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Navigation Test
          </CardTitle>
          <CardDescription className="text-xs">
            Development mode only - Testing route changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Route Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium">Current Route:</div>
            <Badge variant="outline" className="text-xs">
              {location.pathname}
            </Badge>
          </div>

          {/* Render Stats */}
          <div className="flex items-center gap-2 text-xs">
            <RefreshCw className="h-3 w-3" />
            <span>Renders: {renderCount}</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>{lastRender.toLocaleTimeString()}</span>
          </div>

          {/* Navigation History */}
          {navigationHistory.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium">Recent Navigation:</div>
              <div className="space-y-1">
                {navigationHistory.map((route, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index === 0 && <CheckCircle className="h-3 w-3 text-green-500" />}
                    <span className={`text-xs ${index === 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                      {route}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Links */}
          <div className="space-y-2">
            <div className="text-xs font-medium">Test Navigation:</div>
            <div className="grid grid-cols-2 gap-1">
              {testRoutes.map((route) => (
                <Button
                  key={route.path}
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                >
                  <Link to={route.path}>{route.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Force Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            className="w-full h-6 text-xs"
            onClick={() => window.location.reload()}
          >
            Force Page Refresh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationTest; 