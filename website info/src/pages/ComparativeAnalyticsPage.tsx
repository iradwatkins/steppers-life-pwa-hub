import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Star, 
  Calendar,
  MapPin,
  Download,
  RefreshCw,
  Plus,
  X,
  Filter,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb
} from 'lucide-react';
import { useComparativeAnalytics } from '../hooks/useComparativeAnalytics';
import { EventComparisonMetrics } from '../services/comparativeAnalyticsService';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

interface ComparativeAnalyticsPageProps {
  eventId?: string;
}

const ComparativeAnalyticsPage: React.FC<ComparativeAnalyticsPageProps> = ({ eventId }) => {
  const {
    state,
    compareEvents,
    addEventToComparison,
    removeEventFromComparison,
    clearComparison,
    getTimePeriodComparison,
    fetchIndustryBenchmarks,
    calculatePerformanceScores,
    analyzeSuccessFactors,
    analyzeVenuePerformance,
    analyzeMarketPositioning,
    fetchSeasonalAnalysis,
    generatePredictiveModeling,
    exportComparisonData,
    updateFilters,
    resetFilters,
    refreshData,
    clearCache,
    comparisonSummary,
    getPerformanceScoreForEvent,
    getBenchmarkForCategory,
    isEventSelected,
    canExport
  } = useComparativeAnalytics();

  const [activeTab, setActiveTab] = useState('comparison');
  const [showFilters, setShowFilters] = useState(false);
  const [eventSearchTerm, setEventSearchTerm] = useState('');

  // Mock available events for selection
  const [availableEvents] = useState([
    { id: 'event-1', name: 'Chicago Step Championship 2024', category: 'Competition', date: '2024-07-15' },
    { id: 'event-2', name: 'Summer Dance Social', category: 'Social', date: '2024-08-20' },
    { id: 'event-3', name: 'Beginner Steppers Workshop', category: 'Workshop', date: '2024-09-10' },
    { id: 'event-4', name: 'Fall Festival of Dance', category: 'Festival', date: '2024-10-05' },
    { id: 'event-5', name: 'Advanced Technique Intensive', category: 'Workshop', date: '2024-11-12' },
    { id: 'event-6', name: 'Holiday Dance Celebration', category: 'Social', date: '2024-12-20' }
  ]);

  // Auto-add eventId to comparison if provided
  useEffect(() => {
    if (eventId && !isEventSelected(eventId)) {
      addEventToComparison(eventId);
    }
  }, [eventId, isEventSelected, addEventToComparison]);

  // Filter events based on search term
  const filteredEvents = availableEvents.filter(event =>
    event.name.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(eventSearchTerm.toLowerCase())
  );

  const handleExport = async (format: 'CSV' | 'Excel' | 'PDF' | 'JSON') => {
    const data = {
      comparison: state.comparisonData,
      timePeriod: state.timePeriodComparison,
      benchmarks: state.industryBenchmarks,
      performanceScores: state.performanceScores,
      summary: comparisonSummary
    };
    await exportComparisonData(data, format);
  };

  const handleRunAnalysis = async () => {
    if (state.selectedEvents.length === 0) return;

    // Run all analysis types
    await Promise.all([
      calculatePerformanceScores(state.selectedEvents),
      analyzeSuccessFactors(state.selectedEvents),
      fetchIndustryBenchmarks(
        state.filters.category || 'Dance',
        state.filters.region || 'US',
        state.filters.eventSizeRange
      )
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comparative Analytics</h1>
          <p className="text-gray-600 mt-2">
            Compare event performance, benchmark against industry standards, and identify success factors
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={state.refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", state.refreshing && "animate-spin")} />
            Refresh
          </Button>
          
          <Button
            onClick={handleRunAnalysis}
            disabled={state.selectedEvents.length === 0 || state.loading}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{state.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Filters & Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={state.filters.category} 
                  onValueChange={(value) => updateFilters({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dance">Dance</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={state.filters.region} 
                  onValueChange={(value) => updateFilters({ region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="EU">European Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="eventSize">Event Size Range</Label>
                <Select 
                  value={state.filters.eventSizeRange} 
                  onValueChange={(value: any) => updateFilters({ eventSizeRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (50-100)</SelectItem>
                    <SelectItem value="medium">Medium (100-300)</SelectItem>
                    <SelectItem value="large">Large (300-1000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="comparisonType">Comparison Type</Label>
                <Select 
                  value={state.filters.comparisonType} 
                  onValueChange={(value: any) => updateFilters({ comparisonType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YoY">Year over Year</SelectItem>
                    <SelectItem value="QoQ">Quarter over Quarter</SelectItem>
                    <SelectItem value="MoM">Month over Month</SelectItem>
                    <SelectItem value="Custom">Custom Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Event Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div>
            <Label htmlFor="eventSearch">Search Events</Label>
            <Input
              id="eventSearch"
              placeholder="Search by event name or category..."
              value={eventSearchTerm}
              onChange={(e) => setEventSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Selected Events */}
          {state.selectedEvents.length > 0 && (
            <div>
              <Label>Selected Events ({state.selectedEvents.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {state.selectedEvents.map(eventId => {
                  const event = availableEvents.find(e => e.id === eventId);
                  return (
                    <Badge key={eventId} variant="secondary" className="flex items-center gap-1">
                      {event?.name || eventId}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeEventFromComparison(eventId)}
                      />
                    </Badge>
                  );
                })}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearComparison}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
          
          {/* Available Events */}
          <div>
            <Label>Available Events</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-colors",
                    isEventSelected(event.id) 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => 
                    isEventSelected(event.id) 
                      ? removeEventFromComparison(event.id)
                      : addEventToComparison(event.id)
                  }
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isEventSelected(event.id)} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{event.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Dashboard */}
      {comparisonSummary.eventCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Compared</p>
                  <p className="text-2xl font-bold">{comparisonSummary.eventCount}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(comparisonSummary.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{comparisonSummary.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Sell-Through</p>
                  <p className="text-2xl font-bold">{formatPercentage(comparisonSummary.averageSellThroughRate)}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="comparison">Event Comparison</TabsTrigger>
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
          <TabsTrigger value="performance">Performance Scores</TabsTrigger>
          <TabsTrigger value="success-factors">Success Factors</TabsTrigger>
          <TabsTrigger value="trends">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Event Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          {state.comparisonData.length > 0 ? (
            <>
              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Event Comparison</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('CSV')}
                        disabled={!canExport}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('Excel')}
                        disabled={!canExport}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Event</th>
                          <th className="text-right p-2 font-medium">Revenue</th>
                          <th className="text-right p-2 font-medium">Tickets Sold</th>
                          <th className="text-right p-2 font-medium">Capacity</th>
                          <th className="text-right p-2 font-medium">Sell-Through %</th>
                          <th className="text-right p-2 font-medium">Avg Price</th>
                          <th className="text-right p-2 font-medium">Rating</th>
                          <th className="text-right p-2 font-medium">Profit Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.comparisonData.map((event, index) => (
                          <tr key={event.eventId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{event.eventName}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{event.category}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(event.eventDate).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="text-right p-2 font-medium">{formatCurrency(event.totalRevenue)}</td>
                            <td className="text-right p-2">{formatNumber(event.ticketsSold)}</td>
                            <td className="text-right p-2">{formatNumber(event.totalCapacity)}</td>
                            <td className="text-right p-2">
                              <span className={cn(
                                "font-medium",
                                event.sellThroughRate >= 80 ? "text-green-600" :
                                event.sellThroughRate >= 60 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {formatPercentage(event.sellThroughRate)}
                              </span>
                            </td>
                            <td className="text-right p-2">{formatCurrency(event.averageTicketPrice)}</td>
                            <td className="text-right p-2">
                              <div className="flex items-center justify-end gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{event.averageRating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="text-right p-2">
                              <span className={cn(
                                "font-medium",
                                event.profitMargin >= 20 ? "text-green-600" :
                                event.profitMargin >= 10 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {formatPercentage(event.profitMargin)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Best vs Worst Performers */}
              {comparisonSummary.bestPerformer && comparisonSummary.worstPerformer && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-5 w-5" />
                        Best Performer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="font-medium text-green-900">{comparisonSummary.bestPerformer.eventName}</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700">Revenue:</span>
                          <span className="font-medium ml-2">{formatCurrency(comparisonSummary.bestPerformer.totalRevenue)}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Sell-Through:</span>
                          <span className="font-medium ml-2">{formatPercentage(comparisonSummary.bestPerformer.sellThroughRate)}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Rating:</span>
                          <span className="font-medium ml-2">{comparisonSummary.bestPerformer.averageRating.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Profit Margin:</span>
                          <span className="font-medium ml-2">{formatPercentage(comparisonSummary.bestPerformer.profitMargin)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        Needs Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="font-medium text-red-900">{comparisonSummary.worstPerformer.eventName}</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-red-700">Revenue:</span>
                          <span className="font-medium ml-2">{formatCurrency(comparisonSummary.worstPerformer.totalRevenue)}</span>
                        </div>
                        <div>
                          <span className="text-red-700">Sell-Through:</span>
                          <span className="font-medium ml-2">{formatPercentage(comparisonSummary.worstPerformer.sellThroughRate)}</span>
                        </div>
                        <div>
                          <span className="text-red-700">Rating:</span>
                          <span className="font-medium ml-2">{comparisonSummary.worstPerformer.averageRating.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-red-700">Profit Margin:</span>
                          <span className="font-medium ml-2">{formatPercentage(comparisonSummary.worstPerformer.profitMargin)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Events Selected</h3>
                  <p>Select events above to start comparing their performance.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Industry Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          {Object.keys(state.industryBenchmarks).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(state.industryBenchmarks).map(([key, benchmark]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>
                      Industry Benchmarks: {benchmark.category} - {benchmark.region} ({benchmark.eventSizeRange})
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Based on {formatNumber(benchmark.sampleSize)} events • Last updated: {new Date(benchmark.lastUpdated).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Average Sell-Through Rate</div>
                        <div className="text-2xl font-bold">{formatPercentage(benchmark.averageSellThroughRate)}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Average Ticket Price</div>
                        <div className="text-2xl font-bold">{formatCurrency(benchmark.averageTicketPrice)}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Average Marketing ROI</div>
                        <div className="text-2xl font-bold">{formatPercentage(benchmark.averageMarketingROI)}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Average Rating</div>
                        <div className="text-2xl font-bold flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-500" />
                          {benchmark.averageRating.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Average Profit Margin</div>
                        <div className="text-2xl font-bold">{formatPercentage(benchmark.averageProfitMargin)}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Average Check-In Rate</div>
                        <div className="text-2xl font-bold">{formatPercentage(benchmark.averageCheckInRate)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Benchmarks Loaded</h3>
                  <p>Configure filters and run analysis to load industry benchmarks.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Scores Tab */}
        <TabsContent value="performance" className="space-y-4">
          {Object.keys(state.performanceScores).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(state.performanceScores).map(([eventId, score]) => {
                const event = state.comparisonData.find(e => e.eventId === eventId);
                return (
                  <Card key={eventId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{event?.eventName || eventId}</span>
                        <Badge 
                          variant={
                            score.rating === 'Exceptional' ? 'default' :
                            score.rating === 'Strong' ? 'secondary' :
                            score.rating === 'Good' ? 'outline' : 'destructive'
                          }
                        >
                          {score.rating} - {score.overallScore}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{score.financialScore}</div>
                          <div className="text-sm text-gray-600">Financial</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{score.operationalScore}</div>
                          <div className="text-sm text-gray-600">Operational</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{score.marketingScore}</div>
                          <div className="text-sm text-gray-600">Marketing</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{score.qualityScore}</div>
                          <div className="text-sm text-gray-600">Quality</div>
                        </div>
                      </div>

                      {/* Recommendations & Strengths */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {score.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Recommendations
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {score.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {score.strengthAreas.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Strengths
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {score.strengthAreas.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Performance Scores</h3>
                  <p>Run analysis to calculate performance scores for selected events.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Success Factors Tab */}
        <TabsContent value="success-factors" className="space-y-4">
          {state.successFactors ? (
            <div className="space-y-4">
              {/* Primary Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Success Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.successFactors.primaryFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{factor.factor}</div>
                          <div className="text-sm text-gray-600">{factor.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {(factor.impact * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {(factor.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actionable Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Actionable Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.successFactors.insights.map((insight, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={
                              insight.priority === 'high' ? 'default' :
                              insight.priority === 'medium' ? 'secondary' : 'outline'
                            }
                          >
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {insight.implementationDifficulty} to implement
                          </Badge>
                        </div>
                        <div className="font-medium mb-1">{insight.insight}</div>
                        <div className="text-sm text-gray-600">{insight.expectedImpact}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 py-8">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Success Factor Analysis</h3>
                  <p>Run analysis to identify success factors for selected events.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Seasonal Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Seasonal Trends Analysis</h3>
                <p>Coming soon - Seasonal performance patterns and optimal timing recommendations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Predictive Modeling</h3>
                <p>Coming soon - Revenue and attendance predictions with confidence intervals.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComparativeAnalyticsPage; 