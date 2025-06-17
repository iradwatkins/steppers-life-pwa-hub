import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { EventService } from '@/services/eventService';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Save,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';

const organizerSetupSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  websiteUrl: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number'),
  profilePictureUrl: z.string().optional(),
});

type OrganizerSetupData = z.infer<typeof organizerSetupSchema>;

const OrganizerSetupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the original destination from navigation state
  const from = location.state?.from?.pathname || '/events/create';

  const form = useForm<OrganizerSetupData>({
    resolver: zodResolver(organizerSetupSchema),
    defaultValues: {
      organizationName: '',
      description: '',
      websiteUrl: '',
      contactEmail: user?.email || '',
      contactPhone: '',
      profilePictureUrl: '',
    }
  });

  const onSubmit = async (data: OrganizerSetupData) => {
    if (!user?.id) {
      toast.error('You must be logged in to set up an organizer profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      await EventService.createOrganizer(user.id, data);
      
      toast.success('Organizer profile created successfully! You can now create events.');
      // Redirect to the original destination they were trying to access
      navigate(from);
    } catch (error: any) {
      console.error('Error creating organizer profile:', error);
      toast.error(error.message || 'Failed to create organizer profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>You must be logged in to set up an organizer profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Organizer Profile</h1>
          <p className="text-muted-foreground">
            Create your organizer profile to start hosting amazing stepping events
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This information will be displayed to potential attendees and will help build trust with your audience. 
            You can update these details later in your organizer dashboard.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Tell us about your organization or yourself as an event organizer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Chicago Stepping Elite, Sarah's Dance Academy, etc." 
                          {...field} 
                        />
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
                      <FormLabel>About Your Organization *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your organization, experience with stepping events, what makes your events special, etc."
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
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://yourorganization.com" 
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
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How attendees and SteppersLife can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Email *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="contact@yourorganization.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="(312) 555-0123" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profilePictureUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Picture (Optional)
                      </FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          variant="avatar"
                          placeholder="Upload your profile picture to build trust with attendees"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        This will be displayed on your event listings and helps build trust with potential attendees.
                      </p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Next Steps Info */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Your organizer profile will be created instantly</li>
                      <li>• You'll be redirected to the event creation page</li>
                      <li>• Start creating your first stepping event right away</li>
                      <li>• Your profile will be reviewed for verification within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-stepping-gradient"
              >
                {isSubmitting ? (
                  <>Creating Profile...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Organizer Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
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

export default OrganizerSetupPage;