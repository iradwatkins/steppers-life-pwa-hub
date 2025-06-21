import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  Navigation, 
  Phone, 
  Globe, 
  Mail, 
  Parking, 
  Wifi, 
  Car, 
  Train,
  ChevronRight,
  ExternalLink,
  Share,
  Bookmark,
  BookmarkPlus,
  Route,
  Info,
  Image as ImageIcon,
  Play,
  Volume2,
  Camera,
  Grid3X3,
  Heart,
  Flag,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Coffee,
  Utensils,
  Music,
  Zap
} from 'lucide-react';
import { formatLocation, calculateDistance, type LocationData } from '@/utils/geolocation';
import EventMapView, { type EventWithMapData } from '@/components/maps/EventMapView';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VenueData {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  venue_type: string;
  
  // Contact Information
  phone?: string;
  email?: string;
  website?: string;
  
  // Capacity and Specifications
  capacity: number;
  dance_floor_size?: string;
  private_rooms?: number;
  
  // Features and Amenities
  parking_available: boolean;
  parking_type?: 'free' | 'paid' | 'valet' | 'street';
  public_transit_nearby: boolean;
  wheelchair_accessible: boolean;
  wifi_available: boolean;
  sound_system: boolean;
  bar_service: boolean;
  catering_available: boolean;
  coat_check: boolean;
  security: boolean;
  
  // Venue Details
  dress_code?: string;
  age_restriction?: string;
  operating_hours?: {
    [key: string]: { open: string; close: string } | null;
  };
  
  // Media
  images?: string[];
  virtual_tour_url?: string;
  
  // Ratings and Reviews
  rating: number;
  review_count: number;
  verified: boolean;
  
  // Pricing
  rental_rates?: {
    hourly?: number;
    daily?: number;
    package_deals?: { name: string; price: number; description: string }[];
  };
  
  // Events
  upcoming_events?: EventWithMapData[];
  past_events_count?: number;
  
  // Owner/Manager Info
  manager?: {
    name: string;
    phone?: string;
    email?: string;
    verified: boolean;
  };
}

interface VenueReview {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  review_text: string;
  date: string;
  event_attended?: string;
  verified_attendee: boolean;
  helpful_count: number;
  photos?: string[];
}

