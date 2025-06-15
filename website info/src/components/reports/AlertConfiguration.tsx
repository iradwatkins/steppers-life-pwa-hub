import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Settings,
  TrendingUp,
  TrendingDown,
  Target,
  Clock
} from 'lucide-react';
import { AlertRule } from '../../services/automatedReportsService';
import { cn } from '@/lib/utils';

interface AlertConfigurationProps {
  alert?: AlertRule;
  onSave: (alert: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface AlertCondition {
  id: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
  threshold: number;
  timeframe: 'last_hour' | 'last_day' | 'last_week' | 'last_month';
}

const AVAILABLE_METRICS = [
  { value: 'revenue', label: 'Revenue', type: 'currency', icon: '💰' },
  { value: 'attendance', label: 'Attendance', type: 'number', icon: '👥' },
  { value: 'rating', label: 'Rating', type: 'percentage', icon: '⭐' },
  { value: 'conversion_rate', label: 'Conversion Rate', type: 'percentage', icon: '📈' },
  { value: 'ticket_sales', label: 'Ticket Sales', type: 'number', icon: '🎫' },
  { value: 'cancellation_rate', label: 'Cancellation Rate', type: 'percentage', icon: '❌' },
  { value: 'refund_rate', label: 'Refund Rate', type: 'percentage', icon: '↩️' },
  { value: 'page_views', label: 'Page Views', type: 'number', icon: '👁️' },
  { value: 'engagement_rate', label: 'Engagement Rate', type: 'percentage', icon: '💬' },
  { value: 'response_time', label: 'Response Time', type: 'number', icon: '⏱️' }
];

const OPERATORS = [
  { value: 'greater_than', label: 'Greater than', icon: '>' },
  { value: 'less_than', label: 'Less than', icon: '<' },
  { value: 'equals', label: 'Equals', icon: '=' },
  { value: 'not_equals', label: 'Not equals', icon: '≠' },
  { value: 'percentage_change', label: 'Percentage change', icon: '±' }
];

const TIMEFRAMES = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'last_day', label: 'Last Day' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'last_month', label: 'Last Month' }
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800', icon: '🔴' }
];

const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Send email notifications' },
  { value: 'sms', label: 'SMS', icon: Smartphone, description: 'Send text messages' },
  { value: 'dashboard', label: 'Dashboard', icon: Bell, description: 'Show in dashboard' },
  { value: 'webhook', label: 'Webhook', icon: Globe, description: 'Send to external URL' }
];

