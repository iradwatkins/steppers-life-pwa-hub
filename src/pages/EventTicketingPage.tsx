import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Ticket,
  Settings,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const ticketTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().default('USD'),
  quantity: z.string().min(1, 'Quantity is required'),
  salesStartDate: z.string().min(1, 'Sales start date is required'),
  salesStartTime: z.string().min(1, 'Sales start time is required'),
  salesEndDate: z.string().min(1, 'Sales end date is required'),
  salesEndTime: z.string().min(1, 'Sales end time is required'),
  hasPresale: z.boolean().default(false),
  presaleStartDate: z.string().optional(),
  presaleStartTime: z.string().optional(),
  presaleEndDate: z.string().optional(),
  presaleEndTime: z.string().optional(),
  isGroupTicket: z.boolean().default(false),
  groupMinQuantity: z.string().optional(),
  groupMaxQuantity: z.string().optional(),
  groupDiscount: z.string().optional(),
});

const ticketingFormSchema = z.object({
  eventId: z.string(),
  requiresTickets: z.boolean().default(true),
  ticketTypes: z.array(ticketTypeSchema).optional(),
}).refine((data) => {
  // If tickets are required, at least one ticket type must exist
  if (data.requiresTickets && (!data.ticketTypes || data.ticketTypes.length === 0)) {
    return false;
  }
  // If tickets are not required, this is a free event
  if (!data.requiresTickets) {
    return true;
  }
  return true;
});

type TicketingFormData = z.infer<typeof ticketingFormSchema>;
type TicketType = z.infer<typeof ticketTypeSchema>;

const EventTicketingPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketingFormData>({
    resolver: zodResolver(ticketingFormSchema),
    defaultValues: {
      eventId: eventId || '',
      requiresTickets: true,
      ticketTypes: [
        {
          id: '1',
          name: 'General Admission',
          description: '',
          price: '',
          currency: 'USD',
          quantity: '',
          salesStartDate: '',
          salesStartTime: '',
          salesEndDate: '',
          salesEndTime: '',
          hasPresale: false,
          presaleStartDate: '',
          presaleStartTime: '',
          presaleEndDate: '',
          presaleEndTime: '',
          isGroupTicket: false,
          groupMinQuantity: '',
          groupMaxQuantity: '',
          groupDiscount: '',
        }
      ],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTypes'
  });

  const requiresTickets = form.watch('requiresTickets');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (!eventId) {
      navigate('/dashboard');
    }
  }, [user, eventId, navigate]);

  const addTicketType = () => {
    const newId = (fields.length + 1).toString();
    append({
      id: newId,
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      quantity: '',
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
      hasPresale: false,
      presaleStartDate: '',
      presaleStartTime: '',
      presaleEndDate: '',
      presaleEndTime: '',
      isGroupTicket: false,
      groupMinQuantity: '',
      groupMaxQuantity: '',
      groupDiscount: '',
    });
  };

  const removeTicketType = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error('You must have at least one ticket type');
    }
  };

  const onSubmit = async (data: TicketingFormData) => {
    setIsSubmitting(true);
    try {
      // Mock API call - in real app would save to backend
      console.log('Event Attendance Configuration Data:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const successMessage = data.requiresTickets 
        ? 'Ticketing configuration saved! Now configure seating arrangements.'
        : 'Event configuration saved! Your free event is ready for attendees.';
      
      toast.success(successMessage);
      
      // Navigate to appropriate next step
      if (data.requiresTickets) {
        navigate(`/organizer/event/${eventId}/seating`);
      } else {
        navigate(`/events/${eventId}`);
      }
    } catch (error) {
      toast.error('Failed to save event configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD'];

  if (!user || !eventId) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Configure Event Attendance</h1>
          <p className="text-muted-foreground">Set up ticketing and attendance management for your event</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Event Configuration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Event Configuration
                </CardTitle>
                <CardDescription>
                  Configure how people can attend your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ticket Configuration Toggle */}
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
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />



                {/* Info about configuration */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">
                        {requiresTickets ? "Ticketed Event" : "Free Event"}
                      </p>
                      <p className="text-blue-700">
                        {requiresTickets
                          ? "Attendees must purchase tickets to attend this event."
                          : "This is a free event."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Types Section - only show if tickets are required */}
            {requiresTickets && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5" />
                      Ticket Types
                    </CardTitle>
                    <CardDescription>
                      Define different ticket types for your event
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addTicketType} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ticket Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {(fields || []).map((field, index) => (
                    <Card key={field.id} className="relative">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Ticket Type {index + 1}
                          </CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeTicketType(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`ticketTypes.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ticket Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="General Admission" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ticketTypes.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input placeholder="Standard event access" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`ticketTypes.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price *</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="45.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ticketTypes.${index}.currency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(currencies || []).map((currency) => (
                                      <SelectItem key={currency} value={currency}>
                                        {currency}
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
                            name={`ticketTypes.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Available Quantity *</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="100" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        {/* Sales Period */}
                        <div>
                          <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            General Sales Period
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Sales Start</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name={`ticketTypes.${index}.salesStartDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`ticketTypes.${index}.salesStartTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Sales End</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name={`ticketTypes.${index}.salesEndDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`ticketTypes.${index}.salesEndTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pre-sale Configuration */}
                        <div>
                          <FormField
                            control={form.control}
                            name={`ticketTypes.${index}.hasPresale`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Pre-sale Period</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Enable early access sales before general sales
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

                          {form.watch(`ticketTypes.${index}.hasPresale`) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Pre-sale Start</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <FormField
                                    control={form.control}
                                    name={`ticketTypes.${index}.presaleStartDate`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`ticketTypes.${index}.presaleStartTime`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Pre-sale End</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <FormField
                                    control={form.control}
                                    name={`ticketTypes.${index}.presaleEndDate`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`ticketTypes.${index}.presaleEndTime`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Group Ticket Configuration */}
                        <div>
                          <FormField
                            control={form.control}
                            name={`ticketTypes.${index}.isGroupTicket`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Group Ticket Options</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Enable group purchasing with discounts
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

                          {form.watch(`ticketTypes.${index}.isGroupTicket`) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.groupMinQuantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Min Group Size</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="5" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.groupMaxQuantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Group Size</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.groupDiscount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Group Discount (%)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-stepping-gradient">
                {isSubmitting ? (
                  <>Saving Configuration...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EventTicketingPage;