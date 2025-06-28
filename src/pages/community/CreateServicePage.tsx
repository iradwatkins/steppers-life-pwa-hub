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
  Briefcase, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Upload, 
  X, 
  Plus,
  Save,
  Award,
  Users
} from 'lucide-react';
import type { ServiceCategory, CreateServiceData } from '@/types/community';

const serviceFormSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  category_suggestion: z.string().optional(),
  
  // Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  is_online_only: z.boolean().default(false),
  service_area_notes: z.string().optional(),
  
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
  
  // Service-specific
  service_types: z.string().optional(),
  years_experience: z.string().optional(),
  certifications: z.string().optional(),
  keywords: z.string().optional()
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const CreateServicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategorySuggestion, setShowCategorySuggestion] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      business_name: '',
      description: '',
      category_id: '',
      category_suggestion: '',
      is_online_only: false,
      service_area_notes: '',
      email: '',
      phone: '',
      website: '',
      social_facebook: '',
      social_instagram: '',
      social_twitter: '',
      service_types: '',
      years_experience: '',
      certifications: '',
      keywords: ''
    }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await communityService.getServiceCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a service listing');
      return;
    }

    setLoading(true);
    try {
      // Transform form data to CreateServiceData
      const createData: CreateServiceData = {
        business_name: data.business_name,
        description: data.description,
        category_id: data.category_id,
        category_suggestion: data.category_suggestion,
        
        // Location
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        is_online_only: data.is_online_only,
        service_area_notes: data.service_area_notes,
        
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
        
        // Service-specific
        service_types: data.service_types ? data.service_types.split(',').map(t => t.trim()).filter(t => t) : [],
        years_experience: data.years_experience ? parseInt(data.years_experience) : undefined,
        certifications: data.certifications ? data.certifications.split(',').map(c => c.trim()).filter(c => c) : [],
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
        images: uploadedImages,
        portfolio_images: portfolioImages
      };

      const result = await communityService.createService(createData);
      
      if (result.success) {
        toast.success('Service listing submitted successfully! It will be reviewed before being published.');
        navigate('/community/browse?type=services');
      } else {
        toast.error(result.error || 'Failed to create service listing');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setUploadedImages(prev => [...prev, ...urlArray]);
  };

  const handlePortfolioUpload = (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setPortfolioImages(prev => [...prev, ...urlArray]);
  };

  const removeImage = (index: number, type: 'main' | 'portfolio') => {
    if (type === 'main') {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You must be logged in to create a service listing.
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
            <Briefcase className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold">List Your Service</h1>
              <p className="text-muted-foreground">
                Join the Chicago stepping community directory and connect with people who need your services.
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
                  <Briefcase className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about your business and the services you provide to the stepping community.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Smooth Sounds DJ Services" {...field} />
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
                      <FormLabel>Service Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your services, experience, and what makes you special..."
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
                        <FormLabel>Service Category *</FormLabel>
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
                  name="service_types"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Types</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Wedding DJ, Event Planning, Private Lessons (comma-separated)"
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
                    name="years_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Licensed DJ, Event Planning Certification" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., stepping music, wedding DJ, photography (comma-separated)"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location & Service Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Service Area
                </CardTitle>
                <CardDescription>
                  Where are you located and where do you provide services?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="is_online_only"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Online Services Only</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Check this if you only provide services online/remotely
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
                          <FormLabel>Business Address</FormLabel>
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

                <FormField
                  control={form.control}
                  name="service_area_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Area Notes</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Serving Chicago and surrounding suburbs, Travel available within 50 miles"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  How can potential clients reach you? Email and phone are encouraged for better visibility.
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
                          <Input type="email" placeholder="business@example.com" {...field} />
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
                        <Input placeholder="https://www.yourbusiness.com" {...field} />
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
                          <Input placeholder="facebook.com/yourbusiness" {...field} />
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
                          <Input placeholder="instagram.com/yourbusiness" {...field} />
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
                          <Input placeholder="twitter.com/yourbusiness" {...field} />
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
                  Availability (Optional)
                </CardTitle>
                <CardDescription>
                  When are you typically available for services or consultations?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name={day as keyof ServiceFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{day}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 9am-6pm or By appointment" {...field} />
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
                      <FormLabel>Availability Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Available 24/7 by appointment, Weekend events only" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images and Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Business Images (Optional)
                </CardTitle>
                <CardDescription>
                  Upload photos of your business, team, or equipment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  value={uploadedImages}
                  onChange={handleImageUpload}
                  multiple
                  maxFiles={5}
                  variant="gallery"
                  useBMADMethod={true}
                  bMADImageType="community"
                  placeholder="Upload business photos to showcase your services"
                />
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Business image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index, 'main')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Portfolio Images (Optional)
                </CardTitle>
                <CardDescription>
                  Showcase your work with photos from past events, projects, or services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  value={portfolioImages}
                  onChange={handlePortfolioUpload}
                  multiple
                  maxFiles={10}
                  variant="gallery"
                  useBMADMethod={true}
                  bMADImageType="community"
                  placeholder="Upload portfolio images showcasing your work"
                />
                
                {portfolioImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Portfolio image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index, 'portfolio')}
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
                    Submit Service Listing
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
                Your service listing will be reviewed by our team before being published. 
                This typically takes 1-2 business days. You'll receive an email notification 
                once your listing is approved and live on the site. High-quality services 
                may be eligible for verification badges after successful client interactions.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateServicePage;