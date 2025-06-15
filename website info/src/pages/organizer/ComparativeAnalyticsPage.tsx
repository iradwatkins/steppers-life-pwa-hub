import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Share2, 
  RefreshCw, 
  Calendar,
  Target,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Lightbulb,
  Award,
  X,
  Team,
  BrainCircuit
} from 'lucide-react';
import { useComparativeAnalytics } from '@/hooks/useComparativeAnalytics';
import EventComparisonSelector from '@/components/analytics/EventComparisonSelector';
import ComparisonChartsSection from '@/components/analytics/ComparisonChartsSection';
import PerformanceMetricsTable from '@/components/analytics/PerformanceMetricsTable';
import PerformanceScoringSection from '@/components/analytics/PerformanceScoringSection';
import SuccessFactorAnalysis from '@/components/analytics/SuccessFactorAnalysis';
import MarketAnalysisSection from '@/components/analytics/MarketAnalysisSection';
import VenueAnalysisSection from '@/components/analytics/VenueAnalysisSection';
import PricingAnalyticsSection from '@/components/analytics/PricingAnalyticsSection';
import MarketingAnalyticsSection from '@/components/analytics/MarketingAnalyticsSection';
import TeamPerformanceSection from '@/components/analytics/TeamPerformanceSection';
import PredictiveAnalyticsSection from '@/components/analytics/PredictiveAnalyticsSection';
import { toast } from 'sonner';

