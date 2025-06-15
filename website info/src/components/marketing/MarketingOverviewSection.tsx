import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, DollarSign } from 'lucide-react';
import { MarketingAnalyticsData } from '../../services/marketingAnalyticsService';

interface MarketingOverviewSectionProps {
  overview: any;
  analyticsData: MarketingAnalyticsData;
  getTopPerformingCampaigns: (limit?: number) => any[];
  getChannelPerformance: (channelId: string) => any;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const MarketingOverviewSection: React.FC<MarketingOverviewSectionProps> = ({
  overview,
  analyticsData,
  getTopPerformingCampaigns,
  getChannelPerformance
}) => {
  // Prepare channel performance data
  const channelPerformanceData = analyticsData.campaignPerformance
    .reduce((acc, campaign) => {
      const channelName = campaign.channel.name;
      if (!acc[channelName]) {
        acc[channelName] = {
          name: channelName,
          spend: 0,
          revenue: 0,
          conversions: 0,
          campaigns: 0
        };
      }
      acc[channelName].spend += campaign.spent;
      acc[channelName].revenue += campaign.revenue;
      acc[channelName].conversions += campaign.conversions;
      acc[channelName].campaigns += 1;
      return acc;
    }, {} as Record<string, any>);

  const channelData = Object.values(channelPerformanceData).map((channel: any) => ({
    ...channel,
    roi: channel.spend > 0 ? Math.round(((channel.revenue - channel.spend) / channel.spend) * 100) : 0
  }));

  // Channel distribution for pie chart
  const channelDistribution = channelData.map((channel, index) => ({
    name: channel.name,
    value: channel.spend,
    revenue: channel.revenue,
    fill: COLORS[index % COLORS.length]
  }));

  // Top performing campaigns
  const topCampaigns = getTopPerformingCampaigns(5);

  // Key insights and alerts
  const insights = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'High-performing Email Marketing',
      description: `Email marketing achieved ${analyticsData.campaignPerformance.find(c => c.channel.name === 'Email Marketing')?.roi || 0}% ROI, significantly above average.`,
      action: 'Increase Budget'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Conversion Funnel Drop-off',
      description: `${analyticsData.conversionFunnel.bottleneckStages.join(', ')} showing high drop-off rates.`,
      action: 'Optimize Funnel'
    },
    {
      type: 'info',
      icon: TrendingUp,
      title: 'Peak Engagement Time',
      description: 'Best performance observed during 6-9 PM and weekends.',
      action: 'Adjust Timing'
    }
  ];

  // Performance trends (last 7 days simplified)
  const trendData = analyticsData.timeSeriesData.slice(-7).map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
    roi: point.roi,
    conversions: point.conversions,
    spend: point.spend
  }));

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    className={`h-5 w-5 mt-0.5 ${
                      insight.type === 'success'
                        ? 'text-green-500'
                        : insight.type === 'warning'
                        ? 'text-yellow-500'
                        : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs"
                    >
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Performance Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance (ROI)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'roi' ? `${value}%` : `$${value.toLocaleString()}`,
                    name === 'roi' ? 'ROI' : name === 'spend' ? 'Spend' : 'Revenue'
                  ]}
                />
                <Legend />
                <Bar dataKey="roi" fill="#3B82F6" name="ROI %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Spend Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend Distribution by Channel</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Spend']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Performance Trends & Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Performance Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roi" stroke="#3B82F6" strokeWidth={2} name="ROI %" />
                <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Performing Campaigns */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
          <div className="space-y-3">
            {topCampaigns.map((campaign, index) => (
              <div key={campaign.campaignId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{campaign.campaignName}</div>
                    <div className="text-xs text-gray-500">{campaign.channel.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">{campaign.roi}% ROI</div>
                  <div className="text-xs text-gray-500">${campaign.revenue.toLocaleString()} revenue</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Channel Performance Grid */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Channel Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-900">Channel</th>
                <th className="text-right py-3 font-medium text-gray-900">Campaigns</th>
                <th className="text-right py-3 font-medium text-gray-900">Spend</th>
                <th className="text-right py-3 font-medium text-gray-900">Revenue</th>
                <th className="text-right py-3 font-medium text-gray-900">Conversions</th>
                <th className="text-right py-3 font-medium text-gray-900">ROI</th>
                <th className="text-right py-3 font-medium text-gray-900">Performance</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map((channel, index) => (
                <tr key={channel.name} className="border-b border-gray-100">
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3">{channel.campaigns}</td>
                  <td className="text-right py-3">${channel.spend.toLocaleString()}</td>
                  <td className="text-right py-3">${channel.revenue.toLocaleString()}</td>
                  <td className="text-right py-3">{channel.conversions}</td>
                  <td className="text-right py-3">
                    <span className={`font-medium ${channel.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {channel.roi}%
                    </span>
                  </td>
                  <td className="text-right py-3">
                    <div className="flex items-center justify-end">
                      {channel.roi >= 200 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">Excellent</span>
                        </div>
                      ) : channel.roi >= 100 ? (
                        <div className="flex items-center text-blue-600">
                          <Target className="h-4 w-4 mr-1" />
                          <span className="text-xs">Good</span>
                        </div>
                      ) : channel.roi >= 0 ? (
                        <div className="flex items-center text-yellow-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="text-xs">Break-even</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs">Loss</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}; 