/**
 * FollowButton Component - Epic G.005: Following Organizers, Instructors, Community Listings
 * 
 * Reusable follow/unfollow button with loading states, follower counts,
 * and consistent styling across all pages.
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFollowing } from '@/hooks/useFollowing';
import { Heart, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FollowButtonProps {
  entityId: string;
  entityType: 'organizer' | 'instructor' | 'business';
  entityName?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  showFollowerCount?: boolean;
  showIcon?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  entityId,
  entityType,
  entityName,
  size = 'default',
  variant = 'default',
  showFollowerCount = false,
  showIcon = true,
  className,
  onFollowChange
}) => {
  const {
    isFollowing,
    followerCount,
    followEntity,
    unfollowEntity,
    isFollowingLoading,
    loadFollowingStatus
  } = useFollowing();

  const isCurrentlyFollowing = isFollowing(entityId);
  const currentFollowerCount = followerCount(entityId);
  const isLoading = isFollowingLoading[entityId] || false;

  // Load following status when component mounts
  useEffect(() => {
    if (loadFollowingStatus) {
      loadFollowingStatus([entityId]);
    }
  }, [entityId, loadFollowingStatus]);

  // Notify parent of changes
  useEffect(() => {
    if (onFollowChange) {
      onFollowChange(isCurrentlyFollowing, currentFollowerCount);
    }
  }, [isCurrentlyFollowing, currentFollowerCount, onFollowChange]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentlyFollowing) {
      await unfollowEntity(entityId);
    } else {
      await followEntity(entityId, entityType);
    }
  };

  const getButtonText = () => {
    if (variant === 'icon') return '';
    
    if (isLoading) return 'Loading...';
    
    if (isCurrentlyFollowing) {
      return size === 'sm' ? 'Following' : 'Following';
    } else {
      return size === 'sm' ? 'Follow' : 'Follow';
    }
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;

    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    if (isCurrentlyFollowing) {
      return variant === 'icon' ? 
        <Heart className="h-4 w-4 fill-current" /> : 
        <UserMinus className="h-4 w-4" />;
    } else {
      return variant === 'icon' ? 
        <Heart className="h-4 w-4" /> : 
        <UserPlus className="h-4 w-4" />;
    }
  };

  const getButtonVariant = () => {
    if (variant === 'icon') {
      return isCurrentlyFollowing ? 'default' : 'outline';
    }
    
    if (isCurrentlyFollowing) {
      return variant === 'default' ? 'outline' : variant;
    }
    
    return variant;
  };

  const getButtonColors = () => {
    if (isCurrentlyFollowing) {
      return variant === 'icon' 
        ? 'text-red-500 border-red-200 hover:bg-red-50' 
        : 'text-stepping-purple border-stepping-purple hover:bg-stepping-purple/10';
    }
    
    return variant === 'icon' 
      ? 'text-muted-foreground hover:text-red-500 hover:border-red-200' 
      : '';
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size={size}
        variant={getButtonVariant() as any}
        onClick={handleFollowClick}
        disabled={isLoading}
        className={cn(
          'transition-all duration-200',
          getButtonColors(),
          variant === 'icon' && 'w-10 h-10 p-0',
          className
        )}
        title={`${isCurrentlyFollowing ? 'Unfollow' : 'Follow'} ${entityName || entityType}`}
      >
        {variant === 'icon' ? (
          getButtonIcon()
        ) : (
          <>
            {getButtonIcon()}
            {getButtonText() && (
              <span className={showIcon ? 'ml-2' : ''}>{getButtonText()}</span>
            )}
          </>
        )}
      </Button>

      {showFollowerCount && currentFollowerCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {currentFollowerCount.toLocaleString()} follower{currentFollowerCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default FollowButton;