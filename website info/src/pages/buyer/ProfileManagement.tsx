import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Heart,
  Bell,
  Shield,
  Save,
  Upload,
  X
} from 'lucide-react';
import { useBuyerAccount } from '@/hooks/useBuyerAccount';
import { toast } from '@/components/ui/sonner';

const ProfileManagement = () => {
  const {
    loading,
    profile,
    preferences,
    updateProfile,
    uploadProfilePicture,
    updatePreferences
  } = useBuyerAccount();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    address: {
      street: profile?.address?.street || '',
      city: profile?.address?.city || '',
      state: profile?.address?.state || '',
      zip_code: profile?.address?.zip_code || '',
      country: profile?.address?.country || 'US'
    }
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    dance_styles: preferences?.dance_styles || [],
    skill_levels: preferences?.skill_levels || [],
    event_types: preferences?.event_types || [],
    preferred_locations: preferences?.preferred_locations || [],
    price_range: {
      min: preferences?.price_range?.min || 0,
      max: preferences?.price_range?.max || 100
    },
    notification_settings: {
      email_recommendations: preferences?.notification_settings?.email_recommendations || true,
      sms_reminders: preferences?.notification_settings?.sms_reminders || false,
      push_notifications: preferences?.notification_settings?.push_notifications || true,
      marketing_emails: preferences?.notification_settings?.marketing_emails || false
    }
  });

  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zip_code: profile.address?.zip_code || '',
          country: profile.address?.country || 'US'
        }
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (preferences) {
      setPreferencesForm({
        dance_styles: preferences.dance_styles || [],
        skill_levels: preferences.skill_levels || [],
        event_types: preferences.event_types || [],
        preferred_locations: preferences.preferred_locations || [],
        price_range: {
          min: preferences.price_range?.min || 0,
          max: preferences.price_range?.max || 100
        },
        notification_settings: {
          email_recommendations: preferences.notification_settings?.email_recommendations || true,
          sms_reminders: preferences.notification_settings?.sms_reminders || false,
          push_notifications: preferences.notification_settings?.push_notifications || true,
          marketing_emails: preferences.notification_settings?.marketing_emails || false
        }
      });
    }
  }, [preferences]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    await uploadProfilePicture(file);
    setUploadingImage(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileForm);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences(preferencesForm);
  };

  const addToArray = (array: string[], value: string) => {
    if (value && !array.includes(value)) {
      return [...array, value];
    }
    return array;
  };

  const removeFromArray = (array: string[], value: string) => {
    return array.filter(item => item !== value);
  };

  const danceStyles = [
    'Chicago Footwork', 'JukeBoxing', 'Line Dancing', 'Hip Hop', 
    'Contemporary', 'Jazz', 'Ballet', 'Ballroom', 'Latin', 'Swing'
  ];

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const eventTypes = ['Workshop', 'Battle', 'Social', 'Competition', 'Class', 'Performance'];
  const locations = ['Chicago', 'Atlanta', 'Detroit', 'Houston', 'Dallas', 'Memphis'];

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background-main py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Profile Management</h1>
          <p className="text-text-secondary">Update your personal information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.profile_picture_url} />
                    <AvatarFallback className="bg-brand-primary text-text-on-primary text-xl">
                      {profileForm.first_name?.charAt(0)}{profileForm.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-text-secondary">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profileForm.date_of_birth}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Address</h3>
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={profileForm.address.street}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileForm.address.city}
                          onChange={(e) => setProfileForm(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          placeholder="Chicago"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileForm.address.state}
                          onChange={(e) => setProfileForm(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, state: e.target.value }
                          }))}
                          placeholder="IL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          value={profileForm.address.zip_code}
                          onChange={(e) => setProfileForm(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, zip_code: e.target.value }
                          }))}
                          placeholder="60601"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="flex items-center gap-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              {/* Dance Styles */}
              <Card className="bg-surface-card border-border-default">
                <CardHeader>
                  <CardTitle>Dance Styles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {preferencesForm.dance_styles.map((style) => (
                        <Badge
                          key={style}
                          variant="default"
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => setPreferencesForm(prev => ({
                            ...prev,
                            dance_styles: removeFromArray(prev.dance_styles, style)
                          }))}
                        >
                          {style}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      value=""
                      onValueChange={(value) => setPreferencesForm(prev => ({
                        ...prev,
                        dance_styles: addToArray(prev.dance_styles, value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add dance style" />
                      </SelectTrigger>
                      <SelectContent>
                        {danceStyles.filter(style => !preferencesForm.dance_styles.includes(style)).map((style) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Levels */}
              <Card className="bg-surface-card border-border-default">
                <CardHeader>
                  <CardTitle>Skill Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {preferencesForm.skill_levels.map((level) => (
                        <Badge
                          key={level}
                          variant="default"
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => setPreferencesForm(prev => ({
                            ...prev,
                            skill_levels: removeFromArray(prev.skill_levels, level)
                          }))}
                        >
                          {level}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      value=""
                      onValueChange={(value) => setPreferencesForm(prev => ({
                        ...prev,
                        skill_levels: addToArray(prev.skill_levels, value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.filter(level => !preferencesForm.skill_levels.includes(level)).map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Event Types */}
              <Card className="bg-surface-card border-border-default">
                <CardHeader>
                  <CardTitle>Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {preferencesForm.event_types.map((type) => (
                        <Badge
                          key={type}
                          variant="default"
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => setPreferencesForm(prev => ({
                            ...prev,
                            event_types: removeFromArray(prev.event_types, type)
                          }))}
                        >
                          {type}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      value=""
                      onValueChange={(value) => setPreferencesForm(prev => ({
                        ...prev,
                        event_types: addToArray(prev.event_types, value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.filter(type => !preferencesForm.event_types.includes(type)).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card className="bg-surface-card border-border-default">
                <CardHeader>
                  <CardTitle>Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="px-3">
                      <Slider
                        value={[preferencesForm.price_range.min, preferencesForm.price_range.max]}
                        onValueChange={([min, max]) => setPreferencesForm(prev => ({
                          ...prev,
                          price_range: { min, max }
                        }))}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>${preferencesForm.price_range.min}</span>
                      <span>${preferencesForm.price_range.max}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="bg-surface-card border-border-default">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_recommendations">Email Recommendations</Label>
                        <p className="text-sm text-text-secondary">Receive event recommendations via email</p>
                      </div>
                      <Switch
                        id="email_recommendations"
                        checked={preferencesForm.notification_settings.email_recommendations}
                        onCheckedChange={(checked) => setPreferencesForm(prev => ({
                          ...prev,
                          notification_settings: { ...prev.notification_settings, email_recommendations: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms_reminders">SMS Reminders</Label>
                        <p className="text-sm text-text-secondary">Get text message reminders for events</p>
                      </div>
                      <Switch
                        id="sms_reminders"
                        checked={preferencesForm.notification_settings.sms_reminders}
                        onCheckedChange={(checked) => setPreferencesForm(prev => ({
                          ...prev,
                          notification_settings: { ...prev.notification_settings, sms_reminders: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push_notifications">Push Notifications</Label>
                        <p className="text-sm text-text-secondary">Browser push notifications for updates</p>
                      </div>
                      <Switch
                        id="push_notifications"
                        checked={preferencesForm.notification_settings.push_notifications}
                        onCheckedChange={(checked) => setPreferencesForm(prev => ({
                          ...prev,
                          notification_settings: { ...prev.notification_settings, push_notifications: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing_emails">Marketing Emails</Label>
                        <p className="text-sm text-text-secondary">Promotional emails and special offers</p>
                      </div>
                      <Switch
                        id="marketing_emails"
                        checked={preferencesForm.notification_settings.marketing_emails}
                        onCheckedChange={(checked) => setPreferencesForm(prev => ({
                          ...prev,
                          notification_settings: { ...prev.notification_settings, marketing_emails: checked }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="flex items-center gap-2" disabled={loading}>
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileManagement; 