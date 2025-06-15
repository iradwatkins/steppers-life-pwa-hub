import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Database, Calendar, Users, Filter, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filename?: string;
  recordCount?: number;
  createdAt: string;
  downloadUrl?: string;
}

interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange: 'all' | 'last_30_days' | 'last_90_days' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeFields: string[];
}

const defaultOptions: ExportOptions = {
  format: 'csv',
  dateRange: 'all',
  includeFields: []
};

const AdminExportPage: React.FC = () => {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      type: 'users',
      status: 'completed',
      progress: 100,
      filename: 'users_export_2024-12-19.csv',
      recordCount: 1247,
      createdAt: '2024-12-19 14:30:00',
      downloadUrl: '#'
    },
    {
      id: '2',
      type: 'events',
      status: 'processing',
      progress: 65,
      recordCount: 156,
      createdAt: '2024-12-19 15:15:00'
    }
  ]);

  const [currentExport, setCurrentExport] = useState<string | null>(null);
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);

  const exportTypes = [
    {
      id: 'users',
      name: 'User Data',
      description: 'User profiles, contact info, registration data, activity logs',
      icon: Users,
      fields: ['id', 'name', 'email', 'phone', 'registration_date', 'last_login', 'status', 'role']
    },
    {
      id: 'events',
      name: 'Event Data',
      description: 'Event details, schedules, ticket sales, attendance records',
      icon: Calendar,
      fields: ['id', 'title', 'date', 'venue', 'capacity', 'tickets_sold', 'revenue', 'organizer']
    },
    {
      id: 'financials',
      name: 'Financial Reports',
      description: 'Transaction history, revenue summaries, payment data, tax reports',
      icon: FileText,
      fields: ['transaction_id', 'amount', 'currency', 'date', 'status', 'gateway', 'fees']
    },
    {
      id: 'backup',
      name: 'System Backup',
      description: 'Complete database backup, configurations, logs',
      icon: Database,
      fields: ['all_tables', 'configurations', 'system_logs', 'user_content']
    }
  ];

  const startExport = async (type: string) => {
    if (currentExport) {
      toast.error('Another export is already in progress');
      return;
    }

    setCurrentExport(type);
    
    const newJob: ExportJob = {
      id: Date.now().toString(),
      type,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toLocaleString(),
      recordCount: Math.floor(Math.random() * 1000) + 100
    };

    setExportJobs(prev => [newJob, ...prev]);
    toast.success(`Starting ${type} export...`);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: Math.min(job.progress + Math.random() * 20, 95) }
          : job
      ));
    }, 500);

    // Complete after 3-5 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.${options.format}`;
      
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              filename,
              downloadUrl: `#download-${filename}`
            }
          : job
      ));
      
      setCurrentExport(null);
      toast.success(`${type} export completed! Click to download.`);
    }, Math.random() * 2000 + 3000);
  };

  const downloadExport = (job: ExportJob) => {
    if (!job.filename) return;
    
    // Simulate file download
    const blob = new Blob([`Mock ${job.type} export data for ${job.recordCount} records`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = job.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${job.filename}`);
  };

  const getStatusBadge = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const updateFieldSelection = (field: string, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      includeFields: checked 
        ? [...prev.includeFields, field]
        : prev.includeFields.filter(f => f !== field)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Export</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Export platform data for analysis and backup
        </p>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Format</Label>
              <Select 
                value={options.format} 
                onValueChange={(value: 'csv' | 'json' | 'xlsx') => 
                  setOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select 
                value={options.dateRange} 
                onValueChange={(value: 'all' | 'last_30_days' | 'last_90_days' | 'custom') => 
                  setOptions(prev => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {options.dateRange === 'custom' && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={options.customStartDate || ''}
                    onChange={(e) => setOptions(prev => ({ ...prev, customStartDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={options.customEndDate || ''}
                    onChange={(e) => setOptions(prev => ({ ...prev, customEndDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exportTypes.map((exportType) => (
          <Card key={exportType.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <exportType.icon className="h-5 w-5" />
                {exportType.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {exportType.description}
              </p>

              <div>
                <Label className="text-sm font-medium mb-2 block">Include Fields:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {exportType.fields.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${exportType.id}-${field}`}
                        checked={options.includeFields.includes(field)}
                        onCheckedChange={(checked) => updateFieldSelection(field, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`${exportType.id}-${field}`}
                        className="text-sm font-normal"
                      >
                        {field.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => startExport(exportType.id)}
                disabled={currentExport !== null}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {currentExport === exportType.id ? 'Exporting...' : `Export ${exportType.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{job.type.charAt(0).toUpperCase() + job.type.slice(1)} Export</h4>
                    {getStatusBadge(job.status)}
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="w-full max-w-xs">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {Math.round(job.progress)}% complete
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{job.createdAt}</span>
                    {job.recordCount && <span>{job.recordCount} records</span>}
                    {job.filename && <span>{job.filename}</span>}
                  </div>
                </div>

                {job.status === 'completed' && job.downloadUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadExport(job)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            ))}

            {exportJobs.length === 0 && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Database className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p>No export jobs yet. Start your first export above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportPage; 