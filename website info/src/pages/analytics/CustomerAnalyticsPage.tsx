import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Target, Download, Filter, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { CustomerOverviewSection } from '@/components/analytics/CustomerOverviewSection';
import { DemographicsSection } from '@/components/analytics/DemographicsSection';
import { BehavioralSegmentationSection } from '@/components/analytics/BehavioralSegmentationSection';
import { CLVAnalysisSection } from '@/components/analytics/CLVAnalysisSection';
import { ChurnAnalysisSection } from '@/components/analytics/ChurnAnalysisSection';
import { CustomerSegmentsSection } from '@/components/analytics/CustomerSegmentsSection';
import { PersonalizationSection } from '@/components/analytics/PersonalizationSection';
import { CustomerAnalyticsFilters } from '@/components/analytics/CustomerAnalyticsFilters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function CustomerAnalyticsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    // Data
    demographics,
    behavioralData,
    clvData,
    churnAnalysis,
    eventPreferences,
    purchasePatterns,
    customerFeedback,
    segments,
    segmentationAnalytics,
    
    // UI state
    loading,
    error,
    activeTab,
    
    // Filters
    demographicFilters,
    behaviorFilters,
    
    // Actions
    loadAllData,
    createSegment,
    updateSegment,
    deleteSegment,
    exportSegment,
    getPersonalizationRecommendations,
    
    // Filtering
    applyDemographicFilters,
    applyBehaviorFilters,
    clearAllFilters,
    
    // Helpers
    getSegmentMetrics,
    
    // UI state setters
    setActiveTab
  } = useCustomerAnalytics({ 
    eventId: eventId || '', 
    autoRefresh: true, 
    refreshInterval: 60000 
  });

  const metrics = getSegmentMetrics();

  if (!eventId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Event ID Required</h1>
          <p className="text-gray-600 mt-2">Please select an event to view customer analytics.</p>
          <Link to="/organizer/events" className="inline-block mt-4">
            <Button>Return to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Analytics</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={loadAllData} className="mt-4">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/organizer/events" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Customer Analytics & Segmentation</h1>
            <p className="text-gray-600">Advanced customer insights and behavioral analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            onClick={loadAllData}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Analytics Filters</CardTitle>
            <CardDescription>
              Filter customer data by demographics, behavior, and segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerAnalyticsFilters
              demographicFilters={demographicFilters}
              behaviorFilters={behaviorFilters}
              onApplyDemographicFilters={applyDemographicFilters}
              onApplyBehaviorFilters={applyBehaviorFilters}
              onClearAllFilters={clearAllFilters}
              demographics={demographics}
              clvData={clvData}
              churnAnalysis={churnAnalysis}
            />
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High-Value Customers</p>
                <p className="text-2xl font-bold">{metrics.highValueCustomers}</p>
                <p className="text-xs text-green-600">
                  {((metrics.highValueCustomers / metrics.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At-Risk Customers</p>
                <p className="text-2xl font-bold">{metrics.atRiskCustomers}</p>
                <p className="text-xs text-red-600">
                  {((metrics.atRiskCustomers / metrics.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average CLV</p>
                <p className="text-2xl font-bold">${metrics.averageCLV.toFixed(0)}</p>
                <p className="text-xs text-blue-600">Per customer</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="clv">CLV Analysis</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="space-y-6">
              <CustomerOverviewSection
                segmentationAnalytics={segmentationAnalytics}
                metrics={metrics}
                demographics={demographics}
                clvData={clvData}
                churnAnalysis={churnAnalysis}
                segments={segments}
              />
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
              <DemographicsSection
                demographics={demographics}
                segmentationAnalytics={segmentationAnalytics}
              />
            </TabsContent>

            <TabsContent value="behavioral" className="space-y-6">
              <BehavioralSegmentationSection
                behavioralData={behavioralData}
                eventPreferences={eventPreferences}
                purchasePatterns={purchasePatterns}
                customerFeedback={customerFeedback}
              />
            </TabsContent>

            <TabsContent value="clv" className="space-y-6">
              <CLVAnalysisSection
                clvData={clvData}
                behavioralData={behavioralData}
              />
            </TabsContent>

            <TabsContent value="churn" className="space-y-6">
              <ChurnAnalysisSection
                churnAnalysis={churnAnalysis}
                clvData={clvData}
                behavioralData={behavioralData}
              />
            </TabsContent>

            <TabsContent value="segments" className="space-y-6">
              <CustomerSegmentsSection
                segments={segments}
                onCreateSegment={createSegment}
                onUpdateSegment={updateSegment}
                onDeleteSegment={deleteSegment}
                onExportSegment={exportSegment}
                demographics={demographics}
                clvData={clvData}
                churnAnalysis={churnAnalysis}
              />
            </TabsContent>

            <TabsContent value="personalization" className="space-y-6">
              <PersonalizationSection
                demographics={demographics}
                behavioralData={behavioralData}
                eventPreferences={eventPreferences}
                onGetRecommendations={getPersonalizationRecommendations}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
} 