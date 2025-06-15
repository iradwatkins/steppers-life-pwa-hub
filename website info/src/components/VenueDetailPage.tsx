import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  Star, 
  Phone, 
  Globe, 
  Mail,
  Car,
  Bus,
  Accessibility,
  Wifi,
  Camera,
  Music,
  Heart,
  Share2,
  Route,
  Calendar,
  DollarSign,
  Info,
  Settings
} from 'lucide-react';
import VenuePhotoUpload from './VenuePhotoUpload';
import TransitRoutingCard from './TransitRoutingCard';
import ParkingInfoCard from './ParkingInfoCard';

interface VenueEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  category: string;
  price: number;
  soldOut: boolean;
}

interface VenuePhoto {
  id: string;
  url: string;
  title: string;
  description: string;
  isMainPhoto: boolean;
  isPublic: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  order: number;
}

interface VenueDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  description: string;
  capacity: number;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  photos: VenuePhoto[];
  accessibility?: {
    wheelchairAccessible: boolean;
    elevatorAccess: boolean;
    accessibleParking: boolean;
    accessibleRestrooms: boolean;
    hearingLoop: boolean;
    signLanguage: boolean;
    serviceAnimals: boolean;
    description: string;
  };
  parking?: {
    available: boolean;
    spots: number;
    price: string;
    description: string;
  };
  publicTransit?: {
    nearbyStops: Array<{
      type: string;
      name: string;
      distance: string;
      lines: string[];
    }>;
  };
  upcomingEvents: VenueEvent[];
}

