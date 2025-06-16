import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert'];
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update'];

export interface CreateTemplateData {
  name: string;
  description?: string;
  category: 'promotional' | 'transactional' | 'newsletter' | 'reminder' | 'welcome';
  subject_template: string;
  body_template: string;
  variables: TemplateVariable[];
  is_public?: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'image' | 'url' | 'boolean';
  description?: string;
  default_value?: any;
  required?: boolean;
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    min_value?: number;
    max_value?: number;
  };
}

export interface TemplatePreviewData {
  template_id: string;
  variables: Record<string, any>;
  sample_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  sample_event?: {
    title: string;
    start_date: string;
    venue_name: string;
    venue_address: string;
  };
}

export interface RenderedTemplate {
  subject: string;
  body_html: string;
  body_text: string;
  variables_used: string[];
  missing_variables: string[];
}

export class EmailTemplateService {
  // Create a new email template
  static async createTemplate(
    organizerId: string,
    templateData: CreateTemplateData
  ): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          organizer_id: organizerId,
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          subject_template: templateData.subject_template,
          body_template: templateData.body_template,
          variables: templateData.variables,
          is_public: templateData.is_public ?? false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  }

  // Get templates for an organizer
  static async getOrganizerTemplates(organizerId: string): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .or(`organizer_id.eq.${organizerId},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // Get template by ID
  static async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  // Update template
  static async updateTemplate(
    templateId: string,
    updates: EmailTemplateUpdate
  ): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      return null;
    }
  }

  // Delete template
  static async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  // Duplicate template
  static async duplicateTemplate(
    templateId: string,
    organizerId: string,
    newName?: string
  ): Promise<EmailTemplate | null> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) return null;

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          organizer_id: organizerId,
          name: newName || `${template.name} (Copy)`,
          description: template.description,
          category: template.category,
          subject_template: template.subject_template,
          body_template: template.body_template,
          variables: template.variables,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      return null;
    }
  }

  // Render template with variables
  static renderTemplate(
    template: EmailTemplate,
    variables: Record<string, any>
  ): RenderedTemplate {
    try {
      const templateVars = (template.variables as TemplateVariable[]) || [];
      
      // Track used and missing variables
      const variablesUsed: string[] = [];
      const missingVariables: string[] = [];

      // Helper function to replace variables in text
      const replaceVariables = (text: string): string => {
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          variablesUsed.push(varName);
          
          if (variables.hasOwnProperty(varName)) {
            const value = variables[varName];
            
            // Format based on variable type
            const varDef = templateVars.find(v => v.name === varName);
            if (varDef) {
              switch (varDef.type) {
                case 'date':
                  return value ? new Date(value).toLocaleDateString() : '';
                case 'number':
                  return typeof value === 'number' ? value.toLocaleString() : String(value || 0);
                case 'boolean':
                  return value ? 'Yes' : 'No';
                default:
                  return String(value || '');
              }
            }
            
            return String(value || '');
          } else {
            missingVariables.push(varName);
            return match; // Keep placeholder if variable not provided
          }
        });
      };

      // Render subject and body
      const subject = replaceVariables(template.subject_template);
      const bodyHtml = replaceVariables(template.body_template);
      
      // Generate plain text version
      const bodyText = this.htmlToPlainText(bodyHtml);

      return {
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        variables_used: [...new Set(variablesUsed)],
        missing_variables: [...new Set(missingVariables)]
      };
    } catch (error) {
      console.error('Error rendering template:', error);
      return {
        subject: template.subject_template,
        body_html: template.body_template,
        body_text: this.htmlToPlainText(template.body_template),
        variables_used: [],
        missing_variables: []
      };
    }
  }

  // Preview template with sample data
  static async previewTemplate(previewData: TemplatePreviewData): Promise<RenderedTemplate | null> {
    try {
      const template = await this.getTemplate(previewData.template_id);
      if (!template) return null;

      // Merge sample data with provided variables
      const sampleVariables = {
        // User variables
        first_name: previewData.sample_user?.first_name || 'John',
        last_name: previewData.sample_user?.last_name || 'Doe',
        email: previewData.sample_user?.email || 'john.doe@example.com',
        full_name: `${previewData.sample_user?.first_name || 'John'} ${previewData.sample_user?.last_name || 'Doe'}`,
        
        // Event variables
        event_title: previewData.sample_event?.title || 'Sample Stepping Event',
        event_date: previewData.sample_event?.start_date || new Date().toISOString(),
        event_time: previewData.sample_event?.start_date 
          ? new Date(previewData.sample_event.start_date).toLocaleTimeString() 
          : '8:00 PM',
        venue_name: previewData.sample_event?.venue_name || 'Chicago Stepping Center',
        venue_address: previewData.sample_event?.venue_address || '123 Dance St, Chicago, IL',
        
        // Campaign variables
        campaign_name: 'Sample Campaign',
        unsubscribe_url: 'https://stepperslife.com/unsubscribe',
        company_name: 'SteppersLife Events',
        company_address: '123 Event St, Chicago, IL 60601',
        current_year: new Date().getFullYear(),
        
        // Override with provided variables
        ...previewData.variables
      };

      return this.renderTemplate(template, sampleVariables);
    } catch (error) {
      console.error('Error previewing template:', error);
      return null;
    }
  }

  // Validate template syntax
  static validateTemplate(subjectTemplate: string, bodyTemplate: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    variablesFound: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const variablesFound: string[] = [];

    // Check for unclosed template variables
    const templateVarRegex = /\{\{(\w+)\}\}/g;
    const unclosedRegex = /\{\{[^}]*$/;

    // Find all variables
    let match;
    while ((match = templateVarRegex.exec(subjectTemplate + ' ' + bodyTemplate)) !== null) {
      variablesFound.push(match[1]);
    }

    // Check for unclosed variables
    if (unclosedRegex.test(subjectTemplate)) {
      errors.push('Subject template contains unclosed variable syntax');
    }
    if (unclosedRegex.test(bodyTemplate)) {
      errors.push('Body template contains unclosed variable syntax');
    }

    // Check for empty templates
    if (!subjectTemplate.trim()) {
      errors.push('Subject template cannot be empty');
    }
    if (!bodyTemplate.trim()) {
      errors.push('Body template cannot be empty');
    }

    // Check for common variables
    const commonVars = ['first_name', 'last_name', 'email'];
    const hasPersonalizationVar = commonVars.some(varName => 
      variablesFound.includes(varName)
    );
    
    if (!hasPersonalizationVar) {
      warnings.push('Template does not include personalization variables (first_name, last_name, email)');
    }

    // Check for unsubscribe link in promotional templates
    if (!bodyTemplate.includes('unsubscribe_url') && !bodyTemplate.includes('unsubscribe')) {
      warnings.push('Template may need an unsubscribe link for compliance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      variablesFound: [...new Set(variablesFound)]
    };
  }

  // Get predefined template categories
  static getTemplateCategories(): Array<{
    value: string;
    label: string;
    description: string;
  }> {
    return [
      {
        value: 'promotional',
        label: 'Promotional',
        description: 'Marketing emails to promote events and drive ticket sales'
      },
      {
        value: 'newsletter',
        label: 'Newsletter',
        description: 'Regular updates and community news'
      },
      {
        value: 'reminder',
        label: 'Reminder',
        description: 'Event reminders and follow-up communications'
      },
      {
        value: 'welcome',
        label: 'Welcome',
        description: 'Welcome series for new users and subscribers'
      },
      {
        value: 'transactional',
        label: 'Transactional',
        description: 'Order confirmations, receipts, and account-related emails'
      }
    ];
  }

  // Get predefined template starters
  static getPredefinedTemplates(): Array<{
    name: string;
    category: string;
    description: string;
    subject_template: string;
    body_template: string;
    variables: TemplateVariable[];
  }> {
    return [
      {
        name: 'Event Promotion',
        category: 'promotional',
        description: 'Basic event promotion template',
        subject_template: 'Don\'t Miss Out: {{event_title}} is This {{event_day}}!',
        body_template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Hi {{first_name}}!</h1>
  
  <p>We're excited to invite you to <strong>{{event_title}}</strong>!</p>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #667eea;">Event Details</h2>
    <p><strong>Date:</strong> {{event_date}}</p>
    <p><strong>Time:</strong> {{event_time}}</p>
    <p><strong>Venue:</strong> {{venue_name}}</p>
    <p><strong>Address:</strong> {{venue_address}}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{event_url}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Get Your Tickets Now
    </a>
  </div>
  
  <p>Early bird pricing ends soon, so secure your spot today!</p>
  
  <p>See you on the dance floor!</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #666;">
    You're receiving this because you're part of the SteppersLife community.
    <a href="{{unsubscribe_url}}">Unsubscribe</a>
  </p>
</div>`,
        variables: [
          { name: 'first_name', type: 'text', description: 'Recipient\'s first name', required: true },
          { name: 'event_title', type: 'text', description: 'Event title', required: true },
          { name: 'event_day', type: 'text', description: 'Day of the week (e.g., Saturday)', required: true },
          { name: 'event_date', type: 'date', description: 'Event date', required: true },
          { name: 'event_time', type: 'text', description: 'Event time', required: true },
          { name: 'venue_name', type: 'text', description: 'Venue name', required: true },
          { name: 'venue_address', type: 'text', description: 'Venue address', required: true },
          { name: 'event_url', type: 'url', description: 'Link to event page', required: true },
          { name: 'unsubscribe_url', type: 'url', description: 'Unsubscribe link', required: true }
        ]
      },
      {
        name: 'Event Reminder',
        category: 'reminder',
        description: 'Remind attendees about upcoming events',
        subject_template: 'Reminder: {{event_title}} is Tomorrow!',
        body_template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Event Reminder</h1>
  
  <p>Hi {{first_name}},</p>
  
  <p>This is a friendly reminder that <strong>{{event_title}}</strong> is happening tomorrow!</p>
  
  <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #856404;">Event Details</h2>
    <p><strong>Date:</strong> {{event_date}}</p>
    <p><strong>Time:</strong> {{event_time}}</p>
    <p><strong>Venue:</strong> {{venue_name}}</p>
    <p><strong>Address:</strong> {{venue_address}}</p>
  </div>
  
  <h3>What to Bring:</h3>
  <ul>
    <li>Your ticket (digital or printed)</li>
    <li>Valid photo ID</li>
    <li>Comfortable dancing shoes</li>
    <li>Water bottle (staying hydrated is important!)</li>
  </ul>
  
  <p><strong>Parking:</strong> Street parking is available. Arrive early to find the best spots!</p>
  
  <p>We can't wait to see you there!</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #666;">
    <a href="{{unsubscribe_url}}">Unsubscribe</a> from event reminders
  </p>
</div>`,
        variables: [
          { name: 'first_name', type: 'text', description: 'Recipient\'s first name', required: true },
          { name: 'event_title', type: 'text', description: 'Event title', required: true },
          { name: 'event_date', type: 'date', description: 'Event date', required: true },
          { name: 'event_time', type: 'text', description: 'Event time', required: true },
          { name: 'venue_name', type: 'text', description: 'Venue name', required: true },
          { name: 'venue_address', type: 'text', description: 'Venue address', required: true },
          { name: 'unsubscribe_url', type: 'url', description: 'Unsubscribe link', required: true }
        ]
      },
      {
        name: 'Welcome New Subscriber',
        category: 'welcome',
        description: 'Welcome email for new community members',
        subject_template: 'Welcome to the SteppersLife Community, {{first_name}}!',
        body_template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Welcome to SteppersLife! 🎉</h1>
  </div>
  
  <div style="padding: 30px; background: white; border: 1px solid #e1e5e9; border-top: none;">
    <p>Hi {{first_name}},</p>
    
    <p>Welcome to the SteppersLife community! We're thrilled to have you join our family of Chicago Stepping enthusiasts.</p>
    
    <h2 style="color: #667eea;">What's Next?</h2>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">🎯 Complete Your Profile</h3>
      <p>Tell us about your dancing experience and preferences so we can recommend the perfect events for you.</p>
      <a href="{{profile_url}}" style="color: #667eea; text-decoration: none; font-weight: bold;">Complete Profile →</a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">📅 Browse Upcoming Events</h3>
      <p>Check out our calendar of classes, socials, and special events happening around Chicago.</p>
      <a href="{{events_url}}" style="color: #667eea; text-decoration: none; font-weight: bold;">View Events →</a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">💬 Join Our Community</h3>
      <p>Connect with other steppers, share your experiences, and stay up-to-date with the latest news.</p>
      <a href="{{community_url}}" style="color: #667eea; text-decoration: none; font-weight: bold;">Join Community →</a>
    </div>
    
    <p>If you have any questions, don't hesitate to reach out. We're here to help make your stepping journey amazing!</p>
    
    <p>Happy Stepping!<br>
    The SteppersLife Team</p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px;">
    <p>You're receiving this welcome email because you joined SteppersLife.</p>
    <p><a href="{{unsubscribe_url}}" style="color: #667eea;">Unsubscribe</a></p>
  </div>
</div>`,
        variables: [
          { name: 'first_name', type: 'text', description: 'Recipient\'s first name', required: true },
          { name: 'profile_url', type: 'url', description: 'Link to complete profile', required: true },
          { name: 'events_url', type: 'url', description: 'Link to events page', required: true },
          { name: 'community_url', type: 'url', description: 'Link to community page', required: true },
          { name: 'unsubscribe_url', type: 'url', description: 'Unsubscribe link', required: true }
        ]
      }
    ];
  }

  // Convert HTML to plain text
  private static htmlToPlainText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}