const ComparativeAnalyticsPage: React.FC = () => {
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [comparisonType, setComparisonType] = useState<'event_to_event' | 'time_period' | 'venue_comparison' | 'category_analysis'>('event_to_event');
  const [activeTab, setActiveTab] = useState('selector');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    state,
    compareEvents,
    calculatePerformanceScores,
    analyzeSuccessFactors,
    exportComparisonData,
    refreshData,
    clearComparison,
    fetchMarketPositioningData,
    fetchSeasonalTrendData,
    fetchVenueComparisonData,
    fetchPricingAnalytics,
    fetchMarketingChannelPerformance,
    fetchTeamPerformance,
    fetchPredictiveAnalytics,
  } = useComparativeAnalytics();

  // Handle event selection and automatic comparison
  useEffect(() => {
    if (selectedEventIds.length >= 2 && !state.loading) {
      handleCompareAndAnalyzeEvents();
    }
    if (activeTab === 'market-analysis' && selectedEventIds.length > 0) {
        selectedEventIds.forEach(eventId => fetchMarketPositioningData(eventId));
    }
    if (activeTab === 'pricing-analytics' && selectedEventIds.length > 0) {
        selectedEventIds.forEach(eventId => fetchPricingAnalytics(eventId));
    }
    if (activeTab === 'marketing-analytics' && selectedEventIds.length > 0) {
        selectedEventIds.forEach(eventId => fetchMarketingChannelPerformance(eventId));
    }
    if (activeTab === 'predictive-analytics' && selectedEventIds.length > 0) {
        selectedEventIds.forEach(eventId => fetchPredictiveAnalytics(eventId));
    }
  }, [selectedEventIds, activeTab]);

  useEffect(() => {
    if (activeTab === 'market-analysis' && !state.seasonalAnalysis.current) {
        fetchSeasonalTrendData();
    }
    if (activeTab === 'venue-analysis' && Object.keys(state.venueAnalysis).length === 0) {
        fetchVenueComparisonData();
    }
    if (activeTab === 'team-performance' && Object.keys(state.teamPerformance).length === 0) {
        fetchTeamPerformance();
    }
  }, [activeTab]);

  const handleCompareAndAnalyzeEvents = async () => {
    if (selectedEventIds.length < 1) {
      toast.error('Please select at least 1 event to analyze');
      return;
    }

    const comparisonResult = await compareEvents(selectedEventIds);
    if (comparisonResult) {
      setActiveTab('charts');
      await calculatePerformanceScores(selectedEventIds);
      await analyzeSuccessFactors(selectedEventIds);
      toast.success('Events compared, scores calculated, and factors analyzed.');
    }
  };

  const handleExportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    let dataToExport: any[] = [];
    let fileNamePrefix = 'comparative-analytics';

    switch (activeTab) {
      case 'charts':
      case 'metrics':
      case 'performance-insights':
        dataToExport = state.comparisonData;
        fileNamePrefix = 'event-comparison';
        break;
      case 'market-analysis':
        dataToExport = [...Object.values(state.marketPositioning), ...(state.seasonalAnalysis.current ? Object.values(state.seasonalAnalysis.current) : [])];
        fileNamePrefix = 'market-analysis';
        break;
      case 'venue-analysis':
        dataToExport = Object.values(state.venueAnalysis).flat();
        fileNamePrefix = 'venue-analysis';
        break;
      case 'pricing-analytics':
        dataToExport = Object.values(state.pricingAnalytics);
        fileNamePrefix = 'pricing-analytics';
        break;
      case 'marketing-analytics':
        dataToExport = Object.values(state.marketingChannelPerformance).flat();
        fileNamePrefix = 'marketing-analytics';
        break;
      case 'team-performance':
        dataToExport = Object.values(state.teamPerformance);
        fileNamePrefix = 'team-performance';
        break;
      case 'predictive-analytics':
        dataToExport = Object.values(state.predictiveModels);
        fileNamePrefix = 'predictive-analytics';
        break;
      default:
        toast.error('No data available for export in the current tab.');
        return;
    }

    if (!dataToExport || dataToExport.length === 0) {
      toast.error('No data to export for the current view.');
      return;
    }

    const filename = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.${format}`;

    try {
      await exportComparisonData(dataToExport, format as 'CSV' | 'Excel' | 'PDF' | 'JSON', filename);
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    }
  };

  const handleShareInsights = async () => {
    if (!state.comparisonData || state.comparisonData.length === 0) return;

    try {
      const eventNames = state.comparisonData.map(e => e.eventName).join(', ');
      const shareData = {
        title: `Event Comparison: ${eventNames}`,
        text: `Check out this event performance comparison for ${state.comparisonData.length} events analyzed.`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Comparison link copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share insights');
    }
  };

  const getComparisonSummary = () => {
    if (!state.comparisonData || state.comparisonData.length === 0) return null;

    const bestPerformer = state.comparisonData.reduce((prev, current) => (prev.totalRevenue > current.totalRevenue) ? prev : current, state.comparisonData[0]);
    const worstPerformer = state.comparisonData.reduce((prev, current) => (prev.totalRevenue < current.totalRevenue) ? prev : current, state.comparisonData[0]);
    
    return {
      bestPerformerName: bestPerformer?.eventName,
      worstPerformerName: worstPerformer?.eventName,
      totalRevenue: state.comparisonData.reduce((sum, event) => sum + event.totalRevenue, 0),
      avgAttendanceRate: state.comparisonData.reduce((sum, event) => sum + event.sellThroughRate, 0) / state.comparisonData.length,
      totalAttendees: state.comparisonData.reduce((sum, event) => sum + event.ticketsSold, 0),
      keyInsightsCount: state.successFactors?.insights?.length || 0
    };
  };

  const summary = getComparisonSummary();
  const hasComparisonData = state.comparisonData && state.comparisonData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Comparative Analytics & Benchmarking
              </h1>
              <p className="text-lg text-muted-foreground">
                Compare event performance, analyze trends, and benchmark against industry standards
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {state.refreshing ? 'Refreshing...' : 'Auto Refresh'}
              </Button>
              
              {hasComparisonData && (
                <>
                  <Button variant="outline" onClick={handleShareInsights}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport('csv')}
                      disabled={!hasComparisonData || state.exportLoading}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport('excel')}
                      disabled={!hasComparisonData || state.exportLoading}
                    >
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport('pdf')}
                      disabled={!hasComparisonData || state.exportLoading}
                    >
                      PDF
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {state.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${summary.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                    <p className="text-2xl font-bold text-foreground">
                      {summary.totalAttendees.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Sell-Through</p>
                    <p className="text-2xl font-bold text-foreground">
                      {summary.avgAttendanceRate.toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Key Insights</p>
                    <p className="text-2xl font-bold text-foreground">
                      {summary.keyInsightsCount}
                    </p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 md:grid-cols-8 lg:grid-cols-8 h-12">
            <TabsTrigger value="selector">Select Events</TabsTrigger>
            <TabsTrigger value="charts" disabled={!hasComparisonData}>Comparison Charts</TabsTrigger>
            <TabsTrigger value="metrics" disabled={!hasComparisonData}>Metrics Table</TabsTrigger>
            <TabsTrigger value="performance-insights" disabled={!hasComparisonData}>Performance Insights</TabsTrigger>
            <TabsTrigger value="market-analysis" disabled={!hasComparisonData}>Market Analysis</TabsTrigger>
            <TabsTrigger value="venue-analysis" disabled={!hasComparisonData}>Venue Analysis</TabsTrigger>
            <TabsTrigger value="pricing-analytics" disabled={!hasComparisonData}>Pricing Analytics</TabsTrigger>
            <TabsTrigger value="marketing-analytics" disabled={!hasComparisonData}>Marketing Analytics</TabsTrigger>
            <TabsTrigger value="team-performance" disabled={!hasComparisonData}>Team Performance</TabsTrigger>
            <TabsTrigger value="predictive-analytics" disabled={!hasComparisonData}>Predictive Analytics</TabsTrigger>
          </TabsList>

          {/* Event Selection */}
          <TabsContent value="selector" className="space-y-6">
            <EventComparisonSelector
              selectedEventIds={selectedEventIds}
              onEventsSelected={setSelectedEventIds}
              comparisonType={comparisonType}
              onComparisonTypeChange={setComparisonType}
              maxSelections={10}
            />
            
            {selectedEventIds.length >= 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Ready to Analyze {selectedEventIds.length} Event{selectedEventIds.length === 1 ? '' : 's'}
                      </h3>
                      <p className="text-muted-foreground">
                        Click "Generate Analysis" to view performance metrics, scores, and insights
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleCompareAndAnalyzeEvents}
                      disabled={state.loading}
                      size="lg"
                    >
                      {state.loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comparison Charts */}
          <TabsContent value="charts" className="space-y-6">
            {hasComparisonData ? (
              <ComparisonChartsSection 
                comparison={{
                  name: 'Event Comparison',
                  events: state.comparisonData,
                  insights: {
                    best_performer: state.comparisonData.reduce((p,c) => p.totalRevenue > c.totalRevenue ? p : c, state.comparisonData[0]), 
                    worst_performer: state.comparisonData.reduce((p,c) => p.totalRevenue < c.totalRevenue ? p : c, state.comparisonData[0]),
                    key_differences: [] 
                  },
                  created_at: new Date().toISOString()
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Comparison Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to generate comparison charts
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Metrics Table */}
          <TabsContent value="metrics" className="space-y-6">
            {hasComparisonData ? (
              <PerformanceMetricsTable 
                comparison={{
                  name: 'Event Metrics',
                  events: state.comparisonData,
                  insights: {
                    best_performer: state.comparisonData.reduce((p,c) => p.totalRevenue > c.totalRevenue ? p : c, state.comparisonData[0]), 
                    worst_performer: state.comparisonData.reduce((p,c) => p.totalRevenue < c.totalRevenue ? p : c, state.comparisonData[0]),
                    key_differences: []
                  },
                  created_at: new Date().toISOString()
                }}
                onExport={() => handleExportReport('csv')}
                showCalculations={true}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Metrics Data
                  </h3>
                  <p className="text-muted-foreground">
                    Generate a comparison to view detailed performance metrics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Insights Tab (New) */}
          <TabsContent value="performance-insights" className="space-y-6">
            {hasComparisonData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-brand-primary" />
                      Performance Scoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {state.performanceScores && Object.keys(state.performanceScores).length > 0 ? (
                       <PerformanceScoringSection performanceScores={state.performanceScores} />
                    ) : (
                      <p className="text-sm text-muted-foreground p-4 text-center">
                        {state.loading ? 'Calculating scores...' : 'No performance scores calculated yet for the selected events. Ensure events are compared first.'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-brand-primary" />
                      Success Factor Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {state.successFactors ? (
                      <SuccessFactorAnalysis successFactorsData={state.successFactors} />
                    ) : (
                      <p className="text-sm text-muted-foreground p-4 text-center">
                        {state.loading ? 'Analyzing factors...' : 'Success factor analysis not yet generated or no data available.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Analysis Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab and generate analysis to view performance insights.
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trend Analysis */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-primary" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Trend Analysis Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Seasonal trends, year-over-year analysis, and optimal timing recommendations
                  </p>
                  <Badge variant="secondary" className="mt-4">
                    In Development
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industry Benchmarks */}
          <TabsContent value="benchmarks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-primary" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Industry Benchmarks Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Compare your events against anonymous industry data and market positioning
                  </p>
                  <Badge variant="secondary" className="mt-4">
                    In Development
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports and Export */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Comparison Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Download your comparison analysis in various formats for external use
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleExportReport('csv')}
                      disabled={!hasComparisonData || state.exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleExportReport('excel')}
                      disabled={!hasComparisonData || state.exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as Excel
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleExportReport('pdf')}
                      disabled={!hasComparisonData || state.exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Automated Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Set up automated comparison reports for regular performance reviews
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Weekly Performance Summary</div>
                        <div className="text-sm text-muted-foreground">Every Monday at 9 AM</div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Monthly Benchmark Report</div>
                        <div className="text-sm text-muted-foreground">First of each month</div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Quarterly Business Review</div>
                        <div className="text-sm text-muted-foreground">End of each quarter</div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Market Analysis Tab */}
          <TabsContent value="market-analysis" className="space-y-6">
            {hasComparisonData ? (
              <MarketAnalysisSection 
                marketPositioningData={Object.values(state.marketPositioning)} 
                seasonalTrendData={state.seasonalAnalysis.current ? Object.values(state.seasonalAnalysis.current) : []} 
                loading={state.loading} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Market Analysis Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to view market analysis
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* New Venue Analysis Tab */}
          <TabsContent value="venue-analysis" className="space-y-6">
            {hasComparisonData ? (
              <VenueAnalysisSection 
                venuePerformanceData={Object.values(state.venueAnalysis).flat()}
                loading={state.loading} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Venue Analysis Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to view venue analysis
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* New Pricing Analytics Tab */}
          <TabsContent value="pricing-analytics" className="space-y-6">
            {hasComparisonData ? (
              <PricingAnalyticsSection 
                pricingAnalyticsData={Object.values(state.pricingAnalytics)} 
                loading={state.loading} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Pricing Analysis Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to view pricing analysis
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* New Marketing Analytics Tab */}
          <TabsContent value="marketing-analytics" className="space-y-6">
            {hasComparisonData ? (
              <MarketingAnalyticsSection 
                marketingChannelPerformanceData={Object.values(state.marketingChannelPerformance).flat()}
                loading={state.loading} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Marketing Analysis Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to view marketing analysis
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* New Team Performance Tab */}
          <TabsContent value="team-performance" className="space-y-6">
            {hasComparisonData ? (
              <TeamPerformanceSection 
                teamPerformanceData={Object.values(state.teamPerformance)} 
                loading={state.loading} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Team Performance Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to view team performance analytics
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* New Predictive Analytics Tab */}
          <TabsContent value="predictive-analytics" className="space-y-6">
            {hasComparisonData ? (
              <PredictiveAnalyticsSection 
                predictiveAnalyticsData={Object.values(state.predictiveModels)} 
                loading={state.loading} 
                selectedEventIds={selectedEventIds}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Predictive Analysis Data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Select events in the Setup tab to view predictive analytics
                  </p>
                  <Button onClick={() => setActiveTab('selector')}>
                    Select Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom Actions */}
        {hasComparisonData && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Analysis Complete
                  </h3>
                  <p className="text-muted-foreground">
                    {state.comparisonData.length} event{state.comparisonData.length === 1 ? '' : 's'} analyzed 
                    {state.lastRefresh ? `• Generated ${new Date(state.lastRefresh).toLocaleDateString()}` : ''}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={refreshData} disabled={state.loading || state.refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${state.loading || state.refreshing ? 'animate-spin' : ''}`} />
                    {state.refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  
                  <Button variant="outline" onClick={clearComparison}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComparativeAnalyticsPage; 