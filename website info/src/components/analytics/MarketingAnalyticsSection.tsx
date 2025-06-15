import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, TrendingUp, Target, DollarSign } from 'lucide-react';
import { MarketingChannelPerformanceData } from '@/services/comparativeAnalyticsService';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  Cell,
  Line
} from 'recharts';

interface MarketingAnalyticsSectionProps {
  marketingChannelPerformanceData: MarketingChannelPerformanceData[];
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MarketingAnalyticsSection: React.FC<MarketingAnalyticsSectionProps> = ({
  marketingChannelPerformanceData,
  loading,
}) => {
  if (loading) {
    return <Card className="p-8 text-center">Loading Marketing Analytics...</Card>;
  }

  if (!marketingChannelPerformanceData.length) {
    return <Card className="p-8 text-center">No marketing analytics data available. Select events to analyze.</Card>;
  }

  // Aggregate data by channel for overall performance
  const aggregatedChannelData = marketingChannelPerformanceData.reduce((acc, current) => {
    if (!acc[current.channel]) {
      acc[current.channel] = {
        channel: current.channel,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        roi: 0,
        cpa: 0,
        eventCount: 0,
        totalEngagementRate: 0,
      };
    }
    acc[current.channel].impressions += current.impressions;
    acc[current.channel].clicks += current.clicks;
    acc[current.channel].conversions += current.conversions;
    acc[current.channel].cost += current.cost;
    acc[current.channel].totalEngagementRate += current.engagementRate;
    acc[current.channel].eventCount += 1;

    // Recalculate ROI and CPA for aggregated data
    acc[current.channel].roi = acc[current.channel].cost > 0 
      ? parseFloat(((current.revenueFromPricing - acc[current.channel].cost) / acc[current.channel].cost * 100).toFixed(2))
      : 0;
    acc[current.channel].cpa = acc[current.channel].conversions > 0 
      ? parseFloat((acc[current.channel].cost / acc[current.channel].conversions).toFixed(2))
      : acc[current.channel].cost; // If no conversions, CPA is just cost

    return acc;
  }, {} as Record<string, MarketingChannelPerformanceData & { eventCount: number; totalEngagementRate: number; }>);

  const aggregatedChannels = Object.values(aggregatedChannelData).map(channel => ({
    ...channel,
    avgEngagementRate: parseFloat((channel.totalEngagementRate / channel.eventCount).toFixed(2)),
  }));

  // Prepare data for ROI and CPA charts
  const roiChartData = aggregatedChannels.map(channel => ({ name: channel.channel, ROI: channel.roi }));
  const cpaChartData = aggregatedChannels.map(channel => ({ name: channel.channel, CPA: channel.cpa }));
  const conversionsByChannel = aggregatedChannels.map(channel => ({ name: channel.channel, conversions: channel.conversions }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Marketing Channel Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {aggregatedChannels.map((channel, index) => (
              <Card key={index} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{channel.channel}</h3>
                <p className="text-sm text-muted-foreground">Impressions: <span className="font-bold text-foreground">{channel.impressions.toLocaleString()}</span></p>
                <p className="text-sm text-muted-foreground">Clicks: <span className="font-bold text-foreground">{channel.clicks.toLocaleString()}</span></p>
                <p className="text-sm text-muted-foreground">Conversions: <span className="font-bold text-foreground">{channel.conversions.toLocaleString()}</span></p>
                <p className="text-sm text-muted-foreground">Cost: <span className="font-bold text-foreground">${channel.cost.toFixed(2)}</span></p>
                <p className="text-sm text-muted-foreground">ROI: <span className="font-bold text-foreground">{channel.roi}%</span></p>
                <p className="text-sm text-muted-foreground">CPA: <span className="font-bold text-foreground">${channel.cpa.toFixed(2)}</span></p>
                <p className="text-sm text-muted-foreground">Avg. Engagement Rate: <span className="font-bold text-foreground">{channel.avgEngagementRate}%</span></p>
                <p className="text-sm text-muted-foreground mt-2">Recommendations: <span className="font-bold text-foreground">{channel.recommendations.join(', ')}</span></p>
              </Card>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold mb-4">ROI by Marketing Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="ROI" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>

          <h3 className="text-xl font-semibold mb-4 mt-6">CPA by Marketing Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cpaChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'CPA ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="CPA" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <h3 className="text-xl font-semibold mb-4 mt-6">Conversions by Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conversionsByChannel}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="conversions"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {conversionsByChannel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingAnalyticsSection; 