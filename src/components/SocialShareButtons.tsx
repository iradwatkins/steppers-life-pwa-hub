/**
 * SocialShareButtons Component
 * Reusable social sharing buttons with multiple layout options
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  MessageCircle,
  Mail,
  MessageSquare,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { SocialSharingService, type SocialShareOptions } from '@/services/socialSharingService';

interface SocialShareButtonsProps {
  shareOptions: SocialShareOptions;
  variant?: 'inline' | 'popover' | 'modal' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxButtons?: number;
  className?: string;
  buttonStyle?: 'default' | 'outline' | 'ghost';
  trigger?: React.ReactNode;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  shareOptions,
  variant = 'inline',
  size = 'md',
  showLabels = true,
  maxButtons = 6,
  className = '',
  buttonStyle = 'outline',
  trigger
}) => {
  const [isNativeShareSupported] = useState(() => !!navigator.share);
  const [copiedLink, setCopiedLink] = useState(false);

  const platforms = SocialSharingService.getAvailablePlatforms().slice(0, maxButtons);

  const handleShare = async (platform: string) => {
    try {
      // Try native share first if available and requested
      if (platform === 'native' && isNativeShareSupported) {
        const success = await SocialSharingService.nativeShare(shareOptions);
        if (success) {
          toast.success('Shared successfully!');
          return;
        }
      }

      // Handle copy link specially
      if (platform === 'copy_link') {
        const success = await SocialSharingService.copyToClipboard(shareOptions);
        if (success) {
          setCopiedLink(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopiedLink(false), 2000);
        } else {
          toast.error('Failed to copy link');
        }
        return;
      }

      // Use platform-specific sharing
      const success = await SocialSharingService.shareToPlatform(platform, shareOptions);
      if (success) {
        toast.success(`Shared to ${platform}!`);
      } else {
        toast.error(`Failed to share to ${platform}`);
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  const getIcon = (platformId: string) => {
    switch (platformId) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'copy_link':
        return copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const renderShareButton = (platform: any) => (
    <Button
      key={platform.id}
      variant={buttonStyle}
      size={size}
      onClick={() => handleShare(platform.id)}
      className={`${getSizeClass()} ${
        platform.id === 'copy_link' && copiedLink ? 'bg-green-50 border-green-200' : ''
      }`}
      style={{ 
        borderColor: platform.color + '20',
        color: platform.color 
      }}
    >
      {getIcon(platform.id)}
      {showLabels && !copiedLink && (
        <span className="ml-2">{platform.name}</span>
      )}
      {copiedLink && platform.id === 'copy_link' && showLabels && (
        <span className="ml-2">Copied!</span>
      )}
    </Button>
  );

  const ShareContent = () => (
    <div className="space-y-4">
      {/* Native share button if supported */}
      {isNativeShareSupported && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleShare('native')}
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share via System
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or share to</span>
            </div>
          </div>
        </>
      )}

      {/* Platform buttons */}
      <div className={`grid gap-2 ${
        variant === 'inline' 
          ? 'grid-cols-2 sm:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {platforms.map(renderShareButton)}
      </div>

      {/* Share URL display */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground mb-2">Share this link:</p>
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <code className="flex-1 text-xs truncate">{shareOptions.url}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('copy_link')}
            className="h-6 w-6 p-0"
          >
            {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );

  // Inline variant - show buttons directly
  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {platforms.map(renderShareButton)}
      </div>
    );
  }

  // Icon-only variant - just show share icon that opens popover
  if (variant === 'icon-only') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {trigger || (
            <Button variant={buttonStyle} size={size} className={className}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Share Event</h4>
              <p className="text-sm text-muted-foreground">
                {shareOptions.title}
              </p>
            </div>
            <ShareContent />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Popover variant
  if (variant === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {trigger || (
            <Button variant={buttonStyle} size={size} className={className}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <ShareContent />
        </PopoverContent>
      </Popover>
    );
  }

  // Modal variant
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={buttonStyle} size={size} className={className}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>
            {shareOptions.title}
          </DialogDescription>
        </DialogHeader>
        <ShareContent />
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareButtons;