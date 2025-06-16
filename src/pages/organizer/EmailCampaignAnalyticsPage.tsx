import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EmailCampaignService, type CampaignWithStats } from '@/services/emailCampaignService';
import {
  ArrowLeft,
  Mail,
  Eye,
  MousePointer,
  UserMinus,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';

const EmailCampaignAnalyticsPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<CampaignWithStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      loadCampaignData();
    }
  }, [campaignId]);

  const loadCampaignData = async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      const data = await EmailCampaignService.getCampaignWithStats(campaignId);
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      sending: 'bg-yellow-500',
      sent: 'bg-green-500',
      failed: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateClickThroughRate = () => {
    if (!campaign?.stats.total_opened) return 0;
    return (campaign.stats.total_clicked / campaign.stats.total_opened) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
        <Button onClick={() => navigate('/organizer/email-campaigns')}>
          Return to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/organizer/email-campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">Campaign Analytics & Performance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(campaign.status)} text-white capitalize`}
          >
            {campaign.status}
          </Badge>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Campaign Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Subject Line</h4>
              <p className="font-semibold">{campaign.subject}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Sent Date</h4>
              <p className="font-semibold">
                {campaign.sent_at ? formatDate(campaign.sent_at) : 'Not sent yet'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Campaign Type</h4>
              <p className="font-semibold capitalize">
                {campaign.segment_id ? 'Targeted' : 'Broadcast'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{campaign.stats.total_sent.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{campaign.stats.open_rate.toFixed(1)}%</p>
                <Progress value={campaign.stats.open_rate} className="mt-2" />
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{campaign.stats.click_rate.toFixed(1)}%</p>
                <Progress value={campaign.stats.click_rate} className="mt-2" />
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unsubscribe Rate</p>
                <p className="text-2xl font-bold">{campaign.stats.unsubscribe_rate.toFixed(1)}%</p>
                <Progress value={campaign.stats.unsubscribe_rate} className="mt-2" />
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <UserMinus className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed breakdown of email engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Delivered</span>
                  <span className="text-sm font-bold">{campaign.stats.total_sent}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Opened</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{campaign.stats.total_opened}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({campaign.stats.open_rate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Clicked</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{campaign.stats.total_clicked}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({campaign.stats.click_rate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Click-through Rate</span>
                  <span className="text-sm font-bold">{calculateClickThroughRate().toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Unsubscribed</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{campaign.stats.total_unsubscribed}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({campaign.stats.unsubscribe_rate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Benchmarks */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
                <CardDescription>
                  How your campaign compares to industry averages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Open Rate</span>
                    <span className="text-sm">
                      {campaign.stats.open_rate.toFixed(1)}% vs 21.5% avg
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={campaign.stats.open_rate} className="flex-1" />
                    <Progress value={21.5} className="flex-1 opacity-50" />
                  </div>
                  {campaign.stats.open_rate > 21.5 ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Above industry average
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Below industry average
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Click Rate</span>
                    <span className="text-sm">
                      {campaign.stats.click_rate.toFixed(1)}% vs 2.6% avg
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={campaign.stats.click_rate * 4} className="flex-1" />
                    <Progress value={2.6 * 4} className="flex-1 opacity-50" />
                  </div>
                  {campaign.stats.click_rate > 2.6 ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Above industry average
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Below industry average
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Unsubscribe Rate</span>
                    <span className="text-sm">
                      {campaign.stats.unsubscribe_rate.toFixed(1)}% vs 0.5% avg
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={campaign.stats.unsubscribe_rate * 20} className="flex-1" />
                    <Progress value={0.5 * 20} className="flex-1 opacity-50" />
                  </div>
                  {campaign.stats.unsubscribe_rate < 0.5 ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Below industry average (good)
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Above industry average
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Timeline</CardTitle>
              <CardDescription>
                When your audience engaged with this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Engagement timeline chart would be displayed here</p>
                <p className="text-sm">This feature requires additional analytics integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>
                Learn more about who engaged with your campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>Audience demographic analysis would be displayed here</p>
                <p className="text-sm">This feature requires additional user data collection</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Based on your campaign performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaign.stats.open_rate < 20 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Improve Subject Lines</p>
                  <p className="text-sm text-orange-700">
                    Your open rate is below average. Try A/B testing different subject lines to improve engagement.
                  </p>
                </div>
              </div>
            )}
            
            {campaign.stats.click_rate < 2 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Enhance Call-to-Action</p>
                  <p className="text-sm text-blue-700">
                    Low click rates suggest your call-to-action could be more compelling. Try using action-oriented buttons.
                  </p>
                </div>
              </div>
            )}
            
            {campaign.stats.open_rate > 25 && campaign.stats.click_rate > 3 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Great Performance!</p>
                  <p className="text-sm text-green-700">
                    This campaign performed above industry averages. Consider using this template and strategy for future campaigns.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCampaignAnalyticsPage;