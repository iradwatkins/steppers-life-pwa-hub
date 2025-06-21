import { supabase } from '@/integrations/supabase/client';
import { calculateDistance, type LocationData } from '@/utils/geolocation';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

export interface LocationSearchParams {
  userLocation?: LocationData | null;
  searchRadius?: number;
  selectedStates?: string[];
  selectedCities?: string[];
  excludeLocations?: string[];
  includeOnlineEvents?: boolean;
  includeNearbyRegions?: boolean;
  venueTypes?: string[];
  accessibilityRequirements?: string[];
  nearPublicTransit?: boolean;
  parkingRequired?: boolean;
  sortByDistance?: boolean;
  limit?: number;
  offset?: number;
}

export interface LocationSearchResult {
  events: EventWithDistance[];
  totalCount: number;
  locationStats: LocationStats;
  suggestions: LocationSuggestion[];
}

export interface EventWithDistance extends Event {
  distance?: number;
  venue_info?: {
    name: string;
    address: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
    venue_type?: string;
    accessibility_features?: string[];
    parking_available?: boolean;
    public_transit_nearby?: boolean;
  };
  organizer_info?: {
    name: string;
    verified: boolean;
  };
}

export interface LocationStats {
  totalEvents: number;
  eventsByState: { [state: string]: number };
  eventsByCity: { [city: string]: number };
  averageDistance?: number;
  nearestEvent?: EventWithDistance;
  farthestEvent?: EventWithDistance;
}

export interface LocationSuggestion {
  id: string;
  type: 'city' | 'state' | 'venue' | 'region';
  name: string;
  displayName: string;
  eventCount: number;
  coordinates?: { latitude: number; longitude: number };
  distance?: number;
}

export interface NearbyLocation {
  name: string;
  type: 'city' | 'state';
  distance: number;
  eventCount: number;
  coordinates: { latitude: number; longitude: number };
}

