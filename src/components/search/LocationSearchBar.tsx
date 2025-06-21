import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Navigation, 
  Search, 
  X, 
  ChevronDown, 
  Loader2,
  Target,
  Globe,
  Clock,
  Bookmark,
  Settings,
  Filter
} from 'lucide-react';
import { getCurrentLocation, getStoredLocation, storeLocation, formatLocation, calculateDistance, type LocationData } from '@/utils/geolocation';
import { US_STATES } from '@/data/usStates';
import { cn } from '@/lib/utils';

interface LocationSearchBarProps {
  onLocationChange: (location: LocationData | null, distance?: number) => void;
  onFiltersChange: (filters: LocationSearchFilters) => void;
  className?: string;
  showDistanceFilter?: boolean;
  showAdvancedFilters?: boolean;
  placeholder?: string;
  defaultLocation?: LocationData | null;
  defaultDistance?: number;
}

export interface LocationSearchFilters {
  location: LocationData | null;
  distance: number;
  useCurrentLocation: boolean;
  includeOnlineEvents: boolean;
  includeNearbyStates: boolean;
  savedLocations: LocationData[];
}

interface LocationSuggestion {
  id: string;
  city: string;
  state: string;
  fullName: string;
  type: 'city' | 'state' | 'recent' | 'saved';
  coordinates?: { latitude: number; longitude: number };
}

