import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Clock, 
  Play, 
  Pause, 
  Download, 
  Bell, 
  Archive, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  BarChart3,
  FileSpreadsheet,
  FilePlus,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useAutomatedReports } from '../../hooks/useAutomatedReports';
import { ReportTemplate, ScheduledReport, AlertRule, ReportExecution } from '../../services/automatedReportsService';
import { TemplateBuilder } from '../../components/reports/TemplateBuilder';
import { ReportScheduler } from '../../components/reports/ReportScheduler';
import { AlertConfiguration } from '../../components/reports/AlertConfiguration';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

const AutomatedReportsPage: React.FC = () => {
  const {
    state,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    duplicateTemplate,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    selectReport,
    pauseReport,
    resumeReport,
    executeReport,
    cancelExecution,
    retryExecution,
    createAlert,
    updateAlert,
    deleteAlert,
    enableAlert,
    disableAlert,
    acknowledgeAlert,
    downloadArchive,
    deleteArchive,
    exportReportData,
    exportTemplates,
    exportScheduledReports,
    refreshData,
    toggleAutoRefresh,
    updateFilters,
    updateSearchTerm,
    resetFilters,
    filteredTemplates,
    filteredReports,
    filteredExecutions,
    filteredAlerts,
    filteredArchives,
    executionStats,
    alertStats,
    hasRunningExecutions,
    nextScheduledRun
  } = useAutomatedReports();

  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showReportScheduler, setShowReportScheduler] = useState(false);
  const [showAlertConfiguration, setShowAlertConfiguration] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);

  const handleExport = async (type: 'templates' | 'reports', format: 'JSON' | 'CSV') => {
    if (type === 'templates') {
      await exportTemplates(format);
    } else {
      await exportScheduledReports(format);
    }
  };

  // Template Builder handlers
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateBuilder(true);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setShowTemplateBuilder(true);
  };

  const handleSaveTemplate = async (templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowTemplateBuilder(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Report Scheduler handlers
  const handleCreateScheduledReport = () => {
    setEditingReport(null);
    setShowReportScheduler(true);
  };

  const handleEditScheduledReport = (report: ScheduledReport) => {
    setEditingReport(report);
    setShowReportScheduler(true);
  };

  const handleSaveScheduledReport = async (reportData: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>) => {
    try {
      if (editingReport) {
        await updateScheduledReport(editingReport.id, reportData);
      } else {
        await createScheduledReport(reportData);
      }
      setShowReportScheduler(false);
      setEditingReport(null);
    } catch (error) {
      console.error('Error saving scheduled report:', error);
    }
  };

  // Alert Configuration handlers
  const handleCreateAlert = () => {
    setEditingAlert(null);
    setShowAlertConfiguration(true);
  };

  const handleEditAlert = (alert: AlertRule) => {
    setEditingAlert(alert);
    setShowAlertConfiguration(true);
  };

  const handleSaveAlert = async (alertData: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>) => {
    try {
      if (editingAlert) {
        await updateAlert(editingAlert.id, alertData);
      } else {
        await createAlert(alertData);
      }
      setShowAlertConfiguration(false);
      setEditingAlert(null);
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  };

  // Show modals/components
  if (showTemplateBuilder) {
    return (
      <TemplateBuilder
        template={editingTemplate || undefined}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setShowTemplateBuilder(false);
          setEditingTemplate(null);
        }}
        isEditing={!!editingTemplate}
      />
    );
  }

  if (showReportScheduler) {
    return (
      <ReportScheduler
        templates={state.templates}
        scheduledReport={editingReport || undefined}
        onSave={handleSaveScheduledReport}
        onCancel={() => {
          setShowReportScheduler(false);
          setEditingReport(null);
        }}
        isEditing={!!editingReport}
      />
    );
  }

  if (showAlertConfiguration) {
    return (
      <AlertConfiguration
        alert={editingAlert || undefined}
        onSave={handleSaveAlert}
        onCancel={() => {
          setShowAlertConfiguration(false);
          setEditingAlert(null);
        }}
        isEditing={!!editingAlert}
      />
    );
  }

  const getStatusBadge = (status: string, type: 'report' | 'execution' | 'alert' = 'report') => {
    const variants: Record<string, { variant: any; color: string }> = {
      // Report statuses
      active: { variant: 'default', color: 'text-green-600' },
      paused: { variant: 'secondary', color: 'text-yellow-600' },
      error: { variant: 'destructive', color: 'text-red-600' },
      pending: { variant: 'outline', color: 'text-blue-600' },
      
      // Execution statuses
      running: { variant: 'default', color: 'text-blue-600' },
      completed: { variant: 'default', color: 'text-green-600' },
      failed: { variant: 'destructive', color: 'text-red-600' },
      cancelled: { variant: 'secondary', color: 'text-gray-600' },
      
      // Alert statuses
      enabled: { variant: 'default', color: 'text-green-600' },
      disabled: { variant: 'secondary', color: 'text-gray-600' }
    };

    const config = variants[status] || { variant: 'outline', color: 'text-gray-600' };
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automated Reports</h1>
          <p className="text-gray-600 mt-2">
            Schedule, generate, and manage automated reports with custom templates and delivery options
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={state.loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", state.loading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button onClick={handleCreateScheduledReport} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>{state.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Filters & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search reports, templates..."
                  value={state.searchTerm}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="templateCategory">Template Category</Label>
                <Select 
                  value={state.filters.templateCategory} 
                  onValueChange={(value) => updateFilters({ templateCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reportStatus">Report Status</Label>
                <Select 
                  value={state.filters.reportStatus} 
                  onValueChange={(value) => updateFilters({ reportStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoRefresh"
                  checked={state.autoRefresh}
                  onCheckedChange={toggleAutoRefresh}
                />
                <Label htmlFor="autoRefresh">Auto Refresh</Label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{state.systemMetrics?.totalReports || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            {state.systemMetrics && (
              <div className="mt-2 text-xs text-gray-500">
                {state.systemMetrics.activeReports} active
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Executions Today</p>
                <p className="text-2xl font-bold">{state.systemMetrics?.executionsToday || 0}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
            {hasRunningExecutions && (
              <div className="mt-2 text-xs text-orange-600">
                {state.runningExecutions.length} running
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{state.systemMetrics?.successRate.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress value={state.systemMetrics?.successRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{alertStats.active}</p>
              </div>
              <Bell className={cn("h-8 w-8", alertStats.triggered > 0 ? "text-red-600" : "text-gray-600")} />
            </div>
            {alertStats.triggered > 0 && (
              <div className="mt-2 text-xs text-red-600">
                {alertStats.triggered} triggered
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Scheduled Run Alert */}
      {nextScheduledRun && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800">
                Next scheduled report: <strong>{nextScheduledRun.name}</strong> 
                {' '}at {formatDate(nextScheduledRun.nextRun)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triggered Alerts */}
      {state.triggeredAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Triggered Alerts ({state.triggeredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.triggeredAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-white">
                <div>
                  <div className="font-medium text-red-900">{alert.name}</div>
                  <div className="text-sm text-red-700">{alert.description}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredExecutions.slice(0, 5).map(execution => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Report {execution.reportId.slice(-4)}</div>
                      <div className="text-sm text-gray-500">{formatDate(execution.startTime)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {execution.status === 'running' && (
                        <Progress value={execution.progress} className="w-16 h-2" />
                      )}
                      {getStatusBadge(execution.status, 'execution')}
                    </div>
                  </div>
                ))}
                {filteredExecutions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No executions found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredReports.filter(r => r.status === 'active').slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500">
                        {report.schedule.frequency} • Next: {formatDate(report.nextRun)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeReport(report.id, true)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredReports.filter(r => r.status === 'active').length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No active scheduled reports
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Execution Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{executionStats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{executionStats.running}</div>
                  <div className="text-sm text-gray-600">Running</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{executionStats.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{executionStats.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Templates ({filteredTemplates.length})
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport('templates', 'CSV')}
                    disabled={state.exportLoading}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button size="sm" onClick={handleCreateTemplate}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Template
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant="secondary">{template.format}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        Created {formatDate(template.createdAt)} • Updated {formatDate(template.updatedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => selectTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => duplicateTemplate(template.id, `${template.name} (Copy)`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No templates found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduled Reports ({filteredReports.length})
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport('reports', 'CSV')}
                    disabled={state.exportLoading}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button size="sm" onClick={handleCreateScheduledReport}>
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule Report
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredReports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{report.name}</h3>
                        {getStatusBadge(report.status)}
                        <Badge variant="outline">{report.schedule.frequency}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Next run: {formatDate(report.nextRun)}
                        {report.lastRun && ` • Last run: ${formatDate(report.lastRun)}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {report.recipients.length} recipients • Template: {report.templateId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeReport(report.id, true)}
                        disabled={state.executionsLoading}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      {report.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseReport(report.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeReport(report.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditScheduledReport(report)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteScheduledReport(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredReports.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No scheduled reports found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Report Executions ({filteredExecutions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredExecutions.map(execution => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Report {execution.reportId.slice(-4)}</h3>
                        {getStatusBadge(execution.status, 'execution')}
                        {execution.status === 'running' && (
                          <span className="text-sm text-blue-600">{execution.progress}%</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Started: {formatDate(execution.startTime)}
                        {execution.endTime && ` • Completed: ${formatDate(execution.endTime)}`}
                      </div>
                      {execution.output && (
                        <div className="text-xs text-gray-500 mt-1">
                          {execution.output.fileName} • {formatFileSize(execution.output.fileSize)}
                        </div>
                      )}
                      {execution.error && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {execution.error.message}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {execution.status === 'running' && (
                        <>
                          <Progress value={execution.progress} className="w-16 h-2" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelExecution(execution.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {execution.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryExecution(execution.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {execution.output && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(execution.output!.fileUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredExecutions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No executions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Rules ({filteredAlerts.length})
                </span>
                <Button size="sm" onClick={handleCreateAlert}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Alert
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{alert.name}</h3>
                        {getStatusBadge(alert.enabled ? 'enabled' : 'disabled', 'alert')}
                        <Badge variant={alert.notification.urgency === 'critical' ? 'destructive' : 'outline'}>
                          {alert.notification.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        Triggered {alert.triggerCount} times
                        {alert.lastTriggered && ` • Last: ${formatDate(alert.lastTriggered)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={(enabled) => enabled ? enableAlert(alert.id) : disableAlert(alert.id)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditAlert(alert)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAlerts.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No alert rules found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archives Tab */}
        <TabsContent value="archives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Report Archives ({filteredArchives.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredArchives.map(archive => (
                  <div key={archive.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{archive.fileName}</h3>
                        <Badge variant="outline">{archive.format}</Badge>
                        <Badge variant="secondary">{archive.accessLevel}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Generated: {formatDate(archive.generatedAt)} • 
                        Size: {formatFileSize(archive.fileSize)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Downloaded {archive.downloadCount} times
                        {archive.lastAccessed && ` • Last accessed: ${formatDate(archive.lastAccessed)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadArchive(archive.id)}
                        disabled={state.exportLoading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteArchive(archive.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredArchives.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No archived reports found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedReportsPage; 