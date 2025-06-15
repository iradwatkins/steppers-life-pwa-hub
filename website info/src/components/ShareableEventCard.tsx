// Shareable Event Card Component
// Created for C-001: Social Media Sharing Tools & Public Event URLs

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Download,
  Share2
} from 'lucide-react';
import { createEventURL } from '@/utils/urlUtils';
import type { EventData } from '@/services/socialSharingService';
import html2canvas from 'html2canvas';

interface ShareableEventCardProps {
  event: EventData;
  variant?: 'instagram-square' | 'instagram-story' | 'facebook-post' | 'twitter-card';
  brandColor?: string;
  onDownload?: (blob: Blob, filename: string) => void;
  className?: string;
}

const CARD_DIMENSIONS = {
  'instagram-square': { width: 1080, height: 1080 },
  'instagram-story': { width: 1080, height: 1920 },
  'facebook-post': { width: 1200, height: 628 },
  'twitter-card': { width: 1200, height: 675 }
};

export function ShareableEventCard({
  event,
  variant = 'instagram-square',
  brandColor = '#7C3AED',
  onDownload,
  className = ''
}: ShareableEventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dimensions = CARD_DIMENSIONS[variant];
  
  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dayOfMonth = eventDate.getDate();
  const monthShort = eventDate.toLocaleDateString('en-US', { month: 'short' });

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Temporarily scale up for high resolution
      const scale = 2;
      const canvas = await html2canvas(cardRef.current, {
        scale,
        backgroundColor: '#ffffff',
        width: dimensions.width / scale,
        height: dimensions.height / scale,
        useCORS: true,
        allowTaint: true
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${variant}.png`;
          
          if (onDownload) {
            onDownload(blob, filename);
          } else {
            // Default download behavior
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  const getCardLayout = () => {
    switch (variant) {
      case 'instagram-story':
        return (
          <div 
            ref={cardRef}
            className={`relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 text-white ${className}`}
            style={{ width: '270px', height: '480px' }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg')] bg-cover bg-center" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {event.category || 'Event'}
                </Badge>
                <h1 className="text-2xl font-bold mb-4 leading-tight">{event.title}</h1>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">{formattedDate}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                )}
                {event.price && (
                  <div className="text-2xl font-bold">
                    From ${event.price}
                  </div>
                )}
                
                <div className="text-xs opacity-75 mt-6">
                  Get tickets at SteppersLife.com
                </div>
              </div>
            </div>
          </div>
        );

      case 'facebook-post':
        return (
          <div 
            ref={cardRef}
            className={`relative overflow-hidden bg-white ${className}`}
            style={{ width: '600px', height: '314px' }}
          >
            <div className="flex h-full">
              {/* Left side - Image */}
              <div className="w-1/2 bg-gray-200 relative">
                <img 
                  src={event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop&auto=format'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    <div>{monthShort}</div>
                    <div className="text-lg leading-none">{dayOfMonth}</div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Content */}
              <div className="w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <Badge className="mb-3" style={{ backgroundColor: brandColor, color: 'white' }}>
                    {event.category || 'Event'}
                  </Badge>
                  <h2 className="text-xl font-bold mb-3 leading-tight text-gray-900">
                    {event.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {event.description || `Join us for ${event.title}!`}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.price && (
                    <div className="flex items-center gap-2 font-semibold">
                      <span>From ${event.price}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'twitter-card':
        return (
          <div 
            ref={cardRef}
            className={`relative overflow-hidden bg-white border border-gray-200 ${className}`}
            style={{ width: '600px', height: '337px' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  SL
                </div>
                <div>
                  <div className="font-semibold text-gray-900">SteppersLife</div>
                  <div className="text-sm text-gray-500">@stepperslife</div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className="text-gray-900 mb-3">
                🕺 Don't miss {event.title}! Join us for an amazing stepping experience.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{event.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.price && (
                    <div className="flex items-center gap-2 font-semibold">
                      <span>From ${event.price}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  stepperslife.com
                </div>
              </div>
            </div>
          </div>
        );

      default: // instagram-square
        return (
          <div 
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            style={{ 
              width: '400px', 
              height: '400px',
              background: `linear-gradient(135deg, ${brandColor}dd, ${brandColor})`
            }}
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {event.category || 'Event'}
                </Badge>
                
                <h1 className="text-2xl font-bold mb-4 leading-tight">
                  {event.title}
                </h1>
                
                {event.description && (
                  <p className="text-sm opacity-90 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4">
                  {event.price && (
                    <div className="text-xl font-bold">
                      From ${event.price}
                    </div>
                  )}
                  <div className="text-xs opacity-75">
                    SteppersLife.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {variant.replace('-', ' ')} Card
        </h3>
        <Button onClick={handleDownload} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div className="flex justify-center">
        {getCardLayout()}
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          {dimensions.width} x {dimensions.height}px
        </div>
        <div className="text-xs text-gray-400">
          Optimized for {variant.replace('-', ' ')}
        </div>
      </div>
    </div>
  );
}

// Multi-variant card gallery
interface ShareableEventCardGalleryProps {
  event: EventData;
  brandColor?: string;
  onDownload?: (blob: Blob, filename: string) => void;
}

export function ShareableEventCardGallery({
  event,
  brandColor = '#7C3AED',
  onDownload
}: ShareableEventCardGalleryProps) {
  const variants: Array<ShareableEventCardProps['variant']> = [
    'instagram-square',
    'instagram-story', 
    'facebook-post',
    'twitter-card'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Shareable Event Cards
        </h2>
        <p className="text-gray-600">
          Download professionally designed cards optimized for each social platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {variants.map((variant) => (
          <ShareableEventCard
            key={variant}
            event={event}
            variant={variant}
            brandColor={brandColor}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}

export default ShareableEventCard; 