import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Target,
  TrendingUp, 
  TrendingDown,
  Equal,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Users,
  DollarSign,
  Star,
  Clock
} from 'lucide-react';
import { EventComparison, IndustryBenchmark } from '@/services/comparativeAnalyticsService';

interface BenchmarkComparisonSectionProps {
  comparison: EventComparison;
  benchmarks: IndustryBenchmark;
  selectedEventIds?: string[];
  onEventSelection?: (eventIds: string[]) => void;
}

const BenchmarkComparisonSection: React.FC<BenchmarkComparisonSectionProps> = ({
  comparison,
  benchmarks,
  selectedEventIds = [],
  onEventSelection
}) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [benchmarkType, setBenchmarkType] = useState<'percentile' | 'category' | 'region'>('percentile');
  const [comparisonMode, setComparisonMode] = useState<'variance' | 'ranking' | 'performance'>('variance');

  const metricOptions = [
    { 
      value: 'revenue', 
      label: 'Revenue per Attendee', 
      icon: DollarSign,
      format: (v: number) => `$${v.toFixed(0)}`,
      benchmark: 'revenue_per_attendee'
    },
    { 
      value: 'attendance_rate', 
      label: 'Attendance Rate', 
      icon: Users,
      format: (v: number) => `${v.toFixed(1)}%`,
      benchmark: 'attendance_rate'
    },
    { 
      value: 'customer_satisfaction', 
      label: 'Customer Satisfaction', 
      icon: Star,
      format: (v: number) => `${v.toFixed(1)}/5.0`,
      benchmark: 'customer_satisfaction'
    },
    { 
      value: 'marketing_roi', 
      label: 'Marketing ROI', 
      icon: TrendingUp,
      format: (v: number) => `${v.toFixed(1)}x`,
      benchmark: 'marketing_roi'
    },
    { 
      value: 'cost_efficiency', 
      label: 'Cost Efficiency', 
      icon: Target,
      format: (v: number) => `$${v.toFixed(0)}`,
      benchmark: 'cost_per_attendee'
    }
  ];

  // Process benchmark comparison data
  const comparisonData = useMemo(() => {
    const selectedMetricInfo = metricOptions.find(m => m.value === selectedMetric);
    if (!selectedMetricInfo) return [];

    return comparison.events.map(event => {
      const getValue = (metric: string) => {
        switch (metric) {
          case 'revenue': return event.revenue.gross / event.tickets_sold;
          case 'attendance_rate': return event.metrics.attendance_rate;
          case 'customer_satisfaction': return event.metrics.customer_satisfaction;
          case 'marketing_roi': return event.metrics.marketing_roi;
          case 'cost_efficiency': return event.operational.cost_per_attendee;
          default: return 0;
        }
      };

      const eventValue = getValue(selectedMetric);
      const benchmarkValue = benchmarks.category_benchmarks[selectedMetricInfo.benchmark];
      const industryMedian = benchmarks.regional_comparison.median_metrics[selectedMetricInfo.benchmark];
      const industryTop25 = benchmarks.performance_percentiles.top_25_percent[selectedMetricInfo.benchmark];
      const industryTop10 = benchmarks.performance_percentiles.top_10_percent[selectedMetricInfo.benchmark];

      // Calculate performance indicators
      const vsIndustryMedian = ((eventValue - industryMedian) / industryMedian * 100);
      const vsTop25 = ((eventValue - industryTop25) / industryTop25 * 100);
      const vsTop10 = ((eventValue - industryTop10) / industryTop10 * 100);

      // Determine performance tier
      let performanceTier: 'exceptional' | 'above_average' | 'average' | 'below_average' = 'below_average';
      let tierColor = '#EF4444';
      
      if (eventValue >= industryTop10) {
        performanceTier = 'exceptional';
        tierColor = '#10B981';
      } else if (eventValue >= industryTop25) {
        performanceTier = 'above_average';
        tierColor = '#3B82F6';
      } else if (eventValue >= industryMedian) {
        performanceTier = 'average';
        tierColor = '#F59E0B';
      }

      // Calculate percentile ranking
      const percentileRanking = (() => {
        if (eventValue >= industryTop10) return 90 + (eventValue - industryTop10) / (industryTop10 * 0.5) * 10;
        if (eventValue >= industryTop25) return 75 + (eventValue - industryTop25) / (industryTop10 - industryTop25) * 15;
        if (eventValue >= industryMedian) return 50 + (eventValue - industryMedian) / (industryTop25 - industryMedian) * 25;
        return Math.max(0, 50 * (eventValue / industryMedian));
      })();

      return {
        eventId: event.id,
        eventName: event.name,
        venue: event.venue,
        date: event.date,
        category: event.category,
        eventValue,
        benchmarkValue,
        industryMedian,
        industryTop25,
        industryTop10,
        vsIndustryMedian,
        vsTop25,
        vsTop10,
        performanceTier,
        tierColor,
        percentileRanking: Math.min(99, Math.max(1, percentileRanking)),
        attendees: event.tickets_sold,
        capacity: event.capacity
      };
    });
  }, [comparison.events, benchmarks, selectedMetric]);

  // Calculate aggregate performance
  const aggregatePerformance = useMemo(() => {
    if (comparisonData.length === 0) return null;

    const avgPercentile = comparisonData.reduce((sum, d) => sum + d.percentileRanking, 0) / comparisonData.length;
    const avgVsMedian = comparisonData.reduce((sum, d) => sum + d.vsIndustryMedian, 0) / comparisonData.length;
    
    const tierCounts = {
      exceptional: comparisonData.filter(d => d.performanceTier === 'exceptional').length,
      above_average: comparisonData.filter(d => d.performanceTier === 'above_average').length,
      average: comparisonData.filter(d => d.performanceTier === 'average').length,
      below_average: comparisonData.filter(d => d.performanceTier === 'below_average').length
    };

    const bestPerformer = comparisonData.reduce((best, current) => 
      current.percentileRanking > best.percentileRanking ? current : best
    );

    const worstPerformer = comparisonData.reduce((worst, current) => 
      current.percentileRanking < worst.percentileRanking ? current : worst
    );

    return {
      avgPercentile,
      avgVsMedian,
      tierCounts,
      bestPerformer,
      worstPerformer,
      totalEvents: comparisonData.length
    };
  }, [comparisonData]);

  const selectedMetricInfo = metricOptions.find(opt => opt.value === selectedMetric);

  const getPerformanceIcon = (tier: string) => {
    switch (tier) {
      case 'exceptional': return <Award className="h-4 w-4 text-green-500" />;
      case 'above_average': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'average': return <Equal className="h-4 w-4 text-yellow-500" />;
      default: return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'exceptional': return 'Top 10%';
      case 'above_average': return 'Top 25%';
      case 'average': return 'Average';
      default: return 'Below Average';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.eventName}</p>
          <p className="text-sm text-muted-foreground">{data.venue}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span style={{ color: payload[0].color }}>Your Event:</span> {selectedMetricInfo?.format(data.eventValue)}
            </p>
            <p className="text-sm text-muted-foreground">
              Industry Median: {selectedMetricInfo?.format(data.industryMedian)}
            </p>
            <p className="text-sm text-muted-foreground">
              Percentile: {data.percentileRanking.toFixed(0)}th
            </p>
            <Badge variant="outline" className="mt-1">
              {getTierLabel(data.performanceTier)}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = comparisonData.map(d => ({
    ...d,
    displayName: d.eventName.length > 20 ? d.eventName.substring(0, 20) + '...' : d.eventName
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-primary" />
              Benchmark Comparison
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
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
              
              <Select value={comparisonMode} onValueChange={(value: 'variance' | 'ranking' | 'performance') => setComparisonMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variance">Variance</SelectItem>
                  <SelectItem value="ranking">Ranking</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Overview */}
      {aggregatePerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {aggregatePerformance.avgPercentile.toFixed(0)}th
                </div>
                <div className="text-sm text-blue-600 font-medium">Avg Percentile</div>
                <div className="text-xs text-muted-foreground mt-1">Industry ranking</div>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${
                aggregatePerformance.avgVsMedian >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-2xl font-bold ${
                  aggregatePerformance.avgVsMedian >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aggregatePerformance.avgVsMedian >= 0 ? '+' : ''}{aggregatePerformance.avgVsMedian.toFixed(1)}%
                </div>
                <div className={`text-sm font-medium ${
                  aggregatePerformance.avgVsMedian >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>vs Industry Median</div>
                <div className="text-xs text-muted-foreground mt-1">Performance gap</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {aggregatePerformance.tierCounts.exceptional + aggregatePerformance.tierCounts.above_average}
                </div>
                <div className="text-sm text-green-600 font-medium">Above Average</div>
                <div className="text-xs text-muted-foreground mt-1">
                  of {aggregatePerformance.totalEvents} events
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {aggregatePerformance.bestPerformer.percentileRanking.toFixed(0)}th
                </div>
                <div className="text-sm text-purple-600 font-medium">Best Event</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {aggregatePerformance.bestPerformer.eventName}
                </div>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Performance Distribution</h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: 'exceptional', label: 'Top 10%', color: 'bg-green-500' },
                  { key: 'above_average', label: 'Top 25%', color: 'bg-blue-500' },
                  { key: 'average', label: 'Average', color: 'bg-yellow-500' },
                  { key: 'below_average', label: 'Below Avg', color: 'bg-red-500' }
                ].map(tier => {
                  const count = aggregatePerformance.tierCounts[tier.key as keyof typeof aggregatePerformance.tierCounts];
                  const percentage = (count / aggregatePerformance.totalEvents * 100);
                  
                  return (
                    <div key={tier.key} className="text-center">
                      <div className="mb-2">
                        <div className={`w-full h-2 ${tier.color} rounded-full opacity-80`} />
                        <Progress value={percentage} className="mt-1 h-1" />
                      </div>
                      <div className="text-sm font-medium">{count} events</div>
                      <div className="text-xs text-muted-foreground">{tier.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benchmark Visualization */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Benchmark Comparison</TabsTrigger>
              <TabsTrigger value="percentile">Percentile Analysis</TabsTrigger>
              <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayName"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    <Bar dataKey="eventValue" name="Your Events">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.tierColor} />
                      ))}
                    </Bar>
                    
                    <ReferenceLine 
                      y={chartData[0]?.industryMedian} 
                      stroke="#94A3B8" 
                      strokeDasharray="3 3"
                      label="Industry Median"
                    />
                    
                    <ReferenceLine 
                      y={chartData[0]?.industryTop25} 
                      stroke="#3B82F6" 
                      strokeDasharray="5 5"
                      label="Top 25%"
                    />
                    
                    <ReferenceLine 
                      y={chartData[0]?.industryTop10} 
                      stroke="#10B981" 
                      strokeDasharray="5 5"
                      label="Top 10%"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="percentile" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayName"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(0)}th percentile`, 'Percentile Ranking']}
                    />
                    <Legend />
                    
                    <Bar dataKey="percentileRanking" name="Percentile Ranking">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.tierColor} />
                      ))}
                    </Bar>
                    
                    <ReferenceLine y={90} stroke="#10B981" strokeDasharray="3 3" label="Top 10%" />
                    <ReferenceLine y={75} stroke="#3B82F6" strokeDasharray="3 3" label="Top 25%" />
                    <ReferenceLine y={50} stroke="#94A3B8" strokeDasharray="3 3" label="Median" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="variance" className="mt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayName"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'vs Industry Median']}
                    />
                    <Legend />
                    
                    <Bar dataKey="vsIndustryMedian" name="% vs Industry Median">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.vsIndustryMedian >= 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                    
                    <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Event Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.map((event) => (
          <Card key={event.eventId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getPerformanceIcon(event.performanceTier)}
                    <span className="truncate">{event.eventName}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {event.venue} • {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  style={{ backgroundColor: event.tierColor, color: 'white' }}
                  className="ml-2"
                >
                  {event.percentileRanking.toFixed(0)}th
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {selectedMetricInfo?.format(event.eventValue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedMetricInfo?.label}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">vs Industry Median</span>
                  <span className={`text-sm font-medium ${
                    event.vsIndustryMedian >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {event.vsIndustryMedian >= 0 ? '+' : ''}{event.vsIndustryMedian.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">vs Top 25%</span>
                  <span className={`text-sm font-medium ${
                    event.vsTop25 >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {event.vsTop25 >= 0 ? '+' : ''}{event.vsTop25.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">vs Top 10%</span>
                  <span className={`text-sm font-medium ${
                    event.vsTop10 >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {event.vsTop10 >= 0 ? '+' : ''}{event.vsTop10.toFixed(1)}%
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Performance Tier</span>
                    <Badge variant="outline">
                      {getTierLabel(event.performanceTier)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Recommendations */}
      {aggregatePerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-primary" />
              Benchmark Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aggregatePerformance.avgVsMedian >= 10 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-700">Strong Industry Performance</div>
                    <div className="text-sm text-green-600">
                      Your events consistently outperform industry benchmarks. Consider sharing successful strategies and expanding to new markets.
                    </div>
                  </div>
                </div>
              )}
              
              {aggregatePerformance.avgVsMedian < -10 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-700">Below Industry Standards</div>
                    <div className="text-sm text-red-600">
                      Focus on analyzing {aggregatePerformance.bestPerformer.eventName} success factors and implementing improvements across all events.
                    </div>
                  </div>
                </div>
              )}
              
              {aggregatePerformance.tierCounts.exceptional > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Top Performer Identified</div>
                    <div className="text-sm text-blue-600">
                      {aggregatePerformance.bestPerformer.eventName} achieved top 10% performance. Study and replicate these success factors.
                    </div>
                  </div>
                </div>
              )}
              
              {aggregatePerformance.tierCounts.below_average > aggregatePerformance.totalEvents / 2 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-700">Improvement Opportunity</div>
                    <div className="text-sm text-yellow-600">
                      Most events are below industry average. Focus on operational improvements and benchmarking best practices.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BenchmarkComparisonSection; 