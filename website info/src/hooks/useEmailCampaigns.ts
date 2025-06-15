import { useState, useEffect } from 'react';
import { 
  emailCampaignService, 
  EmailTemplate, 
  EmailCampaign, 
  EmailSegment, 
  EmailRecipient 
} from '../services/emailCampaignService';

export const useEmailCampaigns = (eventId: string) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [segments, setSegments] = useState<EmailSegment[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [eventId]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [templatesData, campaignsData, segmentsData, recipientsData] = await Promise.all([
        emailCampaignService.getEmailTemplates(),
        emailCampaignService.getEmailCampaigns(eventId),
        emailCampaignService.getEmailSegments(eventId),
        emailCampaignService.getEventRecipients(eventId)
      ]);

      setTemplates(templatesData);
      setCampaigns(campaignsData);
      setSegments(segmentsData);
      setRecipients(recipientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  };

  // Template management
  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate = await emailCampaignService.createEmailTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      const updatedTemplate = await emailCampaignService.updateEmailTemplate(id, updates);
      if (updatedTemplate) {
        setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
        return updatedTemplate;
      }
      throw new Error('Template not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const success = await emailCampaignService.deleteEmailTemplate(id);
      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        return true;
      }
      throw new Error('Cannot delete built-in template');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  // Campaign management
  const createCampaign = async (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'analytics'>) => {
    try {
      const newCampaign = await emailCampaignService.createEmailCampaign(campaign);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      throw err;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<EmailCampaign>) => {
    try {
      const updatedCampaign = await emailCampaignService.updateEmailCampaign(id, updates);
      if (updatedCampaign) {
        setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c));
        return updatedCampaign;
      }
      throw new Error('Campaign not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      throw err;
    }
  };

  const sendCampaign = async (id: string) => {
    try {
      const success = await emailCampaignService.sendEmailCampaign(id);
      if (success) {
        // Update the campaign status immediately
        setCampaigns(prev => prev.map(c => 
          c.id === id ? { ...c, status: 'sending' as const } : c
        ));
        
        // Refresh campaigns after sending to get updated analytics
        setTimeout(() => {
          emailCampaignService.getEmailCampaigns(eventId).then(setCampaigns);
        }, 3000);
        
        return true;
      }
      throw new Error('Failed to send campaign');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
      throw err;
    }
  };

  // Segment management
  const createSegment = async (segment: Omit<EmailSegment, 'id' | 'createdAt' | 'recipientCount'>) => {
    try {
      const newSegment = await emailCampaignService.createEmailSegment(segment);
      setSegments(prev => [...prev, newSegment]);
      return newSegment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
      throw err;
    }
  };

  // Email preview
  const previewEmail = async (templateId: string, variables: Record<string, string>) => {
    try {
      return await emailCampaignService.previewEmail(templateId, variables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview email');
      throw err;
    }
  };

  // Analytics
  const getCampaignAnalytics = async (campaignId: string) => {
    try {
      return await emailCampaignService.getCampaignAnalytics(campaignId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get campaign analytics');
      throw err;
    }
  };

  const getEventAnalytics = async () => {
    try {
      return await emailCampaignService.getEventEmailAnalytics(eventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get event analytics');
      throw err;
    }
  };

  // Utility functions
  const getSegmentRecipients = (segmentId: string): EmailRecipient[] => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return [];

    return recipients.filter(recipient => {
      const { criteria } = segment;
      
      // Filter by ticket types
      if (criteria.ticketTypes && !criteria.ticketTypes.includes(recipient.ticketType)) {
        return false;
      }
      
      // Filter by purchase date range
      if (criteria.purchaseDateRange) {
        const purchaseDate = new Date(recipient.purchaseDate);
        const startDate = new Date(criteria.purchaseDateRange.start);
        const endDate = new Date(criteria.purchaseDateRange.end);
        
        if (purchaseDate < startDate || purchaseDate > endDate) {
          return false;
        }
      }
      
      // Filter by tags
      if (criteria.tags && !criteria.tags.some(tag => recipient.tags.includes(tag))) {
        return false;
      }
      
      return true;
    });
  };

  const getAllRecipients = (): EmailRecipient[] => {
    return recipients;
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    templates,
    campaigns,
    segments,
    recipients,
    isLoading,
    error,
    
    // Actions
    loadAllData,
    clearError,
    
    // Template operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Campaign operations
    createCampaign,
    updateCampaign,
    sendCampaign,
    
    // Segment operations
    createSegment,
    getSegmentRecipients,
    getAllRecipients,
    
    // Email operations
    previewEmail,
    
    // Analytics
    getCampaignAnalytics,
    getEventAnalytics
  };
}; 