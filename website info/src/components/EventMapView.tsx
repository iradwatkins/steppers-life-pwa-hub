import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Users, DollarSign, Star, ExternalLink, Route } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventLocation {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  city: string;
  state: string;
  price: number;
  category: string;
  attendees: number;
  capacity: number;
  instructor: string;
  skillLevel: string;
  rating: number;
  description: string;
  coordinates: { lat: number; lng: number };
  featured: boolean;
  soldOut: boolean;
}

interface EventMapViewProps {
  events: EventLocation[];
  selectedEventId?: number;
  onEventSelect?: (eventId: number) => void;
  userLocation?: { lat: number; lng: number } | null;
  locationEnabled?: boolean;
  className?: string;
}

const EventMapView: React.FC<EventMapViewProps> = ({
  events,
  selectedEventId,
  onEventSelect,
  userLocation: propUserLocation,
  locationEnabled: propLocationEnabled,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(propUserLocation || null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Mock map implementation (in real app, would use Google Maps or Mapbox)
  const initializeMap = () => {
    // Simulate map loading
    setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
  };

  useEffect(() => {
    initializeMap();
    
    // Use prop location if provided, otherwise try to get location
    if (propUserLocation) {
      setUserLocation(propUserLocation);
    } else if (!propLocationEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
          // Default to Chicago if location denied
          setUserLocation({ lat: 41.8781, lng: -87.6298 });
        }
      );
    }
  }, [propUserLocation, propLocationEnabled]);

  // Update local state when props change
  useEffect(() => {
    if (propUserLocation) {
      setUserLocation(propUserLocation);
    }
  }, [propUserLocation]);

  const handleMarkerClick = (event: EventLocation) => {
    setSelectedEvent(event);
    onEventSelect?.(event.id);
  };

  const getDirections = (event: EventLocation) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : 'current+location';
    const destination = `${event.coordinates.lat},${event.coordinates.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  const calculateDistance = (event: EventLocation): string => {
    if (!userLocation) return '';
    
    // Simple distance calculation (in real app, would use proper formula)
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = event.coordinates.lat;
    const lon2 = event.coordinates.lng;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? '<1 mi' : `${Math.round(distance)} mi`;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Competition': '#EF4444',
      'Workshop': '#3B82F6',
      'Social': '#10B981',
      'Class': '#F59E0B',
      'Performance': '#8B5CF6',
      'Convention': '#EC4899'
    };
    return colors[category] || '#6B7280';
  };

  if (!mapLoaded) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Map Area */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                Event Locations ({events.length})
              </span>
              {userLocation && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  GPS Enabled
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              ref={mapRef}
              className="h-96 lg:h-[500px] bg-gray-100 relative overflow-hidden rounded-b-lg"
            >
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-repeat" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000" fill-opacity="0.05"%3E%3Cpath d="M0 0h20v20H0zM20 20h20v20H20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                  }}></div>
                </div>
              </div>

              {/* User Location Marker */}
              {userLocation && (
                <div
                  className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                  title="Your Location"
                >
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                </div>
              )}

              {/* Event Markers */}
              {events.map((event, index) => {
                // Mock positioning based on coordinates (in real app, would use proper map projection)
                const left = Math.min(Math.max((event.coordinates.lng + 100) * 3, 10), 90);
                const top = Math.min(Math.max((50 - event.coordinates.lat) * 2, 10), 85);

                return (
                  <div
                    key={event.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 z-20 ${
                      selectedEvent?.id === event.id ? 'scale-125 z-30' : ''
                    }`}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`
                    }}
                    onClick={() => handleMarkerClick(event)}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                      title={event.title}
                    >
                      {event.featured ? '★' : index + 1}
                    </div>
                    
                    {/* Price Tag */}
                    <div className="absolute -top-2 -right-2 bg-white rounded-full px-1 py-0.5 text-xs font-medium border shadow-sm">
                      ${event.price}
                    </div>
                  </div>
                );
              })}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                <h4 className="text-sm font-medium mb-2">Event Types</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries({
                    'Competition': '#EF4444',
                    'Workshop': '#3B82F6',
                    'Social': '#10B981',
                    'Class': '#F59E0B',
                    'Performance': '#8B5CF6',
                    'Convention': '#EC4899'
                  }).map(([category, color]) => (
                    <div key={category} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span>{category}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button size="sm" variant="outline" className="bg-white shadow-lg">
                  <Navigation className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-white shadow-lg">
                  +
                </Button>
                <Button size="sm" variant="outline" className="bg-white shadow-lg">
                  -
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Sidebar */}
      <div className="space-y-4">
        {selectedEvent ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge style={{ backgroundColor: getCategoryColor(selectedEvent.category) }}>
                      {selectedEvent.category}
                    </Badge>
                    {selectedEvent.featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                    {selectedEvent.soldOut && (
                      <Badge variant="destructive">Sold Out</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-primary">${selectedEvent.price}</div>
                  {userLocation && (
                    <div className="text-sm text-gray-500">{calculateDistance(selectedEvent)}</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <div>{selectedEvent.location}</div>
                    <div className="text-gray-500">{selectedEvent.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{selectedEvent.attendees} attending • {selectedEvent.capacity} capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span>{selectedEvent.rating} rating • {selectedEvent.instructor}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {selectedEvent.description}
              </div>

              <div className="space-y-2 pt-2">
                <Button asChild className="w-full">
                  <Link to={`/event/${selectedEvent.id}/tickets`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Event Details
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => getDirections(selectedEvent)}
                  >
                    <Route className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button 
                    variant="outline" 
                    asChild
                    className="w-full"
                  >
                    <Link to={`/venue/${selectedEvent.location.replace(/\s+/g, '-').toLowerCase()}`}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Venue Info
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Click on a map marker to view event details</p>
            </CardContent>
          </Card>
        )}

        {/* Nearby Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEvent?.id === event.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleMarkerClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.location} • {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(event.category) }}
                        ></div>
                        <span className="text-xs text-gray-600">{event.category}</span>
                        {userLocation && (
                          <span className="text-xs text-gray-500">• {calculateDistance(event)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">${event.price}</div>
                      {event.featured && (
                        <Star className="w-3 h-3 text-yellow-500 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventMapView; 