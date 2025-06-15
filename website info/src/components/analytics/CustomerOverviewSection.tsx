import React from 'react';
import { TrendingUp, TrendingDown, Users, AlertTriangle, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  SegmentationAnalytics,
  CustomerDemographics,
  CustomerLifetimeValue,
  ChurnAnalysis,
  CustomerSegment
} from '@/services/customerAnalyticsService';

interface CustomerOverviewSectionProps {
  segmentationAnalytics: SegmentationAnalytics | null;
  metrics: {
    totalCustomers: number;
    highValueCustomers: number;
    atRiskCustomers: number;
    averageCLV: number;
    topSegmentsByRevenue: any[];
  };
  demographics: CustomerDemographics[];
  clvData: CustomerLifetimeValue[];
  churnAnalysis: ChurnAnalysis[];
  segments: CustomerSegment[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function CustomerOverviewSection({
  segmentationAnalytics,
  metrics,
  demographics,
  clvData,
  churnAnalysis,
  segments
}: CustomerOverviewSectionProps) {
  if (!segmentationAnalytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading customer analytics overview...</p>
      </div>
    );
  }

  // Calculate insights
  const insights = segmentationAnalytics.insights;
  const topSegments = segmentationAnalytics.topSegments.slice(0, 3);
  
  // Prepare chart data
  const ageDistributionData = segmentationAnalytics.demographics.ageDistribution.map(item => ({
    name: item.ageGroup,
    value: item.count,
    percentage: item.percentage
  }));

  const locationData = segmentationAnalytics.demographics.locationDistribution.slice(0, 5).map(item => ({
    name: item.location,
    customers: item.count,
    percentage: item.percentage
  }));

  const incomeData = segmentationAnalytics.demographics.incomeDistribution.map(item => ({
    name: item.income,
    value: item.count,
    percentage: item.percentage
  }));

  const retentionData = segmentationAnalytics.behavior.retentionRates.map(item => ({
    segment: item.segment,
    rate: Math.round(item.rate * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Key Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Key Insights & Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.growingSegments.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Growing Segments</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {insights.growingSegments.map((segment, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {insights.highValueOpportunities.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">High-Value Opportunities</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {insights.highValueOpportunities.map((opportunity, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {opportunity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {insights.retentionConcerns.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">Retention Concerns</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {insights.retentionConcerns.map((concern, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segment Performance</CardTitle>
            <CardDescription>Top performing segments by revenue and growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSegments.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.segment.name}</span>
                      <span className="text-sm text-gray-600">
                        ${item.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{item.segment.customerCount} customers</span>
                      <div className="flex items-center">
                        {item.growth > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        <span className={item.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                          {(item.growth * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Customer age group breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ageDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}
                >
                  {ageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Customer geographic distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Customers']}
                  labelFormatter={(label) => `Location: ${label}`}
                />
                <Bar dataKey="customers" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Distribution</CardTitle>
            <CardDescription>Customer income level breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomeData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Segment Retention Rates</CardTitle>
            <CardDescription>Customer retention by segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={retentionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="segment" type="category" width={120} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Retention Rate']}
                />
                <Bar dataKey="rate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Levels</CardTitle>
            <CardDescription>Customer engagement distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {segmentationAnalytics.behavior.engagementLevels.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-3 ${
                        item.level === 'High' ? 'bg-green-500' :
                        item.level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium">{item.level} Engagement</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.count}</div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Analytics Summary</CardTitle>
          <CardDescription>Key performance indicators and actionable insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{segmentationAnalytics.totalCustomers}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{segmentationAnalytics.totalSegments}</div>
              <div className="text-sm text-gray-600">Active Segments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(metrics.averageCLV)}
              </div>
              <div className="text-sm text-gray-600">Average CLV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((metrics.highValueCustomers / metrics.totalCustomers) * 100)}%
              </div>
              <div className="text-sm text-gray-600">High-Value Rate</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Recommended Actions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Focus retention efforts on {insights.retentionConcerns.join(', ')}</li>
              <li>• Expand marketing to growing segments: {insights.growingSegments.join(', ')}</li>
              <li>• Develop targeted campaigns for high-value opportunities</li>
              <li>• Implement personalized engagement strategies for different segments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 