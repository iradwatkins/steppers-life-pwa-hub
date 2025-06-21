import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Map as MapIcon, 
  MapPin, 
  Navigation, 
  Layers, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  DollarSign,
  Users,
  Star,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Grid3X3,
  List,
  ChevronRight,
  Info,
  Heart,
  Share,
  Bookmark,
  Route,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatLocation, calculateDistance, type LocationData } from '@/utils/geolocation';
import { cn } from '@/lib/utils';

interface EventMapViewProps {
  events: EventWithMapData[];
  userLocation?: LocationData | null;
  onEventSelect?: (event: EventWithMapData) => void;
  onLocationChange?: (location: LocationData) => void;
  className?: string;
  height?: string | number;
  showFilters?: boolean;
  showSearch?: boolean;
  showControls?: boolean;
  centerOnUserLocation?: boolean;
}

export interface EventWithMapData {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  price_min?: number;
  price_max?: number;
  capacity?: number;
  venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    venue_type?: string;
    rating?: number;
  };
  organizer?: {
    id: string;
    name: string;
    verified?: boolean;
    rating?: number;
  };
  categories?: string[];
  featured?: boolean;
  distance?: number;
  tickets_available?: boolean;
}

interface MapMarker {
  id: string;
  event: EventWithMapData;
  lat: number;
  lng: number;
  isSelected: boolean;
  isHovered: boolean;
  cluster?: {
    count: number;
    events: EventWithMapData[];
  };
}

interface MapFilters {
  showOnlyFeatured: boolean;
  showOnlyAvailable: boolean;
  categories: string[];
  priceRange: [number, number];
  dateRange: string;
  venueTypes: string[];
  showClusters: boolean;
}

const EventMapView: React.FC<EventMapViewProps> = ({
  events,
  userLocation,
  onEventSelect,
  onLocationChange,
  className,
  height = 400,
  showFilters = true,
  showSearch = true,
  showControls = true,
  centerOnUserLocation = true
}) => {
  const [selectedEvent, setSelectedEvent] = useState<EventWithMapData | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<EventWithMapData | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: userLocation?.latitude || 41.8781, // Default to Chicago
    lng: userLocation?.longitude || -87.6298
  });
  const [mapZoom, setMapZoom] = useState(10);
  const [viewMode, setViewMode] = useState<'map' | 'satellite' | 'terrain'>('map');
  const [filters, setFilters] = useState<MapFilters>({
    showOnlyFeatured: false,
    showOnlyAvailable: true,
    categories: [],
    priceRange: [0, 500],
    dateRange: 'all',
    venueTypes: [],
    showClusters: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(searchLower) ||
          event.venue?.name.toLowerCase().includes(searchLower) ||
          event.venue?.city.toLowerCase().includes(searchLower) ||
          event.organizer?.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Featured filter
      if (filters.showOnlyFeatured && !event.featured) return false;

      // Available tickets filter
      if (filters.showOnlyAvailable && !event.tickets_available) return false;

      // Category filter
      if (filters.categories.length > 0) {
        const hasMatchingCategory = event.categories?.some(cat => 
          filters.categories.includes(cat)
        );
        if (!hasMatchingCategory) return false;
      }

      // Price filter
      const eventPrice = event.price_min || 0;
      if (eventPrice < filters.priceRange[0] || eventPrice > filters.priceRange[1]) {
        return false;
      }

      // Date filter
      if (filters.dateRange !== 'all') {
        const eventDate = new Date(event.event_date);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            if (eventDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (eventDate > weekFromNow) return false;
            break;
          case 'month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            if (eventDate > monthFromNow) return false;
            break;
        }
      }

      // Venue type filter
      if (filters.venueTypes.length > 0) {
        if (!event.venue?.venue_type || !filters.venueTypes.includes(event.venue.venue_type)) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchTerm, filters]);

  // Create map markers from filtered events
  const markers = useMemo(() => {
    const mapMarkers: MapMarker[] = [];
    
    filteredEvents.forEach(event => {
      if (event.venue?.latitude && event.venue?.longitude) {
        mapMarkers.push({
          id: event.id,
          event,
          lat: event.venue.latitude,
          lng: event.venue.longitude,
          isSelected: selectedEvent?.id === event.id,
          isHovered: hoveredEvent?.id === event.id
        });
      }
    });

    // Apply clustering if enabled
    if (filters.showClusters) {
      return clusterMarkers(mapMarkers);
    }

    return mapMarkers;
  }, [filteredEvents, selectedEvent, hoveredEvent, filters.showClusters]);

  // Update map center when user location changes
  useEffect(() => {
    if (centerOnUserLocation && userLocation?.latitude && userLocation?.longitude) {
      setMapCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude
      });
    }
  }, [userLocation, centerOnUserLocation]);

  const clusterMarkers = (markers: MapMarker[]): MapMarker[] => {
    // Simple clustering algorithm - group markers within ~1km of each other
    const clustered: MapMarker[] = [];
    const processed = new Set<string>();
    const clusterDistance = 0.01; // ~1km in degrees

    markers.forEach(marker => {
      if (processed.has(marker.id)) return;

      const nearby = markers.filter(other => {
        if (processed.has(other.id) || other.id === marker.id) return false;
        
        const distance = Math.sqrt(
          Math.pow(marker.lat - other.lat, 2) + Math.pow(marker.lng - other.lng, 2)
        );
        
        return distance < clusterDistance;
      });

      if (nearby.length > 0) {
        // Create cluster
        const clusterEvents = [marker.event, ...nearby.map(m => m.event)];
        const avgLat = clusterEvents.reduce((sum, e) => sum + (e.venue?.latitude || 0), 0) / clusterEvents.length;
        const avgLng = clusterEvents.reduce((sum, e) => sum + (e.venue?.longitude || 0), 0) / clusterEvents.length;

        clustered.push({
          id: `cluster-${marker.id}`,
          event: marker.event, // Use first event as representative
          lat: avgLat,
          lng: avgLng,
          isSelected: false,
          isHovered: false,
          cluster: {
            count: clusterEvents.length,
            events: clusterEvents
          }
        });

        // Mark all as processed
        processed.add(marker.id);
        nearby.forEach(m => processed.add(m.id));
      } else {
        // Single marker
        clustered.push(marker);
        processed.add(marker.id);
      }
    });

    return clustered;
  };

  const handleEventSelect = (event: EventWithMapData) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
    
    // Center map on selected event
    if (event.venue?.latitude && event.venue?.longitude) {
      setMapCenter({
        lat: event.venue.latitude,
        lng: event.venue.longitude
      });
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.cluster) {
      // If cluster, zoom in to show individual markers
      setMapCenter({ lat: marker.lat, lng: marker.lng });
      setMapZoom(Math.min(mapZoom + 2, 18));
    } else {
      handleEventSelect(marker.event);
    }
  };

  const resetMapView = () => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setMapCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude
      });
    } else {
      setMapCenter({ lat: 41.8781, lng: -87.6298 }); // Chicago default
    }
    setMapZoom(10);
    setSelectedEvent(null);
  };

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.cluster) return '#9333ea'; // Purple for clusters
    if (marker.isSelected) return '#dc2626'; // Red for selected
    if (marker.event.featured) return '#eab308'; // Yellow for featured
    if (marker.event.tickets_available) return '#16a34a'; // Green for available
    return '#6b7280'; // Gray for unavailable
  };

  const getMarkerSize = (marker: MapMarker) => {
    if (marker.cluster) return Math.min(30 + marker.cluster.count * 2, 50);
    if (marker.isSelected || marker.isHovered) return 25;
    return 20;
  };

  const renderMapMarker = (marker: MapMarker) => (
    <div
      key={marker.id}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200",
        "hover:scale-110 hover:z-20"
      )}
      style={{
        left: `${((marker.lng - mapCenter.lng) * 100000 / mapZoom) + 50}%`,
        top: `${(-(marker.lat - mapCenter.lat) * 100000 / mapZoom) + 50}%`,
        width: getMarkerSize(marker),
        height: getMarkerSize(marker)
      }}
      onClick={() => handleMarkerClick(marker)}
      onMouseEnter={() => setHoveredEvent(marker.event)}
      onMouseLeave={() => setHoveredEvent(null)}
    >
      <div
        className="w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
        style={{ backgroundColor: getMarkerColor(marker) }}
      >
        {marker.cluster ? marker.cluster.count : <MapPin className="h-3 w-3" />}
      </div>
      
      {/* Tooltip */}
      {marker.isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-48 z-30">
          <div className="text-sm font-semibold">{marker.event.title}</div>
          <div className="text-xs text-muted-foreground">
            {marker.event.venue?.name} • {formatDate(marker.event.event_date)}
          </div>
          {marker.cluster && (
            <div className="text-xs text-blue-600 mt-1">
              Click to see {marker.cluster.count} events
            </div>
          )}
        </div>
      )}
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min) return 'Free';
    if (!max || min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

  return (
    <div className={cn("relative bg-background border rounded-lg overflow-hidden", className)}>
      {/* Search and Filters Header */}
      {(showSearch || showFilters) && (
        <div className="p-4 border-b space-y-3">
          {showSearch && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, venues, or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {showFilters && (
                <Popover open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="whitespace-nowrap">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {(filters.showOnlyFeatured || filters.categories.length > 0 || 
                        filters.venueTypes.length > 0 || filters.dateRange !== 'all') && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Active
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quick Filters</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="featured" className="text-sm">Featured Events Only</Label>
                            <Switch
                              id="featured"
                              checked={filters.showOnlyFeatured}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({ ...prev, showOnlyFeatured: checked }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="available" className="text-sm">Available Tickets Only</Label>
                            <Switch
                              id="available"
                              checked={filters.showOnlyAvailable}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({ ...prev, showOnlyAvailable: checked }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="clusters" className="text-sm">Group Nearby Events</Label>
                            <Switch
                              id="clusters"
                              checked={filters.showClusters}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({ ...prev, showClusters: checked }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Date Range</Label>
                        <select
                          value={filters.dateRange}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option value="all">All Dates</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                        </select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}
          
          {/* Event Count and Map Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredEvents.length} of {events.length} events
              {userLocation && (
                <> near {formatLocation(userLocation)}</>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <MapIcon className="h-3 w-3 mr-1" />
                {viewMode}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Zoom {mapZoom}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative" style={{ height }}>
        {/* Map Background */}
        <div
          ref={mapRef}
          className={cn(
            "w-full h-full relative overflow-hidden",
            viewMode === 'satellite' && "bg-slate-600",
            viewMode === 'terrain' && "bg-green-100",
            viewMode === 'map' && "bg-slate-100"
          )}
        >
          {/* Map Grid (Simulated) */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-gray-300" />
              ))}
            </div>
          </div>

          {/* Render Markers */}
          {markers.map(renderMapMarker)}

          {/* User Location Marker */}
          {userLocation?.latitude && userLocation?.longitude && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${((userLocation.longitude - mapCenter.lng) * 100000 / mapZoom) + 50}%`,
                top: `${(-(userLocation.latitude - mapCenter.lat) * 100000 / mapZoom) + 50}%`
              }}
            >
              <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
            </div>
          )}
        </div>

        {/* Map Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <div className="bg-white border rounded shadow-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
                className="p-2 h-8 w-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
                className="p-2 h-8 w-8"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetMapView}
                className="p-2 h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-white border rounded shadow-lg p-1">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="p-2 h-8 text-xs"
              >
                Map
              </Button>
              <Button
                variant={viewMode === 'satellite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('satellite')}
                className="p-2 h-8 text-xs"
              >
                Satellite
              </Button>
              <Button
                variant={viewMode === 'terrain' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('terrain')}
                className="p-2 h-8 text-xs"
              >
                Terrain
              </Button>
            </div>
          </div>
        )}

        {/* Selected Event Details Popup */}
        {selectedEvent && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <Card className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {selectedEvent.venue?.name} • {selectedEvent.venue?.city}, {selectedEvent.venue?.state}
                      {selectedEvent.distance && (
                        <Badge variant="outline" className="text-xs">
                          {selectedEvent.distance.toFixed(1)} mi
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 h-6 w-6"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
                      {selectedEvent.event_time && (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                          <span>{selectedEvent.event_time}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPrice(selectedEvent.price_min, selectedEvent.price_max)}</span>
                      {selectedEvent.capacity && (
                        <>
                          <Users className="h-4 w-4 text-muted-foreground ml-2" />
                          <span>{selectedEvent.capacity} capacity</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link to={`/events/${selectedEvent.id}`}>
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white border rounded shadow-lg p-3 text-xs z-20">
          <div className="font-semibold mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Available Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Featured Event</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full" />
              <span>Multiple Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span>Your Location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventMapView;