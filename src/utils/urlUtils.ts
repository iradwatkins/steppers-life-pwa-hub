/**
 * URL utility functions for social sharing and URL management
 */

export interface ShareableUrl {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
}

export class UrlUtils {
  /**
   * Get the current page URL with optional parameters
   */
  static getCurrentUrl(params?: Record<string, string>): string {
    const baseUrl = window.location.origin + window.location.pathname;
    
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }
    
    const searchParams = new URLSearchParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Create a shareable URL for an event
   */
  static createEventShareUrl(eventId: string, source?: string): string {
    const baseUrl = `${window.location.origin}/events/${eventId}`;
    
    if (source) {
      return `${baseUrl}?utm_source=${encodeURIComponent(source)}&utm_medium=social&utm_campaign=event_share`;
    }
    
    return baseUrl;
  }

  /**
   * Validate if a URL is valid
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean and normalize a URL
   */
  static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch {
      return url;
    }
  }

  /**
   * Extract domain from URL
   */
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  /**
   * Generate URL with tracking parameters
   */
  static addTrackingParams(
    url: string, 
    params: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
    }
  ): string {
    try {
      const urlObj = new URL(url);
      
      if (params.source) urlObj.searchParams.set('utm_source', params.source);
      if (params.medium) urlObj.searchParams.set('utm_medium', params.medium);
      if (params.campaign) urlObj.searchParams.set('utm_campaign', params.campaign);
      if (params.content) urlObj.searchParams.set('utm_content', params.content);
      
      return urlObj.href;
    } catch {
      return url;
    }
  }

  /**
   * Create a deep link URL for mobile apps
   */
  static createDeepLink(
    path: string, 
    fallbackUrl?: string,
    appScheme: string = 'stepperslife'
  ): string {
    const deepLink = `${appScheme}://${path}`;
    
    if (fallbackUrl) {
      // Create a universal link that falls back to web if app isn't installed
      return `https://steppers-life.com/app-redirect?deep=${encodeURIComponent(deepLink)}&fallback=${encodeURIComponent(fallbackUrl)}`;
    }
    
    return deepLink;
  }

  /**
   * Shorten a URL using integrated URL shortening service
   */
  static async shortenUrl(url: string, customAlias?: string): Promise<{
    shortUrl: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
    expiresAt?: string;
  }> {
    try {
      // Use internal shortening service first (for SteppersLife domains)
      if (url.includes('stepperslife.com')) {
        const internalShort = await this.createInternalShortUrl(url, customAlias);
        if (internalShort) {
          return internalShort;
        }
      }

      // Fallback to external service (Bitly integration)
      return await this.createExternalShortUrl(url, customAlias);
    } catch (error) {
      console.error('❌ Error shortening URL:', error);
      // Fallback: return original URL in expected format
      return {
        shortUrl: url,
        originalUrl: url,
        clicks: 0,
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Create internal short URL for SteppersLife content
   */
  private static async createInternalShortUrl(url: string, customAlias?: string): Promise<{
    shortUrl: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
  } | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Generate unique short code
      let shortCode = customAlias;
      if (!shortCode) {
        shortCode = this.generateShortCode();
        
        // Ensure uniqueness
        let attempts = 0;
        while (attempts < 5) {
          const { data: existing } = await supabase
            .from('short_urls')
            .select('id')
            .eq('short_code', shortCode)
            .single();
          
          if (!existing) break;
          
          shortCode = this.generateShortCode();
          attempts++;
        }
      }

      // Create short URL record
      const { data, error } = await supabase
        .from('short_urls')
        .insert({
          short_code: shortCode,
          original_url: url,
          clicks: 0,
          created_at: new Date().toISOString(),
          expires_at: null, // No expiration for internal URLs
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating internal short URL:', error);
        return null;
      }

      return {
        shortUrl: `https://stpl.life/${shortCode}`,
        originalUrl: url,
        clicks: 0,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('❌ Error in createInternalShortUrl:', error);
      return null;
    }
  }

  /**
   * Create external short URL using Bitly or similar service
   */
  private static async createExternalShortUrl(url: string, customAlias?: string): Promise<{
    shortUrl: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
  }> {
    try {
      // This would integrate with Bitly API
      // For now, simulate the response
      const shortCode = customAlias || this.generateShortCode();
      
      // In real implementation, make API call to Bitly:
      // const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${BITLY_ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     long_url: url,
      //     custom_bitlinks: customAlias ? [`bit.ly/${customAlias}`] : undefined
      //   })
      // });
      
      // For simulation:
      const shortUrl = `https://bit.ly/${shortCode}`;
      
      // Store reference in our database for analytics
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('external_short_urls')
          .insert({
            short_url: shortUrl,
            original_url: url,
            provider: 'bitly',
            clicks: 0,
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.warn('⚠️ Failed to store external short URL reference:', dbError);
      }

      return {
        shortUrl,
        originalUrl: url,
        clicks: 0,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error creating external short URL:', error);
      throw error;
    }
  }

  /**
   * Generate a unique short code
   */
  private static generateShortCode(length: number = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Resolve a short URL and track the click
   */
  static async resolveShortUrl(shortCode: string, metadata?: {
    userAgent?: string;
    referrer?: string;
    ipAddress?: string;
  }): Promise<string | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get the short URL record
      const { data: shortUrl, error } = await supabase
        .from('short_urls')
        .select('*')
        .eq('short_code', shortCode)
        .eq('is_active', true)
        .single();

      if (error || !shortUrl) {
        console.log('🔍 Short URL not found:', shortCode);
        return null;
      }

      // Check if expired
      if (shortUrl.expires_at && new Date(shortUrl.expires_at) < new Date()) {
        console.log('⏰ Short URL expired:', shortCode);
        return null;
      }

      // Increment click count
      const { error: updateError } = await supabase
        .from('short_urls')
        .update({
          clicks: (shortUrl.clicks || 0) + 1,
          last_clicked_at: new Date().toISOString()
        })
        .eq('id', shortUrl.id);

      if (updateError) {
        console.warn('⚠️ Failed to update click count:', updateError);
      }

      // Log click analytics
      try {
        await supabase
          .from('short_url_clicks')
          .insert({
            short_url_id: shortUrl.id,
            clicked_at: new Date().toISOString(),
            user_agent: metadata?.userAgent,
            referrer: metadata?.referrer,
            ip_address: metadata?.ipAddress
          });
      } catch (analyticsError) {
        console.warn('⚠️ Failed to log click analytics:', analyticsError);
      }

      console.log('✅ Short URL resolved:', shortCode, '->', shortUrl.original_url);
      return shortUrl.original_url;
    } catch (error) {
      console.error('❌ Error resolving short URL:', error);
      return null;
    }
  }

  /**
   * Get analytics for a short URL
   */
  static async getShortUrlAnalytics(shortCode: string): Promise<{
    totalClicks: number;
    uniqueClicks: number;
    clicksByDate: Array<{ date: string; clicks: number }>;
    referrers: Array<{ referrer: string; clicks: number }>;
    devices: Array<{ device: string; clicks: number }>;
  } | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get short URL
      const { data: shortUrl, error: urlError } = await supabase
        .from('short_urls')
        .select('id, clicks')
        .eq('short_code', shortCode)
        .single();

      if (urlError || !shortUrl) {
        return null;
      }

      // Get click analytics
      const { data: clicks, error: clicksError } = await supabase
        .from('short_url_clicks')
        .select('*')
        .eq('short_url_id', shortUrl.id)
        .order('clicked_at', { ascending: true });

      if (clicksError) {
        console.error('❌ Error fetching click analytics:', clicksError);
        return null;
      }

      // Process analytics
      const uniqueIPs = new Set(clicks?.map(c => c.ip_address).filter(Boolean));
      
      const clicksByDate = clicks?.reduce((acc: Record<string, number>, click) => {
        const date = new Date(click.clicked_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      const referrerCounts = clicks?.reduce((acc: Record<string, number>, click) => {
        const referrer = click.referrer || 'Direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalClicks: shortUrl.clicks || 0,
        uniqueClicks: uniqueIPs.size,
        clicksByDate: Object.entries(clicksByDate).map(([date, clicks]) => ({
          date,
          clicks: clicks as number
        })),
        referrers: Object.entries(referrerCounts).map(([referrer, clicks]) => ({
          referrer,
          clicks: clicks as number
        })),
        devices: [] // Could extract from user agent if needed
      };
    } catch (error) {
      console.error('❌ Error getting short URL analytics:', error);
      return null;
    }
  }

  /**
   * Generate QR code URL for a given URL
   */
  static generateQrCodeUrl(url: string, size: number = 200): string {
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
  }

  /**
   * Parse URL parameters into an object
   */
  static parseUrlParams(url?: string): Record<string, string> {
    const targetUrl = url || window.location.href;
    const params: Record<string, string> = {};
    
    try {
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch {
      // Fallback for invalid URLs
    }
    
    return params;
  }

  /**
   * Check if the current page is being shared from social media
   */
  static isFromSocialShare(): boolean {
    const params = this.parseUrlParams();
    return !!(params.utm_source && params.utm_medium === 'social');
  }

  /**
   * Get the social source if available
   */
  static getSocialSource(): string | null {
    const params = this.parseUrlParams();
    if (params.utm_source && params.utm_medium === 'social') {
      return params.utm_source;
    }
    return null;
  }
}

export default UrlUtils;