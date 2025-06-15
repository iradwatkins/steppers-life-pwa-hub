import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  BarChart3,
  Users,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  Award,
  RefreshCw,
  Filter,
  Eye,
  MapPin,
  Calendar,
  Zap,
  Building
} from 'lucide-react';
import { IndustryBenchmark, ComparisonEvent } from '@/services/comparativeAnalyticsService';

interface IndustryBenchmarkSectionProps {
  events: ComparisonEvent[];
  benchmarks?: IndustryBenchmark[];
  onRefreshBenchmarks?: () => void;
  loading?: boolean;
}

const IndustryBenchmarkSection: React.FC<IndustryBenchmarkSectionProps> = ({
  events,
  benchmarks = [],
  onRefreshBenchmarks,
  loading = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | 'mega' | 'all'>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock benchmark data
  const mockBenchmarks: IndustryBenchmark[] = [
    {
      category: 'Competition',
      region: 'Midwest',
      event_size: 'medium',
      metrics: {
        avg_attendance_rate: 82.5,
        avg_ticket_price: 48,
        avg_revenue_per_attendee: 42.3,
        avg_marketing_roi: 2.8,
        avg_customer_satisfaction: 4.4,
        avg_repeat_rate: 65.2,
        percentiles: [
          { metric: 'Attendance Rate', p25: 70, p50: 82.5, p75: 90, p90: 95 },
          { metric: 'Revenue per Attendee', p25: 28, p50: 42.3, p75: 58, p90: 75 },
          { metric: 'Customer Satisfaction', p25: 4.0, p50: 4.4, p75: 4.7, p90: 4.9 }
        ]
      },
      sample_size: 342,
      last_updated: new Date().toISOString()
    },
    {
      category: 'Social',
      region: 'Midwest',
      event_size: 'small',
      metrics: {
        avg_attendance_rate: 89.2,
        avg_ticket_price: 25,
        avg_revenue_per_attendee: 22.8,
        avg_marketing_roi: 4.1,
        avg_customer_satisfaction: 4.6,
        avg_repeat_rate: 72.4,
        percentiles: [
          { metric: 'Attendance Rate', p25: 78, p50: 89.2, p75: 95, p90: 98 },
          { metric: 'Revenue per Attendee', p25: 18, p50: 22.8, p75: 28, p90: 35 },
          { metric: 'Customer Satisfaction', p25: 4.2, p50: 4.6, p75: 4.8, p90: 5.0 }
        ]
      },
      sample_size: 158,
      last_updated: new Date().toISOString()
    },
    {
      category: 'Workshop',
      region: 'Midwest',
      event_size: 'small',
      metrics: {
        avg_attendance_rate: 94.1,
        avg_ticket_price: 85,
        avg_revenue_per_attendee: 78.2,
        avg_marketing_roi: 5.2,
        avg_customer_satisfaction: 4.8,
        avg_repeat_rate: 83.6,
        percentiles: [
          { metric: 'Attendance Rate', p25: 88, p50: 94.1, p75: 97, p90: 99 },
          { metric: 'Revenue per Attendee', p25: 65, p50: 78.2, p75: 90, p90: 105 },
          { metric: 'Customer Satisfaction', p25: 4.5, p50: 4.8, p75: 4.9, p90: 5.0 }
        ]
      },
      sample_size: 89,
      last_updated: new Date().toISOString()
    }
  ];

  const activeBenchmarks = benchmarks.length > 0 ? benchmarks : mockBenchmarks;

  // Filter benchmarks
  const filteredBenchmarks = useMemo(() => {
    return activeBenchmarks.filter(benchmark => {
      if (selectedCategory !== 'all' && benchmark.category !== selectedCategory) return false;
      if (selectedRegion !== 'all' && benchmark.region !== selectedRegion) return false;
      if (selectedSize !== 'all' && benchmark.event_size !== selectedSize) return false;
      return true;
    });
  }, [activeBenchmarks, selectedCategory, selectedRegion, selectedSize]);

  // Calculate event vs benchmark comparisons
  const eventBenchmarkComparisons = useMemo(() => {
    return events.map(event => {
      const matchingBenchmark = activeBenchmarks.find(b => 
        b.category === event.category && 
        b.event_size === getEventSize(event.capacity)
      );

      if (!matchingBenchmark) return null;

      return {
        event,
        benchmark: matchingBenchmark,
        comparisons: {
          attendance_rate: {
            event_value: event.metrics.attendance_rate,
            benchmark_value: matchingBenchmark.metrics.avg_attendance_rate,
            performance: getPerformanceLevel(event.metrics.attendance_rate, matchingBenchmark.metrics.avg_attendance_rate)
          },
          revenue_per_attendee: {
            event_value: event.revenue.gross / event.tickets_sold,
            benchmark_value: matchingBenchmark.metrics.avg_revenue_per_attendee,
            performance: getPerformanceLevel(event.revenue.gross / event.tickets_sold, matchingBenchmark.metrics.avg_revenue_per_attendee)
          },
          customer_satisfaction: {
            event_value: event.metrics.customer_satisfaction,
            benchmark_value: matchingBenchmark.metrics.avg_customer_satisfaction,
            performance: getPerformanceLevel(event.metrics.customer_satisfaction, matchingBenchmark.metrics.avg_customer_satisfaction)
          },
          marketing_roi: {
            event_value: event.metrics.marketing_roi,
            benchmark_value: matchingBenchmark.metrics.avg_marketing_roi,
            performance: getPerformanceLevel(event.metrics.marketing_roi, matchingBenchmark.metrics.avg_marketing_roi)
          }
        }
      };
    }).filter(Boolean);
  }, [events, activeBenchmarks]);

  const getEventSize = (capacity: number): 'small' | 'medium' | 'large' | 'mega' => {
    if (capacity < 100) return 'small';
    if (capacity < 500) return 'medium';
    if (capacity < 2000) return 'large';
    return 'mega';
  };

  const getPerformanceLevel = (eventValue: number, benchmarkValue: number): 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor' => {
    const ratio = eventValue / benchmarkValue;
    if (ratio >= 1.2) return 'excellent';
    if (ratio >= 1.1) return 'above_average';
    if (ratio >= 0.9) return 'average';
    if (ratio >= 0.8) return 'below_average';
    return 'poor';
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'above_average': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'below_average': return 'text-orange-600 bg-orange-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'above_average': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'average': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'below_average': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'poor': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  // Prepare chart data
  const benchmarkComparisonData = filteredBenchmarks.map(benchmark => ({
    category: benchmark.category,
    attendance_rate: benchmark.metrics.avg_attendance_rate,
    revenue_per_attendee: benchmark.metrics.avg_revenue_per_attendee,
    customer_satisfaction: benchmark.metrics.avg_customer_satisfaction * 20, // Scale for visualization
    marketing_roi: benchmark.metrics.avg_marketing_roi * 10, // Scale for visualization
    sample_size: benchmark.sample_size
  }));

  const marketPositionData = eventBenchmarkComparisons.map(comparison => {
    if (!comparison) return null;
    return {
      name: comparison.event.name.substring(0, 15) + '...',
      x: comparison.comparisons.attendance_rate.event_value,
      y: comparison.comparisons.revenue_per_attendee.event_value,
      benchmark_x: comparison.comparisons.attendance_rate.benchmark_value,
      benchmark_y: comparison.comparisons.revenue_per_attendee.benchmark_value,
      size: comparison.event.capacity / 10
    };
  }).filter(Boolean);

  const categories = ['all', ...new Set(activeBenchmarks.map(b => b.category))];
  const regions = ['all', ...new Set(activeBenchmarks.map(b => b.region))];
  const sizes = ['all', 'small', 'medium', 'large', 'mega'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              Industry Benchmarks
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshBenchmarks}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select Event Size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map(size => (
                  <SelectItem key={size} value={size}>
                    {size === 'all' ? 'All Sizes' : `${size.charAt(0).toUpperCase() + size.slice(1)} Events`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredBenchmarks.length} benchmark datasets • Total sample: {filteredBenchmarks.reduce((sum, b) => sum + b.sample_size, 0)} events
          </div>
        </CardContent>
      </Card>

      {/* Main Benchmark Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positioning">Market Position</TabsTrigger>
          <TabsTrigger value="percentiles">Percentile Analysis</TabsTrigger>
          <TabsTrigger value="peer-comparison">Peer Comparison</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Event Performance vs Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Your Events vs Industry Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              {eventBenchmarkComparisons.length > 0 ? (
                <div className="space-y-4">
                  {eventBenchmarkComparisons.map((comparison, index) => {
                    if (!comparison) return null;
                    return (
                      <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{comparison.event.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {comparison.event.category} • {getEventSize(comparison.event.capacity)} event • {comparison.event.location.city}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Sample: {comparison.benchmark.sample_size} events
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(comparison.comparisons).map(([metric, data]) => (
                            <div key={metric} className="text-center p-3 bg-muted/30 rounded">
                              <div className="flex items-center justify-center mb-2">
                                {getPerformanceIcon(data.performance)}
                                <span className="ml-2 text-lg font-bold">
                                  {metric === 'revenue_per_attendee' ? `$${data.event_value.toFixed(0)}` : data.event_value.toFixed(1)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">
                                vs avg: {metric === 'revenue_per_attendee' ? `$${data.benchmark_value.toFixed(0)}` : data.benchmark_value.toFixed(1)}
                              </div>
                              <Badge className={`${getPerformanceColor(data.performance)} text-xs`}>
                                {data.performance.replace('_', ' ')}
                              </Badge>
                              <div className="text-xs font-medium mt-1 capitalize">
                                {metric.replace('_', ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h4 className="font-medium text-foreground mb-2">No Benchmark Data Available</h4>
                  <p className="text-sm text-muted-foreground">
                    Select events to compare against industry benchmarks
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benchmark Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendance_rate" fill="#3B82F6" name="Attendance Rate %" />
                    <Bar dataKey="revenue_per_attendee" fill="#10B981" name="Revenue per Attendee $" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Position Tab */}
        <TabsContent value="positioning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Positioning Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={marketPositionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      name="Attendance Rate"
                      unit="%" 
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <YAxis 
                      dataKey="y" 
                      name="Revenue per Attendee"
                      unit="$" 
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Attendance Rate' ? `${value}%` : `$${value}`,
                        name
                      ]}
                    />
                    <Scatter 
                      dataKey="y" 
                      fill="#3B82F6" 
                      name="Your Events"
                    />
                    <Scatter 
                      dataKey="benchmark_y" 
                      fill="#EF4444" 
                      name="Industry Average"
                      shape="diamond"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Blue circles represent your events. Red diamonds show industry averages for comparison.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Percentiles Tab */}
        <TabsContent value="percentiles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBenchmarks.map((benchmark, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {benchmark.category} - {benchmark.event_size} events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benchmark.metrics.percentiles.map((percentile, pIndex) => (
                      <div key={pIndex}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{percentile.metric}</span>
                          <span className="text-xs text-muted-foreground">
                            Sample: {benchmark.sample_size}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>25th</span>
                            <span>50th (Median)</span>
                            <span>75th</span>
                            <span>90th</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium w-12">{percentile.p25}</div>
                            <div className="flex-1 bg-gray-200 h-2 rounded relative">
                              <div 
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded"
                                style={{ width: `${(percentile.p50 / percentile.p90) * 100}%` }}
                              />
                              <div 
                                className="absolute top-0 left-0 h-full bg-green-500 rounded opacity-60"
                                style={{ 
                                  left: `${(percentile.p75 / percentile.p90) * 100}%`,
                                  width: `${((percentile.p90 - percentile.p75) / percentile.p90) * 100}%`
                                }}
                              />
                            </div>
                            <div className="text-xs font-medium w-12">{percentile.p90}</div>
                          </div>
                          <div className="flex justify-center text-xs text-muted-foreground">
                            Median: {percentile.p50}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Peer Comparison Tab */}
        <TabsContent value="peer-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Similar Event Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event, index) => {
                  const peers = mockBenchmarks.filter(b => 
                    b.category === event.category && 
                    b.event_size === getEventSize(event.capacity)
                  );
                  
                  return (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{event.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Finding peers: {event.category} • {getEventSize(event.capacity)} events • {event.location.city}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {peers.reduce((sum, p) => sum + p.sample_size, 0)} peer events
                        </Badge>
                      </div>
                      
                      {peers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">
                              {event.metrics.attendance_rate > peers[0].metrics.avg_attendance_rate ? '+' : ''}
                              {(event.metrics.attendance_rate - peers[0].metrics.avg_attendance_rate).toFixed(1)}%
                            </div>
                            <div className="text-sm text-green-600">vs Peer Attendance</div>
                          </div>
                          
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">
                              {event.revenue.gross / event.tickets_sold > peers[0].metrics.avg_revenue_per_attendee ? '+' : ''}
                              ${((event.revenue.gross / event.tickets_sold) - peers[0].metrics.avg_revenue_per_attendee).toFixed(0)}
                            </div>
                            <div className="text-sm text-blue-600">vs Peer Revenue</div>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="text-lg font-bold text-purple-600">
                              {event.metrics.customer_satisfaction > peers[0].metrics.avg_customer_satisfaction ? '+' : ''}
                              {(event.metrics.customer_satisfaction - peers[0].metrics.avg_customer_satisfaction).toFixed(2)}
                            </div>
                            <div className="text-sm text-purple-600">vs Peer Satisfaction</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No peer events found for comparison</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndustryBenchmarkSection; 