const VenueDetailPage = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [reviews, setReviews] = useState<VenueReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (venueId) {
      loadVenueData(venueId);
      loadUserLocation();
    }
  }, [venueId]);

  const loadVenueData = async (id: string) => {
    setIsLoading(true);
    try {
      // Mock venue data - in real implementation, would fetch from API
      const mockVenue: VenueData = {
        id,
        name: "Grand Ballroom at Navy Pier",
        description: "An elegant ballroom overlooking Lake Michigan, perfect for Chicago stepping events. Our spacious dance floor and professional sound system create the ideal atmosphere for both beginners and seasoned steppers.",
        address: "600 E Grand Ave",
        city: "Chicago",
        state: "Illinois",
        zipCode: "60611",
        latitude: 41.8919,
        longitude: -87.6051,
        venue_type: "ballroom",
        
        phone: "(312) 595-7437",
        email: "events@navypier.org",
        website: "https://navypier.org/venues/grand-ballroom",
        
        capacity: 500,
        dance_floor_size: "40' x 60'",
        private_rooms: 2,
        
        parking_available: true,
        parking_type: "paid",
        public_transit_nearby: true,
        wheelchair_accessible: true,
        wifi_available: true,
        sound_system: true,
        bar_service: true,
        catering_available: true,
        coat_check: true,
        security: true,
        
        dress_code: "Cocktail attire preferred",
        age_restriction: "21+",
        operating_hours: {
          "Monday": null,
          "Tuesday": null,
          "Wednesday": { open: "6:00 PM", close: "11:00 PM" },
          "Thursday": { open: "6:00 PM", close: "11:00 PM" },
          "Friday": { open: "6:00 PM", close: "2:00 AM" },
          "Saturday": { open: "6:00 PM", close: "2:00 AM" },
          "Sunday": { open: "6:00 PM", close: "11:00 PM" }
        },
        
        images: [
          "/api/placeholder/800/600",
          "/api/placeholder/800/600",
          "/api/placeholder/800/600",
          "/api/placeholder/800/600"
        ],
        virtual_tour_url: "https://tour.example.com/grand-ballroom",
        
        rating: 4.7,
        review_count: 89,
        verified: true,
        
        rental_rates: {
          hourly: 450,
          daily: 2500,
          package_deals: [
            { name: "Weekend Package", price: 2000, description: "6-hour rental with basic sound system" },
            { name: "Premium Package", price: 3500, description: "8-hour rental with full A/V, catering setup" }
          ]
        },
        
        upcoming_events: [
          {
            id: "evt1",
            title: "New Year's Eve Stepping Gala",
            event_date: "2024-12-31",
            event_time: "8:00 PM",
            price_min: 85,
            venue: {
              id: id,
              name: "Grand Ballroom at Navy Pier",
              address: "600 E Grand Ave",
              city: "Chicago",
              state: "Illinois",
              latitude: 41.8919,
              longitude: -87.6051
            },
            featured: true,
            tickets_available: true
          }
        ],
        past_events_count: 23,
        
        manager: {
          name: "Sarah Johnson",
          phone: "(312) 595-7440",
          email: "sarah.johnson@navypier.org",
          verified: true
        }
      };

      const mockReviews: VenueReview[] = [
        {
          id: "rev1",
          user_name: "Marcus Thompson",
          rating: 5,
          review_text: "Amazing venue for stepping! The dance floor is perfect size and the sound system is top-notch. Staff was very accommodating for our event.",
          date: "2024-11-15",
          event_attended: "Halloween Stepping Social",
          verified_attendee: true,
          helpful_count: 12,
          photos: ["/api/placeholder/200/150"]
        },
        {
          id: "rev2",
          user_name: "Denise Williams",
          rating: 4,
          review_text: "Beautiful venue with great views. Parking can be a bit expensive but it's convenient. The bar service was excellent.",
          date: "2024-10-28",
          verified_attendee: true,
          helpful_count: 8
        }
      ];

      setVenue(mockVenue);
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading venue data:', error);
      toast.error('Failed to load venue details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserLocation = async () => {
    try {
      const stored = localStorage.getItem('user-location');
      if (stored) {
        setUserLocation(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  const getDistance = (): number | undefined => {
    if (!userLocation?.latitude || !userLocation?.longitude || !venue?.latitude || !venue?.longitude) {
      return undefined;
    }
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      venue.latitude,
      venue.longitude
    );
  };

  const handleShare = () => {
    if (navigator.share && venue) {
      navigator.share({
        title: venue.name,
        text: `Check out ${venue.name} - a great venue for Chicago stepping events!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Venue link copied to clipboard!');
    }
  };

  const handleSaveVenue = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Venue removed from saved' : 'Venue saved!');
  };

  const getDirections = () => {
    if (venue) {
      const address = encodeURIComponent(`${venue.address}, ${venue.city}, ${venue.state}`);
      window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank');
    }
  };

  const formatOperatingHours = (hours: VenueData['operating_hours']) => {
    if (!hours) return 'Hours not available';
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return daysOfWeek.map(day => {
      const dayHours = hours[day];
      return {
        day,
        hours: dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Closed'
      };
    });
  };

  const renderAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      parking: <Car className="h-4 w-4" />,
      transit: <Train className="h-4 w-4" />,
      wheelchair: <Shield className="h-4 w-4" />,
      wifi: <Wifi className="h-4 w-4" />,
      sound: <Volume2 className="h-4 w-4" />,
      bar: <Coffee className="h-4 w-4" />,
      catering: <Utensils className="h-4 w-4" />,
      coat: <Shield className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />
    };
    return icons[amenity] || <CheckCircle className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stepping-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Venue Not Found</h1>
          <p className="text-muted-foreground mb-4">The venue you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const distance = getDistance();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                ← Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  {venue.name}
                  {venue.verified && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.address}, {venue.city}, {venue.state}</span>
                  {distance && (
                    <Badge variant="outline" className="text-xs">
                      {distance.toFixed(1)} miles away
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleSaveVenue}>
                {isSaved ? (
                  <Bookmark className="h-4 w-4 mr-2 fill-current" />
                ) : (
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                )}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={getDirections}>
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{venue.rating}</span>
              <span className="text-muted-foreground">({venue.review_count} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{venue.capacity} capacity</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {venue.venue_type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={venue.images?.[selectedImage] || "/api/placeholder/800/400"}
                    alt={venue.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {venue.images?.slice(0, 4).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "w-16 h-12 border-2 rounded overflow-hidden",
                          selectedImage === index ? "border-white" : "border-white/50"
                        )}
                      >
                        <img
                          src={venue.images[index]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {venue.images && venue.images.length > 4 && (
                      <div className="w-16 h-12 bg-black/50 border-2 border-white/50 rounded flex items-center justify-center text-white text-xs">
                        +{venue.images.length - 4}
                      </div>
                    )}
                  </div>
                  {venue.virtual_tour_url && (
                    <Button
                      variant="secondary"
                      className="absolute top-4 right-4"
                      onClick={() => window.open(venue.virtual_tour_url, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Virtual Tour
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {venue.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {venue.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities and Features */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.parking_available && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('parking')}
                      <span className="text-sm">
                        Parking ({venue.parking_type})
                      </span>
                    </div>
                  )}
                  {venue.public_transit_nearby && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('transit')}
                      <span className="text-sm">Public Transit</span>
                    </div>
                  )}
                  {venue.wheelchair_accessible && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('wheelchair')}
                      <span className="text-sm">Wheelchair Accessible</span>
                    </div>
                  )}
                  {venue.wifi_available && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('wifi')}
                      <span className="text-sm">WiFi Available</span>
                    </div>
                  )}
                  {venue.sound_system && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('sound')}
                      <span className="text-sm">Professional Sound System</span>
                    </div>
                  )}
                  {venue.bar_service && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('bar')}
                      <span className="text-sm">Bar Service</span>
                    </div>
                  )}
                  {venue.catering_available && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('catering')}
                      <span className="text-sm">Catering Available</span>
                    </div>
                  )}
                  {venue.coat_check && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('coat')}
                      <span className="text-sm">Coat Check</span>
                    </div>
                  )}
                  {venue.security && (
                    <div className="flex items-center gap-2">
                      {renderAmenityIcon('security')}
                      <span className="text-sm">Security</span>
                    </div>
                  )}
                </div>

                {venue.dance_floor_size && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Music className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Dance Floor</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {venue.dance_floor_size} • Perfect for Chicago stepping
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            {venue.upcoming_events && venue.upcoming_events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Events scheduled at this venue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venue.upcoming_events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.event_date).toLocaleDateString()}
                            </div>
                            {event.event_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.event_time}
                              </div>
                            )}
                            {event.price_min && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${event.price_min}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/events/${event.id}`}>
                            View Event
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  What people are saying about this venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.user_avatar} />
                          <AvatarFallback>{review.user_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.user_name}</span>
                            {review.verified_attendee && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < review.rating 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.review_text}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(review.date).toLocaleDateString()}</span>
                            {review.event_attended && (
                              <span>• Attended: {review.event_attended}</span>
                            )}
                            <span>• {review.helpful_count} found helpful</span>
                          </div>
                        </div>
                      </div>
                      {review !== reviews[reviews.length - 1] && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venue.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${venue.phone}`} className="text-sm hover:underline">
                      {venue.phone}
                    </a>
                  </div>
                )}
                {venue.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${venue.email}`} className="text-sm hover:underline">
                      {venue.email}
                    </a>
                  </div>
                )}
                {venue.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={venue.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                {venue.manager && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Venue Manager</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{venue.manager.name}</span>
                      {venue.manager.verified && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    {venue.manager.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${venue.manager.phone}`} className="text-xs hover:underline">
                          {venue.manager.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatOperatingHours(venue.operating_hours).map(({ day, hours }) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{day}</span>
                      <span className={hours === 'Closed' ? 'text-muted-foreground' : 'font-medium'}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Venue Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {venue.dress_code && (
                  <div>
                    <p className="text-sm font-medium">Dress Code</p>
                    <p className="text-sm text-muted-foreground">{venue.dress_code}</p>
                  </div>
                )}
                {venue.age_restriction && (
                  <div>
                    <p className="text-sm font-medium">Age Restriction</p>
                    <p className="text-sm text-muted-foreground">{venue.age_restriction}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive map would be here</p>
                  </div>
                </div>
                <Button onClick={getDirections} className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            {/* Rental Information */}
            {venue.rental_rates && (
              <Card>
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {venue.rental_rates.hourly && (
                    <div className="flex justify-between">
                      <span className="text-sm">Hourly Rate</span>
                      <span className="text-sm font-medium">${venue.rental_rates.hourly}/hour</span>
                    </div>
                  )}
                  {venue.rental_rates.daily && (
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Rate</span>
                      <span className="text-sm font-medium">${venue.rental_rates.daily}/day</span>
                    </div>
                  )}
                  
                  {venue.rental_rates.package_deals && venue.rental_rates.package_deals.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Package Deals</p>
                      <div className="space-y-2">
                        {venue.rental_rates.package_deals.map((pkg, index) => (
                          <div key={index} className="p-2 bg-muted rounded">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium">{pkg.name}</span>
                              <span className="text-sm font-bold">${pkg.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{pkg.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button className="w-full" asChild>
                    <a href={`mailto:${venue.email}?subject=Venue Rental Inquiry`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Inquire About Rental
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;