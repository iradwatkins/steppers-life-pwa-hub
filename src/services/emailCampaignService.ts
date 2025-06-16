import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'];
export type EmailCampaignInsert = Database['public']['Tables']['email_campaigns']['Insert'];
export type EmailCampaignUpdate = Database['public']['Tables']['email_campaigns']['Update'];

export interface CampaignWithStats extends EmailCampaign {
  stats: {
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_unsubscribed: number;
    open_rate: number;
    click_rate: number;
    unsubscribe_rate: number;
  };
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  template_id: string;
  segment_id?: string;
  event_id?: string;
  scheduled_at?: string;
  template_variables?: Record<string, any>;
  sender_name?: string;
  sender_email?: string;
}

export interface CampaignAnalytics {
  campaign_id: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
  bounce_rate: number;
  roi: number;
  revenue_generated: number;
  cost_per_acquisition: number;
}

export class EmailCampaignService {
  // Create a new email campaign
  static async createCampaign(
    organizerId: string, 
    campaignData: CreateCampaignData
  ): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          organizer_id: organizerId,
          name: campaignData.name,
          subject: campaignData.subject,
          template_id: campaignData.template_id,
          segment_id: campaignData.segment_id,
          event_id: campaignData.event_id,
          scheduled_at: campaignData.scheduled_at,
          template_variables: campaignData.template_variables || {},
          sender_name: campaignData.sender_name || 'SteppersLife Events',
          sender_email: campaignData.sender_email || 'noreply@stepperslife.com',
          status: campaignData.scheduled_at ? 'scheduled' : 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }

  // Get campaigns for an organizer
  static async getOrganizerCampaigns(organizerId: string): Promise<EmailCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          email_templates(name, subject_template),
          email_segments(name, description),
          events(title, start_date)
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  // Get campaign by ID with detailed stats
  static async getCampaignWithStats(campaignId: string): Promise<CampaignWithStats | null> {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          email_templates(name, subject_template, body_template),
          email_segments(name, description, criteria),
          events(title, start_date, end_date)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get campaign statistics
      const { data: stats, error: statsError } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        // PGRST116 is "not found" - acceptable for new campaigns
        throw statsError;
      }

      const defaultStats = {
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
        total_unsubscribed: 0,
        open_rate: 0,
        click_rate: 0,
        unsubscribe_rate: 0
      };

      return {
        ...campaign,
        stats: stats ? {
          total_sent: stats.sent_count,
          total_opened: stats.opened_count,
          total_clicked: stats.clicked_count,
          total_unsubscribed: stats.unsubscribed_count,
          open_rate: stats.open_rate,
          click_rate: stats.click_rate,
          unsubscribe_rate: stats.unsubscribe_rate
        } : defaultStats
      };
    } catch (error) {
      console.error('Error fetching campaign with stats:', error);
      return null;
    }
  }

  // Update campaign
  static async updateCampaign(
    campaignId: string, 
    updates: EmailCampaignUpdate
  ): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    }
  }

  // Delete campaign
  static async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  // Send campaign immediately
  static async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      // Update status to sending
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sending',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      // In production, this would trigger the email sending process
      // For now, we'll simulate the sending process
      console.log(`📧 CAMPAIGN SENDING: ${campaignId}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status to sent
      const { error: sentError } = await supabase
        .from('email_campaigns')
        .update({ status: 'sent' })
        .eq('id', campaignId);

      if (sentError) throw sentError;

      console.log(`✅ CAMPAIGN SENT: ${campaignId}`);
      return true;
    } catch (error) {
      console.error('Error sending campaign:', error);
      
      // Update status to failed
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaignId);
      
      return false;
    }
  }

  // Schedule campaign for future delivery
  static async scheduleCampaign(
    campaignId: string, 
    scheduledAt: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          scheduled_at: scheduledAt,
          status: 'scheduled'
        })
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      return false;
    }
  }

  // Get campaign analytics
  static async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      return null;
    }
  }

  // Track email open
  static async trackEmailOpen(campaignId: string, recipientId: string): Promise<void> {
    try {
      await supabase
        .from('email_campaign_events')
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: 'open',
          created_at: new Date().toISOString()
        });

      // Update campaign analytics
      await this.updateCampaignAnalytics(campaignId);
    } catch (error) {
      console.error('Error tracking email open:', error);
    }
  }

  // Track email click
  static async trackEmailClick(
    campaignId: string, 
    recipientId: string, 
    clickedUrl: string
  ): Promise<void> {
    try {
      await supabase
        .from('email_campaign_events')
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: 'click',
          event_data: { clicked_url: clickedUrl },
          created_at: new Date().toISOString()
        });

      // Update campaign analytics
      await this.updateCampaignAnalytics(campaignId);
    } catch (error) {
      console.error('Error tracking email click:', error);
    }
  }

  // Track unsubscribe
  static async trackUnsubscribe(campaignId: string, recipientId: string): Promise<void> {
    try {
      await supabase
        .from('email_campaign_events')
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          event_type: 'unsubscribe',
          created_at: new Date().toISOString()
        });

      // Update user preferences to opt out of marketing emails
      await supabase
        .from('user_profiles')
        .update({ marketing_emails_enabled: false })
        .eq('user_id', recipientId);

      // Update campaign analytics
      await this.updateCampaignAnalytics(campaignId);
    } catch (error) {
      console.error('Error tracking unsubscribe:', error);
    }
  }

  // Update campaign analytics (internal method)
  private static async updateCampaignAnalytics(campaignId: string): Promise<void> {
    try {
      // Get event counts
      const { data: events, error: eventsError } = await supabase
        .from('email_campaign_events')
        .select('event_type, recipient_id')
        .eq('campaign_id', campaignId);

      if (eventsError) throw eventsError;

      const eventCounts = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get unique recipients count
      const uniqueRecipients = new Set(events.map(e => e.recipient_id)).size;

      // Calculate rates
      const totalSent = uniqueRecipients || 1; // Avoid division by zero
      const openRate = (eventCounts.open || 0) / totalSent * 100;
      const clickRate = (eventCounts.click || 0) / totalSent * 100;
      const unsubscribeRate = (eventCounts.unsubscribe || 0) / totalSent * 100;

      // Upsert analytics record
      await supabase
        .from('email_campaign_analytics')
        .upsert({
          campaign_id: campaignId,
          total_recipients: totalSent,
          sent_count: totalSent,
          delivered_count: totalSent, // Simplified - in production track bounces
          opened_count: eventCounts.open || 0,
          clicked_count: eventCounts.click || 0,
          unsubscribed_count: eventCounts.unsubscribe || 0,
          bounced_count: 0, // Simplified
          open_rate: openRate,
          click_rate: clickRate,
          unsubscribe_rate: unsubscribeRate,
          bounce_rate: 0, // Simplified
          roi: 0, // Would calculate based on ticket sales
          revenue_generated: 0, // Would calculate based on attributed sales
          cost_per_acquisition: 0, // Would calculate based on campaign costs
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating campaign analytics:', error);
    }
  }

  // Get campaign performance summary for dashboard
  static async getCampaignPerformanceSummary(organizerId: string): Promise<{
    total_campaigns: number;
    total_sent: number;
    avg_open_rate: number;
    avg_click_rate: number;
    total_revenue: number;
  }> {
    try {
      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select(`
          id,
          email_campaign_analytics(*)
        `)
        .eq('organizer_id', organizerId);

      if (error) throw error;

      const summary = campaigns.reduce((acc, campaign) => {
        const analytics = (campaign as any).email_campaign_analytics?.[0];
        if (analytics) {
          acc.total_sent += analytics.sent_count || 0;
          acc.total_open_rate += analytics.open_rate || 0;
          acc.total_click_rate += analytics.click_rate || 0;
          acc.total_revenue += analytics.revenue_generated || 0;
          acc.campaigns_with_analytics++;
        }
        return acc;
      }, {
        total_sent: 0,
        total_open_rate: 0,
        total_click_rate: 0,
        total_revenue: 0,
        campaigns_with_analytics: 0
      });

      return {
        total_campaigns: campaigns.length,
        total_sent: summary.total_sent,
        avg_open_rate: summary.campaigns_with_analytics > 0 
          ? summary.total_open_rate / summary.campaigns_with_analytics 
          : 0,
        avg_click_rate: summary.campaigns_with_analytics > 0 
          ? summary.total_click_rate / summary.campaigns_with_analytics 
          : 0,
        total_revenue: summary.total_revenue
      };
    } catch (error) {
      console.error('Error fetching campaign performance summary:', error);
      return {
        total_campaigns: 0,
        total_sent: 0,
        avg_open_rate: 0,
        avg_click_rate: 0,
        total_revenue: 0
      };
    }
  }
}