import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AdPlacement, DirectUserAd } from '@/types/advertising';
import { advertisingService } from '@/services/advertisingService';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  fallbackContent?: React.ReactNode;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  className = '',
  showCloseButton = false,
  onClose,
  fallbackContent
}) => {
  const [ad, setAd] = useState<DirectUserAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get ads for this placement
        const ads = await advertisingService.getDirectUserAds();
        const zones = await advertisingService.getAdZones();
        
        // Find zone for this placement
        const zone = zones.find(z => z.placement === placement && z.isActive);
        if (!zone) {
          setAd(null);
          setLoading(false);
          return;
        }
        
        // Find running ads for this zone
        const runningAds = ads.filter(a => 
          a.adZoneId === zone.id && 
          a.status === 'running' &&
          new Date() >= a.schedule.startDate && 
          new Date() <= a.schedule.endDate
        );
        
        if (runningAds.length > 0) {
          // If zone supports random placement, rotate through ads
          if (zone.isRandomPlacement && runningAds.length > 1) {
            const randomIndex = Math.floor(Math.random() * runningAds.length);
            setAd(runningAds[randomIndex]);
          } else {
            // Show the first ad or highest priority
            setAd(runningAds[0]);
          }
          
          // Track impression
          recordImpression(runningAds[0].id);
        } else {
          setAd(null);
        }
      } catch (err) {
        console.error('Error fetching ad:', err);
        setError('Failed to load ad');
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    if (!closed) {
      fetchAd();
    }
  }, [placement, closed]);

  const recordImpression = async (adId: string) => {
    try {
      // In a real app, this would make an API call to record the impression
      console.log(`Recording impression for ad: ${adId}`);
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    try {
      // Record click
      console.log(`Recording click for ad: ${ad.id}`);
      
      // Open link in new tab
      if (ad.clickThroughUrl) {
        window.open(ad.clickThroughUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  const handleClose = () => {
    setClosed(true);
    if (onClose) {
      onClose();
    }
  };

  // Don't render if closed
  if (closed) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-sm">Loading ad...</div>
        </div>
      </div>
    );
  }

  // Show error or fallback
  if (error || !ad) {
    if (fallbackContent) {
      return <div className={className}>{fallbackContent}</div>;
    }
    return null;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Close ad"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Ad content */}
      <div
        onClick={handleClick}
        className="cursor-pointer relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
        style={{
          backgroundImage: `url(${ad.creativeUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '120px'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-200" />
        
        {/* Ad content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="text-white">
            <h3 className="font-bold text-lg mb-1 line-clamp-2">{ad.title}</h3>
            {ad.description && (
              <p className="text-sm opacity-90 line-clamp-2 mb-2">{ad.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-75">{ad.advertiserInfo.name}</span>
              {ad.clickThroughUrl && (
                <ExternalLink className="h-4 w-4 opacity-75" />
              )}
            </div>
          </div>
        </div>

        {/* Ad indicator */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Ad
        </div>
      </div>
    </div>
  );
}; 