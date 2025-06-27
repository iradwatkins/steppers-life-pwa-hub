/**
 * Social Sharing Service
 * Handles sharing events and content to various social media platforms
 */

import { UrlUtils } from '@/utils/urlUtils';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
};

export interface SocialShareOptions {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string; // Twitter handle
}

export interface ShareAnalytics {
  platform: string;
  eventId?: string;
  userId?: string;
  timestamp: Date;
  url: string;
}

export class SocialSharingService {
  private static readonly PLATFORMS = {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    LINKEDIN: 'linkedin',
    INSTAGRAM: 'instagram',
    WHATSAPP: 'whatsapp',
    EMAIL: 'email',
    SMS: 'sms',
    COPY_LINK: 'copy_link'
  };

  /**
   * Share to Facebook
   */
  static shareToFacebook(options: SocialShareOptions): void {
    const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    shareUrl.searchParams.set('u', options.url);
    shareUrl.searchParams.set('quote', options.title);
    
    this.openShareWindow(shareUrl.href, 'facebook');
    this.trackShare('facebook', options.url);
  }

  /**
   * Share to Twitter/X
   */
  static shareToTwitter(options: SocialShareOptions): void {
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    
    let text = options.title;
    if (options.description) {
      text += ' - ' + options.description;
    }
    
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', options.url);
    
    if (options.hashtags && options.hashtags.length > 0) {
      shareUrl.searchParams.set('hashtags', options.hashtags.join(','));
    }
    
    if (options.via) {
      shareUrl.searchParams.set('via', options.via);
    }
    
    this.openShareWindow(shareUrl.href, 'twitter');
    this.trackShare('twitter', options.url);
  }

  /**
   * Share to LinkedIn
   */
  static shareToLinkedIn(options: SocialShareOptions): void {
    const shareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
    shareUrl.searchParams.set('url', options.url);
    
    this.openShareWindow(shareUrl.href, 'linkedin');
    this.trackShare('linkedin', options.url);
  }

  /**
   * Share via WhatsApp
   */
  static shareToWhatsApp(options: SocialShareOptions): void {
    const text = `${options.title}${options.description ? ' - ' + options.description : ''}\n${options.url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    this.openShareWindow(shareUrl, 'whatsapp');
    this.trackShare('whatsapp', options.url);
  }

  /**
   * Share via Email
   */
  static shareViaEmail(options: SocialShareOptions): void {
    const subject = encodeURIComponent(options.title);
    const body = encodeURIComponent(
      `${options.description || options.title}\n\nCheck it out: ${options.url}`
    );
    
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    
    this.trackShare('email', options.url);
  }

  /**
   * Share via SMS
   */
  static shareViaSMS(options: SocialShareOptions): void {
    const text = `${options.title}${options.description ? ' - ' + options.description : ''}\n${options.url}`;
    const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
    
    window.location.href = smsUrl;
    this.trackShare('sms', options.url);
  }

  /**
   * Copy link to clipboard
   */
  static async copyToClipboard(options: SocialShareOptions): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(options.url);
      this.trackShare('copy_link', options.url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Use native Web Share API if available
   */
  static async nativeShare(options: SocialShareOptions): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: options.title,
        text: options.description,
        url: options.url
      });
      
      this.trackShare('native_share', options.url);
      return true;
    } catch (error) {
      console.error('Native share failed:', error);
      return false;
    }
  }

  /**
   * Generate share options for an event
   */
  static generateEventShareOptions(event: Event, source?: string): SocialShareOptions {
    const eventUrl = UrlUtils.createEventShareUrl(event.id, source);
    
    // Generate event hashtags
    const hashtags = ['SteppersLife', 'DanceEvent'];
    if (event.category) {
      hashtags.push(event.category.replace(/\s+/g, ''));
    }
    
    // Format event description
    const description = this.formatEventDescription(event);
    
    return {
      url: eventUrl,
      title: event.title,
      description,
      image: event.featured_image_url || undefined,
      hashtags,
      via: 'SteppersLife'
    };
  }

  /**
   * Format event description for sharing
   */
  private static formatEventDescription(event: Event): string {
    const startDate = new Date(event.start_date);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const location = event.is_online 
      ? 'Online Event'
      : (event.venues as any)?.name || 'Location TBD';
    
    return `Join us ${formattedDate} at ${location}! ${event.short_description || event.description}`;
  }

  /**
   * Get all available share platforms
   */
  static getAvailablePlatforms(): Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }> {
    return [
      {
        id: this.PLATFORMS.FACEBOOK,
        name: 'Facebook',
        icon: 'facebook',
        color: '#1877f2'
      },
      {
        id: this.PLATFORMS.TWITTER,
        name: 'Twitter',
        icon: 'twitter',
        color: '#1da1f2'
      },
      {
        id: this.PLATFORMS.LINKEDIN,
        name: 'LinkedIn',
        icon: 'linkedin',
        color: '#0077b5'
      },
      {
        id: this.PLATFORMS.WHATSAPP,
        name: 'WhatsApp',
        icon: 'message-circle',
        color: '#25d366'
      },
      {
        id: this.PLATFORMS.EMAIL,
        name: 'Email',
        icon: 'mail',
        color: '#6b7280'
      },
      {
        id: this.PLATFORMS.SMS,
        name: 'SMS',
        icon: 'message-square',
        color: '#10b981'
      },
      {
        id: this.PLATFORMS.COPY_LINK,
        name: 'Copy Link',
        icon: 'copy',
        color: '#6b7280'
      }
    ];
  }

  /**
   * Share to specific platform
   */
  static async shareToPlatform(platform: string, options: SocialShareOptions): Promise<boolean> {
    switch (platform) {
      case this.PLATFORMS.FACEBOOK:
        this.shareToFacebook(options);
        return true;
        
      case this.PLATFORMS.TWITTER:
        this.shareToTwitter(options);
        return true;
        
      case this.PLATFORMS.LINKEDIN:
        this.shareToLinkedIn(options);
        return true;
        
      case this.PLATFORMS.WHATSAPP:
        this.shareToWhatsApp(options);
        return true;
        
      case this.PLATFORMS.EMAIL:
        this.shareViaEmail(options);
        return true;
        
      case this.PLATFORMS.SMS:
        this.shareViaSMS(options);
        return true;
        
      case this.PLATFORMS.COPY_LINK:
        return await this.copyToClipboard(options);
        
      default:
        return false;
    }
  }

  /**
   * Open share window
   */
  private static openShareWindow(url: string, name: string): void {
    const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes';
    window.open(url, `share-${name}`, windowFeatures);
  }

  /**
   * Track share analytics with comprehensive data collection
   */
  private static async trackShare(platform: string, url: string, additionalData?: {
    eventId?: string;
    userId?: string;
    shareType?: 'event' | 'profile' | 'general';
  }): Promise<void> {
    try {
      console.log(`📊 Tracking share to ${platform}:`, url);
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Record share event in analytics
      const shareData = {
        platform,
        shared_url: url,
        event_id: additionalData?.eventId,
        user_id: additionalData?.userId,
        share_type: additionalData?.shareType || 'general',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      };

      const { error } = await supabase
        .from('social_shares')
        .insert(shareData);

      if (error) {
        console.error('❌ Error tracking share analytics:', error);
      } else {
        console.log('✅ Share analytics tracked successfully');
      }

      // Also send to real-time analytics if available
      try {
        const analyticsEvent = {
          event_type: 'social_share',
          platform,
          url,
          ...additionalData,
          timestamp: new Date().toISOString()
        };

        // Could integrate with Google Analytics, Mixpanel, etc.
        if (typeof gtag !== 'undefined') {
          gtag('event', 'share', {
            method: platform,
            content_type: additionalData?.shareType || 'general',
            item_id: additionalData?.eventId || url
          });
        }

        // Custom analytics webhook
        if (process.env.REACT_APP_ANALYTICS_WEBHOOK_URL) {
          fetch(process.env.REACT_APP_ANALYTICS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(analyticsEvent)
          }).catch(err => console.warn('⚠️ Analytics webhook failed:', err));
        }

      } catch (analyticsError) {
        console.warn('⚠️ External analytics tracking failed:', analyticsError);
      }

    } catch (error) {
      console.error('❌ Error in trackShare:', error);
    }
  }

  /**
   * Generate Open Graph meta tags for better social sharing
   */
  static generateOpenGraphTags(event: Event): Array<{
    property: string;
    content: string;
  }> {
    const eventUrl = UrlUtils.createEventShareUrl(event.id);
    
    return [
      { property: 'og:type', content: 'event' },
      { property: 'og:title', content: event.title },
      { property: 'og:description', content: this.formatEventDescription(event) },
      { property: 'og:url', content: eventUrl },
      { property: 'og:site_name', content: 'Steppers Life' },
      ...(event.featured_image_url ? [
        { property: 'og:image', content: event.featured_image_url },
        { property: 'og:image:alt', content: event.title }
      ] : []),
      // Event-specific Open Graph properties
      { property: 'event:start_time', content: event.start_date },
      { property: 'event:end_time', content: event.end_date },
      ...(event.venues && !event.is_online ? [
        { property: 'event:location', content: (event.venues as any).name }
      ] : [])
    ];
  }

  /**
   * Generate Twitter Card meta tags
   */
  static generateTwitterCardTags(event: Event): Array<{
    name: string;
    content: string;
  }> {
    return [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@SteppersLife' },
      { name: 'twitter:title', content: event.title },
      { name: 'twitter:description', content: this.formatEventDescription(event) },
      ...(event.featured_image_url ? [
        { name: 'twitter:image', content: event.featured_image_url },
        { name: 'twitter:image:alt', content: event.title }
      ] : [])
    ];
  }
}

export default SocialSharingService;