import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Equal,
  Users,
  DollarSign,
  Star,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { EventComparison } from '@/services/comparativeAnalyticsService';

interface ComparisonChartsSectionProps {
  comparison: EventComparison;
  onMetricChange?: (metric: string) => void;
}

const ComparisonChartsSection: React.FC<ComparisonChartsSectionProps> = ({
  comparison,
  onMetricChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar'>('bar');

  const metricOptions = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign },
    { value: 'attendance_rate', label: 'Attendance Rate', icon: Users },
    { value: 'customer_satisfaction', label: 'Customer Satisfaction', icon: Star },
    { value: 'marketing_roi', label: 'Marketing ROI', icon: TrendingUp },
    { value: 'check_in_rate', label: 'Check-in Rate', icon: Target },
    { value: 'cost_per_attendee', label: 'Cost per Attendee', icon: DollarSign }
  ];

  // Prepare data for charts
  const barChartData = comparison.events.map(event => ({
    name: event.name.length > 20 ? event.name.substring(0, 20) + '...' : event.name,
    fullName: event.name,
    revenue: event.revenue.gross,
    attendance_rate: event.metrics.attendance_rate,
    customer_satisfaction: event.metrics.customer_satisfaction * 20, // Scale to 100 for better visualization
    marketing_roi: event.metrics.marketing_roi * 10, // Scale for better visualization
    check_in_rate: event.metrics.check_in_rate,
    cost_per_attendee: event.operational.cost_per_attendee,
    capacity: event.capacity,
    tickets_sold: event.tickets_sold
  }));

  const radarChartData = comparison.events.map(event => ({
    event: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
    fullName: event.name,
    Financial: Math.round((event.revenue.gross / event.capacity) / 100 * 100), // Revenue per capacity normalized
    Operational: event.metrics.attendance_rate,
    Marketing: event.metrics.marketing_roi * 10,
    'Customer Experience': event.metrics.customer_satisfaction * 20,
    Efficiency: event.metrics.check_in_rate
  }));

  const pieChartData = comparison.events.map(event => ({
    name: event.name,
    value: event.revenue.gross,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  // Get comparison insights
  const getMetricComparison = (metric: string) => {
    const values = comparison.events.map(event => {
      switch (metric) {
        case 'revenue':
          return event.revenue.gross;
        case 'attendance_rate':
          return event.metrics.attendance_rate;
        case 'customer_satisfaction':
          return event.metrics.customer_satisfaction;
        case 'marketing_roi':
          return event.metrics.marketing_roi;
        case 'check_in_rate':
          return event.metrics.check_in_rate;
        case 'cost_per_attendee':
          return event.operational.cost_per_attendee;
        default:
          return 0;
      }
    });

    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const bestIndex = values.indexOf(max);
    const worstIndex = values.indexOf(min);

    return {
      max,
      min,
      avg,
      range: max - min,
      bestEvent: comparison.events[bestIndex],
      worstEvent: comparison.events[worstIndex],
      improvement: ((max - min) / min * 100).toFixed(1)
    };
  };

  const currentMetricData = getMetricComparison(selectedMetric);
  const selectedMetricInfo = metricOptions.find(opt => opt.value === selectedMetric);

  const getTrendIcon = (value: number, average: number) => {
    if (value > average * 1.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < average * 0.9) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Equal className="h-4 w-4 text-yellow-500" />;
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'revenue':
      case 'cost_per_attendee':
        return `$${value.toLocaleString()}`;
      case 'attendance_rate':
      case 'check_in_rate':
        return `${value.toFixed(1)}%`;
      case 'customer_satisfaction':
        return `${value.toFixed(1)}/5.0`;
      case 'marketing_roi':
        return `${value.toFixed(1)}x`;
      default:
        return value.toFixed(1);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{payload[0].payload.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value, selectedMetric)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              Comparison Visualization
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedMetric} onValueChange={(value) => {
                setSelectedMetric(value);
                onMetricChange?.(value);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'radar') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Metric Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatValue(currentMetricData.max, selectedMetric)}
              </div>
              <div className="text-sm text-green-600 font-medium">Best Performance</div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentMetricData.bestEvent.name}
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatValue(currentMetricData.avg, selectedMetric)}
              </div>
              <div className="text-sm text-blue-600 font-medium">Average</div>
              <div className="text-xs text-muted-foreground mt-1">
                Across all events
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatValue(currentMetricData.min, selectedMetric)}
              </div>
              <div className="text-sm text-red-600 font-medium">Lowest Performance</div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentMetricData.worstEvent.name}
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {currentMetricData.improvement}%
              </div>
              <div className="text-sm text-orange-600 font-medium">Improvement Potential</div>
              <div className="text-xs text-muted-foreground mt-1">
                From worst to best
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="main-chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="main-chart">Main Comparison</TabsTrigger>
              <TabsTrigger value="multi-metric">Multi-Metric View</TabsTrigger>
              <TabsTrigger value="performance-radar">Performance Radar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main-chart" className="mt-6">
              <div className="h-96">
                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey={selectedMetric} 
                        fill="#3B82F6"
                        name={selectedMetricInfo?.label}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {chartType === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                        name={selectedMetricInfo?.label}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                
                {chartType === 'radar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarChartData[0] ? [radarChartData[0]] : []}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar
                        name={radarChartData[0]?.event || 'Event'}
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="multi-metric" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="attendance_rate" fill="#10B981" name="Attendance Rate" />
                    <Bar dataKey="customer_satisfaction" fill="#F59E0B" name="Satisfaction (×20)" />
                    <Bar dataKey="marketing_roi" fill="#EF4444" name="Marketing ROI (×10)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="performance-radar" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="event" />
                    <PolarRadiusAxis />
                    {radarChartData.map((entry, index) => (
                      <Radar
                        key={index}
                        name={entry.fullName}
                        dataKey="value"
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.1}
                      />
                    ))}
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Event Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparison.events.map((event, index) => {
          const currentValue = (() => {
            switch (selectedMetric) {
              case 'revenue': return event.revenue.gross;
              case 'attendance_rate': return event.metrics.attendance_rate;
              case 'customer_satisfaction': return event.metrics.customer_satisfaction;
              case 'marketing_roi': return event.metrics.marketing_roi;
              case 'check_in_rate': return event.metrics.check_in_rate;
              case 'cost_per_attendee': return event.operational.cost_per_attendee;
              default: return 0;
            }
          })();

          return (
            <Card key={event.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {event.venue}, {event.location.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(currentValue, currentMetricData.avg)}
                    <Badge variant={index === 0 ? 'default' : 'outline'}>
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {formatValue(currentValue, selectedMetric)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedMetricInfo?.label}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {event.tickets_sold}/{event.capacity}
                    </div>
                    <div className="text-muted-foreground">Attendance</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      ${event.revenue.gross.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {event.metrics.customer_satisfaction.toFixed(1)}★
                    </div>
                    <div className="text-muted-foreground">Satisfaction</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {event.metrics.marketing_roi.toFixed(1)}x
                    </div>
                    <div className="text-muted-foreground">Marketing ROI</div>
                  </div>
                </div>
              </CardContent>
              
              {currentValue === currentMetricData.max && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500 text-white">Best</Badge>
                </div>
              )}
              
              {currentValue === currentMetricData.min && comparison.events.length > 1 && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive">Needs Improvement</Badge>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Top Performers</h4>
              <div className="space-y-2">
                {comparison.insights.success_factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-green-800">{factor.factor}</div>
                      <div className="text-sm text-green-600">{factor.impact_description}</div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {Math.abs(factor.correlation).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Key Differences</h4>
              <div className="space-y-2">
                {comparison.insights.key_differences.map((diff, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                    diff.significance === 'high' ? 'bg-red-50' :
                    diff.significance === 'medium' ? 'bg-orange-50' :
                    'bg-blue-50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      diff.significance === 'high' ? 'bg-red-500' :
                      diff.significance === 'medium' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        diff.significance === 'high' ? 'text-red-800' :
                        diff.significance === 'medium' ? 'text-orange-800' :
                        'text-blue-800'
                      }`}>
                        {diff.metric}
                      </div>
                      <div className={`text-sm ${
                        diff.significance === 'high' ? 'text-red-600' :
                        diff.significance === 'medium' ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {diff.explanation}
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      diff.significance === 'high' ? 'text-red-600 border-red-200' :
                      diff.significance === 'medium' ? 'text-orange-600 border-orange-200' :
                      'text-blue-600 border-blue-200'
                    }>
                      {diff.significance}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonChartsSection; 