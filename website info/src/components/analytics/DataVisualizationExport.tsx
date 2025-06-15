import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Cell,
  Treemap
} from 'recharts';
import { 
  Download,
  Eye,
  Settings,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  ZoomIn,
  ZoomOut,
  Camera,
  FileText,
  Table,
  Image,
  Share2,
  Maximize,
  Filter,
  Palette
} from 'lucide-react';
import { EventComparison } from '@/services/comparativeAnalyticsService';

interface DataVisualizationExportProps {
  comparison: EventComparison;
  title?: string;
  subtitle?: string;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'radar' | 'treemap' | 'composed';
  metrics: string[];
  timeFrame: 'all' | 'recent' | 'custom';
  aggregation: 'individual' | 'grouped' | 'stacked';
  showTrend: boolean;
  showBrush: boolean;
  showAnimation: boolean;
  colorScheme: 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'custom';
  aspectRatio: 'wide' | 'standard' | 'tall' | 'square';
}

const DataVisualizationExport: React.FC<DataVisualizationExportProps> = ({
  comparison,
  title = "Comparative Analytics Visualization",
  subtitle
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'composed',
    metrics: ['revenue', 'attendance_rate', 'customer_satisfaction'],
    timeFrame: 'all',
    aggregation: 'individual',
    showTrend: true,
    showBrush: false,
    showAnimation: true,
    colorScheme: 'default',
    aspectRatio: 'standard'
  });

  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf' | 'csv' | 'excel' | 'json'>('png');
  const [exportQuality, setExportQuality] = useState(300); // DPI for images
  const [includeData, setIncludeData] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Color schemes
  const colorSchemes = {
    default: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#EC4899', '#06B6D4'],
    pastel: ['#93C5FD', '#FCA5A5', '#86EFAC', '#FDE68A', '#C4B5FD', '#FDBA74', '#F9A8D4', '#67E8F9'],
    vibrant: ['#1E40AF', '#DC2626', '#059669', '#D97706', '#7C3AED', '#EA580C', '#DB2777', '#0891B2'],
    monochrome: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6', '#1F2937', '#4B5563'],
    custom: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD']
  };

  // Metric configurations
  const metricConfigs = {
    revenue: { 
      label: 'Revenue', 
      format: (v: number) => `$${v.toLocaleString()}`, 
      color: '#10B981',
      getValue: (event: any) => event.revenue.gross
    },
    attendance_rate: { 
      label: 'Attendance Rate', 
      format: (v: number) => `${v.toFixed(1)}%`, 
      color: '#3B82F6',
      getValue: (event: any) => event.metrics.attendance_rate
    },
    customer_satisfaction: { 
      label: 'Customer Satisfaction', 
      format: (v: number) => `${v.toFixed(1)}/5.0`, 
      color: '#F59E0B',
      getValue: (event: any) => event.metrics.customer_satisfaction * 20 // Scale for visualization
    },
    marketing_roi: { 
      label: 'Marketing ROI', 
      format: (v: number) => `${v.toFixed(1)}x`, 
      color: '#8B5CF6',
      getValue: (event: any) => event.metrics.marketing_roi * 10 // Scale for visualization
    },
    cost_per_attendee: { 
      label: 'Cost per Attendee', 
      format: (v: number) => `$${v.toFixed(0)}`, 
      color: '#EF4444',
      getValue: (event: any) => event.operational.cost_per_attendee
    },
    check_in_rate: { 
      label: 'Check-in Rate', 
      format: (v: number) => `${v.toFixed(1)}%`, 
      color: '#06B6D4',
      getValue: (event: any) => event.metrics.check_in_rate
    }
  };

  // Process data for visualization
  const chartData = useMemo(() => {
    return comparison.events.map((event, index) => {
      const data: any = {
        name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
        fullName: event.name,
        date: event.date,
        venue: event.venue,
        category: event.category,
        attendees: event.tickets_sold,
        capacity: event.capacity,
        utilization: (event.tickets_sold / event.capacity * 100),
        index
      };

      // Add selected metrics
      chartConfig.metrics.forEach(metric => {
        if (metricConfigs[metric as keyof typeof metricConfigs]) {
          const config = metricConfigs[metric as keyof typeof metricConfigs];
          data[metric] = config.getValue(event);
        }
      });

      return data;
    });
  }, [comparison.events, chartConfig.metrics]);

  // Get aspect ratio dimensions
  const getAspectRatioDimensions = () => {
    switch (chartConfig.aspectRatio) {
      case 'wide': return { width: '100%', height: '300px' };
      case 'tall': return { width: '100%', height: '600px' };
      case 'square': return { width: '100%', height: '500px', aspectRatio: 1 };
      default: return { width: '100%', height: '400px' };
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium text-foreground">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">{data.venue} • {new Date(data.date).toLocaleDateString()}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => {
              const metricConfig = metricConfigs[entry.dataKey as keyof typeof metricConfigs];
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  {metricConfig?.label || entry.name}: {metricConfig?.format(entry.value) || entry.value}
                </p>
              );
            })}
            <div className="text-xs text-muted-foreground mt-2">
              {data.attendees}/{data.capacity} attendees ({data.utilization.toFixed(0)}% capacity)
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render chart based on configuration
  const renderChart = () => {
    const colors = colorSchemes[chartConfig.colorScheme];
    const dimensions = getAspectRatioDimensions();

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    const xAxisProps = {
      dataKey: 'name',
      angle: -45,
      textAnchor: 'end' as const,
      height: 80,
      fontSize: 12
    };

    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {chartConfig.metrics.map((metric, index) => (
                <Bar 
                  key={metric}
                  dataKey={metric} 
                  name={metricConfigs[metric as keyof typeof metricConfigs]?.label}
                  fill={colors[index % colors.length]}
                  animationDuration={chartConfig.showAnimation ? 1000 : 0}
                />
              ))}
              {chartConfig.showBrush && <Brush dataKey="name" height={30} />}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {chartConfig.metrics.map((metric, index) => (
                <Line 
                  key={metric}
                  type="monotone"
                  dataKey={metric} 
                  name={metricConfigs[metric as keyof typeof metricConfigs]?.label}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 6 }}
                  animationDuration={chartConfig.showAnimation ? 1000 : 0}
                />
              ))}
              {chartConfig.showBrush && <Brush dataKey="name" height={30} />}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {chartConfig.metrics.map((metric, index) => (
                <Area 
                  key={metric}
                  type="monotone"
                  dataKey={metric} 
                  name={metricConfigs[metric as keyof typeof metricConfigs]?.label}
                  stackId={chartConfig.aggregation === 'stacked' ? '1' : `area-${index}`}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                  animationDuration={chartConfig.showAnimation ? 1000 : 0}
                />
              ))}
              {chartConfig.showBrush && <Brush dataKey="name" height={30} />}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* First metric as bars */}
              {chartConfig.metrics[0] && (
                <Bar 
                  dataKey={chartConfig.metrics[0]} 
                  name={metricConfigs[chartConfig.metrics[0] as keyof typeof metricConfigs]?.label}
                  fill={colors[0]}
                  fillOpacity={0.8}
                  animationDuration={chartConfig.showAnimation ? 1000 : 0}
                />
              )}
              
              {/* Additional metrics as lines */}
              {chartConfig.metrics.slice(1).map((metric, index) => (
                <Line 
                  key={metric}
                  type="monotone"
                  dataKey={metric} 
                  name={metricConfigs[metric as keyof typeof metricConfigs]?.label}
                  stroke={colors[(index + 1) % colors.length]}
                  strokeWidth={3}
                  dot={{ fill: colors[(index + 1) % colors.length], strokeWidth: 2, r: 4 }}
                  animationDuration={chartConfig.showAnimation ? 1000 : 0}
                />
              ))}
              
              {chartConfig.showBrush && <Brush dataKey="name" height={30} />}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartConfig.metrics.length > 0 ? chartData.map(item => ({
          name: item.name,
          value: item[chartConfig.metrics[0]],
          fullName: item.fullName
        })) : [];
        
        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                animationDuration={chartConfig.showAnimation ? 1000 : 0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [
                metricConfigs[chartConfig.metrics[0] as keyof typeof metricConfigs]?.format(value as number) || value,
                metricConfigs[chartConfig.metrics[0] as keyof typeof metricConfigs]?.label || name
              ]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        const radarData = chartData.map(item => {
          const radarItem: any = { event: item.name };
          chartConfig.metrics.forEach(metric => {
            radarItem[metricConfigs[metric as keyof typeof metricConfigs]?.label || metric] = item[metric];
          });
          return radarItem;
        });

        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              {chartData.map((entry, index) => (
                <Radar
                  key={index}
                  name={entry.fullName}
                  dataKey="value"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.1}
                  animationDuration={chartConfig.showAnimation ? 1000 : 0}
                />
              ))}
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        const treemapData = chartConfig.metrics.length > 0 ? chartData.map(item => ({
          name: item.name,
          size: item[chartConfig.metrics[0]],
          fullName: item.fullName
        })) : [];

        return (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
              animationDuration={chartConfig.showAnimation ? 1000 : 0}
            >
              {treemapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Treemap>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  // Export functions
  const exportChart = async (format: string) => {
    const element = chartRef.current;
    if (!element) return;

    try {
      switch (format) {
        case 'png':
        case 'svg':
          // In a real implementation, you would use html2canvas or similar
          const canvas = document.createElement('canvas');
          canvas.width = element.offsetWidth * (exportQuality / 96);
          canvas.height = element.offsetHeight * (exportQuality / 96);
          
          // Mock implementation - in reality you'd render the chart to canvas
          console.log(`Exporting as ${format} at ${exportQuality} DPI`);
          break;

        case 'pdf':
          // Mock PDF export
          console.log('Exporting as PDF with data:', includeData, 'insights:', includeInsights);
          break;

        case 'csv':
          const csvData = chartData.map(item => {
            const row: any = {
              Event: item.fullName,
              Date: item.date,
              Venue: item.venue,
              Attendees: item.attendees,
              Capacity: item.capacity
            };
            chartConfig.metrics.forEach(metric => {
              const config = metricConfigs[metric as keyof typeof metricConfigs];
              row[config?.label || metric] = item[metric];
            });
            return row;
          });
          
          const csvString = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
          ].join('\n');
          
          const blob = new Blob([csvString], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
          a.click();
          break;

        case 'json':
          const jsonData = {
            title,
            subtitle,
            exportedAt: new Date().toISOString(),
            configuration: chartConfig,
            data: chartData,
            ...(includeInsights && { insights: comparison.insights })
          };
          
          const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          const jsonLink = document.createElement('a');
          jsonLink.href = jsonUrl;
          jsonLink.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
          jsonLink.click();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visualization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand-primary" />
            Visualization Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Chart Configuration</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Chart Type</label>
                  <Select 
                    value={chartConfig.type} 
                    onValueChange={(value: ChartConfig['type']) => 
                      setChartConfig(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="composed">Composed Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="radar">Radar Chart</SelectItem>
                      <SelectItem value="treemap">Treemap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Metrics</label>
                  <Select 
                    value={chartConfig.metrics[0]} 
                    onValueChange={(value) => 
                      setChartConfig(prev => ({ ...prev, metrics: [value, ...prev.metrics.slice(1)] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(metricConfigs).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: config.color }}
                            />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Color Scheme</label>
                  <Select 
                    value={chartConfig.colorScheme} 
                    onValueChange={(value: ChartConfig['colorScheme']) => 
                      setChartConfig(prev => ({ ...prev, colorScheme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Display Options</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Show Animation</label>
                  <Switch
                    checked={chartConfig.showAnimation}
                    onCheckedChange={(checked) => 
                      setChartConfig(prev => ({ ...prev, showAnimation: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Show Brush</label>
                  <Switch
                    checked={chartConfig.showBrush}
                    onCheckedChange={(checked) => 
                      setChartConfig(prev => ({ ...prev, showBrush: checked }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Aspect Ratio</label>
                  <Select 
                    value={chartConfig.aspectRatio} 
                    onValueChange={(value: ChartConfig['aspectRatio']) => 
                      setChartConfig(prev => ({ ...prev, aspectRatio: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wide">Wide (16:9)</SelectItem>
                      <SelectItem value="standard">Standard (4:3)</SelectItem>
                      <SelectItem value="tall">Tall (3:4)</SelectItem>
                      <SelectItem value="square">Square (1:1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Export Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Export Format</label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG Image</SelectItem>
                      <SelectItem value="svg">SVG Vector</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(exportFormat === 'png' || exportFormat === 'svg') && (
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Quality: {exportQuality} DPI
                    </label>
                    <Slider
                      value={[exportQuality]}
                      onValueChange={([value]) => setExportQuality(value)}
                      min={72}
                      max={600}
                      step={24}
                      className="mt-2"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Include Data</label>
                  <Switch
                    checked={includeData}
                    onCheckedChange={setIncludeData}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Include Insights</label>
                  <Switch
                    checked={includeInsights}
                    onCheckedChange={setIncludeInsights}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand-primary" />
                {title}
              </CardTitle>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="flex items-center gap-2"
              >
                <Maximize className="h-4 w-4" />
                {isFullScreen ? 'Exit' : 'Fullscreen'}
              </Button>
              
              <Button
                onClick={() => exportChart(exportFormat)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div 
            ref={chartRef}
            className={`${isFullScreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}
            style={isFullScreen ? { minHeight: '100vh' } : {}}
          >
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-primary" />
            Export Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{chartData.length}</div>
              <div className="text-sm text-blue-600 font-medium">Events</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{chartConfig.metrics.length}</div>
              <div className="text-sm text-green-600 font-medium">Metrics</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{exportFormat.toUpperCase()}</div>
              <div className="text-sm text-purple-600 font-medium">Format</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {exportFormat === 'png' || exportFormat === 'svg' ? `${exportQuality}` : 'N/A'}
              </div>
              <div className="text-sm text-orange-600 font-medium">
                {exportFormat === 'png' || exportFormat === 'svg' ? 'DPI' : 'Quality'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualizationExport; 