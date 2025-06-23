// Automated Reports Service - E.008 Implementation
// Provides comprehensive report scheduling, generation, and delivery

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'financial' | 'marketing' | 'custom';
  widgets: ReportWidget[];
  layout: 'standard' | 'executive' | 'detailed' | 'summary';
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo?: string;
    typography: 'modern' | 'classic' | 'minimal';
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ReportWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'image' | 'comparison';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    dataSource: string;
    metrics: string[];
    filters?: Record<string, any>;
    chartType?: 'bar' | 'line' | 'pie' | 'area' | 'radar';
    timeRange?: string;
    comparison?: boolean;
  };
  styling: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: string;
  };
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  description: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6, Sunday-Saturday
    dayOfMonth?: number; // 1-31
    time: string; // HH:MM format
    timezone: string;
  };
  recipients: ReportRecipient[];
  deliveryOptions: {
    email: boolean;
    dashboard: boolean;
    archive: boolean;
  };
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecipient {
  id: string;
  email: string;
  name: string;
  role: 'organizer' | 'admin' | 'stakeholder' | 'viewer';
  preferences: {
    format: 'pdf' | 'excel' | 'html';
    summary: boolean;
    attachments: boolean;
  };
  isActive: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: '>' | '<' | '=' | '!=' | '±';
  threshold: number;
  andConditions: AlertCondition[];
  orConditions: AlertCondition[];
  notifications: {
    email: string[];
    sms: string[];
    dashboard: boolean;
    webhook?: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  suppressDuration: number; // minutes
  isActive: boolean;
  lastTriggered?: string;
}

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '=' | '!=' | '±';
  value: number;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  templateId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  progress: number;
  outputFormat: 'pdf' | 'excel' | 'csv' | 'html';
  outputUrl?: string;
  error?: string;
  metrics: {
    dataProcessingTime: number;
    renderingTime: number;
    deliveryTime: number;
    totalTime: number;
  };
}

export interface ReportArchive {
  id: string;
  reportId: string;
  templateName: string;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'csv' | 'html';
  fileSize: number;
  downloadUrl: string;
  expiresAt: string;
  downloadCount: number;
  tags: string[];
}

export interface CalendarIntegration {
  id: string;
  type: 'google' | 'outlook' | 'ical';
  isConnected: boolean;
  calendarId?: string;
  syncEnabled: boolean;
  lastSync?: string;
}

export interface ReportPerformanceMetrics {
  totalReports: number;
  activeSchedules: number;
  successRate: number;
  averageGenerationTime: number;
  alertsTriggered: number;
  storageUsed: number;
  deliverySuccess: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

class AutomatedReportsService {
  private mockTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Executive Summary',
      description: 'High-level performance overview for executives',
      category: 'executive',
      layout: 'executive',
      widgets: [
        {
          id: 'w1',
          type: 'kpi',
          title: 'Total Revenue',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { dataSource: 'events', metrics: ['totalRevenue'] },
          styling: { backgroundColor: '#f8f9fa' }
        },
        {
          id: 'w2',
          type: 'chart',
          title: 'Revenue Trend',
          position: { x: 3, y: 0, w: 6, h: 4 },
          config: { dataSource: 'events', metrics: ['revenue'], chartType: 'line', timeRange: '3months' },
          styling: {}
        }
      ],
      branding: {
        colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6' },
        typography: 'modern'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-06-15T14:30:00Z',
      isActive: true
    },
    {
      id: '2',
      name: 'Financial Dashboard',
      description: 'Detailed financial performance and analytics',
      category: 'financial',
      layout: 'detailed',
      widgets: [
        {
          id: 'w3',
          type: 'table',
          title: 'Revenue Breakdown',
          position: { x: 0, y: 0, w: 12, h: 6 },
          config: { dataSource: 'financial', metrics: ['revenue', 'costs', 'profit'] },
          styling: {}
        }
      ],
      branding: {
        colors: { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
        typography: 'classic'
      },
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-06-10T16:45:00Z',
      isActive: true
    }
  ];

  private mockScheduledReports: ScheduledReport[] = [
    {
      id: 'sr1',
      templateId: '1',
      name: 'Weekly Executive Report',
      description: 'Weekly summary for leadership team',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1, // Monday
        time: '09:00',
        timezone: 'America/New_York'
      },
      recipients: [
        {
          id: 'r1',
          email: 'ceo@company.com',
          name: 'CEO',
          role: 'admin',
          preferences: { format: 'pdf', summary: true, attachments: false },
          isActive: true
        }
      ],
      deliveryOptions: { email: true, dashboard: true, archive: true },
      isActive: true,
      lastRun: '2024-06-17T09:00:00Z',
      nextRun: '2024-06-24T09:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-06-15T14:30:00Z'
    }
  ];

  private mockAlertRules: AlertRule[] = [
    {
      id: 'ar1',
      name: 'Low Revenue Alert',
      description: 'Triggers when daily revenue drops below threshold',
      metric: 'dailyRevenue',
      operator: '<',
      threshold: 1000,
      andConditions: [],
      orConditions: [],
      notifications: {
        email: ['organizer@company.com'],
        sms: ['+1234567890'],
        dashboard: true
      },
      urgency: 'high',
      suppressDuration: 60,
      isActive: true,
      lastTriggered: '2024-06-15T14:30:00Z'
    }
  ];

  private mockExecutions: ReportExecution[] = [
    {
      id: 'ex1',
      reportId: 'sr1',
      templateId: '1',
      status: 'completed',
      startedAt: '2024-06-17T09:00:00Z',
      completedAt: '2024-06-17T09:02:15Z',
      progress: 100,
      outputFormat: 'pdf',
      outputUrl: '/downloads/executive-report-2024-06-17.pdf',
      metrics: {
        dataProcessingTime: 45,
        renderingTime: 78,
        deliveryTime: 12,
        totalTime: 135
      }
    }
  ];

  private mockArchives: ReportArchive[] = [
    {
      id: 'arch1',
      reportId: 'sr1',
      templateName: 'Executive Summary',
      generatedAt: '2024-06-17T09:00:00Z',
      format: 'pdf',
      fileSize: 2457600, // 2.4MB in bytes
      downloadUrl: '/downloads/executive-report-2024-06-17.pdf',
      expiresAt: '2024-12-17T09:00:00Z',
      downloadCount: 3,
      tags: ['executive', 'weekly', 'performance']
    }
  ];

