import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  ArrowLeft,
  Plus,
  X,
  Save,
  AlertCircle,
  Repeat,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { classesService } from '@/services/classesService';
import { toast } from 'sonner';
import type { CreatePhysicalClassData, RecurringPattern } from '@/types/classes';

const physicalClassSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['stepping', 'walkin', 'linedancing', 'freestyle', 'choreography', 'competition']),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(3, 'Location is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  max_students: z.number().min(1, 'Must allow at least 1 student').max(100, 'Maximum 100 students'),
  duration_minutes: z.number().min(30, 'Minimum 30 minutes').max(480, 'Maximum 8 hours'),
  rsvp_required: z.boolean().default(true),
  rsvp_deadline_hours: z.number().min(1).max(168).optional(), // 1 hour to 1 week
  waitlist_enabled: z.boolean().default(false),
  
  // Recurring pattern
  is_recurring: z.boolean().default(false),
  recurring_type: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  recurring_days: z.array(z.number().min(0).max(6)).optional(),
  recurring_start_date: z.string().optional(),
  recurring_end_date: z.string().optional(),
  recurring_total_sessions: z.number().min(1).max(52).optional(),
  
  // Single class dates (for non-recurring)
  class_dates: z.array(z.object({
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    max_students: z.number().optional()
  })).optional(),
  
  requirements: z.array(z.string()).optional(),
  what_to_expect: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Notifications
  send_reminder_notifications: z.boolean().default(true),
  reminder_hours_before: z.array(z.number()).optional() // e.g., [24, 2] for 24h and 2h before
});

type PhysicalClassFormData = z.infer<typeof physicalClassSchema>;

const CreatePhysicalClassPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');

  const form = useForm<PhysicalClassFormData>({
    resolver: zodResolver(physicalClassSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'stepping',
      level: 'beginner',
      price: 0,
      location: '',
      max_students: 20,
      duration_minutes: 90,
      rsvp_required: true,
      rsvp_deadline_hours: 24,
      waitlist_enabled: false,
      is_recurring: false,
      class_dates: [{ date: '', start_time: '', end_time: '' }],
      requirements: [],
      tags: [],
      send_reminder_notifications: true,
      reminder_hours_before: [24, 2]
    }
  });

  const categories = [
    { value: 'stepping', label: 'Chicago Stepping' },
    { value: 'walkin', label: 'Walkin' },
    { value: 'linedancing', label: 'Line Dancing' },
    { value: 'freestyle', label: 'Freestyle' },
    { value: 'choreography', label: 'Choreography' },
    { value: 'competition', label: 'Competition Prep' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all', label: 'All Levels' }
  ];

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const current = form.getValues('requirements') || [];
      form.setValue('requirements', [...current, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    const current = form.getValues('requirements') || [];
    form.setValue('requirements', current.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim()) {
      const current = form.getValues('tags') || [];
      form.setValue('tags', [...current, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const current = form.getValues('tags') || [];
    form.setValue('tags', current.filter((_, i) => i !== index));
  };

  const addClassDate = () => {
    const current = form.getValues('class_dates') || [];
    form.setValue('class_dates', [...current, { date: '', start_time: '', end_time: '' }]);
  };

  const removeClassDate = (index: number) => {
    const current = form.getValues('class_dates') || [];
    if (current.length > 1) {
      form.setValue('class_dates', current.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: PhysicalClassFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a class');
      return;
    }

    setLoading(true);
    try {
      let recurringPattern: RecurringPattern | undefined;
      let classDates: any[] = [];

      if (data.is_recurring && data.recurring_type && data.recurring_days) {
        recurringPattern = {
          type: data.recurring_type,
          days_of_week: data.recurring_days,
          start_date: data.recurring_start_date!,
          end_date: data.recurring_end_date,
          total_sessions: data.recurring_total_sessions
        };
      } else {
        classDates = data.class_dates?.filter(date => date.date && date.start_time && date.end_time) || [];
      }

      const createData: CreatePhysicalClassData = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        price: data.price,
        location: data.location,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        max_students: data.max_students,
        duration_minutes: data.duration_minutes,
        class_dates: classDates,
        recurring_pattern: recurringPattern,
        requirements: data.requirements,
        what_to_expect: data.what_to_expect,
        tags: data.tags || [],
        rsvp_required: data.rsvp_required,
        rsvp_deadline: data.rsvp_deadline_hours ? `${data.rsvp_deadline_hours} hours` : undefined,
        waitlist_enabled: data.waitlist_enabled
      };

      const result = await classesService.createPhysicalClass(createData);

      if (result.success) {
        toast.success('Physical class created successfully!');
        navigate('/instructor/dashboard');
      } else {
        toast.error(result.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isRecurring = form.watch('is_recurring');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-blue-500 text-white">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create Physical Class</h1>
            <p className="text-muted-foreground">
              Schedule in-person stepping classes for your students
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential details about your class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Beginner Stepping Fundamentals" {...field} />
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
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what students will learn in this class..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Level *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {levels.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
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
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0"
                              placeholder="25.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="30" 
                              max="480"
                              placeholder="90"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 90)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue/Studio Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., South Side Cultural Center" {...field} />
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
                        <FormLabel>Street Address</FormLabel>
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
                          <FormLabel>City</FormLabel>
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="IL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="60601" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              {/* Schedule Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="is_recurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Recurring Class</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Create a series of classes that repeat on a schedule
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
                </CardContent>
              </Card>

              {/* Recurring Schedule */}
              {isRecurring ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Repeat className="h-5 w-5" />
                      Recurring Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurring_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recurring_total_sessions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Sessions</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="52"
                                placeholder="8"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="recurring_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Days of Week *</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map((day) => (
                              <Button
                                key={day.value}
                                type="button"
                                variant={field.value?.includes(day.value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const current = field.value || [];
                                  if (current.includes(day.value)) {
                                    field.onChange(current.filter(d => d !== day.value));
                                  } else {
                                    field.onChange([...current, day.value]);
                                  }
                                }}
                              >
                                {day.label}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurring_start_date"
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
                        name="recurring_end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Individual Class Dates */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Class Dates & Times</CardTitle>
                      <Button type="button" onClick={addClassDate} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Date
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch('class_dates')?.map((_, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <FormField
                          control={form.control}
                          name={`class_dates.${index}.date`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`class_dates.${index}.start_time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`class_dates.${index}.end_time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-end">
                          {form.watch('class_dates')!.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeClassDate(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Capacity & RSVP */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Capacity & RSVP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="max_students"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Students *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="100"
                            placeholder="20"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rsvp_required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">RSVP Required</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Students must RSVP before attending
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

                  {form.watch('rsvp_required') && (
                    <FormField
                      control={form.control}
                      name="rsvp_deadline_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RSVP Deadline (hours before class)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="168"
                              placeholder="24"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="waitlist_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Waitlist</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Allow students to join a waitlist when class is full
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>
                    What students need to bring or know
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Comfortable shoes, water bottle"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {form.watch('requirements')?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.watch('requirements')!.map((req, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {req}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle>What Students Can Expect</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="what_to_expect"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the class structure, what students will learn, and the overall experience..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Help students find your class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., beginner-friendly, fun, energetic"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {form.watch('tags')?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.watch('tags')!.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          #{tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeTag(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              {/* Reminder Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Reminder Notifications
                  </CardTitle>
                  <CardDescription>
                    Automatically remind students about upcoming classes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="send_reminder_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Send Reminder Notifications</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Automatically send reminders to registered students
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

                  {form.watch('send_reminder_notifications') && (
                    <div className="space-y-2">
                      <Label>Reminder Schedule</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="24h" defaultChecked />
                          <label htmlFor="24h" className="text-sm">24 hours before</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="2h" defaultChecked />
                          <label htmlFor="2h" className="text-sm">2 hours before</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="1h" />
                          <label htmlFor="1h" className="text-sm">1 hour before</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="30m" />
                          <label htmlFor="30m" className="text-sm">30 minutes before</label>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Students will receive notifications for:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Class reminders (based on your schedule above)</li>
                      <li>Class cancellations or changes</li>
                      <li>Waitlist availability</li>
                      <li>RSVP confirmations</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Physical Class
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePhysicalClassPage;