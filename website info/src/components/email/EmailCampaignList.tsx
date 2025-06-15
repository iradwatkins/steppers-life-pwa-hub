import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Send, 
  Calendar, 
  Users, 
  BarChart3, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';
import { EmailCampaign, EmailTemplate } from '../../services/emailCampaignService';
import { format } from 'date-fns';

interface EmailCampaignListProps {
  campaigns: EmailCampaign[];
  templates: EmailTemplate[];
  onSendCampaign: (campaignId: string) => Promise<void>;
  eventId: string;
}

const EmailCampaignList: React.FC<EmailCampaignListProps> = ({
  campaigns,
  templates,
  onSendCampaign,
  eventId
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'scheduled': return 'default';
      case 'sending': return 'destructive';
      case 'sent': return 'success';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'scheduled': return <Clock className="h-3 w-3" />;
      case 'sending': return <Send className="h-3 w-3" />;
      case 'sent': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Edit className="h-3 w-3" />;
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  const handlePreviewCampaign = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setIsPreviewOpen(true);
  };

  const handleSendConfirm = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setIsConfirmSendOpen(true);
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaign) return;
    
    try {
      setSendingCampaignId(selectedCampaign.id);
      await onSendCampaign(selectedCampaign.id);
      setIsConfirmSendOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Failed to send campaign:', error);
    } finally {
      setSendingCampaignId(null);
    }
  };

  const formatAnalytics = (campaign: EmailCampaign) => {
    const { analytics } = campaign;
    return {
      deliveryRate: `${analytics.deliveryRate.toFixed(1)}%`,
      openRate: `${analytics.openRate.toFixed(1)}%`,
      clickRate: `${analytics.clickRate.toFixed(1)}%`,
      recipients: analytics.totalRecipients
    };
  };

  if (campaigns.length === 0) {
    return (
      <Card className="bg-surface-card">
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No email campaigns yet</h3>
          <p className="text-text-secondary mb-4">
            Create your first email campaign to start communicating with your attendees.
          </p>
          <Button className="bg-brand-primary hover:bg-brand-primary-hover">
            Create Your First Campaign
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const analytics = formatAnalytics(campaign);
        const isSending = sendingCampaignId === campaign.id;
        
        return (
          <Card key={campaign.id} className="bg-surface-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-text-primary">
                  {campaign.name}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  Template: {getTemplateName(campaign.templateId)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeVariant(campaign.status)} className="flex items-center">
                  {getStatusIcon(campaign.status)}
                  <span className="ml-1 capitalize">{campaign.status}</span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Campaign Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-text-tertiary mr-2" />
                    <span className="text-text-secondary">
                      {analytics.recipients} recipients
                    </span>
                  </div>
                  
                  {campaign.scheduledAt && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-text-tertiary mr-2" />
                      <span className="text-text-secondary">
                        {format(new Date(campaign.scheduledAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <span className="text-text-secondary">
                      Created: {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Analytics (for sent campaigns) */}
                {campaign.status === 'sent' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-background-main rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">{analytics.deliveryRate}</p>
                      <p className="text-xs text-text-secondary">Delivery Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">{analytics.openRate}</p>
                      <p className="text-xs text-text-secondary">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">{analytics.clickRate}</p>
                      <p className="text-xs text-text-secondary">Click Rate</p>
                    </div>
                  </div>
                )}

                {/* Subject Line */}
                <div className="bg-background-main p-3 rounded-lg">
                  <p className="text-sm text-text-secondary mb-1">Subject:</p>
                  <p className="text-text-primary font-medium">{campaign.subject}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewCampaign(campaign)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    
                    {campaign.status === 'sent' && (
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendConfirm(campaign)}
                        disabled={isSending}
                        className="bg-brand-primary hover:bg-brand-primary-hover"
                      >
                        {isSending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will appear to recipients
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-text-secondary">Subject:</p>
                <p className="font-medium text-text-primary">{selectedCampaign.subject}</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-white">
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedCampaign.htmlContent }}
                  className="prose prose-sm max-w-none"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={isConfirmSendOpen} onOpenChange={setIsConfirmSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this email campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Campaign:</p>
                <p className="font-medium text-text-primary">{selectedCampaign.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-text-secondary">Recipients:</p>
                <p className="font-medium text-text-primary">
                  {selectedCampaign.recipients.length} people
                </p>
              </div>
              
              <div>
                <p className="text-sm text-text-secondary">Subject:</p>
                <p className="font-medium text-text-primary">{selectedCampaign.subject}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmSendOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendCampaign}
              disabled={sendingCampaignId !== null}
              className="bg-brand-primary hover:bg-brand-primary-hover"
            >
              {sendingCampaignId ? 'Sending...' : 'Send Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailCampaignList; 