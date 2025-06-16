import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { EmailCampaignService, type EmailCampaign } from '@/services/emailCampaignService';
import { EmailSegmentService, type EmailSegment } from '@/services/emailSegmentService';
import { EmailTemplateService, type EmailTemplate } from '@/services/emailTemplateService';
import {
  Plus,
  Search,
  Calendar,
  Users,
  Mail,
  BarChart3,
  Edit,
  Copy,
  Trash2,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CampaignStats {
  total_campaigns: number;
  total_sent: number;
  avg_open_rate: number;
  avg_click_rate: number;
  total_revenue: number;
}

const EmailCampaignsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [segments, setSegments] = useState<EmailSegment[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [campaignsData, segmentsData, templatesData, statsData] = await Promise.all([
        EmailCampaignService.getOrganizerCampaigns(user.id),
        EmailSegmentService.getOrganizerSegments(user.id),
        EmailTemplateService.getOrganizerTemplates(user.id),
        EmailCampaignService.getCampaignPerformanceSummary(user.id)
      ]);

      setCampaigns(campaignsData);
      setSegments(segmentsData);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    const success = await EmailCampaignService.deleteCampaign(campaignId);
    if (success) {
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      toast({
        title: "Success",
        description: "Campaign deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive"
      });
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign now?')) return;

    const success = await EmailCampaignService.sendCampaign(campaignId);
    if (success) {
      loadData(); // Refresh to get updated status
      toast({
        title: "Success",
        description: "Campaign sent successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive"
      });
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'secondary', icon: Edit },
      scheduled: { color: 'blue', icon: Clock },
      sending: { color: 'yellow', icon: Loader2 },
      sent: { color: 'green', icon: CheckCircle },
      failed: { color: 'red', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.color === 'secondary' ? 'secondary' : 'outline'} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage email marketing campaigns for your events
          </p>
        </div>
        <Button onClick={() => navigate('/organizer/email-campaigns/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{stats.total_campaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                  <p className="text-2xl font-bold">{stats.total_sent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Open Rate</p>
                  <p className="text-2xl font-bold">{stats.avg_open_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Click Rate</p>
                  <p className="text-2xl font-bold">{stats.avg_click_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">$</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
                  <p className="text-2xl font-bold">${stats.total_revenue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="segments">Audiences ({segments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Campaigns List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first email campaign to start promoting your events
                  </p>
                  <Button onClick={() => navigate('/organizer/email-campaigns/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          Subject: {campaign.subject}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {campaign.scheduled_at 
                              ? `Scheduled: ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                              : `Created: ${new Date(campaign.created_at).toLocaleDateString()}`
                            }
                          </div>
                          
                          {campaign.segment_id && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Targeted Audience
                            </div>
                          )}

                          {campaign.event_id && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Event Campaign
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/organizer/email-campaigns/${campaign.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/organizer/email-campaigns/${campaign.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {campaign.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Manage email templates for your campaigns
            </p>
            <Button onClick={() => navigate('/organizer/email-templates/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {template.category}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/organizer/email-templates/${template.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/organizer/email-templates/${template.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Manage audience segments for targeted campaigns
            </p>
            <Button onClick={() => navigate('/organizer/email-segments/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <CardTitle className="text-base">{segment.name}</CardTitle>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Dynamic Segment</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/organizer/email-segments/${segment.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/organizer/email-segments/${segment.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailCampaignsPage;