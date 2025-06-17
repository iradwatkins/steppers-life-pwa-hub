
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Phone, Globe, Star, Clock } from 'lucide-react';

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const businesses = [
    {
      id: 1,
      name: "Stepping Elegance Boutique",
      category: "apparel",
      description: "Premium stepping shoes, dresses, and accessories for the discerning dancer.",
      address: "123 S Michigan Ave, Chicago, IL",
      phone: "(312) 555-0123",
      website: "www.steppingelegance.com",
      rating: 4.8,
      reviews: 127,
      hours: "Mon-Sat 10am-8pm, Sun 12pm-6pm",
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Smooth Sounds DJ Services",
      category: "dj",
      description: "Professional DJ services specializing in stepping music for events and parties.",
      address: "456 W Division St, Chicago, IL",
      phone: "(312) 555-0456",
      website: "www.smoothsoundschi.com",
      rating: 4.9,
      reviews: 89,
      hours: "Available 24/7 by appointment",
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "The Grand Ballroom",
      category: "venue",
      description: "Elegant event venue perfect for stepping competitions, social dances, and celebrations.",
      address: "789 N State St, Chicago, IL",
      phone: "(312) 555-0789",
      website: "www.grandballroomchi.com",
      rating: 4.7,
      reviews: 156,
      hours: "Event bookings available daily",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Step Perfect Shoes",
      category: "shoes",
      description: "Specialized stepping shoes with custom sizing and professional fitting services.",
      address: "321 E 79th St, Chicago, IL",
      phone: "(773) 555-0321",
      website: "www.stepperfectshoes.com",
      rating: 4.9,
      reviews: 203,
      hours: "Tue-Sat 11am-7pm",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Rhythm & Flow Photography",
      category: "photography",
      description: "Professional event photography capturing the energy and elegance of stepping events.",
      address: "654 W North Ave, Chicago, IL",
      phone: "(312) 555-0654",
      website: "www.rhythmflowphoto.com",
      rating: 4.8,
      reviews: 94,
      hours: "By appointment only",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Stepping Styles Alterations",
      category: "alterations",
      description: "Expert alterations for stepping attire, ensuring the perfect fit for your dance wear.",
      address: "987 S Halsted St, Chicago, IL",
      phone: "(312) 555-0987",
      website: "www.steppingstyles.com",
      rating: 4.6,
      reviews: 67,
      hours: "Mon-Fri 9am-6pm, Sat 10am-4pm",
      image: "/placeholder.svg"
    },
    {
      id: 7,
      name: "Chicago Stepping Supplies",
      category: "supplies",
      description: "Complete selection of stepping accessories, music, and practice equipment.",
      address: "147 N Clark St, Chicago, IL",
      phone: "(312) 555-0147",
      website: "www.steppingsupplies.com",
      rating: 4.5,
      reviews: 112,
      hours: "Mon-Sat 10am-8pm",
      image: "/placeholder.svg"
    },
    {
      id: 8,
      name: "Elite Event Planning",
      category: "planning",
      description: "Full-service event planning specializing in stepping competitions and social events.",
      address: "258 W Madison St, Chicago, IL",
      phone: "(312) 555-0258",
      website: "www.eliteeventchi.com",
      rating: 4.7,
      reviews: 78,
      hours: "Mon-Fri 9am-6pm",
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'apparel', label: 'Apparel & Fashion' },
    { value: 'shoes', label: 'Stepping Shoes' },
    { value: 'dj', label: 'DJ Services' },
    { value: 'venue', label: 'Event Venues' },
    { value: 'photography', label: 'Photography' },
    { value: 'alterations', label: 'Alterations' },
    { value: 'supplies', label: 'Supplies & Equipment' },
    { value: 'planning', label: 'Event Planning' }
  ];

  const locations = [
    { value: 'all', label: 'All Areas' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'south-side', label: 'South Side' },
    { value: 'north-side', label: 'North Side' },
    { value: 'west-side', label: 'West Side' }
  ];

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'apparel': return 'bg-purple-500';
      case 'shoes': return 'bg-blue-500';
      case 'dj': return 'bg-green-500';
      case 'venue': return 'bg-red-500';
      case 'photography': return 'bg-yellow-500';
      case 'alterations': return 'bg-pink-500';
      case 'supplies': return 'bg-indigo-500';
      case 'planning': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Directory</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover local businesses and services that support the Chicago stepping community. From shoes to venues, find everything you need.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(locations ?? []).map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Businesses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(businesses ?? []).filter(b => b.featured).map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-md mb-4 relative">
                    <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`text-white ${getCategoryBadgeColor(business.category)}`}>
                      {categories.find(cat => cat.value === business.category)?.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{business.rating}</span>
                      <span className="text-sm text-muted-foreground">({business.reviews})</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{business.name}</CardTitle>
                  <CardDescription>{business.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {business.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {business.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {business.hours}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-stepping-gradient flex-1">
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Businesses */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredBusinesses ?? []).filter(b => !b.featured).map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-md mb-4"></div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`text-white ${getCategoryBadgeColor(business.category)}`}>
                      {categories.find(cat => cat.value === business.category)?.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{business.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{business.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{business.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {business.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {business.phone}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-stepping-gradient flex-1">
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-center mt-8 text-muted-foreground">
          Showing {filteredBusinesses.length} of {businesses.length} businesses
        </div>
      </div>
    </div>
  );
};

export default Community;
