import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { EventService } from '@/services/eventService';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Settings,
  Ticket,
  Users,
  HelpCircle,
  Edit,
  Eye,
  Globe,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  FileText,
  Share2,
  BarChart3,
  Copy,
  Image,
  Palette,
  CreditCard
} from 'lucide-react';

import type { Database } from '@/integrations/supabase/types';

// Event Status Types
export type EventStatus = 'draft' | 'published' | 'unpublished' | 'archived' | 'cancelled' | 'completed';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
};

const ManageEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real event data from EventService
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Loading event for management:', eventId);
        const eventData = await EventService.getEventById(eventId);
        
        if (!eventData) {
          setError('Event not found');
          return;
        }
        
        console.log('✅ Event loaded for management:', eventData);
        setEvent(eventData);
      } catch (error) {
        console.error('❌ Error loading event:', error);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unpublished':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'published':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'unpublished':
        return <Pause className="h-4 w-4" />;
      case 'archived':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'unpublished':
        return 'Unpublished';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!event) return;

    // Validate requirements before publishing
    if (newStatus === 'published') {
      const validationErrors = validateEventForPublishing(event);
      if (validationErrors.length > 0) {
        toast.error(`Cannot publish: ${validationErrors.join(', ')}`);
        return;
      }
    }

    try {
      console.log(`🔄 Updating event status to: ${newStatus}`);
      
      if (newStatus === 'published') {
        const success = await EventService.publishEvent(event.id);
        if (!success) {
          toast.error('Failed to publish event');
          return;
        }
      } else {
        const updatedEvent = await EventService.updateEvent(event.id, { status: newStatus });
        if (!updatedEvent) {
          toast.error('Failed to update event status');
          return;
        }
      }

      // Update local state
      setEvent({ ...event, status: newStatus });
      toast.success(`Event ${getStatusLabel(newStatus).toLowerCase()} successfully`);
      setIsPublishDialogOpen(false);
      
      console.log(`✅ Event status updated to: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const validateEventForPublishing = (eventData: Event): string[] => {
    const errors: string[] = [];
    
    if (!eventData.title || eventData.title.length < 5) {
      errors.push('Event title is required (min 5 characters)');
    }
    // Description is optional
    // if (!eventData.description || eventData.description.length < 20) {
    //   errors.push('Event description is required (min 20 characters)');
    // }
    if (!eventData.is_online && !eventData.venues) {
      errors.push('Venue is required for physical events');
    }
    if (!eventData.start_date) {
      errors.push('Start date is required');
    }
    // Tickets are optional - events can be free/RSVP only
    // if (!eventData.ticket_types || eventData.ticket_types.length === 0) {
    //   errors.push('At least one ticket type is required');
    // }
    
    return errors;
  };

  const configurationSections = [
    {
      title: 'Event Details',
      description: 'Basic event information, description, and scheduling',
      icon: <Calendar className="h-5 w-5" />,
      path: `/events/create?edit=${eventId}`,
      completed: true,
      items: ['Title', 'Description', 'Date & Time', 'Venue', 'Category']
    },
    {
      title: 'Ticketing & Pricing',
      description: 'Ticket types, pricing, and sales configuration',
      icon: <Ticket className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/ticketing`,
      completed: true,
      items: ['Ticket Types', 'Pricing', 'Sales Period', 'Capacity']
    },
    {
      title: 'Seating & Layout',
      description: 'Seating arrangements and venue layout',
      icon: <Users className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/seating`,
      completed: true,
      items: ['Seating Sections', 'Table Layout', 'Chart Upload']
    },
    {
      title: 'Cash Payments',
      description: 'Manage cash payment codes and verification',
      icon: <CreditCard className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/cash-payments`,
      completed: true,
      items: ['Payment Codes', 'Code Verification', 'Cash Transactions']
    },
    {
      title: 'Custom Questions',
      description: 'Additional registration questions for attendees',
      icon: <HelpCircle className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/custom-questions`,
      completed: false,
      items: ['Registration Questions', 'Required Fields', 'Question Types']
    },
    {
      title: 'Promo Codes',
      description: 'Create and manage promotional discount codes',
      icon: <DollarSign className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/promo-codes`,
      completed: false,
      items: ['Discount Codes', 'Usage Tracking', 'Validity Periods']
    },
    {
      title: 'Event Media',
      description: 'Images, videos, and promotional materials',
      icon: <Image className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/media`,
      completed: false,
      items: ['Event Images', 'Promotional Materials', 'Gallery']
    },
    {
      title: 'Branding & Style',
      description: 'Colors, fonts, and visual customization',
      icon: <Palette className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/branding`,
      completed: false,
      items: ['Brand Colors', 'Typography', 'Custom Styling']
    },
    {
      title: 'Event Performance',
      description: 'Real-time analytics and performance metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/performance`,
      completed: true,
      items: ['Sales Analytics', 'Attendee Metrics', 'Revenue Tracking']
    },
    {
      title: 'Attendee Reports',
      description: 'Detailed attendee information and management',
      icon: <FileText className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/attendees`,
      completed: true,
      items: ['Attendee List', 'Check-in Status', 'Export Data']
    },
    {
      title: 'Financial Reports',
      description: 'Revenue analytics and financial insights',
      icon: <CreditCard className="h-5 w-5" />,
      path: `/organizer/event/${eventId}/financial`,
      completed: true,
      items: ['Revenue Breakdown', 'P&L Statement', 'Tax Reports']
    }
  ];

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Event not found. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <Badge className={`flex items-center space-x-1 ${getStatusColor(event.status)}`}>
                  {getStatusIcon(event.status)}
                  <span>{getStatusLabel(event.status)}</span>
                </Badge>
              </div>
              <p className="text-gray-600">Manage your event configuration and publication status</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </Button>
            <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center space-x-2"
                  disabled={event.status === 'published'}
                >
                  <Play className="h-4 w-4" />
                  <span>
                    {event.status === 'published' ? 'Published' : 'Publish Event'}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Publish Event</DialogTitle>
                  <DialogDescription>
                    Are you ready to make this event public? Once published, attendees will be able to view and register for your event.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {(validateEventForPublishing(event) || []).map((error, index) => (
                    <Alert key={index}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange('published')}
                    disabled={validateEventForPublishing(event).length > 0}
                  >
                    Publish Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Event Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Event Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">
                    {new Date(event.start_date).toLocaleDateString()} 
                    {event.end_date && event.end_date !== event.start_date && 
                      ` - ${new Date(event.end_date).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-medium">
                    {event.is_online ? 'Online Event' : event.venues?.name || 'TBD'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-medium">
                    {event.max_attendees ? `${event.max_attendees} attendees` : 'Unlimited'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Starting Price</p>
                  <p className="font-medium">
                    {event.ticket_types && event.ticket_types.length > 0 
                      ? `$${Math.min(...event.ticket_types.map(tt => tt.price))}`
                      : 'Free'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(configurationSections || []).map((section, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  {section.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item, itemIndex) => (
                      <Badge 
                        key={itemIndex} 
                        variant={section.completed ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center space-x-2"
                    onClick={() => navigate(section.path)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>{section.completed ? 'Edit' : 'Configure'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Publication Status</CardTitle>
            <CardDescription>
              Manage your event's visibility and availability to attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <Badge className={`flex items-center space-x-1 ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                    <span>{getStatusLabel(event.status)}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(event.updated_at || event.created_at).toLocaleDateString()} at {new Date(event.updated_at || event.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {event.status === 'published' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleStatusChange('unpublished')}
                    className="flex items-center space-x-2"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Unpublish</span>
                  </Button>
                )}
                {event.status !== 'published' && (
                  <Button 
                    onClick={() => setIsPublishDialogOpen(true)}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Publish</span>
                  </Button>
                )}
                <Button variant="outline" className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageEventPage;