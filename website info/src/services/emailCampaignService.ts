import { EventDetails } from '../types/events';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'reminder' | 'update' | 'announcement' | 'marketing' | 'custom';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  purchaseDate: string;
  tags: string[];
}

export interface EmailSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    ticketTypes?: string[];
    purchaseDateRange?: { start: string; end: string };
    tags?: string[];
    customCriteria?: any;
  };
  recipientCount: number;
  createdAt: string;
}

export interface EmailCampaign {
  id: string;
  eventId: string;
  name: string;
  type: 'immediate' | 'scheduled' | 'automated';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  templateId: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  recipients: EmailRecipient[];
  segmentId?: string;
  scheduledAt?: string;
  timezone: string;
  analytics: {
    totalRecipients: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  abTest?: {
    enabled: boolean;
    subjectA: string;
    subjectB: string;
    splitPercentage: number;
    winnerSubject?: string;
  };
  createdAt: string;
  sentAt?: string;
}

export interface AutomatedEmailSequence {
  id: string;
  eventId: string;
  name: string;
  type: 'reminder' | 'followup' | 'promotional';
  enabled: boolean;
  triggers: {
    timing: string; // e.g., '7d', '1d', '2h' before event
    templateId: string;
    subject: string;
  }[];
  segmentId?: string;
  createdAt: string;
}

// Mock data for email templates
const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'tmpl_001',
    name: 'Event Reminder - 7 Days',
    description: 'Standard reminder sent 7 days before the event',
    category: 'reminder',
    subject: 'Don\'t forget! {{eventName}} is in 7 days',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">{{eventName}} is coming up!</h2>
        <p>Hi {{recipientName}},</p>
        <p>Just a friendly reminder that <strong>{{eventName}}</strong> is happening in just 7 days!</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Event Details:</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
        </div>
        <p>We can't wait to see you there! If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>{{organizerName}}</p>
      </div>
    `,
    textContent: `{{eventName}} is coming up!\n\nHi {{recipientName}},\n\nJust a friendly reminder that {{eventName}} is happening in just 7 days!\n\nEvent Details:\nDate: {{eventDate}}\nTime: {{eventTime}}\nLocation: {{eventLocation}}\n\nWe can't wait to see you there!\n\nBest regards,\n{{organizerName}}`,
    variables: ['recipientName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'organizerName'],
    isBuiltIn: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'tmpl_002',
    name: 'Event Update - Venue Change',
    description: 'Notification for venue or location changes',
    category: 'update',
    subject: 'Important Update: {{eventName}} Venue Change',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Important Update for {{eventName}}</h2>
        <p>Hi {{recipientName}},</p>
        <p>We have an important update regarding <strong>{{eventName}}</strong>.</p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #856404;">Venue Change</h3>
          <p><strong>New Location:</strong> {{newVenue}}</p>
          <p><strong>Previous Location:</strong> {{oldVenue}}</p>
        </div>
        <p>All other event details remain the same:</p>
        <p><strong>Date:</strong> {{eventDate}}<br>
        <strong>Time:</strong> {{eventTime}}</p>
        <p>We apologize for any inconvenience this may cause. Please update your calendar and travel plans accordingly.</p>
        <p>Best regards,<br>{{organizerName}}</p>
      </div>
    `,
    textContent: `Important Update for {{eventName}}\n\nHi {{recipientName}},\n\nWe have an important update regarding {{eventName}}.\n\nVenue Change:\nNew Location: {{newVenue}}\nPrevious Location: {{oldVenue}}\n\nAll other event details remain the same:\nDate: {{eventDate}}\nTime: {{eventTime}}\n\nWe apologize for any inconvenience.\n\nBest regards,\n{{organizerName}}`,
    variables: ['recipientName', 'eventName', 'eventDate', 'eventTime', 'newVenue', 'oldVenue', 'organizerName'],
    isBuiltIn: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'tmpl_003',
    name: 'Thank You & Feedback',
    description: 'Post-event thank you message with feedback request',
    category: 'marketing',
    subject: 'Thank you for attending {{eventName}}!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Thank you for attending {{eventName}}!</h2>
        <p>Hi {{recipientName}},</p>
        <p>We hope you had an amazing time at <strong>{{eventName}}</strong>!</p>
        <p>Your presence made the event truly special, and we're grateful you chose to spend your time with us.</p>
        <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <h3 style="margin-top: 0;">Help us improve!</h3>
          <p>We'd love to hear about your experience. Your feedback helps us create even better events.</p>
          <a href="{{feedbackUrl}}" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Leave Feedback</a>
        </div>
        <p>Keep an eye out for our upcoming events - we have some exciting things planned!</p>
        <p>Best regards,<br>{{organizerName}}</p>
      </div>
    `,
    textContent: `Thank you for attending {{eventName}}!\n\nHi {{recipientName}},\n\nWe hope you had an amazing time at {{eventName}}!\n\nYour presence made the event truly special.\n\nWe'd love to hear about your experience: {{feedbackUrl}}\n\nKeep an eye out for our upcoming events!\n\nBest regards,\n{{organizerName}}`,
    variables: ['recipientName', 'eventName', 'organizerName', 'feedbackUrl'],
    isBuiltIn: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  }
];

// Mock data for email campaigns
const mockEmailCampaigns: EmailCampaign[] = [
  {
    id: 'campaign_001',
    eventId: 'evt001',
    name: '7-Day Reminder Campaign',
    type: 'scheduled',
    status: 'sent',
    templateId: 'tmpl_001',
    subject: 'Don\'t forget! Steppers Life Annual Competition is in 7 days',
    htmlContent: mockEmailTemplates[0].htmlContent,
    textContent: mockEmailTemplates[0].textContent,
    recipients: [],
    scheduledAt: '2025-01-08T10:00:00Z',
    timezone: 'America/Chicago',
    analytics: {
      totalRecipients: 150,
      delivered: 148,
      opened: 89,
      clicked: 23,
      bounced: 2,
      unsubscribed: 1,
      deliveryRate: 98.7,
      openRate: 60.1,
      clickRate: 25.8
    },
    createdAt: '2025-01-07T14:30:00Z',
    sentAt: '2025-01-08T10:00:00Z'
  }
];

// Mock segments
const mockEmailSegments: EmailSegment[] = [
  {
    id: 'segment_001',
    name: 'VIP Ticket Holders',
    description: 'All attendees who purchased VIP tickets',
    criteria: {
      ticketTypes: ['VIP Package']
    },
    recipientCount: 25,
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'segment_002',
    name: 'Early Bird Buyers',
    description: 'Attendees who purchased tickets in the first week',
    criteria: {
      purchaseDateRange: {
        start: '2024-12-01T00:00:00Z',
        end: '2024-12-07T23:59:59Z'
      }
    },
    recipientCount: 78,
    createdAt: '2025-01-10T00:00:00Z'
  }
];

export const emailCampaignService = {
  // Template management
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return mockEmailTemplates;
  },

  async getEmailTemplate(id: string): Promise<EmailTemplate | null> {
    return mockEmailTemplates.find(template => template.id === id) || null;
  },

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `tmpl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockEmailTemplates.push(newTemplate);
    return newTemplate;
  },

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const index = mockEmailTemplates.findIndex(template => template.id === id);
    if (index !== -1) {
      mockEmailTemplates[index] = {
        ...mockEmailTemplates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return mockEmailTemplates[index];
    }
    return null;
  },

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const index = mockEmailTemplates.findIndex(template => template.id === id);
    if (index !== -1 && !mockEmailTemplates[index].isBuiltIn) {
      mockEmailTemplates.splice(index, 1);
      return true;
    }
    return false;
  },

  // Campaign management
  async getEmailCampaigns(eventId: string): Promise<EmailCampaign[]> {
    return mockEmailCampaigns.filter(campaign => campaign.eventId === eventId);
  },

  async getEmailCampaign(id: string): Promise<EmailCampaign | null> {
    return mockEmailCampaigns.find(campaign => campaign.id === id) || null;
  },

  async createEmailCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'analytics'>): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: `campaign_${Date.now()}`,
      analytics: {
        totalRecipients: campaign.recipients.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      },
      createdAt: new Date().toISOString()
    };
    mockEmailCampaigns.push(newCampaign);
    return newCampaign;
  },

  async updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const index = mockEmailCampaigns.findIndex(campaign => campaign.id === id);
    if (index !== -1) {
      mockEmailCampaigns[index] = {
        ...mockEmailCampaigns[index],
        ...updates
      };
      return mockEmailCampaigns[index];
    }
    return null;
  },

  async sendEmailCampaign(id: string): Promise<boolean> {
    const campaign = await this.getEmailCampaign(id);
    if (campaign && campaign.status === 'draft') {
      await this.updateEmailCampaign(id, {
        status: 'sending',
        sentAt: new Date().toISOString()
      });
      
      // Simulate sending process
      setTimeout(async () => {
        await this.updateEmailCampaign(id, {
          status: 'sent',
          analytics: {
            ...campaign.analytics,
            delivered: Math.floor(campaign.analytics.totalRecipients * 0.98),
            deliveryRate: 98.0
          }
        });
      }, 2000);

      return true;
    }
    return false;
  },

  // Recipient and segmentation
  async getEventRecipients(eventId: string): Promise<EmailRecipient[]> {
    // Mock recipient data
    return [
      {
        id: 'rec_001',
        name: 'Sarah Miller',
        email: 'sarah.miller@example.com',
        ticketType: 'General Admission',
        purchaseDate: '2024-12-15T10:30:00Z',
        tags: ['early-bird', 'returning-customer']
      },
      {
        id: 'rec_002',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        ticketType: 'VIP Package',
        purchaseDate: '2024-12-20T14:15:00Z',
        tags: ['vip', 'corporate']
      }
    ];
  },

  async getEmailSegments(eventId: string): Promise<EmailSegment[]> {
    return mockEmailSegments;
  },

  async createEmailSegment(segment: Omit<EmailSegment, 'id' | 'createdAt' | 'recipientCount'>): Promise<EmailSegment> {
    const newSegment: EmailSegment = {
      ...segment,
      id: `segment_${Date.now()}`,
      recipientCount: 0, // Would be calculated based on criteria
      createdAt: new Date().toISOString()
    };
    mockEmailSegments.push(newSegment);
    return newSegment;
  },

  // Variable substitution
  substituteVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  },

  // Email preview
  async previewEmail(templateId: string, variables: Record<string, string>): Promise<{ html: string; text: string; subject: string }> {
    const template = await this.getEmailTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return {
      html: this.substituteVariables(template.htmlContent, variables),
      text: this.substituteVariables(template.textContent, variables),
      subject: this.substituteVariables(template.subject, variables)
    };
  },

  // Analytics
  async getCampaignAnalytics(campaignId: string): Promise<EmailCampaign['analytics'] | null> {
    const campaign = await this.getEmailCampaign(campaignId);
    return campaign?.analytics || null;
  },

  async getEventEmailAnalytics(eventId: string): Promise<{
    totalCampaigns: number;
    totalRecipients: number;
    avgDeliveryRate: number;
    avgOpenRate: number;
    avgClickRate: number;
  }> {
    const campaigns = await this.getEmailCampaigns(eventId);
    const sentCampaigns = campaigns.filter(c => c.status === 'sent');
    
    if (sentCampaigns.length === 0) {
      return {
        totalCampaigns: 0,
        totalRecipients: 0,
        avgDeliveryRate: 0,
        avgOpenRate: 0,
        avgClickRate: 0
      };
    }

    const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.analytics.totalRecipients, 0);
    const avgDeliveryRate = sentCampaigns.reduce((sum, c) => sum + c.analytics.deliveryRate, 0) / sentCampaigns.length;
    const avgOpenRate = sentCampaigns.reduce((sum, c) => sum + c.analytics.openRate, 0) / sentCampaigns.length;
    const avgClickRate = sentCampaigns.reduce((sum, c) => sum + c.analytics.clickRate, 0) / sentCampaigns.length;

    return {
      totalCampaigns: sentCampaigns.length,
      totalRecipients,
      avgDeliveryRate,
      avgOpenRate,
      avgClickRate
    };
  }
}; 