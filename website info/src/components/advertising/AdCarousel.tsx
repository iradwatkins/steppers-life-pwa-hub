import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { AdPlacement, DirectUserAd } from '@/types/advertising';
import { advertisingService } from '@/services/advertisingService';
import { AdBanner } from './AdBanner';

interface AdCarouselProps {
  placement: AdPlacement;
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number; // in milliseconds
  showControls?: boolean;
  showIndicators?: boolean;
  fallbackContent?: React.ReactNode;
}

export const AdCarousel: React.FC<AdCarouselProps> = ({
  placement,
  className = '',
  autoRotate = true,
  rotationInterval = 5000,
  showControls = true,
  showIndicators = true,
  fallbackContent
}) => {
  const [ads, setAds] = useState<DirectUserAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get ads for this placement
        const allAds = await advertisingService.getDirectUserAds();
        const zones = await advertisingService.getAdZones();
        
        // Find zone for this placement
        const zone = zones.find(z => z.placement === placement && z.isActive);
        if (!zone) {
          setAds([]);
          setLoading(false);
          return;
        }
        
        // Find running ads for this zone
        const runningAds = allAds.filter(a => 
          a.adZoneId === zone.id && 
          a.status === 'running' &&
          new Date() >= a.schedule.startDate && 
          new Date() <= a.schedule.endDate
        );
        
        setAds(runningAds);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [placement]);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate || ads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, ads.length, rotationInterval, isPaused]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  }, [ads.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, togglePause]);

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <div className="text-gray-400 text-sm">Loading ads...</div>
        </div>
      </div>
    );
  }

  // Show error or fallback
  if (error || ads.length === 0) {
    if (fallbackContent) {
      return <div className={className}>{fallbackContent}</div>;
    }
    return null;
  }

  // Single ad - just show the banner
  if (ads.length === 1) {
    return (
      <AdBanner 
        placement={placement}
        className={className}
        fallbackContent={fallbackContent}
      />
    );
  }

  const currentAd = ads[currentIndex];

  return (
    <div className={`relative group ${className}`}>
      {/* Main ad display */}
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="cursor-pointer relative"
          onClick={() => {
            if (currentAd.clickThroughUrl) {
              window.open(currentAd.clickThroughUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          style={{
            backgroundImage: `url(${currentAd.creativeUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '200px'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-200" />
          
          {/* Ad content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="text-white">
              <h3 className="font-bold text-xl mb-2 line-clamp-2">{currentAd.title}</h3>
              {currentAd.description && (
                <p className="text-sm opacity-90 line-clamp-2 mb-3">{currentAd.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-75">{currentAd.advertiserInfo.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-75">
                    {currentIndex + 1} of {ads.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ad indicator */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded">
            Ad
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && ads.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
            aria-label="Previous ad"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
            aria-label="Next ad"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Play/Pause button */}
          {autoRotate && (
            <button
              onClick={togglePause}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
              aria-label={isPaused ? 'Resume rotation' : 'Pause rotation'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
        </>
      )}

      {/* Indicators */}
      {showIndicators && ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Status indicator */}
      {isPaused && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Paused
        </div>
      )}
    </div>
  );
}; 