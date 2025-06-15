// Automated Reports Service
// Provides scheduled report generation, email delivery, and stakeholder distribution

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'financial' | 'attendance' | 'marketing' | 'custom';
  
  // Template Configuration
  widgets: ReportWidget[];
  layout: 'standard' | 'executive' | 'detailed' | 'summary';
  format: 'PDF' | 'Excel' | 'PowerPoint' | 'HTML';
  
  // Data Sources
  dataSources: {
    events: string[]; // event IDs
    dateRange: {
      type: 'last_week' | 'last_month' | 'last_quarter' | 'custom';
      startDate?: string;
      endDate?: string;
    };
    includeComparisons: boolean;
    includeBenchmarks: boolean;
  };
  
  // Styling
  branding: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ReportWidget {
  id: string;
  type: 'kpi_card' | 'chart' | 'table' | 'text' | 'image' | 'comparison';
  title: string;
  description?: string;
  
  // Widget Configuration
  config: {
    dataSource: string;
    metrics: string[];
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    timeframe?: string;
    filters?: Record<string, any>;
  };
  
  // Layout
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Styling
  style: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
  };
}

export interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  
  // Scheduling
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly reports
    dayOfMonth?: number; // 1-31 for monthly reports
    timezone: string;
    enabled: boolean;
  };
  
  // Recipients
  recipients: ReportRecipient[];
  
  // Delivery Options
  delivery: {
    email: {
      subject: string;
      body: string;
      attachReport: boolean;
      includeExecutiveSummary: boolean;
    };
    dashboard: {
      postToDashboard: boolean;
      notifyUsers: boolean;
    };
    archive: {
      saveToCloud: boolean;
      retentionDays: number;
    };
  };
  
  // Status
  lastRun?: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error' | 'pending';
  
  createdAt: string;
  createdBy: string;
}

export interface ReportRecipient {
  id: string;
  type: 'user' | 'email' | 'group';
  identifier: string; // user ID, email, or group ID
  name: string;
  role: 'owner' | 'stakeholder' | 'viewer';
  
  // Customization
  customization: {
    format?: 'PDF' | 'Excel' | 'PowerPoint' | 'HTML';
    sections?: string[]; // specific sections to include
    summaryOnly?: boolean;
  };
  
  // Delivery Preferences
  preferences: {
    emailDelivery: boolean;
    dashboardNotification: boolean;
    frequency?: 'all' | 'weekly_digest' | 'monthly_digest';
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  
  // Trigger Conditions
  conditions: {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
    threshold: number;
    timeframe: 'last_hour' | 'last_day' | 'last_week' | 'last_month';
  }[];
  
  // Logic
  logic: 'AND' | 'OR'; // how to combine multiple conditions
  
  // Recipients
  recipients: string[]; // user IDs or email addresses
  
  // Notification Settings
  notification: {
    channels: ('email' | 'sms' | 'dashboard' | 'webhook')[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    suppressDuration: number; // minutes to suppress duplicate alerts
  };
  
  // Status
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
  
  createdAt: string;
  createdBy: string;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  templateId: string;
  
  // Execution Details
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  
  // Results
  output?: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    format: string;
  };
  
  // Delivery Status
  delivery: {
    email: {
      sent: boolean;
      sentAt?: string;
      recipients: number;
      failures: string[];
    };
    dashboard: {
      posted: boolean;
      postedAt?: string;
    };
    archive: {
      saved: boolean;
      savedAt?: string;
      location: string;
    };
  };
  
  // Error Information
  error?: {
    code: string;
    message: string;
    details: string;
  };
  
  // Performance Metrics
  metrics: {
    generationTime: number; // milliseconds
    fileGenerationTime: number;
    deliveryTime: number;
    totalRecipients: number;
    successfulDeliveries: number;
  };
}

export interface ReportArchive {
  id: string;
  reportId: string;
  executionId: string;
  
  // File Information
  fileName: string;
  fileSize: number;
  format: string;
  url: string;
  
  // Metadata
  generatedAt: string;
  templateUsed: string;
  dataRange: {
    startDate: string;
    endDate: string;
  };
  
  // Access Control
  accessLevel: 'public' | 'internal' | 'restricted';
  allowedRoles: string[];
  
  // Retention
  expiresAt: string;
  downloadCount: number;
  lastAccessed?: string;
}

export interface CalendarIntegration {
  reportId: string;
  
  // Calendar Details
  calendarType: 'google' | 'outlook' | 'apple' | 'ics';
  eventTitle: string;
  eventDescription: string;
  
  // Scheduling
  meetingDetails?: {
    location: string;
    attendees: string[];
    agenda: string;
    conferenceLink?: string;
  };
  
  // Automation
  autoCreateEvents: boolean;
  reminderMinutes: number[];
  includeReportLink: boolean;
  
  // Status
  enabled: boolean;
  lastSync?: string;
  syncErrors: string[];
}

export interface ReportPerformanceMetrics {
  reportId: string;
  
  // Generation Performance
  averageGenerationTime: number;
  maxGenerationTime: number;
  minGenerationTime: number;
  
  // Delivery Performance
  deliverySuccessRate: number;
  averageDeliveryTime: number;
  failureReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  
  // Usage Statistics
  totalExecutions: number;
  scheduledExecutions: number;
  manualExecutions: number;
  
  // Recipient Engagement
  openRate: number;
  downloadRate: number;
  feedbackScore: number;
  
  // Time-based Analysis
  executionsByDay: {
    date: string;
    count: number;
    successRate: number;
  }[];
  
  // Resource Usage
  storageUsed: number; // MB
  bandwidthUsed: number; // MB
  computeTime: number; // seconds
}

class AutomatedReportsService {
  
  // Report Template Management
  async createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In real implementation, save to database
    return newTemplate;
  }
  
  async updateTemplate(templateId: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    // Mock update
    const template = await this.getTemplate(templateId);
    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return updated;
  }
  
  async getTemplate(templateId: string): Promise<ReportTemplate> {
    // Mock template data
    return this.generateMockTemplate(templateId);
  }
  
  async getTemplates(userId: string): Promise<ReportTemplate[]> {
    // Mock templates list
    return [
      this.generateMockTemplate('template_1'),
      this.generateMockTemplate('template_2'),
      this.generateMockTemplate('template_3')
    ];
  }
  
  async deleteTemplate(templateId: string): Promise<void> {
    // In real implementation, delete from database
    console.log(`Template ${templateId} deleted`);
  }
  
  // Scheduled Report Management
  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>): Promise<ScheduledReport> {
    const nextRun = this.calculateNextRun(report.schedule);
    
    const newReport: ScheduledReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      nextRun
    };
    
    return newReport;
  }
  
  async updateScheduledReport(reportId: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const report = await this.getScheduledReport(reportId);
    const updated = {
      ...report,
      ...updates
    };
    
    // Recalculate next run if schedule changed
    if (updates.schedule) {
      updated.nextRun = this.calculateNextRun(updated.schedule);
    }
    
    return updated;
  }
  
  async getScheduledReport(reportId: string): Promise<ScheduledReport> {
    return this.generateMockScheduledReport(reportId);
  }
  
  async getScheduledReports(userId: string): Promise<ScheduledReport[]> {
    return [
      this.generateMockScheduledReport('report_1'),
      this.generateMockScheduledReport('report_2'),
      this.generateMockScheduledReport('report_3')
    ];
  }
  
  async deleteScheduledReport(reportId: string): Promise<void> {
    console.log(`Scheduled report ${reportId} deleted`);
  }
  
  // Report Execution
  async executeReport(reportId: string, manual = false): Promise<ReportExecution> {
    const execution: ReportExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportId,
      templateId: `template_${reportId.split('_')[1]}`,
      startTime: new Date().toISOString(),
      status: 'running',
      progress: 0,
      delivery: {
        email: {
          sent: false,
          recipients: 0,
          failures: []
        },
        dashboard: {
          posted: false
        },
        archive: {
          saved: false,
          location: ''
        }
      },
      metrics: {
        generationTime: 0,
        fileGenerationTime: 0,
        deliveryTime: 0,
        totalRecipients: 0,
        successfulDeliveries: 0
      }
    };
    
    // Simulate report generation
    await this.simulateReportGeneration(execution);
    
    return execution;
  }
  
  async getReportExecution(executionId: string): Promise<ReportExecution> {
    return this.generateMockExecution(executionId);
  }
  
  async getReportExecutions(reportId: string): Promise<ReportExecution[]> {
    return [
      this.generateMockExecution('exec_1'),
      this.generateMockExecution('exec_2'),
      this.generateMockExecution('exec_3')
    ];
  }
  
  async cancelExecution(executionId: string): Promise<void> {
    console.log(`Execution ${executionId} cancelled`);
  }
  
  // Alert Management
  async createAlert(alert: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>): Promise<AlertRule> {
    const newAlert: AlertRule = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    };
    
    return newAlert;
  }
  
  async updateAlert(alertId: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const alert = await this.getAlert(alertId);
    return { ...alert, ...updates };
  }
  
  async getAlert(alertId: string): Promise<AlertRule> {
    return this.generateMockAlert(alertId);
  }
  
  async getAlerts(userId: string): Promise<AlertRule[]> {
    return [
      this.generateMockAlert('alert_1'),
      this.generateMockAlert('alert_2'),
      this.generateMockAlert('alert_3')
    ];
  }
  
  async deleteAlert(alertId: string): Promise<void> {
    console.log(`Alert ${alertId} deleted`);
  }
  
  async checkAlerts(): Promise<{ triggeredAlerts: AlertRule[]; notifications: any[] }> {
    const alerts = await this.getAlerts('current_user');
    const triggeredAlerts: AlertRule[] = [];
    const notifications: any[] = [];
    
    // Mock alert checking logic
    for (const alert of alerts) {
      if (alert.enabled && Math.random() > 0.8) { // 20% chance of triggering
        triggeredAlerts.push(alert);
        notifications.push({
          alertId: alert.id,
          message: `Alert "${alert.name}" has been triggered`,
          urgency: alert.notification.urgency,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return { triggeredAlerts, notifications };
  }
  
  // Archive Management
  async getReportArchives(reportId?: string): Promise<ReportArchive[]> {
    return [
      this.generateMockArchive('archive_1'),
      this.generateMockArchive('archive_2'),
      this.generateMockArchive('archive_3')
    ];
  }
  
  async getArchive(archiveId: string): Promise<ReportArchive> {
    return this.generateMockArchive(archiveId);
  }
  
  async downloadArchive(archiveId: string): Promise<Blob> {
    // Mock download - in real implementation, fetch from cloud storage
    const mockData = JSON.stringify({ reportData: 'mock_report_data' });
    return new Blob([mockData], { type: 'application/json' });
  }
  
  async deleteArchive(archiveId: string): Promise<void> {
    console.log(`Archive ${archiveId} deleted`);
  }
  
  // Calendar Integration
  async createCalendarIntegration(integration: CalendarIntegration): Promise<void> {
    console.log('Calendar integration created:', integration);
  }
  
  async syncCalendar(reportId: string): Promise<void> {
    console.log(`Calendar synced for report ${reportId}`);
  }
  
  // Performance Monitoring
  async getReportPerformanceMetrics(reportId: string): Promise<ReportPerformanceMetrics> {
    return this.generateMockPerformanceMetrics(reportId);
  }
  
  async getSystemPerformanceMetrics(): Promise<{
    totalReports: number;
    activeReports: number;
    executionsToday: number;
    successRate: number;
    averageGenerationTime: number;
    storageUsed: number;
  }> {
    return {
      totalReports: 45,
      activeReports: 32,
      executionsToday: 18,
      successRate: 94.5,
      averageGenerationTime: 12.3,
      storageUsed: 1250.5
    };
  }
  
  // Export Functions
  async exportReportData(reportId: string, format: 'CSV' | 'Excel' | 'JSON'): Promise<Blob> {
    const data = {
      reportId,
      exportedAt: new Date().toISOString(),
      data: 'mock_report_data'
    };
    
    const jsonData = JSON.stringify(data, null, 2);
    
    switch (format) {
      case 'JSON':
        return new Blob([jsonData], { type: 'application/json' });
      case 'CSV':
        return new Blob(['Report ID,Exported At\n' + reportId + ',' + data.exportedAt], { type: 'text/csv' });
      case 'Excel':
        return new Blob([jsonData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      default:
        return new Blob([jsonData], { type: 'application/json' });
    }
  }
  
  // Helper Methods
  private calculateNextRun(schedule: ScheduledReport['schedule']): string {
    const now = new Date();
    const nextRun = new Date(now);
    
    switch (schedule.frequency) {
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        const daysUntilNext = (schedule.dayOfWeek! - now.getDay() + 7) % 7 || 7;
        nextRun.setDate(now.getDate() + daysUntilNext);
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        nextRun.setDate(schedule.dayOfMonth!);
        break;
      case 'quarterly':
        nextRun.setMonth(now.getMonth() + 3);
        break;
      default:
        nextRun.setDate(now.getDate() + 1);
    }
    
    // Set time
    const [hours, minutes] = schedule.time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
    
    return nextRun.toISOString();
  }
  
  private async simulateReportGeneration(execution: ReportExecution): Promise<void> {
    // Simulate progress updates
    const updateProgress = (progress: number) => {
      execution.progress = progress;
    };
    
    // Mock generation process
    updateProgress(25);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProgress(50);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProgress(75);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Complete execution
    execution.status = 'completed';
    execution.progress = 100;
    execution.endTime = new Date().toISOString();
    execution.output = {
      fileUrl: '/reports/mock_report.pdf',
      fileName: 'report_' + execution.id + '.pdf',
      fileSize: 2500000, // 2.5MB
      format: 'PDF'
    };
    
    // Update delivery status
    execution.delivery.email.sent = true;
    execution.delivery.email.sentAt = new Date().toISOString();
    execution.delivery.email.recipients = 5;
    
    execution.delivery.dashboard.posted = true;
    execution.delivery.dashboard.postedAt = new Date().toISOString();
    
    execution.delivery.archive.saved = true;
    execution.delivery.archive.savedAt = new Date().toISOString();
    execution.delivery.archive.location = '/archives/' + execution.id;
    
    // Update metrics
    execution.metrics.generationTime = 1500;
    execution.metrics.fileGenerationTime = 800;
    execution.metrics.deliveryTime = 300;
    execution.metrics.totalRecipients = 5;
    execution.metrics.successfulDeliveries = 5;
  }
  
  // Mock Data Generation
  private generateMockTemplate(templateId: string): ReportTemplate {
    const categories: ReportTemplate['category'][] = ['performance', 'financial', 'attendance', 'marketing', 'custom'];
    const layouts: ReportTemplate['layout'][] = ['standard', 'executive', 'detailed', 'summary'];
    const formats: ReportTemplate['format'][] = ['PDF', 'Excel', 'PowerPoint', 'HTML'];
    
    return {
      id: templateId,
      name: `Template ${templateId.slice(-1)}`,
      description: `Sample report template for ${categories[Math.floor(Math.random() * categories.length)]} analysis`,
      category: categories[Math.floor(Math.random() * categories.length)],
      widgets: [
        {
          id: 'widget_1',
          type: 'kpi_card',
          title: 'Total Revenue',
          config: {
            dataSource: 'events',
            metrics: ['revenue'],
            timeframe: 'last_month'
          },
          position: { x: 0, y: 0, width: 3, height: 2 },
          style: { backgroundColor: '#f8f9fa' }
        },
        {
          id: 'widget_2',
          type: 'chart',
          title: 'Sales Trend',
          config: {
            dataSource: 'events',
            metrics: ['ticket_sales'],
            chartType: 'line',
            timeframe: 'last_quarter'
          },
          position: { x: 3, y: 0, width: 6, height: 4 },
          style: { backgroundColor: '#ffffff' }
        }
      ],
      layout: layouts[Math.floor(Math.random() * layouts.length)],
      format: formats[Math.floor(Math.random() * formats.length)],
      dataSources: {
        events: ['event_1', 'event_2'],
        dateRange: {
          type: 'last_month'
        },
        includeComparisons: true,
        includeBenchmarks: false
      },
      branding: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b'
        },
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Helvetica, sans-serif'
        }
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user_123'
    };
  }
  
  private generateMockScheduledReport(reportId: string): ScheduledReport {
    const frequencies: ScheduledReport['schedule']['frequency'][] = ['daily', 'weekly', 'monthly', 'quarterly'];
    const statuses: ScheduledReport['status'][] = ['active', 'paused', 'error', 'pending'];
    
    return {
      id: reportId,
      name: `Scheduled Report ${reportId.slice(-1)}`,
      templateId: `template_${reportId.slice(-1)}`,
      schedule: {
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
        time: '09:00',
        dayOfWeek: 1, // Monday
        timezone: 'America/New_York',
        enabled: true
      },
      recipients: [
        {
          id: 'recipient_1',
          type: 'user',
          identifier: 'user_123',
          name: 'John Smith',
          role: 'owner',
          customization: {
            format: 'PDF',
            summaryOnly: false
          },
          preferences: {
            emailDelivery: true,
            dashboardNotification: true,
            frequency: 'all'
          }
        }
      ],
      delivery: {
        email: {
          subject: 'Weekly Performance Report',
          body: 'Please find attached your weekly performance report.',
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
      lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user_123'
    };
  }
  
  private generateMockExecution(executionId: string): ReportExecution {
    const statuses: ReportExecution['status'][] = ['completed', 'failed', 'running'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: executionId,
      reportId: `report_${executionId.slice(-1)}`,
      templateId: `template_${executionId.slice(-1)}`,
      startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      endTime: status !== 'running' ? new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000).toISOString() : undefined,
      status,
      progress: status === 'running' ? Math.floor(Math.random() * 100) : 100,
      output: status === 'completed' ? {
        fileUrl: `/reports/${executionId}.pdf`,
        fileName: `report_${executionId}.pdf`,
        fileSize: 1500000 + Math.random() * 2000000,
        format: 'PDF'
      } : undefined,
      delivery: {
        email: {
          sent: status === 'completed',
          sentAt: status === 'completed' ? new Date().toISOString() : undefined,
          recipients: 5,
          failures: []
        },
        dashboard: {
          posted: status === 'completed',
          postedAt: status === 'completed' ? new Date().toISOString() : undefined
        },
        archive: {
          saved: status === 'completed',
          savedAt: status === 'completed' ? new Date().toISOString() : undefined,
          location: `/archives/${executionId}`
        }
      },
      metrics: {
        generationTime: 1200 + Math.random() * 1000,
        fileGenerationTime: 800 + Math.random() * 500,
        deliveryTime: 200 + Math.random() * 300,
        totalRecipients: 5,
        successfulDeliveries: status === 'completed' ? 5 : 0
      }
    };
  }
  
  private generateMockAlert(alertId: string): AlertRule {
    const metrics = ['revenue', 'attendance', 'rating', 'conversion_rate'];
    const operators: AlertRule['conditions'][0]['operator'][] = ['greater_than', 'less_than', 'percentage_change'];
    const urgencies: AlertRule['notification']['urgency'][] = ['low', 'medium', 'high', 'critical'];
    
    return {
      id: alertId,
      name: `Alert ${alertId.slice(-1)}`,
      description: `Monitor ${metrics[Math.floor(Math.random() * metrics.length)]} performance`,
      conditions: [
        {
          metric: metrics[Math.floor(Math.random() * metrics.length)],
          operator: operators[Math.floor(Math.random() * operators.length)],
          threshold: Math.floor(Math.random() * 100),
          timeframe: 'last_day'
        }
      ],
      logic: 'AND',
      recipients: ['user_123', 'admin@example.com'],
      notification: {
        channels: ['email', 'dashboard'],
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        suppressDuration: 60
      },
      enabled: Math.random() > 0.3,
      lastTriggered: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      triggerCount: Math.floor(Math.random() * 10),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user_123'
    };
  }
  
  private generateMockArchive(archiveId: string): ReportArchive {
    const formats = ['PDF', 'Excel', 'PowerPoint'];
    const accessLevels: ReportArchive['accessLevel'][] = ['public', 'internal', 'restricted'];
    
    return {
      id: archiveId,
      reportId: `report_${archiveId.slice(-1)}`,
      executionId: `exec_${archiveId.slice(-1)}`,
      fileName: `report_${archiveId}.pdf`,
      fileSize: 1000000 + Math.random() * 3000000,
      format: formats[Math.floor(Math.random() * formats.length)],
      url: `/archives/${archiveId}`,
      generatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      templateUsed: `template_${archiveId.slice(-1)}`,
      dataRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      accessLevel: accessLevels[Math.floor(Math.random() * accessLevels.length)],
      allowedRoles: ['organizer', 'admin'],
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      downloadCount: Math.floor(Math.random() * 50),
      lastAccessed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
  }
  
  private generateMockPerformanceMetrics(reportId: string): ReportPerformanceMetrics {
    return {
      reportId,
      averageGenerationTime: 1200 + Math.random() * 800,
      maxGenerationTime: 3000 + Math.random() * 1000,
      minGenerationTime: 500 + Math.random() * 300,
      deliverySuccessRate: 90 + Math.random() * 10,
      averageDeliveryTime: 200 + Math.random() * 300,
      failureReasons: [
        { reason: 'Email delivery failed', count: 5, percentage: 2.5 },
        { reason: 'Template error', count: 3, percentage: 1.5 },
        { reason: 'Data source unavailable', count: 2, percentage: 1.0 }
      ],
      totalExecutions: 200 + Math.floor(Math.random() * 300),
      scheduledExecutions: 180 + Math.floor(Math.random() * 250),
      manualExecutions: 20 + Math.floor(Math.random() * 50),
      openRate: 70 + Math.random() * 25,
      downloadRate: 45 + Math.random() * 30,
      feedbackScore: 4.0 + Math.random() * 1.0,
      executionsByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10),
        successRate: 85 + Math.random() * 15
      })),
      storageUsed: 500 + Math.random() * 1000,
      bandwidthUsed: 200 + Math.random() * 500,
      computeTime: 300 + Math.random() * 600
    };
  }
}

export const automatedReportsService = new AutomatedReportsService(); 