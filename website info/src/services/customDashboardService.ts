export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'text' | 'metric';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    dataSource: string;
    metrics: string[];
    filters?: Record<string, any>;
    formula?: string;
    customCSS?: string;
    refreshRate?: number; // minutes
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  permissions: {
    viewRoles: string[];
    editRoles: string[];
  };
  created: Date;
  lastModified: Date;
  createdBy: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  eventIds: string[]; // Empty array means all events
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    gridSize: number;
    backgroundColor: string;
    headerColor: string;
    accentColor: string;
  };
  permissions: {
    public: boolean;
    allowedRoles: string[];
    allowedUsers: string[];
  };
  settings: {
    autoRefresh: boolean;
    refreshInterval: number; // minutes
    timezone: string;
    dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    customDateRange?: {
      start: Date;
      end: Date;
    };
  };
  template?: {
    isTemplate: boolean;
    templateName?: string;
    category?: string;
    description?: string;
    tags?: string[];
  };
  version: {
    current: number;
    history: DashboardVersion[];
  };
  created: Date;
  lastModified: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface DashboardVersion {
  version: number;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: CustomDashboard['layout'];
  created: Date;
  createdBy: string;
  isBackup: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'event' | 'sales' | 'marketing' | 'financial' | 'operational' | 'custom';
  tags: string[];
  thumbnail: string;
  widgets: Omit<DashboardWidget, 'id'>[];
  layout: CustomDashboard['layout'];
  defaultSettings: CustomDashboard['settings'];
  usageCount: number;
  rating: number;
  reviews: number;
  created: Date;
  createdBy: string;
  isOfficial: boolean;
}

export interface WidgetType {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'visualization' | 'metrics' | 'content' | 'data';
  defaultSize: {
    width: number;
    height: number;
  };
  configSchema: any; // JSON schema for widget configuration
  supportedDataSources: string[];
  requiredPermissions: string[];
}

export interface DataSource {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'api' | 'custom';
  description: string;
  endpoint?: string;
  authentication?: {
    type: 'none' | 'apikey' | 'oauth' | 'basic';
    config: Record<string, any>;
  };
  fields: DataField[];
  refreshRate: number; // minutes
  lastRefresh?: Date;
  status: 'active' | 'inactive' | 'error' | 'pending';
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: string;
  aggregatable: boolean;
  filterable: boolean;
  sortable: boolean;
  format?: string;
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  variables: {
    [key: string]: {
      dataSource: string;
      field: string;
      aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    };
  };
  unit: string;
  format: string;
  organizerId: string;
  created: Date;
  lastModified: Date;
}

export interface DashboardAnalytics {
  dashboardId: string;
  views: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  widgets: {
    mostUsed: { widgetType: string; count: number }[];
    loadTimes: { widgetId: string; avgLoadTime: number }[];
    errors: { widgetId: string; errorCount: number; lastError: string }[];
  };
  performance: {
    averageLoadTime: number;
    refreshFrequency: number;
    errorRate: number;
  };
  lastUpdated: Date;
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg' | 'excel' | 'json';
  includeData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  widgets?: string[]; // Widget IDs to include
  settings: {
    resolution?: string; // For image exports
    orientation?: 'portrait' | 'landscape'; // For PDF
    includeFilters?: boolean;
    includeTimestamp?: boolean;
  };
}

// Mock data for development
const mockTemplates: DashboardTemplate[] = [
  {
    id: 'template-1',
    name: 'Event Performance Overview',
    description: 'Comprehensive view of event ticket sales, revenue, and attendee engagement',
    category: 'event',
    tags: ['sales', 'revenue', 'attendance', 'overview'],
    thumbnail: '/images/templates/event-overview.png',
    widgets: [
      {
        type: 'kpi',
        title: 'Tickets Sold',
        position: { x: 0, y: 0, width: 3, height: 2 },
        config: {
          dataSource: 'event-data',
          metrics: ['tickets_sold', 'total_capacity'],
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
        },
        permissions: { viewRoles: ['organizer', 'sales_agent'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      },
      {
        type: 'chart',
        title: 'Sales Trend',
        position: { x: 3, y: 0, width: 6, height: 4 },
        config: {
          chartType: 'line',
          dataSource: 'sales-data',
          metrics: ['daily_sales', 'cumulative_sales'],
          backgroundColor: '#ffffff',
          textColor: '#374151',
        },
        permissions: { viewRoles: ['organizer', 'sales_agent'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      },
      {
        type: 'chart',
        title: 'Revenue Breakdown',
        position: { x: 9, y: 0, width: 3, height: 4 },
        config: {
          chartType: 'pie',
          dataSource: 'revenue-data',
          metrics: ['ticket_revenue', 'fees', 'commissions'],
          backgroundColor: '#fefefe',
          textColor: '#111827',
        },
        permissions: { viewRoles: ['organizer'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      }
    ],
    layout: {
      columns: 12,
      gridSize: 20,
      backgroundColor: '#f9fafb',
      headerColor: '#1f2937',
      accentColor: '#3b82f6'
    },
    defaultSettings: {
      autoRefresh: true,
      refreshInterval: 5,
      timezone: 'America/New_York',
      dateRange: 'month'
    },
    usageCount: 145,
    rating: 4.7,
    reviews: 23,
    created: new Date('2024-01-01'),
    createdBy: 'SteppersLife Team',
    isOfficial: true
  },
  {
    id: 'template-2',
    name: 'Sales Agent Performance',
    description: 'Track individual and team sales performance with commissions and targets',
    category: 'sales',
    tags: ['sales', 'agents', 'commissions', 'performance'],
    thumbnail: '/images/templates/sales-performance.png',
    widgets: [
      {
        type: 'table',
        title: 'Top Performers',
        position: { x: 0, y: 0, width: 6, height: 4 },
        config: {
          dataSource: 'sales-agent-data',
          metrics: ['agent_name', 'tickets_sold', 'revenue', 'commission'],
          backgroundColor: '#ffffff',
          textColor: '#374151',
        },
        permissions: { viewRoles: ['organizer', 'sales_manager'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      },
      {
        type: 'chart',
        title: 'Commission Tracking',
        position: { x: 6, y: 0, width: 6, height: 4 },
        config: {
          chartType: 'bar',
          dataSource: 'commission-data',
          metrics: ['pending_commission', 'paid_commission'],
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
        },
        permissions: { viewRoles: ['organizer', 'sales_agent'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      }
    ],
    layout: {
      columns: 12,
      gridSize: 20,
      backgroundColor: '#ffffff',
      headerColor: '#059669',
      accentColor: '#10b981'
    },
    defaultSettings: {
      autoRefresh: true,
      refreshInterval: 10,
      timezone: 'America/New_York',
      dateRange: 'week'
    },
    usageCount: 89,
    rating: 4.5,
    reviews: 12,
    created: new Date('2024-01-15'),
    createdBy: 'SteppersLife Team',
    isOfficial: true
  },
  {
    id: 'template-3',
    name: 'Marketing Campaign Analytics',
    description: 'Monitor marketing performance across channels with ROI and engagement metrics',
    category: 'marketing',
    tags: ['marketing', 'campaigns', 'roi', 'engagement'],
    thumbnail: '/images/templates/marketing-analytics.png',
    widgets: [
      {
        type: 'kpi',
        title: 'Campaign ROI',
        position: { x: 0, y: 0, width: 3, height: 2 },
        config: {
          dataSource: 'marketing-data',
          metrics: ['total_roi'],
          backgroundColor: '#ecfdf5',
          textColor: '#065f46',
        },
        permissions: { viewRoles: ['organizer', 'marketing_manager'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      },
      {
        type: 'chart',
        title: 'Channel Performance',
        position: { x: 3, y: 0, width: 9, height: 4 },
        config: {
          chartType: 'area',
          dataSource: 'channel-data',
          metrics: ['email_conversions', 'social_conversions', 'paid_conversions'],
          backgroundColor: '#ffffff',
          textColor: '#374151',
        },
        permissions: { viewRoles: ['organizer', 'marketing_manager'], editRoles: ['organizer'] },
        created: new Date(),
        lastModified: new Date(),
        createdBy: 'system'
      }
    ],
    layout: {
      columns: 12,
      gridSize: 20,
      backgroundColor: '#fef7ff',
      headerColor: '#7c3aed',
      accentColor: '#a855f7'
    },
    defaultSettings: {
      autoRefresh: true,
      refreshInterval: 15,
      timezone: 'America/New_York',
      dateRange: 'month'
    },
    usageCount: 67,
    rating: 4.3,
    reviews: 8,
    created: new Date('2024-02-01'),
    createdBy: 'SteppersLife Team',
    isOfficial: true
  }
];

const mockWidgetTypes: WidgetType[] = [
  {
    type: 'kpi',
    name: 'KPI Card',
    description: 'Display key performance indicators with trend arrows',
    icon: 'target',
    category: 'metrics',
    defaultSize: { width: 3, height: 2 },
    configSchema: {
      properties: {
        metric: { type: 'string', required: true },
        comparison: { type: 'string', enum: ['none', 'previous_period', 'target'] },
        format: { type: 'string', enum: ['number', 'currency', 'percentage'] }
      }
    },
    supportedDataSources: ['event-data', 'sales-data', 'revenue-data'],
    requiredPermissions: ['view_metrics']
  },
  {
    type: 'chart',
    name: 'Chart',
    description: 'Customizable charts with multiple visualization types',
    icon: 'bar-chart',
    category: 'visualization',
    defaultSize: { width: 6, height: 4 },
    configSchema: {
      properties: {
        chartType: { type: 'string', enum: ['line', 'bar', 'pie', 'area', 'scatter'], required: true },
        xAxis: { type: 'string', required: true },
        yAxis: { type: 'array', items: { type: 'string' }, required: true }
      }
    },
    supportedDataSources: ['event-data', 'sales-data', 'marketing-data', 'financial-data'],
    requiredPermissions: ['view_analytics']
  },
  {
    type: 'table',
    name: 'Data Table',
    description: 'Sortable and filterable data tables',
    icon: 'table',
    category: 'data',
    defaultSize: { width: 8, height: 4 },
    configSchema: {
      properties: {
        columns: { type: 'array', items: { type: 'string' }, required: true },
        pagination: { type: 'boolean', default: true },
        sorting: { type: 'boolean', default: true }
      }
    },
    supportedDataSources: ['attendee-data', 'sales-agent-data', 'commission-data'],
    requiredPermissions: ['view_data']
  },
  {
    type: 'text',
    name: 'Text Block',
    description: 'Rich text content with markdown support',
    icon: 'type',
    category: 'content',
    defaultSize: { width: 4, height: 2 },
    configSchema: {
      properties: {
        content: { type: 'string', format: 'markdown', required: true },
        alignment: { type: 'string', enum: ['left', 'center', 'right'], default: 'left' }
      }
    },
    supportedDataSources: [],
    requiredPermissions: ['edit_content']
  },
  {
    type: 'metric',
    name: 'Custom Metric',
    description: 'Display calculated metrics with custom formulas',
    icon: 'calculator',
    category: 'metrics',
    defaultSize: { width: 3, height: 2 },
    configSchema: {
      properties: {
        formula: { type: 'string', required: true },
        variables: { type: 'object', required: true },
        unit: { type: 'string' },
        format: { type: 'string', enum: ['number', 'currency', 'percentage'] }
      }
    },
    supportedDataSources: ['custom-metrics'],
    requiredPermissions: ['create_metrics']
  }
];

const mockDataSources: DataSource[] = [
  {
    id: 'event-data',
    name: 'Event Data',
    type: 'internal',
    description: 'Core event information including ticket sales, capacity, and basic metrics',
    fields: [
      { name: 'event_id', type: 'string', description: 'Unique event identifier', aggregatable: false, filterable: true, sortable: true },
      { name: 'tickets_sold', type: 'number', description: 'Number of tickets sold', aggregatable: true, filterable: true, sortable: true },
      { name: 'total_capacity', type: 'number', description: 'Total event capacity', aggregatable: false, filterable: true, sortable: true },
      { name: 'event_date', type: 'date', description: 'Event date and time', aggregatable: false, filterable: true, sortable: true },
      { name: 'sales_rate', type: 'number', description: 'Percentage of tickets sold', aggregatable: true, filterable: true, sortable: true, format: 'percentage' }
    ],
    refreshRate: 5,
    lastRefresh: new Date(),
    status: 'active'
  },
  {
    id: 'sales-data',
    name: 'Sales Data',
    type: 'internal',
    description: 'Detailed sales information by agent, channel, and time period',
    fields: [
      { name: 'sale_id', type: 'string', description: 'Unique sale identifier', aggregatable: false, filterable: true, sortable: true },
      { name: 'agent_id', type: 'string', description: 'Sales agent identifier', aggregatable: false, filterable: true, sortable: true },
      { name: 'channel', type: 'string', description: 'Sales channel (online, agent, cash)', aggregatable: false, filterable: true, sortable: true },
      { name: 'amount', type: 'number', description: 'Sale amount', aggregatable: true, filterable: true, sortable: true, format: 'currency' },
      { name: 'sale_date', type: 'date', description: 'Date of sale', aggregatable: false, filterable: true, sortable: true },
      { name: 'ticket_type', type: 'string', description: 'Type of ticket sold', aggregatable: false, filterable: true, sortable: true }
    ],
    refreshRate: 5,
    lastRefresh: new Date(),
    status: 'active'
  },
  {
    id: 'marketing-data',
    name: 'Marketing Data',
    type: 'internal',
    description: 'Marketing campaign performance and conversion metrics',
    fields: [
      { name: 'campaign_id', type: 'string', description: 'Campaign identifier', aggregatable: false, filterable: true, sortable: true },
      { name: 'channel', type: 'string', description: 'Marketing channel', aggregatable: false, filterable: true, sortable: true },
      { name: 'impressions', type: 'number', description: 'Number of impressions', aggregatable: true, filterable: true, sortable: true },
      { name: 'clicks', type: 'number', description: 'Number of clicks', aggregatable: true, filterable: true, sortable: true },
      { name: 'conversions', type: 'number', description: 'Number of conversions', aggregatable: true, filterable: true, sortable: true },
      { name: 'spend', type: 'number', description: 'Amount spent', aggregatable: true, filterable: true, sortable: true, format: 'currency' },
      { name: 'roi', type: 'number', description: 'Return on investment', aggregatable: true, filterable: true, sortable: true, format: 'percentage' }
    ],
    refreshRate: 60,
    lastRefresh: new Date(),
    status: 'active'
  },
  {
    id: 'external-analytics',
    name: 'Google Analytics',
    type: 'external',
    description: 'Website traffic and conversion data from Google Analytics',
    endpoint: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
    authentication: {
      type: 'oauth',
      config: { scope: 'https://www.googleapis.com/auth/analytics.readonly' }
    },
    fields: [
      { name: 'sessions', type: 'number', description: 'Number of sessions', aggregatable: true, filterable: true, sortable: true },
      { name: 'page_views', type: 'number', description: 'Number of page views', aggregatable: true, filterable: true, sortable: true },
      { name: 'bounce_rate', type: 'number', description: 'Bounce rate percentage', aggregatable: true, filterable: true, sortable: true, format: 'percentage' },
      { name: 'conversion_rate', type: 'number', description: 'Goal conversion rate', aggregatable: true, filterable: true, sortable: true, format: 'percentage' }
    ],
    refreshRate: 60,
    lastRefresh: new Date(),
    status: 'active'
  }
];

// Service implementation
class CustomDashboardService {
  private dashboards: Map<string, CustomDashboard> = new Map();
  private templates: Map<string, DashboardTemplate> = new Map();
  private widgetTypes: Map<string, WidgetType> = new Map();
  private dataSources: Map<string, DataSource> = new Map();
  private customMetrics: Map<string, CustomMetric> = new Map();

  constructor() {
    // Initialize with mock data
    mockTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
    
    mockWidgetTypes.forEach(widgetType => {
      this.widgetTypes.set(widgetType.type, widgetType);
    });
    
    mockDataSources.forEach(dataSource => {
      this.dataSources.set(dataSource.id, dataSource);
    });

    // Load any existing dashboards from localStorage
    this.loadDashboards();
  }

  private loadDashboards(): void {
    try {
      const stored = localStorage.getItem('custom-dashboards');
      if (stored) {
        const dashboardsArray = JSON.parse(stored);
        dashboardsArray.forEach((dashboard: any) => {
          // Convert date strings back to Date objects
          const convertedDashboard = {
            ...dashboard,
            created: new Date(dashboard.created),
            lastModified: new Date(dashboard.lastModified),
            lastAccessed: new Date(dashboard.lastAccessed),
            widgets: dashboard.widgets.map((widget: any) => ({
              ...widget,
              created: new Date(widget.created),
              lastModified: new Date(widget.lastModified)
            })),
            version: {
              ...dashboard.version,
              history: dashboard.version.history.map((version: any) => ({
                ...version,
                created: new Date(version.created)
              }))
            }
          };
          this.dashboards.set(dashboard.id, convertedDashboard);
        });
      }
    } catch (error) {
      console.error('Error loading dashboards from localStorage:', error);
    }
  }

  private saveDashboards(): void {
    try {
      const dashboardsArray = Array.from(this.dashboards.values());
      localStorage.setItem('custom-dashboards', JSON.stringify(dashboardsArray));
    } catch (error) {
      console.error('Error saving dashboards to localStorage:', error);
    }
  }

  // Dashboard CRUD operations
  async createDashboard(dashboard: Omit<CustomDashboard, 'id' | 'created' | 'lastModified' | 'lastAccessed' | 'accessCount' | 'version'>): Promise<CustomDashboard> {
    const id = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newDashboard: CustomDashboard = {
      ...dashboard,
      id,
      created: now,
      lastModified: now,
      lastAccessed: now,
      accessCount: 0,
      version: {
        current: 1,
        history: []
      }
    };

    this.dashboards.set(id, newDashboard);
    this.saveDashboards();
    return newDashboard;
  }

  async getDashboard(id: string): Promise<CustomDashboard | null> {
    const dashboard = this.dashboards.get(id);
    if (dashboard) {
      // Update access tracking
      dashboard.lastAccessed = new Date();
      dashboard.accessCount++;
      this.saveDashboards();
    }
    return dashboard || null;
  }

  async updateDashboard(id: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard | null> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return null;

    // Create version backup before updating
    const backup: DashboardVersion = {
      version: dashboard.version.current,
      name: `Version ${dashboard.version.current}`,
      description: 'Automatic backup before update',
      widgets: [...dashboard.widgets],
      layout: { ...dashboard.layout },
      created: dashboard.lastModified,
      createdBy: dashboard.organizerId,
      isBackup: true
    };

    const updatedDashboard: CustomDashboard = {
      ...dashboard,
      ...updates,
      lastModified: new Date(),
      version: {
        current: dashboard.version.current + 1,
        history: [...dashboard.version.history, backup]
      }
    };

    this.dashboards.set(id, updatedDashboard);
    this.saveDashboards();
    return updatedDashboard;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const deleted = this.dashboards.delete(id);
    if (deleted) {
      this.saveDashboards();
    }
    return deleted;
  }

  async getDashboardsByOrganizer(organizerId: string): Promise<CustomDashboard[]> {
    return Array.from(this.dashboards.values())
      .filter(dashboard => dashboard.organizerId === organizerId)
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  async duplicateDashboard(id: string, newName: string): Promise<CustomDashboard | null> {
    const original = this.dashboards.get(id);
    if (!original) return null;

    const duplicate = await this.createDashboard({
      ...original,
      name: newName,
      widgets: original.widgets.map(widget => ({
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        lastModified: new Date()
      })),
      layout: { ...original.layout },
      permissions: { ...original.permissions },
      settings: { ...original.settings }
    });

    return duplicate;
  }

  // Widget operations
  async addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id' | 'created' | 'lastModified'>): Promise<DashboardWidget | null> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created: new Date(),
      lastModified: new Date()
    };

    dashboard.widgets.push(newWidget);
    dashboard.lastModified = new Date();
    this.saveDashboards();
    
    return newWidget;
  }

  async updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): Promise<DashboardWidget | null> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return null;

    const updatedWidget = {
      ...dashboard.widgets[widgetIndex],
      ...updates,
      lastModified: new Date()
    };

    dashboard.widgets[widgetIndex] = updatedWidget;
    dashboard.lastModified = new Date();
    this.saveDashboards();
    
    return updatedWidget;
  }

  async removeWidget(dashboardId: string, widgetId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const initialLength = dashboard.widgets.length;
    dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
    
    if (dashboard.widgets.length < initialLength) {
      dashboard.lastModified = new Date();
      this.saveDashboards();
      return true;
    }
    
    return false;
  }

  // Template operations
  async getTemplates(category?: string): Promise<DashboardTemplate[]> {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(template => template.category === category);
    }
    
    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  async createDashboardFromTemplate(templateId: string, organizerId: string, name: string, eventIds: string[] = []): Promise<CustomDashboard | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    // Increment template usage
    template.usageCount++;

    const dashboard = await this.createDashboard({
      name,
      description: `Dashboard created from ${template.name} template`,
      organizerId,
      eventIds,
      widgets: template.widgets.map(widget => ({
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        lastModified: new Date(),
        createdBy: organizerId
      })),
      layout: { ...template.layout },
      permissions: {
        public: false,
        allowedRoles: ['organizer'],
        allowedUsers: [organizerId]
      },
      settings: { ...template.defaultSettings }
    });

    return dashboard;
  }

  // Widget types and data sources
  getWidgetTypes(): WidgetType[] {
    return Array.from(this.widgetTypes.values());
  }

  getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  // Custom metrics
  async createCustomMetric(metric: Omit<CustomMetric, 'id' | 'created' | 'lastModified'>): Promise<CustomMetric> {
    const id = `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newMetric: CustomMetric = {
      ...metric,
      id,
      created: now,
      lastModified: now
    };

    this.customMetrics.set(id, newMetric);
    return newMetric;
  }

  async getCustomMetrics(organizerId: string): Promise<CustomMetric[]> {
    return Array.from(this.customMetrics.values())
      .filter(metric => metric.organizerId === organizerId);
  }

  // Export functionality
  async exportDashboard(dashboardId: string, options: ExportOptions): Promise<Blob | null> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    // This would integrate with actual export libraries
    // For now, return mock data based on format
    switch (options.format) {
      case 'json':
        const jsonData = JSON.stringify(dashboard, null, 2);
        return new Blob([jsonData], { type: 'application/json' });
      
      case 'excel':
        // Mock Excel export - would use actual library like xlsx
        const csvData = 'Dashboard Export\nName,Value\nTickets Sold,150\nRevenue,$15000';
        return new Blob([csvData], { type: 'text/csv' });
      
      default:
        return null;
    }
  }

  // Analytics
  async getDashboardAnalytics(dashboardId: string): Promise<DashboardAnalytics | null> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    // Mock analytics data
    return {
      dashboardId,
      views: {
        total: dashboard.accessCount,
        thisMonth: Math.floor(dashboard.accessCount * 0.3),
        thisWeek: Math.floor(dashboard.accessCount * 0.1),
        today: Math.floor(dashboard.accessCount * 0.05)
      },
      users: {
        total: 5,
        active: 3,
        byRole: {
          organizer: 1,
          sales_agent: 2,
          marketing_manager: 1,
          event_staff: 1
        }
      },
      widgets: {
        mostUsed: [
          { widgetType: 'kpi', count: 25 },
          { widgetType: 'chart', count: 18 },
          { widgetType: 'table', count: 12 }
        ],
        loadTimes: dashboard.widgets.map(widget => ({
          widgetId: widget.id,
          avgLoadTime: Math.random() * 1000 + 200
        })),
        errors: []
      },
      performance: {
        averageLoadTime: 650,
        refreshFrequency: dashboard.settings.refreshInterval,
        errorRate: 0.02
      },
      lastUpdated: new Date()
    };
  }

  // Version management
  async restoreDashboardVersion(dashboardId: string, version: number): Promise<CustomDashboard | null> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const versionToRestore = dashboard.version.history.find(v => v.version === version);
    if (!versionToRestore) return null;

    // Create backup of current version
    const currentBackup: DashboardVersion = {
      version: dashboard.version.current,
      name: `Version ${dashboard.version.current} (before restore)`,
      description: 'Backup created before version restore',
      widgets: [...dashboard.widgets],
      layout: { ...dashboard.layout },
      created: dashboard.lastModified,
      createdBy: dashboard.organizerId,
      isBackup: true
    };

    const restoredDashboard: CustomDashboard = {
      ...dashboard,
      widgets: [...versionToRestore.widgets],
      layout: { ...versionToRestore.layout },
      lastModified: new Date(),
      version: {
        current: dashboard.version.current + 1,
        history: [...dashboard.version.history, currentBackup]
      }
    };

    this.dashboards.set(dashboardId, restoredDashboard);
    this.saveDashboards();
    return restoredDashboard;
  }
}

export const customDashboardService = new CustomDashboardService(); 