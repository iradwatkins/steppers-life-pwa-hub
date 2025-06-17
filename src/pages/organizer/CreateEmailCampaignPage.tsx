import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { EmailCampaignService, type CreateCampaignData } from '@/services/emailCampaignService';
import { EmailSegmentService, type EmailSegment } from '@/services/emailSegmentService';
import { EmailTemplateService, type EmailTemplate } from '@/services/emailTemplateService';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Users,
  Calendar,
  Clock,
  Mail,
  Settings,
  Wand2
} from 'lucide-react';

const CreateEmailCampaignPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<CreateCampaignData>({
    name: '',
    subject: '',
    template_id: '',
    segment_id: '',
    event_id: '',
    scheduled_at: '',
    template_variables: {},
    sender_name: 'SteppersLife Events',
    sender_email: 'noreply@stepperslife.com'
  });
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<EmailSegment[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [templatesData, segmentsData] = await Promise.all([
        EmailTemplateService.getOrganizerTemplates(user.id),
        EmailSegmentService.getOrganizerSegments(user.id)
      ]);

      setTemplates(templatesData);
      setSegments(segmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load templates and segments",
        variant: "destructive"
      });
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    
    if (template) {
      // Pre-populate subject if template has subject template
      if (template.subject_template && !formData.subject) {
        setFormData(prev => ({
          ...prev,
          template_id: templateId,
          subject: template.subject_template
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          template_id: templateId
        }));
      }
    }
  };

  const handleSave = async (sendNow = false) => {
    if (!user) return;

    if (!formData.name || !formData.subject || !formData.template_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const campaign = await EmailCampaignService.createCampaign(user.id, formData);
      
      if (!campaign) {
        throw new Error('Failed to create campaign');
      }

      if (sendNow) {
        const success = await EmailCampaignService.sendCampaign(campaign.id);
        if (success) {
          toast({
            title: "Success",
            description: "Campaign created and sent successfully!"
          });
        } else {
          toast({
            title: "Partial Success",
            description: "Campaign created but failed to send. You can send it later."
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Campaign saved as draft"
        });
      }

      navigate('/organizer/email-campaigns');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive"
      });
      return;
    }

    // Navigate to preview page with current form data
    const searchParams = new URLSearchParams({
      template_id: formData.template_id,
      subject: formData.subject,
      variables: JSON.stringify(formData.template_variables)
    });
    
    navigate(`/organizer/email-campaigns/preview?${searchParams}`);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., February Social Event Promotion"
            />
          </div>

          <div>
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Don't Miss Our Amazing February Social!"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sender_name">Sender Name</Label>
              <Input
                id="sender_name"
                value={formData.sender_name}
                onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sender_email">Sender Email</Label>
              <Input
                id="sender_email"
                value={formData.sender_email}
                onChange={(e) => setFormData(prev => ({ ...prev, sender_email: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-3">Template Selection *</h3>
        
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No templates available</h4>
              <p className="text-muted-foreground mb-4">
                Create an email template first to use in your campaigns
              </p>
              <Button onClick={() => navigate('/organizer/email-templates/create')}>
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(templates || []).map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all ${
                  formData.template_id === template.id 
                    ? 'ring-2 ring-blue-500 border-blue-200' 
                    : 'hover:border-blue-200'
                }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Subject: {template.subject_template}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Audience & Scheduling</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="segment">Target Audience (Optional)</Label>
            <Select 
              value={formData.segment_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, segment_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Send to all subscribers or select a segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subscribers</SelectItem>
                {(segments || []).map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {segment.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {segments.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600"
                  onClick={() => navigate('/organizer/email-segments/create')}
                >
                  Create audience segments
                </Button> to target specific groups
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="scheduled_at">Schedule Delivery (Optional)</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to save as draft or send immediately
            </p>
          </div>
        </div>
      </div>

      {selectedTemplate && (selectedTemplate.variables as any[])?.length > 0 && (
        <>
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Template Variables</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Customize the template content with your specific values
            </p>
            
            <div className="space-y-4">
              {((selectedTemplate.variables as any[]) || []).map((variable: any) => (
                <div key={variable.name}>
                  <Label htmlFor={variable.name}>
                    {variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {variable.required && ' *'}
                  </Label>
                  {variable.type === 'text' ? (
                    <Input
                      id={variable.name}
                      value={formData.template_variables?.[variable.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_variables: {
                          ...prev.template_variables,
                          [variable.name]: e.target.value
                        }
                      }))}
                      placeholder={variable.description || variable.default_value}
                    />
                  ) : variable.type === 'date' ? (
                    <Input
                      id={variable.name}
                      type="date"
                      value={formData.template_variables?.[variable.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_variables: {
                          ...prev.template_variables,
                          [variable.name]: e.target.value
                        }
                      }))}
                    />
                  ) : (
                    <Textarea
                      id={variable.name}
                      value={formData.template_variables?.[variable.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        template_variables: {
                          ...prev.template_variables,
                          [variable.name]: e.target.value
                        }
                      }))}
                      placeholder={variable.description || variable.default_value}
                      rows={3}
                    />
                  )}
                  {variable.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {variable.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/organizer/email-campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Email Campaign</h1>
          <p className="text-muted-foreground">
            Create a new email marketing campaign for your events
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <span className="font-medium">Campaign & Template</span>
        </div>
        
        <div className={`h-px w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-muted'}`} />
        
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
          <span className="font-medium">Audience & Settings</span>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {step === 1 ? renderStep1() : renderStep2()}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {step === 2 && (
            <>
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              <Button onClick={() => handleSave(true)} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {formData.scheduled_at ? 'Schedule Campaign' : 'Send Now'}
              </Button>
            </>
          )}
          
          {step === 1 && (
            <Button 
              onClick={() => setStep(2)} 
              disabled={!formData.name || !formData.subject || !formData.template_id}
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEmailCampaignPage;