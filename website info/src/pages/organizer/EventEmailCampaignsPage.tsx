import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, FileText, Users, BarChart3, Plus, Send, Calendar, TrendingUp } from 'lucide-react';
import { useEmailCampaigns } from '../../hooks/useEmailCampaigns';
import EmailCampaignList from '../../components/email/EmailCampaignList';
import EmailTemplateManager from '../../components/email/EmailTemplateManager';
import EmailSegmentManager from '../../components/email/EmailSegmentManager';
import EmailAnalyticsDashboard from '../../components/email/EmailAnalyticsDashboard';
import CreateCampaignDialog from '../../components/email/CreateCampaignDialog';

interface EventInfo {
  id: string;
  name: string;
  date: string;
  location: string;
}

// Mock event data
const mockEvent: EventInfo = {
  id: 'evt001',
  name: 'Steppers Life Annual Dance Competition',
  date: '2025-02-15',
  location: 'Chicago Cultural Center'
};

const EventEmailCampaignsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const {
    templates,
    campaigns,
    segments,
    recipients,
    isLoading,
    error,
    createCampaign,
    sendCampaign,
    getEventAnalytics
  } = useEmailCampaigns(eventId || 'evt001');

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      await createCampaign(campaignData);
      setIsCreateDialogOpen(false);
      setActiveTab('campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await sendCampaign(campaignId);
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const getQuickStats = () => {
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
    const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled').length;
    const totalRecipients = recipients.length;

    return {
      totalCampaigns,
      sentCampaigns,
      scheduledCampaigns,
      totalRecipients
    };
  };

  const stats = getQuickStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading email campaigns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate(`/organizer/event/${eventId}/manage`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Event
        </Button>

        {/* Header */}
        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Mail className="mr-2 h-6 w-6 text-brand-primary" />
              Email Campaigns
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Send updates, reminders, and promotional emails to your event attendees
            </CardDescription>
            <div className="text-sm text-text-tertiary mt-2">
              <strong>Event:</strong> {mockEvent.name} • <strong>Date:</strong> {mockEvent.date}
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Campaigns</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalCampaigns}</p>
                </div>
                <Mail className="h-8 w-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sentCampaigns}</p>
                </div>
                <Send className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduledCampaigns}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Recipients</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalRecipients}</p>
                </div>
                <Users className="h-8 w-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="bg-surface-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-text-primary">
                Email Campaign Management
              </CardTitle>
              <CardDescription>
                Manage your email templates, campaigns, audience segments, and view analytics
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-brand-primary hover:bg-brand-primary-hover">
              <Plus className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="campaigns" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="segments" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Segments
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="campaigns" className="space-y-4">
                  <EmailCampaignList
                    campaigns={campaigns}
                    templates={templates}
                    onSendCampaign={handleSendCampaign}
                    eventId={eventId || 'evt001'}
                  />
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <EmailTemplateManager
                    templates={templates}
                    eventId={eventId || 'evt001'}
                  />
                </TabsContent>

                <TabsContent value="segments" className="space-y-4">
                  <EmailSegmentManager
                    segments={segments}
                    recipients={recipients}
                    eventId={eventId || 'evt001'}
                  />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <EmailAnalyticsDashboard
                    campaigns={campaigns}
                    eventId={eventId || 'evt001'}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Create Campaign Dialog */}
        <CreateCampaignDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateCampaign={handleCreateCampaign}
          templates={templates}
          segments={segments}
          recipients={recipients}
          eventId={eventId || 'evt001'}
        />
      </div>
    </div>
  );
};

export default EventEmailCampaignsPage; 