import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: 'transactional' | 'notification' | 'marketing';
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  templateId?: string;
  category: 'transactional' | 'notification' | 'marketing';
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface EmailConfig {
  provider: 'sendgrid' | 'smtp';
  sendgridApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  isTestMode: boolean;
}

export interface BulkEmailJob {
  id: string;
  name: string;
  templateId: string;
  recipients: Array<{ email: string; variables?: Record<string, any> }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  createdBy: string;
  createdAt: Date;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

class EmailService {
  private config: EmailConfig = {
    provider: 'sendgrid',
    sendgridApiKey: import.meta.env.VITE_SENDGRID_API_KEY || 'SG.test-key',
    fromEmail: 'noreply@stepperslife.com',
    fromName: 'SteppersLife',
    replyToEmail: 'support@stepperslife.com',
    isTestMode: true,
  };

  private templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to SteppersLife!',
      htmlContent: `
        <h1>Welcome {{firstName}}!</h1>
        <p>Thank you for joining SteppersLife. We're excited to have you as part of our community!</p>
        <p>Get started by exploring events in your area or creating your first event.</p>
        <a href="{{platformUrl}}/events" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Events</a>
      `,
      textContent: 'Welcome {{firstName}}! Thank you for joining SteppersLife...',
      category: 'transactional',
      variables: ['firstName', 'platformUrl'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Ticket Purchase Confirmation',
      subject: 'Your tickets for {{eventName}}',
      htmlContent: `
        <h1>Ticket Confirmation</h1>
        <p>Hi {{firstName}},</p>
        <p>Your tickets for <strong>{{eventName}}</strong> have been confirmed!</p>
        <div style="background: #F3F4F6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Event Details</h3>
          <p><strong>Event:</strong> {{eventName}}</p>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> {{eventVenue}}</p>
          <p><strong>Tickets:</strong> {{ticketCount}} x {{ticketType}}</p>
          <p><strong>Total:</strong> \${{totalAmount}}</p>
        </div>
        <p>Your tickets are attached to this email. Please bring them to the event.</p>
        <a href="{{ticketUrl}}" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Tickets</a>
      `,
      category: 'transactional',
      variables: ['firstName', 'eventName', 'eventDate', 'eventTime', 'eventVenue', 'ticketCount', 'ticketType', 'totalAmount', 'ticketUrl'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '3',
      name: 'Event Reminder',
      subject: 'Reminder: {{eventName}} is {{timeUntil}}',
      htmlContent: `
        <h1>Event Reminder</h1>
        <p>Hi {{firstName}},</p>
        <p>This is a friendly reminder that <strong>{{eventName}}</strong> is coming up {{timeUntil}}!</p>
        <div style="background: #F3F4F6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Event Details</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> {{eventVenue}}</p>
          <p><strong>Address:</strong> {{eventAddress}}</p>
        </div>
        <p>We're looking forward to seeing you there!</p>
        <a href="{{eventUrl}}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Event Details</a>
      `,
      category: 'notification',
      variables: ['firstName', 'eventName', 'timeUntil', 'eventDate', 'eventTime', 'eventVenue', 'eventAddress', 'eventUrl'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '4',
      name: 'Event Update Notification',
      subject: 'Important update about {{eventName}}',
      htmlContent: `
        <h1>Event Update</h1>
        <p>Hi {{firstName}},</p>
        <p>We have an important update about <strong>{{eventName}}</strong>:</p>
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0;">
          <h3>{{updateType}}</h3>
          <p>{{updateMessage}}</p>
        </div>
        {{#if newEventDetails}}
        <div style="background: #F3F4F6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Updated Event Details</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> {{eventVenue}}</p>
        </div>
        {{/if}}
        <p>If you have any questions, please contact us at support@stepperslife.com</p>
      `,
      category: 'notification',
      variables: ['firstName', 'eventName', 'updateType', 'updateMessage', 'eventDate', 'eventTime', 'eventVenue'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '5',
      name: 'Weekly Event Digest',
      subject: 'Discover events happening this week',
      htmlContent: `
        <h1>This Week's Featured Events</h1>
        <p>Hi {{firstName}},</p>
        <p>Check out these amazing events happening in your area this week:</p>
        {{#each events}}
        <div style="border: 1px solid #E5E7EB; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>{{name}}</h3>
          <p><strong>Date:</strong> {{date}} at {{time}}</p>
          <p><strong>Location:</strong> {{venue}}</p>
          <p>{{description}}</p>
          <a href="{{url}}" style="background: #3B82F6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Learn More</a>
        </div>
        {{/each}}
        <p>Don't want to receive these emails? <a href="{{unsubscribeUrl}}">Unsubscribe here</a></p>
      `,
      category: 'marketing',
      variables: ['firstName', 'events', 'unsubscribeUrl'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  private emailLogs: EmailLog[] = [
    {
      id: '1',
      to: 'user@example.com',
      from: 'noreply@stepperslife.com',
      subject: 'Welcome to SteppersLife!',
      templateId: '1',
      category: 'transactional',
      status: 'delivered',
      sentAt: new Date('2024-01-20T10:00:00Z'),
      deliveredAt: new Date('2024-01-20T10:01:00Z'),
      openedAt: new Date('2024-01-20T11:30:00Z'),
    },
    {
      id: '2',
      to: 'organizer@example.com',
      from: 'noreply@stepperslife.com',
      subject: 'Your tickets for Dance Workshop',
      templateId: '2',
      category: 'transactional',
      status: 'opened',
      sentAt: new Date('2024-01-20T14:00:00Z'),
      deliveredAt: new Date('2024-01-20T14:01:00Z'),
      openedAt: new Date('2024-01-20T14:15:00Z'),
    },
  ];

  private bulkJobs: BulkEmailJob[] = [
    {
      id: '1',
      name: 'Weekly Newsletter - Jan 2024',
      templateId: '5',
      recipients: [
        { email: 'user1@example.com', variables: { firstName: 'John' } },
        { email: 'user2@example.com', variables: { firstName: 'Jane' } },
      ],
      status: 'completed',
      totalCount: 2,
      sentCount: 2,
      failedCount: 0,
      createdBy: 'admin1',
      createdAt: new Date('2024-01-20'),
      startedAt: new Date('2024-01-20T09:00:00Z'),
      completedAt: new Date('2024-01-20T09:05:00Z'),
    },
  ];

  // Configuration Management
  async getEmailConfig(): Promise<EmailConfig> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...this.config }), 300);
    });
  }

  async updateEmailConfig(config: Partial<EmailConfig>): Promise<EmailConfig> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.config = { ...this.config, ...config };
        resolve({ ...this.config });
      }, 500);
    });
  }

  async testEmailConfig(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.config.provider === 'sendgrid' && !this.config.sendgridApiKey) {
          resolve({ success: false, message: 'SendGrid API key is required' });
        } else if (this.config.provider === 'smtp' && !this.config.smtpHost) {
          resolve({ success: false, message: 'SMTP host is required' });
        } else {
          resolve({ success: true, message: 'Email configuration is valid' });
        }
      }, 1000);
    });
  }

  // Template Management
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.templates]), 500);
    });
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const template = this.templates.find(t => t.id === id);
        resolve(template || null);
      }, 300);
    });
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate: EmailTemplate = {
          ...template,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.templates.push(newTemplate);
        resolve(newTemplate);
      }, 500);
    });
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) {
          resolve(null);
          return;
        }
        
        this.templates[index] = {
          ...this.templates[index],
          ...updates,
          updatedAt: new Date(),
        };
        resolve(this.templates[index]);
      }, 500);
    });
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) {
          resolve(false);
          return;
        }
        
        this.templates.splice(index, 1);
        resolve(true);
      }, 500);
    });
  }

  // Email Sending using Supabase Edge Function
  async sendEmail(params: {
    to: string | string[];
    templateId?: string;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    variables?: Record<string, any>;
    category?: 'transactional' | 'notification' | 'marketing';
    attachments?: Array<{ filename: string; content: string; type: string }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
      const recipients = Array.isArray(params.to) ? params.to : [params.to];
      
      // Determine email type based on templateId or category
      let emailType = 'welcome'; // default
      if (params.templateId) {
        const typeMap: Record<string, string> = {
          '1': 'welcome',
          '2': 'ticket_confirmation', 
          '3': 'event_reminder',
          '4': 'event_update',
          '5': 'newsletter'
        };
        emailType = typeMap[params.templateId] || 'welcome';
      } else if (params.category === 'transactional') {
        emailType = 'ticket_confirmation';
      } else if (params.category === 'notification') {
        emailType = 'event_reminder';
      }

      const results = [];
      
      // Send email to each recipient
      for (const email of recipients) {
        const response = await fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            type: emailType,
            to: email,
            data: {
              ...params.variables,
              subject: params.subject,
              htmlContent: params.htmlContent
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Email sending failed');
        }

        const result = await response.json();
        results.push(result);

        // Log email in database
        await supabase
          .from('email_logs')
          .insert({
            to_email: email,
            from_email: 'noreply@stepperslife.com',
            subject: params.subject || 'No Subject',
            template_id: params.templateId,
            category: params.category || 'transactional',
            status: 'sent',
            provider_message_id: result.message_id,
            metadata: params.variables
          });
      }

      return {
        success: true,
        messageId: results[0]?.message_id,
        error: undefined
      };

    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        messageId: undefined,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulkEmail(params: {
    name: string;
    templateId: string;
    recipients: Array<{ email: string; variables?: Record<string, any> }>;
    scheduledAt?: Date;
  }): Promise<BulkEmailJob> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const job: BulkEmailJob = {
          id: Date.now().toString(),
          name: params.name,
          templateId: params.templateId,
          recipients: params.recipients,
          status: params.scheduledAt ? 'pending' : 'processing',
          scheduledAt: params.scheduledAt,
          startedAt: params.scheduledAt ? undefined : new Date(),
          totalCount: params.recipients.length,
          sentCount: 0,
          failedCount: 0,
          createdBy: 'current-user',
          createdAt: new Date(),
        };
        
        this.bulkJobs.push(job);
        resolve(job);
      }, 500);
    });
  }

  // Email Logs and Analytics
  async getEmailLogs(filters?: {
    category?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }): Promise<EmailLog[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let logs = [...this.emailLogs];
        
        if (filters) {
          if (filters.category) {
            logs = logs.filter(log => log.category === filters.category);
          }
          if (filters.status) {
            logs = logs.filter(log => log.status === filters.status);
          }
          if (filters.dateFrom) {
            logs = logs.filter(log => log.sentAt >= filters.dateFrom!);
          }
          if (filters.dateTo) {
            logs = logs.filter(log => log.sentAt <= filters.dateTo!);
          }
          if (filters.limit) {
            logs = logs.slice(0, filters.limit);
          }
        }
        
        resolve(logs.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()));
      }, 500);
    });
  }

  async getEmailStats(filters?: {
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<EmailStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let logs = [...this.emailLogs];
        
        if (filters) {
          if (filters.category) {
            logs = logs.filter(log => log.category === filters.category);
          }
          if (filters.dateFrom) {
            logs = logs.filter(log => log.sentAt >= filters.dateFrom!);
          }
          if (filters.dateTo) {
            logs = logs.filter(log => log.sentAt <= filters.dateTo!);
          }
        }

        const totalSent = logs.length;
        const totalDelivered = logs.filter(log => log.status === 'delivered' || log.status === 'opened' || log.status === 'clicked').length;
        const totalOpened = logs.filter(log => log.status === 'opened' || log.status === 'clicked').length;
        const totalClicked = logs.filter(log => log.status === 'clicked').length;
        const totalBounced = logs.filter(log => log.status === 'bounced').length;
        const totalFailed = logs.filter(log => log.status === 'failed').length;

        const stats: EmailStats = {
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          totalBounced,
          totalFailed,
          deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
          openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
          clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
          bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
        };

        resolve(stats);
      }, 500);
    });
  }

  async getBulkEmailJobs(): Promise<BulkEmailJob[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.bulkJobs]), 500);
    });
  }

  async getBulkEmailJob(id: string): Promise<BulkEmailJob | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const job = this.bulkJobs.find(j => j.id === id);
        resolve(job || null);
      }, 300);
    });
  }

  // Helper methods for common email types
  async sendWelcomeEmail(to: string, data: { name?: string; firstName?: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      templateId: '1',
      category: 'transactional',
      variables: data
    });
  }

  async sendTicketConfirmation(to: string, data: {
    firstName?: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    ticketCount: number;
    ticketType: string;
    totalAmount: number;
    ticketUrl: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      templateId: '2',
      category: 'transactional',
      variables: data
    });
  }

  async sendEventReminder(to: string, data: {
    firstName?: string;
    eventName: string;
    timeUntil: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    eventAddress: string;
    eventUrl: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      templateId: '3',
      category: 'notification',
      variables: data
    });
  }

  async sendPaymentSuccess(to: string, data: {
    firstName?: string;
    eventName: string;
    amount: number;
    paymentId: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to,
      subject: `Payment Confirmation - ${data.eventName}`,
      category: 'transactional',
      variables: data
    });
  }

  // Webhook handling for email events (for SendGrid)
  async handleWebhook(events: Array<{
    event: string;
    email: string;
    timestamp: number;
    'smtp-id'?: string;
    sg_message_id?: string;
  }>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        events.forEach(event => {
          const log = this.emailLogs.find(l => l.to === event.email);
          if (log) {
            switch (event.event) {
              case 'delivered':
                log.status = 'delivered';
                log.deliveredAt = new Date(event.timestamp * 1000);
                break;
              case 'open':
                log.status = 'opened';
                log.openedAt = new Date(event.timestamp * 1000);
                break;
              case 'click':
                log.status = 'clicked';
                log.clickedAt = new Date(event.timestamp * 1000);
                break;
              case 'bounce':
                log.status = 'bounced';
                break;
              case 'dropped':
              case 'deferred':
                log.status = 'failed';
                break;
            }
          }
        });
        resolve();
      }, 300);
    });
  }
}

export const emailService = new EmailService(); 