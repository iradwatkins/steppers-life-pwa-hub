import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EventType, EVENT_TYPE_LABELS, EVENT_TYPE_DESCRIPTIONS } from '@/types/eventTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';
import { EventService, type CreateEventData } from '@/services/eventService';
import { useEffect } from 'react';
import { OrganizerRoute } from '@/components/auth/ProtectedRoute';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Upload, 
  X, 
  Plus,
  Save,
  Eye,
  Clock,
  Users,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  Star,
  DollarSign
} from 'lucide-react';
import { US_STATES } from '@/data/usStates';

// BMAD Fix: Event description is completely optional - no minimum characters required
// Cache-bust: 2025-01-03
const eventFormSchema = z.object({
  title: z.string().min(5, 'Event title must be at least 5 characters'),
  description: z.string().optional(), // No validation - completely optional
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().optional(),
  endTime: z.string().min(1, 'End time is required'),
  isMultiDay: z.boolean().default(false),
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(10, 'Complete address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  isOnlineEvent: z.boolean().default(false),
  onlineEventLink: z.string().optional(),
  capacity: z.string().optional(),
  // Event type configuration
  eventType: z.enum(['simple', 'ticketed', 'premium']).default('simple'),
  
  // Ticket configuration fields
  requiresTickets: z.boolean().default(true),
  ticketPrice: z.string().optional(),
  
  // Simple event configuration
  freeEntryCondition: z.string().optional(),
  doorPrice: z.string().optional(),
  doorPriceCurrency: z.string().default('USD'),
}).refine((data) => {
  // Validation based on event type
  if (data.eventType === 'simple') {
    // Simple events must have door price
    if (!data.doorPrice) {
      return false;
    }
  } else if (data.eventType === 'ticketed' || data.eventType === 'premium') {
    // Ticketed/Premium events need ticket configuration
    if (data.requiresTickets && !data.ticketPrice) {
      return false;
    }
  }
  return true;
}, {
  message: "Event configuration is incomplete",
  path: ["eventType"]
});

type EventFormData = z.infer<typeof eventFormSchema>;

const CreateEventPage = () => {
  const { user } = useAuth();
  const { organizerId, hasOrganizer } = useRoles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editEventId = searchParams.get('edit');
  const isEditing = !!editEventId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [additionalDates, setAdditionalDates] = useState<Array<{startDate: string; startTime: string; endDate?: string; endTime?: string}>>([]);
  // Removed isSimpleEvent state - now using eventType field instead

  const eventCategories = EventService.getEventCategories();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categories: [],
      startDate: '',
      startTime: '19:00', // Default to 7:00 PM
      endDate: '',
      endTime: '02:00', // Default to 2:00 AM
      isMultiDay: false,
      venue: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isOnlineEvent: false,
      onlineEventLink: '',
      capacity: '',
      // Event type configuration
      eventType: 'simple' as EventType,
      // Ticket configuration
      requiresTickets: true,
      ticketPrice: '',
      // Simple event configuration
      freeEntryCondition: '',
      doorPrice: '',
      doorPriceCurrency: 'USD',
    }
  });

  // Load event data for editing
  useEffect(() => {
    const loadEventForEditing = async () => {
      if (!isEditing || !editEventId || editEventId === 'null' || editEventId === 'undefined' || editEventId.trim() === '') return;
      
      // Wait for user and organizer data to be available
      if (!user?.id || !hasOrganizer || !organizerId) {
        console.log('⏳ Waiting for user/organizer data...', { user: user?.id, hasOrganizer, organizerId });
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('🔄 Loading event for editing:', editEventId);
        console.log('👤 Current user:', user?.id);
        console.log('🏢 Current organizer ID:', organizerId);
        
        const eventData = await EventService.getEventById(editEventId);
        console.log('📋 Raw event data from API:', eventData);
        
        if (!eventData) {
          console.error('❌ Event data is null or undefined');
          toast.error('Event not found');
          navigate('/events');
          return;
        }

        // Verify user has permission to edit this event
        if (eventData.organizer_id !== organizerId) {
          console.error('❌ User does not have permission to edit this event');
          toast.error('You do not have permission to edit this event');
          navigate('/events');
          return;
        }

        console.log('✅ Event loaded for editing:', eventData);
        console.log('🏢 Event venue data:', eventData.venues);
        console.log('🎫 Event ticket types:', eventData.ticket_types);
        
        // Parse date/time
        console.log('📅 Raw start_date:', eventData.start_date);
        console.log('📅 Raw end_date:', eventData.end_date);
        
        const startDateTime = new Date(eventData.start_date);
        const endDateTime = new Date(eventData.end_date);
        
        console.log('📅 Parsed start date:', startDateTime);
        console.log('📅 Parsed end date:', endDateTime);
        
        // Get first ticket type price if available
        const firstTicketType = eventData.ticket_types?.[0];
        const ticketPrice = firstTicketType?.price?.toString() || '';
        
        console.log('🎫 First ticket type:', firstTicketType);
        console.log('💰 Ticket price for form:', ticketPrice);
        
        // Prepare form data
        const formData = {
          title: eventData.title || '',
          description: eventData.description || '',
          categories: eventData.category ? eventData.category.split(', ') : [],
          startDate: startDateTime.toISOString().split('T')[0],
          startTime: startDateTime.toTimeString().slice(0, 5),
          endDate: endDateTime.toISOString().split('T')[0],
          endTime: endDateTime.toTimeString().slice(0, 5),
          isMultiDay: false, // Calculate based on dates
          venue: eventData.venues?.name || '',
          address: eventData.venues?.address || '',
          city: eventData.venues?.city || '',
          state: eventData.venues?.state || '',
          zipCode: eventData.venues?.zip_code || '',
          isOnlineEvent: eventData.is_online || false,
          onlineEventLink: eventData.online_link || '',
          capacity: eventData.max_attendees?.toString() || '',
          requiresTickets: eventData.requires_tickets ?? true,
          ticketPrice: ticketPrice,
        };
        
        console.log('📝 Form data to populate:', formData);
        
        // Populate form with event data
        form.reset(formData);

        // Set images if available
        if (eventData.featured_image_url) {
          setFeaturedImage(eventData.featured_image_url);
        }
        if (eventData.gallery_images) {
          setEventImages(eventData.gallery_images);
        }
        
      } catch (error) {
        console.error('❌ Error loading event for editing:', error);
        toast.error('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventForEditing();
  }, [isEditing, editEventId, user?.id, hasOrganizer, organizerId, form, navigate]);

  const isMultiDay = form.watch('isMultiDay');
  const isOnlineEvent = form.watch('isOnlineEvent');
  const requiresTickets = form.watch('requiresTickets');
  const eventType = form.watch('eventType');

  // Helper function to format date for display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };


  const addAdditionalDate = () => {
    setAdditionalDates(prev => [...prev, { 
      startDate: '', 
      startTime: '19:00', // Default to 7:00 PM
      endDate: '', 
      endTime: '02:00' // Default to 2:00 AM
    }]);
  };

  const removeAdditionalDate = (index: number) => {
    setAdditionalDates(prev => prev.filter((_, i) => i !== index));
  };

  const updateAdditionalDate = (index: number, field: string, value: string) => {
    setAdditionalDates(prev => prev.map((date, i) => 
      i === index ? { ...date, [field]: value } : date
    ));
  };

  const onSubmit = async (data: EventFormData) => {
    console.log(`🚀 Starting event ${isEditing ? 'update' : 'creation'} process...`);
    console.log('📝 Form data:', data);
    console.log('👤 User:', user?.id);
    console.log('🏢 Organizer ID:', organizerId);
    console.log('🖼️ Featured image:', featuredImage);
    console.log('📸 Event images:', eventImages);
    console.log('✏️ Is editing:', isEditing, 'Event ID:', editEventId);

    if (!user?.id) {
      toast.error(`You must be logged in to ${isEditing ? 'update' : 'create'} events.`);
      return;
    }

    if (!hasOrganizer || !organizerId) {
      toast.error('You need to set up an organizer profile first.');
      navigate('/organizer/setup');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare event data for the service
      const startDateTime = `${data.startDate}T${data.startTime}:00`;
      const endDateTime = data.endDate 
        ? `${data.endDate}T${data.endTime}:00` 
        : `${data.startDate}T${data.endTime}:00`;

      console.log('📅 Date/time processing:', { startDateTime, endDateTime });

      const eventData: CreateEventData = {
        title: data.title,
        description: data.description,
        shortDescription: data.description ? data.description.substring(0, 150) : '',
        category: data.categories.join(', '), // Store categories as comma-separated string for now
        startDate: startDateTime,
        endDate: endDateTime,
        timezone: 'America/Chicago', // Default to Chicago timezone
        isOnline: data.isOnlineEvent,
        onlineLink: data.onlineEventLink,
        maxAttendees: data.capacity ? parseInt(data.capacity) : 100,
        // Event type configuration
        eventType: data.eventType,
        requiresTickets: data.eventType === 'simple' ? false : data.requiresTickets,
        
        // Simple event configuration
        freeEntryCondition: data.freeEntryCondition,
        doorPrice: data.doorPrice,
        doorPriceCurrency: data.doorPriceCurrency,
        additionalInfo: {
          isSimpleEvent: data.eventType === 'simple',
          simpleEventPrice: data.eventType === 'simple' ? data.ticketPrice : undefined
        }
      };

      // Handle ticket types for both simple and complex events
      if ((data.eventType === 'simple' && data.ticketPrice) || (data.eventType !== 'simple' && data.requiresTickets && data.ticketPrice)) {
        eventData.ticketTypes = [
          {
            name: data.eventType === 'simple' ? 'Admission' : 'General Admission',
            description: data.eventType === 'simple' ? 'Event admission' : 'Standard event ticket',
            price: parseFloat(data.ticketPrice),
            quantityAvailable: data.capacity ? parseInt(data.capacity) : 100,
            maxPerOrder: 10,
          }
        ];
      }

      // Add venue data if it's not an online event
      if (!data.isOnlineEvent) {
        console.log('🏢 Adding venue data...');
        eventData.venue = {
          name: data.venue,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          capacity: data.capacity ? parseInt(data.capacity) : 100,
        };
        console.log('🏢 Venue data:', eventData.venue);
      }

      // Handle image uploads
      if (featuredImage) {
        console.log('🖼️ Adding featured image:', featuredImage);
        eventData.featuredImageUrl = featuredImage;
      }
      
      if (eventImages.length > 0) {
        console.log('📸 Adding gallery images:', eventImages);
        eventData.galleryImages = eventImages;
      }

      // TODO: Handle additional dates for multi-day events
      if (additionalDates.length > 0) {
        console.log('📅 Additional dates:', additionalDates);
      }

      console.log('📋 Final event data being sent to service:', eventData);

      // Create the event
      let event;
      if (isEditing && editEventId) {
        console.log('🔄 Calling EventService.updateEvent...');
        event = await EventService.updateEvent(editEventId, eventData, organizerId);
        console.log('✅ Event updated successfully:', event);
        toast.success('Event updated successfully!');
      } else {
        console.log('🔄 Calling EventService.createEvent...');
        event = await EventService.createEvent(eventData, organizerId);
        console.log('✅ Event created successfully:', event);
        toast.success('Event created successfully! You can now manage all event settings.');
      }
      
      navigate(`/events/${event.id}`);
    } catch (error: any) {
      console.error(`❌ Error ${isEditing ? 'updating' : 'creating'} event:`, error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      
      // More specific error messages
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`;
      if (error.message?.includes('organizer_id')) {
        errorMessage = 'Invalid organizer profile. Please set up your organizer profile first.';
      } else if (error.message?.includes('venue')) {
        errorMessage = 'Error with venue information. Please check your venue details.';
      } else if (error.message?.includes('ticket_types')) {
        errorMessage = 'Error with ticket information. Please check your ticket settings.';
      } else if (error.message?.includes('image') || error.message?.includes('upload')) {
        errorMessage = 'Error uploading images. Please try uploading smaller images.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <OrganizerRoute>
        <div className="min-h-screen py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stepping-purple mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading event data...</p>
              </div>
            </div>
          </div>
        </div>
      </OrganizerRoute>
    );
  }

  return (
    <OrganizerRoute>
      <div className="min-h-screen py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/events')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">{isEditing ? 'Edit Event' : 'Create New Event'}</h1>
            <p className="text-muted-foreground">{isEditing ? 'Update your stepping event details' : 'Set up your stepping event with all the essential details'}</p>
          </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Event Type Selection - Moved to Top */}
            <Card className="border-2 border-stepping-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-stepping-purple" />
                  Event Type
                </CardTitle>
                <CardDescription>
                  Choose the type of event you're creating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-auto">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">
                            <div className="flex items-start gap-3 py-2">
                              <Star className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <div className="font-medium">{EVENT_TYPE_LABELS.simple}</div>
                                <div className="text-sm text-muted-foreground max-w-sm">
                                  {EVENT_TYPE_DESCRIPTIONS.simple}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="ticketed">
                            <div className="flex items-start gap-3 py-2">
                              <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <div className="font-medium">{EVENT_TYPE_LABELS.ticketed}</div>
                                <div className="text-sm text-muted-foreground max-w-sm">
                                  {EVENT_TYPE_DESCRIPTIONS.ticketed}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="premium">
                            <div className="flex items-start gap-3 py-2">
                              <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div>
                                <div className="font-medium">{EVENT_TYPE_LABELS.premium}</div>
                                <div className="text-sm text-muted-foreground max-w-sm">
                                  {EVENT_TYPE_DESCRIPTIONS.premium}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Event Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Chicago Stepping Championship 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event in detail. Include what attendees can expect, dress code, special guests, etc."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Categories * (Select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {Array.isArray(eventCategories) ? eventCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={field.value?.includes(category)}
                              onCheckedChange={(checked) => {
                                const currentCategories = field.value || [];
                                if (checked) {
                                  field.onChange([...currentCategories, category]);
                                } else {
                                  field.onChange(currentCategories.filter((c) => c !== category));
                                }
                              }}
                            />
                            <Label htmlFor={category} className="text-sm cursor-pointer">
                              {category}
                            </Label>
                          </div>
                        )) : null}
                      </div>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Your event will appear in all selected categories (e.g., "Workshop in the park")
                      </p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Date & Time
                </CardTitle>
                <CardDescription>
                  When will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="isMultiDay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Multi-day Event</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            This event spans multiple days
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          Start Date *
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input type="date" {...field} className="cursor-pointer" />
                            {field.value && (
                              <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded border">
                                📅 {formatDateDisplay(field.value)}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          Start Time *
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="cursor-pointer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Always show end time section */}
                <div className="grid grid-cols-2 gap-4">
                  {isMultiDay && (
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            End Date
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input type="date" {...field} className="cursor-pointer" />
                              {field.value && (
                                <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded border">
                                  📅 {formatDateDisplay(field.value)}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className={isMultiDay ? "" : "col-span-2"}>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-600" />
                          End Time *
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="cursor-pointer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isMultiDay && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Additional Dates</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addAdditionalDate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Date
                      </Button>
                    </div>
                    {Array.isArray(additionalDates) ? additionalDates.map((date, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 items-end">
                        <div>
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Start Date
                          </Label>
                          <div className="space-y-2">
                            <Input 
                              type="date" 
                              value={date.startDate}
                              onChange={(e) => updateAdditionalDate(index, 'startDate', e.target.value)}
                              className="cursor-pointer"
                            />
                            {date.startDate && (
                              <div className="text-xs text-muted-foreground bg-blue-50 p-1 rounded text-center">
                                {formatDateDisplay(date.startDate)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            Start Time
                          </Label>
                          <Input 
                            type="time" 
                            value={date.startTime}
                            onChange={(e) => updateAdditionalDate(index, 'startTime', e.target.value)}
                            className="cursor-pointer"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            End Date
                          </Label>
                          <div className="space-y-2">
                            <Input 
                              type="date" 
                              value={date.endDate}
                              onChange={(e) => updateAdditionalDate(index, 'endDate', e.target.value)}
                              className="cursor-pointer"
                            />
                            {date.endDate && (
                              <div className="text-xs text-muted-foreground bg-blue-50 p-1 rounded text-center">
                                {formatDateDisplay(date.endDate)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            End Time
                          </Label>
                          <Input 
                            type="time" 
                            value={date.endTime}
                            onChange={(e) => updateAdditionalDate(index, 'endTime', e.target.value)}
                            className="cursor-pointer"
                          />
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => removeAdditionalDate(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )) : null}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Where will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="isOnlineEvent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Online Event</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            This is a virtual event
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {isOnlineEvent ? (
                  <FormField
                    control={form.control}
                    name="onlineEventLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Link</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://zoom.us/j/123456789"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Navy Pier Grand Ballroom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="600 E Grand Ave" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Chicago" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state.abbreviation} value={state.value}>
                                    {state.name} ({state.abbreviation})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="60611" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Featured Image Section - Optional for Simple Events */}
            {eventType !== 'simple' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Featured Image
                    </CardTitle>
                    <CardDescription>
                      Upload a main image for your event (recommended: 1200x630px)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      value={featuredImage}
                      onChange={setFeaturedImage}
                      variant="featured"
                      placeholder="Upload a high-quality image that represents your event"
                    />
                  </CardContent>
                </Card>

                {/* Gallery Images Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Event Gallery (Optional)
                    </CardTitle>
                    <CardDescription>
                      Upload additional images to showcase your event (up to 3 images)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      value={eventImages}
                      onChange={setEventImages}
                      variant="gallery"
                      multiple
                      maxFiles={3}
                      placeholder="Add more images to give attendees a better sense of your event"
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Attendance Configuration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {eventType === 'simple' ? 'Admission Price' : 'Attendance Configuration'}
                </CardTitle>
                <CardDescription>
                  {eventType === 'simple'
                    ? 'Set the admission price for your event'
                    : 'Configure how people can attend your event'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {eventType === 'simple' ? (
                  /* Simple Event Mode - Just Admission Price */
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ticketPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Price *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="25.00" 
                                className="pl-8"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            Price per person (leave empty for free events)
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Capacity (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            Maximum number of attendees (leave empty for unlimited)
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  /* Full Configuration Mode */
                  <div>
                    {/* Event Capacity */}
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            Maximum number of attendees (leave empty for unlimited)
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    {/* Simple Event Configuration */}
                    {eventType === 'simple' && (
                      <div className="space-y-4 pl-4 border-l-2 border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="freeEntryCondition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Free Entry Condition</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Free for women before 10pm" 
                                    {...field} 
                                  />
                                </FormControl>
                                <div className="text-sm text-muted-foreground">
                                  Optional condition for free entry
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="doorPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Door Price</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="number"
                                      step="0.01"
                                      placeholder="15.00" 
                                      className="pl-8"
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <div className="text-sm text-muted-foreground">
                                  Price at the door (required)
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Ticket Configuration */}
                    {(eventType === 'ticketed' || eventType === 'premium') && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="requiresTickets"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Paid Tickets Required</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Attendees must purchase tickets to attend this event
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Ticket Price - only show if tickets are required */}
                        {requiresTickets && (
                          <FormField
                            control={form.control}
                            name="ticketPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ticket Price *</FormLabel>
                                <FormControl>
                                  <Input placeholder="45.00" {...field} />
                                </FormControl>
                                <div className="text-sm text-muted-foreground">
                                  Price per ticket in USD
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Info about configuration */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">
                        {EVENT_TYPE_LABELS[eventType]}
                      </p>
                      <p className="text-blue-700">
                        {EVENT_TYPE_DESCRIPTIONS[eventType]}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading} className="bg-stepping-gradient">
                {isSubmitting ? (
                  <>{isEditing ? 'Updating Event...' : 'Creating Event...'}</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </div>
    </OrganizerRoute>
  );
};

export default CreateEventPage;