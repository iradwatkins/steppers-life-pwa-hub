import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Share2,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react';
import { useComparativeAnalytics } from '@/hooks/useComparativeAnalytics';

// Component imports
import EventComparisonSelector from '@/components/analytics/EventComparisonSelector';
import ComparisonChartsSection from '@/components/analytics/ComparisonChartsSection';
import PerformanceMetricsTable from '@/components/analytics/PerformanceMetricsTable';
import TrendAnalysisSection from '@/components/analytics/TrendAnalysisSection';
import BenchmarkComparisonSection from '@/components/analytics/BenchmarkComparisonSection';
import IndustryBenchmarkSection from '@/components/analytics/IndustryBenchmarkSection';
import PerformanceScoreCard from '@/components/analytics/PerformanceScoreCard';
import SeasonalAnalysisSection from '@/components/analytics/SeasonalAnalysisSection';
import TeamPerformanceAnalysis from '@/components/analytics/TeamPerformanceAnalysis';
import SuccessFactorAnalysis from '@/components/analytics/SuccessFactorAnalysis';

interface ComparativeAnalyticsPageProps {
  organizerId?: string;
}

const ComparativeAnalyticsPage: React.FC<ComparativeAnalyticsPageProps> = ({ organizerId }) => {
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes

  const {
    currentComparison,
    benchmarks,
    performanceScore,
    seasonalTrends,
    teamComparison,
    loading,
    comparingEvents,
    fetchingBenchmarks,
    error,
    compareEvents,
    fetchIndustryBenchmarks,
    calculatePerformanceScore,
    getSeasonalTrends,
    compareTeamPerformance,
    refreshAllData,
    clearAnalysis,
    exportComparison,
    hasComparison,
    hasBenchmarks,
    canCompareEvents
  } = useComparativeAnalytics({ autoRefresh, refreshInterval });

  // Auto-advance to charts tab when comparison is ready
  useEffect(() => {
    if (hasComparison && activeTab === 'setup') {
      setActiveTab('charts');
    }
  }, [hasComparison, activeTab]);

  // Handle event selection and comparison
  const handleEventSelection = useCallback(async (eventIds: string[]) => {
    setSelectedEventIds(eventIds);
    
    if (eventIds.length >= 2) {
      await compareEvents(eventIds);
      
      // Auto-fetch benchmarks if we have comparison data
      if (currentComparison) {
        const category = currentComparison.events[0]?.category || 'social';
        const region = currentComparison.events[0]?.location?.region || 'North America';
        await fetchIndustryBenchmarks(category, region, 'medium');
      }
    }
  }, [compareEvents, currentComparison, fetchIndustryBenchmarks]);

  // Handle performance score calculation
  const handleCalculateScore = useCallback(async (eventId: string) => {
    await calculatePerformanceScore(eventId);
  }, [calculatePerformanceScore]);

  // Handle seasonal analysis
  const handleSeasonalAnalysis = useCallback(async () => {
    if (currentComparison) {
      const category = currentComparison.events[0]?.category || 'social';
      const region = currentComparison.events[0]?.location?.region || 'North America';
      await getSeasonalTrends(category, region);
    }
  }, [currentComparison, getSeasonalTrends]);

  // Handle team performance analysis
  const handleTeamAnalysis = useCallback(async () => {
    if (selectedEventIds.length >= 2) {
      await compareTeamPerformance(selectedEventIds);
    }
  }, [selectedEventIds, compareTeamPerformance]);

  // Handle export functionality
  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (currentComparison) {
      await exportComparison(currentComparison, format);
    }
  }, [currentComparison, exportComparison]);

  // Summary statistics for header
  const summaryStats = currentComparison ? {
    eventsCompared: currentComparison.events.length,
    totalAttendees: currentComparison.events.reduce((sum, e) => sum + e.tickets_sold, 0),
    totalRevenue: currentComparison.events.reduce((sum, e) => sum + e.revenue.gross, 0),
    avgSatisfaction: currentComparison.events.reduce((sum, e) => sum + e.metrics.customer_satisfaction, 0) / currentComparison.events.length,
    bestEvent: currentComparison.events.reduce((best, current) => 
      current.revenue.gross > best.revenue.gross ? current : best
    )
  } : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comparative Analytics & Benchmarking</h1>
          <p className="text-muted-foreground mt-1">
            Compare performance across events, analyze trends, and benchmark against industry standards
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasComparison && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAllData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Select onValueChange={(format: 'csv' | 'excel' | 'pdf') => handleExport(format)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearAnalysis}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{summaryStats.eventsCompared}</div>
                <div className="text-sm text-muted-foreground">Events Compared</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summaryStats.totalAttendees.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${summaryStats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summaryStats.avgSatisfaction.toFixed(1)}★</div>
                <div className="text-sm text-muted-foreground">Avg Satisfaction</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 truncate">{summaryStats.bestEvent.name}</div>
                <div className="text-sm text-muted-foreground">Top Performer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 py-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="setup" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="charts" disabled={!hasComparison} className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="metrics" disabled={!hasComparison} className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="trends" disabled={!hasComparison} className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="benchmarks" disabled={!hasBenchmarks} className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Benchmarks
                </TabsTrigger>
                <TabsTrigger value="performance" disabled={!hasComparison} className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="insights" disabled={!hasComparison} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Setup Tab */}
              <TabsContent value="setup" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Event Selection & Comparison Setup</h3>
                    {hasComparison && <Badge variant="outline" className="bg-green-50 text-green-700">Ready</Badge>}
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Select at least 2 events to start comparative analysis. You can analyze up to 8 events simultaneously for comprehensive insights.
                    </AlertDescription>
                  </Alert>
                </div>

                <EventComparisonSelector
                  selectedEventIds={selectedEventIds}
                  onEventSelection={handleEventSelection}
                  loading={comparingEvents}
                  disabled={!canCompareEvents}
                />

                {hasComparison && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={handleSeasonalAnalysis}
                        disabled={loading}
                        variant="outline"
                        className="flex items-center gap-2 h-20 flex-col"
                      >
                        <Calendar className="h-6 w-6" />
                        <span>Load Seasonal Analysis</span>
                      </Button>
                      
                      <Button
                        onClick={handleTeamAnalysis}
                        disabled={loading}
                        variant="outline"
                        className="flex items-center gap-2 h-20 flex-col"
                      >
                        <Users className="h-6 w-6" />
                        <span>Analyze Team Performance</span>
                      </Button>
                      
                      <Button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        variant={autoRefresh ? "default" : "outline"}
                        className="flex items-center gap-2 h-20 flex-col"
                      >
                        <RefreshCw className={`h-6 w-6 ${autoRefresh ? 'animate-spin' : ''}`} />
                        <span>Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Charts Tab */}
              <TabsContent value="charts" className="mt-0">
                {currentComparison ? (
                  <ComparisonChartsSection comparison={currentComparison} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select events to view comparison charts</p>
                  </div>
                )}
              </TabsContent>

              {/* Metrics Tab */}
              <TabsContent value="metrics" className="mt-0">
                {currentComparison ? (
                  <PerformanceMetricsTable comparison={currentComparison} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select events to view detailed metrics</p>
                  </div>
                )}
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="mt-0">
                {currentComparison ? (
                  <div className="space-y-6">
                    <TrendAnalysisSection comparison={currentComparison} />
                    
                    {seasonalTrends && (
                      <>
                        <Separator />
                        <SeasonalAnalysisSection trends={seasonalTrends} />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select events to view trend analysis</p>
                  </div>
                )}
              </TabsContent>

              {/* Benchmarks Tab */}
              <TabsContent value="benchmarks" className="mt-0">
                {currentComparison && benchmarks ? (
                  <div className="space-y-6">
                    <BenchmarkComparisonSection 
                      comparison={currentComparison} 
                      benchmarks={benchmarks}
                    />
                    
                    <Separator />
                    
                    <IndustryBenchmarkSection 
                      benchmarks={benchmarks}
                      currentEvents={currentComparison.events}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Industry benchmarks will load automatically after event comparison</p>
                    {fetchingBenchmarks && (
                      <div className="mt-4">
                        <RefreshCw className="h-6 w-6 mx-auto animate-spin" />
                        <p className="mt-2">Loading benchmarks...</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-0">
                {currentComparison ? (
                  <div className="space-y-6">
                    {/* Performance Score Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {currentComparison.events.map(event => (
                        <div key={event.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{event.name}</h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCalculateScore(event.id)}
                              disabled={loading}
                            >
                              Calculate Score
                            </Button>
                          </div>
                          
                          {performanceScore && performanceScore.event_id === event.id ? (
                            <PerformanceScoreCard 
                              score={performanceScore}
                              showRecommendations={true}
                            />
                          ) : (
                            <Card className="p-6 text-center text-muted-foreground">
                              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Click "Calculate Score" to analyze performance</p>
                            </Card>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Team Performance Analysis */}
                    {teamComparison && (
                      <>
                        <Separator />
                        <TeamPerformanceAnalysis comparison={teamComparison} />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select events to view performance analysis</p>
                  </div>
                )}
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="mt-0">
                {currentComparison ? (
                  <div className="space-y-6">
                    <SuccessFactorAnalysis 
                      eventIds={selectedEventIds}
                      comparison={currentComparison}
                    />
                    
                    {/* AI-Powered Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-brand-primary" />
                          AI-Powered Insights & Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {currentComparison.insights.improvement_opportunities.map((insight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div>
                                <div className="font-medium text-blue-700">{insight.category}</div>
                                <div className="text-sm text-blue-600">{insight.description}</div>
                                <div className="text-xs text-blue-500 mt-1">
                                  Potential Impact: {insight.impact}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select events to view AI-powered insights</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions Footer */}
      {hasComparison && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Analysis Complete
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {summaryStats?.eventsCompared} events analyzed • Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (currentComparison) {
                      navigator.share?.({
                        title: 'Event Comparison Analysis',
                        text: `Comparative analysis of ${summaryStats?.eventsCompared} events`,
                        url: window.location.href
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparativeAnalyticsPage; 