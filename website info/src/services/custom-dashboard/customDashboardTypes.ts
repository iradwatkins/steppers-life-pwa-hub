export enum WidgetType {
  KPI_CARD = 'kpi_card',
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
  TEXT_BOX = 'text_box',
  IMAGE = 'image',
}

export interface DataSource {
  id: string;
  name: string;
  type: 'internal' | 'external_api' | 'manual'; // internal (e.g., sales data), api, manual input
  description?: string;
  // For API sources
  apiUrl?: string;
  apiKey?: string; // Consider secure storage
  // For internal sources
  internalDataset?: string; // e.g., 'event_sales', 'attendee_demographics'
}

export interface CustomMetric {
  id: string;
  name: string;
  description?: string;
  formula: string; // e.g., "dataSource1.metricA / dataSource2.metricB * 100"
  dataSourcesUsed: string[]; // Array of DataSource IDs
  valueType: 'number' | 'percentage' | 'currency' | 'text';
  formatOptions?: Record<string, any>; // e.g., { decimalPlaces: 2, currencySymbol: '$' }
}

export interface WidgetLayout {
  i: string; // Widget instance ID
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean; // If true, widget cannot be moved or resized
}

export interface WidgetConfig {
  id: string; // Unique ID for this widget instance
  widgetType: WidgetType;
  title?: string;
  dataSourceId?: string; // Link to a DataSource
  metricId?: string; // Link to a CustomMetric or predefined metric
  predefinedMetric?: string; // e.g., 'total_sales', 'ticket_count'
  chartOptions?: Record<string, any>; // e.g., { xAxisKey: 'date', yAxisKey: 'sales', colors: ['#8884d8'] }
  tableColumns?: { key: string; header: string }[];
  textContent?: string; // For TEXT_BOX
  imageUrl?: string; // For IMAGE
  refreshInterval?: number; // in seconds, overrides dashboard default
  themeOptions?: { // Widget-specific theme overrides
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
}

export interface DashboardLayout {
  lg: WidgetLayout[]; // For large screens
  md: WidgetLayout[]; // For medium screens
  sm: WidgetLayout[]; // For small screens
  // Add more breakpoints as needed (e.g., xs, xl)
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // User ID of the creator/owner
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  widgets: WidgetConfig[];
  layouts: DashboardLayout; // Responsive grid layouts
  customMetrics: CustomMetric[];
  dataSources: DataSource[];
  sharedWith?: { userId: string; role: 'viewer' | 'editor' }[];
  version: number;
  tags?: string[];
  isTemplate?: boolean;
  templateId?: string; // If created from a template
  defaultRefreshInterval?: number; // in seconds (e.g., 60 for 1 minute)
  theme?: 'light' | 'dark' | 'custom';
  customThemeOptions?: {
    backgroundColor?: string;
    gridColor?: string;
    widgetDefaults?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
  };
}

// For service responses or operations
export interface DashboardOperationResult {
  success: boolean;
  dashboardId?: string;
  error?: string;
  dashboard?: DashboardConfig;
}

// Mock data for now
export const mockDataSources: DataSource[] = [
  { id: 'ds_sales', name: 'Event Sales Data', type: 'internal', internalDataset: 'event_sales_summary' },
  { id: 'ds_attendees', name: 'Attendee Demographics', type: 'internal', internalDataset: 'attendee_profiles' },
  { id: 'ds_ga', name: 'Google Analytics', type: 'external_api', apiUrl: 'https://analytics.google.com/api/v4/data' },
  { id: 'ds_manual_revenue', name: 'Manual Revenue Input', type: 'manual' },
];

export const mockCustomMetrics: CustomMetric[] = [
  {
    id: 'cm_conversion_rate',
    name: 'Ticket Conversion Rate',
    formula: "(ds_sales.tickets_sold / ds_ga.website_visits) * 100",
    dataSourcesUsed: ['ds_sales', 'ds_ga'],
    valueType: 'percentage',
    formatOptions: { decimalPlaces: 2 }
  },
  {
    id: 'cm_avg_revenue_per_ticket',
    name: 'Average Revenue per Ticket',
    formula: "ds_sales.total_revenue / ds_sales.tickets_sold",
    dataSourcesUsed: ['ds_sales'],
    valueType: 'currency',
    formatOptions: { decimalPlaces: 2, currencySymbol: '$' }
  }
];

export const mockWidgetConfigs: WidgetConfig[] = [
  {
    id: 'widget_total_sales',
    widgetType: WidgetType.KPI_CARD,
    title: 'Total Sales Revenue',
    dataSourceId: 'ds_sales',
    predefinedMetric: 'total_revenue',
    themeOptions: { backgroundColor: '#E6F4EA', textColor: '#006A4E' }
  },
  {
    id: 'widget_tickets_sold',
    widgetType: WidgetType.KPI_CARD,
    title: 'Tickets Sold',
    dataSourceId: 'ds_sales',
    predefinedMetric: 'tickets_sold',
  },
  {
    id: 'widget_conversion_rate',
    widgetType: WidgetType.KPI_CARD,
    title: 'Conversion Rate',
    metricId: 'cm_conversion_rate',
  },
  {
    id: 'widget_sales_trend',
    widgetType: WidgetType.LINE_CHART,
    title: 'Sales Trend (Last 30 Days)',
    dataSourceId: 'ds_sales',
    predefinedMetric: 'daily_sales_trend', // This would fetch an array of {date, sales}
    chartOptions: { xAxisKey: 'date', yAxisKey: 'sales', stroke: '#8884d8' }
  },
  {
    id: 'widget_attendee_demographics_pie',
    widgetType: WidgetType.PIE_CHART,
    title: 'Attendee Age Groups',
    dataSourceId: 'ds_attendees',
    predefinedMetric: 'age_group_distribution', // This would fetch an array of {name, value} for pie chart
    chartOptions: { dataKey: 'value', nameKey: 'name' }
  },
  {
    id: 'widget_top_events_table',
    widgetType: WidgetType.TABLE,
    title: 'Top Performing Events',
    dataSourceId: 'ds_sales',
    predefinedMetric: 'top_events_by_revenue', // This would fetch an array of objects
    tableColumns: [
      { key: 'eventName', header: 'Event Name' },
      { key: 'revenue', header: 'Revenue' },
      { key: 'ticketsSold', header: 'Tickets Sold' },
    ]
  }
];

export const mockLayouts: DashboardLayout = {
  lg: [ // Assuming 12 columns for lg breakpoint
    { i: 'widget_total_sales', x: 0, y: 0, w: 3, h: 2 },
    { i: 'widget_tickets_sold', x: 3, y: 0, w: 3, h: 2 },
    { i: 'widget_conversion_rate', x: 6, y: 0, w: 3, h: 2 },
    { i: 'widget_sales_trend', x: 0, y: 2, w: 9, h: 4 },
    { i: 'widget_attendee_demographics_pie', x: 9, y: 0, w: 3, h: 6 },
    { i: 'widget_top_events_table', x: 0, y: 6, w: 12, h: 4 },
  ],
  md: [ // Assuming 10 columns for md breakpoint
    { i: 'widget_total_sales', x: 0, y: 0, w: 5, h: 2 },
    { i: 'widget_tickets_sold', x: 5, y: 0, w: 5, h: 2 },
    { i: 'widget_conversion_rate', x: 0, y: 2, w: 5, h: 2 },
    { i: 'widget_sales_trend', x: 0, y: 4, w: 10, h: 4 },
    { i: 'widget_attendee_demographics_pie', x: 5, y: 2, w: 5, h: 4 }, // Adjusted
    { i: 'widget_top_events_table', x: 0, y: 8, w: 10, h: 4 },
  ],
  sm: [ // Assuming 6 columns for sm breakpoint
    { i: 'widget_total_sales', x: 0, y: 0, w: 6, h: 2 },
    { i: 'widget_tickets_sold', x: 0, y: 2, w: 6, h: 2 },
    { i: 'widget_conversion_rate', x: 0, y: 4, w: 6, h: 2 },
    { i: 'widget_sales_trend', x: 0, y: 6, w: 6, h: 4 },
    { i: 'widget_attendee_demographics_pie', x: 0, y: 10, w: 6, h: 4 },
    { i: 'widget_top_events_table', x: 0, y: 14, w: 6, h: 4 },
  ],
};


export const mockDashboards: DashboardConfig[] = [
  {
    id: 'dash_overview_1',
    name: 'Main Sales Overview',
    description: 'Tracks key sales metrics and event performance.',
    ownerId: 'organizer_user_123',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    widgets: mockWidgetConfigs,
    layouts: mockLayouts,
    customMetrics: [mockCustomMetrics[0], mockCustomMetrics[1]],
    dataSources: [mockDataSources[0], mockDataSources[1], mockDataSources[2]],
    version: 3,
    tags: ['sales', 'overview', 'main'],
    defaultRefreshInterval: 60, // 1 minute
    theme: 'light',
  },
  {
    id: 'dash_marketing_perf_2',
    name: 'Marketing Performance Dashboard',
    description: 'Focuses on marketing campaign effectiveness and ROI.',
    ownerId: 'organizer_user_123',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    widgets: [ // Simplified widgets for this example
      { id: 'widget_ga_visits', widgetType: WidgetType.KPI_CARD, title: 'Website Visits (GA)', dataSourceId: 'ds_ga', predefinedMetric: 'total_visits' },
      { id: 'widget_conversion_rate_marketing', widgetType: WidgetType.KPI_CARD, title: 'Marketing Conversion', metricId: 'cm_conversion_rate' },
      { id: 'widget_social_engagement_chart', widgetType: WidgetType.BAR_CHART, title: 'Social Engagement by Platform', dataSourceId: 'ds_ga', predefinedMetric: 'social_engagement_breakdown' }
    ],
    layouts: { // Simplified layout
      lg: [
        { i: 'widget_ga_visits', x: 0, y: 0, w: 4, h: 2 },
        { i: 'widget_conversion_rate_marketing', x: 4, y: 0, w: 4, h: 2 },
        { i: 'widget_social_engagement_chart', x: 0, y: 2, w: 8, h: 4 },
      ],
      md: [
        { i: 'widget_ga_visits', x: 0, y: 0, w: 5, h: 2 },
        { i: 'widget_conversion_rate_marketing', x: 5, y: 0, w: 5, h: 2 },
        { i: 'widget_social_engagement_chart', x: 0, y: 2, w: 10, h: 4 },
      ],
      sm: [
        { i: 'widget_ga_visits', x: 0, y: 0, w: 6, h: 2 },
        { i: 'widget_conversion_rate_marketing', x: 0, y: 2, w: 6, h: 2 },
        { i: 'widget_social_engagement_chart', x: 0, y: 4, w: 6, h: 4 },
      ]
    },
    customMetrics: [mockCustomMetrics[0]],
    dataSources: [mockDataSources[0], mockDataSources[2]],
    version: 1,
    tags: ['marketing', 'roi', 'campaigns'],
    defaultRefreshInterval: 300, // 5 minutes
    theme: 'dark',
    customThemeOptions: {
      backgroundColor: '#222222',
      gridColor: '#444444',
      widgetDefaults: { backgroundColor: '#333333', textColor: '#FFFFFF', borderColor: '#555555'}
    }
  },
  {
    id: 'dash_template_basic_event_3',
    name: 'Basic Event Performance Template',
    description: 'A starter template for tracking a single event\'s core metrics.',
    ownerId: 'system', // System template
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
       { id: 'temp_w_total_revenue', widgetType: WidgetType.KPI_CARD, title: 'Total Revenue', predefinedMetric: 'event.total_revenue' },
       { id: 'temp_w_tickets_sold', widgetType: WidgetType.KPI_CARD, title: 'Tickets Sold', predefinedMetric: 'event.tickets_sold' },
       { id: 'temp_w_attendance_rate', widgetType: WidgetType.KPI_CARD, title: 'Attendance Rate', predefinedMetric: 'event.attendance_rate_percentage' },
       { id: 'temp_w_sales_by_ticket_type', widgetType: WidgetType.PIE_CHART, title: 'Sales by Ticket Type', predefinedMetric: 'event.sales_by_ticket_type_distribution' },
    ],
    layouts: {
       lg: [
         { i: 'temp_w_total_revenue', x: 0, y: 0, w: 3, h: 2 },
         { i: 'temp_w_tickets_sold', x: 3, y: 0, w: 3, h: 2 },
         { i: 'temp_w_attendance_rate', x: 6, y: 0, w: 3, h: 2 },
         { i: 'temp_w_sales_by_ticket_type', x: 0, y: 2, w: 6, h: 4 },
       ],
       md: [
         { i: 'temp_w_total_revenue', x: 0, y: 0, w: 5, h: 2 },
         { i: 'temp_w_tickets_sold', x: 5, y: 0, w: 5, h: 2 },
         { i: 'temp_w_attendance_rate', x: 0, y: 2, w: 5, h: 2 },
         { i: 'temp_w_sales_by_ticket_type', x: 0, y: 4, w: 10, h: 4 },
       ],
       sm: [
         { i: 'temp_w_total_revenue', x: 0, y: 0, w: 6, h: 2 },
         { i: 'temp_w_tickets_sold', x: 0, y: 2, w: 6, h: 2 },
         { i: 'temp_w_attendance_rate', x: 0, y: 4, w: 6, h: 2 },
         { i: 'temp_w_sales_by_ticket_type', x: 0, y: 6, w: 6, h: 4 },
       ]
    },
    customMetrics: [],
    dataSources: [], // Templates might not have specific DS pre-linked
    version: 1,
    isTemplate: true,
    tags: ['template', 'event', 'basic'],
    theme: 'light',
  }
]; 