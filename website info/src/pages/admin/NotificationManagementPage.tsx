import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  Send, 
  Users, 
  Calendar, 
  AlertCircle, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Mail,
  Smartphone,
  Settings
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notificationService } from '@/services/notificationService';

const NotificationManagementPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    eventId: '',
    title: '',
    message: '',
    channels: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Event update form state
  const [updateForm, setUpdateForm] = useState({
    eventId: '',
    updateType: 'general' as 'time' | 'venue' | 'general' | 'cancellation',
    message: ''
  });

  // Mock statistics
  const stats = {
    totalNotifications: 1247,
    sentToday: 89,
    unreadCount: 324,
    pendingScheduled: 156,
    deliveryRate: 98.5,
    channelStats: {
      email: { sent: 1156, delivered: 1142, opened: 857 },
      sms: { sent: 234, delivered: 230, opened: 189 },
      push: { sent: 567, delivered: 542, opened: 398 }
    }
  };

  // Mock events for dropdowns
  const events = [
    { id: '1', title: 'Chicago Step Championship', date: '2024-07-15' },
    { id: '2', title: 'Beginner Step Workshop', date: '2024-07-20' },
    { id: '3', title: 'Saturday Step Social', date: '2024-07-22' }
  ];

  const handleSendAnnouncement = async () => {
    if (!announcementForm.eventId || !announcementForm.title || !announcementForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would call the notification service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast({
        title: "Announcement Sent",
        description: `Announcement has been sent to all attendees of the selected event.`
      });

      // Reset form
      setAnnouncementForm({
        eventId: '',
        title: '',
        message: '',
        channels: [],
        priority: 'medium'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEventUpdate = async () => {
    if (!updateForm.eventId || !updateForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedEvent = events.find(e => e.id === updateForm.eventId);
      if (selectedEvent) {
        await notificationService.sendEventUpdate(
          updateForm.eventId,
          updateForm.message,
          updateForm.updateType,
          selectedEvent.title
        );
      }
      
      toast({
        title: "Event Update Sent",
        description: `Update has been sent to all attendees.`
      });

      // Reset form
      setUpdateForm({
        eventId: '',
        updateType: 'general',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send event update",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setAnnouncementForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Notification Management</h1>
        <p className="text-text-secondary">
          Manage event notifications, send announcements, and view delivery statistics.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="announcements">Send Announcement</TabsTrigger>
          <TabsTrigger value="updates">Event Updates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Total Notifications</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalNotifications.toLocaleString()}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Sent Today</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.sentToday}</p>
                  </div>
                  <Send className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Pending/Scheduled</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.pendingScheduled}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Delivery Rate</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.deliveryRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(stats.channelStats).map(([channel, data]) => {
                  const deliveryRate = ((data.delivered / data.sent) * 100).toFixed(1);
                  const openRate = ((data.opened / data.delivered) * 100).toFixed(1);
                  
                  return (
                    <div key={channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {channel === 'email' && <Mail className="w-5 h-5" />}
                          {channel === 'sms' && <Smartphone className="w-5 h-5" />}
                          {channel === 'push' && <Bell className="w-5 h-5" />}
                          <span className="font-medium capitalize">{channel}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-text-secondary">
                          <span>Sent: {data.sent}</span>
                          <span>Delivered: {deliveryRate}%</span>
                          <span>Opened: {openRate}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${deliveryRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Announcement Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Send Event Announcement
              </CardTitle>
              <p className="text-sm text-text-secondary">
                Send a custom announcement to all attendees of a specific event.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-select">Select Event</Label>
                  <Select value={announcementForm.eventId} onValueChange={(value) => 
                    setAnnouncementForm(prev => ({ ...prev, eventId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {event.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={announcementForm.priority} onValueChange={(value: any) => 
                    setAnnouncementForm(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input
                  id="title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your announcement message..."
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Channels</Label>
                <div className="flex gap-4">
                  {['email', 'sms', 'push'].map((channel) => (
                    <Button
                      key={channel}
                      variant={announcementForm.channels.includes(channel) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChannelToggle(channel)}
                    >
                      {channel === 'email' && <Mail className="w-4 h-4 mr-2" />}
                      {channel === 'sms' && <Smartphone className="w-4 h-4 mr-2" />}
                      {channel === 'push' && <Bell className="w-4 h-4 mr-2" />}
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSendAnnouncement}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Announcement
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Updates Tab */}
        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Send Event Update
              </CardTitle>
              <p className="text-sm text-text-secondary">
                Notify attendees about important changes to event details.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update-event-select">Select Event</Label>
                  <Select value={updateForm.eventId} onValueChange={(value) => 
                    setUpdateForm(prev => ({ ...prev, eventId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {event.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-type">Update Type</Label>
                  <Select value={updateForm.updateType} onValueChange={(value: any) => 
                    setUpdateForm(prev => ({ ...prev, updateType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time Change</SelectItem>
                      <SelectItem value="venue">Venue Change</SelectItem>
                      <SelectItem value="general">General Update</SelectItem>
                      <SelectItem value="cancellation">Event Cancellation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-message">Update Message</Label>
                <Textarea
                  id="update-message"
                  value={updateForm.message}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe the update or change..."
                  className="min-h-32"
                />
              </div>

              <Button 
                onClick={handleSendEventUpdate}
                disabled={loading}
                className="w-full"
                variant={updateForm.updateType === 'cancellation' ? 'destructive' : 'default'}
              >
                {loading ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Event Update
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-surface-contrast rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Global Settings</h4>
                  <p className="text-sm text-text-secondary">
                    Configure system-wide notification preferences and delivery settings.
                  </p>
                </div>
                
                <div className="p-4 bg-surface-contrast rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Template Management</h4>
                  <p className="text-sm text-text-secondary">
                    Manage email and SMS templates for different notification types.
                  </p>
                </div>

                <div className="p-4 bg-surface-contrast rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Delivery Configuration</h4>
                  <p className="text-sm text-text-secondary">
                    Configure email service providers, SMS gateways, and push notification settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagementPage; 