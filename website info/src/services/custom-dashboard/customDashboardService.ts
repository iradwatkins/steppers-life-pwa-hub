import { v4 as uuidv4 } from 'uuid';
import {
  DashboardConfig,
  WidgetConfig,
  CustomMetric,
  DataSource,
  DashboardOperationResult,
  mockDashboards,
  mockDataSources,
  mockCustomMetrics,
  mockWidgetConfigs,
  WidgetLayout,
  DashboardLayout
} from './customDashboardTypes';

// Simulate a database or persistent storage
let dashboardsStore: DashboardConfig[] = [...mockDashboards];
let dataSourcesStore: DataSource[] = [...mockDataSources];
let customMetricsStore: CustomMetric[] = [...mockCustomMetrics];

// --- Dashboard CRUD Operations ---

export const getDashboards = async (ownerId: string): Promise<DashboardConfig[]> => {
  // In a real app, filter by ownerId and fetch from DB
  return dashboardsStore.filter(d => d.ownerId === ownerId || d.isTemplate);
};

export const getDashboardById = async (id: string): Promise<DashboardConfig | undefined> => {
  return dashboardsStore.find(d => d.id === id);
};

export const createDashboard = async (config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<DashboardOperationResult> => {
  const newDashboard: DashboardConfig = {
    ...config,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  dashboardsStore.push(newDashboard);
  return { success: true, dashboardId: newDashboard.id, dashboard: newDashboard };
};

export const updateDashboard = async (id: string, updates: Partial<Omit<DashboardConfig, 'id' | 'ownerId' | 'createdAt'>>): Promise<DashboardOperationResult> => {
  const dashboardIndex = dashboardsStore.findIndex(d => d.id === id);
  if (dashboardIndex === -1) {
    return { success: false, error: 'Dashboard not found' };
  }
  const existingDashboard = dashboardsStore[dashboardIndex];
  const updatedDashboard = {
    ...existingDashboard,
    ...updates,
    widgets: updates.widgets !== undefined ? updates.widgets : existingDashboard.widgets, // Ensure full replacement if provided
    layouts: updates.layouts !== undefined ? updates.layouts : existingDashboard.layouts,
    customMetrics: updates.customMetrics !== undefined ? updates.customMetrics : existingDashboard.customMetrics,
    dataSources: updates.dataSources !== undefined ? updates.dataSources : existingDashboard.dataSources,
    updatedAt: new Date().toISOString(),
    version: existingDashboard.version + 1,
  };
  dashboardsStore[dashboardIndex] = updatedDashboard;
  return { success: true, dashboardId: id, dashboard: updatedDashboard };
};

export const deleteDashboard = async (id: string): Promise<DashboardOperationResult> => {
  const initialLength = dashboardsStore.length;
  dashboardsStore = dashboardsStore.filter(d => d.id !== id);
  if (dashboardsStore.length === initialLength) {
    return { success: false, error: 'Dashboard not found' };
  }
  return { success: true, dashboardId: id };
};

// --- Widget Operations (within a dashboard context) ---

export const addWidgetToDashboard = async (dashboardId: string, widgetConfig: Omit<WidgetConfig, 'id'>, layoutItem: Omit<WidgetLayout, 'i'>): Promise<DashboardOperationResult> => {
  const dashboard = await getDashboardById(dashboardId);
  if (!dashboard) {
    return { success: false, error: 'Dashboard not found' };
  }

  const newWidget: WidgetConfig = {
    ...widgetConfig,
    id: uuidv4(),
  };

  const newLayouts: DashboardLayout = JSON.parse(JSON.stringify(dashboard.layouts)); // Deep copy
  Object.keys(newLayouts).forEach(key => {
    const breakpointKey = key as keyof DashboardLayout;
    newLayouts[breakpointKey].push({ ...layoutItem, i: newWidget.id } as WidgetLayout);
  });

  const updatedWidgets = [...dashboard.widgets, newWidget];
  return updateDashboard(dashboardId, { widgets: updatedWidgets, layouts: newLayouts });
};

export const updateWidgetInDashboard = async (dashboardId: string, widgetId: string, updates: Partial<WidgetConfig>, layoutUpdates?: Partial<WidgetLayout>): Promise<DashboardOperationResult> => {
  const dashboard = await getDashboardById(dashboardId);
  if (!dashboard) {
    return { success: false, error: 'Dashboard not found' };
  }

  let widgetUpdated = false;
  const updatedWidgets = dashboard.widgets.map(w => {
    if (w.id === widgetId) {
      widgetUpdated = true;
      return { ...w, ...updates };
    }
    return w;
  });

  if (!widgetUpdated) {
    return { success: false, error: `Widget with id ${widgetId} not found in dashboard ${dashboardId}` };
  }

  let newLayouts = dashboard.layouts;
  if (layoutUpdates) {
    newLayouts = JSON.parse(JSON.stringify(dashboard.layouts)); // Deep copy
    Object.keys(newLayouts).forEach(key => {
      const breakpointKey = key as keyof DashboardLayout;
      const layoutIndex = newLayouts[breakpointKey].findIndex(l => l.i === widgetId);
      if (layoutIndex !== -1) {
        newLayouts[breakpointKey][layoutIndex] = { ...newLayouts[breakpointKey][layoutIndex], ...layoutUpdates };
      }
    });
  }

  return updateDashboard(dashboardId, { widgets: updatedWidgets, layouts: newLayouts });
};

export const removeWidgetFromDashboard = async (dashboardId: string, widgetId: string): Promise<DashboardOperationResult> => {
  const dashboard = await getDashboardById(dashboardId);
  if (!dashboard) {
    return { success: false, error: 'Dashboard not found' };
  }

  const updatedWidgets = dashboard.widgets.filter(w => w.id !== widgetId);
  if (updatedWidgets.length === dashboard.widgets.length) {
    return { success: false, error: `Widget with id ${widgetId} not found in dashboard ${dashboardId}` };
  }

  const newLayouts: DashboardLayout = JSON.parse(JSON.stringify(dashboard.layouts));
  Object.keys(newLayouts).forEach(key => {
    const breakpointKey = key as keyof DashboardLayout;
    newLayouts[breakpointKey] = newLayouts[breakpointKey].filter(l => l.i !== widgetId);
  });

  return updateDashboard(dashboardId, { widgets: updatedWidgets, layouts: newLayouts });
};

// --- Data Source CRUD --- (Simplified - in real app, these would be more robust and potentially global)
export const getDataSources = async (): Promise<DataSource[]> => {
  return dataSourcesStore;
};

export const createDataSource = async (dataSource: Omit<DataSource, 'id'>): Promise<DataSource> => {
  const newDataSource = { ...dataSource, id: uuidv4() };
  dataSourcesStore.push(newDataSource);
  // Potentially update dashboards using this if it's a global store
  return newDataSource;
};

// --- Custom Metric CRUD --- (Simplified)
export const getCustomMetrics = async (): Promise<CustomMetric[]> => {
  return customMetricsStore;
};

export const createCustomMetric = async (metric: Omit<CustomMetric, 'id'>): Promise<CustomMetric> => {
  const newMetric = { ...metric, id: uuidv4() };
  customMetricsStore.push(newMetric);
  // Potentially update dashboards using this
  return newMetric;
};


// --- Formula Engine (Placeholder) ---
interface EvaluationContext {
  [dataSourceAlias: string]: {
    [metricName: string]: number | string | any[];
  };
}

export const evaluateMetricFormula = async (formula: string, dashboardId: string, customMetricId: string): Promise<number | string | null> => {
  const dashboard = await getDashboardById(dashboardId);
  const metric = dashboard?.customMetrics.find(m => m.id === customMetricId);

  if (!dashboard || !metric) {
    console.error('Dashboard or metric not found for evaluation');
    return null;
  }

  // 1. Identify needed data sources from formula/metric.dataSourcesUsed
  // 2. Fetch data for these sources (mocked for now)
  const context: EvaluationContext = {};

  for (const dsId of metric.dataSourcesUsed) {
    const dataSource = dashboard.dataSources.find(ds => ds.id === dsId);
    if (!dataSource) continue;

    // Simulate fetching data based on dataSource type and internalDataset/apiUrl
    // This is highly simplified. A real implementation would fetch from APIs or internal services.
    const alias = dsId; // Could allow aliasing in formula later
    context[alias] = {};
    if (dataSource.internalDataset === 'event_sales_summary' && dsId === 'ds_sales') {
      context[alias]['tickets_sold'] = 1500; // Mock data
      context[alias]['total_revenue'] = 75000; // Mock data
    }
    if (dataSource.type === 'external_api' && dsId === 'ds_ga') {
      context[alias]['website_visits'] = 10000; // Mock data
    }
    // Add more mock data fetching logic as needed for other predefined metrics
  }

  // 3. Parse and evaluate formula (VERY basic placeholder - use a proper library in production!)
  // Example: "(ds_sales.tickets_sold / ds_ga.website_visits) * 100"
  // This is UNSAFE and for DEMO ONLY. Use a sandboxed expression parser.
  try {
    // Create a function scope with context variables
    const funcBody = `return ${formula};`;
    const evaluator = new Function(...Object.keys(context), funcBody);
    const result = evaluator(...Object.values(context));
    return result;
  } catch (error) {
    console.error(`Error evaluating formula "${formula}":`, error);
    return null;
  }
};

// --- Data Fetching for Widgets (Placeholder) ---
// This function would fetch actual data for a widget based on its config
export const getWidgetData = async (dashboardId: string, widgetId: string): Promise<any> => {
  const dashboard = await getDashboardById(dashboardId);
  const widget = dashboard?.widgets.find(w => w.id === widgetId);

  if (!widget) {
    console.error('Widget not found');
    return null;
  }

  // If it uses a custom metric, evaluate it
  if (widget.metricId) {
    const customMetric = dashboard?.customMetrics.find(m => m.id === widget.metricId);
    if (customMetric) {
      const evaluatedValue = await evaluateMetricFormula(customMetric.formula, dashboardId, widget.metricId);
      // Format based on customMetric.valueType and formatOptions
      return { value: evaluatedValue, name: customMetric.name, format: customMetric.formatOptions }; // Simplified return
    }
  }

  // If it uses a predefined metric (mock data fetching)
  if (widget.dataSourceId && widget.predefinedMetric) {
    const dataSource = dashboard?.dataSources.find(ds => ds.id === widget.dataSourceId);
    if (!dataSource) return null;

    // Mock data based on predefinedMetric
    if (dataSource.internalDataset === 'event_sales_summary') {
      if (widget.predefinedMetric === 'total_revenue') return { value: 75000, name: 'Total Revenue' };
      if (widget.predefinedMetric === 'tickets_sold') return { value: 1500, name: 'Tickets Sold' };
      if (widget.predefinedMetric === 'daily_sales_trend') {
        // Generate some mock time-series data
        return Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString(),
          sales: Math.floor(Math.random() * 500) + 100,
        }));
      }
      if (widget.predefinedMetric === 'top_events_by_revenue') {
        return [
          { eventName: 'Summer Music Fest', revenue: 25000, ticketsSold: 500 },
          { eventName: 'Tech Conference 2024', revenue: 30000, ticketsSold: 300 },
          { eventName: 'Local Food Fair', revenue: 10000, ticketsSold: 700 },
        ];
      }
    }
    if (dataSource.internalDataset === 'attendee_profiles') {
      if (widget.predefinedMetric === 'age_group_distribution') {
        return [
          { name: '18-24', value: 400 },
          { name: '25-34', value: 600 },
          { name: '35-44', value: 300 },
          { name: '45+', value: 200 },
        ];
      }
    }
     if (dataSource.type === 'external_api' && widget.dataSourceId === 'ds_ga') {
      if (widget.predefinedMetric === 'total_visits') return { value: 10000, name: 'Website Visits' };
      if (widget.predefinedMetric === 'social_engagement_breakdown'){
        return [
            { platform: 'Facebook', engagement: 1200 },
            { platform: 'Instagram', engagement: 2500 },
            { platform: 'Twitter', engagement: 800 },
            { platform: 'LinkedIn', engagement: 500 },
        ];
      }
    }
  }

  console.warn(`No data fetching logic for widget: ${widget.title || widget.id}`);
  return null;
};

// Initialize with some data for development
if (import.meta.env.DEV) {
  // You can add more specific mock initializations if needed
  console.log('Custom Dashboard Service initialized with mock data.');
} 