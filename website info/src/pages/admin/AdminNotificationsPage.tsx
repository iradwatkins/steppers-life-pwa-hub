import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Send, Settings, Users, Plus, Eye, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'reminder' | 'update' | 'promotion';
  target: 'all' | 'organizers' | 'buyers' | 'instructors' | 'custom';
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledFor?: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
  channels: ('email' | 'push' | 'sms')[];
}

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  defaultSender: string;
  maxDaily: number;
  requireApproval: boolean;
}

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
  defaultSender: 'SteppersLife Team',
  maxDaily: 5,
  requireApproval: true
};

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Platform Update v2.1.0',
      message: 'We\'ve just released new features including enhanced event discovery and improved mobile experience.',
      type: 'update',
      target: 'all',
      status: 'sent',
      sentAt: '2024-12-19 10:00:00',
      recipients: 1247,
      openRate: 68.5,
      clickRate: 12.3,
      channels: ['email', 'push']
    },
    {
      id: '2',
      title: 'New Year Special Offer',
      message: 'Start the new year with amazing dance events! Get 20% off your first event booking.',
      type: 'promotion',
      target: 'buyers',
      status: 'scheduled',
      scheduledFor: '2024-12-31 09:00:00',
      recipients: 892,
      channels: ['email']
    },
    {
      id: '3',
      title: 'Weekly Event Digest',
      message: 'Check out the hottest events happening this week in your area.',
      type: 'reminder',
      target: 'all',
      status: 'draft',
      recipients: 1247,
      channels: ['email', 'push']
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'announcement',
    target: 'all',
    channels: ['email']
  });

  const notificationTypes = [
    { value: 'announcement', label: 'System Announcement', color: 'bg-blue-100 text-blue-800' },
    { value: 'reminder', label: 'Event Reminder', color: 'bg-green-100 text-green-800' },
    { value: 'update', label: 'Platform Update', color: 'bg-purple-100 text-purple-800' },
    { value: 'promotion', label: 'Promotional Message', color: 'bg-orange-100 text-orange-800' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'All Users', count: 1247 },
    { value: 'organizers', label: 'Event Organizers', count: 156 },
    { value: 'buyers', label: 'Event Buyers', count: 892 },
    { value: 'instructors', label: 'Instructors', count: 89 },
    { value: 'custom', label: 'Custom Segment', count: 0 }
  ];

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title!,
      message: newNotification.message!,
      type: newNotification.type || 'announcement',
      target: newNotification.target || 'all',
      status: 'draft',
      recipients: targetAudiences.find(a => a.value === newNotification.target)?.count || 0,
      channels: newNotification.channels || ['email']
    };

    setNotifications(prev => [notification, ...prev]);
    setNewNotification({ title: '', message: '', type: 'announcement', target: 'all', channels: ['email'] });
    setIsCreateDialogOpen(false);
    toast.success('Notification created successfully');
  };

  const handleSendNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    setNotifications(prev => prev.map(n => 
      n.id === id 
        ? { 
            ...n, 
            status: 'sent', 
            sentAt: new Date().toLocaleString(),
            openRate: Math.random() * 80 + 10,
            clickRate: Math.random() * 20 + 5
          }
        : n
    ));

    toast.success(`Notification "${notification.title}" sent to ${notification.recipients} users`);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const getStatusBadge = (status: Notification['status']) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const getTypeBadge = (type: Notification['type']) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? (
      <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
    ) : (
      <Badge variant="secondary">{type}</Badge>
    );
  };

  const handleSettingsUpdate = (field: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    toast.success('Settings updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system notifications and messaging
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newNotification.title || ''}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              
              <div>
                <Label>Message</Label>
                <Textarea
                  value={newNotification.message || ''}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Select 
                    value={newNotification.target} 
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, target: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map(audience => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label} ({audience.count} users)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNotification}>
                  Create Notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send via email</p>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => handleSettingsUpdate('emailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send push notifications</p>
                </div>
                <Switch
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) => handleSettingsUpdate('pushEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send via SMS</p>
                </div>
                <Switch
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => handleSettingsUpdate('smsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Approval</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Admin approval required</p>
                </div>
                <Switch
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) => handleSettingsUpdate('requireApproval', checked)}
                />
              </div>
            </div>

            <div>
              <Label>Daily Limit</Label>
              <Input
                type="number"
                value={settings.maxDaily}
                onChange={(e) => handleSettingsUpdate('maxDaily', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>

            <div>
              <Label>Default Sender</Label>
              <Input
                value={settings.defaultSender}
                onChange={(e) => handleSettingsUpdate('defaultSender', e.target.value)}
                placeholder="Enter sender name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{notifications.filter(n => n.status === 'sent').length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sent This Week</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(notifications.filter(n => n.openRate).reduce((acc, n) => acc + (n.openRate || 0), 0) / notifications.filter(n => n.openRate).length) || 0}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Open Rate</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{notifications.filter(n => n.status === 'scheduled').length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{targetAudiences.find(a => a.value === 'all')?.count || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
          </CardContent>
        </Card>

        {/* Target Audiences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audiences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {targetAudiences.filter(a => a.value !== 'custom').map((audience) => (
              <div key={audience.value} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">{audience.label}</span>
                <Badge variant="secondary">{audience.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    {getStatusBadge(notification.status)}
                    {getTypeBadge(notification.type)}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message.length > 100 
                      ? notification.message.substring(0, 100) + '...'
                      : notification.message
                    }
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Target: {targetAudiences.find(a => a.value === notification.target)?.label}</span>
                    <span>Recipients: {notification.recipients}</span>
                    {notification.openRate && <span>Open Rate: {notification.openRate.toFixed(1)}%</span>}
                    {notification.sentAt && <span>Sent: {notification.sentAt}</span>}
                    {notification.scheduledFor && <span>Scheduled: {notification.scheduledFor}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notification.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleSendNotification(notification.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Now
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p>No notifications yet. Create your first notification above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationsPage; 