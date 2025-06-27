import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

export interface TeamMemberWithDetails extends TeamMember {
  user?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  sales_stats?: {
    total_sales: number;
    total_commission: number;
    events_sold: number;
    active_links: number;
  };
}

export interface SalesAgentStats {
  total_sales: number;
  total_commission: number;
  commission_rate: number;
  events_promoted: number;
  active_links: number;
  clicks_generated: number;
  conversion_rate: number;
  earnings_this_month: number;
  top_performing_events: Array<{
    event_id: string;
    event_title: string;
    sales_count: number;
    commission_earned: number;
  }>;
}

export interface TeamPermissions {
  can_create_events: boolean;
  can_edit_events: boolean;
  can_view_analytics: boolean;
  can_manage_tickets: boolean;
  can_access_financials: boolean;
  can_manage_team: boolean;
  event_access_level: 'none' | 'own' | 'assigned' | 'all';
}

export class TeamManagementService {
  
  // Get all team members for an organizer
  static async getTeamMembers(organizerId: string): Promise<TeamMemberWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          users!inner (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching team members:', error);
        throw error;
      }

      // Enhance with sales stats
      const enhancedMembers = await Promise.all(
        (data || []).map(async (member) => {
          if (member.role === 'sales_agent') {
            const stats = await this.getSalesAgentStats(member.id);
            return {
              ...member,
              sales_stats: {
                total_sales: stats.total_sales,
                total_commission: stats.total_commission,
                events_sold: stats.events_promoted,
                active_links: stats.active_links
              }
            };
          }
          return member;
        })
      );

