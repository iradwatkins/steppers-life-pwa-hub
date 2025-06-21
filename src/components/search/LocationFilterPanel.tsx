import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MapPin, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  RotateCcw,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  Navigation,
  Globe,
  Map,
  Target,
  Settings
} from 'lucide-react';
import { formatLocation, calculateDistance, type LocationData } from '@/utils/geolocation';
import { US_STATES } from '@/data/usStates';
import { cn } from '@/lib/utils';

interface LocationFilterPanelProps {
  userLocation: LocationData | null;
  onFiltersChange: (filters: LocationFilters) => void;
  className?: string;
  availableLocations?: LocationData[];
  eventCounts?: { [key: string]: number };
  showAdvanced?: boolean;
}

export interface LocationFilters {
  // Location-based filters
  searchRadius: number;
  selectedStates: string[];
  selectedCities: string[];
  excludeLocations: string[];
  includeOnlineEvents: boolean;
  includeNearbyRegions: boolean;
  
  // Distance-based filters
  maxDistance: number;
  sortByDistance: boolean;
  useGeolocation: boolean;
  
  // Time zone preferences
  preferredTimeZones: string[];
  showLocalTimes: boolean;
  
  // Venue type filters
  venueTypes: string[];
  accessibilityRequirements: string[];
  
  // Regional preferences
  metropolitanAreasOnly: boolean;
  includeSuburban: boolean;
  includeRural: boolean;
  
  // Transportation considerations
  nearPublicTransit: boolean;
  parkingRequired: boolean;
  
