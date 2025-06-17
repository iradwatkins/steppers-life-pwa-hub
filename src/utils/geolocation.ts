export interface LocationData {
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  country?: string;
}

export interface GeolocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  fallback?: LocationData;
}

/**
 * Get user's current location using browser geolocation
 * Falls back to Chicago, IL if geolocation fails or is denied
 */
export const getCurrentLocation = async (options: GeolocationOptions = {}): Promise<LocationData> => {
  const {
    timeout = 10000,
    enableHighAccuracy = false,
    fallback = { city: 'Chicago', state: 'Illinois' }
  } = options;

  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using fallback location');
      resolve(fallback);
      return;
    }

    // Get position with timeout
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use free reverse geocoding service
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const locationData: LocationData = {
              city: data.city || data.locality || fallback.city,
              state: data.principalSubdivision || fallback.state,
              latitude,
              longitude,
              country: data.countryName
            };
            
            console.log('Geolocation detected:', locationData);
            resolve(locationData);
          } else {
            console.log('Reverse geocoding failed, using fallback with coordinates');
            resolve({
              ...fallback,
              latitude,
              longitude
            });
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          resolve({
            ...fallback,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      },
      (error) => {
        console.log('Geolocation denied or failed:', error.message);
        resolve(fallback);
      },
      {
        timeout,
        enableHighAccuracy,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3958.8; // Earth's radius in miles
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format location for display
 */
export const formatLocation = (location: LocationData): string => {
  return `${location.city}, ${location.state}`;
};

/**
 * Get stored user location from localStorage
 */
export const getStoredLocation = (): LocationData | null => {
  try {
    const stored = localStorage.getItem('user-location');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Store user location in localStorage
 */
export const storeLocation = (location: LocationData): void => {
  try {
    localStorage.setItem('user-location', JSON.stringify(location));
  } catch (error) {
    console.error('Failed to store location:', error);
  }
};

/**
 * Geocode an address to get latitude and longitude coordinates
 * Uses free geocoding service with rate limiting considerations
 */
export const geocodeAddress = async (address: {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
}): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Construct full address for geocoding
    const fullAddress = [
      address.street,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean).join(', ');

    console.log('Geocoding address:', fullAddress);

    // Use Nominatim (OpenStreetMap) free geocoding service
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'SteppersLife-Events/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
      
      console.log('Geocoding successful:', coordinates);
      return coordinates;
    }

    console.log('No geocoding results found for address:', fullAddress);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};