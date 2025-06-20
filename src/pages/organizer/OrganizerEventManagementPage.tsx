import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Ban, 
  Users,
  Calendar,
  MapPin,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Share2
} from 'lucide-react';
import { EventService } from '@/services/eventService';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
};

const OrganizerEventManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [eventToCancel, setEventToCancel] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (user) {
      loadOrganizerProfile();
    }
  }, [user]);

  useEffect(() => {
    if (organizerId) {
      loadEvents();
    }
  }, [organizerId]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

  const loadOrganizerProfile = async () => {
    try {
      const organizer = await EventService.getOrganizerByUserId(user!.id);
      if (organizer) {
        setOrganizerId(organizer.id);
      } else {
        // Redirect to create organizer profile
        navigate('/organizer/setup');
      }
    } catch (error) {
      console.error('Error loading organizer profile:', error);
      toast.error('Failed to load organizer profile');
    }
  };

  const loadEvents = async () => {
    if (!organizerId) return;
    
    try {
      setIsLoading(true);
      const eventsData = await EventService.getEventsByOrganizer(organizerId);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venues?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!organizerId) return;
    
    try {
      await EventService.deleteEvent(eventId, organizerId);
      toast.success('Event deleted successfully');
      loadEvents();
      setShowDeleteDialog(false);
      setEventToDelete(null);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!organizerId) return;
    
    try {
      await EventService.cancelEvent(eventId, organizerId, cancellationReason);
      toast.success('Event cancelled successfully');
      loadEvents();
      setShowCancelDialog(false);
      setEventToCancel(null);
      setCancellationReason('');
    } catch (error: any) {
      console.error('Error cancelling event:', error);
      toast.error(error.message || 'Failed to cancel event');
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      await EventService.publishEvent(eventId);
      toast.success('Event published successfully');
      loadEvents();
    } catch (error) {
      console.error('Error publishing event:', error);
      toast.error('Failed to publish event');
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };

  const copyEventLink = (eventId: string) => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    toast.success('Event link copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTicketsSold = (ticketTypes: any[]) => {
    if (!Array.isArray(ticketTypes)) return 0;
    return ticketTypes.reduce((total, tt) => total + (tt.quantity_sold || 0), 0);
  };

  const getTotalRevenue = (ticketTypes: any[]) => {
    if (!Array.isArray(ticketTypes)) return 0;
    return ticketTypes.reduce((total, tt) => total + ((tt.quantity_sold || 0) * tt.price), 0);
  };

  const getAvailableTickets = (ticketTypes: any[]) => {
    if (!Array.isArray(ticketTypes)) return 0;
    return ticketTypes.reduce((total, tt) => total + (tt.quantity_available - (tt.quantity_sold || 0)), 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Please log in to access your event management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-600 mt-1">
                Manage your events - create, edit, publish, and track performance
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => navigate('/events/create')} className="bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button variant="outline" onClick={loadEvents}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{events.filter(e => e.status === 'published').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tickets Sold</p>
                  <p className="text-2xl font-bold">
                    {events.reduce((total, event) => total + getTicketsSold(event.ticket_types || []), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${events.reduce((total, event) => total + getTotalRevenue(event.ticket_types || []), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Events ({filteredEvents.length})</span>
              {filteredEvents.length > 0 && (
                <Checkbox
                  checked={selectedEvents.length === filteredEvents.length}
                  onCheckedChange={toggleSelectAll}
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Create your first event to get started'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => navigate('/events/create')} className="bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedEvents.length === filteredEvents.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={() => toggleEventSelection(event.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.venues?.name || 'Online Event'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(event.start_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(event.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{getTicketsSold(event.ticket_types)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getAvailableTickets(event.ticket_types)} available
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-sm">
                              ${getTotalRevenue(event.ticket_types).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/events/${event.id}`)}
                              title="View Event"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/events/${event.id}/edit`)}
                              title="Edit Event"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyEventLink(event.id)}
                              title="Copy Event Link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {event.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublishEvent(event.id)}
                                title="Publish Event"
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {event.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEventToCancel(event.id);
                                  setShowCancelDialog(true);
                                }}
                                title="Cancel Event"
                              >
                                <Ban className="h-4 w-4 text-orange-600" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEventToDelete(event.id);
                                setShowDeleteDialog(true);
                              }}
                              title="Delete Event"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Event
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This action cannot be undone and will remove all associated data including tickets and orders.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => eventToDelete && handleDeleteEvent(eventToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Event Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <Ban className="h-5 w-5" />
                Cancel Event
              </DialogTitle>
              <DialogDescription>
                Cancelling an event will notify all ticket holders and may trigger refunds. Please provide a reason for the cancellation.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cancellation-reason">Cancellation Reason</Label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Please provide a reason for cancelling this event..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => eventToCancel && handleCancelEvent(eventToCancel)}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!cancellationReason.trim()}
              >
                Cancel Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrganizerEventManagementPage;