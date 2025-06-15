import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Clock
} from 'lucide-react';
import { EventComparison } from '@/services/comparativeAnalyticsService';

interface TrendAnalysisSectionProps {
  comparison: EventComparison;
  timeRange?: 'month' | 'quarter' | 'year' | 'all';
  onTimeRangeChange?: (range: string) => void;
}

const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  comparison,
  timeRange = 'year',
  onTimeRangeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [analysisType, setAnalysisType] = useState<'absolute' | 'growth' | 'relative'>('absolute');
  const [showProjections, setShowProjections] = useState(true);

  const metricOptions = [
    { value: 'revenue', label: 'Revenue', format: (v: number) => `$${v.toLocaleString()}` },
    { value: 'attendance_rate', label: 'Attendance Rate', format: (v: number) => `${v.toFixed(1)}%` },
    { value: 'customer_satisfaction', label: 'Customer Satisfaction', format: (v: number) => `${v.toFixed(1)}/5.0` },
    { value: 'marketing_roi', label: 'Marketing ROI', format: (v: number) => `${v.toFixed(1)}x` },
    { value: 'cost_per_attendee', label: 'Cost per Attendee', format: (v: number) => `$${v.toFixed(0)}` },
    { value: 'check_in_rate', label: 'Check-in Rate', format: (v: number) => `${v.toFixed(1)}%` }
  ];

  // Generate timeline data with trend analysis
  const timelineData = useMemo(() => {
    const sortedEvents = [...comparison.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedEvents.map((event, index) => {
      const date = new Date(event.date);
      const getValue = (metric: string) => {
        switch (metric) {
          case 'revenue': return event.revenue.gross;
          case 'attendance_rate': return event.metrics.attendance_rate;
          case 'customer_satisfaction': return event.metrics.customer_satisfaction * 20; // Scale for visualization
          case 'marketing_roi': return event.metrics.marketing_roi * 10;
          case 'cost_per_attendee': return event.operational.cost_per_attendee;
          case 'check_in_rate': return event.metrics.check_in_rate;
          default: return 0;
        }
      };

      // Calculate growth rates
      const currentValue = getValue(selectedMetric);
      const previousValue = index > 0 ? (() => {
        const prevEvent = sortedEvents[index - 1];
        switch (selectedMetric) {
          case 'revenue': return prevEvent.revenue.gross;
          case 'attendance_rate': return prevEvent.metrics.attendance_rate;
          case 'customer_satisfaction': return prevEvent.metrics.customer_satisfaction * 20;
          case 'marketing_roi': return prevEvent.metrics.marketing_roi * 10;
          case 'cost_per_attendee': return prevEvent.operational.cost_per_attendee;
          case 'check_in_rate': return prevEvent.metrics.check_in_rate;
          default: return 0;
        }
      })() : currentValue;

      const growthRate = index > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        eventName: event.name,
        value: currentValue,
        growthRate,
        attendees: event.tickets_sold,
        capacity: event.capacity,
        venue: event.venue,
        revenue: event.revenue.gross,
        monthYear: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        quarter: `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`,
        year: date.getFullYear().toString()
      };
    });
  }, [comparison.events, selectedMetric]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (timelineData.length < 2) return null;

    const values = timelineData.map(d => d.value);
    const growthRates = timelineData.slice(1).map(d => d.growthRate);
    
    const totalGrowth = ((values[values.length - 1] - values[0]) / values[0] * 100);
    const averageGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const volatility = Math.sqrt(growthRates.reduce((sum, rate) => sum + Math.pow(rate - averageGrowth, 2), 0) / growthRates.length);
    
    const trend = totalGrowth > 5 ? 'positive' : totalGrowth < -5 ? 'negative' : 'stable';
    const momentum = growthRates.slice(-3).reduce((sum, rate) => sum + rate, 0) / Math.min(3, growthRates.length);

    return {
      totalGrowth,
      averageGrowth,
      volatility,
      trend,
      momentum,
      bestPeriod: timelineData[values.indexOf(Math.max(...values))],
      worstPeriod: timelineData[values.indexOf(Math.min(...values))]
    };
  }, [timelineData]);

  // Generate projections
  const projectionData = useMemo(() => {
    if (!showProjections || timelineData.length < 3) return [];

    const recentValues = timelineData.slice(-3).map(d => d.value);
    const averageGrowth = trendStats?.averageGrowth || 0;
    const lastValue = recentValues[recentValues.length - 1];

    return [1, 2, 3].map(months => {
      const projectedValue = lastValue * Math.pow(1 + (averageGrowth / 100), months / timelineData.length);
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + months);
      
      return {
        date: projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: projectedValue,
        isProjection: true
      };
    });
  }, [timelineData, trendStats, showProjections]);

  const combinedData = [...timelineData, ...projectionData];

  const selectedMetricInfo = metricOptions.find(opt => opt.value === selectedMetric);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.eventName || label}</p>
          <p className="text-sm text-muted-foreground">{data.fullDate ? new Date(data.fullDate).toLocaleDateString() : 'Projected'}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {selectedMetricInfo?.format(entry.value) || entry.value}
            </p>
          ))}
          {data.growthRate !== undefined && (
            <p className="text-sm text-muted-foreground">
              Growth: {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
            </p>
          )}
          {data.isProjection && (
            <Badge variant="outline" className="mt-1">Projected</Badge>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-primary" />
              Trend Analysis
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={analysisType} onValueChange={(value: 'absolute' | 'growth' | 'relative') => setAnalysisType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="growth">Growth %</SelectItem>
                  <SelectItem value="relative">Relative</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showProjections ? "default" : "outline"}
                size="sm"
                onClick={() => setShowProjections(!showProjections)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Projections
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trend Summary */}
      {trendStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              Trend Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`text-center p-4 rounded-lg ${trendStats.trend === 'positive' ? 'bg-green-50' : trendStats.trend === 'negative' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center justify-center mb-2">
                  {getTrendIcon(trendStats.trend)}
                </div>
                <div className={`text-2xl font-bold ${getTrendColor(trendStats.trend)}`}>
                  {trendStats.totalGrowth > 0 ? '+' : ''}{trendStats.totalGrowth.toFixed(1)}%
                </div>
                <div className={`text-sm font-medium ${getTrendColor(trendStats.trend)}`}>Total Growth</div>
                <div className="text-xs text-muted-foreground mt-1">Overall period</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {trendStats.averageGrowth > 0 ? '+' : ''}{trendStats.averageGrowth.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600 font-medium">Avg Growth</div>
                <div className="text-xs text-muted-foreground mt-1">Per period</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {trendStats.volatility.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600 font-medium">Volatility</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {trendStats.volatility < 15 ? 'Low' : trendStats.volatility < 30 ? 'Medium' : 'High'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {trendStats.momentum > 0 ? '+' : ''}{trendStats.momentum.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-600 font-medium">Recent Momentum</div>
                <div className="text-xs text-muted-foreground mt-1">Last 3 events</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Visualization */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
              <TabsTrigger value="comparative">Comparative Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    <Area
                      dataKey="value"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                      stroke="none"
                      name={`${selectedMetricInfo?.label} Trend`}
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      name={selectedMetricInfo?.label}
                    />
                    
                    {showProjections && (
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        name="Projection"
                        connectNulls={false}
                      />
                    )}
                    
                    {trendStats && (
                      <ReferenceLine 
                        y={timelineData.reduce((sum, d) => sum + d.value, 0) / timelineData.length} 
                        stroke="#94A3B8" 
                        strokeDasharray="3 3"
                        label="Average"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="growth" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timelineData.slice(1)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth Rate']}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload;
                        return data?.eventName || label;
                      }}
                    />
                    <Legend />
                    
                    <Bar
                      dataKey="growthRate"
                      fill={(dataPoint: any) => dataPoint.growthRate >= 0 ? '#10B981' : '#EF4444'}
                      name="Growth Rate (%)"
                    />
                    
                    <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="comparative" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
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
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name={selectedMetricInfo?.label}
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="attendees"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Attendees"
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Key Insights and Recommendations */}
      {trendStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-primary" />
              Trend Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Best Performance Period
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-700">{trendStats.bestPeriod.eventName}</div>
                    <div className="text-sm text-green-600">
                      {selectedMetricInfo?.format(trendStats.bestPeriod.value)} on {new Date(trendStats.bestPeriod.fullDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {trendStats.bestPeriod.attendees} attendees at {trendStats.bestPeriod.venue}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Area for Improvement
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="font-medium text-red-700">{trendStats.worstPeriod.eventName}</div>
                    <div className="text-sm text-red-600">
                      {selectedMetricInfo?.format(trendStats.worstPeriod.value)} on {new Date(trendStats.worstPeriod.fullDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      {trendStats.worstPeriod.attendees} attendees at {trendStats.worstPeriod.venue}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-medium text-foreground mb-3">Strategic Recommendations</h4>
                <div className="space-y-2">
                  {trendStats.trend === 'positive' && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-700">Positive Trend Detected</div>
                        <div className="text-sm text-blue-600">
                          Continue current strategies. Consider scaling successful elements from {trendStats.bestPeriod.eventName} to future events.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {trendStats.trend === 'negative' && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-700">Declining Trend</div>
                        <div className="text-sm text-red-600">
                          Analyze factors that led to decline. Consider implementing changes based on {trendStats.bestPeriod.eventName} success factors.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {trendStats.volatility > 25 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-700">High Volatility</div>
                        <div className="text-sm text-yellow-600">
                          Performance varies significantly between events. Consider standardizing successful processes.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {Math.abs(trendStats.momentum) > 10 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-purple-700">Strong Recent Momentum</div>
                        <div className="text-sm text-purple-600">
                          Recent events show {trendStats.momentum > 0 ? 'positive' : 'negative'} momentum. 
                          {trendStats.momentum > 0 ? ' Capitalize on this trend.' : ' Address issues promptly.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrendAnalysisSection; 