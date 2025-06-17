import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Image as ImageIcon
} from 'lucide-react';

const eventFormSchema = z.object({
  title: z.string().min(5, 'Event title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
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
  capacity: z.string().min(1, 'Capacity is required'),
  ticketPrice: z.string().min(1, 'Ticket price is required'),
});

type EventFormData = z.infer<typeof eventFormSchema>;

const CreateEventPage = () => {
  const { user } = useAuth();
  const { organizerId, hasOrganizer } = useRoles();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [additionalDates, setAdditionalDates] = useState<Array<{startDate: string; startTime: string; endDate?: string; endTime?: string}>>([]);

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
      ticketPrice: '',
    }
  });

  const isMultiDay = form.watch('isMultiDay');
  const isOnlineEvent = form.watch('isOnlineEvent');

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
    if (!user?.id) {
      toast.error('You must be logged in to create events.');
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

      const eventData: CreateEventData = {
        title: data.title,
        description: data.description,
        shortDescription: data.description.substring(0, 150),
        category: data.categories.join(', '), // Store categories as comma-separated string for now
        startDate: startDateTime,
        endDate: endDateTime,
        timezone: 'America/Chicago', // Default to Chicago timezone
        isOnline: data.isOnlineEvent,
        onlineLink: data.onlineEventLink,
        maxAttendees: parseInt(data.capacity),
        ticketTypes: [
          {
            name: 'General Admission',
            description: 'Standard event ticket',
            price: parseFloat(data.ticketPrice),
            quantityAvailable: parseInt(data.capacity),
            maxPerOrder: 10,
          }
        ],
      };

      // Add venue data if it's not an online event
      if (!data.isOnlineEvent) {
        eventData.venue = {
          name: data.venue,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          capacity: parseInt(data.capacity),
        };
      }

      // Handle image uploads
      if (featuredImage) {
        eventData.featuredImageUrl = featuredImage;
      }
      
      if (eventImages.length > 0) {
        eventData.galleryImages = eventImages;
      }

      // TODO: Handle additional dates for multi-day events
      if (additionalDates.length > 0) {
        console.log('Additional dates:', additionalDates);
      }

      // Create the event
      const createdEvent = await EventService.createEvent(eventData, organizerId);
      
      toast.success('Event created successfully! You can now manage all event settings.');
      navigate(`/events/${createdEvent.id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <OrganizerRoute>
      <div className="min-h-screen py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
            <p className="text-muted-foreground">Set up your stepping event with all the essential details</p>
          </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <FormLabel>Event Description *</FormLabel>
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
                        {eventCategories.map((category) => (
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
                        ))}
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
                    {additionalDates.map((date, index) => (
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
                    ))}
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
                            <FormControl>
                              <Input placeholder="IL" {...field} />
                            </FormControl>
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
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">Automatic Location Detection</p>
                          <p className="text-blue-700">
                            We'll automatically find the exact coordinates for your venue address. 
                            This helps users find nearby events and get accurate directions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Featured Image Section */}
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

            {/* Event Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Capacity and pricing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Capacity *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ticketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Price *</FormLabel>
                        <FormControl>
                          <Input placeholder="45.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-stepping-gradient">
                {isSubmitting ? (
                  <>Creating Event...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Event
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