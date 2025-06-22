import { useState, useEffect } from 'react';
import { followerService, OrganizerFollower, TeamMember, FollowerStats } from '@/services/followerService';

export const useFollowers = (organizerId: string) => {
  const [followers, setFollowers] = useState<OrganizerFollower[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<FollowerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [followersData, teamData, statsData] = await Promise.all([
        followerService.getOrganizerFollowers(organizerId),
        followerService.getTeamMembers(organizerId),
        followerService.getFollowerStats(organizerId)
      ]);
      
      setFollowers(followersData);
      setTeamMembers(teamData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading followers data:', err);
      setError('Failed to load followers data');
    } finally {
      setIsLoading(false);
    }
  };

  const addTeamMember = async (memberData: Omit<TeamMember, 'id' | 'organizer_id' | 'added_at' | 'status'>) => {
    try {
      const newMember = await followerService.addTeamMember(organizerId, memberData);
      setTeamMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      console.error('Error adding team member:', err);
      throw err;
    }
  };

  const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      const updatedMember = await followerService.updateTeamMember(memberId, updates);
      setTeamMembers(prev => 
        prev.map(member => member.id === memberId ? updatedMember : member)
      );
      return updatedMember;
    } catch (err) {
      console.error('Error updating team member:', err);
      throw err;
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      await followerService.removeTeamMember(memberId);
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error removing team member:', err);
      throw err;
    }
  };

  const notifyFollowers = async (notification: {
    type: 'new_event' | 'event_update' | 'special_offer';
    title: string;
    message: string;
    event_id?: string;
  }) => {
    try {
      await followerService.notifyFollowers(organizerId, notification);
    } catch (err) {
      console.error('Error notifying followers:', err);
      throw err;
    }
  };

  const exportFollowers = async (format: 'csv' | 'json' = 'csv') => {
    try {
      await followerService.exportFollowers(organizerId, format);
    } catch (err) {
      console.error('Error exporting followers:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (organizerId) {
      loadFollowers();
    }
  }, [organizerId]);

  return {
    followers,
    teamMembers,
    stats,
    isLoading,
    error,
    refetch: loadFollowers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    notifyFollowers,
    exportFollowers
  };
};