export const AlertConfiguration: React.FC<AlertConfigurationProps> = ({
  alert,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [alertData, setAlertData] = useState<Partial<AlertRule>>({
    name: alert?.name || '',
    description: alert?.description || '',
    conditions: alert?.conditions || [],
    logic: alert?.logic || 'AND',
    recipients: alert?.recipients || [],
    notification: alert?.notification || {
      channels: ['email', 'dashboard'],
      urgency: 'medium',
      suppressDuration: 60
    },
    enabled: alert?.enabled ?? true,
    createdBy: alert?.createdBy || 'current_user'
  });

  const [newCondition, setNewCondition] = useState<Partial<AlertCondition>>({
    metric: '',
    operator: 'greater_than',
    threshold: 0,
    timeframe: 'last_day'
  });

  const [newRecipient, setNewRecipient] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const addCondition = useCallback(() => {
    if (!newCondition.metric) {
      alert('Please select a metric');
      return;
    }

    const condition: AlertCondition = {
      id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metric: newCondition.metric!,
      operator: newCondition.operator!,
      threshold: newCondition.threshold!,
      timeframe: newCondition.timeframe!
    };

    setAlertData(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), condition]
    }));

    // Reset form
    setNewCondition({
      metric: '',
      operator: 'greater_than',
      threshold: 0,
      timeframe: 'last_day'
    });
  }, [newCondition]);

  const removeCondition = useCallback((conditionId: string) => {
    setAlertData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(c => c.id !== conditionId)
    }));
  }, []);

  const addRecipient = useCallback(() => {
    if (!newRecipient.trim()) {
      alert('Please enter a recipient email or user ID');
      return;
    }

    setAlertData(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), newRecipient.trim()]
    }));

    setNewRecipient('');
  }, [newRecipient]);

  const removeRecipient = useCallback((index: number) => {
    setAlertData(prev => ({
      ...prev,
      recipients: prev.recipients?.filter((_, i) => i !== index)
    }));
  }, []);

  const toggleNotificationChannel = useCallback((channel: string) => {
    setAlertData(prev => {
      const channels = prev.notification?.channels || [];
      const newChannels = channels.includes(channel as any)
        ? channels.filter(c => c !== channel)
        : [...channels, channel as any];

      return {
        ...prev,
        notification: {
          ...prev.notification!,
          channels: newChannels
        }
      };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!alertData.name || !alertData.description) {
      alert('Please fill in required fields (name and description)');
      return;
    }

    if (!alertData.conditions || alertData.conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }

    if (!alertData.recipients || alertData.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    onSave(alertData as Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>);
  }, [alertData, onSave]);

  const formatThreshold = (condition: AlertCondition) => {
    const metric = AVAILABLE_METRICS.find(m => m.value === condition.metric);
    if (!metric) return condition.threshold.toString();

    switch (metric.type) {
      case 'currency':
        return `$${condition.threshold.toLocaleString()}`;
      case 'percentage':
        return `${condition.threshold}%`;
      default:
        return condition.threshold.toLocaleString();
    }
  };

  const getConditionDescription = (condition: AlertCondition) => {
    const metric = AVAILABLE_METRICS.find(m => m.value === condition.metric);
    const operator = OPERATORS.find(o => o.value === condition.operator);
    const timeframe = TIMEFRAMES.find(t => t.value === condition.timeframe);

    if (!metric || !operator || !timeframe) return '';

    return `${metric.label} ${operator.label.toLowerCase()} ${formatThreshold(condition)} in the ${timeframe.label.toLowerCase()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </h1>
          <p className="text-gray-600 mt-1">
            Set up automated alerts for performance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? 'Update Alert' : 'Create Alert'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alertName">Alert Name</Label>
              <Input
                id="alertName"
                value={alertData.name}
                onChange={(e) => setAlertData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="High Revenue Alert"
              />
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={alertData.notification?.urgency}
                onValueChange={(value: any) => setAlertData(prev => ({
                  ...prev,
                  notification: { ...prev.notification!, urgency: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <span>{level.icon}</span>
                        <span>{level.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="alertDescription">Description</Label>
            <Textarea
              id="alertDescription"
              value={alertData.description}
              onChange={(e) => setAlertData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Alert description and purpose"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={alertData.enabled}
              onCheckedChange={(checked) => setAlertData(prev => ({ ...prev, enabled: checked }))}
            />
            <Label>Enable Alert</Label>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Alert Conditions ({alertData.conditions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Conditions */}
          {alertData.conditions && alertData.conditions.length > 0 && (
            <div className="space-y-3">
              {alertData.conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {alertData.logic}
                        </Badge>
                      )}
                      <span className="font-medium">{getConditionDescription(condition)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Metric: {condition.metric} • Timeframe: {condition.timeframe}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCondition(condition.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {alertData.conditions.length > 1 && (
                <div className="flex items-center gap-4">
                  <Label>Logic Operator:</Label>
                  <Select
                    value={alertData.logic}
                    onValueChange={(value: 'AND' | 'OR') => setAlertData(prev => ({ ...prev, logic: value }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">
                    {alertData.logic === 'AND' ? 'All conditions must be met' : 'Any condition can trigger'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Add New Condition */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Add Condition</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="metric">Metric</Label>
                <Select
                  value={newCondition.metric}
                  onValueChange={(value) => setNewCondition(prev => ({ ...prev, metric: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_METRICS.map(metric => (
                      <SelectItem key={metric.value} value={metric.value}>
                        <div className="flex items-center gap-2">
                          <span>{metric.icon}</span>
                          <span>{metric.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="operator">Operator</Label>
                <Select
                  value={newCondition.operator}
                  onValueChange={(value: any) => setNewCondition(prev => ({ ...prev, operator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(operator => (
                      <SelectItem key={operator.value} value={operator.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{operator.icon}</span>
                          <span>{operator.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newCondition.threshold}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select
                  value={newCondition.timeframe}
                  onValueChange={(value: any) => setNewCondition(prev => ({ ...prev, timeframe: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map(timeframe => (
                      <SelectItem key={timeframe.value} value={timeframe.value}>
                        {timeframe.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={addCondition}
              className="flex items-center gap-2 mt-4"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Condition
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Channels */}
          <div>
            <Label>Notification Channels</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {NOTIFICATION_CHANNELS.map(channel => {
                const IconComponent = channel.icon;
                const isSelected = alertData.notification?.channels.includes(channel.value as any);
                
                return (
                  <div
                    key={channel.value}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => toggleNotificationChannel(channel.value)}
                  >
                    <Switch checked={isSelected} />
                    <IconComponent className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{channel.label}</div>
                      <div className="text-xs text-gray-600">{channel.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Webhook Configuration */}
          {alertData.notification?.channels.includes('webhook') && (
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-webhook-url.com/alerts"
              />
            </div>
          )}

          {/* Suppress Duration */}
          <div>
            <Label htmlFor="suppressDuration">Suppress Duration (minutes)</Label>
            <Input
              id="suppressDuration"
              type="number"
              min="1"
              max="1440"
              value={alertData.notification?.suppressDuration}
              onChange={(e) => setAlertData(prev => ({
                ...prev,
                notification: {
                  ...prev.notification!,
                  suppressDuration: parseInt(e.target.value) || 60
                }
              }))}
            />
            <p className="text-xs text-gray-600 mt-1">
              Prevent duplicate alerts for this duration after triggering
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recipients ({alertData.recipients?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Recipients */}
          {alertData.recipients && alertData.recipients.length > 0 && (
            <div className="space-y-2">
              {alertData.recipients.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span>{recipient}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRecipient(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Recipient */}
          <div className="flex gap-2">
            <Input
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="Email address or user ID"
              className="flex-1"
            />
            <Button onClick={addRecipient} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {alertData.conditions && alertData.conditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alert Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={URGENCY_LEVELS.find(l => l.value === alertData.notification?.urgency)?.color}>
                  {alertData.notification?.urgency?.toUpperCase()}
                </Badge>
                <span className="font-medium">{alertData.name}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{alertData.description}</p>
              <div className="text-sm">
                <span className="font-medium">Trigger when:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {alertData.conditions.map((condition, index) => (
                    <li key={condition.id}>
                      {index > 0 && <span className="font-medium text-blue-600">{alertData.logic} </span>}
                      {getConditionDescription(condition)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-sm mt-3">
                <span className="font-medium">Notify via:</span> {alertData.notification?.channels.join(', ')}
                <br />
                <span className="font-medium">Recipients:</span> {alertData.recipients?.join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 