/**
 * Network Growth Service - Epic P.001: User Network Growth & Friend Invitations
 * 
 * Manages friend invitations, contact sync, social sharing, network discovery,
 * and viral growth mechanics for platform community building.
 */

import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: 'contacts' | 'manual' | 'imported';
  isRegistered: boolean;
  userId?: string;
  avatarUrl?: string;
  lastSeen?: string;
}

export interface FriendConnection {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked' | 'following';
  connectionType: 'friend' | 'follower' | 'mutual';
  connectedAt: string;
  mutualFriends: number;
  sharedInterests: string[];
}

export interface InvitationLink {
  id: string;
  code: string;
  userId: string;
  url: string;
  shareType: 'general' | 'event' | 'class' | 'community';
  targetId?: string;
  customMessage?: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  createdAt: string;
  analytics: {
    clicks: number;
    conversions: number;
    platforms: Record<string, number>;
    locations: Record<string, number>;
  };
}

export interface NetworkAnalytics {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    invitesSent: number;
    invitesAccepted: number;
    conversionRate: number;
    newConnections: number;
    networkSize: number;
    viralCoefficient: number;
    topReferralSources: Array<{
      platform: string;
      count: number;
      conversionRate: number;
    }>;
    friendActivityScore: number;
    communityImpact: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface SocialShare {
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'sms' | 'email' | 'linkedin';
  url: string;
  text: string;
  hashtags?: string[];
  imageUrl?: string;
}

export interface ViralChallenge {
  id: string;
  title: string;
  description: string;
  type: 'invite_friends' | 'share_event' | 'complete_profile' | 'join_community';
  requirements: {
    target: number;
    timeframe: string;
    conditions: string[];
  };
  rewards: {
    type: 'badge' | 'discount' | 'points' | 'feature_access';
    value: string;
    description: string;
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  isActive: boolean;
  expiresAt: string;
}

class NetworkGrowthService {
  /**
   * Contact Management & Sync
   */
  static async importContacts(contacts: Contact[]): Promise<{
    imported: number;
    matched: number;
    existing: Contact[];
  }> {
    try {
      console.log('📱 Importing contacts:', contacts.length);

      // Process and validate contacts
      const validContacts = contacts.filter(contact => 
        contact.email || contact.phone
      );

      // Check for existing platform users
      const emails = validContacts.filter(c => c.email).map(c => c.email);
      const phones = validContacts.filter(c => c.phone).map(c => c.phone);

      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('id, email, phone, full_name, avatar_url')
        .or(`email.in.(${emails.join(',')}),phone.in.(${phones.join(',')})`);

      // Match contacts with existing users
      const matchedContacts = validContacts.map(contact => {
        const existingUser = existingUsers?.find(user => 
          user.email === contact.email || user.phone === contact.phone
        );

        return {
          ...contact,
          isRegistered: !!existingUser,
          userId: existingUser?.id,
          avatarUrl: existingUser?.avatar_url
        };
      });

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Store contacts in user's contact list
      const { data, error } = await supabase
        .from('user_contacts')
        .insert(
          matchedContacts.map(contact => ({
            user_id: currentUserId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            source: contact.source,
            is_registered: contact.isRegistered,
            matched_user_id: contact.userId,
            imported_at: new Date().toISOString()
          }))
        );

      if (error) throw error;

      console.log('✅ Contacts imported successfully');
      return {
        imported: validContacts.length,
        matched: matchedContacts.filter(c => c.isRegistered).length,
        existing: matchedContacts.filter(c => c.isRegistered)
      };
    } catch (error) {
      console.error('❌ Error importing contacts:', error);
      throw error;
    }
  }

  static async findFriends(): Promise<Contact[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: suggestions, error } = await supabase
        .from('user_contacts')
        .select(`
          *,
          matched_profile:profiles(*)
        `)
        .eq('user_id', user.user.id)
        .eq('is_registered', true)
        .not('matched_user_id', 'is', null);

      if (error) throw error;

