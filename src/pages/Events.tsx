
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { EventService } from '@/services/eventService';
import { getCurrentLocation, getStoredLocation, storeLocation, formatLocation, type LocationData } from '@/utils/geolocation';
import { US_STATES, normalizeStateName } from '@/data/usStates';
import { Calendar, MapPin, Clock, Search, Filter, Users, DollarSign, Star, Navigation, RefreshCw, Grid3X3, List, Map, ChevronDown, ChevronUp, Sliders, Bookmark, BookmarkPlus, Trash2 } from 'lucide-react';
import FollowButton from '@/components/following/FollowButton';
import EventCard from '@/components/events/EventCard';
import EventsMasonryGrid from '@/components/events/EventsMasonryGrid';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
};

const Events = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [locationHierarchy, setLocationHierarchy] = useState<{
    state: string;
    cities: string[];
    eventCount: number;
  }[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [sortByDistance, setSortByDistance] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'masonry'>('masonry');
  const [sortBy, setSortBy] = useState<'date' | 'price-low' | 'price-high' | 'popularity' | 'rating' | 'distance'>('date');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [skillLevel, setSkillLevel] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  // Load saved searches on component mount
  useEffect(() => {
    const loadSavedSearches = () => {
      const saved = localStorage.getItem('steppers-saved-searches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    };
    loadSavedSearches();
  }, []);

  // Detect user location on component mount
  useEffect(() => {
    const detectUserLocation = async () => {
      setIsLoadingLocation(true);
      try {
        // First check for stored location
        const stored = getStoredLocation();
        if (stored) {
          setUserLocation(stored);
          setIsLoadingLocation(false);
          return;
        }

        // Get current location with reduced timeout for desktop compatibility
        const location = await getCurrentLocation({ 
          timeout: 5000, // Reduce timeout to 5 seconds
          fallback: { city: 'Chicago', state: 'Illinois' }
        });
        setUserLocation(location);
        storeLocation(location);
      } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback to Chicago
        const fallback = { city: 'Chicago', state: 'Illinois' };
        setUserLocation(fallback);
        storeLocation(fallback);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    detectUserLocation();
  }, []);

  // Load location hierarchy on component mount
  useEffect(() => {
    const loadLocationHierarchy = async () => {
      try {
        const hierarchy = await EventService.getLocationHierarchy();
        setLocationHierarchy(hierarchy);
      } catch (error) {
        console.error('Error loading location hierarchy:', error);
      }
    };

    loadLocationHierarchy();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState !== 'all') {
      const stateData = locationHierarchy.find(loc => loc.state === selectedState);
      setAvailableCities(stateData?.cities || []);
      setSelectedCity('all'); // Reset city when state changes
    } else {
      setAvailableCities([]);
      setSelectedCity('all');
    }
  }, [selectedState, locationHierarchy]);

  // Load events on component mount and when filters change
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const searchParams: any = {
          query: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          state: selectedState !== 'all' ? selectedState : undefined,
          city: selectedCity !== 'all' ? selectedCity : undefined,
          dateRange: selectedDateRange !== 'all' ? selectedDateRange as any : undefined,
          limit: 20
        };

        // Add geolocation for distance sorting if available and not loading
        if (userLocation?.latitude && userLocation?.longitude && (sortBy === 'distance' || sortByDistance) && !isLoadingLocation) {
          searchParams.userLat = userLocation.latitude;
          searchParams.userLon = userLocation.longitude;
          searchParams.sortByDistance = sortBy === 'distance';
          searchParams.maxDistance = 150; // 150 mile radius
        }

        // Add sorting parameters
        searchParams.sortBy = sortBy;

        const { events: searchResults, total } = await EventService.searchEvents(searchParams);

        // Apply client-side filtering and sorting
        let filteredEvents = filterEvents(searchResults, priceRange, skillLevel);
        const sortedEvents = sortEvents(filteredEvents, sortBy);
        setEvents(sortedEvents);
        setTotalEvents(total);

        // Also load featured events if no search is active
        if (!searchQuery && selectedCategory === 'all' && selectedState === 'all' && selectedDateRange === 'all') {
          const featured = await EventService.getFeaturedEvents(3);
          setFeaturedEvents(featured || []); // Ensure it's always an array
        } else {
          setFeaturedEvents([]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
        setFeaturedEvents([]);
        setTotalEvents(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Load events immediately, don't wait for location detection
    // Location will be used for distance sorting if/when available
    loadEvents();
  }, [searchQuery, selectedCategory, selectedState, selectedCity, selectedDateRange, userLocation, sortByDistance, sortBy, priceRange, skillLevel]);

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'Workshops', label: 'Workshops' },
    { value: 'Sets', label: 'Sets' },
    { value: 'In the park', label: 'In the park' },
    { value: 'Trips', label: 'Trips' },
    { value: 'Cruises', label: 'Cruises' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Competitions', label: 'Competitions' }
  ];

  // Dynamic state/city options (no hardcoded list needed)

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'next-month', label: 'Next Month' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Earliest First)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Distance (Near to Far)' }
  ];

  const skillLevels = [
    { value: 'all', label: 'All Skill Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  // Client-side filtering function
  const filterEvents = (events: Event[], priceRange: [number, number], skillLevel: string) => {
    return events.filter(event => {
      // Price filtering
      const eventMinPrice = getMinPrice(event.ticket_types || []);
      const eventMaxPrice = getMaxPrice(event.ticket_types || []);
      const withinPriceRange = eventMinPrice <= priceRange[1] && (eventMaxPrice >= priceRange[0] || eventMinPrice >= priceRange[0]);
      
      // Skill level filtering (mock implementation - would need skill_level field in database)
      const withinSkillLevel = skillLevel === 'all' || getMockSkillLevel(event) === skillLevel;
      
      return withinPriceRange && withinSkillLevel;
    });
  };

  // Mock skill level generator for events
  const getMockSkillLevel = (event: Event) => {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const hash = event.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return levels[hash % levels.length];
  };

  // Client-side sorting function
  const sortEvents = (events: Event[], sortBy: string) => {
    const sorted = [...events];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = getMinPrice(a.ticket_types || []);
          const priceB = getMinPrice(b.ticket_types || []);
          return priceA - priceB;
        });
      
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = getMaxPrice(a.ticket_types || []);
          const priceB = getMaxPrice(b.ticket_types || []);
          return priceB - priceA;
        });
      
      case 'popularity':
        return sorted.sort((a, b) => {
          const soldA = getTotalSold(a.ticket_types || []);
          const soldB = getTotalSold(b.ticket_types || []);
          return soldB - soldA;
        });
      
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = getMockRating();
          const ratingB = getMockRating();
          return ratingB - ratingA;
        });
      
      case 'distance':
        return sorted.sort((a, b) => {
          const distanceA = (a as any).distance || 9999;
          const distanceB = (b as any).distance || 9999;
          return distanceA - distanceB;
        });
      
      default:
        return sorted;
    }
  };

  // Helper functions for sorting
  const getMinPrice = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return 0;
    const prices = ticketTypes.map(tt => tt.price).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getMaxPrice = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return 0;
    const prices = ticketTypes.map(tt => tt.price).filter(p => p > 0);
    return prices.length > 0 ? Math.max(...prices) : 0;
  };

  const getTotalSold = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return 0;
    return ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
  };

  const getMockRating = () => {
    return 4.2 + Math.random() * 0.8; // Mock rating between 4.2 and 5.0
  };

  // Saved search functionality
  const saveCurrentSearch = () => {
    const currentSearch = {
      id: Date.now().toString(),
      name: `Search: ${searchQuery || 'All Events'}`,
      timestamp: new Date().toISOString(),
      filters: {
        searchQuery,
        selectedCategory,
        selectedState,
        selectedCity,
        selectedDateRange,
        priceRange,
        skillLevel,
        sortBy
      }
    };

    const updatedSearches = [currentSearch, ...savedSearches.slice(0, 4)]; // Keep only 5 searches
    setSavedSearches(updatedSearches);
    localStorage.setItem('steppers-saved-searches', JSON.stringify(updatedSearches));
  };

  const loadSavedSearch = (search: any) => {
    const filters = search.filters;
    setSearchQuery(filters.searchQuery || '');
    setSelectedCategory(filters.selectedCategory || 'all');
    setSelectedState(filters.selectedState || 'all');
    setSelectedCity(filters.selectedCity || 'all');
    setSelectedDateRange(filters.selectedDateRange || 'all');
    setPriceRange(filters.priceRange || [0, 500]);
    setSkillLevel(filters.skillLevel || 'all');
    setSortBy(filters.sortBy || 'date');
    setShowSavedSearches(false);
  };

  const deleteSavedSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter(search => search.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem('steppers-saved-searches', JSON.stringify(updatedSearches));
  };

  const hasActiveFilters = () => {
    return searchQuery || 
           selectedCategory !== 'all' || 
           selectedState !== 'all' || 
           selectedDateRange !== 'all' ||
           priceRange[0] > 0 || 
           priceRange[1] < 500 ||
           skillLevel !== 'all' ||
           sortBy !== 'date';
  };

  const handleChangeLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation({ 
        fallback: { city: 'Chicago', state: 'Illinois' } 
      });
      setUserLocation(location);
      storeLocation(location);
    } catch (error) {
      console.error('Error updating location:', error);
      const fallback = { city: 'Chicago', state: 'Illinois' };
      setUserLocation(fallback);
      storeLocation(fallback);
    } finally {
      setIsLoadingLocation(false);
    }
  };


  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Stepping Events</h1>
          
          {/* Location Header */}
          <div className="mb-4">
            {isLoadingLocation ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Detecting your location...</span>
              </div>
            ) : userLocation ? (
              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-stepping-purple" />
                  <span className="font-medium">Near {formatLocation(userLocation)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleChangeLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Change Location
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location unavailable</span>
              </div>
            )}
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and join stepping events near you. From workshops to competitions, find your perfect stepping experience.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, promoters, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            
            {/* Save/Load Search Buttons */}
            <div className="absolute right-2 top-2 flex gap-1">
              {hasActiveFilters() && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveCurrentSearch}
                  className="h-7 w-7 p-0"
                  title="Save current search"
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              )}
              {savedSearches.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSavedSearches(!showSavedSearches)}
                  className="h-7 w-7 p-0"
                  title="Load saved search"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Saved Searches Dropdown */}
          {showSavedSearches && savedSearches.length > 0 && (
            <div className="max-w-lg mx-auto bg-background border rounded-lg shadow-lg p-4 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">Saved Searches</h4>
              {savedSearches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                  <button
                    onClick={() => loadSavedSearch(search)}
                    className="flex-1 text-left text-sm"
                  >
                    <div className="font-medium">{search.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(search.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSavedSearch(search.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="transition-all"
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">

            {/* State Selector */}
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-48">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {Array.isArray(locationHierarchy) ? locationHierarchy.map((location) => {
                  // Normalize the state name to match our standardized format
                  const normalizedState = normalizeStateName(location.state);
                  const stateInfo = US_STATES.find(state => state.value === normalizedState);
                  const displayName = stateInfo ? `${stateInfo.name} (${stateInfo.abbreviation})` : location.state;
                  
                  return (
                    <SelectItem key={location.state} value={normalizedState}>
                      {displayName}
                    </SelectItem>
                  );
                }) : null}
              </SelectContent>
            </Select>

            {/* City Selector - Only show if state is selected and has multiple cities */}
            {selectedState !== 'all' && availableCities.length > 1 && (
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities in {selectedState}</SelectItem>
                  {Array.isArray(availableCities) ? availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(dateRanges) ? dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              Advanced Filters
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-muted/30 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Advanced Filters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="px-3">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={500}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                {/* Skill Level Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Skill Level</label>
                  <Select value={skillLevel} onValueChange={setSkillLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Advanced Filters */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPriceRange([0, 500]);
                    setSkillLevel('all');
                  }}
                  size="sm"
                >
                  Clear Advanced Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Events
            </h2>
            <EventsMasonryGrid
              events={featuredEvents}
              variant="featured"
              showRating={true}
              showSoldOutStatus={true}
              showSocialShare={true}
              className="mb-8"
            />
          </div>
        )}

        {/* All Events Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">
              {searchQuery || selectedCategory !== 'all' || selectedState !== 'all' || selectedDateRange !== 'all' 
                ? 'Search Results' 
                : 'All Events'
              }
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Selector */}
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('masonry')}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Masonry
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="gap-2"
                >
                  <Map className="h-4 w-4" />
                  Map
                </Button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className={viewMode === 'grid' || viewMode === 'masonry' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {[...Array(6)].map((_, i) => (
                viewMode === 'grid' || viewMode === 'masonry' ? (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="aspect-video w-full mb-4" />
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ) : viewMode === 'list' ? (
                  <Card key={i} className="flex flex-row p-4">
                    <Skeleton className="w-32 h-24 rounded-md mr-4 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div key={i} className="h-96 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Loading map view...</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new events.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedState('all');
                  setSelectedCity('all');
                  setSelectedDateRange('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          ) : viewMode === 'map' ? (
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Map View Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive map view with event locations will be available soon.
                </p>
                <p className="text-sm text-muted-foreground">
                  Found {events.length} events in your search area
                </p>
              </div>
            </div>
          ) : viewMode === 'masonry' ? (
            <EventsMasonryGrid
              events={events}
              showRating={true}
              showSoldOutStatus={true}
              showSocialShare={true}
            />
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {Array.isArray(events) ? events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  variant={viewMode}
                  showRating={true}
                  showSoldOutStatus={true}
                />
              )) : null}
            </div>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="text-center mt-8 text-muted-foreground">
            Showing {events.length} of {totalEvents} events
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
