import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bus, 
  Train, 
  Clock, 
  MapPin, 
  Navigation, 
  RefreshCw,
  AlertCircle,
  Route,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface TransitStop {
  type: 'bus' | 'train' | 'subway';
  name: string;
  distance: string;
  lines: string[];
  arrivalTimes: string[];
  delays?: string[];
}

interface TransitRoute {
  id: string;
  duration: string;
  walkTime: string;
  transfers: number;
  cost: string;
  steps: Array<{
    mode: 'walk' | 'bus' | 'train' | 'subway';
    instruction: string;
    line?: string;
    duration: string;
    distance?: string;
  }>;
  accessibility: boolean;
  realTimeUpdates: boolean;
}

interface TransitRoutingCardProps {
  destination: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  userLocation?: { lat: number; lng: number } | null;
  onRouteSelect?: (route: TransitRoute) => void;
  className?: string;
}

const TransitRoutingCard: React.FC<TransitRoutingCardProps> = ({
  destination,
  userLocation,
  onRouteSelect,
  className = ""
}) => {
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [nearbyStops, setNearbyStops] = useState<TransitStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock transit data (in real app, would fetch from transit APIs)
  const mockTransitData = {
    routes: [
      {
        id: 'route-1',
        duration: '35 min',
        walkTime: '8 min',
        transfers: 1,
        cost: '$2.50',
        steps: [
          { mode: 'walk' as const, instruction: 'Walk to Washington/State', duration: '4 min', distance: '0.2 mi' },
          { mode: 'bus' as const, instruction: 'Take Bus 20 towards Downtown', line: '20', duration: '12 min' },
          { mode: 'walk' as const, instruction: 'Transfer to Red Line', duration: '3 min', distance: '0.1 mi' },
          { mode: 'subway' as const, instruction: 'Take Red Line towards 95th/Dan Ryan', line: 'Red', duration: '8 min' },
          { mode: 'walk' as const, instruction: `Walk to ${destination.name}`, duration: '4 min', distance: '0.3 mi' }
        ],
        accessibility: true,
        realTimeUpdates: true
      },
      {
        id: 'route-2',
        duration: '42 min',
        walkTime: '12 min',
        transfers: 0,
        cost: '$2.50',
        steps: [
          { mode: 'walk' as const, instruction: 'Walk to Lake/State', duration: '6 min', distance: '0.4 mi' },
          { mode: 'train' as const, instruction: 'Take Blue Line towards O\'Hare', line: 'Blue', duration: '18 min' },
          { mode: 'walk' as const, instruction: `Walk to ${destination.name}`, duration: '6 min', distance: '0.5 mi' }
        ],
        accessibility: false,
        realTimeUpdates: true
      },
      {
        id: 'route-3',
        duration: '28 min',
        walkTime: '15 min',
        transfers: 2,
        cost: '$2.50',
        steps: [
          { mode: 'walk' as const, instruction: 'Walk to nearest bus stop', duration: '3 min', distance: '0.2 mi' },
          { mode: 'bus' as const, instruction: 'Take Bus 56 towards Goose Island', line: '56', duration: '8 min' },
          { mode: 'bus' as const, instruction: 'Transfer to Bus 124', line: '124', duration: '9 min' },
          { mode: 'walk' as const, instruction: `Walk to ${destination.name}`, duration: '8 min', distance: '0.6 mi' }
        ],
        accessibility: true,
        realTimeUpdates: false
      }
    ],
    nearbyStops: [
      {
        type: 'bus' as const,
        name: 'Washington/State',
        distance: '0.1 mi',
        lines: ['20', '56', '124'],
        arrivalTimes: ['2 min', '8 min', '15 min'],
        delays: ['On time', '+3 min', 'On time']
      },
      {
        type: 'subway' as const,
        name: 'Washington/State (Red Line)',
        distance: '0.2 mi',
        lines: ['Red'],
        arrivalTimes: ['4 min', '12 min', '20 min'],
        delays: ['On time', 'On time', '+2 min']
      },
      {
        type: 'train' as const,
        name: 'Lake (Blue/Green Line)',
        distance: '0.3 mi',
        lines: ['Blue', 'Green'],
        arrivalTimes: ['6 min', '14 min', '22 min'],
        delays: ['On time', 'On time', 'On time']
      }
    ]
  };

  const loadTransitData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoutes(mockTransitData.routes);
      setNearbyStops(mockTransitData.nearbyStops);
    } catch (error) {
      console.error('Failed to load transit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRealTimeData = async () => {
    setRefreshing(true);
    try {
      // Simulate refreshing real-time arrival data
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real app, would update arrival times and delays
    } catch (error) {
      console.error('Failed to refresh transit data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      loadTransitData();
    }
  }, [userLocation, destination]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'train':
      case 'subway': return <Train className="w-4 h-4" />;
      case 'walk': return <Navigation className="w-4 h-4" />;
      default: return <Route className="w-4 h-4" />;
    }
  };

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'bus': return <Bus className="w-5 h-5 text-blue-600" />;
      case 'train': return <Train className="w-5 h-5 text-green-600" />;
      case 'subway': return <Train className="w-5 h-5 text-red-600" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const openInTransitApp = (route: TransitRoute) => {
    // Open in Google Maps with transit directions
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : 'current+location';
    const dest = `${destination.coordinates.lat},${destination.coordinates.lng}`;
    const url = `https://www.google.com/maps/dir/${origin}/${dest}?travelmode=transit`;
    window.open(url, '_blank');
  };

  if (!userLocation) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-gray-500">Enable location to see transit options</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Train className="w-5 h-5 text-brand-primary" />
            Public Transit Routes
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshRealTimeData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Route Options</h4>
          {routes.map((route) => (
            <div
              key={route.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedRoute === route.id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-brand-primary">{route.duration}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Navigation className="w-3 h-3" />
                    {route.walkTime} walk
                  </div>
                  {route.transfers > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {route.transfers} transfer{route.transfers > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{route.cost}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {route.accessibility && <Accessibility className="w-3 h-3 text-green-600" />}
                    {route.realTimeUpdates && <Clock className="w-3 h-3 text-blue-600" />}
                  </div>
                </div>
              </div>

              {/* Route Steps */}
              <div className="flex items-center gap-2 text-xs overflow-x-auto">
                {route.steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      {getModeIcon(step.mode)}
                      <span className="text-gray-600">
                        {step.line || step.instruction.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <span className="text-gray-500">({step.duration})</span>
                    </div>
                    {index < route.steps.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {selectedRoute === route.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="space-y-2 text-sm">
                    {route.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {getModeIcon(step.mode)}
                        <div className="flex-1">
                          <div>{step.instruction}</div>
                          {step.line && (
                            <div className="text-gray-500">Line {step.line}</div>
                          )}
                        </div>
                        <div className="text-gray-500">{step.duration}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={() => openInTransitApp(route)}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRouteSelect?.(route)}
                    >
                      Select Route
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nearby Stops Real-Time Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Nearby Stops - Live Arrivals</h4>
          {nearbyStops.map((stop, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStopIcon(stop.type)}
                  <div>
                    <div className="font-medium text-sm">{stop.name}</div>
                    <div className="text-xs text-gray-500">{stop.distance} away</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {stop.lines.map((line) => (
                    <Badge key={line} variant="outline" className="text-xs">
                      {line}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                {stop.arrivalTimes.map((time, timeIndex) => (
                  <div key={timeIndex} className="flex items-center justify-between">
                    <span className="font-medium">{time}</span>
                    <span className={`${
                      stop.delays?.[timeIndex]?.includes('+') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {stop.delays?.[timeIndex] || 'On time'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Service Alerts */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">Service Alert</div>
              <div className="text-yellow-700">Red Line experiencing minor delays due to signal problems. Allow extra travel time.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransitRoutingCard; 