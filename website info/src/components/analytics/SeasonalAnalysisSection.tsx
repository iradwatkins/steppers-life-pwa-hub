import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  Calendar,
  TrendingUp, 
  TrendingDown,
  Sun,
  Cloud,
  Snowflake,
  Flower,
  Leaf,
  MapPin,
  Clock,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Star,
  Award
} from 'lucide-react';
import { SeasonalTrend, ComparisonEvent } from '@/services/comparativeAnalyticsService';

interface SeasonalAnalysisSectionProps {
  events: ComparisonEvent[];
  category?: string;
  region?: string;
  onCategoryChange?: (category: string) => void;
  onRegionChange?: (region: string) => void;
}

const SeasonalAnalysisSection: React.FC<SeasonalAnalysisSectionProps> = ({
  events,
  category = 'all',
  region = 'all',
  onCategoryChange,
  onRegionChange
}) => {
  const [activeTab, setActiveTab] = useState('seasonal');
  const [selectedMetric, setSelectedMetric] = useState('attendance_rate');
  const [timeRange, setTimeRange] = useState('24_months');

  // Mock seasonal data
  const mockSeasonalData: SeasonalTrend = {
    category: 'Competition',
    region: 'Midwest',
    monthly_patterns: [
      { month: 'January', avg_attendance_rate: 78.2, avg_ticket_price: 42, avg_revenue: 18500, event_count: 12, competition_level: 'low' },
      { month: 'February', avg_attendance_rate: 82.1, avg_ticket_price: 45, avg_revenue: 21200, event_count: 18, competition_level: 'medium' },
      { month: 'March', avg_attendance_rate: 85.3, avg_ticket_price: 48, avg_revenue: 24800, event_count: 22, competition_level: 'medium' },
      { month: 'April', avg_attendance_rate: 89.7, avg_ticket_price: 52, avg_revenue: 28400, event_count: 28, competition_level: 'high' },
      { month: 'May', avg_attendance_rate: 92.4, avg_ticket_price: 55, avg_revenue: 32100, event_count: 35, competition_level: 'high' },
      { month: 'June', avg_attendance_rate: 94.8, avg_ticket_price: 58, avg_revenue: 35600, event_count: 42, competition_level: 'high' },
      { month: 'July', avg_attendance_rate: 96.2, avg_ticket_price: 60, avg_revenue: 38200, event_count: 45, competition_level: 'high' },
      { month: 'August', avg_attendance_rate: 95.1, avg_ticket_price: 58, avg_revenue: 36800, event_count: 43, competition_level: 'high' },
      { month: 'September', avg_attendance_rate: 91.3, avg_ticket_price: 54, avg_revenue: 31500, event_count: 38, competition_level: 'high' },
      { month: 'October', avg_attendance_rate: 87.6, avg_ticket_price: 50, avg_revenue: 27200, event_count: 32, competition_level: 'medium' },
      { month: 'November', avg_attendance_rate: 83.8, avg_ticket_price: 46, avg_revenue: 22900, event_count: 25, competition_level: 'medium' },
      { month: 'December', avg_attendance_rate: 80.4, avg_ticket_price: 44, avg_revenue: 20100, event_count: 20, competition_level: 'low' }
    ],
    seasonal_insights: {
      peak_months: ['June', 'July', 'August'],
      low_months: ['January', 'February', 'December'],
      optimal_pricing_periods: ['May', 'June', 'September'],
      recommended_timing: 'Schedule major events during June-August for maximum attendance and premium pricing. May and September offer good balance of attendance and lower competition.'
    },
    year_over_year_growth: [
      { year: 2022, growth_rate: 8.2, market_trend: 'growing' },
      { year: 2023, growth_rate: 12.4, market_trend: 'growing' },
      { year: 2024, growth_rate: 6.8, market_trend: 'stable' }
    ]
  };

  // Prepare chart data
  const monthlyData = mockSeasonalData.monthly_patterns;
  const yearOverYearData = mockSeasonalData.year_over_year_growth.map(year => ({
    ...year,
    label: year.year.toString()
  }));

  // Event distribution by month
  const eventDistribution = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    events.forEach(event => {
      const month = new Date(event.date).toLocaleString('default', { month: 'long' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    return Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
      benchmark: mockSeasonalData.monthly_patterns.find(p => p.month === month)?.event_count || 0
    }));
  }, [events]);

  // Seasonal performance analysis
  const seasonalPerformance = useMemo(() => {
    const seasons = {
      'Winter': ['December', 'January', 'February'],
      'Spring': ['March', 'April', 'May'],
      'Summer': ['June', 'July', 'August'],
      'Fall': ['September', 'October', 'November']
    };

    return Object.entries(seasons).map(([season, months]) => {
      const seasonEvents = events.filter(event => {
        const eventMonth = new Date(event.date).toLocaleString('default', { month: 'long' });
        return months.includes(eventMonth);
      });

      const avgAttendance = seasonEvents.length > 0 
        ? seasonEvents.reduce((sum, event) => sum + event.metrics.attendance_rate, 0) / seasonEvents.length
        : 0;
      
      const avgRevenue = seasonEvents.length > 0
        ? seasonEvents.reduce((sum, event) => sum + event.revenue.gross, 0) / seasonEvents.length
        : 0;

      const benchmarkData = mockSeasonalData.monthly_patterns.filter(p => months.includes(p.month));
      const benchmarkAttendance = benchmarkData.reduce((sum, p) => sum + p.avg_attendance_rate, 0) / benchmarkData.length;
      const benchmarkRevenue = benchmarkData.reduce((sum, p) => sum + p.avg_revenue, 0) / benchmarkData.length;

      return {
        season,
        events: seasonEvents.length,
        avgAttendance,
        avgRevenue,
        benchmarkAttendance,
        benchmarkRevenue,
        performance: avgAttendance > benchmarkAttendance ? 'above' : avgAttendance < benchmarkAttendance ? 'below' : 'average'
      };
    });
  }, [events]);

  // Optimal timing recommendations
  const timingRecommendations = useMemo(() => {
    const recommendations = [];

    // Peak season recommendation
    const peakMonths = mockSeasonalData.seasonal_insights.peak_months;
    const peakData = mockSeasonalData.monthly_patterns.filter(p => peakMonths.includes(p.month));
    const avgPeakAttendance = peakData.reduce((sum, p) => sum + p.avg_attendance_rate, 0) / peakData.length;
    
    recommendations.push({
      title: 'Peak Season Strategy',
      timing: peakMonths.join(', '),
      reason: `${avgPeakAttendance.toFixed(1)}% average attendance during peak months`,
      impact: 'High attendance but high competition',
      recommendation: 'Book venues early and invest in premium marketing for peak season events',
      confidence: 'high' as const
    });

    // Shoulder season recommendation
    const shoulderMonths = ['May', 'September'];
    const shoulderData = mockSeasonalData.monthly_patterns.filter(p => shoulderMonths.includes(p.month));
    const avgShoulderAttendance = shoulderData.reduce((sum, p) => sum + p.avg_attendance_rate, 0) / shoulderData.length;
    
    recommendations.push({
      title: 'Shoulder Season Opportunity',
      timing: shoulderMonths.join(', '),
      reason: `${avgShoulderAttendance.toFixed(1)}% attendance with medium competition`,
      impact: 'Good balance of attendance and market opportunity',
      recommendation: 'Ideal for new event launches or experimental formats',
      confidence: 'high' as const
    });

    // Off-season strategy
    const lowMonths = mockSeasonalData.seasonal_insights.low_months;
    recommendations.push({
      title: 'Off-Season Strategy',
      timing: lowMonths.join(', '),
      reason: 'Lower competition but reduced demand',
      impact: 'Focus on loyal customers and premium experiences',
      recommendation: 'Host intimate workshops or special member-only events',
      confidence: 'medium' as const
    });

    return recommendations;
  }, []);

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'Winter': return <Snowflake className="h-4 w-4 text-blue-500" />;
      case 'Spring': return <Flower className="h-4 w-4 text-green-500" />;
      case 'Summer': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'Fall': return <Leaf className="h-4 w-4 text-orange-500" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'above': return 'text-green-600 bg-green-50';
      case 'below': return 'text-red-600 bg-red-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const categories = ['all', ...new Set(events.map(e => e.category))];
  const regions = ['all', ...new Set(events.map(e => e.location.state))];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-primary" />
              Seasonal Analysis & Timing Optimization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12_months">12 Months</SelectItem>
                  <SelectItem value="24_months">24 Months</SelectItem>
                  <SelectItem value="36_months">36 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={region} onValueChange={onRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(reg => (
                  <SelectItem key={reg} value={reg}>
                    {reg === 'all' ? 'All Regions' : reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="seasonal">Seasonal Patterns</TabsTrigger>
          <TabsTrigger value="timing">Optimal Timing</TabsTrigger>
          <TabsTrigger value="trends">Year-over-Year</TabsTrigger>
          <TabsTrigger value="competition">Market Competition</TabsTrigger>
        </TabsList>

        {/* Seasonal Patterns Tab */}
        <TabsContent value="seasonal" className="space-y-6">
          {/* Monthly Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Performance Patterns</CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance_rate">Attendance Rate</SelectItem>
                    <SelectItem value="avg_revenue">Average Revenue</SelectItem>
                    <SelectItem value="avg_ticket_price">Average Ticket Price</SelectItem>
                    <SelectItem value="event_count">Event Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#1D4ED8"
                      strokeWidth={3}
                      dot={{ fill: '#1D4ED8', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {seasonalPerformance.map((season) => (
                  <div key={season.season} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getSeasonIcon(season.season)}
                        <h4 className="font-semibold">{season.season}</h4>
                      </div>
                      <Badge className={getPerformanceColor(season.performance)}>
                        {season.performance}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Events:</span>
                        <span className="font-medium">{season.events}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Attendance:</span>
                        <span className="font-medium">{season.avgAttendance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Revenue:</span>
                        <span className="font-medium">${season.avgRevenue.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Benchmark: {season.benchmarkAttendance.toFixed(1)}% attendance
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimal Timing Tab */}
        <TabsContent value="timing" className="space-y-6">
          {/* Timing Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-brand-primary" />
                Optimal Timing Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timingRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.timing}</p>
                      </div>
                      <Badge className={rec.confidence === 'high' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}>
                        {rec.confidence} confidence
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><strong>Analysis:</strong> {rec.reason}</p>
                      <p><strong>Impact:</strong> {rec.impact}</p>
                      <p><strong>Recommendation:</strong> {rec.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Competition Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Competition Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyData.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium w-20">{month.month}</span>
                      <div className="text-sm text-muted-foreground">
                        {month.event_count} events • ${month.avg_ticket_price} avg price
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="font-medium">{month.avg_attendance_rate.toFixed(1)}%</span>
                        <span className="text-muted-foreground"> attendance</span>
                      </div>
                      <Badge className={getCompetitionColor(month.competition_level)}>
                        {month.competition_level} competition
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Year-over-Year Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Growth Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearOverYearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                    <Bar dataKey="growth_rate" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Growth Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yearOverYearData.map((yearData) => (
              <Card key={yearData.year}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {yearData.growth_rate > 0 ? '+' : ''}{yearData.growth_rate}%
                    </div>
                    <div className="text-lg font-semibold text-muted-foreground mb-3">
                      {yearData.year}
                    </div>
                    <Badge className={
                      yearData.market_trend === 'growing' ? 'bg-green-50 text-green-600' :
                      yearData.market_trend === 'stable' ? 'bg-blue-50 text-blue-600' :
                      'bg-orange-50 text-orange-600'
                    }>
                      {yearData.market_trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competition Tab */}
        <TabsContent value="competition" className="space-y-6">
          {/* Event Distribution vs Benchmark */}
          <Card>
            <CardHeader>
              <CardTitle>Your Event Distribution vs Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Your Events" />
                    <Bar dataKey="benchmark" fill="#EF4444" name="Market Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-primary" />
                Key Seasonal Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Opportunities
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">May Sweet Spot</div>
                      <div className="text-sm text-green-600">92% attendance with medium competition</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">September Balance</div>
                      <div className="text-sm text-green-600">Good attendance as competition decreases</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Challenges
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-orange-50 rounded">
                      <div className="font-medium text-orange-800">Summer Saturation</div>
                      <div className="text-sm text-orange-600">High competition despite peak demand</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <div className="font-medium text-orange-800">Winter Lull</div>
                      <div className="text-sm text-orange-600">Lower attendance requires premium positioning</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeasonalAnalysisSection; 