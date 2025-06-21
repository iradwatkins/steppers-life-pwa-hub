import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  DollarSign,
  Upload,
  Eye,
  Save
} from 'lucide-react';

// Seating Types
type SeatingType = 'general_admission' | 'reserved_seating';
type PricingModel = 'per_table' | 'per_seat';

// Table Configuration
interface TableConfig {
  id: string;
  name: string;
  capacity: number;
  price: number;
  pricingModel: PricingModel;
  isBlocked: boolean;
}

// Section Configuration  
interface SectionConfig {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerSeat: number;
  isBlocked: boolean;
}

// General Admission Configuration
interface GAConfig {
  capacity: number;
  price: number;
}

const tableSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(20, 'Max capacity is 20'),
  price: z.number().min(0, 'Price must be positive'),
  pricingModel: z.enum(['per_table', 'per_seat']),
  isBlocked: z.boolean().default(false)
});

const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  pricePerSeat: z.number().min(0, 'Price must be positive'),
  isBlocked: z.boolean().default(false)
});

const seatingFormSchema = z.object({
  seatingType: z.enum(['general_admission', 'reserved_seating']),
  gaConfig: z.object({
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    price: z.number().min(0, 'Price must be positive')
  }).optional(),
  tables: z.array(tableSchema).optional(),
  sections: z.array(sectionSchema).optional()
});

type SeatingFormData = z.infer<typeof seatingFormSchema>;

const EventSeatingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SeatingFormData>({
    resolver: zodResolver(seatingFormSchema),
    defaultValues: {
      seatingType: 'general_admission',
      gaConfig: {
        capacity: 100,
        price: 25
      },
      tables: [],
      sections: []
    }
  });

  const watchSeatingType = form.watch('seatingType');
  
  const { fields: tableFields, append: appendTable, remove: removeTable } = useFieldArray({
    control: form.control,
    name: 'tables'
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: 'sections'
  });

  const addTable = () => {
    appendTable({
      name: `Table ${tableFields.length + 1}`,
      capacity: 8,
      price: 200,
      pricingModel: 'per_table',
      isBlocked: false
    });
  };

  const addSection = () => {
    appendSection({
      name: `Section ${String.fromCharCode(65 + sectionFields.length)}`,
      description: '',
      capacity: 50,
      pricePerSeat: 30,
      isBlocked: false
    });
  };

  const onSubmit = async (data: SeatingFormData) => {
    setIsLoading(true);
    
    try {
      console.log('💺 Saving seating configuration:', data);
      
      // TODO: Implement backend integration
      // await SeatingService.saveSeatingConfiguration(eventId, data);
      
      toast.success('Seating configuration saved successfully!');
      
      // Navigate to next step or back to event management
      navigate(`/organizer/event/${eventId}`);
    } catch (error) {
      console.error('❌ Error saving seating configuration:', error);
      toast.error('Failed to save seating configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    const data = form.getValues();
    let total = 0;

    if (data.seatingType === 'general_admission' && data.gaConfig) {
      total = data.gaConfig.capacity * data.gaConfig.price;
    } else if (data.seatingType === 'reserved_seating') {
      // Calculate table revenue
      data.tables?.forEach(table => {
        if (!table.isBlocked) {
          if (table.pricingModel === 'per_table') {
            total += table.price;
          } else {
            total += table.capacity * table.price;
          }
        }
      });

      // Calculate section revenue
      data.sections?.forEach(section => {
        if (!section.isBlocked) {
          total += section.capacity * section.pricePerSeat;
        }
      });
    }

    return total;
  };

  const calculateTotalCapacity = () => {
    const data = form.getValues();
    let total = 0;

    if (data.seatingType === 'general_admission' && data.gaConfig) {
      total = data.gaConfig.capacity;
    } else if (data.seatingType === 'reserved_seating') {
      data.tables?.forEach(table => {
        if (!table.isBlocked) {
          total += table.capacity;
        }
      });

      data.sections?.forEach(section => {
        if (!section.isBlocked) {
          total += section.capacity;
        }
      });
    }

    return total;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/organizer/event/${eventId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Event Seating Configuration</h1>
              <p className="text-muted-foreground">Configure seating arrangements and pricing for your event</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/organizer/event/${eventId}/seating-chart`)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Chart
            </Button>
          </div>
        </div>

        {/* Revenue Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${calculateTotalRevenue().toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Potential Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {calculateTotalCapacity()}
                </div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  ${calculateTotalCapacity() > 0 ? (calculateTotalRevenue() / calculateTotalCapacity()).toFixed(2) : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Price per Seat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seating Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Seating Type</CardTitle>
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
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="general_admission" id="ga" />
                            <Label htmlFor="ga" className="flex-1 cursor-pointer">
                              <div className="font-medium">General Admission</div>
                              <div className="text-sm text-muted-foreground">
                                Open seating with total capacity and single pricing
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="reserved_seating" id="reserved" />
                            <Label htmlFor="reserved" className="flex-1 cursor-pointer">
                              <div className="font-medium">Reserved Seating</div>
                              <div className="text-sm text-muted-foreground">
                                Specific tables and sections with assigned seating
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* General Admission Configuration */}
            {watchSeatingType === 'general_admission' && (
              <Card>
                <CardHeader>
                  <CardTitle>General Admission Setup</CardTitle>
                  <CardDescription>
                    Configure capacity and pricing for general admission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gaConfig.capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gaConfig.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
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
            {watchSeatingType === 'reserved_seating' && (
              <>
                {/* Tables Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tables Configuration</CardTitle>
                        <CardDescription>
                          Define tables with specific capacity and pricing
                        </CardDescription>
                      </div>
                      <Button type="button" onClick={addTable}>
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
                      <div className="space-y-4">
                        {tableFields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">Table {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTable(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name={`tables.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
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
                                    <FormLabel>Capacity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`tables.${index}.pricingModel`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pricing</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="per_table">Per Table</SelectItem>
                                        <SelectItem value="per_seat">Per Seat</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`tables.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Price ($) {form.watch(`tables.${index}.pricingModel`) === 'per_seat' ? '/seat' : '/table'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="mt-4">
                              <FormField
                                control={form.control}
                                name={`tables.${index}.isBlocked`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel>Block this table (unavailable for sale)</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sections Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Sections Configuration</CardTitle>
                        <CardDescription>
                          Define sections with individual seat pricing
                        </CardDescription>
                      </div>
                      <Button type="button" onClick={addSection}>
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
                      <div className="space-y-4">
                        {sectionFields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">Section {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name={`sections.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Section Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`sections.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="e.g., Front row, VIP area" />
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
                                    <FormLabel>Capacity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
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
                                    <FormLabel>Price per Seat ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="mt-4">
                              <FormField
                                control={form.control}
                                name={`sections.${index}.isBlocked`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel>Block this section (unavailable for sale)</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/organizer/event/${eventId}/ticketing`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ticketing
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/organizer/event/${eventId}/custom-questions`)}
                >
                  Skip to Questions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EventSeatingPage;