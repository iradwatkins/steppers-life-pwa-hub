import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Users, Star, Play, Filter, Search, MapPin } from 'lucide-react';
import { LocationSearchBar, LocationFilterPanel, LocationMapToggle } from '@/components/location';
import { 
  LocationResult, 
  LocationCoordinates, 
  getCurrentLocation, 
  filterByLocation, 
  getDistanceText 
} from '@/services/locationSearchService';
import FollowButton from '@/components/FollowButton';

const Classes = () => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Location search state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [locationQuery, setLocationQuery] = useState('');
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [radius, setRadius] = useState(25);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Enhanced classes data with location information
  const classes = [
    {
      id: 1,
      title: "Fundamentals of Chicago Stepping",
      instructor: "Marcus Johnson",
      instructorImage: "/placeholder.svg",
      level: "Beginner",
      duration: "8 weeks",
      price: 120,
      rating: 4.9,
      students: 45,
      image: "/placeholder.svg",
      category: "Technique",
      description: "Master the basic steps and timing of Chicago stepping in this comprehensive beginner course.",
      location: "Chicago Cultural Center",
      address: "78 E Washington St, Chicago, IL 60602",
      city: "Chicago",
      state: "IL",
      coordinates: { lat: 41.8836, lng: -87.6270 } as LocationCoordinates
    },
    {
      id: 2,
      title: "Advanced Footwork Patterns",
      instructor: "Lisa Davis",
      instructorImage: "/placeholder.svg",
      level: "Advanced",
      duration: "6 weeks",
      price: 150,
      rating: 4.8,
      students: 28,
      image: "/placeholder.svg",
      category: "Technique",
      description: "Elevate your stepping with complex footwork patterns and advanced techniques.",
      location: "DuSable Museum",
      address: "740 E 56th Pl, Chicago, IL 60637",
      city: "Chicago",
      state: "IL",
      coordinates: { lat: 41.7910, lng: -87.6086 } as LocationCoordinates
    },
    {
      id: 3,
      title: "Partner Connection & Leading",
      instructor: "Carlos Martinez",
      instructorImage: "/placeholder.svg",
      level: "Intermediate",
      duration: "4 weeks",
      price: 80,
      rating: 4.7,
      students: 32,
      image: "/placeholder.svg",
      category: "Partnership",
      description: "Learn how to connect with your partner and develop strong leading skills.",
      location: "Atlanta Dance Studio",
      address: "1234 Peachtree St, Atlanta, GA 30309",
      city: "Atlanta",
      state: "GA",
      coordinates: { lat: 33.7490, lng: -84.3880 } as LocationCoordinates
    },
    {
      id: 4,
      title: "Competition Preparation",
      instructor: "Angela Thompson",
      instructorImage: "/placeholder.svg",
      level: "Advanced",
      duration: "12 weeks",
      price: 200,
      rating: 4.9,
      students: 18,
      image: "/placeholder.svg",
      category: "Competition",
      description: "Intensive training for stepping competitions with performance techniques.",
      location: "Motor City Dance Academy",
      address: "567 Woodward Ave, Detroit, MI 48226",
      city: "Detroit",
      state: "MI",
      coordinates: { lat: 42.3314, lng: -83.0458 } as LocationCoordinates
    },
    {
      id: 5,
      title: "Styling & Personal Expression",
      instructor: "Michael Brown",
      instructorImage: "/placeholder.svg",
      level: "Intermediate",
      duration: "6 weeks",
      price: 100,
      rating: 4.6,
      students: 38,
      image: "/placeholder.svg",
      category: "Style",
      description: "Develop your unique style and personal expression in stepping.",
      location: "Houston Step Center",
      address: "890 Main St, Houston, TX 77002",
      city: "Houston",
      state: "TX",
      coordinates: { lat: 29.7604, lng: -95.3698 } as LocationCoordinates
    },
    {
      id: 6,
      title: "Youth Stepping Basics",
      instructor: "Coach Williams",
      instructorImage: "/placeholder.svg",
      level: "Beginner",
      duration: "10 weeks",
      price: 90,
      rating: 4.8,
      students: 25,
      image: "/placeholder.svg",
      category: "Youth",
      description: "Age-appropriate stepping instruction for young dancers (ages 8-16).",
      location: "South Shore Cultural Center",
      address: "7059 S Shore Dr, Chicago, IL 60649",
      city: "Chicago",
      state: "IL",
      coordinates: { lat: 41.7558, lng: -87.5691 } as LocationCoordinates
    },
    {
      id: 7,
      title: "Line Dancing & Step Fusion",
      instructor: "Carmen Rodriguez",
      instructorImage: "/placeholder.svg",
      level: "Beginner",
      duration: "5 weeks",
      price: 75,
      rating: 4.5,
      students: 30,
      image: "/placeholder.svg",
      category: "Fusion",
      description: "Learn popular line dances with stepping elements. Perfect for beginners.",
      location: "Dallas Dance Studio",
      address: "321 Commerce St, Dallas, TX 75202",
      city: "Dallas",
      state: "TX",
      coordinates: { lat: 32.7767, lng: -96.7970 } as LocationCoordinates
    },
    {
      id: 8,
      title: "Virtual Step Fundamentals",
      instructor: "Dr. Patricia Jones",
      instructorImage: "/placeholder.svg",
      level: "Beginner",
      duration: "6 weeks",
      price: 60,
      rating: 4.4,
      students: 85,
      image: "/placeholder.svg",
      category: "Online",
      description: "Learn stepping basics from home with interactive online sessions.",
      location: "Online",
      address: "Virtual Classroom",
      city: "Online",
      state: "Virtual",
      coordinates: null // No coordinates for online classes
    }
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const categories = ["Technique", "Partnership", "Competition", "Style", "Youth", "Fusion", "Online"];

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
  const filteredAndSortedClasses = useMemo(() => {
    let filtered = classes.filter(classItem => {
      // Text search
      const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Level filter
      const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || classItem.category === selectedCategory;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });

    // Location filtering
    if (locationEnabled && userLocation) {
      filtered = filterByLocation(filtered, userLocation, radius, { sortByDistance });
    }

    return filtered;
  }, [classes, searchTerm, selectedLevel, selectedCategory, userLocation, locationEnabled, radius, sortByDistance]);

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">
            Stepping Classes
          </h1>
          <p className="text-text-secondary text-lg">
            Learn from expert instructors and master the art of stepping
          </p>
        </div>

        {/* Featured Class */}
        <Card className="mb-8 overflow-hidden bg-gradient-to-r from-brand-primary to-brand-primary-hover text-text-on-primary">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-text-on-primary text-brand-primary mb-4">
                  Most Popular
                </Badge>
                <h2 className="font-serif text-3xl font-bold mb-4">
                  Fundamentals of Chicago Stepping
                </h2>
                <p className="text-text-on-primary/90 mb-6">
                  Perfect for beginners! Learn the essential moves, timing, and techniques that form the foundation of Chicago stepping.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-1" />
                    <span>4.9 (45 students)</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-1" />
                    <span>8 weeks</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-1" />
                    <span>Chicago, IL</span>
                  </div>
                </div>
                <Button className="bg-text-on-primary text-brand-primary hover:bg-text-on-primary/90">
                  Enroll Now - $120
                </Button>
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder.svg"
                  alt="Featured Class"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                    <Input
                      placeholder="Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>

                {/* Location Search Bar */}
                <LocationSearchBar
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onLocationSelect={handleLocationSelect}
                  onUseCurrentLocation={handleLocationToggle}
                  placeholder="Search location or use GPS..."
                  className="w-full"
                />
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
          resultsCount={filteredAndSortedClasses.length}
          locationEnabled={locationEnabled}
          userLocation={userLocation}
          radius={locationEnabled ? radius : undefined}
          className="mb-6"
        />

        {/* Class Categories */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <Card key={category} className="text-center cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-text-on-primary" />
                </div>
                <h3 className="font-semibold text-text-primary text-sm">{category}</h3>
                <p className="text-xs text-text-secondary">
                  {classes.filter(c => c.category === category).length} classes
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Classes Grid */}
        {viewMode === 'map' ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-text-primary mb-2">Map View Coming Soon</h3>
              <p className="text-text-secondary mb-6">
                Interactive map view for classes will be available soon. For now, please use the grid or list view.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setViewMode('grid')}>Switch to Grid</Button>
                <Button variant="outline" onClick={() => setViewMode('list')}>Switch to List</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'}>
            {filteredAndSortedClasses.map((classItem) => (
              <Card key={classItem.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <img
                    src={classItem.image}
                    alt={classItem.title}
                    className={`object-cover ${
                      viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                    }`}
                  />
                  <Badge className="absolute top-3 left-3 bg-brand-primary">
                    {classItem.level}
                  </Badge>
                  <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={classItem.instructorImage}
                      alt={classItem.instructor}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{classItem.instructor}</p>
                      <p className="text-sm text-text-secondary">{classItem.category}</p>
                    </div>
                    <FollowButton
                      entityId={`instructor_${classItem.instructor.toLowerCase().replace(/\s+/g, '_')}`}
                      entityType="instructor"
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  
                  <h3 className="font-serif text-xl font-semibold text-text-primary mb-2">
                    {classItem.title}
                  </h3>
                  
                  <p className="text-text-secondary text-sm mb-4">
                    {classItem.description}
                  </p>
                  
                  {/* Location Information */}
                  <div className="flex items-center gap-2 mb-3 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span>{classItem.location}, {classItem.city}, {classItem.state}</span>
                    {userLocation && classItem.coordinates && locationEnabled && (
                      <Badge variant="outline" className="ml-auto">
                        {getDistanceText(userLocation, classItem.coordinates)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{classItem.rating}</span>
                      <span className="ml-1">({classItem.students})</span>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{classItem.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-primary">
                      ${classItem.price}
                    </span>
                    <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedClasses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-text-primary mb-2">No classes found</h3>
              <p className="text-text-secondary mb-6">
                No classes match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                  setSelectedCategory('all');
                  handleClearLocation();
                }}
                className="bg-brand-primary hover:bg-brand-primary-hover"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-surface-contrast">
          <CardContent className="p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
              Become an Instructor
            </h3>
            <p className="text-text-secondary mb-6">
              Share your stepping expertise and teach students worldwide
            </p>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover">
              Apply to Teach
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Classes;
