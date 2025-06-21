import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showValue?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  showValue = false,
  interactive = false,
  size = 'md',
  onChange,
  className
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starIndex: number) => {
    const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;
    
    if (starIndex <= currentRating) {
      return 'text-yellow-400 fill-yellow-400';
    } else if (starIndex - 0.5 <= currentRating) {
      return 'text-yellow-400 fill-yellow-400/50';
    } else {
      return 'text-gray-300 fill-transparent';
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starIndex = index + 1;
          return (
            <Star
              key={starIndex}
              className={cn(
                sizeClasses[size],
                getStarColor(starIndex),
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                'stroke-1'
              )}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
            />
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)} ({maxRating})
        </span>
      )}
    </div>
  );
};