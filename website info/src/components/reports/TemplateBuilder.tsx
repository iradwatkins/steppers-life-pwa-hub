import React, { useState, useCallback, useMemo } from 'react';
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
  BarChart3, 
  PieChart, 
  LineChart, 
  Table, 
  Type, 
  Image, 
  Gauge,
  Palette,
  Layout,
  Settings,
  Eye,
  Save,
  Download,
  Plus,
  Trash2,
  Copy,
  Move,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ReportTemplate, ReportWidget } from '../../services/automatedReportsService';
import { cn } from '@/lib/utils';

interface TemplateBuilderProps {
  template?: ReportTemplate;
  onSave: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface WidgetType {
  type: ReportWidget['type'];
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultConfig: Partial<ReportWidget['config']>;
}

const WIDGET_TYPES: WidgetType[] = [
  {
    type: 'kpi_card',
    title: 'KPI Card',
    description: 'Display key performance indicators',
    icon: Gauge,
    defaultConfig: {
      dataSource: 'events',
      metrics: ['revenue']
    }
  },
  {
    type: 'chart',
    title: 'Chart',
    description: 'Visual data representation',
    icon: BarChart3,
    defaultConfig: {
      dataSource: 'events',
      metrics: ['ticket_sales'],
      chartType: 'bar'
    }
  },
  {
    type: 'table',
    title: 'Data Table',
    description: 'Tabular data display',
    icon: Table,
    defaultConfig: {
      dataSource: 'events',
      metrics: ['name', 'date', 'revenue', 'attendance']
    }
  },
  {
    type: 'text',
    title: 'Text Block',
    description: 'Custom text content',
    icon: Type,
    defaultConfig: {
      dataSource: 'static',
      metrics: []
    }
  },
  {
    type: 'image',
    title: 'Image',
    description: 'Logo or custom image',
    icon: Image,
    defaultConfig: {
      dataSource: 'static',
      metrics: []
    }
  },
  {
    type: 'comparison',
    title: 'Comparison',
    description: 'Compare metrics across periods',
    icon: PieChart,
    defaultConfig: {
      dataSource: 'events',
      metrics: ['revenue'],
      timeframe: 'month_over_month'
    }
  }
];

const LAYOUT_TEMPLATES = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview with key metrics',
    layout: 'executive' as const
  },
  {
    id: 'detailed',
    name: 'Detailed Analysis',
    description: 'Comprehensive data breakdown',
    layout: 'detailed' as const
  },
  {
    id: 'standard',
    name: 'Standard Report',
    description: 'Balanced mix of charts and tables',
    layout: 'standard' as const
  },
  {
    id: 'summary',
    name: 'Summary View',
    description: 'Concise overview format',
    layout: 'summary' as const
  }
];

const DEFAULT_COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b'
};

const DEFAULT_FONTS = {
  heading: 'Arial, sans-serif',
  body: 'Helvetica, sans-serif'
};

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [templateData, setTemplateData] = useState<Partial<ReportTemplate>>({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'custom',
    layout: template?.layout || 'standard',
    format: template?.format || 'PDF',
    widgets: template?.widgets || [],
    dataSources: template?.dataSources || {
      events: [],
      dateRange: { type: 'last_month' },
      includeComparisons: false,
      includeBenchmarks: false
    },
    branding: template?.branding || {
      colors: DEFAULT_COLORS,
      fonts: DEFAULT_FONTS
    },
    createdBy: template?.createdBy || 'current_user'
  });

  const [selectedWidget, setSelectedWidget] = useState<ReportWidget | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  const addWidget = useCallback((widgetType: WidgetType) => {
    const newWidget: ReportWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: widgetType.type,
      title: widgetType.title,
      config: {
        ...widgetType.defaultConfig,
        dataSource: widgetType.defaultConfig.dataSource || 'events',
        metrics: widgetType.defaultConfig.metrics || []
      },
      position: {
        x: 0,
        y: templateData.widgets?.length || 0,
        width: widgetType.type === 'kpi_card' ? 3 : 6,
        height: widgetType.type === 'kpi_card' ? 2 : 4
      },
      style: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb'
      }
    };

    setTemplateData(prev => ({
      ...prev,
      widgets: [...(prev.widgets || []), newWidget]
    }));
  }, [templateData.widgets]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<ReportWidget>) => {
    setTemplateData(prev => ({
      ...prev,
      widgets: prev.widgets?.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    }));
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setTemplateData(prev => ({
      ...prev,
      widgets: prev.widgets?.filter(widget => widget.id !== widgetId)
    }));
    setSelectedWidget(null);
  }, []);

  const duplicateWidget = useCallback((widget: ReportWidget) => {
    const newWidget: ReportWidget = {
      ...widget,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${widget.title} (Copy)`,
      position: {
        ...widget.position,
        y: widget.position.y + widget.position.height + 1
      }
    };

    setTemplateData(prev => ({
      ...prev,
      widgets: [...(prev.widgets || []), newWidget]
    }));
  }, []);

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const widgets = Array.from(templateData.widgets || []);
    const [reorderedWidget] = widgets.splice(result.source.index, 1);
    widgets.splice(result.destination.index, 0, reorderedWidget);

    // Update positions based on new order
    const updatedWidgets = widgets.map((widget, index) => ({
      ...widget,
      position: {
        ...widget.position,
        y: index * (widget.position.height + 1)
      }
    }));

    setTemplateData(prev => ({
      ...prev,
      widgets: updatedWidgets
    }));
  }, [templateData.widgets]);

  const handleSave = useCallback(() => {
    if (!templateData.name || !templateData.category) {
      alert('Please fill in required fields (name and category)');
      return;
    }

    onSave(templateData as Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>);
  }, [templateData, onSave]);

  const renderWidgetPreview = (widget: ReportWidget) => {
    const IconComponent = WIDGET_TYPES.find(wt => wt.type === widget.type)?.icon || BarChart3;
    
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all border-2",
          selectedWidget?.id === widget.id ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"
        )}
        onClick={() => setSelectedWidget(widget)}
        style={{
          backgroundColor: widget.style.backgroundColor,
          borderColor: selectedWidget?.id === widget.id ? '#3b82f6' : widget.style.borderColor
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              {widget.title}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateWidget(widget);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-xs text-gray-500 mb-2">
            {widget.config.metrics.join(', ')} • {widget.config.dataSource}
          </div>
          <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {widget.position.width}×{widget.position.height} grid units
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWidgetConfiguration = () => {
    if (!selectedWidget) {
      return (
        <div className="text-center text-gray-500 py-8">
          Select a widget to configure its properties
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="widgetTitle">Widget Title</Label>
          <Input
            id="widgetTitle"
            value={selectedWidget.title}
            onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="widgetDescription">Description (Optional)</Label>
          <Input
            id="widgetDescription"
            value={selectedWidget.description || ''}
            onChange={(e) => updateWidget(selectedWidget.id, { description: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="dataSource">Data Source</Label>
          <Select
            value={selectedWidget.config.dataSource}
            onValueChange={(value) => updateWidget(selectedWidget.id, {
              config: { ...selectedWidget.config, dataSource: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="attendees">Attendees</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="static">Static Content</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedWidget.type === 'chart' && (
          <div>
            <Label htmlFor="chartType">Chart Type</Label>
            <Select
              value={selectedWidget.config.chartType || 'bar'}
              onValueChange={(value) => updateWidget(selectedWidget.id, {
                config: { ...selectedWidget.config, chartType: value as any }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Metrics</Label>
          <div className="space-y-2 mt-2">
            {['revenue', 'attendance', 'ticket_sales', 'conversion_rate', 'rating'].map(metric => (
              <div key={metric} className="flex items-center space-x-2">
                <Switch
                  checked={selectedWidget.config.metrics.includes(metric)}
                  onCheckedChange={(checked) => {
                    const metrics = checked
                      ? [...selectedWidget.config.metrics, metric]
                      : selectedWidget.config.metrics.filter(m => m !== metric);
                    updateWidget(selectedWidget.id, {
                      config: { ...selectedWidget.config, metrics }
                    });
                  }}
                />
                <Label className="text-sm capitalize">{metric.replace('_', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="widgetWidth">Width (Grid Units)</Label>
            <Input
              id="widgetWidth"
              type="number"
              min="1"
              max="12"
              value={selectedWidget.position.width}
              onChange={(e) => updateWidget(selectedWidget.id, {
                position: { ...selectedWidget.position, width: parseInt(e.target.value) || 1 }
              })}
            />
          </div>
          <div>
            <Label htmlFor="widgetHeight">Height (Grid Units)</Label>
            <Input
              id="widgetHeight"
              type="number"
              min="1"
              max="8"
              value={selectedWidget.position.height}
              onChange={(e) => updateWidget(selectedWidget.id, {
                position: { ...selectedWidget.position, height: parseInt(e.target.value) || 1 }
              })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={selectedWidget.style.backgroundColor || '#ffffff'}
            onChange={(e) => updateWidget(selectedWidget.id, {
              style: { ...selectedWidget.style, backgroundColor: e.target.value }
            })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-gray-600">
              Design custom report templates with drag-and-drop widgets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!previewMode && (
          /* Sidebar */
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 m-2">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="p-4 space-y-4">
                {/* Template Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Template Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="templateName">Name</Label>
                      <Input
                        id="templateName"
                        value={templateData.name}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateDescription">Description</Label>
                      <Textarea
                        id="templateDescription"
                        value={templateData.description}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Template description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select
                        value={templateData.category}
                        onValueChange={(value) => setTemplateData(prev => ({ ...prev, category: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Layout Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Layout Template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {LAYOUT_TEMPLATES.map(layout => (
                      <div
                        key={layout.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors",
                          templateData.layout === layout.layout
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setTemplateData(prev => ({ ...prev, layout: layout.layout }))}
                      >
                        <div className="font-medium text-sm">{layout.name}</div>
                        <div className="text-xs text-gray-600">{layout.description}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Widget Palette */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Add Widgets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {WIDGET_TYPES.map(widgetType => (
                      <div
                        key={widgetType.type}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
                        onClick={() => addWidget(widgetType)}
                      >
                        <widgetType.icon className="h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{widgetType.title}</div>
                          <div className="text-xs text-gray-600">{widgetType.description}</div>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="p-4 space-y-4">
                {/* Data Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select
                        value={templateData.dataSources?.dateRange.type}
                        onValueChange={(value) => setTemplateData(prev => ({
                          ...prev,
                          dataSources: {
                            ...prev.dataSources!,
                            dateRange: { type: value as any }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last_week">Last Week</SelectItem>
                          <SelectItem value="last_month">Last Month</SelectItem>
                          <SelectItem value="last_quarter">Last Quarter</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={templateData.dataSources?.includeComparisons}
                          onCheckedChange={(checked) => setTemplateData(prev => ({
                            ...prev,
                            dataSources: {
                              ...prev.dataSources!,
                              includeComparisons: checked
                            }
                          }))}
                        />
                        <Label className="text-sm">Include Comparisons</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={templateData.dataSources?.includeBenchmarks}
                          onCheckedChange={(checked) => setTemplateData(prev => ({
                            ...prev,
                            dataSources: {
                              ...prev.dataSources!,
                              includeBenchmarks: checked
                            }
                          }))}
                        />
                        <Label className="text-sm">Include Benchmarks</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Format */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Export Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={templateData.format}
                      onValueChange={(value) => setTemplateData(prev => ({ ...prev, format: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF Document</SelectItem>
                        <SelectItem value="Excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="PowerPoint">PowerPoint Presentation</SelectItem>
                        <SelectItem value="HTML">HTML Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Widget Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Widget Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderWidgetConfiguration()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style" className="p-4 space-y-4">
                {/* Brand Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Brand Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={templateData.branding?.colors.primary}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding!,
                            colors: {
                              ...prev.branding!.colors,
                              primary: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={templateData.branding?.colors.secondary}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding!,
                            colors: {
                              ...prev.branding!.colors,
                              secondary: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <Input
                        id="accentColor"
                        type="color"
                        value={templateData.branding?.colors.accent}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding!,
                            colors: {
                              ...prev.branding!.colors,
                              accent: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="headingFont">Heading Font</Label>
                      <Select
                        value={templateData.branding?.fonts.heading}
                        onValueChange={(value) => setTemplateData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding!,
                            fonts: {
                              ...prev.branding!.fonts,
                              heading: value
                            }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                          <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia</SelectItem>
                          <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bodyFont">Body Font</Label>
                      <Select
                        value={templateData.branding?.fonts.body}
                        onValueChange={(value) => setTemplateData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding!,
                            fonts: {
                              ...prev.branding!.fonts,
                              body: value
                            }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                          <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia</SelectItem>
                          <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Template Header */}
            <div className="bg-white p-6 rounded-t-lg border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: templateData.branding?.colors.primary }}>
                    {templateData.name || 'Untitled Template'}
                  </h2>
                  <p className="text-gray-600 mt-1">{templateData.description || 'Template description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{templateData.category}</Badge>
                  <Badge variant="secondary">{templateData.format}</Badge>
                </div>
              </div>
            </div>

            {/* Widgets Canvas */}
            <div className="bg-white min-h-96 p-6 rounded-b-lg">
              {templateData.widgets && templateData.widgets.length > 0 ? (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="widgets">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {templateData.widgets.map((widget, index) => (
                          <Draggable key={widget.id} draggableId={widget.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-transform",
                                  snapshot.isDragging && "rotate-2 scale-105"
                                )}
                              >
                                {renderWidgetPreview(widget)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No widgets added yet</p>
                  <p className="text-sm">Add widgets from the sidebar to start building your template</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 