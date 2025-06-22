// Organizer Follower System Service
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
  engagement_rate: number;
  top_events_by_followers: Array<{
    event_id: string;
    event_name: string;
    followers_registered: number;
  }>;
}

class FollowerService {
  // Get all followers for an organizer
  async getOrganizerFollowers(organizerId: string): Promise<OrganizerFollower[]> {
    try {
      // Mock data for development - replace with actual API call
      const mockFollowers: OrganizerFollower[] = [
        {
          id: 'fol_001',
          organizer_id: organizerId,
          follower_user_id: 'user_001',
          follower_name: 'Maria Rodriguez',
          follower_email: 'maria@example.com',
          followed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          notification_preferences: {
            new_events: true,
            event_updates: true,
            special_offers: false
          },
          status: 'active'
        },
        {
          id: 'fol_002',
          organizer_id: organizerId,
          follower_user_id: 'user_002',
          follower_name: 'Carlos Mendez',
          follower_email: 'carlos@example.com',
          followed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          notification_preferences: {
            new_events: true,
            event_updates: false,
            special_offers: true
          },
          status: 'active'
        },
        {
          id: 'fol_003',
          organizer_id: organizerId,
          follower_user_id: 'user_003',
          follower_name: 'Sofia Chen',
          follower_email: 'sofia@example.com',
          followed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notification_preferences: {
            new_events: true,
            event_updates: true,
            special_offers: true
          },
          status: 'active'
        }
      ];

      return mockFollowers;
    } catch (error) {
      console.error('Error fetching organizer followers:', error);
      throw error;
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

  // Get follower statistics
  async getFollowerStats(organizerId: string): Promise<FollowerStats> {
    try {
      const followers = await this.getOrganizerFollowers(organizerId);
      
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const newFollowersThisMonth = followers.filter(f => 
        new Date(f.followed_at) >= oneMonthAgo
      ).length;

      const mockStats: FollowerStats = {
        total_followers: followers.length,
        new_followers_this_month: newFollowersThisMonth,
        active_followers: followers.filter(f => f.status === 'active').length,
        engagement_rate: 67.5, // Mock engagement rate
        top_events_by_followers: [
          {
            event_id: 'evt_001',
            event_name: 'Salsa Night Spectacular',
            followers_registered: 45
          },
          {
            event_id: 'evt_002',
            event_name: 'Bachata Workshop Series',
            followers_registered: 32
          },
          {
            event_id: 'evt_003',
            event_name: 'Latin Dance Competition',
            followers_registered: 28
          }
        ]
      };

      return mockStats;
    } catch (error) {
      console.error('Error fetching follower stats:', error);
      throw error;
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

  // Send notification to followers
  async notifyFollowers(organizerId: string, notification: {
    type: 'new_event' | 'event_update' | 'special_offer';
    title: string;
    message: string;
    event_id?: string;
  }): Promise<void> {
    try {
      const followers = await this.getOrganizerFollowers(organizerId);
      
      // Filter followers based on notification preferences
      const eligibleFollowers = followers.filter(follower => {
        switch (notification.type) {
          case 'new_event':
            return follower.notification_preferences.new_events;
          case 'event_update':
            return follower.notification_preferences.event_updates;
          case 'special_offer':
            return follower.notification_preferences.special_offers;
          default:
            return false;
        }
      });

      // Mock implementation - replace with actual notification service
      console.log(`Sending ${notification.type} notification to ${eligibleFollowers.length} followers:`, notification);
    } catch (error) {
      console.error('Error sending notifications to followers:', error);
      throw error;
    }
  }

  // Export followers data
  async exportFollowers(organizerId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    try {
      const followers = await this.getOrganizerFollowers(organizerId);
      
      if (format === 'csv') {
        const csvContent = this.generateFollowersCSV(followers);
        this.downloadFile(csvContent, `followers-${organizerId}.csv`, 'text/csv');
      } else {
        const jsonContent = JSON.stringify(followers, null, 2);
        this.downloadFile(jsonContent, `followers-${organizerId}.json`, 'application/json');
      }
    } catch (error) {
      console.error('Error exporting followers:', error);
      throw error;
    }
  }

  private generateFollowersCSV(followers: OrganizerFollower[]): string {
    const headers = ['Name', 'Email', 'Followed At', 'Status', 'New Events', 'Event Updates', 'Special Offers'];
    const rows = followers.map(f => [
      f.follower_name,
      f.follower_email,
      new Date(f.followed_at).toLocaleDateString(),
      f.status,
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
}

export const followerService = new FollowerService();
export default followerService;