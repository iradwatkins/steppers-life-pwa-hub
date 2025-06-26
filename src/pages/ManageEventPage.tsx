import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
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
  CreditCard,
  Trash2
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
  const { isAdmin, isSuperAdmin } = useRoles();
  const [event, setEvent] = useState<Event | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load real event data from EventService
  useEffect(() => {
    const fetchEvent = async () => {
      // Enhanced check for invalid event ID
      if (!eventId || eventId === 'null' || eventId === 'undefined' || eventId.trim() === '') {
        console.error('❌ Invalid event ID provided:', eventId);
        setError('Invalid event ID provided');
        setIsLoading(false);
        return;
      }
      
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
    
    // BMAD Fix: Event description is completely optional - no validation required
    // Cache-bust: 2025-01-03
    
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

  const handleDeleteEvent = async () => {
    if (!event || !eventId) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting event:', eventId);
      
      // Check if this is a simple event (no tickets sold) or admin action
      const isSimpleEvent = event.additional_info?.isSimpleEvent || !event.ticket_types || event.ticket_types.length === 0;
      const canDelete = isSimpleEvent || isAdmin || isSuperAdmin;
      
      if (!canDelete) {
        toast.error('Cannot delete events with tickets sold. Please contact an administrator.');
        return;
      }

      // Use admin delete if user is admin, otherwise regular delete
      let success = false;
      if (isAdmin || isSuperAdmin) {
        success = await EventService.adminDeleteEvent(eventId);
      } else {
        success = await EventService.deleteEvent(eventId, event.organizer_id);
      }
      
      if (success) {
        toast.success('Event deleted successfully');
        navigate('/organizer/events');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error: any) {
      console.error('❌ Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
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
                <Badge className={`flex items-center space-x-1 ${getStatusColor(event.status)}`