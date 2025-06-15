export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationResult {
  address: string;
  coordinates: LocationCoordinates;
  city: string;
  state: string;
  country: string;
  formatted: string;
}

export interface LocationSearchOptions {
  radius?: number; // in miles
  sortByDistance?: boolean;
  includeUserLocation?: boolean;
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  type: 'saved' | 'recent' | 'favorite';
  lastUsed: Date;
  useCount: number;
}

// Haversine formula for calculating distance between two points
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get user's current location using GPS
export const getCurrentLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Mock geocoding service (would integrate with Google Places API in production)
export const geocodeAddress = async (address: string): Promise<LocationResult[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock geocoding results
  const mockResults: LocationResult[] = [
    {
      address: address,
      coordinates: { lat: 41.8781, lng: -87.6298 },
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      formatted: `${address}, Chicago, IL, USA`
    },
    {
      address: `${address} (nearby)`,
      coordinates: { lat: 41.8781 + Math.random() * 0.1, lng: -87.6298 + Math.random() * 0.1 },
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      formatted: `${address} (nearby), Chicago, IL, USA`
    }
  ];
  
  return mockResults;
};

// Location autocomplete service
export const getLocationSuggestions = async (query: string): Promise<LocationResult[]> => {
  if (query.length < 2) return [];
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock location suggestions
  const mockSuggestions: LocationResult[] = [
    {
      address: 'Chicago, IL',
      coordinates: { lat: 41.8781, lng: -87.6298 },
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      formatted: 'Chicago, IL, USA'
    },
    {
      address: 'Atlanta, GA',
      coordinates: { lat: 33.7490, lng: -84.3880 },
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      formatted: 'Atlanta, GA, USA'
    },
    {
      address: 'Detroit, MI',
      coordinates: { lat: 42.3314, lng: -83.0458 },
      city: 'Detroit',
      state: 'MI',
      country: 'USA',
      formatted: 'Detroit, MI, USA'
    },
    {
      address: 'Houston, TX',
      coordinates: { lat: 29.7604, lng: -95.3698 },
      city: 'Houston',
      state: 'TX',
      country: 'USA',
      formatted: 'Houston, TX, USA'
    },
    {
      address: 'Memphis, TN',
      coordinates: { lat: 35.1495, lng: -90.0490 },
      city: 'Memphis',
      state: 'TN',
      country: 'USA',
      formatted: 'Memphis, TN, USA'
    },
    {
      address: 'Dallas, TX',
      coordinates: { lat: 32.7767, lng: -96.7970 },
      city: 'Dallas',
      state: 'TX',
      country: 'USA',
      formatted: 'Dallas, TX, USA'
    }
  ].filter(location => 
    location.address.toLowerCase().includes(query.toLowerCase()) ||
    location.city.toLowerCase().includes(query.toLowerCase()) ||
    location.state.toLowerCase().includes(query.toLowerCase())
  );
  
  return mockSuggestions.slice(0, 5);
};

// Saved locations management
const SAVED_LOCATIONS_KEY = 'stepperslife_saved_locations';

export const getSavedLocations = (): SavedLocation[] => {
  try {
    const saved = localStorage.getItem(SAVED_LOCATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveLocation = (location: Omit<SavedLocation, 'id' | 'lastUsed' | 'useCount'>): SavedLocation => {
  const savedLocations = getSavedLocations();
  const newLocation: SavedLocation = {
    ...location,
    id: Date.now().toString(),
    lastUsed: new Date(),
    useCount: 1
  };
  
  savedLocations.push(newLocation);
  localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(savedLocations));
  return newLocation;
};

export const updateLocationUsage = (locationId: string): void => {
  const savedLocations = getSavedLocations();
  const location = savedLocations.find(loc => loc.id === locationId);
  
  if (location) {
    location.lastUsed = new Date();
    location.useCount += 1;
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(savedLocations));
  }
};

export const removeLocation = (locationId: string): void => {
  const savedLocations = getSavedLocations();
  const filtered = savedLocations.filter(loc => loc.id !== locationId);
  localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(filtered));
};

export const getRecentLocations = (): SavedLocation[] => {
  return getSavedLocations()
    .filter(loc => loc.type === 'recent')
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 5);
};

export const getFavoriteLocations = (): SavedLocation[] => {
  return getSavedLocations()
    .filter(loc => loc.type === 'favorite')
    .sort((a, b) => b.useCount - a.useCount);
};

// Add location to recent searches
export const addToRecentLocations = (location: LocationResult): void => {
  const savedLocations = getSavedLocations();
  
  // Check if already exists in recent
  const existingIndex = savedLocations.findIndex(
    loc => loc.coordinates.lat === location.coordinates.lat && 
           loc.coordinates.lng === location.coordinates.lng &&
           loc.type === 'recent'
  );
  
  if (existingIndex >= 0) {
    // Update existing
    updateLocationUsage(savedLocations[existingIndex].id);
  } else {
    // Add new recent location
    const recentLocation: Omit<SavedLocation, 'id' | 'lastUsed' | 'useCount'> = {
      name: location.address,
      address: location.formatted,
      coordinates: location.coordinates,
      type: 'recent'
    };
    
    saveLocation(recentLocation);
    
    // Keep only last 10 recent locations
    const allRecent = getRecentLocations();
    if (allRecent.length > 10) {
      removeLocation(allRecent[allRecent.length - 1].id);
    }
  }
};

// Filter items by location and distance
export const filterByLocation = <T extends { coordinates?: LocationCoordinates; location?: string; city?: string }>(
  items: T[],
  userLocation: LocationCoordinates | null,
  radius: number,
  options: LocationSearchOptions = {}
): T[] => {
  if (!userLocation || !radius) return items;
  
  const filtered = items.filter(item => {
    if (!item.coordinates) return true; // Include items without coordinates
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      item.coordinates.lat,
      item.coordinates.lng
    );
    
    return distance <= radius;
  });
  
  if (options.sortByDistance) {
    return filtered.sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;
      
      const distanceA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.coordinates.lat,
        a.coordinates.lng
      );
      
      const distanceB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.coordinates.lat,
        b.coordinates.lng
      );
      
      return distanceA - distanceB;
    });
  }
  
  return filtered;
};

// Get distance text for display
export const getDistanceText = (
  userLocation: LocationCoordinates | null,
  itemLocation: LocationCoordinates
): string => {
  if (!userLocation) return '';
  
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    itemLocation.lat,
    itemLocation.lng
  );
  
  if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} ft`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} mi`;
  } else {
    return `${Math.round(distance)} mi`;
  }
};

export default {
  calculateDistance,
  getCurrentLocation,
  geocodeAddress,
  getLocationSuggestions,
  getSavedLocations,
  saveLocation,
  updateLocationUsage,
  removeLocation,
  getRecentLocations,
  getFavoriteLocations,
  addToRecentLocations,
  filterByLocation,
  getDistanceText
}; 