  async getTemplates(): Promise<ReportTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockTemplates];
  }

  async getTemplate(id: string): Promise<ReportTemplate | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockTemplates.find(t => t.id === id) || null;
  }

  async createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTemplate: ReportTemplate = {
      ...template,
      id: `tmpl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockTemplates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.mockTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    this.mockTemplates[index] = {
      ...this.mockTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.mockTemplates[index];
  }

  async deleteTemplate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.mockTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    this.mockTemplates.splice(index, 1);
  }

  async getScheduledReports(): Promise<ScheduledReport[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.mockScheduledReports];
  }

  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<ScheduledReport> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const nextRun = this.calculateNextRun(report.schedule);
    const newReport: ScheduledReport = {
      ...report,
      id: `sched_${Date.now()}`,
      nextRun,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockScheduledReports.push(newReport);
    return newReport;
  }

  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.mockScheduledReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Scheduled report not found');
    
    const updatedReport = {
      ...this.mockScheduledReports[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    if (updates.schedule) {
      updatedReport.nextRun = this.calculateNextRun(updatedReport.schedule);
    }
    
    this.mockScheduledReports[index] = updatedReport;
    return updatedReport;
  }

  async deleteScheduledReport(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.mockScheduledReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Scheduled report not found');
    
    this.mockScheduledReports.splice(index, 1);
  }

  async getAlertRules(): Promise<AlertRule[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockAlertRules];
  }

  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newRule: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}`
    };
    
    this.mockAlertRules.push(newRule);
    return newRule;
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.mockAlertRules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Alert rule not found');
    
    this.mockAlertRules[index] = { ...this.mockAlertRules[index], ...updates };
    return this.mockAlertRules[index];
  }

  async deleteAlertRule(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.mockAlertRules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Alert rule not found');
    
    this.mockAlertRules.splice(index, 1);
  }

  async getReportExecutions(reportId?: string): Promise<ReportExecution[]> {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    if (reportId) {
      return this.mockExecutions.filter(e => e.reportId === reportId);
    }
    
    return [...this.mockExecutions];
  }

  async generateReport(templateId: string, format: 'pdf' | 'excel' | 'csv' | 'html' = 'pdf'): Promise<ReportExecution> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const execution: ReportExecution = {
      id: `exec_${Date.now()}`,
      reportId: 'manual',
      templateId,
      status: 'completed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      progress: 100,
      outputFormat: format,
      outputUrl: `/downloads/report-${templateId}-${Date.now()}.${format}`,
      metrics: {
        dataProcessingTime: Math.floor(Math.random() * 100) + 50,
        renderingTime: Math.floor(Math.random() * 150) + 75,
        deliveryTime: Math.floor(Math.random() * 50) + 10,
        totalTime: 0
      }
    };
    
    execution.metrics.totalTime = execution.metrics.dataProcessingTime + 
                                  execution.metrics.renderingTime + 
                                  execution.metrics.deliveryTime;
    
    this.mockExecutions.push(execution);
    return execution;
  }

  async getReportArchives(filters?: { dateRange?: { start: string; end: string }; format?: string }): Promise<ReportArchive[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let archives = [...this.mockArchives];
    
    if (filters?.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      archives = archives.filter(archive => {
        const archiveDate = new Date(archive.generatedAt);
        return archiveDate >= start && archiveDate <= end;
      });
    }
    
    if (filters?.format) {
      archives = archives.filter(archive => archive.format === filters.format);
    }
    
    return archives;
  }

  async downloadArchive(archiveId: string): Promise<{ url: string; filename: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const archive = this.mockArchives.find(a => a.id === archiveId);
    if (!archive) throw new Error('Archive not found');
    
    // Increment download count
    archive.downloadCount += 1;
    
    return {
      url: archive.downloadUrl,
      filename: `${archive.templateName}-${archive.generatedAt.split('T')[0]}.${archive.format}`
    };
  }

  async deleteArchive(archiveId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const index = this.mockArchives.findIndex(a => a.id === archiveId);
    if (index === -1) throw new Error('Archive not found');
    
    this.mockArchives.splice(index, 1);
  }

  async getPerformanceMetrics(): Promise<ReportPerformanceMetrics> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalReports = this.mockScheduledReports.length;
    const activeSchedules = this.mockScheduledReports.filter(r => r.isActive).length;
    const completedExecutions = this.mockExecutions.filter(e => e.status === 'completed').length;
    const totalExecutions = this.mockExecutions.length;
    
    return {
      totalReports,
      activeSchedules,
      successRate: totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 100,
      averageGenerationTime: 125, // seconds
      alertsTriggered: 3,
      storageUsed: 15.6, // GB
      deliverySuccess: 98.5, // percentage
      systemHealth: 'excellent'
    };
  }

  async testAlert(ruleId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const rule = this.mockAlertRules.find(r => r.id === ruleId);
    if (!rule) throw new Error('Alert rule not found');
    
    return {
      success: true,
      message: `Test alert sent successfully to ${rule.notifications.email.length} recipients`
    };
  }

  async getCalendarIntegrations(): Promise<CalendarIntegration[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: 'cal1',
        type: 'google',
        isConnected: true,
        calendarId: 'primary',
        syncEnabled: true,
        lastSync: '2024-06-17T12:00:00Z'
      },
      {
        id: 'cal2',
        type: 'outlook',
        isConnected: false,
        syncEnabled: false
      }
    ];
  }

  async connectCalendar(type: 'google' | 'outlook' | 'ical'): Promise<CalendarIntegration> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `cal_${Date.now()}`,
      type,
      isConnected: true,
      calendarId: 'primary',
      syncEnabled: true,
      lastSync: new Date().toISOString()
    };
  }

  async exportReport(reportId: string, format: 'csv' | 'excel' | 'pdf'): Promise<{ 
    data: any; 
    filename: string; 
    mimeType: string 
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const report = this.mockScheduledReports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${format}`;
    
    let mimeType: string;
    switch (format) {
      case 'csv':
        mimeType = 'text/csv';
        break;
      case 'excel':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error('Unsupported format');
    }
    
    return {
      data: { reportId, format, generatedAt: new Date().toISOString() },
      filename,
      mimeType
    };
  }

  private calculateNextRun(schedule: ScheduledReport['schedule']): string {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, move to next occurrence
    if (nextRun <= now) {
      switch (schedule.frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          const currentDay = nextRun.getDay();
          const targetDay = schedule.dayOfWeek || 1;
          const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;
          nextRun.setDate(nextRun.getDate() + daysToAdd);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(schedule.dayOfMonth || 1);
          break;
        case 'quarterly':
          nextRun.setMonth(nextRun.getMonth() + 3);
          nextRun.setDate(schedule.dayOfMonth || 1);
          break;
      }
    }
    
    return nextRun.toISOString();
  }

  async bulkDeleteArchives(archiveIds: string[]): Promise<{ 
    deleted: number; 
    failed: string[] 
  }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let deleted = 0;
    const failed: string[] = [];
    
    for (const id of archiveIds) {
      try {
        await this.deleteArchive(id);
        deleted++;
      } catch (error) {
        failed.push(id);
      }
    }
    
    return { deleted, failed };
  }

  async validateTemplate(template: Partial<ReportTemplate>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!template.name) errors.push('Template name is required');
    if (!template.widgets || template.widgets.length === 0) {
      errors.push('At least one widget is required');
    }
    
    if (template.widgets) {
      template.widgets.forEach((widget, index) => {
        if (!widget.type) errors.push(`Widget ${index + 1}: Type is required`);
        if (!widget.title) warnings.push(`Widget ${index + 1}: Title is recommended`);
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const automatedReportsService = new AutomatedReportsService();