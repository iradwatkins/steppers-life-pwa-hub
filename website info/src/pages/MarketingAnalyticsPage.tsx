import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketingAnalytics } from '../hooks/useMarketingAnalytics';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MarketingOverviewSection } from '../components/marketing/MarketingOverviewSection';
import { CampaignPerformanceSection } from '../components/marketing/CampaignPerformanceSection';
import { ConversionFunnelSection } from '../components/marketing/ConversionFunnelSection';
import { AttributionModelSection } from '../components/marketing/AttributionModelSection';
import { AudienceEngagementSection } from '../components/marketing/AudienceEngagementSection';
import { ABTestResultsSection } from '../components/marketing/ABTestResultsSection';
import { CompetitorAnalysisSection } from '../components/marketing/CompetitorAnalysisSection';
import { RecommendationsSection } from '../components/marketing/RecommendationsSection';
import { ChannelManagementSection } from '../components/marketing/ChannelManagementSection';
import { TrendAnalysisSection } from '../components/marketing/TrendAnalysisSection';
import { MarketingExportDialog } from '../components/marketing/MarketingExportDialog';
import { ArrowLeft, RefreshCw, Download, Settings, TrendingUp, BarChart3, Users, Target, TestTube, Activity } from 'lucide-react';

export const MarketingAnalyticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const {
    analyticsData,
    overview,
    channels,
    selectedChannels,
    selectedTimeframe,
    loading,
    refreshing,
    exporting,
    error,
    isAutoRefresh,
    refreshAnalytics,
    updateChannelStatus,
    syncChannel,
    exportAnalytics,
    setSelectedTimeframe,
    toggleChannelSelection,
    selectAllChannels,
    clearChannelSelection,
    setIsAutoRefresh,
    getChannelPerformance,
    getTopPerformingCampaigns,
    getTrendData,
    getConversionFunnelData
  } = useMarketingAnalytics(eventId || '');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'campaigns', name: 'Campaigns', icon: Target },
    { id: 'funnel', name: 'Conversion Funnel', icon: TrendingUp },
    { id: 'attribution', name: 'Attribution', icon: Activity },
    { id: 'audience', name: 'Audience', icon: Users },
    { id: 'ab-tests', name: 'A/B Tests', icon: TestTube },
    { id: 'competitors', name: 'Competitors', icon: BarChart3 },
    { id: 'recommendations', name: 'Recommendations', icon: Target },
    { id: 'channels', name: 'Channels', icon: Settings },
    { id: 'trends', name: 'Trends', icon: TrendingUp }
  ];

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'json', sections: string[]) => {
    await exportAnalytics(format, sections);
    setShowExportDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Analytics</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={refreshAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!analyticsData || !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-gray-500 text-xl mb-4">📊 No Analytics Data</div>
          <p className="text-gray-600 mb-6">No marketing analytics data available for this event.</p>
          <Button onClick={() => navigate(`/organizer/event/${eventId}`)}>
            Back to Event
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/organizer/event/${eventId}`)}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Marketing Analytics</h1>
                <p className="text-sm text-gray-500">Campaign performance and ROI analysis</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Auto-refresh toggle */}
              <Button
                variant={isAutoRefresh ? "primary" : "outline"}
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className="flex items-center"
              >
                <Activity className="h-4 w-4 mr-2" />
                {isAutoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
              </Button>

              {/* Timeframe selector */}
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAnalytics}
                disabled={refreshing}
                className="flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Export button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                disabled={exporting}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{overview.totalCampaigns}</div>
            <div className="text-sm text-gray-500">Total Campaigns</div>
            <div className="text-xs text-gray-400 mt-1">
              {overview.campaignCount.active} active, {overview.campaignCount.completed} completed
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">${overview.totalSpend.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spend</div>
            <div className="text-xs text-gray-400 mt-1">
              Across all channels
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">${overview.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className={`text-xs mt-1 ${overview.overallROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overview.overallROI}% ROI
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{overview.totalConversions}</div>
            <div className="text-sm text-gray-500">Total Conversions</div>
            <div className="text-xs text-gray-400 mt-1">
              ${overview.averageCostPerAcquisition} avg CPA
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{overview.topPerformingChannel}</div>
            <div className="text-sm text-gray-500">Top Channel</div>
            <div className="text-xs text-green-600 mt-1">
              Best ROI performer
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <MarketingOverviewSection
              overview={overview}
              analyticsData={analyticsData}
              getTopPerformingCampaigns={getTopPerformingCampaigns}
              getChannelPerformance={getChannelPerformance}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignPerformanceSection
              campaigns={analyticsData.campaignPerformance}
              channels={channels}
              selectedChannels={selectedChannels}
              toggleChannelSelection={toggleChannelSelection}
              selectAllChannels={selectAllChannels}
              clearChannelSelection={clearChannelSelection}
            />
          )}

          {activeTab === 'funnel' && (
            <ConversionFunnelSection
              funnelData={getConversionFunnelData()}
            />
          )}

          {activeTab === 'attribution' && (
            <AttributionModelSection
              attributionData={analyticsData.attributionModel}
            />
          )}

          {activeTab === 'audience' && (
            <AudienceEngagementSection
              audienceData={analyticsData.audienceEngagement}
            />
          )}

          {activeTab === 'ab-tests' && (
            <ABTestResultsSection
              abTestResults={analyticsData.abTestResults}
            />
          )}

          {activeTab === 'competitors' && (
            <CompetitorAnalysisSection
              competitorData={analyticsData.competitorAnalysis}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsSection
              recommendations={analyticsData.recommendations}
            />
          )}

          {activeTab === 'channels' && (
            <ChannelManagementSection
              channels={channels}
              updateChannelStatus={updateChannelStatus}
              syncChannel={syncChannel}
              getChannelPerformance={getChannelPerformance}
            />
          )}

          {activeTab === 'trends' && (
            <TrendAnalysisSection
              getTrendData={getTrendData}
              timeSeriesData={analyticsData.timeSeriesData}
            />
          )}
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <MarketingExportDialog
          onExport={handleExport}
          onClose={() => setShowExportDialog(false)}
          exporting={exporting}
        />
      )}
    </div>
  );
}; 