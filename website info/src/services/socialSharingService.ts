// Social Sharing Service
// Created for C-001: Social Media Sharing Tools & Public Event URLs

import { createEventURL, createTicketURL, addTrackingParams, createShortURL } from '@/utils/urlUtils';

export interface EventData {
  id: number | string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  city?: string;
  state?: string;
  price?: number;
  description?: string;
  image?: string;
  category?: string;
  organizer?: string;
}

export interface ShareOptions {
  platform: SocialPlatform;
  campaign?: string;
  useShortUrl?: boolean;
  customMessage?: string;
}

export type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'instagram' | 'email' | 'copy';

interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  shareUrl: string;
  characterLimit?: number;
  supportsHashtags: boolean;
}

// Platform configurations
const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  facebook: {
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}',
    supportsHashtags: false
  },
  twitter: {
    name: 'Twitter',
    icon: 'Twitter',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet?text={text}&url={url}',
    characterLimit: 280,
    supportsHashtags: true
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0A66C2',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/?url={url}',
    supportsHashtags: false
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: 'MessageCircle',
    color: '#25D366',
    shareUrl: 'https://wa.me/?text={text}%20{url}',
    characterLimit: 4096,
    supportsHashtags: false
  },
  instagram: {
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    shareUrl: '', // Instagram doesn't support direct URL sharing
    supportsHashtags: true
  },
  email: {
    name: 'Email',
    icon: 'Mail',
    color: '#6B7280',
    shareUrl: 'mailto:?subject={subject}&body={body}',
    supportsHashtags: false
  },
  copy: {
    name: 'Copy Link',
    icon: 'Copy',
    color: '#6B7280',
    shareUrl: '',
    supportsHashtags: false
  }
};

class SocialSharingService {
  /**
   * Generates sharing templates for different platforms
   */
  generateShareText(event: EventData, platform: SocialPlatform, customMessage?: string): string {
    if (customMessage) return customMessage;

    const { title, date, location, city, state, price } = event;
    const dateStr = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const locationStr = location ? `${location}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}` : '';
    const priceStr = price ? `Tickets from $${price}` : '';

    const templates: Record<SocialPlatform, string> = {
      facebook: `🕺 Don't miss ${title}! Join us on ${dateStr}${locationStr ? ` at ${locationStr}` : ''}. ${priceStr}`,
      
      twitter: `🕺 ${title}\n📅 ${dateStr}\n📍 ${locationStr}\n💰 ${priceStr}\n\n#stepping #dance #event${city ? ` #${city.replace(/\s+/g, '')}` : ''}`,
      
      linkedin: `Excited to share this upcoming stepping event: ${title}. Join us on ${dateStr}${locationStr ? ` at ${locationStr}` : ''}. ${priceStr}`,
      
      whatsapp: `🕺 *${title}*\n\n📅 ${dateStr}\n📍 ${locationStr}\n💰 ${priceStr}\n\nJoin us for an amazing stepping experience!`,
      
      instagram: `🕺 ${title}\n📅 ${dateStr}\n📍 ${locationStr}\n💰 ${priceStr}\n\n#stepping #dance #event #stepperslife${city ? ` #${city.replace(/\s+/g, '').toLowerCase()}` : ''}`,
      
      email: `${title} - ${dateStr}`,
      
      copy: `${title} - ${dateStr}${locationStr ? ` at ${locationStr}` : ''}`
    };

    const text = templates[platform] || templates.copy;
    
    // Respect character limits
    const config = PLATFORM_CONFIGS[platform];
    if (config.characterLimit && text.length > config.characterLimit) {
      return text.substring(0, config.characterLimit - 3) + '...';
    }
    
    return text;
  }

  /**
   * Generates hashtags for an event based on platform support
   */
  generateHashtags(event: EventData, platform: SocialPlatform): string[] {
    const config = PLATFORM_CONFIGS[platform];
    if (!config.supportsHashtags) return [];

    const hashtags = ['stepping', 'dance', 'event', 'stepperslife'];
    
    if (event.category) {
      hashtags.push(event.category.toLowerCase().replace(/\s+/g, ''));
    }
    
    if (event.city) {
      hashtags.push(event.city.toLowerCase().replace(/\s+/g, ''));
    }
    
    return hashtags.map(tag => `#${tag}`);
  }

