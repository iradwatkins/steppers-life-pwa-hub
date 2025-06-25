import React, { useState } from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  showIcon?: boolean;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackText,
  showIcon = true,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Show fallback if no src, image error, or still loading and error occurred
  const showFallback = !src || imageError;

  if (showFallback) {
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        {...props}
      >
        {showIcon && (
          <ImageIcon className="h-8 w-8 mb-2" />
        )}
        {fallbackText && (
          <span className="text-sm text-center px-2">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={cn(
          "w-full h-full object-cover",
          imageLoading && "opacity-0"
        )}
        {...props}
      />
    </div>
  );
};

interface EventImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  variant?: 'card' | 'hero' | 'thumbnail' | 'gallery';
}

export const EventImage: React.FC<EventImageProps> = ({
  src,
  alt,
  className,
  variant = 'card'
}) => {
  const getFallbackText = () => {
    switch (variant) {
      case 'hero':
        return 'Event Image';
      case 'thumbnail':
        return '';
      case 'gallery':
        return 'Gallery Image';
      default:
        return 'No Image Available';
    }
  };

  const getShowIcon = () => {
    return variant !== 'thumbnail';
  };

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fallbackText={getFallbackText()}
      showIcon={getShowIcon()}
      className={className}
    />
  );
};