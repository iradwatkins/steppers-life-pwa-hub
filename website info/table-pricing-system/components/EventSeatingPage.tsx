import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Plus,
  Trash2,
  Users,
  Armchair,
  Grid3x3,
  Settings,
  Save,
  ArrowLeft,
  MapPin,
  Hash,
  Ban
} from 'lucide-react';

// Schema definitions
const tableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Table name is required'),
  capacity: z.string().min(1, 'Table capacity is required'),
  pricingType: z.enum(['table', 'individual']),
  tablePrice: z.string().optional(),
  seatPrice: z.string().optional(),
  isBlocked: z.boolean().default(false),
});

const sectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
  capacity: z.string().min(1, 'Section capacity is required'),
  pricePerSeat: z.string().min(1, 'Price per seat is required'),
  isBlocked: z.boolean().default(false),
});

const seatingFormSchema = z.object({
  eventId: z.string(),
  seatingType: z.enum(['general', 'reserved']),
  generalAdmissionCapacity: z.string().optional(),
  generalAdmissionPrice: z.string().optional(),
  tables: z.array(tableSchema).optional(),
  sections: z.array(sectionSchema).optional(),
});

type SeatingFormData = z.infer<typeof seatingFormSchema>;
type Table = z.infer<typeof tableSchema>;
type Section = z.infer<typeof sectionSchema>;

const EventSeatingPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SeatingFormData>({
    resolver: zodResolver(seatingFormSchema),
    defaultValues: {
      eventId: eventId || '',
      seatingType: 'general',
      generalAdmissionCapacity: '',
      generalAdmissionPrice: '',
      tables: [],
      sections: [],
    }
  });

  const { fields: tableFields, append: appendTable, remove: removeTable } = useFieldArray({
    control: form.control,
    name: 'tables'
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: 'sections'
  });

  const seatingType = form.watch('seatingType');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (!eventId) {
      navigate('/dashboard');
    }
  }, [user, eventId, navigate]);

  const addTable = () => {
    const newId = (tableFields.length + 1).toString();
    appendTable({
      id: newId,
      name: `Table ${newId}`,
      capacity: '',
      pricingType: 'table',
      tablePrice: '',
      seatPrice: '',
      isBlocked: false,
    });
  };

  const removeTableItem = (index: number) => {
    removeTable(index);
  };

  const addSection = () => {
    const newId = (sectionFields.length + 1).toString();
    appendSection({
      id: newId,
      name: `Section ${String.fromCharCode(65 + sectionFields.length)}`,
      description: '',
      capacity: '',
      pricePerSeat: '',
      isBlocked: false,
    });
  };

  const removeSectionItem = (index: number) => {
    removeSection(index);
  };

  const onSubmit = async (data: SeatingFormData) => {
    setIsSubmitting(true);
    try {
      // Mock API call - in real app would save to backend
      console.log('Seating Data:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Seating configuration saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save seating configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">Configure Event Seating</h1>
          <p className="text-muted-foreground">Set up seating arrangements for your event</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Seating Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Armchair className="h-5 w-5" />
                  Seating Type
                </CardTitle>
                <CardDescription>
                  Choose how you want to organize seating for your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="seatingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Arrangement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select seating type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              General Admission
                            </div>
                          </SelectItem>
                          <SelectItem value="reserved">
                            <div className="flex items-center gap-2">
                              <Grid3x3 className="h-4 w-4" />
                              Reserved Seating (Tables & Sections)
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

            {/* General Admission Configuration */}
            {seatingType === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    General Admission Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure capacity and pricing for general admission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="generalAdmissionCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Capacity *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="generalAdmissionPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Ticket *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="25.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reserved Seating Configuration */}
            {seatingType === 'reserved' && (
              <>
                {/* Tables Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          Table Configuration
                        </CardTitle>
                        <CardDescription>
                          Define tables with names, capacity, and pricing
                        </CardDescription>
                      </div>
                      <Button type="button" onClick={addTable} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Table
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tableFields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No tables configured. Click "Add Table" to get started.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {tableFields.map((field, index) => (
                          <Card key={field.id} className="relative">
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                  Table {index + 1}
                                </CardTitle>
                                <div className="flex gap-2">
                                  <FormField
                                    control={form.control}
                                    name={`tables.${index}.isBlocked`}
                                    render={({ field }) => (
                                      <Button
                                        type="button"
                                        variant={field.value ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => field.onChange(!field.value)}
                                      >
                                        <Ban className="h-4 w-4 mr-2" />
                                        {field.value ? 'Blocked' : 'Block'}
                                      </Button>
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeTableItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`tables.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Table Name *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Table 1" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`tables.${index}.capacity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Table Capacity *</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="8" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div>
                                <FormField
                                  control={form.control}
                                  name={`tables.${index}.pricingType`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Pricing Type *</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="table">Price for Entire Table</SelectItem>
                                          <SelectItem value="individual">Price per Individual Seat</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {form.watch(`tables.${index}.pricingType`) === 'table' && (
                                <FormField
                                  control={form.control}
                                  name={`tables.${index}.tablePrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Table Price *</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" placeholder="360.00" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              {form.watch(`tables.${index}.pricingType`) === 'individual' && (
                                <FormField
                                  control={form.control}
                                  name={`tables.${index}.seatPrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price per Seat *</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" placeholder="45.00" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sections Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Grid3x3 className="h-5 w-5" />
                          Section Configuration
                        </CardTitle>
                        <CardDescription>
                          Define sections with capacity and per-seat pricing
                        </CardDescription>
                      </div>
                      <Button type="button" onClick={addSection} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sectionFields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No sections configured. Click "Add Section" to get started.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {sectionFields.map((field, index) => (
                          <Card key={field.id} className="relative">
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                  Section {index + 1}
                                </CardTitle>
                                <div className="flex gap-2">
                                  <FormField
                                    control={form.control}
                                    name={`sections.${index}.isBlocked`}
                                    render={({ field }) => (
                                      <Button
                                        type="button"
                                        variant={field.value ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => field.onChange(!field.value)}
                                      >
                                        <Ban className="h-4 w-4 mr-2" />
                                        {field.value ? 'Blocked' : 'Block'}
                                      </Button>
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeSectionItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Section Name *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Section A" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.capacity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Section Capacity *</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="50" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`sections.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Section Description</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Front row, closest to stage" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`sections.${index}.pricePerSeat`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price per Seat *</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" placeholder="65.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
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

export default EventSeatingPage; 