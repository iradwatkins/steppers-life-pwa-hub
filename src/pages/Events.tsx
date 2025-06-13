
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Search, Filter, Users, DollarSign } from 'lucide-react';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  const events = [
    {
      id: 1,
      title: "Chicago Stepping Championship",
      description: "The premier stepping competition featuring the best dancers from across the Midwest.",
      date: "December 15, 2024",
      time: "7:00 PM - 11:00 PM",
      location: "Navy Pier Grand Ballroom",
      address: "600 E Grand Ave, Chicago, IL",
      price: "$45",
      category: "competition",
      capacity: 500,
      attending: 342,
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Beginner's Stepping Workshop",
      description: "Perfect for newcomers to learn the basics of Chicago stepping in a supportive environment.",
      date: "December 20, 2024",
      time: "6:30 PM - 8:30 PM",
      location: "South Side Cultural Center",
      address: "4506 S Martin Luther King Jr Dr, Chicago, IL",
      price: "$25",
      category: "workshop",
      capacity: 50,
      attending: 38,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "New Year's Eve Stepping Gala",
      description: "Ring in the new year with an elegant evening of stepping, dining, and celebration.",
      date: "December 31, 2024",
      time: "8:00 PM - 2:00 AM",
      location: "Palmer House Hilton",
      address: "17 E Monroe St, Chicago, IL",
      price: "$85",
      category: "social",
      capacity: 300,
      attending: 156,
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Advanced Technique Masterclass",
      description: "Elevate your stepping with advanced techniques taught by master instructors.",
      date: "January 5, 2025",
      time: "2:00 PM - 5:00 PM",
      location: "Chicago Dance Academy",
      address: "1016 N Dearborn St, Chicago, IL",
      price: "$60",
      category: "workshop",
      capacity: 30,
      attending: 22,
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Monthly Social Dance",
      description: "Join the community for a fun night of social dancing and networking.",
      date: "January 12, 2025",
      time: "7:00 PM - 11:00 PM",
      location: "Millennium Ballroom",
      address: "2047 W Division St, Chicago, IL",
      price: "$20",
      category: "social",
      capacity: 200,
      attending: 89,
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Youth Stepping Program Showcase",
      description: "Watch the next generation of steppers showcase their talents.",
      date: "January 18, 2025",
      time: "6:00 PM - 8:00 PM",
      location: "Youth Center Auditorium",
      address: "456 S State St, Chicago, IL",
      price: "Free",
      category: "showcase",
      capacity: 150,
      attending: 67,
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'competition', label: 'Competitions' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'social', label: 'Social Events' },
    { value: 'showcase', label: 'Showcases' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'south-side', label: 'South Side' },
    { value: 'north-side', label: 'North Side' },
    { value: 'west-side', label: 'West Side' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'next-month', label: 'Next Month' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'competition': return 'bg-red-500';
      case 'workshop': return 'bg-blue-500';
      case 'social': return 'bg-green-500';
      case 'showcase': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Stepping Events</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and join stepping events across Chicago. From workshops to competitions, find your perfect stepping experience.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
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
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-4 relative">
                  {event.featured && (
                    <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`text-white ${getCategoryBadgeColor(event.category)}`}>
                    {categories.find(cat => cat.value === event.category)?.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {event.attending}/{event.capacity}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-stepping-purple" />
                    <span className="text-lg font-semibold text-stepping-purple">{event.price}</span>
                  </div>
                  <Button size="sm" asChild className="bg-stepping-gradient">
                    <Link to={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results count */}
        <div className="text-center mt-8 text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>
    </div>
  );
};

export default Events;