const VenueDetailPage: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [userCanEdit, setUserCanEdit] = useState(false);

  // Mock user permissions check (in real app, get from auth context)
  useEffect(() => {
    // Simulate checking if user is venue manager, event coordinator, or admin
    const checkUserPermissions = async () => {
      // In real app: check user role and venue ownership
      const userRoles = ['event_coordinator', 'venue_manager']; // Mock roles
      const canEdit = userRoles.includes('event_coordinator') || userRoles.includes('venue_manager');
      setUserCanEdit(canEdit);
    };

    checkUserPermissions();
  }, [venueId]);

  // Load venue data (including photos from database)
  useEffect(() => {
    const loadVenueData = async () => {
      try {
        // In real app: fetch from API
        // const response = await fetch(`/api/venues/${venueId}`);
        // const venueData = await response.json();
        
        // Mock venue data with photos from database
        const venueData: VenueDetails = {
          id: venueId || '1',
          name: 'Chicago Cultural Center',
          address: '78 E Washington St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60602',
          coordinates: { lat: 41.8836, lng: -87.6270 },
          description: 'The Chicago Cultural Center is one of the city\'s most visited attractions and has been called the "People\'s Palace." The stunning architecture and world-class art exhibitions make it a premier venue for cultural events and performances.',
          capacity: 800,
          phone: '(312) 744-6630',
          email: 'info@chicagoculturalcenter.org',
          website: 'https://www.chicago.gov/city/en/depts/dca/supp_info/chicago_cultural_center.html',
          rating: 4.8,
          reviewCount: 2847,
          // Updated photos structure from database
          photos: [
            {
              id: 'photo-1',
              url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop&auto=format',
              title: 'Main Hall',
              description: 'Beautiful main hall with stunning architecture',
              isMainPhoto: true,
              isPublic: true,
              uploadedBy: 'John Smith',
              uploadedAt: new Date('2024-01-15'),
              order: 0
            },
            {
              id: 'photo-2',
              url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&auto=format',
              title: 'Event Setup',
              description: 'Example of event setup for performances',
              isMainPhoto: false,
              isPublic: true,
              uploadedBy: 'Jane Doe',
              uploadedAt: new Date('2024-01-20'),
              order: 1
            },
            {
              id: 'photo-3',
              url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format',
              title: 'Entrance Lobby',
              description: 'Welcoming entrance area',
              isMainPhoto: false,
              isPublic: true,
              uploadedBy: 'Mike Johnson',
              uploadedAt: new Date('2024-02-01'),
              order: 2
            }
          ],
          // Optional accessibility information
          accessibility: {
            wheelchairAccessible: true,
            elevatorAccess: true,
            accessibleParking: true,
            accessibleRestrooms: true,
            hearingLoop: true,
            signLanguage: false,
            serviceAnimals: true,
            description: 'The Chicago Cultural Center is fully ADA compliant with wheelchair accessible entrances, elevators to all floors, accessible restrooms, and assistive listening devices available upon request.'
          },
          // Optional parking information
          parking: {
            available: true,
            spots: 150,
            price: '$15-25',
            description: 'Several parking garages within 2 blocks. Street parking available with meter fees. Valet service available for special events.'
          },
          // Optional public transit information
          publicTransit: {
            nearbyStops: [
              {
                type: 'CTA Bus',
                name: 'Washington/State',
                distance: '0.1 mi',
                lines: ['20', '56', '124']
              },
              {
                type: 'CTA L',
                name: 'Washington/State (Red Line)',
                distance: '0.2 mi',
                lines: ['Red']
              },
              {
                type: 'CTA L',
                name: 'Lake (Blue/Green Line)',
                distance: '0.3 mi',
                lines: ['Blue', 'Green']
              }
            ]
          },
          upcomingEvents: [
            {
              id: 1,
              title: 'Chicago Step Championship',
              date: '2024-07-15',
              time: '7:00 PM',
              category: 'Competition',
              price: 45,
              soldOut: false
            },
            {
              id: 2,
              title: 'Summer Step Social',
              date: '2024-07-20',
              time: '8:00 PM',
              category: 'Social',
              price: 15,
              soldOut: false
            },
            {
              id: 3,
              title: 'Youth Workshop Series',
              date: '2024-07-25',
              time: '2:00 PM',
              category: 'Workshop',
              price: 25,
              soldOut: true
            }
          ]
        };

        setVenue(venueData);
      } catch (error) {
        console.error('Failed to load venue data:', error);
      }
    };

    loadVenueData();
  }, [venueId]);

  const handlePhotosUpdated = (updatedPhotos: VenuePhoto[]) => {
    if (venue) {
      setVenue({
        ...venue,
        photos: updatedPhotos
      });
    }
  };

  const getDirections = () => {
    if (venue) {
      const googleMapsUrl = `https://www.google.com/maps/dir//${venue.coordinates.lat},${venue.coordinates.lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const shareVenue = async () => {
    if (navigator.share && venue) {
      try {
        await navigator.share({
          title: venue.name,
          text: `Check out ${venue.name} - a great venue for events!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Venue link copied to clipboard!');
    }
  };

  if (!venue) {
    return (
      <div className="min-h-screen bg-background-main py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate number of tabs for grid layout
  const getTabGridCols = () => {
    let cols = 2; // events + contact (always present)
    if (venue.accessibility) cols++;
    if (venue.parking || venue.publicTransit) cols++;
    if (userCanEdit) cols++;
    
    // Return appropriate grid class
    switch (cols) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-2';
    }
  };

  // Only show public photos to regular users, all photos to editors
  const displayPhotos = userCanEdit ? venue.photos : venue.photos.filter(p => p.isPublic);

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/events" className="text-brand-primary hover:underline">
              ← Back to Events
            </Link>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFavorited(!isFavorited)}
                className={isFavorited ? 'bg-red-50 border-red-200 text-red-600' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={shareVenue}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Venue Info */}
            <div className="md:col-span-2">
              <h1 className="font-serif text-4xl font-bold text-text-primary mb-3">
                {venue.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{venue.rating}</span>
                  <span className="text-text-secondary">({venue.reviewCount} reviews)</span>
                </div>
                <Badge variant="outline">Capacity: {venue.capacity}</Badge>
                {userCanEdit && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Settings className="w-3 h-3 mr-1" />
                    Can Edit
                  </Badge>
                )}
              </div>

              <div className="flex items-start gap-2 mb-4">
                <MapPin className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <div className="font-medium">{venue.address}</div>
                  <div className="text-text-secondary">{venue.city}, {venue.state} {venue.zipCode}</div>
                </div>
              </div>

              <p className="text-text-secondary leading-relaxed">
                {venue.description}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button onClick={getDirections} className="w-full">
                <Route className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${venue.phone}`}>
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={venue.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={displayPhotos[activePhoto]?.url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop&auto=format'} 
                alt={displayPhotos[activePhoto]?.title || `${venue.name} - Photo ${activePhoto + 1}`}
                className="w-full h-96 object-cover rounded-t-lg"
              />
              {displayPhotos.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {displayPhotos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setActivePhoto(index)}
                        className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                          activePhoto === index ? 'border-white' : 'border-white/50'
                        }`}
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Photo info overlay */}
              {displayPhotos[activePhoto] && (
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                  <div className="text-sm font-medium">{displayPhotos[activePhoto].title}</div>
                  {displayPhotos[activePhoto].description && (
                    <div className="text-xs opacity-90">{displayPhotos[activePhoto].description}</div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className={`grid w-full ${getTabGridCols()}`}>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            {venue.accessibility && (
              <TabsTrigger value="accessibility">
                <Accessibility className="w-4 h-4 mr-2" />
                Accessibility
              </TabsTrigger>
            )}
            {(venue.parking || venue.publicTransit) && (
              <TabsTrigger value="transportation">
                <Car className="w-4 h-4 mr-2" />
                Transportation
              </TabsTrigger>
            )}
            <TabsTrigger value="contact">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            {userCanEdit && (
              <TabsTrigger value="manage">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </TabsTrigger>
            )}
          </TabsList>

          {/* Manage Tab (for venue editors only) */}
          {userCanEdit && (
            <TabsContent value="manage" className="space-y-6">
              <VenuePhotoUpload
                venueId={venue.id}
                existingPhotos={venue.photos}
                onPhotosUpdated={handlePhotosUpdated}
                canEdit={userCanEdit}
              />
            </TabsContent>
          )}

          {/* Upcoming Events */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {venue.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-border-default rounded-lg">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${event.price}</div>
                        {event.soldOut ? (
                          <Badge variant="destructive">Sold Out</Badge>
                        ) : (
                          <Button size="sm" asChild>
                            <Link to={`/event/${event.id}/tickets`}>Get Tickets</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility */}
          {venue.accessibility && (
            <TabsContent value="accessibility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-text-secondary">{venue.accessibility?.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: 'Wheelchair Accessible', value: venue.accessibility?.wheelchairAccessible },
                      { label: 'Elevator Access', value: venue.accessibility?.elevatorAccess },
                      { label: 'Accessible Parking', value: venue.accessibility?.accessibleParking },
                      { label: 'Accessible Restrooms', value: venue.accessibility?.accessibleRestrooms },
                      { label: 'Hearing Loop', value: venue.accessibility?.hearingLoop },
                      { label: 'Sign Language Services', value: venue.accessibility?.signLanguage },
                      { label: 'Service Animals Welcome', value: venue.accessibility?.serviceAnimals }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border-default rounded-lg">
                        <span className="font-medium">{feature.label}</span>
                        {feature.value ? (
                          <Badge className="bg-green-100 text-green-800">✓ Yes</Badge>
                        ) : (
                          <Badge variant="secondary">✗ No</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Transportation */}
          {(venue.parking || venue.publicTransit) && (
            <TabsContent value="transportation" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Enhanced Parking Information */}
                <ParkingInfoCard
                  destination={{
                    name: venue.name,
                    address: venue.address,
                    coordinates: venue.coordinates
                  }}
                  userLocation={null} // In real app, get from geolocation
                  eventDate={venue.upcomingEvents[0]?.date} // Use next event date if available
                  className="h-fit"
                />

                {/* Enhanced Transit Routing */}
                <TransitRoutingCard
                  destination={{
                    name: venue.name,
                    address: venue.address,
                    coordinates: venue.coordinates
                  }}
                  userLocation={null} // In real app, get from geolocation
                  className="h-fit"
                />
              </div>

              {/* Simple Transit Info Fallback */}
              {venue.publicTransit && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="w-5 h-5" />
                      Nearby Transit Stops
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-3">
                      Quick reference for nearby public transportation
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {venue.publicTransit?.nearbyStops.map((stop, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="font-medium text-sm">{stop.name}</div>
                          <div className="text-xs text-gray-600 mb-2">{stop.type} • {stop.distance} away</div>
                          <div className="flex gap-1 flex-wrap">
                            {stop.lines.map((line, lineIndex) => (
                              <Badge key={lineIndex} variant="outline" className="text-xs">{line}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transportation Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Getting Here</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        By Car
                      </h4>
                      <ul className="space-y-1 text-gray-600 ml-6">
                        <li>• Multiple parking options available nearby</li>
                        <li>• Street parking with meter fees</li>
                        <li>• Event pricing may apply during special events</li>
                        <li>• Consider ride-sharing during peak hours</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Bus className="w-4 h-4" />
                        By Public Transit
                      </h4>
                      <ul className="space-y-1 text-gray-600 ml-6">
                        <li>• Multiple CTA lines serve this area</li>
                        <li>• Check real-time arrivals above</li>
                        <li>• Allow extra time during events</li>
                        <li>• Evening service may be limited</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Contact Information */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-text-secondary" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <a href={`tel:${venue.phone}`} className="text-brand-primary hover:underline">
                          {venue.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-text-secondary" />
                      <div>
                        <div className="font-medium">Email</div>
                        <a href={`mailto:${venue.email}`} className="text-brand-primary hover:underline">
                          {venue.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-text-secondary" />
                      <div>
                        <div className="font-medium">Website</div>
                        <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-3">Address</div>
                    <div className="text-text-secondary">
                      <div>{venue.address}</div>
                      <div>{venue.city}, {venue.state} {venue.zipCode}</div>
                    </div>
                    <Button onClick={getDirections} className="mt-3">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VenueDetailPage; 