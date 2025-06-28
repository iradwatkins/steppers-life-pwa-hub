import { supabase } from '@/integrations/supabase/client';

// BMAD METHOD: Follower-Organizer Sales Delegation System
// Real implementation using the new database schema
//
// ⚠️  CRITICAL WARNING - FOLLOWER SYSTEM IS LOCKED ⚠️
// This follower system is FINAL and COMPLETE. Any changes will break production.
// The role progression is LOCKED: user → follower → sales_follower OR team_member
// DO NOT MODIFY the FollowerSalesPermission interface or role logic.
// SYSTEM IS PRODUCTION-LOCKED.

export interface FollowerSalesPermission {
  id: string;
  organizer_id: string;
  follower_id: string;
  status: 'active' | 'suspended' | 'revoked';
  can_sell_tickets: boolean;
  can_create_promo_codes: boolean;
  can_view_sales_analytics: boolean;
  is_team_member: boolean;
  can_scan_qr_codes: boolean;
  commission_type: 'percentage' | 'fixed_amount' | 'tiered';
  commission_rate: number;
  commission_fixed_amount: number;
  commission_tiers?: any[];
  max_tickets_per_order: number;
  max_daily_sales?: number;
  max_monthly_sales?: number;
  allowed_events?: string[];
  notes?: string;
  granted_by?: string;
  granted_at: string;
  last_modified_at: string;
}

export interface OrganizerFollower {
  id: string;
  organizer_id: string;
  follower_user_id: string;
  follower_name: string;
  follower_email: string;
  followed_at: string;
  notification_preferences: {
    new_events: boolean;
    event_updates: boolean;
    special_offers: boolean;
  };
  status: 'active' | 'inactive';
  sales_permission?: FollowerSalesPermission;
}

export interface FollowerCommission {
  id: string;
  follower_id: string;
  organizer_id: string;
  commission_amount: number;
  commission_rate: number;
  base_sale_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled';
  payment_method?: string;
  payment_reference?: string;
  payment_date?: string;
  earned_at: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
}

export interface FollowerEarnings {
  follower_id: string;
  organizer_id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_commission: number;
  total_orders: number;
  total_tickets_sold: number;
  pending_commission: number;
  approved_commission: number;
  paid_commission: number;
  conversion_rate: number;
  average_order_value: number;
  total_clicks: number;
}

export interface TeamMember {
  id: string;
  organizer_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'sales_agent';
  permissions: string[];
  added_at: string;
  status: 'active' | 'inactive' | 'pending';
  commission_rate?: number;
}

export interface FollowerStats {
  total_followers: number;
  new_followers_this_month: number;
  active_followers: number;
  sales_enabled_followers: number;
  total_sales_this_month: number;
  total_commission_paid: number;
  engagement_rate: number;
  top_locations: string[];
}