const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  onLocationChange,
  onFiltersChange,
  className,
  showDistanceFilter = true,
  showAdvancedFilters = false,
  placeholder = "Search city, state, or zip code...",
  defaultLocation = null,
  defaultDistance = 50
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(defaultLocation);
  const [distance, setDistance] = useState(defaultDistance);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [includeOnlineEvents, setIncludeOnlineEvents] = useState(true);
  const [includeNearbyStates, setIncludeNearbyStates] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Update search term when current location changes
  useEffect(() => {
    if (currentLocation && !searchTerm) {
      setSearchTerm(formatLocation(currentLocation));
    }
  }, [currentLocation]);

  // Notify parent of changes
  useEffect(() => {
    onLocationChange(currentLocation, distance);
    onFiltersChange({
      location: currentLocation,
      distance,
      useCurrentLocation,
      includeOnlineEvents,
      includeNearbyStates,
      savedLocations
    });
  }, [currentLocation, distance, useCurrentLocation, includeOnlineEvents, includeNearbyStates, savedLocations]);

  const loadSavedData = () => {
    try {
      const stored = localStorage.getItem('location-search-data');
      if (stored) {
        const data = JSON.parse(stored);
        setSavedLocations(data.savedLocations || []);
        setRecentSearches(data.recentSearches || []);
      }

      // Load stored location if no default provided
      if (!defaultLocation) {
        const storedLocation = getStoredLocation();
        if (storedLocation) {
          setCurrentLocation(storedLocation);
        }
      }
    } catch (error) {
      console.error('Failed to load saved location data:', error);
    }
  };

  const saveData = () => {
    try {
      const data = {
        savedLocations,
        recentSearches
      };
      localStorage.setItem('location-search-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save location data:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setSearchTerm(formatLocation(location));
      setUseCurrentLocation(true);
      storeLocation(location);
      addToRecentSearches(location);
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const generateSuggestions = (term: string): LocationSuggestion[] => {
    if (!term || term.length < 2) {
      // Show recent and saved locations when no search term
      const suggestions: LocationSuggestion[] = [];
      
      // Add recent searches
      recentSearches.slice(0, 3).forEach((location, index) => {
        suggestions.push({
          id: `recent-${index}`,
          city: location.city,
          state: location.state,
          fullName: formatLocation(location),
          type: 'recent',
          coordinates: location.latitude && location.longitude ? 
            { latitude: location.latitude, longitude: location.longitude } : undefined
        });
      });

      // Add saved locations
      savedLocations.slice(0, 3).forEach((location, index) => {
        suggestions.push({
          id: `saved-${index}`,
          city: location.city,
          state: location.state,
          fullName: formatLocation(location),
          type: 'saved',
          coordinates: location.latitude && location.longitude ? 
            { latitude: location.latitude, longitude: location.longitude } : undefined
        });
      });

      return suggestions;
    }

    const suggestions: LocationSuggestion[] = [];
    const searchLower = term.toLowerCase();

    // Add state suggestions
    US_STATES.forEach(state => {
      if (state.name.toLowerCase().includes(searchLower) || 
          state.abbreviation.toLowerCase().includes(searchLower)) {
        suggestions.push({
          id: `state-${state.abbreviation}`,
          city: '',
          state: state.name,
          fullName: state.name,
          type: 'state'
        });
      }
    });

    // Add major cities (simplified - in real implementation would use geocoding API)
    const majorCities = [
      { city: 'Chicago', state: 'Illinois', coordinates: { latitude: 41.8781, longitude: -87.6298 } },
      { city: 'New York', state: 'New York', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
      { city: 'Los Angeles', state: 'California', coordinates: { latitude: 34.0522, longitude: -118.2437 } },
      { city: 'Atlanta', state: 'Georgia', coordinates: { latitude: 33.7490, longitude: -84.3880 } },
      { city: 'Houston', state: 'Texas', coordinates: { latitude: 29.7604, longitude: -95.3698 } },
      { city: 'Philadelphia', state: 'Pennsylvania', coordinates: { latitude: 39.9526, longitude: -75.1652 } },
      { city: 'Detroit', state: 'Michigan', coordinates: { latitude: 42.3314, longitude: -83.0458 } },
      { city: 'Washington', state: 'District of Columbia', coordinates: { latitude: 38.9072, longitude: -77.0369 } },
      { city: 'Miami', state: 'Florida', coordinates: { latitude: 25.7617, longitude: -80.1918 } },
      { city: 'Cleveland', state: 'Ohio', coordinates: { latitude: 41.4993, longitude: -81.6944 } },
      { city: 'Milwaukee', state: 'Wisconsin', coordinates: { latitude: 43.0389, longitude: -87.9065 } },
      { city: 'Minneapolis', state: 'Minnesota', coordinates: { latitude: 44.9778, longitude: -93.2650 } },
      { city: 'St. Louis', state: 'Missouri', coordinates: { latitude: 38.6270, longitude: -90.1994 } },
      { city: 'Kansas City', state: 'Missouri', coordinates: { latitude: 39.0997, longitude: -94.5786 } },
      { city: 'Indianapolis', state: 'Indiana', coordinates: { latitude: 39.7684, longitude: -86.1581 } }
    ];

    majorCities.forEach(cityData => {
      const cityMatch = cityData.city.toLowerCase().includes(searchLower);
      const stateMatch = cityData.state.toLowerCase().includes(searchLower);
      const fullMatch = `${cityData.city}, ${cityData.state}`.toLowerCase().includes(searchLower);

      if (cityMatch || stateMatch || fullMatch) {
        suggestions.push({
          id: `city-${cityData.city}-${cityData.state}`,
          city: cityData.city,
          state: cityData.state,
          fullName: `${cityData.city}, ${cityData.state}`,
          type: 'city',
          coordinates: cityData.coordinates
        });
      }
    });

    return suggestions.slice(0, 8);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const newLocation: LocationData = {
      city: suggestion.city || '',
      state: suggestion.state,
      latitude: suggestion.coordinates?.latitude,
      longitude: suggestion.coordinates?.longitude
    };

    setCurrentLocation(newLocation);
    setSearchTerm(suggestion.fullName);
    setShowSuggestions(false);
    setUseCurrentLocation(false);
    
    addToRecentSearches(newLocation);
    storeLocation(newLocation);
  };

  const addToRecentSearches = (location: LocationData) => {
    const formatted = formatLocation(location);
    const updatedRecent = [
      location,
      ...recentSearches.filter(r => formatLocation(r) !== formatted)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    saveData();
  };

  const saveCurrentLocation = () => {
    if (currentLocation) {
      const formatted = formatLocation(currentLocation);
      const updatedSaved = [
        currentLocation,
        ...savedLocations.filter(s => formatLocation(s) !== formatted)
      ].slice(0, 10);
      
      setSavedLocations(updatedSaved);
      saveData();
    }
  };

  const removeSavedLocation = (locationToRemove: LocationData) => {
    const formatted = formatLocation(locationToRemove);
    const updatedSaved = savedLocations.filter(s => formatLocation(s) !== formatted);
    setSavedLocations(updatedSaved);
    saveData();
  };

  const clearCurrentLocation = () => {
    setCurrentLocation(null);
    setSearchTerm('');
    setUseCurrentLocation(false);
  };

  const getSuggestionIcon = (type: LocationSuggestion['type']) => {
    switch (type) {
      case 'recent': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'saved': return <Bookmark className="h-4 w-4 text-blue-500" />;
      case 'state': return <Globe className="h-4 w-4 text-green-500" />;
      case 'city': return <MapPin className="h-4 w-4 text-red-500" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-20"
          />
          
          {/* Quick Action Buttons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {currentLocation && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCurrentLocation}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="h-6 w-6 p-0"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Navigation className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 border-b last:border-b-0"
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1">
                  <div className="font-medium">{suggestion.fullName}</div>
                  {suggestion.type === 'recent' && (
                    <div className="text-xs text-muted-foreground">Recent search</div>
                  )}
                  {suggestion.type === 'saved' && (
                    <div className="text-xs text-muted-foreground">Saved location</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Display */}
      {currentLocation && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatLocation(currentLocation)}
            </span>
            {useCurrentLocation && (
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={saveCurrentLocation}
              className="h-6 px-2"
            >
              <Bookmark className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Distance Filter */}
      {showDistanceFilter && currentLocation && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Search Radius</Label>
            <span className="text-sm text-muted-foreground">{distance} miles</span>
          </div>
          <Slider
            value={[distance]}
            onValueChange={(value) => setDistance(value[0])}
            max={200}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 miles</span>
            <span>200 miles</span>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-online" className="text-sm">Include Online Events</Label>
            <Switch
              id="include-online"
              checked={includeOnlineEvents}
              onCheckedChange={setIncludeOnlineEvents}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="nearby-states" className="text-sm">Include Nearby States</Label>
            <Switch
              id="nearby-states"
              checked={includeNearbyStates}
              onCheckedChange={setIncludeNearbyStates}
            />
          </div>

          {/* Saved Locations Management */}
          {savedLocations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Saved Locations</Label>
              <div className="space-y-1">
                {savedLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                    <span>{formatLocation(location)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSavedLocation(location)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearchBar;