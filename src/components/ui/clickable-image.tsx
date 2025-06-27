import React, { useState } from 'react';
import { ZoomIn, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageLightbox } from './image-lightbox';

interface ClickableImageProps {
  src: string;
  alt?: string;
  className?: string;
  images?: string[]; // For gallery mode
  currentIndex?: number;
  showZoomIcon?: boolean;
  rounded?: boolean;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const ClickableImage: React.FC<ClickableImageProps> = ({
  src,
  alt = '',
  className,
  images = [src],
  currentIndex = 0,
  showZoomIcon = true,
  rounded = true,
  aspectRatio = 'auto'
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(currentIndex);

  const handleImageClick = () => {
    setLightboxIndex(images.findIndex(img => img === src) || 0);
    setIsLightboxOpen(true);
  };

  const handlePrevious = () => {
    setLightboxIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setLightboxIndex(prev => (prev + 1) % images.length);
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }[aspectRatio];

  return (
    <>
      <div 
        className={cn(
          "relative group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg",
          rounded && "rounded-lg",
          aspectRatioClass,
          className
        )}
        onClick={handleImageClick}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-transform duration-200 group-hover:scale-105",
            aspectRatio !== 'auto' ? 'absolute inset-0' : ''
          )}
          loading="lazy"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        
        {/* Zoom icon */}
        {showZoomIcon && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <ZoomIn className="h-6 w-6 text-gray-800" />
            </div>
          </div>
        )}

        {/* Gallery indicator */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Eye className="h-3 w-3 inline mr-1" />
            {images.length} images
          </div>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onPrevious={images.length > 1 ? handlePrevious : undefined}
        onNext={images.length > 1 ? handleNext : undefined}
      />
    </>
  );
};

export default ClickableImage;