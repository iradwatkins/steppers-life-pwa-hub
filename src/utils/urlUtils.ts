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
   * Shorten a URL (placeholder for future integration with URL shortening service)
   */
  static async shortenUrl(url: string): Promise<string> {
    // TODO: Integrate with URL shortening service (bit.ly, tinyurl, etc.)
    // For now, return the original URL
    return url;
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