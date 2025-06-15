import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Mail, Send, Activity, Settings, FileText, BarChart3, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { emailService, EmailTemplate, EmailLog, EmailStats, EmailConfig } from '../../services/emailService';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminEmailManagementPage = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [configDialog, setConfigDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState<{
    open: boolean;
    template?: EmailTemplate;
    isEdit: boolean;
  }>({ open: false, isEdit: false });
  
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: 'transactional',
    variables: [],
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [config, templatesData, logsData, statsData] = await Promise.all([
        emailService.getEmailConfig(),
        emailService.getEmailTemplates(),
        emailService.getEmailLogs({ limit: 50 }),
        emailService.getEmailStats(),
      ]);
      
      setEmailConfig(config);
      setTemplates(templatesData);
      setEmailLogs(logsData);
      setEmailStats(statsData);
    } catch (error) {
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfigUpdate = async (updates: Partial<EmailConfig>) => {
    setLoading(true);
    try {
      const updatedConfig = await emailService.updateEmailConfig(updates);
      setEmailConfig(updatedConfig);
      toast.success('Email configuration updated');
      setConfigDialog(false);
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfig = async () => {
    setLoading(true);
    try {
      const result = await emailService.testEmailConfig();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to test configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      await emailService.createEmailTemplate(newTemplate as Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('Template created successfully');
      setTemplateDialog({ open: false, isEdit: false });
      setNewTemplate({
        name: '',
        subject: '',
        htmlContent: '',
        textContent: '',
        category: 'transactional',
        variables: [],
        isActive: true,
      });
      loadData();
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    setLoading(true);
    try {
      await emailService.updateEmailTemplate(id, updates);
      toast.success('Template updated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    setLoading(true);
    try {
      await emailService.deleteEmailTemplate(id);
      toast.success('Template deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setLoading(true);
    try {
      await emailService.sendEmail({
        to: testEmail,
        subject: 'Test Email from SteppersLife',
        htmlContent: '<h1>Test Email</h1><p>This is a test email to verify your email configuration is working correctly.</p>',
        category: 'transactional',
      });
      toast.success('Test email sent successfully');
      setTestEmailDialog(false);
      setTestEmail('');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'opened':
      case 'clicked':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'bounced':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'delivered' || status === 'opened' || status === 'clicked' 
      ? 'default' 
      : status === 'failed' || status === 'bounced' 
      ? 'destructive' 
      : 'secondary';
    
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      transactional: 'bg-blue-100 text-blue-800',
      notification: 'bg-green-100 text-green-800',
      marketing: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors]}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email System Management</h1>
          <p className="text-gray-600 mt-2">
            Configure email settings, manage templates, and monitor email delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={testEmailDialog} onOpenChange={setTestEmailDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a test email to verify your configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setTestEmailDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendTestEmail} disabled={loading}>
                    Send Test Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setConfigDialog(true)} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Total Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats?.totalSent || 0}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {emailStats?.deliveryRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-gray-600">{emailStats?.totalDelivered || 0} delivered</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {emailStats?.openRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-gray-600">{emailStats?.totalOpened || 0} opened</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {emailStats?.clickRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-gray-600">{emailStats?.totalClicked || 0} clicked</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
              <CardDescription>Latest email delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <h4 className="font-medium">{log.subject}</h4>
                        <p className="text-sm text-gray-600">
                          To: {log.to} • {format(log.sentAt, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(log.category)}
                      {getStatusBadge(log.status)}
                    </div>
                  </div>
                ))}
                {emailLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No email activity yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Provider Configuration</CardTitle>
              <CardDescription>
                Configure SendGrid or SMTP settings for email delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailConfig && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Provider</Label>
                    <div className="font-medium capitalize">{emailConfig.provider}</div>
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <div className="font-medium">{emailConfig.fromEmail}</div>
                  </div>
                  <div>
                    <Label>From Name</Label>
                    <div className="font-medium">{emailConfig.fromName}</div>
                  </div>
                  <div>
                    <Label>Test Mode</Label>
                    <Badge variant={emailConfig.isTestMode ? "secondary" : "default"}>
                      {emailConfig.isTestMode ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleTestConfig} variant="outline">
                  Test Configuration
                </Button>
                <Button onClick={() => setConfigDialog(true)}>
                  Update Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Dialog 
              open={templateDialog.open} 
              onOpenChange={(open) => setTemplateDialog({ open, isEdit: false })}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {templateDialog.isEdit ? 'Edit Template' : 'Create Email Template'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Welcome Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value: 'transactional' | 'notification' | 'marketing') => 
                          setNewTemplate(prev => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="templateSubject">Subject</Label>
                    <Input
                      id="templateSubject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Welcome to {{firstName}}!"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="templateHtml">HTML Content</Label>
                    <Textarea
                      id="templateHtml"
                      value={newTemplate.htmlContent}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, htmlContent: e.target.value }))}
                      placeholder="<h1>Welcome {{firstName}}!</h1>"
                      rows={8}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="templateText">Text Content (Optional)</Label>
                    <Textarea
                      id="templateText"
                      value={newTemplate.textContent}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, textContent: e.target.value }))}
                      placeholder="Welcome {{firstName}}!"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newTemplate.isActive}
                      onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Active Template</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setTemplateDialog({ open: false, isEdit: false })}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={loading}>
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{template.name}</h3>
                        {getCategoryBadge(template.category)}
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        Subject: {template.subject}
                      </p>
                      <div className="text-sm text-gray-500">
                        <span>Variables: {template.variables.join(', ') || 'None'}</span>
                        <span className="mx-2">•</span>
                        <span>Updated: {format(template.updatedAt, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateTemplate(template.id, { isActive: !template.isActive })}
                      >
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery Logs</CardTitle>
              <CardDescription>Track email delivery status and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{log.subject}</h4>
                        <p className="text-sm text-gray-600">
                          To: {log.to} • From: {log.from}
                        </p>
                        <p className="text-xs text-gray-500">
                          Sent: {format(log.sentAt, 'MMM d, yyyy h:mm a')}
                          {log.deliveredAt && (
                            <span> • Delivered: {format(log.deliveredAt, 'MMM d, yyyy h:mm a')}</span>
                          )}
                          {log.openedAt && (
                            <span> • Opened: {format(log.openedAt, 'MMM d, yyyy h:mm a')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(log.category)}
                      {getStatusBadge(log.status)}
                    </div>
                  </div>
                ))}
                {emailLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No email logs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Delivery Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emailStats && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Delivered</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${emailStats.deliveryRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{emailStats.deliveryRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Opened</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${emailStats.openRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{emailStats.openRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Clicked</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-purple-500 rounded-full"
                            style={{ width: `${emailStats.clickRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{emailStats.clickRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bounced</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-red-500 rounded-full"
                            style={{ width: `${emailStats.bounceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{emailStats.bounceRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['transactional', 'notification', 'marketing'].map(category => {
                    const count = emailLogs.filter(log => log.category === category).length;
                    const percentage = emailLogs.length > 0 ? (count / emailLogs.length) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="capitalize">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-indigo-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Configuration Dialog */}
      <Dialog open={configDialog} onOpenChange={setConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Configuration</DialogTitle>
            <DialogDescription>
              Configure email provider and settings
            </DialogDescription>
          </DialogHeader>
          {emailConfig && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Email Provider</Label>
                  <Select
                    value={emailConfig.provider}
                    onValueChange={(value: 'sendgrid' | 'smtp') => 
                      setEmailConfig(prev => prev ? { ...prev, provider: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig(prev => 
                      prev ? { ...prev, fromEmail: e.target.value } : null
                    )}
                  />
                </div>
              </div>
              
              {emailConfig.provider === 'sendgrid' && (
                <div>
                  <Label htmlFor="sendgridKey">SendGrid API Key</Label>
                  <Input
                    id="sendgridKey"
                    type="password"
                    value={emailConfig.sendgridApiKey || ''}
                    onChange={(e) => setEmailConfig(prev => 
                      prev ? { ...prev, sendgridApiKey: e.target.value } : null
                    )}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailConfig.isTestMode}
                  onCheckedChange={(checked) => setEmailConfig(prev => 
                    prev ? { ...prev, isTestMode: checked } : null
                  )}
                />
                <Label>Test Mode (emails won't be actually sent)</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setConfigDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleConfigUpdate(emailConfig)} 
                  disabled={loading}
                >
                  Update Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailManagementPage; 