import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Filter,
  X,
  TrendingUp,
  BarChart3,
  Compare
} from 'lucide-react';
import { ComparisonEvent } from '@/services/comparativeAnalyticsService';

interface EventComparisonSelectorProps {
  organizerId?: string;
  onEventsSelected: (eventIds: string[]) => void;
  selectedEventIds: string[];
  maxSelections?: number;
  comparisonType?: 'event_to_event' | 'time_period' | 'venue_comparison' | 'category_analysis';
  onComparisonTypeChange?: (type: 'event_to_event' | 'time_period' | 'venue_comparison' | 'category_analysis') => void;
}

const EventComparisonSelector: React.FC<EventComparisonSelectorProps> = ({
  organizerId,
  onEventsSelected,
  selectedEventIds,
  maxSelections = 10,
  comparisonType = 'event_to_event',
  onComparisonTypeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<ComparisonEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock events data - in real app, this would come from API
  const mockEvents: ComparisonEvent[] = [
    {
      id: '1',
      name: 'Chicago Step Championship 2024',
      date: '2024-07-15',
      category: 'Competition',
      venue: 'Chicago Cultural Center',
      location: { city: 'Chicago', state: 'IL', coordinates: { lat: 41.8836, lng: -87.6270 } },
      capacity: 300,
      tickets_sold: 275,
      revenue: { gross: 12375, net: 10900, fees: 1475 },
      metrics: {
        attendance_rate: 91.7,
        average_ticket_price: 45,
        revenue_per_attendee: 39.6,
        check_in_rate: 94.2,
        refund_rate: 2.1,
        marketing_roi: 3.2,
        customer_satisfaction: 4.7,
        repeat_customer_rate: 68.4
      },
      marketing: {
        spend: 2500,
        channels: [
          { name: 'Social Media', spend: 1200, conversions: 120, roi: 4.1 },
          { name: 'Email', spend: 400, conversions: 80, roi: 8.2 }
        ],
        lead_time_days: 45
      },
      operational: {
        staff_count: 12,
        setup_time_hours: 6,
        cost_per_attendee: 8.50,
        venue_utilization: 85.5
      },
      tags: ['stepping', 'competition', 'chicago']
    },
    {
      id: '2',
      name: 'Summer Step Social',
      date: '2024-06-20',
      category: 'Social',
      venue: 'Millennium Park',
      location: { city: 'Chicago', state: 'IL', coordinates: { lat: 41.8826, lng: -87.6226 } },
      capacity: 150,
      tickets_sold: 142,
      revenue: { gross: 4260, net: 3800, fees: 460 },
      metrics: {
        attendance_rate: 94.7,
        average_ticket_price: 30,
        revenue_per_attendee: 26.8,
        check_in_rate: 97.2,
        refund_rate: 1.4,
        marketing_roi: 4.1,
        customer_satisfaction: 4.8,
        repeat_customer_rate: 72.3
      },
      marketing: {
        spend: 800,
        channels: [
          { name: 'Social Media', spend: 500, conversions: 85, roi: 5.1 },
          { name: 'Word of Mouth', spend: 300, conversions: 57, roi: 3.8 }
        ],
        lead_time_days: 30
      },
      operational: {
        staff_count: 8,
        setup_time_hours: 4,
        cost_per_attendee: 5.25,
        venue_utilization: 92.0
      },
      tags: ['stepping', 'social', 'outdoor']
    },
    {
      id: '3',
      name: 'Advanced Workshop Series',
      date: '2024-05-10',
      category: 'Workshop',
      venue: 'Dance Academy Chicago',
      location: { city: 'Chicago', state: 'IL', coordinates: { lat: 41.8781, lng: -87.6298 } },
      capacity: 50,
      tickets_sold: 48,
      revenue: { gross: 4800, net: 4320, fees: 480 },
      metrics: {
        attendance_rate: 96.0,
        average_ticket_price: 100,
        revenue_per_attendee: 90.0,
        check_in_rate: 98.0,
        refund_rate: 0.0,
        marketing_roi: 6.2,
        customer_satisfaction: 4.9,
        repeat_customer_rate: 85.4
      },
      marketing: {
        spend: 600,
        channels: [
          { name: 'Email', spend: 400, conversions: 35, roi: 8.4 },
          { name: 'Instructor Network', spend: 200, conversions: 13, roi: 3.1 }
        ],
        lead_time_days: 60
      },
      operational: {
        staff_count: 6,
        setup_time_hours: 2,
        cost_per_attendee: 12.00,
        venue_utilization: 85.0
      },
      tags: ['stepping', 'workshop', 'advanced']
    },
    {
      id: '4',
      name: 'Detroit Step Experience',
      date: '2024-08-25',
      category: 'Competition',
      venue: 'Motor City Casino',
      location: { city: 'Detroit', state: 'MI', coordinates: { lat: 42.3314, lng: -83.0458 } },
      capacity: 400,
      tickets_sold: 365,
      revenue: { gross: 21900, net: 19200, fees: 2700 },
      metrics: {
        attendance_rate: 91.3,
        average_ticket_price: 60,
        revenue_per_attendee: 52.6,
        check_in_rate: 89.3,
        refund_rate: 3.8,
        marketing_roi: 2.8,
        customer_satisfaction: 4.5,
        repeat_customer_rate: 63.7
      },
      marketing: {
        spend: 3500,
        channels: [
          { name: 'Radio', spend: 1500, conversions: 125, roi: 2.1 },
          { name: 'Social Media', spend: 1200, conversions: 140, roi: 3.8 },
          { name: 'Print Ads', spend: 800, conversions: 100, roi: 2.2 }
        ],
        lead_time_days: 75
      },
      operational: {
        staff_count: 18,
        setup_time_hours: 8,
        cost_per_attendee: 11.50,
        venue_utilization: 78.5
      },
      tags: ['stepping', 'competition', 'detroit', 'casino']
    },
    {
      id: '5',
      name: 'Beginner Friendly Social',
      date: '2024-04-15',
      category: 'Social',
      venue: 'Community Center',
      location: { city: 'Atlanta', state: 'GA', coordinates: { lat: 33.7490, lng: -84.3880 } },
      capacity: 100,
      tickets_sold: 95,
      revenue: { gross: 1900, net: 1710, fees: 190 },
      metrics: {
        attendance_rate: 95.0,
        average_ticket_price: 20,
        revenue_per_attendee: 18.0,
        check_in_rate: 96.8,
        refund_rate: 2.1,
        marketing_roi: 5.8,
        customer_satisfaction: 4.6,
        repeat_customer_rate: 78.9
      },
      marketing: {
        spend: 300,
        channels: [
          { name: 'Facebook', spend: 200, conversions: 65, roi: 6.5 },
          { name: 'Flyers', spend: 100, conversions: 30, roi: 3.8 }
        ],
        lead_time_days: 21
      },
      operational: {
        staff_count: 5,
        setup_time_hours: 3,
        cost_per_attendee: 4.20,
        venue_utilization: 88.0
      },
      tags: ['stepping', 'social', 'beginner', 'atlanta']
    }
  ];

  // Load events based on filters
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredEvents = mockEvents;
      
      // Apply filters
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (categoryFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category === categoryFilter);
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const eventDate = new Date(filteredEvents[0]?.date || now);
        
        switch (dateFilter) {
          case 'past':
            filteredEvents = filteredEvents.filter(event => new Date(event.date) < now);
            break;
          case 'upcoming':
            filteredEvents = filteredEvents.filter(event => new Date(event.date) >= now);
            break;
          case 'this_year':
            filteredEvents = filteredEvents.filter(event => new Date(event.date).getFullYear() === now.getFullYear());
            break;
        }
      }
      
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'sold_out':
            filteredEvents = filteredEvents.filter(event => event.tickets_sold >= event.capacity);
            break;
          case 'available':
            filteredEvents = filteredEvents.filter(event => event.tickets_sold < event.capacity);
            break;
          case 'high_performance':
            filteredEvents = filteredEvents.filter(event => event.metrics.attendance_rate > 90);
            break;
        }
      }
      
      setEvents(filteredEvents);
      setLoading(false);
    }, 500);
  }, [searchTerm, categoryFilter, dateFilter, statusFilter]);

  const handleEventToggle = useCallback((eventId: string) => {
    const newSelection = selectedEventIds.includes(eventId)
      ? selectedEventIds.filter(id => id !== eventId)
      : [...selectedEventIds, eventId].slice(0, maxSelections);
      
    onEventsSelected(newSelection);
  }, [selectedEventIds, onEventsSelected, maxSelections]);

  const handleSelectAll = useCallback(() => {
    const availableEvents = events.slice(0, maxSelections);
    onEventsSelected(availableEvents.map(e => e.id));
  }, [events, onEventsSelected, maxSelections]);

  const handleClearSelection = useCallback(() => {
    onEventsSelected([]);
  }, [onEventsSelected]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDateFilter('all');
    setStatusFilter('all');
  }, []);

  const getEventStatusBadge = (event: ComparisonEvent) => {
    const isSoldOut = event.tickets_sold >= event.capacity;
    const isHighPerformance = event.metrics.attendance_rate > 90;
    
    if (isSoldOut) {
      return <Badge variant="destructive">Sold Out</Badge>;
    }
    if (isHighPerformance) {
      return <Badge className="bg-green-500 text-white">High Performance</Badge>;
    }
    return <Badge variant="outline">Available</Badge>;
  };

  const categories = ['Competition', 'Social', 'Workshop'];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Compare className="h-5 w-5 text-brand-primary" />
            Select Events to Compare
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {onComparisonTypeChange && (
              <Select value={comparisonType} onValueChange={onComparisonTypeChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_to_event">Event to Event</SelectItem>
                  <SelectItem value="time_period">Time Period</SelectItem>
                  <SelectItem value="venue_comparison">Venue Comparison</SelectItem>
                  <SelectItem value="category_analysis">Category Analysis</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {/* Selection Status */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {selectedEventIds.length} of {maxSelections} events selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={events.length === 0}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              disabled={selectedEventIds.length === 0}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events by name, venue, city, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                    <SelectItem value="upcoming">Upcoming Events</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="high_performance">High Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Events List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No events found matching your criteria</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedEventIds.includes(event.id)
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border hover:border-brand-primary/50'
                }`}
                onClick={() => handleEventToggle(event.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedEventIds.includes(event.id)}
                    onChange={() => handleEventToggle(event.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {event.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}, {event.location.city}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getEventStatusBadge(event)}
                        <Badge variant="outline">{event.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{event.tickets_sold}/{event.capacity}</span>
                        <span className="text-muted-foreground">
                          ({event.metrics.attendance_rate.toFixed(1)}%)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span>${event.revenue.gross.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span>{event.metrics.marketing_roi.toFixed(1)}x ROI</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{event.metrics.customer_satisfaction.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Events Summary */}
        {selectedEventIds.length > 0 && (
          <>
            <Separator />
            <div className="text-sm">
              <h4 className="font-medium mb-2">Selected Events:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedEventIds.map(eventId => {
                  const event = events.find(e => e.id === eventId) || mockEvents.find(e => e.id === eventId);
                  return event ? (
                    <Badge key={eventId} variant="secondary" className="flex items-center gap-1">
                      {event.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventToggle(eventId);
                        }}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EventComparisonSelector; 