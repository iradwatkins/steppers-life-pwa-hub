import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, MapPin, Phone, Globe, Star, Search, Filter, Plus, Clock, CheckCircle } from 'lucide-react';
import { LocationSearchBar, LocationFilterPanel, LocationMapToggle } from '@/components/location';
import { 
  LocationResult, 
  LocationCoordinates, 
  getCurrentLocation, 
  filterByLocation, 
  getDistanceText 
} from '@/services/locationSearchService';
import FollowButton from '@/components/FollowButton';
import { Link } from 'react-router-dom';

const Community = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Location search state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');
  const [locationQuery, setLocationQuery] = useState('');
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [radius, setRadius] = useState(25);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Enhanced businesses data with location coordinates
  const businesses = [
    {
      id: 1,
      name: "Steppin' Threads Boutique",
      category: "Clothing & Accessories",
      description: "High-quality stepping shoes, apparel, and accessories for dancers of all levels.",
      location: "Chicago, IL",
      address: "123 State St, Chicago, IL 60604",
      city: "Chicago",
      state: "IL",
      phone: "(312) 555-0123",
      website: "www.steppinthreads.com",
      rating: 4.8,
      reviewCount: 67,
      image: "/placeholder.svg",
      verified: true,
      featured: true,
      hours: "Mon-Sat 10AM-8PM",
      specialties: ["Stepping Shoes", "Dance Apparel", "Accessories"],
      coordinates: { lat: 41.8781, lng: -87.6298 } as LocationCoordinates
    },
    {
      id: 2,
      name: "Smooth Moves Dance Studio",
      category: "Studios & Venues",
      description: "Premier dance studio offering private lessons, group classes, and event space rental.",
      location: "Atlanta, GA",
      address: "1234 Peachtree St NE, Atlanta, GA 30309",
      city: "Atlanta",
      state: "GA",
      phone: "(404) 555-0456",
      website: "www.smoothmovesdance.com",
      rating: 4.9,
      reviewCount: 123,
      image: "/placeholder.svg",
      verified: true,
      featured: false,
      hours: "Mon-Sun 9AM-11PM",
      specialties: ["Private Lessons", "Group Classes", "Event Space"],
      coordinates: { lat: 33.7490, lng: -84.3880 } as LocationCoordinates
    },
    {
      id: 3,
      name: "DJ Marcus Events",
      category: "Entertainment Services",
      description: "Professional DJ services for stepping events, socials, and competitions.",
      location: "Detroit, MI",
      address: "567 Woodward Ave, Detroit, MI 48226",
      city: "Detroit",
      state: "MI",
      phone: "(313) 555-0789",
      website: "www.djmarcusevents.com",
      rating: 4.7,
      reviewCount: 89,
      image: "/placeholder.svg",
      verified: true,
      featured: false,
      hours: "Available 24/7",
      specialties: ["Event DJ", "Stepping Music", "Sound Equipment"],
      coordinates: { lat: 42.3314, lng: -83.0458 } as LocationCoordinates
    },
    {
      id: 4,
      name: "Step Perfect Photography",
      category: "Photography Services",
      description: "Capturing the elegance and passion of stepping through professional photography.",
      location: "Houston, TX",
      address: "890 Main St, Houston, TX 77002",
      city: "Houston",
      state: "TX",
      phone: "(713) 555-0321",
      website: "www.stepperfectphoto.com",
      rating: 4.6,
      reviewCount: 45,
      image: "/placeholder.svg",
      verified: false,
      featured: false,
      hours: "By Appointment",
      specialties: ["Event Photography", "Competition Photos", "Portrait Sessions"],
      coordinates: { lat: 29.7604, lng: -95.3698 } as LocationCoordinates
    },
    {
      id: 5,
      name: "Urban Groove Catering",
      category: "Food & Catering",
      description: "Soul food catering services for stepping events and celebrations.",
      location: "Memphis, TN",
      address: "456 Beale St, Memphis, TN 38103",
      city: "Memphis",
      state: "TN",
      phone: "(901) 555-0654",
      website: "www.urbangroovecatering.com",
      rating: 4.5,
      reviewCount: 78,
      image: "/placeholder.svg",
      verified: true,
      featured: false,
      hours: "Mon-Fri 8AM-6PM",
      specialties: ["Event Catering", "Soul Food", "Party Platters"],
      coordinates: { lat: 35.1495, lng: -90.0490 } as LocationCoordinates
    },
    {
      id: 6,
      name: "Stepping Health & Wellness",
      category: "Health & Fitness",
      description: "Physical therapy and wellness services specifically for dancers.",
      location: "Chicago, IL",
      address: "789 Michigan Ave, Chicago, IL 60611",
      city: "Chicago",
      state: "IL",
      phone: "(312) 555-0987",
      website: "www.steppingwellness.com",
      rating: 4.9,
      reviewCount: 156,
      image: "/placeholder.svg",
      verified: true,
      featured: true,
      hours: "Mon-Fri 7AM-7PM",
      specialties: ["Physical Therapy", "Sports Medicine", "Injury Prevention"],
      coordinates: { lat: 41.8970, lng: -87.6274 } as LocationCoordinates
    },
    {
      id: 7,
      name: "Dallas Step Connection",
      category: "Studios & Venues",
      description: "Community center dedicated to stepping culture with classes and events.",
      location: "Dallas, TX",
      address: "321 Commerce St, Dallas, TX 75202",
      city: "Dallas",
      state: "TX",
      phone: "(214) 555-0147",
      website: "www.dallasstepconnection.com",
      rating: 4.7,
      reviewCount: 92,
      image: "/placeholder.svg",
      verified: true,
      featured: false,
      hours: "Mon-Sun 6AM-12AM",
      specialties: ["Community Events", "Classes", "Social Gatherings"],
      coordinates: { lat: 32.7767, lng: -96.7970 } as LocationCoordinates
    },
    {
      id: 8,
      name: "Midwest Step Supplies",
      category: "Clothing & Accessories",
      description: "Online retailer specializing in stepping shoes, clothing, and accessories.",
      location: "Milwaukee, WI",
      address: "159 Water St, Milwaukee, WI 53202",
      city: "Milwaukee",
      state: "WI",
      phone: "(414) 555-0258",
      website: "www.midweststepsupplies.com",
      rating: 4.4,
      reviewCount: 134,
      image: "/placeholder.svg",
      verified: true,
      featured: false,
      hours: "Mon-Sat 9AM-7PM",
      specialties: ["Online Store", "Stepping Shoes", "Accessories"],
      coordinates: { lat: 43.0389, lng: -87.9065 } as LocationCoordinates
    },
    {
      id: 9,
      name: "Virtual Step Services",
      category: "Online Services",
      description: "Online stepping lessons, virtual event coordination, and digital services.",
      location: "Online",
      address: "Virtual Location",
      city: "Online",
      state: "Virtual",
      phone: "(800) 555-STEP",
      website: "www.virtualstepservices.com",
      rating: 4.2,
      reviewCount: 89,
      image: "/placeholder.svg",
      verified: true,
      featured: false,
      hours: "24/7 Online",
      specialties: ["Virtual Lessons", "Online Events", "Digital Services"],
      coordinates: null // No coordinates for online services
    }
  ];

  const categories = [
    "All",
    "Clothing & Accessories",
    "Studios & Venues", 
    "Entertainment Services",
    "Photography Services",
    "Food & Catering",
    "Health & Fitness",
    "Music Services",
    "Event Planning",
    "Online Services"
  ];

  // Location search handlers
  const handleLocationSelect = (location: LocationResult) => {
    setUserLocation(location.coordinates);
    setLocationEnabled(true);
    setSortByDistance(true);
  };

  const handleLocationToggle = async () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      setUserLocation(null);
      setSortByDistance(false);
    } else {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        setLocationEnabled(true);
        setSortByDistance(true);
        setLocationQuery('Current Location');
      } catch (error) {
        console.error('Failed to get location:', error);
        alert(error instanceof Error ? error.message : 'Failed to get current location');
      }
    }
  };

  const handleClearLocation = () => {
    setLocationEnabled(false);
    setUserLocation(null);
    setSortByDistance(false);
    setLocationQuery('');
  };

  // Filter and search logic
  const filteredAndSortedBusinesses = useMemo(() => {
    let filtered = businesses.filter(business => {
      // Text search
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           business.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = activeTab === 'all' || business.category === activeTab;
      
      // Location filter (legacy dropdown)
      const matchesLocation = selectedLocation === 'all' || selectedLocation === 'All Locations' || business.location === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });

    // Location-based filtering
    if (locationEnabled && userLocation) {
      filtered = filterByLocation(filtered, userLocation, radius, { sortByDistance });
    }

    return filtered;
  }, [businesses, searchTerm, activeTab, selectedLocation, userLocation, locationEnabled, radius, sortByDistance]);

  const featuredBusinesses = businesses.filter(business => business.featured);

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">
                Business & Services Directory
              </h1>
              <p className="text-text-secondary text-lg">
                Discover and connect with stepping community businesses and service providers
              </p>
            </div>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
              <Plus className="w-4 h-4 mr-2" />
              List Your Business
            </Button>
          </div>
        </div>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-text-primary mb-6">Featured Businesses</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredBusinesses.map((business) => (
                <Card key={business.id} className="overflow-hidden border-brand-primary/20">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={business.image}
                        alt={business.name}
                        className="w-full h-32 object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-brand-primary text-text-on-primary">
                        Featured
                      </Badge>
                      {business.verified && (
                        <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link 
                            to={`/stores/${business.id}`}
                            className="hover:text-brand-primary transition-colors"
                          >
                            <h3 className="font-semibold text-lg text-text-primary hover:text-brand-primary">
                              {business.name}
                            </h3>
                          </Link>
                          <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{business.rating}</span>
                            <span className="text-xs text-text-secondary ml-1">({business.reviewCount})</span>
                          </div>
                          <FollowButton
                            entityId={`business_${business.name.toLowerCase().replace(/\s+/g, '_')}`}
                            entityType="business"
                            variant="outline"
                            size="sm"
                          />
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm mb-4">{business.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-text-secondary">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{business.address}</span>
                          {userLocation && business.coordinates && locationEnabled && (
                            <Badge variant="outline" className="ml-auto">
                              {getDistanceText(userLocation, business.coordinates)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-text-secondary">
                          <Clock className="w-4 h-4 mr-2" />
                          {business.hours}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      placeholder="Search businesses and services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {[...new Set(businesses.map(b => b.location))].map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                {/* Location Search Bar */}
                <LocationSearchBar
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onLocationSelect={handleLocationSelect}
                  onUseCurrentLocation={handleLocationToggle}
                  placeholder="Search location or use GPS..."
                  className="w-full mb-4"
                />

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveTab(category === 'All' ? 'all' : category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        (activeTab === 'all' && category === 'All') || activeTab === category
                          ? 'bg-brand-primary text-text-on-primary'
                          : 'bg-surface-contrast text-text-secondary hover:text-text-primary hover:bg-surface-card'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Filter Panel */}
          <div className="lg:col-span-1">
            <LocationFilterPanel
              userLocation={userLocation}
              locationEnabled={locationEnabled}
              radius={radius}
              onRadiusChange={setRadius}
              onLocationToggle={handleLocationToggle}
              onClearLocation={handleClearLocation}
              sortByDistance={sortByDistance}
              onSortByDistanceChange={setSortByDistance}
            />
          </div>
        </div>

        {/* Results Header with View Toggle */}
        <LocationMapToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredAndSortedBusinesses.length}
          locationEnabled={locationEnabled}
          userLocation={userLocation}
          radius={locationEnabled ? radius : undefined}
          className="mb-6"
        />

        {/* Business Listings */}
        {viewMode === 'map' ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-text-primary mb-2">Map View Coming Soon</h3>
              <p className="text-text-secondary mb-6">
                Interactive map view for businesses will be available soon. For now, please use the grid or list view.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setViewMode('list')}>Switch to List</Button>
                <Button variant="outline" onClick={() => setViewMode('grid')}>Switch to Grid</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid lg:grid-cols-2 gap-6' : 'space-y-4'}>
            {filteredAndSortedBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`flex ${viewMode === 'grid' ? 'gap-4' : 'gap-6'}`}>
                    <img
                      src={business.image}
                      alt={business.name}
                      className={`rounded-lg object-cover ${
                        viewMode === 'grid' ? 'w-20 h-20' : 'w-24 h-24'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/stores/${business.id}`}
                              className="hover:text-brand-primary transition-colors"
                            >
                              <h3 className="font-semibold text-lg text-text-primary hover:text-brand-primary">
                                {business.name}
                              </h3>
                            </Link>
                            {business.verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{business.rating}</span>
                            <span className="text-xs text-text-secondary ml-1">({business.reviewCount})</span>
                          </div>
                          <FollowButton
                            entityId={`business_${business.name.toLowerCase().replace(/\s+/g, '_')}`}
                            entityType="business"
                            variant="outline"
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">{business.description}</p>
                      
                      <div className="space-y-1 text-sm mb-4">
                        <div className="flex items-center justify-between text-text-secondary">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-2" />
                            <span>{business.address}</span>
                          </div>
                          {userLocation && business.coordinates && locationEnabled && (
                            <Badge variant="outline" className="ml-2">
                              {getDistanceText(userLocation, business.coordinates)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {business.phone}
                            </div>
                            {business.website && (
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 mr-1" />
                                <a 
                                  href={business.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-brand-primary"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                          <Link 
                            to={`/stores/${business.id}`}
                            className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {business.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedBusinesses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-text-primary mb-2">No businesses found</h3>
              <p className="text-text-secondary mb-6">
                No businesses match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                    setSelectedLocation('all');
                    handleClearLocation();
                  }}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
                >
                  Clear All Filters
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Be the First to List Your Business
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
