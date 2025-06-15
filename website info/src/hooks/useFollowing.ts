import { useState, useEffect, useCallback } from 'react';
import { 
  followingService, 
  FollowableEntity, 
  FollowableEntityType, 
  FollowingRelationship, 
  FollowingFeedItem, 
  FollowingRecommendation, 
  FollowingAnalytics,
  OrganizerProfile,
  InstructorProfile,
  BusinessProfile
} from '../services/followingService';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UseFollowingOptions {
  entityType?: FollowableEntityType;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseFollowingReturn {
  // State
  following: FollowingRelationship[];
  followingFeed: FollowingFeedItem[];
  recommendations: FollowingRecommendation[];
  analytics: FollowingAnalytics | null;
  loading: boolean;
  error: string | null;

  // Actions
  followEntity: (entityId: string, entityType: FollowableEntityType) => Promise<boolean>;
  unfollowEntity: (entityId: string, entityType: FollowableEntityType) => Promise<boolean>;
  getFollowingStatus: (entityId: string, entityType: FollowableEntityType) => Promise<{ isFollowing: boolean; relationship?: FollowingRelationship }>;
  updateNotificationPreferences: (entityId: string, entityType: FollowableEntityType, preferences: any) => Promise<boolean>;
  
  // Data fetching
  refreshFollowing: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;

  // Utility methods
  getFollowersCount: (entityId: string, entityType: FollowableEntityType) => Promise<number>;
  isFollowing: (entityId: string, entityType: FollowableEntityType) => boolean;
  getFollowingCount: () => number;
  getFollowingByType: (type: FollowableEntityType) => FollowingRelationship[];
}

export const useFollowing = (options: UseFollowingOptions = {}): UseFollowingReturn => {
  const { user } = useAuth();
  const { entityType, autoRefresh = true, refreshInterval = 30000 } = options;

  // State
  const [following, setFollowing] = useState<FollowingRelationship[]>([]);
  const [followingFeed, setFollowingFeed] = useState<FollowingFeedItem[]>([]);
  const [recommendations, setRecommendations] = useState<FollowingRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<FollowingAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedOffset, setFeedOffset] = useState(0);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  // Follow/Unfollow Actions
  const followEntity = useCallback(async (entityId: string, entityType: FollowableEntityType): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please log in to follow');
      return false;
    }

    try {
      setLoading(true);
      const result = await followingService.followEntity(user.id, entityId, entityType);
      
      if (result.success) {
        // Refresh following list
        await refreshFollowing();
        toast.success(`Successfully followed ${entityType}`);
        return true;
      } else {
        toast.error(result.error || 'Failed to follow');
        return false;
      }
    } catch (error) {
      console.error('Error following entity:', error);
      toast.error('Failed to follow');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const unfollowEntity = useCallback(async (entityId: string, entityType: FollowableEntityType): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please log in to unfollow');
      return false;
    }

    try {
      setLoading(true);
      const result = await followingService.unfollowEntity(user.id, entityId, entityType);
      
      if (result.success) {
        // Update local state immediately
        setFollowing(prev => prev.filter(f => !(f.entity_id === entityId && f.entity_type === entityType)));
        toast.success(`Successfully unfollowed ${entityType}`);
        return true;
      } else {
        toast.error(result.error || 'Failed to unfollow');
        return false;
      }
    } catch (error) {
      console.error('Error unfollowing entity:', error);
      toast.error('Failed to unfollow');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getFollowingStatus = useCallback(async (entityId: string, entityType: FollowableEntityType) => {
    if (!user?.id) return { isFollowing: false };
    
    try {
      return await followingService.getFollowingStatus(user.id, entityId, entityType);
    } catch (error) {
      console.error('Error getting following status:', error);
      return { isFollowing: false };
    }
  }, [user?.id]);

  const updateNotificationPreferences = useCallback(async (
    entityId: string, 
    entityType: FollowableEntityType, 
    preferences: any
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please log in to update preferences');
      return false;
    }

    try {
      const result = await followingService.updateNotificationPreferences(user.id, entityId, entityType, preferences);
      
      if (result.success) {
        // Update local state
        setFollowing(prev => prev.map(f => 
          f.entity_id === entityId && f.entity_type === entityType
            ? { ...f, notification_preferences: { ...f.notification_preferences, ...preferences } }
            : f
        ));
        toast.success('Notification preferences updated');
        return true;
      } else {
        toast.error(result.error || 'Failed to update preferences');
        return false;
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update preferences');
      return false;
    }
  }, [user?.id]);

  // Data fetching
  const refreshFollowing = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const followingList = await followingService.getFollowingList(user.id, entityType);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error refreshing following:', error);
      setError('Failed to load following list');
    }
  }, [user?.id, entityType]);

  const refreshFeed = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const feed = await followingService.getFollowingFeed(user.id, 20, 0);
      setFollowingFeed(feed);
      setFeedOffset(20);
      setHasMoreFeed(feed.length === 20);
    } catch (error) {
      console.error('Error refreshing feed:', error);
      setError('Failed to load following feed');
    }
  }, [user?.id]);

  const loadMoreFeed = useCallback(async () => {
    if (!user?.id || !hasMoreFeed) return;

    try {
      const moreFeed = await followingService.getFollowingFeed(user.id, 20, feedOffset);
      setFollowingFeed(prev => [...prev, ...moreFeed]);
      setFeedOffset(prev => prev + 20);
      setHasMoreFeed(moreFeed.length === 20);
    } catch (error) {
      console.error('Error loading more feed:', error);
      toast.error('Failed to load more feed items');
    }
  }, [user?.id, feedOffset, hasMoreFeed]);

  const refreshRecommendations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const recs = await followingService.getRecommendations(user.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      setError('Failed to load recommendations');
    }
  }, [user?.id]);

  const refreshAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const analyticsData = await followingService.getFollowingAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      setError('Failed to load analytics');
    }
  }, [user?.id]);

  // Utility methods
  const getFollowersCount = useCallback(async (entityId: string, entityType: FollowableEntityType): Promise<number> => {
    try {
      return await followingService.getFollowersCount(entityId, entityType);
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  }, []);

  const isFollowing = useCallback((entityId: string, entityType: FollowableEntityType): boolean => {
    return following.some(f => f.entity_id === entityId && f.entity_type === entityType);
  }, [following]);

  const getFollowingCount = useCallback((): number => {
    return following.length;
  }, [following]);

  const getFollowingByType = useCallback((type: FollowableEntityType): FollowingRelationship[] => {
    return following.filter(f => f.entity_type === type);
  }, [following]);

  // Initial data load
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([
        refreshFollowing(),
        refreshFeed(),
        refreshRecommendations(),
        refreshAnalytics()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user?.id, refreshFollowing, refreshFeed, refreshRecommendations, refreshAnalytics]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    const interval = setInterval(() => {
      refreshFollowing();
      refreshFeed();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user?.id, refreshFollowing, refreshFeed]);

  return {
    // State
    following,
    followingFeed,
    recommendations,
    analytics,
    loading,
    error,

    // Actions
    followEntity,
    unfollowEntity,
    getFollowingStatus,
    updateNotificationPreferences,

    // Data fetching
    refreshFollowing,
    refreshFeed,
    refreshRecommendations,
    refreshAnalytics,
    loadMoreFeed,

    // Utility methods
    getFollowersCount,
    isFollowing,
    getFollowingCount,
    getFollowingByType
  };
};

// Specialized hooks for specific entity types
export const useOrganizerFollowing = () => {
  return useFollowing({ entityType: 'organizer' });
};

export const useInstructorFollowing = () => {
  return useFollowing({ entityType: 'instructor' });
};

export const useBusinessFollowing = () => {
  return useFollowing({ entityType: 'business' });
};

// Hook for getting entity profiles
export const useEntityProfile = (entityId: string, entityType: FollowableEntityType) => {
  const [profile, setProfile] = useState<FollowableEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId || !entityType) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        let profileData: FollowableEntity | null = null;

        switch (entityType) {
          case 'organizer':
            profileData = await followingService.getOrganizerProfile(entityId);
            break;
          case 'instructor':
            profileData = await followingService.getInstructorProfile(entityId);
            break;
          case 'business':
            profileData = await followingService.getBusinessProfile(entityId);
            break;
        }

        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching entity profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [entityId, entityType]);

  return { profile, loading, error };
};

// Hook for follow button functionality
export const useFollowButton = (entityId: string, entityType: FollowableEntityType) => {
  const { followEntity, unfollowEntity, isFollowing: checkIsFollowing, loading } = useFollowing();
  const [isFollowing, setIsFollowing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // Check following status on mount
  useEffect(() => {
    setIsFollowing(checkIsFollowing(entityId, entityType));
  }, [checkIsFollowing, entityId, entityType]);

  const handleToggleFollow = useCallback(async () => {
    setLocalLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowEntity(entityId, entityType);
        if (success) {
          setIsFollowing(false);
        }
      } else {
        const success = await followEntity(entityId, entityType);
        if (success) {
          setIsFollowing(true);
        }
      }
    } finally {
      setLocalLoading(false);
    }
  }, [isFollowing, followEntity, unfollowEntity, entityId, entityType]);

  return {
    isFollowing,
    loading: loading || localLoading,
    handleToggleFollow
  };
}; 