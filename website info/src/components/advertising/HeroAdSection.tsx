import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ExternalLink } from 'lucide-react';
import { AdPlacement, DirectUserAd } from '@/types/advertising';
import { advertisingService } from '@/services/advertisingService';

interface HeroAdSectionProps {
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  fallbackContent?: React.ReactNode;
  minHeight?: string;
}

export const HeroAdSection: React.FC<HeroAdSectionProps> = ({
  className = '',
  autoRotate = true,
  rotationInterval = 8000,
  showControls = true,
  showIndicators = true,
  fallbackContent,
  minHeight = '500px'
}) => {
  const [ads, setAds] = useState<DirectUserAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchHeroAds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get ads for hero placements
        const allAds = await advertisingService.getDirectUserAds();
        const zones = await advertisingService.getAdZones();
        
        // Find hero banner zones
        const heroZones = zones.filter(z => 
          (z.placement === AdPlacement.HEADER_BANNER || 
           z.placement === AdPlacement.FOOTER_BANNER ||
           z.name.toLowerCase().includes('hero')) && 
          z.isActive
        );
        
        if (heroZones.length === 0) {
          setAds([]);
          setLoading(false);
          return;
        }
        
        // Find running ads for hero zones
        const heroAds = allAds.filter(a => 
          heroZones.some(zone => zone.id === a.adZoneId) &&
          a.status === 'running' &&
          new Date() >= a.schedule.startDate && 
          new Date() <= a.schedule.endDate
        );
        
        setAds(heroAds);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Error fetching hero ads:', err);
        setError('Failed to load hero ads');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroAds();
  }, []);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate || ads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, ads.length, rotationInterval, isPaused]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleAdClick = (ad: DirectUserAd) => {
    // Record click
    console.log(`Recording click for hero ad: ${ad.id}`);
    
    // Open link in new tab
    if (ad.clickThroughUrl) {
      window.open(ad.clickThroughUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 ${className}`} style={{ minHeight }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-lg">Loading hero content...</div>
        </div>
      </div>
    );
  }

  // Show fallback if no ads
  if (error || ads.length === 0) {
    if (fallbackContent) {
      return <div className={className} style={{ minHeight }}>{fallbackContent}</div>;
    }
    return null;
  }

  const currentAd = ads[currentIndex];

  return (
    <div className={`relative overflow-hidden group ${className}`} style={{ minHeight }}>
      {/* Background image with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform hover:scale-105"
        style={{
          backgroundImage: `url(${currentAd.creativeUrl})`,
        }}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl">
            {/* Ad indicator */}
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              Advertisement
            </div>
            
            {/* Ad content */}
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {currentAd.title}
              </h1>
              
              {currentAd.description && (
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
                  {currentAd.description}
                </p>
              )}
              
              {/* Call to action */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {currentAd.clickThroughUrl && (
                  <button
                    onClick={() => handleAdClick(currentAd)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    Learn More
                    <ExternalLink className="h-5 w-5" />
                  </button>
                )}
                
                {/* Advertiser info */}
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-px h-8 bg-gray-400" />
                  <div>
                    <p className="text-sm">Sponsored by</p>
                    <p className="font-medium">{currentAd.advertiserInfo.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && ads.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50"
            aria-label="Previous ad"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50"
            aria-label="Next ad"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Play/Pause button */}
          {autoRotate && (
            <button
              onClick={togglePause}
              className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50"
              aria-label={isPaused ? 'Resume rotation' : 'Pause rotation'}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
          )}
        </>
      )}

      {/* Indicators */}
      {showIndicators && ads.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {ads.map((ad, index) => (
            <button
              key={ad.id}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to ad ${index + 1}: ${ad.title}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {autoRotate && ads.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((Date.now() % rotationInterval) / rotationInterval) * 100}%`
            }}
          />
        </div>
      )}

      {/* Status indicator */}
      {isPaused && (
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full">
          Paused
        </div>
      )}

      {/* Ad counter */}
      {ads.length > 1 && (
        <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full">
          {currentIndex + 1} / {ads.length}
        </div>
      )}
    </div>
  );
}; 