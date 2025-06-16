
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EventService } from '@/services/eventService';
import { Calendar, MapPin, Clock, Search, Filter, Users, DollarSign, Star } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
};

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);

  // Load events on component mount and when filters change
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const { events: searchResults, total } = await EventService.searchEvents({
          query: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          location: selectedLocation !== 'all' ? selectedLocation : undefined,
          dateRange: selectedDateRange !== 'all' ? selectedDateRange as any : undefined,
          limit: 20
        });

        setEvents(searchResults);
        setTotalEvents(total);

        // Also load featured events if no search is active
        if (!searchQuery && selectedCategory === 'all' && selectedLocation === 'all' && selectedDateRange === 'all') {
          const featured = await EventService.getFeaturedEvents(3);
          setFeaturedEvents(featured);
        } else {
          setFeaturedEvents([]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [searchQuery, selectedCategory, selectedLocation, selectedDateRange]);

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'competition', label: 'Competitions' },
    { value: 'classes', label: 'Classes' },
    { value: 'social', label: 'Social Events' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'community', label: 'Community Events' },
    { value: 'youth', label: 'Youth Programs' },
    { value: 'senior', label: 'Senior Programs' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'downtown', label: 'Downtown Chicago' },
    { value: 'south-side', label: 'South Side' },
    { value: 'north-side', label: 'North Side' },
    { value: 'west-side', label: 'West Side' },
    { value: 'suburbs', label: 'Chicago Suburbs' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'next-month', label: 'Next Month' }
  ];

  // Helper functions
  const getCategoryBadgeColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('competition')) return 'bg-red-500';
    if (categoryLower.includes('workshop')) return 'bg-blue-500';
    if (categoryLower.includes('social')) return 'bg-green-500';
    if (categoryLower.includes('class')) return 'bg-purple-500';
    if (categoryLower.includes('youth')) return 'bg-orange-500';
    if (categoryLower.includes('community')) return 'bg-teal-500';
    return 'bg-gray-500';
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', formatOptions);
    } else {
      return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
    }
  };

  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return `${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const getEventPrice = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return 'Free';
    
    const prices = ticketTypes.map(tt => tt.price).filter(p => p > 0);
    if (prices.length === 0) return 'Free';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `$${minPrice}`;
    } else {
      return `$${minPrice} - $${maxPrice}`;
    }
  };

  const getAttendanceInfo = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return { sold: 0, capacity: 0 };
    
    const sold = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
    const capacity = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_available || 0), 0);
    
    return { sold, capacity: sold + capacity };
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

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredEvents.map((event) => {
                const attendanceInfo = getAttendanceInfo(event.ticket_types || []);
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md mb-4 relative">
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                        {event.featured_image_url && (
                          <img 
                            src={event.featured_image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-white ${getCategoryBadgeColor(event.category)}`}>
                          {event.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {attendanceInfo.sold}/{attendanceInfo.capacity}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.short_description || event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatEventDate(event.start_date, event.end_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatEventTime(event.start_date, event.end_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.is_online ? 'Online Event' : (event.venues as any)?.name || 'TBD'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-stepping-purple" />
                          <span className="text-lg font-semibold text-stepping-purple">
                            {getEventPrice(event.ticket_types || [])}
                          </span>
                        </div>
                        <Button size="sm" asChild className="bg-stepping-gradient">
                          <Link to={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Events Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all' || selectedDateRange !== 'all' 
              ? 'Search Results' 
              : 'All Events'
            }
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="aspect-video w-full mb-4" />
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new events.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSelectedDateRange('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const attendanceInfo = getAttendanceInfo(event.ticket_types || []);
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md mb-4 relative">
                        {event.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                        )}
                        {event.featured_image_url && (
                          <img 
                            src={event.featured_image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-white ${getCategoryBadgeColor(event.category)}`}>
                          {event.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {attendanceInfo.sold}/{attendanceInfo.capacity}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.short_description || event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatEventDate(event.start_date, event.end_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatEventTime(event.start_date, event.end_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.is_online ? 'Online Event' : (event.venues as any)?.name || 'TBD'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-stepping-purple" />
                          <span className="text-lg font-semibold text-stepping-purple">
                            {getEventPrice(event.ticket_types || [])}
                          </span>
                        </div>
                        <Button size="sm" asChild className="bg-stepping-gradient">
                          <Link to={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="text-center mt-8 text-muted-foreground">
            Showing {events.length} of {totalEvents} events
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
