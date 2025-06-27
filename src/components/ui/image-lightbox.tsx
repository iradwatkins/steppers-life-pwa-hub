import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  // Reset state when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-white/20"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Navigation buttons */}
      {hasMultipleImages && onPrevious && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-white/20"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {hasMultipleImages && onNext && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-white/20"
          onClick={onNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      {/* Control bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-lg p-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-white text-sm min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          onClick={handleRotate}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      {/* Image counter */}
      {hasMultipleImages && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Main image */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          className={cn(
            "max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200",
            isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-auto"
          )}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default ImageLightbox;