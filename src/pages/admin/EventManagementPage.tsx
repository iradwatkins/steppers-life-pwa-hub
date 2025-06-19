import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Flag, 
  Star, 
  Ban, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  MoreHorizontal,
  Download,
  Activity,
  Users,
  DollarSign,
  MapPin,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Award
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'suspended' | 'featured';
  start_date: string;
  end_date: string;
  location: string | null;
  price: number | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
  organizers?: {
    organization_name: string;
    contact_email: string;
  };
  tickets_sold?: number;
  revenue?: number;
  quality_score?: number;
  complaints?: number;
  is_featured?: boolean;
}

interface EventFilters {
  search: string;
  status: string;
  dateRange: string;
  location: string;
  organizer: string;
  qualityScore: string;
}

interface EventComplaint {
  id: string;
  event_id: string;
  user_id: string;
  complaint: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

interface EventAnalytics {
  views: number;
  clicks: number;
  conversion_rate: number;
  engagement_score: number;
  social_shares: number;
}

const EventManagementPage = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin } = useRoles();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventComplaints, setEventComplaints] = useState<EventComplaint[]>([]);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    status: 'all',
    dateRange: 'all',
    location: 'all',
    organizer: 'all',
    qualityScore: 'all'
  });

  const [bulkAction, setBulkAction] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationReason, setModerationReason] = useState('');

  // Load events data
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            status,
            start_date,
            end_date,
            location,
            price,
            capacity,
            created_at,
            updated_at,
            organizers (
              organization_name,
              contact_email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Enhance events with mock analytics data
        const enhancedEvents: Event[] = (data || []).map(event => ({
          ...event,
          tickets_sold: Math.floor(Math.random() * (event.capacity || 100)),
          revenue: Math.floor(Math.random() * 5000) + 500,
          quality_score: Math.floor(Math.random() * 30) + 70, // 70-100 score
          complaints: Math.floor(Math.random() * 5),
          is_featured: Math.random() > 0.8 // 20% chance of being featured
        }));

        setEvents(enhancedEvents);
        setFilteredEvents(enhancedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(search) ||
        event.organizers?.organization_name?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'upcoming':
          filtered = filtered.filter(event => new Date(event.start_date) > now);
          break;
        case 'past':
          filtered = filtered.filter(event => new Date(event.end_date) < now);
          break;
        case 'today':
          const today = now.toDateString();
          filtered = filtered.filter(event => 
            new Date(event.start_date).toDateString() === today
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() + 7);
          filtered = filtered.filter(event => 
            new Date(event.start_date) >= now && new Date(event.start_date) <= filterDate
          );
          break;
      }
    }

    // Quality score filter
    if (filters.qualityScore !== 'all') {
      switch (filters.qualityScore) {
        case 'high':
          filtered = filtered.filter(event => (event.quality_score || 0) >= 90);
          break;
        case 'medium':
          filtered = filtered.filter(event => (event.quality_score || 0) >= 70 && (event.quality_score || 0) < 90);
          break;
        case 'low':
          filtered = filtered.filter(event => (event.quality_score || 0) < 70);
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  // Load event complaints
  const loadEventComplaints = async (eventId: string) => {
    try {
      // Mock complaints data
      const mockComplaints: EventComplaint[] = [
        {
          id: '1',
          event_id: eventId,
          user_id: 'user1',
          complaint: 'Event location was incorrect and caused confusion',
          status: 'open',
          created_at: new Date().toISOString(),
          user: {
            full_name: 'John Smith',
            email: 'john@example.com'
          }
        },
        {
          id: '2',
          event_id: eventId,
          user_id: 'user2',
          complaint: 'Organizer was unprofessional and late',
          status: 'investigating',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user: {
            full_name: 'Sarah Johnson',
            email: 'sarah@example.com'
          }
        }
      ];
      
      setEventComplaints(mockComplaints);
    } catch (error) {
      console.error('Error loading event complaints:', error);
    }
  };

  // Load event analytics
  const loadEventAnalytics = async (eventId: string) => {
    try {
      // Mock analytics data
      const mockAnalytics: EventAnalytics = {
        views: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 200) + 20,
        conversion_rate: Math.floor(Math.random() * 20) + 5,
        engagement_score: Math.floor(Math.random() * 30) + 70,
        social_shares: Math.floor(Math.random() * 50) + 5
      };
      
      setEventAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading event analytics:', error);
    }
  };

  // Handle event actions
  const handleEventAction = async (action: string, eventId: string, reason?: string) => {
    try {
      let newStatus = '';
      
      switch (action) {
        case 'publish':
          newStatus = 'published';
          break;
        case 'unpublish':
          newStatus = 'draft';
          break;
        case 'suspend':
          newStatus = 'suspended';
          break;
        case 'feature':
          newStatus = 'featured';
          break;
        case 'unfeature':
          newStatus = 'published';
          break;
      }

      if (newStatus) {
        await supabase
          .from('events')
          .update({ status: newStatus })
          .eq('id', eventId);
      }

      // Log moderation action (in production, this would go to an audit table)
      console.log(`Event ${eventId} ${action} by admin. Reason: ${reason}`);

      setShowModerationDialog(false);
      setModerationAction('');
      setModerationReason('');
      window.location.reload();
    } catch (error) {
      console.error('Error performing event action:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedEventIds.length === 0) return;

    try {
      switch (bulkAction) {
        case 'publish':
          await supabase
            .from('events')
            .update({ status: 'published' })
            .in('id', selectedEventIds);
          break;
        case 'unpublish':
          await supabase
            .from('events')
            .update({ status: 'draft' })
            .in('id', selectedEventIds);
          break;
        case 'suspend':
          await supabase
            .from('events')
            .update({ status: 'suspended' })
            .in('id', selectedEventIds);
          break;
        case 'export':
          // Export selected events to CSV
          const selectedEvents = events.filter(e => selectedEventIds.includes(e.id));
          const csv = [
            'Title,Organizer,Status,Date,Location,Revenue,Quality Score',
            ...selectedEvents.map(e => 
              `${e.title},${e.organizers?.organization_name || ''},${e.status},${e.start_date},${e.location || ''},${e.revenue || 0},${e.quality_score || 0}`
            )
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'events_export.csv';
          a.click();
          break;
      }

      setBulkAction('');
      setSelectedEventIds([]);
      if (bulkAction !== 'export') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      published: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      draft: { variant: 'secondary' as const, icon: Edit, color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, icon: Ban, color: 'text-red-600' },
      featured: { variant: 'default' as const, icon: Star, color: 'text-yellow-600' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  // Get quality score color
  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse" />
              Loading Events
            </CardTitle>
            <CardDescription>Fetching event management data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Calendar className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Event Management</h1>
              </div>
              <p className="text-muted-foreground">
                Comprehensive event oversight and quality management
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleBulkAction()} disabled={selectedEventIds.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published Events</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => e.status === 'published').length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Featured Events</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => e.status === 'featured').length}
                  </p>
                </div>
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended Events</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => e.status === 'suspended').length}
                  </p>
                </div>
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label>Search Events</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, organizer..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quality Score</Label>
                <Select value={filters.qualityScore} onValueChange={(value) => setFilters({...filters, qualityScore: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="high">High (90+)</SelectItem>
                    <SelectItem value="medium">Medium (70-89)</SelectItem>
                    <SelectItem value="low">Low (&lt;70)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={() => setFilters({
                  search: '',
                  status: 'all',
                  dateRange: 'all',
                  location: 'all',
                  organizer: 'all',
                  qualityScore: 'all'
                })}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedEventIds.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedEventIds.length} event(s) selected
                  </span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Publish Events</SelectItem>
                      <SelectItem value="unpublish">Unpublish Events</SelectItem>
                      <SelectItem value="suspend">Suspend Events</SelectItem>
                      <SelectItem value="export">Export to CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkAction} disabled={!bulkAction}>
                    Apply Action
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedEventIds([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Events ({filteredEvents.length})</span>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.length === filteredEvents.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEventIds(filteredEvents.map(e => e.id));
                        } else {
                          setSelectedEventIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEventIds.includes(event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEventIds([...selectedEventIds, event.id]);
                          } else {
                            setSelectedEventIds(selectedEventIds.filter(id => id !== event.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {event.location || 'Location TBD'}
                        </div>
                        {event.is_featured && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.organizers?.organization_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{event.organizers?.contact_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(event.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(event.start_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.tickets_sold}/{event.capacity || 'unlimited'}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          ${event.revenue || 0}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getQualityScoreColor(event.quality_score || 0)}`}>
                          {event.quality_score || 0}%
                        </span>
                        {(event.complaints || 0) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {event.complaints} complaints
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEvent(event);
                            loadEventComplaints(event.id);
                            loadEventAnalytics(event.id);
                            setShowEventDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Event Actions</DialogTitle>
                              <DialogDescription>
                                Choose an action for {event.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2">
                              {event.status !== 'published' && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleEventAction('publish', event.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Publish Event
                                </Button>
                              )}
                              
                              {event.status === 'published' && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleEventAction('unpublish', event.id)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Unpublish Event
                                </Button>
                              )}

                              {event.status !== 'featured' && event.status === 'published' && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleEventAction('feature', event.id)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Feature Event
                                </Button>
                              )}

                              {event.status === 'featured' && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleEventAction('unfeature', event.id)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Remove Feature
                                </Button>
                              )}
                              
                              {event.status !== 'suspended' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend Event
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Suspend Event</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to suspend "{event.title}"? 
                                        This will remove it from public view.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleEventAction('suspend', event.id)}>
                                        Suspend
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              <Button
                                variant="outline"
                                onClick={() => navigate(`/events/${event.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Public Page
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Event Detail Dialog */}
        <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
              <DialogDescription>
                Complete event information and management tools
              </DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="complaints">Complaints</TabsTrigger>
                  <TabsTrigger value="moderation">Moderation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event Title</Label>
                      <Input value={selectedEvent.title} readOnly />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="pt-2">
                        {getStatusBadge(selectedEvent.status)}
                      </div>
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input value={new Date(selectedEvent.start_date).toLocaleString()} readOnly />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input value={new Date(selectedEvent.end_date).toLocaleString()} readOnly />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input value={selectedEvent.location || 'Not specified'} readOnly />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input value={selectedEvent.capacity || 'Unlimited'} readOnly />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea value={selectedEvent.description || 'No description provided'} readOnly />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-4">
                  {eventAnalytics && (
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Views</span>
                            <span className="font-bold">{eventAnalytics.views}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Clicks</span>
                            <span className="font-bold">{eventAnalytics.clicks}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Conversion Rate</span>
                            <span className="font-bold">{eventAnalytics.conversion_rate}%</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span>Social Shares</span>
                            <span className="font-bold">{eventAnalytics.social_shares}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="complaints" className="space-y-4">
                  <div className="space-y-3">
                    {eventComplaints.length > 0 ? (
                      eventComplaints.map((complaint) => (
                        <Card key={complaint.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm">{complaint.complaint}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <span>By: {complaint.user?.full_name}</span>
                                  <span>•</span>
                                  <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                                {complaint.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No complaints for this event
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="moderation" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Quality Score</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedEvent.quality_score || 0} className="flex-1" />
                        <span className={`font-medium ${getQualityScoreColor(selectedEvent.quality_score || 0)}`}>
                          {selectedEvent.quality_score || 0}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setModerationAction('approve');
                          setShowModerationDialog(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Event
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setModerationAction('flag');
                          setShowModerationDialog(true);
                        }}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Flag for Review
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setModerationAction('suspend');
                          setShowModerationDialog(true);
                        }}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Event
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Moderation Action Dialog */}
        <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Moderation Action</DialogTitle>
              <DialogDescription>
                Please provide a reason for this moderation action
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Provide a detailed reason for this action..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedEvent && handleEventAction(moderationAction, selectedEvent.id, moderationReason)}
                  disabled={!moderationReason.trim()}
                >
                  Confirm Action
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventManagementPage;