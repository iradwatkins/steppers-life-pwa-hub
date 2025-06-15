import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Minus, Mail, Eye, MousePointer } from 'lucide-react';
import { EmailCampaign } from '../../services/emailCampaignService';

interface EmailAnalyticsDashboardProps {
  campaigns: EmailCampaign[];
  eventId: string;
}

const EmailAnalyticsDashboard: React.FC<EmailAnalyticsDashboardProps> = ({
  campaigns,
  eventId
}) => {
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');

  const calculateOverallMetrics = () => {
    if (sentCampaigns.length === 0) {
      return {
        totalSent: 0,
        totalRecipients: 0,
        avgDeliveryRate: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        totalOpened: 0,
        totalClicked: 0
      };
    }

    const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.analytics.totalRecipients, 0);
    const totalDelivered = sentCampaigns.reduce((sum, c) => sum + c.analytics.delivered, 0);
    const totalOpened = sentCampaigns.reduce((sum, c) => sum + c.analytics.opened, 0);
    const totalClicked = sentCampaigns.reduce((sum, c) => sum + c.analytics.clicked, 0);

    return {
      totalSent: sentCampaigns.length,
      totalRecipients,
      avgDeliveryRate: totalRecipients > 0 ? (totalDelivered / totalRecipients) * 100 : 0,
      avgOpenRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      avgClickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      totalOpened,
      totalClicked
    };
  };

  const metrics = calculateOverallMetrics();

  const getTrendIcon = (rate: number) => {
    if (rate >= 60) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate >= 30) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getPerformanceBadge = (rate: number, type: 'delivery' | 'open' | 'click') => {
    let threshold = { good: 90, fair: 70 }; // delivery
    if (type === 'open') threshold = { good: 25, fair: 15 };
    if (type === 'click') threshold = { good: 5, fair: 2 };

    if (rate >= threshold.good) return <Badge variant="success">Excellent</Badge>;
    if (rate >= threshold.fair) return <Badge variant="default">Good</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  if (sentCampaigns.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="bg-surface-card">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No analytics data yet</h3>
            <p className="text-text-secondary mb-4">
              Send your first email campaign to start tracking performance metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Campaign Performance Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Campaigns Sent</p>
                  <p className="text-2xl font-bold text-text-primary">{metrics.totalSent}</p>
                </div>
                <Mail className="h-8 w-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Recipients</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metrics.totalRecipients.toLocaleString()}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Opens</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metrics.totalOpened.toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Clicks</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metrics.totalClicked.toLocaleString()}
                  </p>
                </div>
                <MousePointer className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-surface-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              {getTrendIcon(metrics.avgDeliveryRate)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-text-primary">
                    {metrics.avgDeliveryRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-text-secondary">Average across campaigns</p>
                </div>
                {getPerformanceBadge(metrics.avgDeliveryRate, 'delivery')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              {getTrendIcon(metrics.avgOpenRate)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-text-primary">
                    {metrics.avgOpenRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-text-secondary">Average across campaigns</p>
                </div>
                {getPerformanceBadge(metrics.avgOpenRate, 'open')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              {getTrendIcon(metrics.avgClickRate)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-text-primary">
                    {metrics.avgClickRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-text-secondary">Average across campaigns</p>
                </div>
                {getPerformanceBadge(metrics.avgClickRate, 'click')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual Campaign Performance */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Individual Campaign Performance</h3>
        
        <div className="space-y-4">
          {sentCampaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-surface-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold text-text-primary">
                    {campaign.name}
                  </CardTitle>
                  <p className="text-sm text-text-secondary">
                    Sent: {new Date(campaign.sentAt!).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="success">Sent</Badge>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {campaign.analytics.totalRecipients}
                    </p>
                    <p className="text-xs text-text-secondary">Recipients</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {campaign.analytics.deliveryRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">Delivered</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {campaign.analytics.openRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">Opened</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {campaign.analytics.clickRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">Clicked</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {campaign.analytics.unsubscribed}
                    </p>
                    <p className="text-xs text-text-secondary">Unsubscribed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailAnalyticsDashboard; 