  // Advanced location settings
  customBoundary?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

const defaultFilters: LocationFilters = {
  searchRadius: 50,
  selectedStates: [],
  selectedCities: [],
  excludeLocations: [],
  includeOnlineEvents: true,
  includeNearbyRegions: false,
  maxDistance: 100,
  sortByDistance: true,
  useGeolocation: true,
  preferredTimeZones: [],
  showLocalTimes: true,
  venueTypes: [],
  accessibilityRequirements: [],
  metropolitanAreasOnly: false,
  includeSuburban: true,
  includeRural: false,
  nearPublicTransit: false,
  parkingRequired: false
};

const LocationFilterPanel: React.FC<LocationFilterPanelProps> = ({
  userLocation,
  onFiltersChange,
  className,
  availableLocations = [],
  eventCounts = {},
  showAdvanced = false
}) => {
  const [filters, setFilters] = useState<LocationFilters>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('location');

  // Predefined venue types
  const venueTypes = [
    { id: 'ballroom', label: 'Ballrooms', icon: '🏛️' },
    { id: 'hotel', label: 'Hotels', icon: '🏨' },
    { id: 'community_center', label: 'Community Centers', icon: '🏢' },
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { id: 'club', label: 'Clubs/Bars', icon: '🍸' },
    { id: 'studio', label: 'Dance Studios', icon: '💃' },
    { id: 'outdoor', label: 'Outdoor Venues', icon: '🌳' },
    { id: 'private', label: 'Private Venues', icon: '🏠' }
  ];

  // Time zones common in stepping community
  const timeZones = [
    { id: 'America/Chicago', label: 'Central Time (Chicago)' },
    { id: 'America/New_York', label: 'Eastern Time (New York)' },
    { id: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
    { id: 'America/Detroit', label: 'Eastern Time (Detroit)' },
    { id: 'America/Phoenix', label: 'Mountain Time (Phoenix)' }
  ];

  // Accessibility requirements
  const accessibilityOptions = [
    { id: 'wheelchair', label: 'Wheelchair Accessible' },
    { id: 'hearing', label: 'Hearing Assistance' },
    { id: 'visual', label: 'Visual Assistance' },
    { id: 'elevator', label: 'Elevator Access' },
    { id: 'parking', label: 'Accessible Parking' }
  ];

  // Major metropolitan areas for stepping
  const metropolitanAreas = [
    'Chicago Metropolitan Area',
    'Greater Atlanta',
    'Detroit Metro',
    'Milwaukee Area',
    'Cleveland Area',
    'St. Louis Metro',
    'Kansas City Metro',
    'Indianapolis Metro',
    'Minneapolis-St. Paul',
    'Houston Metro'
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = <K extends keyof LocationFilters>(
    key: K, 
    value: LocationFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = <K extends keyof LocationFilters>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as LocationFilters[K]);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchRadius !== defaultFilters.searchRadius) count++;
    if (filters.selectedStates.length > 0) count++;
    if (filters.selectedCities.length > 0) count++;
    if (filters.excludeLocations.length > 0) count++;
    if (filters.includeOnlineEvents !== defaultFilters.includeOnlineEvents) count++;
    if (filters.includeNearbyRegions !== defaultFilters.includeNearbyRegions) count++;
    if (filters.venueTypes.length > 0) count++;
    if (filters.accessibilityRequirements.length > 0) count++;
    if (filters.nearPublicTransit || filters.parkingRequired) count++;
    return count;
  };

  const getStateEventCount = (stateAbbrev: string) => {
    return eventCounts[stateAbbrev] || 0;
  };

  const getCityEventCount = (city: string, state: string) => {
    return eventCounts[`${city}, ${state}`] || 0;
  };

  const renderLocationTab = () => (
    <div className="space-y-6">
      {/* Distance Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Search Radius</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{filters.searchRadius} miles</span>
            {userLocation && (
              <Badge variant="outline" className="text-xs">
                from {formatLocation(userLocation)}
              </Badge>
            )}
          </div>
        </div>
        <Slider
          value={[filters.searchRadius]}
          onValueChange={(value) => updateFilter('searchRadius', value[0])}
          max={500}
          min={5}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 mi</span>
          <span>100 mi</span>
          <span>500 mi</span>
        </div>
      </div>

      <Separator />

      {/* State Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">States</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {US_STATES.map((state) => {
            const eventCount = getStateEventCount(state.abbreviation);
            return (
              <div key={state.abbreviation} className="flex items-center space-x-2">
                <Checkbox
                  id={`state-${state.abbreviation}`}
                  checked={filters.selectedStates.includes(state.abbreviation)}
                  onCheckedChange={() => toggleArrayValue('selectedStates', state.abbreviation)}
                />
                <Label
                  htmlFor={`state-${state.abbreviation}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {state.name}
                  {eventCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-1">({eventCount})</span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Quick Location Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Locations</Label>
        <div className="grid grid-cols-2 gap-2">
          {metropolitanAreas.map((area) => (
            <Button
              key={area}
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start"
              onClick={() => {
                // This would set filters for that metropolitan area
                // For now, just toggle the major state
                const stateMap: { [key: string]: string } = {
                  'Chicago Metropolitan Area': 'IL',
                  'Greater Atlanta': 'GA',
                  'Detroit Metro': 'MI',
                  'Milwaukee Area': 'WI',
                  'Cleveland Area': 'OH',
                  'St. Louis Metro': 'MO',
                  'Kansas City Metro': 'MO',
                  'Indianapolis Metro': 'IN',
                  'Minneapolis-St. Paul': 'MN',
                  'Houston Metro': 'TX'
                };
                const stateAbbrev = stateMap[area];
                if (stateAbbrev) {
                  toggleArrayValue('selectedStates', stateAbbrev);
                }
              }}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {area}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVenueTab = () => (
    <div className="space-y-6">
      {/* Venue Types */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Venue Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {venueTypes.map((venue) => (
            <div key={venue.id} className="flex items-center space-x-2">
              <Checkbox
                id={`venue-${venue.id}`}
                checked={filters.venueTypes.includes(venue.id)}
                onCheckedChange={() => toggleArrayValue('venueTypes', venue.id)}
              />
              <Label
                htmlFor={`venue-${venue.id}`}
                className="text-sm flex-1 cursor-pointer flex items-center gap-1"
              >
                <span>{venue.icon}</span>
                {venue.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Accessibility */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Accessibility</Label>
        <div className="space-y-2">
          {accessibilityOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`accessibility-${option.id}`}
                checked={filters.accessibilityRequirements.includes(option.id)}
                onCheckedChange={() => toggleArrayValue('accessibilityRequirements', option.id)}
              />
              <Label
                htmlFor={`accessibility-${option.id}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Transportation */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Transportation</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-transit" className="text-sm">Near Public Transit</Label>
            <Switch
              id="public-transit"
              checked={filters.nearPublicTransit}
              onCheckedChange={(checked) => updateFilter('nearPublicTransit', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="parking-required" className="text-sm">Parking Available</Label>
            <Switch
              id="parking-required"
              checked={filters.parkingRequired}
              onCheckedChange={(checked) => updateFilter('parkingRequired', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Regional Preferences */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Regional Preferences</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="metro-only" className="text-sm">Metropolitan Areas Only</Label>
            <Switch
              id="metro-only"
              checked={filters.metropolitanAreasOnly}
              onCheckedChange={(checked) => updateFilter('metropolitanAreasOnly', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="suburban" className="text-sm">Include Suburban Areas</Label>
            <Switch
              id="suburban"
              checked={filters.includeSuburban}
              onCheckedChange={(checked) => updateFilter('includeSuburban', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="rural" className="text-sm">Include Rural Areas</Label>
            <Switch
              id="rural"
              checked={filters.includeRural}
              onCheckedChange={(checked) => updateFilter('includeRural', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Time Zone Preferences */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Time Zone Preferences</Label>
        <div className="space-y-2">
          {timeZones.map((tz) => (
            <div key={tz.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tz-${tz.id}`}
                checked={filters.preferredTimeZones.includes(tz.id)}
                onCheckedChange={() => toggleArrayValue('preferredTimeZones', tz.id)}
              />
              <Label
                htmlFor={`tz-${tz.id}`}
                className="text-sm cursor-pointer"
              >
                {tz.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="local-times" className="text-sm">Show Local Times</Label>
          <Switch
            id="local-times"
            checked={filters.showLocalTimes}
            onCheckedChange={(checked) => updateFilter('showLocalTimes', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Distance and Sorting */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Distance Settings</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sort-distance" className="text-sm">Sort by Distance</Label>
            <Switch
              id="sort-distance"
              checked={filters.sortByDistance}
              onCheckedChange={(checked) => updateFilter('sortByDistance', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="use-geolocation" className="text-sm">Use GPS Location</Label>
            <Switch
              id="use-geolocation"
              checked={filters.useGeolocation}
              onCheckedChange={(checked) => updateFilter('useGeolocation', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="nearby-regions" className="text-sm">Include Nearby Regions</Label>
            <Switch
              id="nearby-regions"
              checked={filters.includeNearbyRegions}
              onCheckedChange={(checked) => updateFilter('includeNearbyRegions', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Location Filters</CardTitle>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Online Events Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
              <Label htmlFor="online-events" className="text-sm">Include Online Events</Label>
              <Switch
                id="online-events"
                checked={filters.includeOnlineEvents}
                onCheckedChange={(checked) => updateFilter('includeOnlineEvents', checked)}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="location" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="venue" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Venue
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="location" className="mt-4">
                {renderLocationTab()}
              </TabsContent>

              <TabsContent value="venue" className="mt-4">
                {renderVenueTab()}
              </TabsContent>

              <TabsContent value="advanced" className="mt-4">
                {renderAdvancedTab()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LocationFilterPanel;