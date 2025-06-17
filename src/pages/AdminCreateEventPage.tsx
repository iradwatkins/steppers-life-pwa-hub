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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
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
  Search,
  UserPlus,
  Settings,
  Shield,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react';

const adminEventFormSchema = z.object({
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
  assignToPromoter: z.boolean().default(false),
  promoterId: z.string().optional(),
  adminNotes: z.string().optional(),
});

type AdminEventFormData = z.infer<typeof adminEventFormSchema>;

interface Promoter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  eventsCreated: number;
  rating: number;
  specialties: string[];
  location: string;
  avatar?: string;
  isVerified: boolean;
}

const AdminCreateEventPage = () => {
  const { user } = useAuth();
  const { canAccessAdmin } = useRoles();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [additionalDates, setAdditionalDates] = useState<Array<{startDate: string; startTime: string; endDate?: string; endTime?: string}>>([]);
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
  const [isPromoterDialogOpen, setIsPromoterDialogOpen] = useState(false);
  const [promoterSearchTerm, setPromoterSearchTerm] = useState('');

  // Mock promoters data - in real implementation, fetch from API
  const mockPromoters: Promoter[] = [
    {
      id: 'promo_1',
      firstName: 'Marcus',
      lastName: 'Johnson',
      email: 'marcus.johnson@email.com',
      phone: '(312) 555-0123',
      company: 'Chicago Stepping Elite',
      eventsCreated: 24,
      rating: 4.8,
      specialties: ['Chicago Stepping', 'Social Events', 'Workshops'],
      location: 'Chicago, IL',
      isVerified: true
    },
    {
      id: 'promo_2',
      firstName: 'Diana',
      lastName: 'Williams',
      email: 'diana.williams@email.com',
      phone: '(312) 555-0456',
      company: 'Southside Dance Academy',
      eventsCreated: 18,
      rating: 4.6,
      specialties: ['Workshop Series', 'Youth Programs'],
      location: 'Chicago, IL',
      isVerified: true
    },
    {
      id: 'promo_3',
      firstName: 'Robert',
      lastName: 'Davis',
      email: 'robert.davis@email.com',
      company: 'Corporate Events Pro',
      eventsCreated: 12,
      rating: 4.9,
      specialties: ['Corporate Events', 'Private Functions'],
      location: 'Chicago, IL',
      isVerified: false
    },
    {
      id: 'promo_4',
      firstName: 'Sarah',
      lastName: 'Thompson',
      email: 'sarah.thompson@email.com',
      phone: '(312) 555-0789',
      eventsCreated: 31,
      rating: 4.7,
      specialties: ['Social Dancing', 'Competitions', 'Galas'],
      location: 'Chicago, IL',
      isVerified: true
    }
  ];

  const filteredPromoters = mockPromoters.filter(promoter => 
    `${promoter.firstName} ${promoter.lastName}`.toLowerCase().includes(promoterSearchTerm.toLowerCase()) ||
    promoter.email.toLowerCase().includes(promoterSearchTerm.toLowerCase()) ||
    promoter.company?.toLowerCase().includes(promoterSearchTerm.toLowerCase())
  );

  // Event categories
  const eventCategories = [
    'Workshops',
    'Sets',
    'In the park',
    'Trips',
    'Cruises',
    'Holiday',
    'Competitions'
  ];

  const form = useForm<AdminEventFormData>({
    resolver: zodResolver(adminEventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      startDate: '',
      startTime: '19:00',
      endDate: '',
      endTime: '02:00',
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
      assignToPromoter: false,
      promoterId: '',
      adminNotes: '',
    }
  });

  const watchAssignToPromoter = form.watch('assignToPromoter');

  const onSubmit = async (data: AdminEventFormData) => {
    setIsSubmitting(true);
    try {
      // Mock API call - in real app would save to backend
      console.log('Admin Event Data:', data);
      console.log('Images:', uploadedImages);
      console.log('Additional Dates:', additionalDates);
      console.log('Selected Promoter:', selectedPromoter);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock event ID generation
      const mockEventId = `admin_event_${Date.now()}`;
      
      // Create audit log entry
      const auditLogEntry = {
        eventId: mockEventId,
        action: 'admin_created',
        adminId: user?.id,
        adminName: `${user?.firstName} ${user?.lastName}`,
        assignedTo: selectedPromoter ? `${selectedPromoter.firstName} ${selectedPromoter.lastName}` : 'Unassigned',
        timestamp: new Date().toISOString(),
        notes: data.adminNotes
      };
      
      console.log('Audit Log Entry:', auditLogEntry);
      
      if (data.assignToPromoter && selectedPromoter) {
        toast.success(`Event created and assigned to ${selectedPromoter.firstName} ${selectedPromoter.lastName}!`);
        // In real implementation, send notification to promoter
        console.log('Notification sent to promoter:', selectedPromoter.email);
      } else {
        toast.success('Event created successfully! It can be claimed by promoters.');
      }
      
      // Navigate to event management or admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPromoter = (promoter: Promoter) => {
    setSelectedPromoter(promoter);
    form.setValue('promoterId', promoter.id);
    setIsPromoterDialogOpen(false);
    toast.success(`Promoter ${promoter.firstName} ${promoter.lastName} selected for assignment.`);
  };

  const handleRemovePromoter = () => {
    setSelectedPromoter(null);
    form.setValue('promoterId', '');
    toast.success('Promoter assignment removed.');
  };


  return (
    <AdminRoute>
      <div className="min-h-screen py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin</span>
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-3xl font-bold">Admin: Create Event</h1>
              </div>
              <p className="text-muted-foreground">Create events on behalf of promoters and manage platform content</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Admin Assignment Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <UserPlus className="h-5 w-5" />
                  Promoter Assignment
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Assign this event to a specific promoter or leave unassigned for claiming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="assignToPromoter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-blue-900">Assign to Promoter</FormLabel>
                        <p className="text-sm text-blue-700">
                          Directly assign this event to a specific promoter
                        </p>
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

                {watchAssignToPromoter && (
                  <div className="space-y-4">
                    {selectedPromoter ? (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={selectedPromoter.avatar} />
                                <AvatarFallback>
                                  {selectedPromoter.firstName[0]}{selectedPromoter.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-green-900">
                                    {selectedPromoter.firstName} {selectedPromoter.lastName}
                                  </h4>
                                  {selectedPromoter.isVerified && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <p className="text-sm text-green-700">{selectedPromoter.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary">{selectedPromoter.eventsCreated} events</Badge>
                                  <Badge variant="secondary">★ {selectedPromoter.rating}</Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemovePromoter}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Dialog open={isPromoterDialogOpen} onOpenChange={setIsPromoterDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            type="button"
                            variant="outline" 
                            className="w-full flex items-center space-x-2"
                          >
                            <Search className="h-4 w-4" />
                            <span>Select Promoter</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Select Promoter</DialogTitle>
                            <DialogDescription>
                              Choose a promoter to assign this event to
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search promoters by name, email, or company..."
                                value={promoterSearchTerm}
                                onChange={(e) => setPromoterSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-2">
                              {filteredPromoters.map((promoter) => (
                                <Card 
                                  key={promoter.id} 
                                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => handleSelectPromoter(promoter)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <Avatar>
                                        <AvatarImage src={promoter.avatar} />
                                        <AvatarFallback>
                                          {promoter.firstName[0]}{promoter.lastName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-medium">
                                            {promoter.firstName} {promoter.lastName}
                                          </h4>
                                          {promoter.isVerified && (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600">{promoter.email}</p>
                                        {promoter.company && (
                                          <p className="text-sm text-gray-600">{promoter.company}</p>
                                        )}
                                        <div className="flex items-center space-x-2 mt-2">
                                          <Badge variant="secondary">{promoter.eventsCreated} events</Badge>
                                          <Badge variant="secondary">★ {promoter.rating}</Badge>
                                          <Badge variant="outline">{promoter.location}</Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {promoter.specialties.map((specialty, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                              {specialty}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPromoterDialogOpen(false)}>
                              Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="adminNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes (Internal)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Internal notes about this event creation, reasons for assignment, etc."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Event Details Section - Reuse from CreateEventPage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Basic information about the event
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
                          placeholder="Describe the event in detail. Include what attendees can expect, dress code, special guests, etc."
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date & Time
                </CardTitle>
                <CardDescription>
                  When will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Venue & Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Venue & Location
                </CardTitle>
                <CardDescription>
                  Where will your event be held?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isOnlineEvent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Online Event</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This event will be held virtually
                        </p>
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

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Grand Ballroom" {...field} />
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
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <Input placeholder="60601" {...field} />
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
                        We'll automatically find the exact coordinates for the venue address. 
                        This enables distance-based sorting and helps users find nearby events.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ticket Information
                </CardTitle>
                <CardDescription>
                  Basic ticket pricing and capacity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Capacity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field} 
                          />
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
                        <FormLabel>Starting Ticket Price *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="25.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Section */}
            <div className="flex items-center justify-between pt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </Button>
              <div className="flex items-center space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSubmitting ? 'Creating Event...' : 'Create Event'}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </Form>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminCreateEventPage;