import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Heart, Shield, Bell, Download, Ticket, Calendar, Clock, QrCode, Share, ExternalLink } from 'lucide-react';
import ChangePasswordDialog from '@/components/security/ChangePasswordDialog';
import DeleteAccountDialog from '@/components/security/DeleteAccountDialog';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePictureUrl: ''
  });

  const [preferences, setPreferences] = useState({
    // Email Notifications
    emailNotifications: true,
    eventReminders: true,
    newEventAlerts: true,
    marketingEmails: true,
    weeklyNewsletter: false,
    instructorUpdates: true,
    communityDigest: false,
    emailFrequency: 'immediate',
    
    // Push Notifications  
    pushEventReminders: true,
    pushLastMinute: false,
    pushBookingConfirmations: true,
    
    // SMS Notifications
    smsNotifications: false,
    smsEventReminders: false,
    smsBookingUpdates: false
  });

  const [eventInterests, setEventInterests] = useState({
    beginnerClasses: false,
    intermediateClasses: false,
    advancedClasses: false,
    competitions: false,
    socialDances: false,
    workshops: false,
    privateEvents: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    showLocation: false
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      // Load user data from user metadata
      setProfileData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        city: user.user_metadata?.city || '',
        state: user.user_metadata?.state || '',
        zipCode: user.user_metadata?.zip_code || '',
        profilePictureUrl: user.user_metadata?.profile_picture_url || ''
      });

      // Load profile picture from profiles table if not in metadata
      loadProfilePicture();
    }
  }, [user, loading, navigate]);

  const loadProfilePicture = async () => {
    if (!user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile not found in profiles table, will be created on first update');
        return;
      }

      if (profile?.profile_picture_url) {
        setProfileData(prev => ({ 
          ...prev, 
          profilePictureUrl: profile.profile_picture_url 
        }));
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestChange = (field: string, value: boolean) => {
    setEventInterests(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user profile via Supabase
      const userData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        full_name: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zipCode,
        // Include preferences in user metadata
        event_interests: eventInterests,
        notification_preferences: preferences,
        privacy_settings: privacySettings,
      };
      
      await updateProfile(userData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpdate = (imageUrl: string | null) => {
    setProfileData(prev => ({ ...prev, profilePictureUrl: imageUrl || '' }));
    console.log('✅ Profile image updated:', imageUrl);
  };

  // Mock ticket data
  const mockTickets = [
    {
      id: 'TKT001',
      orderNumber: 'SL12345678',
      eventTitle: 'Chicago Stepping Championship',
      eventDate: '2024-12-15',
      eventTime: '7:00 PM',
      venue: 'Navy Pier Grand Ballroom',
      ticketType: 'VIP Experience',
      seatInfo: 'Section A, Table 5',
      price: 85,
      qrCode: 'QR_CODE_DATA_001',
      status: 'upcoming',
      purchaseDate: '2024-11-20',
      attendeeName: `${profileData.firstName} ${profileData.lastName}`,
      specialRequests: 'Vegetarian meal'
    },
    {
      id: 'TKT002',
      orderNumber: 'SL12345679',
      eventTitle: 'New Year\'s Eve Stepping Gala',
      eventDate: '2024-12-31',
      eventTime: '8:00 PM',
      venue: 'Palmer House Hilton',
      ticketType: 'General Admission',
      seatInfo: 'Floor Seating',
      price: 85,
      qrCode: 'QR_CODE_DATA_002',
      status: 'upcoming',
      purchaseDate: '2024-11-22',
      attendeeName: `${profileData.firstName} ${profileData.lastName}`,
      specialRequests: ''
    },
    {
      id: 'TKT003',
      orderNumber: 'SL12345677',
      eventTitle: 'Halloween Stepping Social',
      eventDate: '2024-10-31',
      eventTime: '7:30 PM',
      venue: 'South Side Cultural Center',
      ticketType: 'General Admission',
      seatInfo: 'General Admission',
      price: 35,
      qrCode: 'QR_CODE_DATA_003',
      status: 'past',
      purchaseDate: '2024-10-15',
      attendeeName: `${profileData.firstName} ${profileData.lastName}`,
      specialRequests: ''
    }
  ];

  const upcomingTickets = mockTickets.filter(ticket => ticket.status === 'upcoming');
  const pastTickets = mockTickets.filter(ticket => ticket.status === 'past');

  const handleShareTicket = (ticket: any) => {
    if (navigator.share) {
      navigator.share({
        title: `My ticket for ${ticket.eventTitle}`,
        text: `I'll be attending ${ticket.eventTitle} on ${ticket.eventDate}`,
        url: window.location.origin
      });
    } else {
      toast.success('Ticket details copied to clipboard!');
    }
  };

  const handleViewQR = (ticket: any) => {
    toast.info('QR Code viewer would open here (Demo mode)');
  };

  const handleExportData = () => {
    // In a real implementation, this would trigger a data export
    toast.info('Data export feature coming soon. Please contact support for data export requests.');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stepping-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings, preferences, and tickets</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Settings
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              My Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                  className={!isEditing ? "bg-stepping-gradient" : ""}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled={true}
                    />
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={profileData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-stepping-gradient"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Event Interests
                </CardTitle>
                <CardDescription>
                  Select your interests to receive personalized event recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(eventInterests).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => handleInterestChange(key, checked)}
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture Upload */}
            <ProfileImageUpload
              currentImageUrl={profileData.profilePictureUrl}
              userId={user?.id || ''}
              onImageUpdate={handleProfileImageUpdate}
              disabled={isEditing}
            />
            
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage how you receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed rounded-lg">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Comprehensive Notification Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage all your email, SMS, and push notification preferences in one place
                  </p>
                  <Button asChild className="bg-stepping-gradient">
                    <Link to="/notifications">
                      Manage Notifications
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy
                </CardTitle>
                <CardDescription>
                  Control what others can see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(privacySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handlePrivacyChange(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowChangePassword(true)}
                >
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download My Data
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setShowDeleteAccount(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-0">
            <div className="space-y-6">
              {/* Upcoming Tickets */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                {upcomingTickets.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Upcoming Tickets</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any upcoming event tickets.
                      </p>
                      <Button asChild>
                        <Link to="/events">Browse Events</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingTickets.map((ticket) => (
                      <Card key={ticket.id} className="overflow-hidden">
                        <CardHeader className="bg-stepping-gradient text-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{ticket.eventTitle}</CardTitle>
                              <CardDescription className="text-white/80">
                                {ticket.ticketType}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              #{ticket.id}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Event Details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(ticket.eventDate).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{ticket.eventTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{ticket.venue}</span>
                              </div>
                            </div>

                            <Separator />

                            {/* Ticket Info */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Seat/Table:</span>
                                <span className="font-medium">{ticket.seatInfo}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Attendee:</span>
                                <span className="font-medium">{ticket.attendeeName}</span>
                              </div>
                              {ticket.specialRequests && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Special Requests:</span>
                                  <span className="font-medium">{ticket.specialRequests}</span>
                                </div>
                              )}
                            </div>

                            <Separator />

                            {/* QR Code Section */}
                            <div className="text-center py-4">
                              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                                <QrCode className="h-12 w-12 text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Show this QR code at the event entrance
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleViewQR(ticket)}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                View QR
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleShareTicket(ticket)}
                              >
                                <Share className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Tickets */}
              {pastTickets.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastTickets.map((ticket) => (
                      <Card key={ticket.id} className="opacity-75">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{ticket.eventTitle}</CardTitle>
                              <CardDescription>{ticket.ticketType}</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Past
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(ticket.eventDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{ticket.venue}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-3"
                            onClick={() => toast.info('Receipt download would start here')}
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Receipt
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Dialogs */}
        <ChangePasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
        />
        
        <DeleteAccountDialog
          open={showDeleteAccount}
          onOpenChange={setShowDeleteAccount}
        />
      </div>
    </div>
  );
};

export default Profile;