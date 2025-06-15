import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Mail,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  CalendarDays,
  Globe,
  Download,
  Share,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ScheduledReport, ReportRecipient, ReportTemplate } from '../../services/automatedReportsService';
import { cn } from '@/lib/utils';

interface ReportSchedulerProps {
  templates: ReportTemplate[];
  scheduledReport?: ScheduledReport;
  onSave: (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface RecipientFormData {
  type: 'user' | 'email' | 'group';
  identifier: string;
  name: string;
  role: 'owner' | 'stakeholder' | 'viewer';
  customization: {
    format?: 'PDF' | 'Excel' | 'PowerPoint' | 'HTML';
    sections?: string[];
    summaryOnly?: boolean;
  };
  preferences: {
    emailDelivery: boolean;
    dashboardNotification: boolean;
    frequency?: 'all' | 'weekly_digest' | 'monthly_digest';
  };
}

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'GMT' },
  { value: 'Europe/Paris', label: 'CET' },
  { value: 'Asia/Tokyo', label: 'JST' },
  { value: 'Australia/Sydney', label: 'AEST' }
];

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const ReportScheduler: React.FC<ReportSchedulerProps> = ({
  templates,
  scheduledReport,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [reportData, setReportData] = useState<Partial<ScheduledReport>>({
    name: scheduledReport?.name || '',
    templateId: scheduledReport?.templateId || '',
    schedule: scheduledReport?.schedule || {
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1,
      timezone: 'America/New_York',
      enabled: true
    },
    recipients: scheduledReport?.recipients || [],
    delivery: scheduledReport?.delivery || {
      email: {
        subject: 'Automated Report: {report_name}',
        body: 'Please find your automated report attached.',
        attachReport: true,
        includeExecutiveSummary: true
      },
      dashboard: {
        postToDashboard: true,
        notifyUsers: true
      },
      archive: {
        saveToCloud: true,
        retentionDays: 90
      }
    },
    status: scheduledReport?.status || 'pending',
    createdBy: scheduledReport?.createdBy || 'current_user'
  });

  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<ReportRecipient | null>(null);
  const [recipientFormData, setRecipientFormData] = useState<RecipientFormData>({
    type: 'email',
    identifier: '',
    name: '',
    role: 'viewer',
    customization: {
      format: 'PDF',
      summaryOnly: false
    },
    preferences: {
      emailDelivery: true,
      dashboardNotification: false,
      frequency: 'all'
    }
  });

  const selectedTemplate = templates.find(t => t.id === reportData.templateId);

  const handleAddRecipient = useCallback(() => {
    if (!recipientFormData.identifier || !recipientFormData.name) {
      alert('Please fill in required fields (identifier and name)');
      return;
    }

    const newRecipient: ReportRecipient = {
      id: `recipient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...recipientFormData
    };

    setReportData(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), newRecipient]
    }));

    // Reset form
    setRecipientFormData({
      type: 'email',
      identifier: '',
      name: '',
      role: 'viewer',
      customization: {
        format: 'PDF',
        summaryOnly: false
      },
      preferences: {
        emailDelivery: true,
        dashboardNotification: false,
        frequency: 'all'
      }
    });
    setShowRecipientForm(false);
  }, [recipientFormData]);

  const handleEditRecipient = useCallback((recipient: ReportRecipient) => {
    setEditingRecipient(recipient);
    setRecipientFormData({
      type: recipient.type,
      identifier: recipient.identifier,
      name: recipient.name,
      role: recipient.role,
      customization: recipient.customization,
      preferences: recipient.preferences
    });
    setShowRecipientForm(true);
  }, []);

  const handleUpdateRecipient = useCallback(() => {
    if (!editingRecipient) return;

    const updatedRecipient: ReportRecipient = {
      ...editingRecipient,
      ...recipientFormData
    };

    setReportData(prev => ({
      ...prev,
      recipients: prev.recipients?.map(r => 
        r.id === editingRecipient.id ? updatedRecipient : r
      )
    }));

    setEditingRecipient(null);
    setShowRecipientForm(false);
  }, [editingRecipient, recipientFormData]);

  const handleRemoveRecipient = useCallback((recipientId: string) => {
    setReportData(prev => ({
      ...prev,
      recipients: prev.recipients?.filter(r => r.id !== recipientId)
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!reportData.name || !reportData.templateId) {
      alert('Please fill in required fields (name and template)');
      return;
    }

    if (!reportData.recipients || reportData.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    onSave(reportData as Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>);
  }, [reportData, onSave]);

  const calculateNextRun = () => {
    if (!reportData.schedule) return null;

    const now = new Date();
    const nextRun = new Date(now);
    
    const [hours, minutes] = reportData.schedule.time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (reportData.schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(now.getDate() + 1);
        }
        break;
      case 'weekly':
        const daysUntilNext = (reportData.schedule.dayOfWeek! - now.getDay() + 7) % 7;
        if (daysUntilNext === 0 && nextRun <= now) {
          nextRun.setDate(now.getDate() + 7);
        } else {
          nextRun.setDate(now.getDate() + daysUntilNext);
        }
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        nextRun.setDate(reportData.schedule.dayOfMonth || 1);
        break;
      case 'quarterly':
        nextRun.setMonth(now.getMonth() + 3);
        nextRun.setDate(1);
        break;
    }

    return nextRun;
  };

  const nextRunDate = calculateNextRun();

  const renderRecipientForm = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingRecipient ? 'Edit Recipient' : 'Add Recipient'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientType">Type</Label>
            <Select
              value={recipientFormData.type}
              onValueChange={(value: any) => setRecipientFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Address</SelectItem>
                <SelectItem value="user">Platform User</SelectItem>
                <SelectItem value="group">User Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipientRole">Role</Label>
            <Select
              value={recipientFormData.role}
              onValueChange={(value: any) => setRecipientFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="stakeholder">Stakeholder</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientIdentifier">
              {recipientFormData.type === 'email' ? 'Email Address' : 'User/Group ID'}
            </Label>
            <Input
              id="recipientIdentifier"
              value={recipientFormData.identifier}
              onChange={(e) => setRecipientFormData(prev => ({ ...prev, identifier: e.target.value }))}
              placeholder={recipientFormData.type === 'email' ? 'user@example.com' : 'Enter ID'}
            />
          </div>

          <div>
            <Label htmlFor="recipientName">Display Name</Label>
            <Input
              id="recipientName"
              value={recipientFormData.name}
              onChange={(e) => setRecipientFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
            />
          </div>
        </div>

        {/* Customization Options */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Customization</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientFormat">Report Format</Label>
              <Select
                value={recipientFormData.customization.format}
                onValueChange={(value: any) => setRecipientFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, format: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="PowerPoint">PowerPoint</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={recipientFormData.customization.summaryOnly}
                onCheckedChange={(checked) => setRecipientFormData(prev => ({
                  ...prev,
                  customization: { ...prev.customization, summaryOnly: checked }
                }))}
              />
              <Label>Summary Only</Label>
            </div>
          </div>
        </div>

        {/* Delivery Preferences */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Delivery Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={recipientFormData.preferences.emailDelivery}
                onCheckedChange={(checked) => setRecipientFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, emailDelivery: checked }
                }))}
              />
              <Label>Email Delivery</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={recipientFormData.preferences.dashboardNotification}
                onCheckedChange={(checked) => setRecipientFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, dashboardNotification: checked }
                }))}
              />
              <Label>Dashboard Notification</Label>
            </div>

            <div>
              <Label htmlFor="recipientFrequency">Frequency</Label>
              <Select
                value={recipientFormData.preferences.frequency}
                onValueChange={(value: any) => setRecipientFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, frequency: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="weekly_digest">Weekly Digest</SelectItem>
                  <SelectItem value="monthly_digest">Monthly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={editingRecipient ? handleUpdateRecipient : handleAddRecipient}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowRecipientForm(false);
              setEditingRecipient(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Scheduled Report' : 'Schedule Report'}
          </h1>
          <p className="text-gray-600 mt-1">
            Configure automated report generation and delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? 'Update Schedule' : 'Create Schedule'}
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
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportData.name}
                onChange={(e) => setReportData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Weekly Performance Report"
              />
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <Select
                value={reportData.templateId}
                onValueChange={(value) => setReportData(prev => ({ ...prev, templateId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTemplate && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedTemplate.name}</div>
                  <div className="text-sm text-gray-600">{selectedTemplate.description}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                  <Badge variant="secondary">{selectedTemplate.format}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={reportData.schedule?.frequency}
                onValueChange={(value: any) => setReportData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule!, frequency: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={reportData.schedule?.time}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule!, time: e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={reportData.schedule?.timezone}
                onValueChange={(value) => setReportData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule!, timezone: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportData.schedule?.frequency === 'weekly' && (
            <div>
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={reportData.schedule.dayOfWeek?.toString()}
                onValueChange={(value) => setReportData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule!, dayOfWeek: parseInt(value) }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportData.schedule?.frequency === 'monthly' && (
            <div>
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={reportData.schedule.dayOfMonth || 1}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule!, dayOfMonth: parseInt(e.target.value) }
                }))}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={reportData.schedule?.enabled}
              onCheckedChange={(checked) => setReportData(prev => ({
                ...prev,
                schedule: { ...prev.schedule!, enabled: checked }
              }))}
            />
            <Label>Enable Schedule</Label>
          </div>

          {nextRunDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <CalendarDays className="h-4 w-4" />
                <span className="font-medium">Next Run:</span>
                <span>{nextRunDate.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients ({reportData.recipients?.length || 0})
            </span>
            <Button
              size="sm"
              onClick={() => setShowRecipientForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Recipient
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.recipients && reportData.recipients.length > 0 ? (
            <div className="space-y-3">
              {reportData.recipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{recipient.name}</span>
                      <Badge variant="outline">{recipient.role}</Badge>
                      <Badge variant="secondary">{recipient.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {recipient.identifier} • Format: {recipient.customization.format}
                      {recipient.customization.summaryOnly && ' • Summary Only'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {recipient.preferences.emailDelivery && '📧 Email'}{' '}
                      {recipient.preferences.dashboardNotification && '🔔 Dashboard'}{' '}
                      • {recipient.preferences.frequency}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditRecipient(recipient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No recipients added</p>
              <p className="text-sm">Add recipients to receive automated reports</p>
            </div>
          )}

          {showRecipientForm && renderRecipientForm()}
        </CardContent>
      </Card>

      {/* Delivery Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="emailSubject">Email Subject</Label>
                <Input
                  id="emailSubject"
                  value={reportData.delivery?.email.subject}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery!,
                      email: { ...prev.delivery!.email, subject: e.target.value }
                    }
                  }))}
                  placeholder="Use {report_name}, {date}, {time} variables"
                />
              </div>

              <div>
                <Label htmlFor="emailBody">Email Body</Label>
                <Textarea
                  id="emailBody"
                  value={reportData.delivery?.email.body}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery!,
                      email: { ...prev.delivery!.email, body: e.target.value }
                    }
                  }))}
                  rows={4}
                  placeholder="Email message body"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={reportData.delivery?.email.attachReport}
                    onCheckedChange={(checked) => setReportData(prev => ({
                      ...prev,
                      delivery: {
                        ...prev.delivery!,
                        email: { ...prev.delivery!.email, attachReport: checked }
                      }
                    }))}
                  />
                  <Label>Attach Report File</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={reportData.delivery?.email.includeExecutiveSummary}
                    onCheckedChange={(checked) => setReportData(prev => ({
                      ...prev,
                      delivery: {
                        ...prev.delivery!,
                        email: { ...prev.delivery!.email, includeExecutiveSummary: checked }
                      }
                    }))}
                  />
                  <Label>Include Executive Summary</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={reportData.delivery?.dashboard.postToDashboard}
                  onCheckedChange={(checked) => setReportData(prev => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery!,
                      dashboard: { ...prev.delivery!.dashboard, postToDashboard: checked }
                    }
                  }))}
                />
                <Label>Post to Dashboard</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={reportData.delivery?.dashboard.notifyUsers}
                  onCheckedChange={(checked) => setReportData(prev => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery!,
                      dashboard: { ...prev.delivery!.dashboard, notifyUsers: checked }
                    }
                  }))}
                />
                <Label>Notify Users</Label>
              </div>
            </TabsContent>

            <TabsContent value="archive" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={reportData.delivery?.archive.saveToCloud}
                  onCheckedChange={(checked) => setReportData(prev => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery!,
                      archive: { ...prev.delivery!.archive, saveToCloud: checked }
                    }
                  }))}
                />
                <Label>Save to Cloud Storage</Label>
              </div>

              <div>
                <Label htmlFor="retentionDays">Retention Period (Days)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min="1"
                  max="365"
                  value={reportData.delivery?.archive.retentionDays}
                  onChange={(e) => setReportData(prev => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery!,
                      archive: { ...prev.delivery!.archive, retentionDays: parseInt(e.target.value) }
                    }
                  }))}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 