      return suggestions?.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        source: contact.source,
        isRegistered: true,
        userId: contact.matched_user_id,
        avatarUrl: contact.matched_profile?.avatar_url,
        lastSeen: contact.matched_profile?.last_seen
      })) || [];
    } catch (error) {
      console.error('❌ Error finding friends:', error);
      throw error;
    }
  }

  /**
   * Friend Connections
   */
  static async sendFriendRequest(friendId: string): Promise<FriendConnection> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const connection: Omit<FriendConnection, 'id' | 'mutualFriends' | 'sharedInterests'> = {
        userId: user.user.id,
        friendId,
        status: 'pending',
        connectionType: 'friend',
        connectedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('friend_connections')
        .insert(connection)
        .select()
        .single();

      if (error) throw error;

      // Send notification to friend
      await supabase
        .from('notifications')
        .insert({
          user_id: friendId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `You have a new friend request`,
          data: { fromUserId: user.user.id }
        });

      console.log('✅ Friend request sent');
      return data;
    } catch (error) {
      console.error('❌ Error sending friend request:', error);
      throw error;
    }
  }

  static async acceptFriendRequest(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friend_connections')
        .update({ 
          status: 'accepted',
          connectedAt: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;

      // Create reciprocal connection
      const { data: connection } = await supabase
        .from('friend_connections')
        .select('userId, friendId')
        .eq('id', connectionId)
        .single();

      if (connection) {
        await supabase
          .from('friend_connections')
          .insert({
            userId: connection.friendId,
            friendId: connection.userId,
            status: 'accepted',
            connectionType: 'friend',
            connectedAt: new Date().toISOString()
          });
      }

      console.log('✅ Friend request accepted');
    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
      throw error;
    }
  }

  static async getFriendConnections(userId?: string): Promise<FriendConnection[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      const targetUserId = userId || user.data.user?.id;
      
      if (!targetUserId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          *,
          friend:profiles!friend_connections_friendId_fkey(*)
        `)
        .eq('userId', targetUserId)
        .order('connectedAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching friend connections:', error);
      throw error;
    }
  }

  /**
   * Invitation System
   */
  static async generateInvitationLink(options: {
    shareType: InvitationLink['shareType'];
    targetId?: string;
    customMessage?: string;
    expiresAt?: string;
    maxUses?: number;
  }): Promise<InvitationLink> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const code = this.generateInviteCode();
      const url = `${window.location.origin}/invite/${code}`;

      const invitation: Omit<InvitationLink, 'id' | 'analytics'> = {
        code,
        userId: user.user.id,
        url,
        ...options,
        currentUses: 0,
        createdAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('invitation_links')
        .insert({
          ...invitation,
          analytics: {
            clicks: 0,
            conversions: 0,
            platforms: {},
            locations: {}
          }
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Invitation link generated:', url);
      return data;
    } catch (error) {
      console.error('❌ Error generating invitation link:', error);
      throw error;
    }
  }

  static async trackInvitationClick(code: string, metadata: {
    platform?: string;
    location?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Update click analytics
      const { error } = await supabase.rpc('increment_invitation_clicks', {
        invite_code: code,
        platform: metadata.platform || 'direct',
        location: metadata.location || 'unknown'
      });

      if (error) throw error;
      console.log('✅ Invitation click tracked');
    } catch (error) {
      console.error('❌ Error tracking invitation click:', error);
    }
  }

  static async processInvitationConversion(code: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('process_invitation_conversion', {
        invite_code: code
      });

      if (error) throw error;
      console.log('✅ Invitation conversion processed');
    } catch (error) {
      console.error('❌ Error processing invitation conversion:', error);
    }
  }

  /**
   * Social Media Sharing
   */
  static generateSocialShare(
    platform: SocialShare['platform'],
    invitationLink: InvitationLink,
    customContent?: {
      text?: string;
      hashtags?: string[];
      imageUrl?: string;
    }
  ): SocialShare {
    const baseText = customContent?.text || 
      'Join me on SteppersLife - the ultimate platform for stepping enthusiasts! 💃🕺';
    
    const hashtags = customContent?.hashtags || 
      ['#SteppersLife', '#Stepping', '#Dance', '#Community'];

    const url = `${invitationLink.url}?ref=${platform}`;

    switch (platform) {
      case 'facebook':
        return {
          platform,
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(baseText)}`,
          text: baseText
        };

      case 'twitter':
        return {
          platform,
          url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(baseText)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.map(h => h.replace('#', '')).join(',')}`,
          text: baseText,
          hashtags
        };

      case 'linkedin':
        return {
          platform,
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          text: baseText
        };

      case 'whatsapp':
        return {
          platform,
          url: `https://wa.me/?text=${encodeURIComponent(`${baseText} ${url}`)}`,
          text: baseText
        };

      case 'sms':
        return {
          platform,
          url: `sms:?body=${encodeURIComponent(`${baseText} ${url}`)}`,
          text: baseText
        };

      case 'email':
        return {
          platform,
          url: `mailto:?subject=${encodeURIComponent('Join me on SteppersLife!')}&body=${encodeURIComponent(`${baseText}\n\n${url}`)}`,
          text: baseText
        };

      default:
        return {
          platform,
          url,
          text: baseText
        };
    }
  }

  /**
   * Network Analytics
   */
  static async getNetworkAnalytics(period: NetworkAnalytics['period'] = 'month'): Promise<NetworkAnalytics> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const dateRange = this.getDateRange(period);

      const { data: analytics, error } = await supabase.rpc('get_network_analytics', {
        user_id: user.user.id,
        start_date: dateRange.start,
        end_date: dateRange.end
      });

      if (error) throw error;

      return {
        userId: user.user.id,
        period,
        metrics: analytics || {
          invitesSent: 0,
          invitesAccepted: 0,
          conversionRate: 0,
          newConnections: 0,
          networkSize: 0,
          viralCoefficient: 0,
          topReferralSources: [],
          friendActivityScore: 0,
          communityImpact: 0
        },
        dateRange
      };
    } catch (error) {
      console.error('❌ Error fetching network analytics:', error);
      throw error;
    }
  }

  /**
   * Viral Challenges
   */
  static async getViralChallenges(): Promise<ViralChallenge[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: challenges, error } = await supabase
        .from('viral_challenges')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return challenges || [];
    } catch (error) {
      console.error('❌ Error fetching viral challenges:', error);
      throw error;
    }
  }

  static async createViralChallenge(challenge: Omit<ViralChallenge, 'id' | 'progress' | 'isActive'>): Promise<ViralChallenge> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('viral_challenges')
        .insert({
          ...challenge,
          user_id: user.user.id,
          progress: {
            current: 0,
            target: challenge.requirements.target,
            percentage: 0
          },
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creating viral challenge:', error);
      throw error;
    }
  }

  /**
   * Community Discovery
   */
  static async discoverCommunities(): Promise<any[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Find communities based on friend networks
      const { data: communities, error } = await supabase.rpc('discover_communities_by_network', {
        user_id: user.user.id
      });

      if (error) throw error;
      return communities || [];
    } catch (error) {
      console.error('❌ Error discovering communities:', error);
      throw error;
    }
  }

  /**
   * Utility Methods
   */
  private static generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private static getDateRange(period: NetworkAnalytics['period']): { start: string; end: string } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }
}

export default NetworkGrowthService;