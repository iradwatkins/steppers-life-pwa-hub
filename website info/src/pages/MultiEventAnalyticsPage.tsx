import React, { useState } from 'react';
import { useMultiEventAnalytics } from '../hooks/useMultiEventAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  ArrowLeftRight, 
  TrendingUp, 
  Users, 
  Lightbulb,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Sub-components for different tabs
const OverviewTab: React.FC<{ analytics: ReturnType<typeof useMultiEventAnalytics> }> = ({ analytics }) => {
  const { metrics } = analytics;

  if (!metrics) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalEvents}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">${metrics.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tickets Sold</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalTicketsSold}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Attendance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.averageAttendanceRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Top Performing Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Events</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.topPerformingEvents.map((event) => (
                <tr key={event.eventId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{event.venue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${event.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {event.ticketsSold}/{event.capacity}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {event.attendanceRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{event.category}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revenue Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
        </div>
      </Card>
    </div>
  );
};

const ComparisonTab: React.FC<{ analytics: ReturnType<typeof useMultiEventAnalytics> }> = ({ analytics }) => {
  const { comparison, selectedEvents, eventPerformances, selectEvent, clearComparison } = analytics;

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Events to Compare</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventPerformances.map((event) => (
            <div
              key={event.eventId}
              onClick={() => selectEvent(event.eventId)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedEvents.includes(event.eventId)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{event.venue} • {new Date(event.date).toLocaleDateString()}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Revenue: ${event.revenue.toLocaleString()}</span>
                <span className="text-gray-600 dark:text-gray-400">Attendance: {event.attendanceRate.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
        {selectedEvents.length > 0 && (
          <Button 
            onClick={clearComparison} 
            variant="outline" 
            className="mt-4"
          >
            Clear Selection
          </Button>
        )}
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Event Comparison</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event 1 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">{comparison.event1.title}</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-medium">${comparison.event1.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
                  <span className="font-medium">{comparison.event1.attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Ticket Price</span>
                  <span className="font-medium">${comparison.event1.averageTicketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Performance Score</span>
                  <span className="font-medium">{comparison.metrics.performanceScore1.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">{comparison.event2.title}</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-medium">${comparison.event2.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
                  <span className="font-medium">{comparison.event2.attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Ticket Price</span>
                  <span className="font-medium">${comparison.event2.averageTicketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Performance Score</span>
                  <span className="font-medium">{comparison.metrics.performanceScore2.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Difference Analysis */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h5 className="font-medium text-gray-900 dark:text-white mb-4">Key Differences</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.metrics.revenueDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.metrics.revenueDifference >= 0 ? '+' : ''}${comparison.metrics.revenueDifference.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Difference</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.metrics.attendanceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.metrics.attendanceDifference >= 0 ? '+' : ''}{comparison.metrics.attendanceDifference.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Difference</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.metrics.pricingDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.metrics.pricingDifference >= 0 ? '+' : ''}${comparison.metrics.pricingDifference.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pricing Difference</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const TrendsTab: React.FC<{ analytics: ReturnType<typeof useMultiEventAnalytics> }> = ({ analytics }) => {
  const { trends } = analytics;

  if (!trends) return <div>No trend data available</div>;

  return (
    <div className="space-y-6">
      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Growth</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">+{trends.revenueGrowth}%</div>
          <p className="text-gray-600 dark:text-gray-400">Year over year revenue growth</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Growth</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">+{trends.attendanceGrowth}%</div>
          <p className="text-gray-600 dark:text-gray-400">Year over year attendance growth</p>
        </Card>
      </div>

      {/* Seasonal Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seasonal Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trends.seasonalPatterns.map((season) => (
            <div key={season.season} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">{season.season}</h4>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Revenue: ${season.averageRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Attendance: {season.averageAttendance}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Events: {season.eventCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Venue Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Venue Performance</h3>
        <div className="space-y-4">
          {trends.venuePerformance.map((venue) => (
            <div key={venue.venue} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{venue.venue}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{venue.eventCount} events</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${venue.averageRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {venue.successRate}% success rate
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimal Timing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Optimal Event Timing</h3>
        <div className="space-y-3">
          {trends.optimalTiming.map((timing, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium text-gray-900 dark:text-white">
                {timing.dayOfWeek} {timing.timeOfDay}
              </span>
              <span className="text-blue-600 font-semibold">
                {timing.averagePerformance}% performance
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const AudienceTab: React.FC<{ analytics: ReturnType<typeof useMultiEventAnalytics> }> = ({ analytics }) => {
  const { audienceOverlap } = analytics;

  if (!audienceOverlap) return <div>No audience data available</div>;

  return (
    <div className="space-y-6">
      {/* Audience Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Attendees</h3>
          <div className="text-3xl font-bold text-blue-600">{audienceOverlap.totalUniqueAttendees}</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Returning Attendees</h3>
          <div className="text-3xl font-bold text-green-600">{audienceOverlap.returningAttendees}</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Retention Rate</h3>
          <div className="text-3xl font-bold text-purple-600">{audienceOverlap.retentionRate.toFixed(1)}%</div>
        </Card>
      </div>

      {/* Loyalty Segments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audience Segments</h3>
        <div className="space-y-4">
          {audienceOverlap.loyaltySegments.map((segment) => (
            <div key={segment.segment} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{segment.segment}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{segment.count} attendees</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${segment.averageSpend}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {segment.eventFrequency} events avg
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const InsightsTab: React.FC<{ analytics: ReturnType<typeof useMultiEventAnalytics> }> = ({ analytics }) => {
  const { insights } = analytics;

  if (!insights) return <div>No insights available</div>;

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strategic Recommendations</h3>
        <div className="space-y-4">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant={rec.impact === 'high' ? 'success' : rec.impact === 'medium' ? 'warning' : 'secondary'}>
                      {rec.impact} impact
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {(rec.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <Lightbulb className="h-5 w-5 text-yellow-500 ml-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimal Parameters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Optimal Event Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Best Venues</h4>
            <ul className="space-y-1">
              {insights.optimalParameters.bestVenues.map((venue, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">• {venue}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Optimal Pricing</h4>
            <div className="text-gray-600 dark:text-gray-400">
              Range: ${insights.optimalParameters.optimalPricing.min} - ${insights.optimalParameters.optimalPricing.max}
              <br />
              Sweet spot: ${insights.optimalParameters.optimalPricing.optimal}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Best Time Slots</h4>
            <ul className="space-y-1">
              {insights.optimalParameters.bestTimeSlots.map((slot, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">• {slot}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Top Categories</h4>
            <ul className="space-y-1">
              {insights.optimalParameters.topCategories.map((category, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">• {category}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Forecasts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Forecasts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">Next Event Revenue</h4>
            <div className="text-2xl font-bold text-green-600 mt-2">
              ${insights.forecasts.nextEventRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Range: ${insights.forecasts.confidenceInterval.min.toLocaleString()} - ${insights.forecasts.confidenceInterval.max.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">Expected Attendance</h4>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              {insights.forecasts.expectedAttendance}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Based on historical patterns
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const MultiEventAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const analytics = useMultiEventAnalytics(user?.id);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'comparison', label: 'Comparison', icon: ArrowLeftRight },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab analytics={analytics} />;
      case 'comparison':
        return <ComparisonTab analytics={analytics} />;
      case 'trends':
        return <TrendsTab analytics={analytics} />;
      case 'audience':
        return <AudienceTab analytics={analytics} />;
      case 'insights':
        return <InsightsTab analytics={analytics} />;
      default:
        return <OverviewTab analytics={analytics} />;
    }
  };

  if (analytics.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Multi-Event Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Compare performance across your event portfolio
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {analytics.lastUpdated && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {analytics.lastUpdated.toLocaleTimeString()}
                </span>
              )}
              
              <Button
                onClick={analytics.refreshData}
                variant="outline"
                disabled={analytics.loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => analytics.exportReport('csv')}
                  variant="outline"
                  disabled={analytics.exportInProgress}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>CSV</span>
                </Button>
                
                <Button
                  onClick={() => analytics.exportReport('pdf')}
                  variant="primary"
                  disabled={analytics.exportInProgress}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF Report</span>
                </Button>
              </div>
            </div>
          </div>

          {analytics.error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
                  <div className="mt-2 text-sm text-red-700">{analytics.error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}; 