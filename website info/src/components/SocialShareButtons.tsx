// Social Share Buttons Component
// Created for C-001: Social Media Sharing Tools & Public Event URLs

import React, { useState } from 'react';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Instagram, 
  Mail, 
  Copy, 
  Share2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import socialSharingService, { 
  type EventData, 
  type SocialPlatform 
} from '@/services/socialSharingService';

interface SocialShareButtonsProps {
  event: EventData;
  campaign?: string;
  useShortUrl?: boolean;
  customMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  orientation?: 'horizontal' | 'vertical';
  platforms?: SocialPlatform[];
  showLabels?: boolean;
  className?: string;
}

const PLATFORM_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  instagram: Instagram,
  email: Mail,
  copy: Copy
} as const;

export function SocialShareButtons({
  event,
  campaign,
  useShortUrl = false,
  customMessage,
  size = 'md',
  variant = 'default',
  orientation = 'horizontal',
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'copy'],
  showLabels = false,
  className = ''
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<SocialPlatform | null>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const handleShare = async (platform: SocialPlatform) => {
    setSharing(platform);
    
    try {
      const success = await socialSharingService.share(event, {
        platform,
        campaign,
        useShortUrl,
        customMessage
      });

      if (success && platform === 'copy') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }

      // Track the sharing event
      socialSharingService.trackShareEvent(event, platform, campaign);
      
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setSharing(null);
    }
  };

  const renderButton = (platform: SocialPlatform) => {
    const config = socialSharingService.getPlatformConfig(platform);
    const IconComponent = PLATFORM_ICONS[platform];
    const isLoading = sharing === platform;
    const isCopied = platform === 'copy' && copied;
    
    const baseClasses = `
      ${sizeClasses[size]} 
      ${showLabels ? 'px-4 justify-start gap-2' : 'p-0 justify-center'}
      transition-all duration-200 hover:scale-105 
      ${variant === 'minimal' ? 'border-0 shadow-none hover:shadow-md' : ''}
    `;

    // Enhanced styling for better dark mode support
    const buttonStyle = variant === 'default' ? {
      backgroundColor: config.color,
      color: 'white',
      borderColor: config.color
    } : {};

    // Dark mode aware icon styling
    const iconClasses = `h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`;
    
    // Determine icon color based on variant and mode
    const getIconStyle = () => {
      if (variant === 'outline') {
        // For outline variant, use platform color in light mode, white in dark mode
        return { color: 'currentColor' };
      } else if (variant === 'default') {
        // For default variant, always use white for good contrast
        return { color: 'white' };
      } else {
        // Minimal variant - let it inherit
        return { color: 'currentColor' };
      }
    };

    const buttonContent = (
      <>
        {isCopied ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <IconComponent 
            className={`${iconClasses} ${variant === 'outline' ? 'text-gray-700 dark:text-white' : ''}`}
            style={variant === 'outline' ? {} : getIconStyle()}
          />
        )}
        {showLabels && (
          <span className="text-sm font-medium dark:text-white">
            {isCopied ? 'Copied!' : config.name}
          </span>
        )}
      </>
    );

    return (
      <TooltipProvider key={platform}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant === 'default' ? 'default' : 'outline'}
              size={showLabels ? 'default' : 'icon'}
              className={`${baseClasses} ${variant === 'outline' ? 'dark:border-gray-600 dark:hover:bg-gray-700' : ''}`}
              style={buttonStyle}
              onClick={() => handleShare(platform)}
              disabled={isLoading}
              aria-label={`Share on ${config.name}`}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on {config.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div 
      className={`
        flex gap-2 
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'} 
        ${className}
      `}
    >
      {platforms.map(renderButton)}
    </div>
  );
}

// Compact Share Button with dropdown
interface CompactShareButtonProps {
  event: EventData;
  campaign?: string;
  useShortUrl?: boolean;
  customMessage?: string;
  platforms?: SocialPlatform[];
}

export function CompactShareButton({
  event,
  campaign,
  useShortUrl = false,
  customMessage,
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'copy']
}: CompactShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Try Web Share API first on mobile
  const handleQuickShare = async () => {
    if (navigator.share) {
      try {
        await socialSharingService.share(event, {
          platform: 'copy', // Web Share API will handle platform selection
          campaign,
          useShortUrl,
          customMessage
        });
        return;
      } catch (error) {
        console.log('Web Share API failed, showing options');
      }
    }
    
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickShare}
        className="gap-2 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown - Enhanced for dark mode */}
          <div className="absolute top-full right-0 z-50 mt-1 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg min-w-[200px]">
            <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Share this event</h3>
            <SocialShareButtons
              event={event}
              campaign={campaign}
              useShortUrl={useShortUrl}
              customMessage={customMessage}
              platforms={platforms}
              size="sm"
              variant="outline"
              orientation="vertical"
              showLabels={true}
              className="gap-2"
            />
          </div>
        </>
      )}
    </div>
  );
}

// Floating Share Button for mobile
interface FloatingShareButtonProps {
  event: EventData;
  campaign?: string;
  platforms?: SocialPlatform[];
}

export function FloatingShareButton({
  event,
  campaign,
  platforms = ['facebook', 'twitter', 'whatsapp', 'copy']
}: FloatingShareButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      {isExpanded && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600">
          <SocialShareButtons
            event={event}
            campaign={campaign}
            platforms={platforms}
            size="md"
            variant="outline"
            orientation="vertical"
            className="gap-2"
          />
        </div>
      )}
      
      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg dark:shadow-gray-900/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Share2 className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default SocialShareButtons; 