  /**
   * Creates a share URL for a specific platform
   */
  createShareURL(event: EventData, options: ShareOptions): string {
    const { platform, campaign, useShortUrl } = options;
    const config = PLATFORM_CONFIGS[platform];
    
    // Get event URL with tracking
    let eventUrl = createEventURL(event);
    eventUrl = addTrackingParams(eventUrl, platform, campaign, 'share_button');
    
    if (useShortUrl) {
      eventUrl = createShortURL(eventUrl, campaign);
    }

    // Handle special cases
    if (platform === 'copy' || platform === 'instagram') {
      return eventUrl;
    }

    if (platform === 'email') {
      const subject = encodeURIComponent(this.generateShareText(event, 'email', options.customMessage));
      const body = encodeURIComponent(
        `${this.generateShareText(event, 'whatsapp', options.customMessage)}\n\nGet your tickets: ${eventUrl}`
      );
      return config.shareUrl.replace('{subject}', subject).replace('{body}', body);
    }

    // Build share URL
    const shareText = encodeURIComponent(this.generateShareText(event, platform, options.customMessage));
    const encodedUrl = encodeURIComponent(eventUrl);
    
    let shareUrl = config.shareUrl;
    shareUrl = shareUrl.replace('{text}', shareText);
    shareUrl = shareUrl.replace('{url}', encodedUrl);
    
    return shareUrl;
  }

  /**
   * Opens a share dialog for desktop platforms
   */
  openShareDialog(shareUrl: string, platform: SocialPlatform): void {
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      shareUrl, 
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }

  /**
   * Uses the Web Share API if available, fallback to custom dialog
   */
  async share(event: EventData, options: ShareOptions): Promise<boolean> {
    const { platform } = options;
    
    // Handle copy to clipboard
    if (platform === 'copy') {
      return this.copyToClipboard(event, options);
    }
    
    // Try Web Share API first (mobile)
    if (navigator.share && platform !== 'instagram') {
      try {
        const eventUrl = createEventURL(event);
        const text = this.generateShareText(event, platform, options.customMessage);
        
        await navigator.share({
          title: event.title,
          text: text,
          url: eventUrl
        });
        
        return true;
      } catch (error) {
        // User cancelled or API not supported, fall back to custom sharing
        console.log('Web Share API failed, using fallback:', error);
      }
    }
    
    // Fallback to platform-specific sharing
    const shareUrl = this.createShareURL(event, options);
    
    if (platform === 'instagram') {
      // Instagram requires manual copying
      await this.copyToClipboard(event, { ...options, platform: 'copy' });
      alert('Link copied! Please paste it in your Instagram post or story.');
      return true;
    }
    
    this.openShareDialog(shareUrl, platform);
    return true;
  }

  /**
   * Copies event URL and text to clipboard
   */
  async copyToClipboard(event: EventData, options: ShareOptions): Promise<boolean> {
    try {
      const eventUrl = createEventURL(event);
      const text = this.generateShareText(event, 'copy', options.customMessage);
      const shareContent = `${text}\n\n${eventUrl}`;
      
      await navigator.clipboard.writeText(shareContent);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generates Open Graph meta tags for an event
   */
  generateOpenGraphTags(event: EventData): Record<string, string> {
    const eventUrl = createEventURL(event);
    const description = event.description || 
      `Join us for ${event.title} on ${new Date(event.date).toLocaleDateString()}${event.location ? ` at ${event.location}` : ''}`;
    
    return {
      'og:type': 'event',
      'og:title': event.title,
      'og:description': description,
      'og:url': eventUrl,
      'og:image': event.image || '/placeholder.svg',
      'og:site_name': 'SteppersLife',
      
      // Event-specific Open Graph tags
      'event:start_time': new Date(event.date).toISOString(),
      'event:location:name': event.location || '',
      'event:location:locality': event.city || '',
      'event:location:region': event.state || '',
      
      // Twitter Card tags
      'twitter:card': 'summary_large_image',
      'twitter:site': '@stepperslife',
      'twitter:title': event.title,
      'twitter:description': description,
      'twitter:image': event.image || '/placeholder.svg',
    };
  }

  /**
   * Gets platform configuration
   */
  getPlatformConfig(platform: SocialPlatform): PlatformConfig {
    return PLATFORM_CONFIGS[platform];
  }

  /**
   * Gets all available platforms
   */
  getAvailablePlatforms(): SocialPlatform[] {
    return Object.keys(PLATFORM_CONFIGS) as SocialPlatform[];
  }

  /**
   * Tracks sharing event (placeholder for analytics)
   */
  trackShareEvent(event: EventData, platform: SocialPlatform, campaign?: string): void {
    // Placeholder for analytics tracking
    console.log('Share tracked:', {
      eventId: event.id,
      eventTitle: event.title,
      platform,
      campaign,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, this would send to analytics service
    // Example: analytics.track('event_shared', { ... })
  }
}

// Singleton instance
export const socialSharingService = new SocialSharingService();
export default socialSharingService; 