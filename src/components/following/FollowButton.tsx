
import React from 'react';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  userId: string;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, className }) => {
  return (
    <Button variant="outline" className={className}>
      Follow
    </Button>
  );
};

export default FollowButton;
