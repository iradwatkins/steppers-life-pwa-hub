import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollowButton } from '@/hooks/useFollowing';
import { FollowableEntityType } from '@/services/followingService';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  entityId: string;
  entityType: FollowableEntityType;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  showFollowerCount?: boolean;
  followerCount?: number;
  className?: string;
  children?: React.ReactNode;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  entityId,
  entityType,
  variant = 'outline',
  size = 'default',
  showFollowerCount = false,
  followerCount,
  className,
  children
}) => {
  const { isFollowing, loading, handleToggleFollow } = useFollowButton(entityId, entityType);

  const getButtonText = () => {
    if (variant === 'icon') return null;
    
    if (isFollowing) {
      return children || 'Following';
    }
    
    switch (entityType) {
      case 'organizer':
        return children || 'Follow Organizer';
      case 'instructor':
        return children || 'Follow Instructor';
      case 'business':
        return children || 'Follow Business';
      default:
        return children || 'Follow';
    }
  };

  const getButtonIcon = () => {
    if (loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (isFollowing) {
      return variant === 'icon' ? <Heart className="h-4 w-4 fill-current" /> : <UserMinus className="h-4 w-4" />;
    }
    
    return variant === 'icon' ? <Heart className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (isFollowing && variant === 'default') {
      return 'outline';
    }
    return variant;
  };

  const buttonContent = (
    <>
      {getButtonIcon()}
      {getButtonText() && (
        <span className={variant === 'icon' ? 'sr-only' : 'ml-2'}>
          {getButtonText()}
        </span>
      )}
    </>
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={handleToggleFollow}
        disabled={loading}
        className={cn(
          "transition-all duration-200",
          isFollowing && variant === 'default' && "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
          isFollowing && variant === 'outline' && "border-green-200 text-green-700 hover:bg-green-50",
          variant === 'icon' && "h-8 w-8 p-0"
        )}
      >
        {buttonContent}
      </Button>
      
      {showFollowerCount && followerCount !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {followerCount.toLocaleString()} follower{followerCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

export default FollowButton; 