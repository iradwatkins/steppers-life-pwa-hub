import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAutomatedReports } from '@/hooks/useAutomatedReports';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Bell,
  FileText,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Play,
  Pause,
  Copy,
  Eye,
  Filter,
  Archive,
  Upload,
  ExternalLink
} from 'lucide-react';

export default function AutomatedReportsPage() {
  const navigate = useNavigate();
  const {
    templates,
    scheduledReports,
    alertRules,
    executions,
    archives,
    performanceMetrics,
    loading,
    error,
    filters,
    searchQuery,
    autoRefresh,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleScheduledReport,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    testAlert,
    generateReport,
    downloadArchive,
    deleteArchive,
    bulkDeleteArchives,
    exportReport,
    applyFilters,
    clearFilters,
    setSearchQuery,
    getFilteredTemplates,
    getFilteredScheduledReports,
    getFilteredArchives,
    refresh,
    setAutoRefresh,
    getActiveSchedulesCount,
    getRecentExecutions,
    getTotalStorageUsed,
    getUpcomingReports
  } = useAutomatedReports();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [newScheduleDialog, setNewScheduleDialog] = useState(false);
  const [newAlertDialog, setNewAlertDialog] = useState(false);

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'operational' as any,
    layout: 'standard' as any
  });

  const [scheduleForm, setScheduleForm] = useState({
    templateId: '',
    name: '',
    description: '',
    frequency: 'weekly' as any,
    time: '09:00',
    timezone: 'America/New_York',
    recipients: [] as any[]
  });

  const [alertForm, setAlertForm] = useState({
    name: '',
    description: '',
    metric: 'revenue',
    operator: '>' as any,
    threshold: 0,
    urgency: 'medium' as any,
    emails: '',
    suppressDuration: 60
  });

  const filteredTemplates = getFilteredTemplates();
  const filteredScheduledReports = getFilteredScheduledReports();
  const filteredArchives = getFilteredArchives();
  const recentExecutions = getRecentExecutions(5);
  const upcomingReports = getUpcomingReports(7);

  const handleCreateTemplate = async () => {
    try {
      await createTemplate({
        ...templateForm,
        widgets: [],
        branding: {
          colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6' },
          typography: 'modern'
        },
        isActive: true
      });
      setNewTemplateDialog(false);
      setTemplateForm({ name: '', description: '', category: 'operational', layout: 'standard' });
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await createScheduledReport({
        ...scheduleForm,
        schedule: {
          frequency: scheduleForm.frequency,
          time: scheduleForm.time,
          timezone: scheduleForm.timezone,
          dayOfWeek: scheduleForm.frequency === 'weekly' ? 1 : undefined,
          dayOfMonth: scheduleForm.frequency === 'monthly' ? 1 : undefined
        },
        deliveryOptions: { email: true, dashboard: true, archive: true },
        isActive: true
      });
      setNewScheduleDialog(false);
      setScheduleForm({
        templateId: '',
        name: '',
        description: '',
        frequency: 'weekly',
        time: '09:00',
        timezone: 'America/New_York',
        recipients: []
      });
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleCreateAlert = async () => {
    try {
      await createAlertRule({
        ...alertForm,
        andConditions: [],
        orConditions: [],
        notifications: {
          email: alertForm.emails.split(',').map(e => e.trim()).filter(e => e),
          sms: [],
          dashboard: true
        },
        isActive: true
      });
      setNewAlertDialog(false);
      setAlertForm({
        name: '',
        description: '',
        metric: 'revenue',
        operator: '>',
        threshold: 0,
        urgency: 'medium',
        emails: '',
        suppressDuration: 60
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    try {
      await generateReport(templateId, 'pdf');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkDeleteArchives(selectedItems);
      setSelectedItems([]);
    } catch (error) {
      console.error('Failed to delete items:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatFileSize = (bytes: number) => {
    return formatBytes(bytes);
  };

  if (loading && templates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Automated Reports</h1>
            <p className="text-muted-foreground">Schedule and manage automated report generation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked)}
            />
            <Label>Auto Refresh</Label>
          </div>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Performance Metrics Cards */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getActiveSchedulesCount()}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Running automatically
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.successRate.toFixed(1)}%</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Report generation
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.storageUsed.toFixed(1)}GB</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Archive className="h-4 w-4 mr-1" />
                Report archives
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{performanceMetrics.systemHealth}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                All systems operational
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Latest report generation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">Report #{execution.id.slice(-6)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(execution.startedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(execution.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reports</CardTitle>
                <CardDescription>Scheduled reports in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(report.nextRun).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline">{report.schedule.frequency}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={() => setNewTemplateDialog(true)} className="h-20 flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  New Template
                </Button>
                <Button onClick={() => setNewScheduleDialog(true)} variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Schedule Report
                </Button>
                <Button onClick={() => setNewAlertDialog(true)} variant="outline" className="h-20 flex-col">
                  <Bell className="h-6 w-6 mb-2" />
                  Create Alert
                </Button>
                <Button onClick={() => setActiveTab('archives')} variant="outline" className="h-20 flex-col">
                  <Archive className="h-6 w-6 mb-2" />
                  View Archives
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filters.templateCategory} onValueChange={(value) => applyFilters({ templateCategory: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setNewTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Layout:</span>
                      <span className="capitalize">{template.layout}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Widgets:</span>
                      <span>{template.widgets.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleGenerateReport(template.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search scheduled reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filters.reportStatus} onValueChange={(value) => applyFilters({ reportStatus: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setNewScheduleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>

          <div className="space-y-4">
            {filteredScheduledReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{report.name}</h3>
                        <Badge variant={report.isActive ? 'default' : 'secondary'}>
                          {report.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {report.schedule.frequency}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{report.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Next Run:</span>
                          <div className="text-muted-foreground">
                            {new Date(report.nextRun).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Recipients:</span>
                          <div className="text-muted-foreground">
                            {report.recipients.length} people
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Last Run:</span>
                          <div className="text-muted-foreground">
                            {report.lastRun ? new Date(report.lastRun).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Timezone:</span>
                          <div className="text-muted-foreground">
                            {report.schedule.timezone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduledReport(report.id)}
                      >
                        {report.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteScheduledReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Executions</CardTitle>
              <CardDescription>History of report generation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">Report #{execution.id.slice(-8)}</h4>
                        {getStatusBadge(execution.status)}
                        <Badge variant="outline" className="uppercase">
                          {execution.outputFormat}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span>Started:</span>
                          <div>{new Date(execution.startedAt).toLocaleString()}</div>
                        </div>
                        {execution.completedAt && (
                          <div>
                            <span>Completed:</span>
                            <div>{new Date(execution.completedAt).toLocaleString()}</div>
                          </div>
                        )}
                        <div>
                          <span>Duration:</span>
                          <div>{execution.metrics.totalTime}s</div>
                        </div>
                        <div>
                          <span>Progress:</span>
                          <div>{execution.progress}%</div>
                        </div>
                      </div>
                      {execution.status === 'running' && (
                        <Progress value={execution.progress} className="mt-2" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {execution.outputUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alert Rules</h2>
            <Button onClick={() => setNewAlertDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </div>

          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{rule.name}</h3>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={getUrgencyColor(rule.urgency)}>
                          {rule.urgency}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{rule.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Condition:</span>
                          <div className="text-muted-foreground">
                            {rule.metric} {rule.operator} {rule.threshold}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Recipients:</span>
                          <div className="text-muted-foreground">
                            {rule.notifications.email.length} emails
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Last Triggered:</span>
                          <div className="text-muted-foreground">
                            {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testAlert(rule.id)}
                      >
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteAlertRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Archives Tab */}
        <TabsContent value="archives" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search archives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filters.format} onValueChange={(value) => applyFilters({ format: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {selectedItems.length > 0 && (
                <Button variant="outline" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedItems.length})
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredArchives.map((archive) => (
                  <div key={archive.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedItems.includes(archive.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, archive.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== archive.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{archive.templateName}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span>Generated:</span>
                            <div>{new Date(archive.generatedAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span>Format:</span>
                            <div className="uppercase">{archive.format}</div>
                          </div>
                          <div>
                            <span>Size:</span>
                            <div>{formatFileSize(archive.fileSize)}</div>
                          </div>
                          <div>
                            <span>Downloads:</span>
                            <div>{archive.downloadCount}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          {archive.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadArchive(archive.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteArchive(archive.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Template Dialog */}
      <Dialog open={newTemplateDialog} onOpenChange={setNewTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new report template with customizable widgets and layout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                placeholder="Enter template name..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={templateForm.description}
                onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                placeholder="Describe the template purpose..."
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={templateForm.category} onValueChange={(value: any) => setTemplateForm({...templateForm, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Layout</Label>
              <Select value={templateForm.layout} onValueChange={(value: any) => setTemplateForm({...templateForm, layout: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!templateForm.name}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog open={newScheduleDialog} onOpenChange={setNewScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automated report generation and delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template</Label>
              <Select value={scheduleForm.templateId} onValueChange={(value) => setScheduleForm({...scheduleForm, templateId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule Name</Label>
              <Input
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm({...scheduleForm, name: e.target.value})}
                placeholder="Enter schedule name..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                placeholder="Describe the scheduled report..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select value={scheduleForm.frequency} onValueChange={(value: any) => setScheduleForm({...scheduleForm, frequency: value})}>
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
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select value={scheduleForm.timezone} onValueChange={(value) => setScheduleForm({...scheduleForm, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={!scheduleForm.name || !scheduleForm.templateId}>
                Create Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Alert Dialog */}
      <Dialog open={newAlertDialog} onOpenChange={setNewAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
            <DialogDescription>
              Set up automated alerts based on performance metrics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Alert Name</Label>
              <Input
                value={alertForm.name}
                onChange={(e) => setAlertForm({...alertForm, name: e.target.value})}
                placeholder="Enter alert name..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={alertForm.description}
                onChange={(e) => setAlertForm({...alertForm, description: e.target.value})}
                placeholder="Describe when this alert should trigger..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Metric</Label>
                <Select value={alertForm.metric} onValueChange={(value) => setAlertForm({...alertForm, metric: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Daily Revenue</SelectItem>
                    <SelectItem value="attendance">Attendance Rate</SelectItem>
                    <SelectItem value="satisfaction">Customer Satisfaction</SelectItem>
                    <SelectItem value="conversion">Conversion Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operator</Label>
                <Select value={alertForm.operator} onValueChange={(value: any) => setAlertForm({...alertForm, operator: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<">Less than</SelectItem>
                    <SelectItem value=">">Greater than</SelectItem>
                    <SelectItem value="=">Equal to</SelectItem>
                    <SelectItem value="!=">Not equal to</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Threshold</Label>
                <Input
                  type="number"
                  value={alertForm.threshold}
                  onChange={(e) => setAlertForm({...alertForm, threshold: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Urgency</Label>
                <Select value={alertForm.urgency} onValueChange={(value: any) => setAlertForm({...alertForm, urgency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Suppress Duration (minutes)</Label>
                <Input
                  type="number"
                  value={alertForm.suppressDuration}
                  onChange={(e) => setAlertForm({...alertForm, suppressDuration: Number(e.target.value)})}
                  placeholder="60"
                />
              </div>
            </div>
            <div>
              <Label>Email Recipients</Label>
              <Input
                value={alertForm.emails}
                onChange={(e) => setAlertForm({...alertForm, emails: e.target.value})}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewAlertDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlert} disabled={!alertForm.name}>
                Create Alert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}