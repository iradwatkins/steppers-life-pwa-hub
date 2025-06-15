import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Star, 
  Navigation, 
  Heart, 
  Clock, 
  Users, 
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Bookmark,
  History,
  RefreshCw,
  ExternalLink,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecommendedEvent {
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
  instructor: string;
  rating: number;
  attendees: number;
  distance: string;
  coordinates: { lat: number; lng: number };
  reason: string;
  confidence: number;
  trending: boolean;
  newVenue: boolean;
}

interface LocationHistory {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  visitCount: number;
  lastVisited: Date;
  eventTypes: string[];
  averageRating: number;
  isFavorite: boolean;
}

interface UserPreferences {
  categories: string[];
  maxDistance: number;
  priceRange: { min: number; max: number };
  timePreferences: string[];
  skillLevels: string[];
  instructorPreferences: string[];
}

interface LocationRecommendationsCardProps {
  userLocation?: { lat: number; lng: number } | null;
  userPreferences?: UserPreferences;
  onEventSelect?: (eventId: number) => void;
  onLocationSave?: (location: LocationHistory) => void;
  className?: string;
}

const LocationRecommendationsCard: React.FC<LocationRecommendationsCardProps> = ({
  userLocation,
  userPreferences,
  onEventSelect,
  onLocationSave,
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedEvent[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<RecommendedEvent[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<LocationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');

  // Mock data for demonstration
  const mockRecommendations: RecommendedEvent[] = [
    {
      id: 1,
      title: "Advanced Stepping Workshop",
      date: "2024-07-20",
      time: "7:00 PM",
      location: "Dance Elite Studio",
      address: "123 Michigan Ave",
      city: "Chicago",
      state: "IL",
      price: 35,
      category: "Workshop",
      instructor: "Angela Davis",
      rating: 4.9,
      attendees: 45,
      distance: "0.8 mi",
      coordinates: { lat: 41.8789, lng: -87.6359 },
      reason: "Matches your skill level and favorite instructor",
      confidence: 95,
      trending: true,
      newVenue: false
    },
    {
      id: 2,
      title: "Friday Night Social",
      date: "2024-07-19",
      time: "9:00 PM",
      location: "Southside Cultural Center",
      address: "456 State St",
      city: "Chicago",
      state: "IL",
      price: 15,
      category: "Social",
      instructor: "Marcus Thompson",
      rating: 4.7,
      attendees: 120,
      distance: "1.2 mi",
      coordinates: { lat: 41.8675, lng: -87.6189 },
      reason: "Popular in your area on Friday nights",
      confidence: 88,
      trending: false,
      newVenue: false
    },
    {
      id: 3,
      title: "Beginner-Friendly Session",
      date: "2024-07-21",
      time: "2:00 PM",
      location: "New Harmony Dance Space",
      address: "789 Wabash Ave",
      city: "Chicago",
      state: "IL",
      price: 20,
      category: "Class",
      instructor: "Sarah Williams",
      rating: 4.6,
      attendees: 30,
      distance: "2.1 mi",
      coordinates: { lat: 41.8925, lng: -87.6244 },
      reason: "New venue near your recent searches",
      confidence: 72,
      trending: false,
      newVenue: true
    }
  ];

  const mockLocationHistory: LocationHistory[] = [
    {
      id: 'loc-1',
      name: 'Chicago Cultural Center',
      address: '78 E Washington St',
      city: 'Chicago',
      state: 'IL',
      coordinates: { lat: 41.8836, lng: -87.6270 },
      visitCount: 8,
      lastVisited: new Date('2024-07-10'),
      eventTypes: ['Competition', 'Workshop', 'Social'],
      averageRating: 4.8,
      isFavorite: true
    },
    {
      id: 'loc-2',
      name: 'Dance Elite Studio',
      address: '123 Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      coordinates: { lat: 41.8789, lng: -87.6359 },
      visitCount: 5,
      lastVisited: new Date('2024-07-05'),
      eventTypes: ['Class', 'Workshop'],
      averageRating: 4.9,
      isFavorite: true
    },
    {
      id: 'loc-3',
      name: 'Community Center Downtown',
      address: '321 State St',
      city: 'Chicago',
      state: 'IL',
      coordinates: { lat: 41.8756, lng: -87.6244 },
      visitCount: 3,
      lastVisited: new Date('2024-06-28'),
      eventTypes: ['Social'],
      averageRating: 4.5,
      isFavorite: false
    }
  ];

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate API call for personalized recommendations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecommendations(mockRecommendations);
      setNearbyEvents(mockRecommendations.slice(0, 2));
      setLocationHistory(mockLocationHistory);
      setFavoriteLocations(mockLocationHistory.filter(loc => loc.isFavorite));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      loadRecommendations();
    }
  }, [userLocation, userPreferences]);

  const toggleFavorite = (locationId: string) => {
    setLocationHistory(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, isFavorite: !loc.isFavorite }
        : loc
    ));
    
    setFavoriteLocations(prev => {
      const location = locationHistory.find(loc => loc.id === locationId);
      if (!location) return prev;
      
      if (location.isFavorite) {
        return prev.filter(fav => fav.id !== locationId);
      } else {
        return [...prev, { ...location, isFavorite: true }];
      }
    });
  };

  const getDirections = (coordinates: { lat: number; lng: number }) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : 'current+location';
    const dest = `${coordinates.lat},${coordinates.lng}`;
    const url = `https://www.google.com/maps/dir/${origin}/${dest}`;
    window.open(url, '_blank');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatLastVisited = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (!userLocation) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-gray-500">Enable location to see personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
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
            <Target className="w-5 h-5 text-brand-primary" />
            Location Recommendations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadRecommendations}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              For You
            </TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs">
              <Navigation className="w-3 h-3 mr-1" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-3 h-3 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Personalized Recommendations */}
          <TabsContent value="recommendations" className="space-y-4 mt-4">
            <div className="text-sm text-gray-600 mb-3">
              Based on your preferences, location history, and trending events
            </div>
            
            {recommendations.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      {event.trending && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {event.newVenue && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          New Venue
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {event.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}, {event.city}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-brand-primary">${event.price}</div>
                    <div className="text-xs text-gray-500">{event.attendees} attending</div>
                  </div>
                </div>

                {/* Recommendation Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                  <div className="text-xs text-blue-800 flex items-center justify-between">
                    <span>💡 {event.reason}</span>
                    <span className={`font-medium ${getConfidenceColor(event.confidence)}`}>
                      {event.confidence}% match
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" asChild className="flex-1">
                    <Link to={`/event/${event.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Event
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => getDirections(event.coordinates)}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Nearby Events */}
          <TabsContent value="nearby" className="space-y-4 mt-4">
            <div className="text-sm text-gray-600 mb-3">
              Events happening near your current location
            </div>
            
            {nearbyEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="text-sm text-gray-600">
                      {event.location} • {event.distance} away
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${event.price}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {event.rating}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" asChild className="flex-1">
                    <Link to={`/event/${event.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => getDirections(event.coordinates)}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Favorite Locations */}
          <TabsContent value="favorites" className="space-y-4 mt-4">
            <div className="text-sm text-gray-600 mb-3">
              Your saved favorite venues and locations
            </div>
            
            {favoriteLocations.length > 0 ? (
              favoriteLocations.map((location) => (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {location.name}
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </h4>
                      <div className="text-sm text-gray-600">
                        {location.address}, {location.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {location.averageRating}
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.visitCount} visits
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    {location.eventTypes.map(type => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Find Events Here
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => getDirections(location.coordinates)}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleFavorite(location.id)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No favorite locations yet</p>
                <p className="text-xs">Save venues you love to see them here</p>
              </div>
            )}
          </TabsContent>

          {/* Location History */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="text-sm text-gray-600 mb-3">
              Places you've visited for events
            </div>
            
            {locationHistory.map((location) => (
              <div key={location.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{location.name}</h4>
                    <div className="text-sm text-gray-600">
                      {location.address}, {location.city}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last visited: {formatLastVisited(location.lastVisited)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {location.visitCount} visits
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {location.averageRating}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {location.eventTypes.map(type => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Find Similar Events
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => getDirections(location.coordinates)}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toggleFavorite(location.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 ${location.isFavorite ? 'text-red-500 fill-current' : ''}`} 
                    />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LocationRecommendationsCard; 