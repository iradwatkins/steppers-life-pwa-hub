import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showNumeric?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showNumeric = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const getStarClass = (starIndex: number) => {
    const baseClass = `${sizeClasses[size]} transition-colors`;
    const interactiveClass = interactive ? 'cursor-pointer hover:scale-110' : '';
    
    if (starIndex <= rating) {
      return `${baseClass} ${interactiveClass} text-yellow-400 fill-current`;
    } else {
      return `${baseClass} ${interactiveClass} text-gray-300`;
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          return (
            <Star
              key={starRating}
              className={getStarClass(starRating)}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={interactive ? () => {
                // Could add hover effect here if needed
              } : undefined}
            />
          );
        })}
      </div>
      {showNumeric && (
        <span className="text-sm text-text-secondary ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 