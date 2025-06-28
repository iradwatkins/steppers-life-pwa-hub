import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { communityService } from '@/services/communityService';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Store as StoreIcon, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Upload, 
  X, 
  Plus,
  Save,
  Eye
} from 'lucide-react';
import type { StoreCategory, CreateStoreData } from '@/types/community';

const storeFormSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  category_suggestion: z.string().optional(),
  
  // Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  is_online_only: z.boolean().default(false),
  
  // Contact
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  social_facebook: z.string().optional(),
  social_instagram: z.string().optional(),
  social_twitter: z.string().optional(),
  
  // Hours
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
  hours_notes: z.string().optional(),
  
  // Keywords
  keywords: z.string().optional()
});

type StoreFormData = z.infer<typeof storeFormSchema>;

const CreateStorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategorySuggestion, setShowCategorySuggestion] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      category_suggestion: '',
      is_online_only: false,
      email: '',
      phone: '',
      website: '',
      social_facebook: '',
      social_instagram: '',
      social_twitter: '',
      keywords: ''
    }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await communityService.getStoreCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const onSubmit = async (data: StoreFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a store listing');
      return;
    }

    setLoading(true);
    try {
      // Transform form data to CreateStoreData
      const createData: CreateStoreData = {
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        category_suggestion: data.category_suggestion,
        
        // Location
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        is_online_only: data.is_online_only,
        
        // Contact
        email: data.email,
        phone: data.phone,
        website: data.website,
        social_facebook: data.social_facebook,
        social_instagram: data.social_instagram,
        social_twitter: data.social_twitter,
        
        // Hours
        operating_hours: {
          monday: data.monday,
          tuesday: data.tuesday,
          wednesday: data.wednesday,
          thursday: data.thursday,
          friday: data.friday,
          saturday: data.saturday,
          sunday: data.sunday,
          notes: data.hours_notes
        },
        
        // Keywords and images
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
        images: uploadedImages
      };

      const result = await communityService.createStore(createData);
      
      if (result.success) {
        toast.success('Store listing submitted successfully! It will be reviewed before being published.');
        navigate('/community/browse?type=stores');
      } else {
        toast.error(result.error || 'Failed to create store listing');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setUploadedImages(prev => [...prev, ...urlArray]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You must be logged in to create a store listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/community/home')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <StoreIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">List Your Store</h1>
              <p className="text-muted-foreground">
                Join the Chicago stepping community directory and connect with potential customers.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about your store and what you offer to the stepping community.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Stepping Elegance Boutique" {...field} />
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
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your store, what you sell, and what makes you special..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setShowCategorySuggestion(value === 'suggest');
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                            <Separator />
                            <SelectItem value="suggest">
                              <Plus className="h-4 w-4 mr-2 inline" />
                              Suggest New Category
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showCategorySuggestion && (
                    <FormField
                      control={form.control}
                      name="category_suggestion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggested Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your category suggestion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., stepping shoes, dresses, accessories (comma-separated)"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Help customers find you or let them know if you're online only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="is_online_only"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Online Only Store</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Check this if you only sell online without a physical location
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

                {!form.watch('is_online_only') && (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How can customers reach you? Email and phone are encouraged for better visibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="store@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(312) 555-0123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.yourstore.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="social_facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="facebook.com/yourstore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="instagram.com/yourstore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="twitter.com/yourstore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours (Optional)
                </CardTitle>
                <CardDescription>
                  Let customers know when they can visit or contact you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name={day as keyof StoreFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{day}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 9am-6pm or Closed" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="hours_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., By appointment only, Call ahead" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Store Images (Optional)
                </CardTitle>
                <CardDescription>
                  Upload photos of your store, products, or storefront to attract customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  value={uploadedImages}
                  onChange={handleImageUpload}
                  multiple
                  maxFiles={5}
                  variant="gallery"
                  placeholder="Upload store photos to showcase your business"
                />
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Store image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-stepping-gradient"
                disabled={loading}
              >
                {loading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Store Listing
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/community/home')}
              >
                Cancel
              </Button>
            </div>

            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
              <p className="font-medium mb-2">Review Process:</p>
              <p>
                Your store listing will be reviewed by our team before being published. 
                This typically takes 1-2 business days. You'll receive an email notification 
                once your listing is approved and live on the site.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateStorePage;