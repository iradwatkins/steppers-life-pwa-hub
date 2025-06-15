import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar, MapPin, Users, Clock, DollarSign, Filter, Plus, Star, Search, Grid, List, Map, Bookmark, SlidersHorizontal, ChevronDown, Heart, Share2, Navigation, Loader2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from 'react-router-dom';
import EventCard from '@/components/EventCard';
import EventMapView from '@/components/EventMapView';
import { useBackendEvents, useEventCategories } from '@/hooks/useBackendEvents';
import { toast } from '@/components/ui/sonner';
import type { EventPublic } from '@/services/backendEventService';

const Events = () => {
  // View and layout state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortBy, setSortBy] = useState('date');
  const [distance, setDistance] = useState(50); // miles
  
  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Backend API integration for events
  const { events, loading: eventsLoading, error: eventsError, refreshEvents } = useBackendEvents({
    status: 'published',
    limit: 100,
  });
  const { categories: backendCategories, loading: categoriesLoading } = useEventCategories();

  // Handle API errors
  useEffect(() => {
    if (eventsError) {
      toast.error('Failed to load events. Please try again.');
      console.error('Events loading error:', eventsError);
    }
  }, [eventsError]);

  // Transform backend events to match frontend expectations
  const transformedEvents = useMemo(() => {
    if (!events) return [];
    
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.start_datetime).toISOString().split('T')[0],
      time: new Date(event.start_datetime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      location: event.venue?.name || 'TBA',
      city: event.venue?.city || 'TBA',
      state: event.venue?.state || 'TBA',
      price: event.price || 0,
      image: event.image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop&auto=format`,
      category: event.category?.name || 'Event',
      attendees: event.current_attendees,
      capacity: event.max_attendees || 0,
      instructor: 'TBA', // This would come from event organizer/instructor field
      skillLevel: 'All Levels', // This would be in event metadata or tags
      tags: event.tags || [],
      rating: 4.5, // This would come from reviews/ratings
      description: event.description || '',
      organizer: 'SteppersLife', // This would come from user who created event
      coordinates: { lat: 41.8836, lng: -87.6270 }, // This would come from venue coordinates
      featured: false, // This would be a backend field
      soldOut: event.max_attendees ? event.current_attendees >= event.max_attendees : false,
      // Backend-specific fields
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      is_online: event.is_online,
      is_free: event.is_free,
      status: event.status,
      venue: event.venue,
    }));
  }, [events]);

  // Fallback mock events for development/demo (when backend is not available)
  const fallbackMockEvents = [
    {
      id: 1,
      title: "Chicago Step Championship 2024",
      date: "2024-07-15",
      time: "7:00 PM",
      location: "Chicago Cultural Center",
      city: "Chicago",
      state: "IL",
      price: 45,
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop&auto=format",
      category: "Competition",
      attendees: 156,
      capacity: 200,
      instructor: "Marcus Johnson",
      skillLevel: "Advanced",
      tags: ["Championship", "Competition", "Prizes", "Professional"],
      rating: 4.8,
      description: "The annual premier stepping championship featuring the best dancers from across the Midwest. Multiple divisions with cash prizes and performance opportunities.",
      organizer: "Chicago Step Society",
      coordinates: { lat: 41.8836, lng: -87.6270 },
      featured: true,
      soldOut: false
    },
    {
      id: 2,
      title: "Beginner's Step Workshop - Foundation Building",
      date: "2024-07-20",
      time: "2:00 PM",
      location: "South Shore Cultural Center",
      city: "Chicago",
      state: "IL",
      price: 25,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 42,
      capacity: 50,
      instructor: "Lisa Thompson",
      skillLevel: "Beginner",
      tags: ["Beginner", "Workshop", "Learning", "Fundamentals"],
      rating: 4.9,
      description: "Perfect introduction to Chicago stepping for newcomers. Learn basic steps, rhythm patterns, and proper technique in a supportive environment.",
      organizer: "Step Forward Chicago",
      coordinates: { lat: 41.7558, lng: -87.5691 },
      featured: false,
      soldOut: false
    },
    {
      id: 3,
      title: "Friday Night Step Social",
      date: "2024-07-22",
      time: "8:00 PM",
      location: "Millennium Ballroom",
      city: "Chicago",
      state: "IL",
      price: 15,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
      category: "Social",
      attendees: 89,
      capacity: 150,
      instructor: "DJ Smooth",
      skillLevel: "All Levels",
      tags: ["Social", "Dancing", "Music", "Community"],
      rating: 4.6,
      description: "Weekly social dance event with live DJ and open floor for all skill levels. Great place to practice and meet fellow steppers.",
      organizer: "Friday Night Steppers",
      coordinates: { lat: 41.8781, lng: -87.6298 },
      featured: false,
      soldOut: false
    },
    {
      id: 4,
      title: "Advanced Technique Masterclass",
      date: "2024-07-25",
      time: "6:00 PM",
      location: "DuSable Museum",
      city: "Chicago",
      state: "IL",
      price: 50,
      image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=400&fit=crop&auto=format",
      category: "Class",
      attendees: 28,
      capacity: 30,
      instructor: "Robert Williams",
      skillLevel: "Advanced",
      tags: ["Advanced", "Technique", "Masterclass", "Skills"],
      rating: 4.9,
      description: "Intensive masterclass focusing on advanced stepping techniques, styling, and performance quality. For experienced dancers only.",
      organizer: "Elite Step Academy",
      coordinates: { lat: 41.7910, lng: -87.6086 },
      featured: true,
      soldOut: false
    },
    {
      id: 5,
      title: "Youth Step Program - Summer Camp",
      date: "2024-07-27",
      time: "4:00 PM",
      location: "Garfield Park Conservatory",
      city: "Chicago",
      state: "IL",
      price: 10,
      image: "https://images.unsplash.com/photo-1545224190-fe43675ad656?w=600&h=400&fit=crop&auto=format",
      category: "Youth",
      attendees: 35,
      capacity: 40,
      instructor: "Angela Davis",
      skillLevel: "Youth",
      tags: ["Youth", "Kids", "Learning", "Summer"],
      rating: 4.7,
      description: "Fun and engaging step program designed specifically for young dancers ages 8-16. Build confidence, coordination, and social skills.",
      organizer: "Youth Step Initiative",
      coordinates: { lat: 41.8847, lng: -87.7157 },
      featured: false,
      soldOut: false
    },
    {
      id: 6,
      title: "Step & Soul Convention 2024",
      date: "2024-08-01",
      time: "10:00 AM",
      location: "Navy Pier",
      city: "Chicago",
      state: "IL",
      price: 75,
      image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop&auto=format",
      category: "Convention",
      attendees: 234,
      capacity: 300,
      instructor: "Multiple Instructors",
      skillLevel: "All Levels",
      tags: ["Convention", "Multi-day", "Workshops", "Vendors"],
      rating: 4.8,
      description: "Three-day convention featuring workshops, competitions, performances, and vendor marketplace. The largest stepping event in the Midwest.",
      organizer: "Step & Soul Productions",
      coordinates: { lat: 41.8919, lng: -87.6051 },
      featured: true,
      soldOut: false
    },
    {
      id: 7,
      title: "Couples Step Workshop - Partner Connection",
      date: "2024-08-05",
      time: "7:30 PM",
      location: "Chicago Cultural Center",
      city: "Chicago",
      state: "IL",
      price: 35,
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 64,
      capacity: 80,
      instructor: "Mike & Sarah Johnson",
      skillLevel: "Intermediate",
      tags: ["Couples", "Partner", "Romance", "Connection"],
      rating: 4.7,
      description: "Learn to step together as partners with synchronized moves, styling, and connection techniques. Perfect for couples and dance partners.",
      organizer: "Couples Step Chicago",
      coordinates: { lat: 41.8836, lng: -87.6270 },
      featured: false,
      soldOut: false
    },
    {
      id: 8,
      title: "Memorial Day Step Celebration",
      date: "2024-08-10",
      time: "3:00 PM",
      location: "Millennium Park",
      city: "Chicago",
      state: "IL",
      price: 20,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&auto=format",
      category: "Performance",
      attendees: 189,
      capacity: 250,
      instructor: "Chicago Step Ensemble",
      skillLevel: "Spectator",
      tags: ["Performance", "Outdoor", "Celebration", "Memorial"],
      rating: 4.5,
      description: "Outdoor celebration featuring performances by top Chicago stepping groups. Free community event with vendor booths and activities.",
      organizer: "Chicago Parks District",
      coordinates: { lat: 41.8826, lng: -87.6226 },
      featured: true,
      soldOut: true
    },
    {
      id: 9,
      title: "Smooth Step & Slow Jams",
      date: "2024-08-12",
      time: "9:00 PM",
      location: "The Drake Hotel",
      city: "Chicago",
      state: "IL",
      price: 40,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format",
      category: "Social",
      attendees: 78,
      capacity: 120,
      instructor: "DJ Marcus Love",
      skillLevel: "Intermediate",
      tags: ["Smooth", "Slow Jams", "Elegant", "Mature"],
      rating: 4.6,
      description: "Sophisticated evening of smooth stepping to classic slow jams and R&B. Dress code: cocktail attire. 21+ event.",
      organizer: "Elegant Steppers Society",
      coordinates: { lat: 41.8970, lng: -87.6274 },
      featured: false,
      soldOut: false
    },
    {
      id: 10,
      title: "Step Aerobics Fusion",
      date: "2024-08-14",
      time: "6:30 PM",
      location: "FFC Gold Coast",
      city: "Chicago",
      state: "IL",
      price: 30,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format",
      category: "Class",
      attendees: 22,
      capacity: 25,
      instructor: "Tanya Williams",
      skillLevel: "All Levels",
      tags: ["Fitness", "Aerobics", "Health", "Cardio"],
      rating: 4.4,
      description: "Unique fitness class combining stepping moves with aerobic exercise. Great cardio workout while learning dance fundamentals.",
      organizer: "Step Fit Chicago",
      coordinates: { lat: 41.9085, lng: -87.6270 },
      featured: false,
      soldOut: false
    },
    {
      id: 11,
      title: "Line Dancing & Step Fusion",
      date: "2024-08-17",
      time: "7:00 PM",
      location: "Copernicus Center",
      city: "Chicago",
      state: "IL",
      price: 22,
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 45,
      capacity: 60,
      instructor: "Carmen Rodriguez",
      skillLevel: "Beginner",
      tags: ["Line Dancing", "Fusion", "Group", "Fun"],
      rating: 4.3,
      description: "Learn popular line dances with stepping elements. Perfect for beginners and those who want to expand their dance vocabulary.",
      organizer: "Dance Fusion Studio",
      coordinates: { lat: 41.9634, lng: -87.7069 },
      featured: false,
      soldOut: false
    },
    {
      id: 12,
      title: "Competitive Step Team Training",
      date: "2024-08-19",
      time: "5:00 PM",
      location: "Jesse White Community Center",
      city: "Chicago",
      state: "IL",
      price: 35,
      image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=400&fit=crop&auto=format",
      category: "Class",
      attendees: 18,
      capacity: 20,
      instructor: "Coach Thompson",
      skillLevel: "Advanced",
      tags: ["Team", "Competition", "Training", "Intensive"],
      rating: 4.7,
      description: "Intensive training for competitive step teams. Focus on synchronization, advanced patterns, and performance preparation.",
      organizer: "Chicago Step Warriors",
      coordinates: { lat: 41.8781, lng: -87.6298 },
      featured: false,
      soldOut: false
    },
    {
      id: 13,
      title: "Old School Step Revival",
      date: "2024-08-22",
      time: "8:30 PM",
      location: "Chicago Theatre",
      city: "Chicago",
      state: "IL",
      price: 55,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format",
      category: "Performance",
      attendees: 145,
      capacity: 200,
      instructor: "OG Steppers Collective",
      skillLevel: "Spectator",
      tags: ["Old School", "Revival", "History", "Legends"],
      rating: 4.9,
      description: "Celebration of classic stepping with performances by original Chicago step legends. Learn the history and see where it all began.",
      organizer: "Chicago Step Heritage Foundation",
      coordinates: { lat: 41.8852, lng: -87.6270 },
      featured: true,
      soldOut: false
    },
    {
      id: 14,
      title: "Step & Salsa Crossover",
      date: "2024-08-24",
      time: "7:30 PM",
      location: "National Museum of Mexican Art",
      city: "Chicago",
      state: "IL",
      price: 28,
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 38,
      capacity: 50,
      instructor: "Carlos & Maria Santos",
      skillLevel: "Intermediate",
      tags: ["Salsa", "Crossover", "Latin", "Fusion"],
      rating: 4.5,
      description: "Explore the connections between stepping and salsa dancing. Learn how Latin rhythms can enhance your stepping style.",
      organizer: "Cross Cultural Dance Collective",
      coordinates: { lat: 41.8539, lng: -87.6700 },
      featured: false,
      soldOut: false
    },
    {
      id: 15,
      title: "Ladies Only Step Empowerment",
      date: "2024-08-26",
      time: "6:00 PM",
      location: "Women & Children First",
      city: "Chicago",
      state: "IL",
      price: 25,
      image: "https://images.unsplash.com/photo-1545224190-fe43675ad656?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 32,
      capacity: 35,
      instructor: "Queen Latasha",
      skillLevel: "All Levels",
      tags: ["Ladies Only", "Empowerment", "Confidence", "Sisterhood"],
      rating: 4.8,
      description: "Empowering workshop for women focusing on confidence, grace, and personal style in stepping. Safe space for learning and growth.",
      organizer: "Sisters in Step",
      coordinates: { lat: 41.9738, lng: -87.6661 },
      featured: false,
      soldOut: true
    },
    {
      id: 16,
      title: "Midnight Step Express",
      date: "2024-08-30",
      time: "11:00 PM",
      location: "Metro Chicago",
      city: "Chicago",
      state: "IL",
      price: 45,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format",
      category: "Social",
      attendees: 156,
      capacity: 200,
      instructor: "DJ Nightfall",
      skillLevel: "All Levels",
      tags: ["Late Night", "Energy", "Party", "Urban"],
      rating: 4.6,
      description: "High-energy late night stepping party with the hottest DJs and latest tracks. Dance until dawn with Chicago's night owls.",
      organizer: "Midnight Movers",
      coordinates: { lat: 41.9297, lng: -87.6598 },
      featured: true,
      soldOut: false
    },
    {
      id: 17,
      title: "Corporate Team Building Step",
      date: "2024-09-02",
      time: "12:00 PM",
      location: "Chicago Marriott Downtown",
      city: "Chicago",
      state: "IL",
      price: 60,
      image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 24,
      capacity: 30,
      instructor: "Professional Development Dance",
      skillLevel: "All Levels",
      tags: ["Corporate", "Team Building", "Business", "Professional"],
      rating: 4.2,
      description: "Corporate team building through stepping. Improve communication, teamwork, and company culture through dance.",
      organizer: "Corporate Culture Consultants",
      coordinates: { lat: 41.8876, lng: -87.6229 },
      featured: false,
      soldOut: false
    },
    {
      id: 18,
      title: "Step & Gospel Praise Dance",
      date: "2024-09-05",
      time: "3:00 PM",
      location: "Trinity United Church",
      city: "Chicago",
      state: "IL",
      price: 20,
      image: "https://images.unsplash.com/photo-1545224190-fe43675ad656?w=600&h=400&fit=crop&auto=format",
      category: "Workshop",
      attendees: 41,
      capacity: 50,
      instructor: "Minister Patricia Jones",
      skillLevel: "All Levels",
      tags: ["Gospel", "Praise", "Spiritual", "Worship"],
      rating: 4.7,
      description: "Combine stepping with praise dance for spiritual expression. Family-friendly workshop connecting faith and movement.",
      organizer: "Faithful Steppers Ministry",
      coordinates: { lat: 41.7537, lng: -87.6408 },
      featured: false,
      soldOut: false
    }
  ];

  // Use backend data if available, fallback to mock data for development
  const displayEvents = transformedEvents.length > 0 ? transformedEvents : fallbackMockEvents;
  
  // Dynamic categories from backend or fallback
  const categories = useMemo(() => {
    if (backendCategories && backendCategories.length > 0) {
      return backendCategories.map(cat => cat.name);
    }
    return ['Competition', 'Workshop', 'Social', 'Class', 'Performance', 'Convention'];
  }, [backendCategories]);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Youth'];
  const cities = [...new Set(displayEvents.map(event => `${event.city}, ${event.state}`))];
  const sortOptions = [
    { value: 'date', label: 'Date (Earliest First)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Distance' }
  ];

  // Filter and search logic
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = displayEvents.filter(event => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.city.toLowerCase().includes(searchLower) ||
        event.instructor.toLowerCase().includes(searchLower) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        event.description.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory = selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory.toLowerCase();
      
      // City filter
      const matchesCity = selectedCity === 'all' || `${event.city}, ${event.state}` === selectedCity;
      
      // Skill level filter
      const matchesSkillLevel = selectedSkillLevel === 'all' || event.skillLevel.toLowerCase() === selectedSkillLevel.toLowerCase();
      
      // Price range filter
      const matchesPrice = event.price >= priceRange[0] && event.price <= priceRange[1];
      
      // Date range filter
      const eventDate = new Date(event.date);
      const matchesDateFrom = !dateFrom || eventDate >= dateFrom;
      const matchesDateTo = !dateTo || eventDate <= dateTo;
      
      // Distance filter (only when location is enabled)
      let matchesDistance = true;
      if (locationEnabled && userLocation) {
        const eventDistance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          event.coordinates.lat, 
          event.coordinates.lng
        );
        matchesDistance = eventDistance <= distance;
      }
      
      return matchesSearch && matchesCategory && matchesCity && matchesSkillLevel && 
             matchesPrice && matchesDateFrom && matchesDateTo && matchesDistance;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popularity':
          return b.attendees - a.attendees;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          if (locationEnabled && userLocation) {
            const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
            const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
            return distanceA - distanceB;
          }
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedCity, selectedSkillLevel, priceRange, dateFrom, dateTo, sortBy, locationEnabled, userLocation, distance]);

  const featuredEvents = displayEvents.filter(event => event.featured);
  const upcomingEvents = filteredAndSortedEvents.filter(event => new Date(event.date) >= new Date());

  // Get user's location
  const getCurrentLocation = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationEnabled(true);
          setSortBy('distance'); // Auto-sort by distance when location is enabled
          setGpsLoading(false);
        },
        (error) => {
          console.error('Location access denied:', error);
          setGpsLoading(false);
          // Show error toast in real implementation
        }
      );
    } else {
      setGpsLoading(false);
      alert('Geolocation is not supported by this browser');
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Header with Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">
                Discover Step Events
              </h1>
              <p className="text-text-secondary text-lg">
                Find and join stepping events near you
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved Searches
              </Button>
              <Button asChild className="bg-brand-primary hover:bg-brand-primary-hover">
                <Link to="/organizer/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="mb-8 -mx-2 md:-mx-6">
          <Card className="overflow-hidden rounded-3xl bg-white text-white relative p-6 border-0 shadow-none">
            <div className="absolute inset-6 bg-black/20 rounded-2xl"></div>
            <div 
              className="relative bg-cover bg-center min-h-[280px] md:min-h-[320px] flex items-center rounded-2xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1400&h=600&fit=crop&auto=format')`
              }}
            >
              <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-brand-primary text-white border-0 px-4 py-2 rounded-full text-sm font-medium">
                      ⭐ Featured Event
                    </Badge>
                    <Badge className="bg-red-500/90 text-white border-0 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium animate-pulse">
                      🔥 Early Bird Special
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-full backdrop-blur-sm text-sm">
                      Limited Time
                    </Badge>
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Step & Soul Convention 2024
                  </h2>
                  <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                    Join us for the largest stepping event in the Midwest! Three days of workshops, competitions, and performances featuring top instructors from across the country.
                  </p>
                  <div className="flex flex-wrap items-center gap-6 mb-8 text-lg">
                    <div className="flex items-center gap-3 text-white/90">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">Aug 1-3, 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">Navy Pier, Chicago</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">234 registered</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold">$75</span>
                      <span className="text-white/70 line-through text-xl">$95</span>
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:scale-105 transition-all"
                      asChild
                    >
                      <Link to="/event/6/tickets">
                        Get Early Bird Tickets →
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                placeholder="Search events, locations, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {/* GPS Location Button */}
              <Button 
                variant={locationEnabled ? "default" : "outline"}
                onClick={getCurrentLocation}
                disabled={gpsLoading}
                className="flex items-center gap-2"
              >
                <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading ? 'Finding...' : locationEnabled ? 'GPS On' : 'Near Me'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* View Mode Toggle */}
              <div className="flex border border-border-default rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-x"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-l-none"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-primary mb-1">18</div>
            <div className="text-sm text-gray-600">Events This Month</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-primary mb-1">1,200+</div>
            <div className="text-sm text-gray-600">Active Steppers</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-primary mb-1">25</div>
            <div className="text-sm text-gray-600">Venues</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-primary mb-1">4.8★</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </Card>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-text-primary">🌟 Featured Events</h2>
              <Button variant="outline" asChild>
                <Link to="/events/featured">View All Featured</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredEvents.slice(0, 3).map((event) => (
                <Link key={event.id} to={`/event/${event.id}/tickets`} className="block group">
                  <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden h-full bg-white rounded-3xl">
                    <div className="relative">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Price Badge - Top Left */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                          <span className="text-xl font-bold text-gray-900">${event.price}</span>
                        </div>
                      </div>
                      
                      {/* Featured Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-brand-primary text-white border-0 px-3 py-1.5 font-semibold rounded-xl">
                          ⭐ Featured
                        </Badge>
                      </div>
                    </div>

                    {/* Text Section */}
                    <div className="bg-white rounded-3xl p-6 text-center mx-4 mb-4">
                      {/* Event Title */}
                      <h3 className="font-bold text-xl text-gray-900 mb-4 line-clamp-2 group-hover:text-brand-primary transition-colors">
                        {event.title}
                      </h3>

                      {/* Date and Time */}
                      <div className="flex items-center justify-center text-gray-600 text-sm mb-3">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{event.time}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-center text-gray-600 text-sm mb-6">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">{event.location}</span>
                      </div>

                      {/* Tickets Button */}
                      <Button 
                        className="w-full rounded-full py-3 font-medium bg-brand-primary hover:bg-brand-primary-hover hover:scale-105 transition-all"
                      >
                        Tickets
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular This Week */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-2">
            🔥 Popular This Week
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayEvents
              .filter(event => event.attendees > 80)
              .slice(0, 4)
              .map((event) => (
                <Link key={event.id} to={`/event/${event.id}/tickets`} className="block group">
                  <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden h-full bg-white rounded-3xl">
                    <div className="relative">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Price Badge - Top Left */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg">
                          <span className="text-lg font-bold text-gray-900">${event.price}</span>
                        </div>
                      </div>
                      
                      {/* Hot Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-red-500 text-white border-0 px-3 py-1.5 font-medium rounded-xl">
                          🔥 Hot
                        </Badge>
                      </div>
                    </div>

                    {/* Text Section */}
                    <div className="bg-white rounded-3xl p-6 text-center mx-4 mb-4">
                      {/* Event Title */}
                      <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
                        {event.title}
                      </h3>

                      {/* Date and Time */}
                      <div className="flex items-center justify-center text-gray-600 text-sm mb-3">
                        <Calendar className="h-3 w-3 mr-2 text-gray-500" />
                        <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-center text-gray-600 text-sm mb-4">
                        <MapPin className="h-3 w-3 mr-2 text-gray-500" />
                        <span className="font-medium">{event.location}</span>
                      </div>

                      {/* Tickets Button */}
                      <Button 
                        className="w-full rounded-full py-2 font-medium bg-brand-primary hover:bg-brand-primary-hover hover:scale-105 transition-all text-sm"
                      >
                        Tickets
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Location</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Skill Level Filter */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Skill Level</label>
                  <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {skillLevels.map(level => (
                        <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Date From */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">From Date</label>
                  <DatePicker
                    date={dateFrom}
                    onDateChange={setDateFrom}
                    placeholder="Select start date"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">To Date</label>
                  <DatePicker
                    date={dateTo}
                    onDateChange={setDateTo}
                    placeholder="Select end date"
                  />
                </div>

                {/* Distance (for location-based search) */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    {locationEnabled ? `Distance: ${distance} miles` : 'Distance Filter'}
                  </label>
                  {locationEnabled ? (
                    <Slider
                      value={[distance]}
                      onValueChange={(value) => setDistance(value[0])}
                      max={200}
                      min={5}
                      step={5}
                      className="mt-2"
                    />
                  ) : (
                    <div className="mt-2 p-3 bg-gray-50 rounded border text-center">
                      <p className="text-xs text-gray-500 mb-2">Enable GPS to filter by distance</p>
                      <Button size="sm" variant="outline" onClick={getCurrentLocation} disabled={gpsLoading}>
                        <Navigation className="w-3 h-3 mr-1" />
                        {gpsLoading ? 'Finding...' : 'Enable GPS'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedCity('all');
                    setSelectedSkillLevel('all');
                    setPriceRange([0, 100]);
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setSortBy('date');
                    setDistance(50);
                  }}
                >
                  Clear All Filters
                </Button>
                <Button>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Category Filters */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              All Events
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category.toLowerCase() ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">
              {searchQuery ? 'Search Results' : locationEnabled ? 'Events Near You' : 'Upcoming Events'} ({upcomingEvents.length})
            </h2>
            {searchQuery && (
              <p className="text-text-secondary">
                Showing results for "{searchQuery}"
              </p>
            )}
            {locationEnabled && !searchQuery && (
              <p className="text-text-secondary flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                Within {distance} miles of your location
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Display */}
        {viewMode === 'map' ? (
          <EventMapView 
            events={upcomingEvents} 
            userLocation={userLocation}
            locationEnabled={locationEnabled}
          />
        ) : (
          <div className={`
            ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}
          `}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No Events Found</h3>
                  <p className="text-text-secondary mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedCity('all');
                      setSelectedSkillLevel('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-surface-contrast">
          <CardContent className="p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
              Don't See What You're Looking For?
            </h3>
            <p className="text-text-secondary mb-6">
              Create your own event or save your search to get notified when new events match your criteria
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button variant="outline">
                <Bookmark className="w-4 h-4 mr-2" />
                Save This Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Events;

