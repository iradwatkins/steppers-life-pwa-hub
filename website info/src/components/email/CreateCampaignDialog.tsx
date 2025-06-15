import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmailTemplate, EmailSegment, EmailRecipient } from '../../services/emailCampaignService';

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (campaignData: any) => void;
  templates: EmailTemplate[];
  segments: EmailSegment[];
  recipients: EmailRecipient[];
  eventId: string;
}

const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({
  isOpen,
  onClose,
  onCreateCampaign,
  templates,
  segments,
  recipients,
  eventId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    audienceType: 'all', // 'all' | 'segment' | 'custom'
    segmentId: '',
    subject: '',
    type: 'immediate' as 'immediate' | 'scheduled',
    scheduledAt: '',
    timezone: 'America/Chicago'
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.templateId || !formData.subject.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      // Determine recipients based on audience selection
      let campaignRecipients = recipients;
      if (formData.audienceType === 'segment' && formData.segmentId) {
        // In a real implementation, this would filter based on segment criteria
        campaignRecipients = recipients.slice(0, Math.floor(recipients.length / 2));
      }

      const selectedTemplate = templates.find(t => t.id === formData.templateId);
      
      const campaignData = {
        eventId,
        name: formData.name,
        type: formData.type,
        status: 'draft' as const,
        templateId: formData.templateId,
        subject: formData.subject,
        htmlContent: selectedTemplate?.htmlContent || '',
        textContent: selectedTemplate?.textContent || '',
        recipients: campaignRecipients,
        segmentId: formData.audienceType === 'segment' ? formData.segmentId : undefined,
        scheduledAt: formData.type === 'scheduled' ? formData.scheduledAt : undefined,
        timezone: formData.timezone
      };

      await onCreateCampaign(campaignData);
      
      // Reset form
      setFormData({
        name: '',
        templateId: '',
        audienceType: 'all',
        segmentId: '',
        subject: '',
        type: 'immediate',
        scheduledAt: '',
        timezone: 'America/Chicago'
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setFormData(prev => ({
      ...prev,
      templateId,
      subject: template?.subject || prev.subject
    }));
  };

  const getAudienceSize = () => {
    if (formData.audienceType === 'all') {
      return recipients.length;
    } else if (formData.audienceType === 'segment' && formData.segmentId) {
      const segment = segments.find(s => s.id === formData.segmentId);
      return segment?.recipientCount || 0;
    }
    return 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <DialogDescription>
            Set up a new email campaign for your event attendees
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name *</Label>
            <Input
              id="campaignName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 7-Day Event Reminder"
              required
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Email Template *</Label>
            <Select value={formData.templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject line"
              required
            />
          </div>

          {/* Audience Selection */}
          <div className="space-y-3">
            <Label>Audience</Label>
            <RadioGroup 
              value={formData.audienceType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, audienceType: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All attendees ({recipients.length} people)</Label>
              </div>
              
              {segments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="segment" id="segment" />
                  <Label htmlFor="segment">Specific segment</Label>
                </div>
              )}
            </RadioGroup>

            {formData.audienceType === 'segment' && (
              <Select value={formData.segmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, segmentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map(segment => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.recipientCount} people)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Send Options */}
          <div className="space-y-3">
            <Label>Send Option</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'immediate' | 'scheduled' }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate">Send immediately after creation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled">Schedule for later</Label>
              </div>
            </RadioGroup>

            {formData.type === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  required={formData.type === 'scheduled'}
                />
              </div>
            )}
          </div>

          {/* Campaign Summary */}
          <div className="bg-background-main p-3 rounded-lg text-sm">
            <p className="text-text-secondary">
              <strong>Campaign Summary:</strong> This email will be sent to {getAudienceSize()} recipients.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isCreating || !formData.name.trim() || !formData.templateId || !formData.subject.trim()}
            className="bg-brand-primary hover:bg-brand-primary-hover"
          >
            {isCreating ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignDialog; 