      return enhancedMembers as TeamMemberWithDetails[];

    } catch (error) {
      console.error('❌ Error in getTeamMembers:', error);
      throw error;
    }
  }

  // Add a new team member
  static async addTeamMember(organizerId: string, memberData: {
    email: string;
    role: 'organizer' | 'sales_agent' | 'assistant' | 'moderator';
    permissions: TeamPermissions;
    commission_rate?: number;
    notes?: string;
  }): Promise<TeamMember> {
    try {
      console.log('👥 Adding team member:', memberData);

      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('email', memberData.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      let userId = existingUser?.id;

      // If user doesn't exist, create an invitation
      if (!existingUser) {
        const { data: invitation, error: inviteError } = await supabase
          .from('team_invitations')
          .insert({
            organizer_id: organizerId,
            email: memberData.email,
            role: memberData.role,
            permissions: memberData.permissions as any,
            commission_rate: memberData.commission_rate,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (inviteError) {
          console.error('❌ Error creating invitation:', inviteError);
          throw inviteError;
        }

        // Send invitation email
        try {
          const { NotificationService } = await import('./notificationService');
          await NotificationService.sendGeneralNotification({
            to: memberData.email,
            subject: 'Team Invitation - SteppersLife',
            message: `You've been invited to join a team on SteppersLife as a ${memberData.role.replace('_', ' ')}. Click the link to accept your invitation.`,
            type: 'email',
            templateData: {
              role: memberData.role,
              organizerName: 'Team Organizer',
              invitationId: invitation.id
            }
          });
        } catch (emailError) {
          console.warn('⚠️ Failed to send invitation email:', emailError);
        }

        // Return invitation as a "pending" team member
        return {
          id: invitation.id,
          organizer_id: organizerId,
          user_id: null,
          role: memberData.role,
          permissions: memberData.permissions as any,
          commission_rate: memberData.commission_rate,
          status: 'pending',
          notes: memberData.notes,
          created_at: invitation.created_at,
          updated_at: invitation.created_at
        } as TeamMember;
      }

      // Create team member record
      const teamMemberData: TeamMemberInsert = {
        organizer_id: organizerId,
        user_id: userId,
        role: memberData.role,
        permissions: memberData.permissions as any,
        commission_rate: memberData.commission_rate,
        status: 'active',
        notes: memberData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: teamMember, error } = await supabase
        .from('team_members')
        .insert(teamMemberData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating team member:', error);
        throw error;
      }

      // If sales agent, create initial trackable links
      if (memberData.role === 'sales_agent') {
        await this.createInitialSalesLinks(teamMember.id, organizerId);
      }

      console.log('✅ Team member added successfully:', teamMember);
      return teamMember;

    } catch (error) {
      console.error('❌ Error in addTeamMember:', error);
      throw error;
    }
  }

  // Update team member
  static async updateTeamMember(memberId: string, updates: Partial<TeamMemberUpdate>): Promise<TeamMember> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating team member:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error in updateTeamMember:', error);
      throw error;
    }
  }

  // Remove team member
  static async removeTeamMember(memberId: string): Promise<void> {
    try {
      // First, deactivate any active sales links
      const { error: linksError } = await supabase
        .from('trackable_links')
        .update({ is_active: false })
        .eq('team_member_id', memberId);

      if (linksError) {
        console.warn('⚠️ Error deactivating sales links:', linksError);
      }

      // Then remove the team member
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('❌ Error removing team member:', error);
        throw error;
      }

      console.log('✅ Team member removed successfully');
    } catch (error) {
      console.error('❌ Error in removeTeamMember:', error);
      throw error;
    }
  }

  // Get sales agent statistics
  static async getSalesAgentStats(agentId: string): Promise<SalesAgentStats> {
    try {
      // Get sales data through trackable links
      const { data: salesData, error: salesError } = await supabase
        .from('trackable_link_clicks')
        .select(`
          *,
          trackable_links!inner (
            team_member_id,
            event_id,
            events (
              title
            )
          ),
          orders (
            total_amount,
            status
          )
        `)
        .eq('trackable_links.team_member_id', agentId);

      if (salesError) {
        console.error('❌ Error fetching sales data:', salesError);
        throw salesError;
      }

      // Calculate statistics
      const completedSales = salesData?.filter(click => 
        click.orders && click.orders.status === 'completed'
      ) || [];

      const totalSales = completedSales.reduce((sum, sale) => 
        sum + (sale.orders?.total_amount || 0), 0
      );

      // Get commission rate for this agent
      const { data: agentData } = await supabase
        .from('team_members')
        .select('commission_rate')
        .eq('id', agentId)
        .single();

      const commissionRate = agentData?.commission_rate || 0.05; // Default 5%
      const totalCommission = totalSales * commissionRate;

      // Get active links count
      const { count: activeLinks } = await supabase
        .from('trackable_links')
        .select('*', { count: 'exact', head: true })
        .eq('team_member_id', agentId)
        .eq('is_active', true);

      // Calculate this month's earnings
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthSales = completedSales.filter(sale =>
        new Date(sale.created_at) >= thisMonth
      );

      const earningsThisMonth = thisMonthSales.reduce((sum, sale) =>
        sum + ((sale.orders?.total_amount || 0) * commissionRate), 0
      );

      // Group by events for top performing
      const eventStats = salesData?.reduce((acc: Record<string, any>, click) => {
        const eventId = click.trackable_links?.event_id;
        const eventTitle = click.trackable_links?.events?.title;
        
        if (!eventId) return acc;

        if (!acc[eventId]) {
          acc[eventId] = {
            event_id: eventId,
            event_title: eventTitle || 'Unknown Event',
            sales_count: 0,
            commission_earned: 0
          };
        }

        if (click.orders && click.orders.status === 'completed') {
          acc[eventId].sales_count += 1;
          acc[eventId].commission_earned += (click.orders.total_amount || 0) * commissionRate;
        }

        return acc;
      }, {}) || {};

      const topPerformingEvents = Object.values(eventStats)
        .sort((a: any, b: any) => b.commission_earned - a.commission_earned)
        .slice(0, 5);

      return {
        total_sales: totalSales,
        total_commission: totalCommission,
        commission_rate: commissionRate,
        events_promoted: Object.keys(eventStats).length,
        active_links: activeLinks || 0,
        clicks_generated: salesData?.length || 0,
        conversion_rate: salesData?.length > 0 ? (completedSales.length / salesData.length) * 100 : 0,
        earnings_this_month: earningsThisMonth,
        top_performing_events: topPerformingEvents as any[]
      };

    } catch (error) {
      console.error('❌ Error getting sales agent stats:', error);
      return {
        total_sales: 0,
        total_commission: 0,
        commission_rate: 0,
        events_promoted: 0,
        active_links: 0,
        clicks_generated: 0,
        conversion_rate: 0,
        earnings_this_month: 0,
        top_performing_events: []
      };
    }
  }

  // Create initial sales links for new sales agents
  private static async createInitialSalesLinks(agentId: string, organizerId: string): Promise<void> {
    try {
      // Get recent events from this organizer
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('organizer_id', organizerId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error || !events || events.length === 0) {
        console.log('ℹ️ No events to create initial links for');
        return;
      }

      // Create trackable links for each event
      for (const event of events) {
        await supabase
          .from('trackable_links')
          .insert({
            team_member_id: agentId,
            event_id: event.id,
            link_type: 'event_promotion',
            is_active: true,
            created_at: new Date().toISOString()
          });
      }

      console.log(`✅ Created ${events.length} initial sales links for agent`);
    } catch (error) {
      console.warn('⚠️ Error creating initial sales links:', error);
    }
  }

  // Check permissions for team member
  static async checkPermissions(userId: string, organizerId: string, permission: keyof TeamPermissions): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('permissions, role')
        .eq('user_id', userId)
        .eq('organizer_id', organizerId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return false;
      }

      const permissions = data.permissions as TeamPermissions;
      return permissions[permission] === true;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return false;
    }
  }

  // Get team analytics
  static async getTeamAnalytics(organizerId: string): Promise<{
    total_members: number;
    active_sales_agents: number;
    total_team_sales: number;
    total_commission_paid: number;
    top_performers: Array<{
      member_id: string;
      name: string;
      role: string;
      sales: number;
      commission: number;
    }>;
  }> {
    try {
      // Get all team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          users (
            full_name
          )
        `)
        .eq('organizer_id', organizerId);

      if (teamError) {
        throw teamError;
      }

      const totalMembers = teamMembers?.length || 0;
      const activeSalesAgents = teamMembers?.filter(m => 
        m.role === 'sales_agent' && m.status === 'active'
      ).length || 0;

      // Calculate team performance
      let totalTeamSales = 0;
      let totalCommissionPaid = 0;
      const performers = [];

      for (const member of teamMembers || []) {
        if (member.role === 'sales_agent') {
          const stats = await this.getSalesAgentStats(member.id);
          totalTeamSales += stats.total_sales;
          totalCommissionPaid += stats.total_commission;
          
          performers.push({
            member_id: member.id,
            name: (member.users as any)?.full_name || 'Unknown',
            role: member.role,
            sales: stats.total_sales,
            commission: stats.total_commission
          });
        }
      }

      const topPerformers = performers
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      return {
        total_members: totalMembers,
        active_sales_agents: activeSalesAgents,
        total_team_sales: totalTeamSales,
        total_commission_paid: totalCommissionPaid,
        top_performers: topPerformers
      };

    } catch (error) {
      console.error('❌ Error getting team analytics:', error);
      return {
        total_members: 0,
        active_sales_agents: 0,
        total_team_sales: 0,
        total_commission_paid: 0,
        top_performers: []
      };
    }
  }
}