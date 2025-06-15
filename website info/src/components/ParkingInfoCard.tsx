import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Clock, 
  MapPin, 
  DollarSign, 
  Navigation,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  Accessibility
} from 'lucide-react';

interface ParkingOption {
  id: string;
  name: string;
  type: 'street' | 'garage' | 'lot' | 'valet';
  distance: string;
  walkTime: string;
  availability: {
    total: number;
    available: number;
    reserved?: number;
  };
  pricing: {
    hourly?: string;
    daily?: string;
    event?: string;
    maxDaily?: string;
  };
  features: {
    covered: boolean;
    security: boolean;
    accessible: boolean;
    ev_charging: boolean;
    height_limit?: string;
  };
  hours: {
    weekday: string;
    weekend: string;
    restrictions?: string;
  };
  realTimeUpdates: boolean;
  reservationUrl?: string;
  coordinates: { lat: number; lng: number };
}

interface ParkingInfoCardProps {
  destination: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  userLocation?: { lat: number; lng: number } | null;
  eventDate?: string;
  onParkingSelect?: (parking: ParkingOption) => void;
  className?: string;
}

const ParkingInfoCard: React.FC<ParkingInfoCardProps> = ({
  destination,
  userLocation,
  eventDate,
  onParkingSelect,
  className = ""
}) => {
  const [parkingOptions, setParkingOptions] = useState<ParkingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParking, setSelectedParking] = useState<string | null>(null);

  // Mock parking data (in real app, would fetch from parking APIs)
  const mockParkingData: ParkingOption[] = [
    {
      id: 'garage-1',
      name: 'Millennium Park Garage',
      type: 'garage',
      distance: '0.2 mi',
      walkTime: '3 min',
      availability: {
        total: 2308,
        available: 847,
        reserved: 45
      },
      pricing: {
        hourly: '$3.25',
        daily: '$35',
        event: '$25',
        maxDaily: '$35'
      },
      features: {
        covered: true,
        security: true,
        accessible: true,
        ev_charging: true,
        height_limit: '6\'8"'
      },
      hours: {
        weekday: '5:30 AM - 1:00 AM',
        weekend: '6:00 AM - 1:00 AM',
        restrictions: 'No restrictions'
      },
      realTimeUpdates: true,
      reservationUrl: 'https://chicago.spothero.com/millennium-park',
      coordinates: { lat: 41.8819, lng: -87.6278 }
    },
    {
      id: 'lot-1',
      name: 'Grant Park North Lot',
      type: 'lot',
      distance: '0.4 mi',
      walkTime: '6 min',
      availability: {
        total: 425,
        available: 89
      },
      pricing: {
        hourly: '$2.50',
        daily: '$22',
        event: '$18'
      },
      features: {
        covered: false,
        security: true,
        accessible: true,
        ev_charging: false
      },
      hours: {
        weekday: '6:00 AM - 10:00 PM',
        weekend: '7:00 AM - 10:00 PM',
        restrictions: '2-hour limit on weekdays'
      },
      realTimeUpdates: true,
      coordinates: { lat: 41.8847, lng: -87.6197 }
    },
    {
      id: 'street-1',
      name: 'Washington St (Metered)',
      type: 'street',
      distance: '0.1 mi',
      walkTime: '2 min',
      availability: {
        total: 32,
        available: 8
      },
      pricing: {
        hourly: '$1.25',
        maxDaily: '$15'
      },
      features: {
        covered: false,
        security: false,
        accessible: false,
        ev_charging: false
      },
      hours: {
        weekday: '8:00 AM - 10:00 PM',
        weekend: '9:00 AM - 8:00 PM',
        restrictions: '2-hour limit, no parking during rush hour'
      },
      realTimeUpdates: false,
      coordinates: { lat: 41.8837, lng: -87.6280 }
    },
    {
      id: 'valet-1',
      name: 'Cultural Center Valet',
      type: 'valet',
      distance: '0.0 mi',
      walkTime: '1 min',
      availability: {
        total: 50,
        available: 12
      },
      pricing: {
        event: '$45',
        daily: '$55'
      },
      features: {
        covered: true,
        security: true,
        accessible: true,
        ev_charging: false
      },
      hours: {
        weekday: 'Event hours only',
        weekend: 'Event hours only',
        restrictions: 'Special events only'
      },
      realTimeUpdates: true,
      reservationUrl: 'https://venue-valet.com/cultural-center',
      coordinates: { lat: 41.8836, lng: -87.6270 }
    }
  ];

  const loadParkingData = async () => {
    setLoading(true);
    try {
      // Simulate API call with location and event-based filtering
      await new Promise(resolve => setTimeout(resolve, 800));
      setParkingOptions(mockParkingData);
    } catch (error) {
      console.error('Failed to load parking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAvailability = async () => {
    setRefreshing(true);
    try {
      // Simulate refreshing real-time availability
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock updating availability numbers
      setParkingOptions(prev => prev.map(option => ({
        ...option,
        availability: {
          ...option.availability,
          available: Math.max(0, option.availability.available + Math.floor(Math.random() * 20 - 10))
        }
      })));
    } catch (error) {
      console.error('Failed to refresh parking data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadParkingData();
  }, [destination, eventDate]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'garage': return '🏢';
      case 'lot': return '🚗';
      case 'street': return '🛣️';
      case 'valet': return '🤵';
      default: return '🚗';
    }
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return { text: 'Good availability', color: 'bg-green-100 text-green-800' };
    if (percentage > 20) return { text: 'Limited availability', color: 'bg-yellow-100 text-yellow-800' };
    if (available > 0) return { text: 'Very limited', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Full', color: 'bg-red-100 text-red-800' };
  };

  const openDirections = (parking: ParkingOption) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : 'current+location';
    const dest = `${parking.coordinates.lat},${parking.coordinates.lng}`;
    const url = `https://www.google.com/maps/dir/${origin}/${dest}`;
    window.open(url, '_blank');
  };

  const reserveParking = (parking: ParkingOption) => {
    if (parking.reservationUrl) {
      window.open(parking.reservationUrl, '_blank');
    } else {
      alert('Reservation not available for this parking option');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
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
            <Car className="w-5 h-5 text-brand-primary" />
            Parking Options
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAvailability}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parking Options */}
        {parkingOptions.map((parking) => {
          const availability = getAvailabilityStatus(parking.availability.available, parking.availability.total);
          
          return (
            <div
              key={parking.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedParking === parking.id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedParking(selectedParking === parking.id ? null : parking.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getTypeIcon(parking.type)}</div>
                  <div>
                    <div className="font-medium">{parking.name}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {parking.distance} • {parking.walkTime} walk
                      </span>
                      {parking.realTimeUpdates && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Availability */}
                <div className="text-right">
                  <div className={`font-bold text-lg ${getAvailabilityColor(parking.availability.available, parking.availability.total)}`}>
                    {parking.availability.available}
                  </div>
                  <div className="text-xs text-gray-500">of {parking.availability.total}</div>
                  <Badge className={`text-xs mt-1 ${availability.color}`}>
                    {availability.text}
                  </Badge>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  {eventDate && parking.pricing.event ? (
                    <span className="font-medium text-green-600">Event: {parking.pricing.event}</span>
                  ) : (
                    <span>{parking.pricing.hourly || parking.pricing.daily}</span>
                  )}
                </div>
                {parking.pricing.maxDaily && (
                  <span className="text-gray-500">Max: {parking.pricing.maxDaily}</span>
                )}
              </div>

              {/* Features */}
              <div className="flex items-center gap-2 mb-3">
                {parking.features.covered && <Badge variant="outline" className="text-xs">🏢 Covered</Badge>}
                {parking.features.security && <Badge variant="outline" className="text-xs">🛡️ Security</Badge>}
                {parking.features.accessible && <Badge variant="outline" className="text-xs">♿ Accessible</Badge>}
                {parking.features.ev_charging && <Badge variant="outline" className="text-xs">⚡ EV Charging</Badge>}
              </div>

              {/* Expanded Details */}
              {selectedParking === parking.id && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  {/* Hours */}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Hours & Restrictions</div>
                    <div className="text-gray-600 space-y-1">
                      <div>Weekdays: {parking.hours.weekday}</div>
                      <div>Weekends: {parking.hours.weekend}</div>
                      {parking.hours.restrictions && (
                        <div className="text-orange-600">⚠️ {parking.hours.restrictions}</div>
                      )}
                    </div>
                  </div>

                  {/* Additional Features */}
                  {parking.features.height_limit && (
                    <div className="text-sm">
                      <span className="font-medium">Height Limit:</span> {parking.features.height_limit}
                    </div>
                  )}

                  {/* Detailed Pricing */}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Pricing Details</div>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      {parking.pricing.hourly && <div>Hourly: {parking.pricing.hourly}</div>}
                      {parking.pricing.daily && <div>Daily: {parking.pricing.daily}</div>}
                      {parking.pricing.event && <div>Event: {parking.pricing.event}</div>}
                      {parking.pricing.maxDaily && <div>Max Daily: {parking.pricing.maxDaily}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => openDirections(parking)}
                      className="flex-1"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                    {parking.reservationUrl ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => reserveParking(parking)}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Reserve
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onParkingSelect?.(parking)}
                        className="flex-1"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Parking Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800">Parking Tips</div>
              <div className="text-blue-700 space-y-1 mt-1">
                {eventDate && (
                  <div>• Event pricing may apply - reserve in advance for guaranteed spots</div>
                )}
                <div>• Street parking fills up quickly during events - arrive early</div>
                <div>• Check height restrictions for SUVs and trucks</div>
                <div>• Consider public transit during peak hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time update disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          🕒 Availability updated every 5 minutes • Some lots may have additional fees
        </div>
      </CardContent>
    </Card>
  );
};

export default ParkingInfoCard; 