class LocationSearchService {
  /**
   * Search for events based on location criteria
   */
  async searchEventsByLocation(params: LocationSearchParams): Promise<LocationSearchResult> {
    try {
      const {
        userLocation,
        searchRadius = 50,
        selectedStates = [],
        selectedCities = [],
        excludeLocations = [],
        includeOnlineEvents = true,
        includeNearbyRegions = false,
        venueTypes = [],
        accessibilityRequirements = [],
        nearPublicTransit = false,
        parkingRequired = false,
        sortByDistance = true,
        limit = 50,
        offset = 0
      } = params;

      // Build the query
      let query = supabase
        .from('events')
        .select(`
          *,
          venues (
            id,
            name,
            address,
            city,
            state,
            latitude,
            longitude,
            venue_type,
            accessibility_features,
            parking_available,
            public_transit_nearby
          ),
          organizers (
            business_name,
            verified
          )
        `)
        .gte('event_date', new Date().toISOString().split('T')[0]) // Only future events
        .eq('status', 'published');

      // Apply state filters
      if (selectedStates.length > 0) {
        query = query.in('venues.state', selectedStates);
      }

      // Apply city filters
      if (selectedCities.length > 0) {
        query = query.in('venues.city', selectedCities);
      }

      // Handle online events
      if (!includeOnlineEvents) {
        query = query.neq('event_type', 'online');
      }

      // Apply venue type filters
      if (venueTypes.length > 0) {
        query = query.in('venues.venue_type', venueTypes);
      }

      // Apply accessibility filters
      if (accessibilityRequirements.length > 0) {
        // This would require a more complex query with JSON operations
        // For now, we'll handle this in post-processing
      }

      // Apply transportation filters
      if (nearPublicTransit) {
        query = query.eq('venues.public_transit_nearby', true);
      }

      if (parkingRequired) {
        query = query.eq('venues.parking_available', true);
      }

      // Apply pagination
      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: events, error, count } = await query;

      if (error) {
        throw error;
      }

      // Process events and calculate distances
      const eventsWithDistance = this.processEventsWithDistance(
        events || [],
        userLocation,
        searchRadius,
        excludeLocations,
        accessibilityRequirements
      );

      // Sort events
      const sortedEvents = this.sortEvents(eventsWithDistance, sortByDistance, userLocation);

      // Generate location stats
      const locationStats = this.generateLocationStats(sortedEvents, userLocation);

      // Generate suggestions
      const suggestions = await this.generateLocationSuggestions(params);

      return {
        events: sortedEvents,
        totalCount: count || 0,
        locationStats,
        suggestions
      };
    } catch (error) {
      console.error('Error searching events by location:', error);
      throw error;
    }
  }

  /**
   * Get location-based event suggestions
   */
  async getLocationSuggestions(
    userLocation: LocationData | null,
    searchTerm?: string
  ): Promise<LocationSuggestion[]> {
    try {
      const suggestions: LocationSuggestion[] = [];

      // Get event counts by location
      const { data: locationCounts, error } = await supabase
        .from('events')
        .select(`
          venues (city, state, latitude, longitude),
          count
        `)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .eq('status', 'published');

      if (error) throw error;

      // Process location data
      const locationMap = new Map<string, { count: number; coordinates?: { latitude: number; longitude: number } }>();

      locationCounts?.forEach(event => {
        if (event.venues) {
          const venue = event.venues as any;
          const cityKey = `${venue.city}, ${venue.state}`;
          const stateKey = venue.state;

          // Add city data
          if (!locationMap.has(cityKey)) {
            locationMap.set(cityKey, {
              count: 0,
              coordinates: venue.latitude && venue.longitude 
                ? { latitude: venue.latitude, longitude: venue.longitude }
                : undefined
            });
          }
          locationMap.get(cityKey)!.count++;

          // Add state data
          if (!locationMap.has(stateKey)) {
            locationMap.set(stateKey, { count: 0 });
          }
          locationMap.get(stateKey)!.count++;
        }
      });

      // Convert to suggestions
      locationMap.forEach((data, location) => {
        const isState = !location.includes(',');
        const distance = userLocation && data.coordinates
          ? calculateDistance(
              userLocation.latitude!,
              userLocation.longitude!,
              data.coordinates.latitude,
              data.coordinates.longitude
            )
          : undefined;

        // Filter by search term if provided
        if (searchTerm && !location.toLowerCase().includes(searchTerm.toLowerCase())) {
          return;
        }

        suggestions.push({
          id: `location-${location}`,
          type: isState ? 'state' : 'city',
          name: location,
          displayName: location,
          eventCount: data.count,
          coordinates: data.coordinates,
          distance
        });
      });

      // Sort suggestions by relevance
      return suggestions
        .sort((a, b) => {
          // Prioritize by event count, then by distance
          if (a.eventCount !== b.eventCount) {
            return b.eventCount - a.eventCount;
          }
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return a.name.localeCompare(b.name);
        })
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting location suggestions:', error);
      return [];
    }
  }

  /**
   * Find nearby locations with events
   */
  async findNearbyLocations(
    userLocation: LocationData,
    maxDistance: number = 100
  ): Promise<NearbyLocation[]> {
    try {
      if (!userLocation.latitude || !userLocation.longitude) {
        return [];
      }

      const { data: venues, error } = await supabase
        .from('venues')
        .select(`
          city,
          state,
          latitude,
          longitude,
          events (count)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      const nearbyLocations: NearbyLocation[] = [];
      const locationMap = new Map<string, NearbyLocation>();

      venues?.forEach(venue => {
        if (venue.latitude && venue.longitude) {
          const distance = calculateDistance(
            userLocation.latitude!,
            userLocation.longitude!,
            venue.latitude,
            venue.longitude
          );

          if (distance <= maxDistance) {
            const locationKey = `${venue.city}, ${venue.state}`;
            
            if (!locationMap.has(locationKey)) {
              locationMap.set(locationKey, {
                name: locationKey,
                type: 'city',
                distance,
                eventCount: 0,
                coordinates: { latitude: venue.latitude, longitude: venue.longitude }
              });
            }

            // Increment event count (simplified - should count actual events)
            locationMap.get(locationKey)!.eventCount++;
          }
        }
      });

      return Array.from(locationMap.values())
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20);
    } catch (error) {
      console.error('Error finding nearby locations:', error);
      return [];
    }
  }

  /**
   * Get location-based analytics
   */
  async getLocationAnalytics(params: LocationSearchParams): Promise<{
    topCities: { name: string; eventCount: number; distance?: number }[];
    topStates: { name: string; eventCount: number }[];
    distanceDistribution: { range: string; count: number }[];
    venueTypeDistribution: { type: string; count: number }[];
  }> {
    try {
      // This would implement comprehensive location analytics
      // For now, returning mock data structure
      return {
        topCities: [],
        topStates: [],
        distanceDistribution: [],
        venueTypeDistribution: []
      };
    } catch (error) {
      console.error('Error getting location analytics:', error);
      throw error;
    }
  }

  // Private helper methods
  private processEventsWithDistance(
    events: any[],
    userLocation: LocationData | null,
    searchRadius: number,
    excludeLocations: string[],
    accessibilityRequirements: string[]
  ): EventWithDistance[] {
    return events
      .map(event => {
        const venue = event.venues;
        let distance: number | undefined;

        // Calculate distance if user location and venue coordinates are available
        if (
          userLocation?.latitude &&
          userLocation?.longitude &&
          venue?.latitude &&
          venue?.longitude
        ) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            venue.latitude,
            venue.longitude
          );
        }

        // Filter by distance
        if (distance !== undefined && distance > searchRadius) {
          return null;
        }

        // Filter by excluded locations
        const locationString = venue ? `${venue.city}, ${venue.state}` : '';
        if (excludeLocations.some(excluded => locationString.includes(excluded))) {
          return null;
        }

        // Filter by accessibility requirements
        if (accessibilityRequirements.length > 0 && venue?.accessibility_features) {
          const hasRequiredFeatures = accessibilityRequirements.every(req =>
            venue.accessibility_features?.includes(req)
          );
          if (!hasRequiredFeatures) {
            return null;
          }
        }

        return {
          ...event,
          distance,
          venue_info: venue ? {
            name: venue.name,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            latitude: venue.latitude,
            longitude: venue.longitude,
            venue_type: venue.venue_type,
            accessibility_features: venue.accessibility_features,
            parking_available: venue.parking_available,
            public_transit_nearby: venue.public_transit_nearby
          } : undefined,
          organizer_info: event.organizers ? {
            name: event.organizers.business_name,
            verified: event.organizers.verified
          } : undefined
        };
      })
      .filter(Boolean) as EventWithDistance[];
  }

  private sortEvents(
    events: EventWithDistance[],
    sortByDistance: boolean,
    userLocation: LocationData | null
  ): EventWithDistance[] {
    if (sortByDistance && userLocation) {
      return events.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      });
    }

    // Default sort by date
    return events.sort((a, b) => 
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
  }

  private generateLocationStats(
    events: EventWithDistance[],
    userLocation: LocationData | null
  ): LocationStats {
    const eventsByState: { [state: string]: number } = {};
    const eventsByCity: { [city: string]: number } = {};
    const distances: number[] = [];

    let nearestEvent: EventWithDistance | undefined;
    let farthestEvent: EventWithDistance | undefined;

    events.forEach(event => {
      if (event.venue_info) {
        // Count by state
        const state = event.venue_info.state;
        eventsByState[state] = (eventsByState[state] || 0) + 1;

        // Count by city
        const city = `${event.venue_info.city}, ${state}`;
        eventsByCity[city] = (eventsByCity[city] || 0) + 1;
      }

      // Track distances
      if (event.distance !== undefined) {
        distances.push(event.distance);

        if (!nearestEvent || event.distance < (nearestEvent.distance || Infinity)) {
          nearestEvent = event;
        }

        if (!farthestEvent || event.distance > (farthestEvent.distance || 0)) {
          farthestEvent = event;
        }
      }
    });

    const averageDistance = distances.length > 0
      ? distances.reduce((sum, dist) => sum + dist, 0) / distances.length
      : undefined;

    return {
      totalEvents: events.length,
      eventsByState,
      eventsByCity,
      averageDistance,
      nearestEvent,
      farthestEvent
    };
  }

  private async generateLocationSuggestions(
    params: LocationSearchParams
  ): Promise<LocationSuggestion[]> {
    // This would generate intelligent location suggestions based on:
    // - User's current search
    // - Popular locations
    // - Nearby areas with events
    // - User's search history
    
    // For now, return empty array
    return [];
  }
}

export const locationSearchService = new LocationSearchService();