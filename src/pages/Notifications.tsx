import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bell, ArrowLeft } from 'lucide-react';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

const Notifications = () => {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      // Load notification preferences from user metadata
      const userPrefs = user.user_metadata?.notification_preferences;
      if (userPrefs) {
        setPreferences(prev => ({ ...prev, ...userPrefs }));
      }
    }
  }, [user, loading, navigate]);

  const handlePreferenceChange = (field: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update notification preferences via Supabase
      const userData = {
        notification_preferences: preferences,
      };
      
      await updateProfile(userData);
      toast.success('Notification preferences updated successfully!');
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = () => {
    // Create unsubscribe link functionality
    const unsubscribeUrl = `${window.location.origin}/unsubscribe?token=${user?.id}`;
    navigator.clipboard.writeText(unsubscribeUrl);
    toast.success('Unsubscribe link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stepping-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Notification Preferences</h1>
              <p className="text-muted-foreground">
                Manage how and when you receive notifications from SteppersLife
              </p>
            </div>
          </div>
        </div>

        {/* Overview Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Overview
            </CardTitle>
            <CardDescription>
              Stay connected with the stepping community while controlling your notification experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-stepping-purple">
                  {Object.values(preferences).filter(Boolean).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Notifications</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-stepping-purple">
                  {preferences.emailFrequency}
                </div>
                <div className="text-sm text-muted-foreground">Email Frequency</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-stepping-purple">
                  {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                </div>
                <div className="text-sm text-muted-foreground">Email Status</div>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleUnsubscribeAll}>
                Copy Unsubscribe Link
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Back to Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Component */}
        <NotificationPreferences
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* Legal Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Legal & Privacy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong>GDPR Compliance:</strong> You have the right to access, update, or delete your notification preferences at any time. Your data is processed according to our Privacy Policy.
            </div>
            <div>
              <strong>CAN-SPAM Compliance:</strong> All marketing emails include an unsubscribe link. You can opt out of specific types of emails while keeping essential notifications.
            </div>
            <div>
              <strong>SMS Terms:</strong> Standard messaging rates apply. You can opt out by texting STOP to our number. We'll send up to 4 messages per month unless you have events that require more frequent updates.
            </div>
            <div className="pt-2">
              <Button variant="link" className="p-0 h-auto text-stepping-purple">
                View Full Privacy Policy
              </Button>
              {' • '}
              <Button variant="link" className="p-0 h-auto text-stepping-purple">
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;