import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, Calendar, FileText, FolderPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventCollections } from '@/hooks/useEventCollections';
import { toast } from 'sonner';

// Schema for collection creation
const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  isPublic: z.boolean().default(true),
  brandingColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

// Schema for event series creation
const seriesSchema = z.object({
  name: z.string().min(1, 'Series name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  templateEventId: z.string().min(1, 'Template event is required'),
  recurrenceType: z.enum(['weekly', 'monthly', 'custom']),
  interval: z.number().min(1, 'Interval must be at least 1').max(12, 'Interval too large'),
  endDate: z.date().optional(),
  daysOfWeek: z.array(z.number()).optional(),
});

// Schema for template creation
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  sourceEventId: z.string().min(1, 'Source event is required'),
  isPublic: z.boolean().default(false),
});

type CollectionFormData = z.infer<typeof collectionSchema>;
type SeriesFormData = z.infer<typeof seriesSchema>;
type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId: string;
  currentTab: string;
}

const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({
  open,
  onOpenChange,
  organizerId,
  currentTab,
}) => {
  const {
    createCollection,
    createEventSeries,
    createEventTemplate,
    eventTemplates,
  } = useEventCollections(organizerId);

  const [activeTab, setActiveTab] = useState(currentTab);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['dance', 'beginner']);

  // Form for collections
  const collectionForm = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: ['dance', 'beginner'],
      isPublic: true,
      brandingColor: '#FF6B35',
    },
  });

  // Form for event series
  const seriesForm = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      name: '',
      description: '',
      templateEventId: '',
      recurrenceType: 'weekly',
      interval: 1,
      daysOfWeek: [5], // Friday
    },
  });

  // Form for templates
  const templateForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      sourceEventId: '',
      isPublic: false,
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      collectionForm.setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    collectionForm.setValue('tags', newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmitCollection = async (data: CollectionFormData) => {
    try {
      await createCollection({
        name: data.name,
        description: data.description,
        tags: data.tags,
        organizerId,
        eventIds: [],
        isPublic: data.isPublic,
        branding: {
          color: data.brandingColor,
        },
      });
      toast.success('Collection created successfully');
      onOpenChange(false);
      collectionForm.reset();
      setTags(['dance', 'beginner']);
    } catch (error) {
      toast.error('Failed to create collection');
    }
  };

  const onSubmitSeries = async (data: SeriesFormData) => {
    try {
      await createEventSeries({
        name: data.name,
        description: data.description,
        templateEventId: data.templateEventId,
        organizerId,
        recurrencePattern: {
          type: data.recurrenceType,
          interval: data.interval,
          endDate: data.endDate,
          daysOfWeek: data.daysOfWeek,
        },
      });
      toast.success('Event series created successfully');
      onOpenChange(false);
      seriesForm.reset();
    } catch (error) {
      toast.error('Failed to create event series');
    }
  };

  const onSubmitTemplate = async (data: TemplateFormData) => {
    try {
      await createEventTemplate({
        name: data.name,
        description: data.description,
        sourceEventId: data.sourceEventId,
        organizerId,
        isPublic: data.isPublic,
        templateData: {
          // In a real implementation, you'd extract template data from the source event
          title: data.name,
          description: data.description,
        },
      });
      toast.success('Event template created successfully');
      onOpenChange(false);
      templateForm.reset();
    } catch (error) {
      toast.error('Failed to create event template');
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'collections':
        return 'Create New Collection';
      case 'series':
        return 'Create Event Series';
      case 'templates':
        return 'Create Event Template';
      default:
        return 'Create New Item';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'collections':
        return 'Organize your events into collections for better promotion and management';
      case 'series':
        return 'Create recurring events based on a template with automated scheduling';
      case 'templates':
        return 'Save event configurations as templates for quick event creation';
      default:
        return 'Choose what you want to create';
    }
  };

  const mockEvents = [
    { id: '1', title: 'Weekly Salsa Night' },
    { id: '2', title: 'Bachata Basics Workshop' },
    { id: '3', title: 'Latin Dance Showcase' },
    { id: '4', title: 'Beginner Salsa Class' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeTab === 'collections' && <FolderPlus className="h-5 w-5" />}
            {activeTab === 'series' && <Calendar className="h-5 w-5" />}
            {activeTab === 'templates' && <FileText className="h-5 w-5" />}
            {getTabTitle()}
          </DialogTitle>
          <DialogDescription>
            {getTabDescription()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collections">Collection</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="templates">Template</TabsTrigger>
          </TabsList>

          {/* Collection Creation Tab */}
          <TabsContent value="collections">
            <Form {...collectionForm}>
              <form onSubmit={collectionForm.handleSubmit(onSubmitCollection)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={collectionForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Summer Dance Series" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={collectionForm.control}
                    name="brandingColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              className="w-16 h-10 rounded-md border"
                              {...field}
                            />
                            <Input
                              placeholder="#FF6B35"
                              className="flex-1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={collectionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this collection is about..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={collectionForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a tag..."
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={handleKeyPress}
                            />
                            <Button type="button" onClick={handleAddTag} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => handleRemoveTag(tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add tags to help categorize and find your collection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={collectionForm.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Public Collection</FormLabel>
                        <FormDescription>
                          Allow others to discover and view this collection
                        </FormDescription>
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={collectionForm.formState.isSubmitting}>
                    Create Collection
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Event Series Creation Tab */}
          <TabsContent value="series">
            <Form {...seriesForm}>
              <form onSubmit={seriesForm.handleSubmit(onSubmitSeries)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={seriesForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Weekly Salsa Night" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={seriesForm.control}
                    name="templateEventId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Event</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose template event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
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
                  control={seriesForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this event series..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={seriesForm.control}
                    name="recurrenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={seriesForm.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interval</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Every X weeks/months</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={seriesForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={seriesForm.formState.isSubmitting}>
                    Create Series
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Template Creation Tab */}
          <TabsContent value="templates">
            <Form {...templateForm}>
              <form onSubmit={templateForm.handleSubmit(onSubmitTemplate)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={templateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Salsa Night Template" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={templateForm.control}
                    name="sourceEventId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Event</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose source event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
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
                  control={templateForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this template is for..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={templateForm.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Public Template</FormLabel>
                        <FormDescription>
                          Allow other organizers to use this template
                        </FormDescription>
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={templateForm.formState.isSubmitting}>
                    Create Template
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionDialog; 