import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  Settings,
  Save,
  CheckCircle
} from 'lucide-react';
import { NotificationPreferences } from '@/services/notificationService';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationPreferencesComponentProps {
  className?: string;
}

const NotificationPreferencesComponent: React.FC<NotificationPreferencesComponentProps> = ({ 
  className = '' 
}) => {
  const { preferences, updatePreferences, loading } = useNotifications();
  const { toast } = useToast();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    if (preferences && localPreferences) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(localPreferences);
      setHasChanges(changed);
    }
  }, [preferences, localPreferences]);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      [key]: value
    });
  };

  const handleReminderChange = (key: keyof NotificationPreferences['reminders'], value: boolean) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      reminders: {
        ...localPreferences.reminders,
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    setSaving(true);
    try {
      await updatePreferences(localPreferences);
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated successfully."
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasChanges(false);
    }
  };

  if (loading || !localPreferences) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  <div className="w-48 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Customize how and when you receive notifications about your events.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Delivery Channels */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Delivery Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <Label htmlFor="email" className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-text-secondary">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                id="email"
                checked={localPreferences.email}
                onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <Label htmlFor="sms" className="font-medium">SMS Notifications</Label>
                  <p className="text-sm text-text-secondary">Receive text message notifications</p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={localPreferences.sms}
                onCheckedChange={(checked) => handlePreferenceChange('sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-500" />
                <div>
                  <Label htmlFor="push" className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-text-secondary">Browser and mobile app notifications</p>
                </div>
              </div>
              <Switch
                id="push"
                checked={localPreferences.push}
                onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Event Reminders */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Event Reminders
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="seven-days" className="font-medium">7 Days Before</Label>
                <p className="text-sm text-text-secondary">Get reminded one week before your event</p>
              </div>
              <Switch
                id="seven-days"
                checked={localPreferences.reminders.sevenDays}
                onCheckedChange={(checked) => handleReminderChange('sevenDays', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="one-day" className="font-medium">1 Day Before</Label>
                <p className="text-sm text-text-secondary">Get reminded the day before your event</p>
              </div>
              <Switch
                id="one-day"
                checked={localPreferences.reminders.oneDay}
                onCheckedChange={(checked) => handleReminderChange('oneDay', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-hours" className="font-medium">2 Hours Before</Label>
                <p className="text-sm text-text-secondary">Get reminded 2 hours before your event starts</p>
              </div>
              <Switch
                id="two-hours"
                checked={localPreferences.reminders.twoHours}
                onCheckedChange={(checked) => handleReminderChange('twoHours', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Other Notifications */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Other Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <Label htmlFor="updates" className="font-medium">Event Updates</Label>
                  <p className="text-sm text-text-secondary">Changes to event time, venue, or details</p>
                </div>
              </div>
              <Switch
                id="updates"
                checked={localPreferences.eventUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('eventUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <div>
                  <Label htmlFor="announcements" className="font-medium">Organizer Announcements</Label>
                  <p className="text-sm text-text-secondary">Messages from event organizers</p>
                </div>
              </div>
              <Switch
                id="announcements"
                checked={localPreferences.organizerAnnouncements}
                onCheckedChange={(checked) => handlePreferenceChange('organizerAnnouncements', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing" className="font-medium">Marketing & Promotions</Label>
                <p className="text-sm text-text-secondary">Special offers and new event announcements</p>
              </div>
              <Switch
                id="marketing"
                checked={localPreferences.marketing}
                onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <>
            <Separator />
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-300">
                  You have unsaved changes
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReset}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="bg-surface-contrast p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-feedback-success mt-0.5" />
            <div>
              <h4 className="font-medium text-text-primary mb-1">Smart Notifications</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                We respect your preferences and will only send notifications based on your settings. 
                You can always unsubscribe from specific types of notifications or update your preferences anytime.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesComponent; 