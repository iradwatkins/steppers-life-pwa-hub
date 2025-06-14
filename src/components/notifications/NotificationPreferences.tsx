import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Calendar, Star, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferencesProps {
  preferences: any;
  onPreferenceChange: (field: string, value: boolean | string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  onPreferenceChange,
  onSave,
  isSaving
}) => {
  const [emailFrequency, setEmailFrequency] = useState(preferences.emailFrequency || 'immediate');
  const [unsubscribeAll, setUnsubscribeAll] = useState(false);

  const handleFrequencyChange = (value: string) => {
    setEmailFrequency(value);
    onPreferenceChange('emailFrequency', value);
  };

  const handleUnsubscribeAll = (checked: boolean) => {
    setUnsubscribeAll(checked);
    if (checked) {
      // Disable all email notifications
      Object.keys(preferences).forEach(key => {
        if (key.includes('Email') || key.includes('Notification')) {
          onPreferenceChange(key, false);
        }
      });
      toast.info('Unsubscribed from all email notifications');
    }
  };

  const emailNotifications = [
    {
      key: 'eventReminders',
      title: 'Event Reminders',
      description: 'Get reminded about upcoming events you\'ve registered for',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      key: 'newEventAlerts',
      title: 'New Event Alerts',
      description: 'Be notified when new events match your interests',
      icon: <Star className="h-4 w-4" />
    },
    {
      key: 'marketingEmails',
      title: 'Marketing & Promotions',
      description: 'Receive special offers, discounts, and promotional content',
      icon: <Mail className="h-4 w-4" />
    },
    {
      key: 'weeklyNewsletter',
      title: 'Weekly Newsletter',
      description: 'Get our weekly roundup of events, articles, and community news',
      icon: <Mail className="h-4 w-4" />
    },
    {
      key: 'instructorUpdates',
      title: 'Instructor Updates',
      description: 'Receive updates from your favorite instructors and studios',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      key: 'communityDigest',
      title: 'Community Digest',
      description: 'Monthly digest of community highlights and featured content',
      icon: <MessageSquare className="h-4 w-4" />
    }
  ];

  const pushNotifications = [
    {
      key: 'pushEventReminders',
      title: 'Event Reminders',
      description: 'Push notifications for upcoming events',
      icon: <Bell className="h-4 w-4" />
    },
    {
      key: 'pushLastMinute',
      title: 'Last-Minute Events',
      description: 'Get notified about last-minute event opportunities',
      icon: <Bell className="h-4 w-4" />
    },
    {
      key: 'pushBookingConfirmations',
      title: 'Booking Confirmations',
      description: 'Instant confirmation when you register for events',
      icon: <Bell className="h-4 w-4" />
    }
  ];

  const smsNotifications = [
    {
      key: 'smsEventReminders',
      title: 'Event Reminders',
      description: 'SMS reminders 2 hours before events',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      key: 'smsBookingUpdates',
      title: 'Booking Updates',
      description: 'SMS notifications for booking changes or cancellations',
      icon: <MessageSquare className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage all your notifications at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <VolumeX className="h-5 w-5 text-red-500" />
              <div>
                <Label className="font-medium">Unsubscribe from All</Label>
                <p className="text-sm text-muted-foreground">
                  Turn off all email and SMS notifications
                </p>
              </div>
            </div>
            <Switch
              checked={unsubscribeAll}
              onCheckedChange={handleUnsubscribeAll}
            />
          </div>

          <div className="space-y-2">
            <Label>Email Frequency</Label>
            <Select value={emailFrequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often you want to receive email notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what emails you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailNotifications.map((notification, index) => (
            <div key={notification.key}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.icon}
                  </div>
                  <div className="space-y-1">
                    <Label className="font-medium">{notification.title}</Label>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences[notification.key] || false}
                  onCheckedChange={(checked) => onPreferenceChange(notification.key, checked)}
                  disabled={unsubscribeAll}
                />
              </div>
              {index < emailNotifications.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
            <Badge variant="secondary" className="text-xs">Browser/App</Badge>
          </CardTitle>
          <CardDescription>
            Real-time notifications sent to your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pushNotifications.map((notification, index) => (
            <div key={notification.key}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.icon}
                  </div>
                  <div className="space-y-1">
                    <Label className="font-medium">{notification.title}</Label>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences[notification.key] || false}
                  onCheckedChange={(checked) => onPreferenceChange(notification.key, checked)}
                />
              </div>
              {index < pushNotifications.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
            <Badge variant="secondary" className="text-xs">Text Messages</Badge>
          </CardTitle>
          <CardDescription>
            Text message notifications (standard rates apply)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {smsNotifications.map((notification, index) => (
            <div key={notification.key}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.icon}
                  </div>
                  <div className="space-y-1">
                    <Label className="font-medium">{notification.title}</Label>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences[notification.key] || false}
                  onCheckedChange={(checked) => onPreferenceChange(notification.key, checked)}
                  disabled={unsubscribeAll}
                />
              </div>
              {index < smsNotifications.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <strong>Note:</strong> SMS notifications require a verified phone number. 
            Standard messaging rates from your carrier apply. You can opt out at any time 
            by texting STOP to our number.
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="bg-stepping-gradient"
        >
          {isSaving ? 'Saving...' : 'Save Notification Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;