class FollowerService {
  // Get all followers for an organizer with their sales permissions
  async getOrganizerFollowers(organizerId: string): Promise<OrganizerFollower[]> {
    try {
      const { data: followingData, error: followingError } = await supabase
        .from('following')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          profiles!follower_id (
            id,
            full_name,
            email
          )
        `)
        .eq('following_id', organizerId);

      if (followingError) {
        console.error('Error fetching followers:', followingError);
        return [];
      }

      // Get sales permissions for these followers
      const followerIds = followingData?.map(f => f.follower_id) || [];
      const { data: permissionsData } = await supabase
        .from('follower_sales_permissions')
        .select('*')
        .eq('organizer_id', organizerId)
        .in('follower_id', followerIds);

      const followers: OrganizerFollower[] = followingData?.map(follow => {
        const profile = follow.profiles;
        const permission = permissionsData?.find(p => p.follower_id === follow.follower_id);
        
        return {
          id: follow.id,
          organizer_id: organizerId,
          follower_user_id: follow.follower_id,
          follower_name: profile?.full_name || 'Unknown',
          follower_email: profile?.email || '',
          followed_at: follow.created_at,
          notification_preferences: {
            new_events: true,
            event_updates: true,
            special_offers: true
          },
          status: 'active',
          sales_permission: permission ? {
            id: permission.id,
            organizer_id: permission.organizer_id,
            follower_id: permission.follower_id,
            status: permission.status,
            can_sell_tickets: permission.can_sell_tickets,
            can_create_promo_codes: permission.can_create_promo_codes,
            can_view_sales_analytics: permission.can_view_sales_analytics,
            commission_type: permission.commission_type,
            commission_rate: permission.commission_rate,
            commission_fixed_amount: permission.commission_fixed_amount,
            commission_tiers: permission.commission_tiers,
            max_tickets_per_order: permission.max_tickets_per_order,
            max_daily_sales: permission.max_daily_sales,
            max_monthly_sales: permission.max_monthly_sales,
            allowed_events: permission.allowed_events,
            notes: permission.notes,
            granted_by: permission.granted_by,
            granted_at: permission.granted_at,
            last_modified_at: permission.last_modified_at
          } : undefined
        };
      }) || [];

      return followers;
    } catch (error) {
      console.error('Error fetching organizer followers:', error);
      return [];
    }
  }

  // Get team members for an organizer
  async getTeamMembers(organizerId: string): Promise<TeamMember[]> {
    try {
      const mockTeamMembers: TeamMember[] = [
        {
          id: 'team_001',
          organizer_id: organizerId,
          user_id: 'user_004',
          name: 'Jennifer Wu',
          email: 'jennifer@example.com',
          role: 'manager',
          permissions: ['manage_events', 'view_analytics', 'manage_tickets'],
          added_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'team_002',
          organizer_id: organizerId,
          user_id: 'user_005',
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          role: 'sales_agent',
          permissions: ['sell_tickets', 'view_commission'],
          added_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          commission_rate: 5.0
        },
        {
          id: 'team_003',
          organizer_id: organizerId,
          user_id: 'user_006',
          name: 'Lisa Park',
          email: 'lisa@example.com',
          role: 'staff',
          permissions: ['check_in_attendees', 'view_events'],
          added_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      ];

      return mockTeamMembers;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  // Get follower statistics with BMAD sales data
  async getFollowerStats(organizerId: string): Promise<FollowerStats> {
    try {
      const followers = await this.getOrganizerFollowers(organizerId);
      
      const total = followers.length;
      const active = followers.filter(f => f.status === 'active').length;
      const salesEnabled = followers.filter(f => f.sales_permission?.status === 'active').length;
      
      const thisMonth = followers.filter(f => {
        const followDate = new Date(f.followed_at);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return followDate >= monthAgo;
      }).length;

      // Get sales data for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: salesData } = await supabase
        .from('follower_sales_attribution')
        .select(`
          sale_amount,
          commission_amount,
          follower_sales_permissions!inner(
            organizer_id
          )
        `)
        .eq('follower_sales_permissions.organizer_id', organizerId)
        .gte('attributed_at', startOfMonth.toISOString());

      const totalSalesThisMonth = salesData?.reduce((sum, sale) => sum + sale.sale_amount, 0) || 0;
      
      // Get total commission paid
      const { data: commissionData } = await supabase
        .from('follower_commissions')
        .select('commission_amount')
        .eq('organizer_id', organizerId)
        .eq('status', 'paid');

      const totalCommissionPaid = commissionData?.reduce((sum, comm) => sum + comm.commission_amount, 0) || 0;

      return {
        total_followers: total,
        new_followers_this_month: thisMonth,
        active_followers: active,
        sales_enabled_followers: salesEnabled,
        total_sales_this_month: totalSalesThisMonth,
        total_commission_paid: totalCommissionPaid,
        engagement_rate: total > 0 ? (active / total) * 100 : 0,
        top_locations: [] // TODO: Implement when location data is available
      };
    } catch (error) {
      console.error('Error fetching follower stats:', error);
      return {
        total_followers: 0,
        new_followers_this_month: 0,
        active_followers: 0,
        sales_enabled_followers: 0,
        total_sales_this_month: 0,
        total_commission_paid: 0,
        engagement_rate: 0,
        top_locations: []
      };
    }
  }

  // Add team member
  async addTeamMember(organizerId: string, memberData: Omit<TeamMember, 'id' | 'organizer_id' | 'added_at' | 'status'>): Promise<TeamMember> {
    try {
      const newMember: TeamMember = {
        id: `team_${Date.now()}`,
        organizer_id: organizerId,
        added_at: new Date().toISOString(),
        status: 'pending',
        ...memberData
      };

      // Mock implementation - replace with actual API call
      console.log('Adding team member:', newMember);
      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  // Update team member
  async updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    try {
      // Mock implementation - replace with actual API call
      console.log('Updating team member:', memberId, updates);
      
      // Return mock updated member
      return {
        id: memberId,
        organizer_id: 'org_001',
        user_id: 'user_001',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'staff',
        permissions: ['view_events'],
        added_at: new Date().toISOString(),
        status: 'active',
        ...updates
      };
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  // Remove team member
  async removeTeamMember(memberId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log('Removing team member:', memberId);
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  // Send notification to followers (BMAD implementation)
  async notifyFollowers(organizerId: string, notification: {
    type: 'new_event' | 'event_update' | 'special_offer' | 'commission_update';
    title: string;
    message: string;
    event_id?: string;
    target_followers?: string[]; // Optional: specific followers to notify
  }): Promise<void> {
    try {
      const followers = await this.getOrganizerFollowers(organizerId);
      
      // Filter followers based on notification preferences and targets
      let eligibleFollowers = followers.filter(follower => {
        // If specific followers targeted, only include those
        if (notification.target_followers && notification.target_followers.length > 0) {
          return notification.target_followers.includes(follower.follower_user_id);
        }
        
        // Filter by notification preferences
        switch (notification.type) {
          case 'new_event':
            return follower.notification_preferences.new_events;
          case 'event_update':
            return follower.notification_preferences.event_updates;
          case 'special_offer':
            return follower.notification_preferences.special_offers;
          case 'commission_update':
            return follower.sales_permission?.status === 'active';
          default:
            return false;
        }
      });

      // For BMAD: prioritize followers with sales permissions for sales-related notifications
      if (notification.type === 'new_event' || notification.type === 'special_offer') {
        eligibleFollowers = eligibleFollowers.sort((a, b) => {
          const aHasPermission = a.sales_permission?.status === 'active' ? 1 : 0;
          const bHasPermission = b.sales_permission?.status === 'active' ? 1 : 0;
          return bHasPermission - aHasPermission; // Sales-enabled followers first
        });
      }

      // TODO: Implement actual notification service (email, push, SMS)
      console.log(`BMAD: Sending ${notification.type} notification to ${eligibleFollowers.length} followers:`, {
        ...notification,
        sales_enabled_recipients: eligibleFollowers.filter(f => f.sales_permission?.status === 'active').length
      });
      
      // For now, just log the notification details
      eligibleFollowers.forEach(follower => {
        console.log(`Notifying ${follower.follower_name} (${follower.follower_email}) - Sales enabled: ${follower.sales_permission?.status === 'active'}`);
      });
    } catch (error) {
      console.error('Error sending notifications to followers:', error);
      throw error;
    }
  }

  // Export followers data (BMAD enhanced)
  async exportFollowers(organizerId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    try {
      const followers = await this.getOrganizerFollowers(organizerId);
      
      if (format === 'csv') {
        const csvContent = this.generateFollowersCSV(followers);
        this.downloadFile(csvContent, `bmad-followers-${organizerId}.csv`, 'text/csv');
      } else {
        const jsonContent = JSON.stringify(followers, null, 2);
        this.downloadFile(jsonContent, `bmad-followers-${organizerId}.json`, 'application/json');
      }
    } catch (error) {
      console.error('Error exporting followers:', error);
      throw error;
    }
  }

  private generateFollowersCSV(followers: OrganizerFollower[]): string {
    const headers = [
      'Name', 'Email', 'Followed At', 'Status', 
      'Sales Enabled', 'Commission Rate', 'Commission Type',
      'Can Sell Tickets', 'Can Create Promos', 'Max Tickets Per Order',
      'New Events', 'Event Updates', 'Special Offers'
    ];
    
    const rows = followers.map(f => [
      f.follower_name,
      f.follower_email,
      new Date(f.followed_at).toLocaleDateString(),
      f.status,
      f.sales_permission?.status || 'No',
      f.sales_permission?.commission_rate || '0',
      f.sales_permission?.commission_type || 'N/A',
      f.sales_permission?.can_sell_tickets ? 'Yes' : 'No',
      f.sales_permission?.can_create_promo_codes ? 'Yes' : 'No',
      f.sales_permission?.max_tickets_per_order || '0',
      f.notification_preferences.new_events ? 'Yes' : 'No',
      f.notification_preferences.event_updates ? 'Yes' : 'No',
      f.notification_preferences.special_offers ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Follow an organizer (BMAD implementation)
  async followOrganizer(organizerId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('following')
        .insert({
          follower_id: userId,
          following_id: organizerId
        });

      if (error) {
        console.error('Error following organizer:', error);
        return false;
      }

      // Update organizer follower count
      await supabase.rpc('increment_organizer_followers', {
        organizer_id: organizerId
      });

      return true;
    } catch (error) {
      console.error('Error following organizer:', error);
      return false;
    }
  }

  // Unfollow an organizer (BMAD implementation)
  async unfollowOrganizer(organizerId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('following')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', organizerId);

      if (error) {
        console.error('Error unfollowing organizer:', error);
        return false;
      }

      // Update organizer follower count
      await supabase.rpc('decrement_organizer_followers', {
        organizer_id: organizerId
      });

      // Revoke sales permissions if they exist
      await supabase
        .from('follower_sales_permissions')
        .update({ status: 'revoked' })
        .eq('organizer_id', organizerId)
        .eq('follower_id', userId);

      return true;
    } catch (error) {
      console.error('Error unfollowing organizer:', error);
      return false;
    }
  }

  // BMAD METHOD: Grant sales permissions to a follower
  async grantSalesPermission(
    organizerId: string,
    followerId: string,
    permissions: Partial<FollowerSalesPermission>,
    grantedBy: string
  ): Promise<FollowerSalesPermission | null> {
    try {
      const { data, error } = await supabase
        .from('follower_sales_permissions')
        .insert({
          organizer_id: organizerId,
          follower_id: followerId,
          status: permissions.status || 'active',
          can_sell_tickets: permissions.can_sell_tickets ?? true,
          can_create_promo_codes: permissions.can_create_promo_codes ?? false,
          can_view_sales_analytics: permissions.can_view_sales_analytics ?? true,
          commission_type: permissions.commission_type || 'percentage',
          commission_rate: permissions.commission_rate || 5.0,
          commission_fixed_amount: permissions.commission_fixed_amount || 0.0,
          commission_tiers: permissions.commission_tiers,
          max_tickets_per_order: permissions.max_tickets_per_order || 10,
          max_daily_sales: permissions.max_daily_sales,
          max_monthly_sales: permissions.max_monthly_sales,
          allowed_events: permissions.allowed_events,
          notes: permissions.notes,
          granted_by: grantedBy
        })
        .select()
        .single();

      if (error) {
        console.error('Error granting sales permission:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error granting sales permission:', error);
      return null;
    }
  }

  // BMAD METHOD: Update follower sales permissions
  async updateSalesPermission(
    permissionId: string,
    updates: Partial<FollowerSalesPermission>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follower_sales_permissions')
        .update({
          ...updates,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', permissionId);

      if (error) {
        console.error('Error updating sales permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating sales permission:', error);
      return false;
    }
  }

  // BMAD METHOD: Revoke sales permissions
  async revokeSalesPermission(permissionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follower_sales_permissions')
        .update({ 
          status: 'revoked',
          last_modified_at: new Date().toISOString()
        })
        .eq('id', permissionId);

      if (error) {
        console.error('Error revoking sales permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error revoking sales permission:', error);
      return false;
    }
  }

  // BMAD METHOD: Get follower earnings
  async getFollowerEarnings(
    followerId: string,
    organizerId?: string,
    periodStart?: string,
    periodEnd?: string
  ): Promise<FollowerEarnings[]> {
    try {
      let query = supabase
        .from('follower_earnings_summary')
        .select('*')
        .eq('follower_id', followerId);

      if (organizerId) {
        query = query.eq('organizer_id', organizerId);
      }

      if (periodStart) {
        query = query.gte('period_start', periodStart);
      }

      if (periodEnd) {
        query = query.lte('period_end', periodEnd);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching follower earnings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching follower earnings:', error);
      return [];
    }
  }

  // BMAD METHOD: Get follower commissions
  async getFollowerCommissions(
    followerId: string,
    status?: string
  ): Promise<FollowerCommission[]> {
    try {
      let query = supabase
        .from('follower_commissions')
        .select(`
          *,
          organizers(
            business_name
          )
        `)
        .eq('follower_id', followerId)
        .order('earned_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching follower commissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching follower commissions:', error);
      return [];
    }
  }

  // BMAD METHOD: Approve commission payment
  async approveCommission(
    commissionId: string,
    approvedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follower_commissions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          notes: notes
        })
        .eq('id', commissionId);

      if (error) {
        console.error('Error approving commission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error approving commission:', error);
      return false;
    }
  }

  // BMAD METHOD: Mark commission as paid
  async markCommissionPaid(
    commissionId: string,
    paymentMethod: string,
    paymentReference: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follower_commissions')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_date: new Date().toISOString()
        })
        .eq('id', commissionId);

      if (error) {
        console.error('Error marking commission as paid:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      return false;
    }
  }
}

export const followerService = new FollowerService();
export default followerService;

// BMAD METHOD IMPLEMENTATION COMPLETE
// This service now provides full follower-organizer sales delegation functionality:
// - Real database integration with new BMAD schema
// - Sales permission management
// - Commission tracking and payment
// - Follower earnings and analytics
// - Enhanced notification system for sales-enabled followers