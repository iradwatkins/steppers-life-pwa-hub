// URL Utilities for Social Sharing and SEO
// Created for C-001: Social Media Sharing Tools & Public Event URLs

/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @param maxLength Maximum length of the slug (default: 50)
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .trim()
    // Remove special characters and replace with hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace whitespace and multiple hyphens with single hyphens
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, maxLength)
    // Remove trailing hyphen if truncated
    .replace(/-+$/, '');
}

/**
 * Generates a unique event slug from event data
 * @param event Event object with title, date, and optional location
 * @returns A unique, SEO-friendly event slug
 */
export function generateEventSlug(event: {
  title: string;
  date: string;
  location?: string;
  id?: number | string;
}): string {
  const titleSlug = generateSlug(event.title, 30);
  const year = new Date(event.date).getFullYear();
  const locationSlug = event.location ? `-${generateSlug(event.location, 15)}` : '';
  
  // Format: event-title-2025-location or event-title-2025
  return `${titleSlug}-${year}${locationSlug}`;
}

/**
 * Creates a public event URL from event data
 * @param event Event object
 * @param baseUrl Base URL of the site (optional, defaults to current origin)
 * @returns Complete public event URL
 */
export function createEventURL(
  event: { title: string; date: string; location?: string; id?: number | string },
  baseUrl?: string
): string {
  const slug = generateEventSlug(event);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/event/${slug}`;
}

/**
 * Creates a ticket purchase URL for an event
 * @param event Event object
 * @param baseUrl Base URL of the site (optional, defaults to current origin)
 * @returns Complete ticket purchase URL
 */
export function createTicketURL(
  event: { title: string; date: string; location?: string; id?: number | string },
  baseUrl?: string
): string {
  const slug = generateEventSlug(event);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/event/${slug}/tickets`;
}

/**
 * Extracts event information from a slug
 * @param slug The event slug to parse
 * @returns Parsed event information or null if invalid
 */
export function parseEventSlug(slug: string): { 
  titleSlug: string; 
  year: number; 
  locationSlug?: string; 
} | null {
  // Match pattern: title-YYYY or title-YYYY-location
  const match = slug.match(/^(.+)-(\d{4})(?:-(.+))?$/);
  
  if (!match) return null;
  
  const [, titleSlug, yearStr, locationSlug] = match;
  const year = parseInt(yearStr, 10);
  
  if (year < 2000 || year > 2100) return null;
  
  return {
    titleSlug,
    year,
    locationSlug: locationSlug || undefined
  };
}

/**
 * Validates if a slug is well-formed
 * @param slug The slug to validate
 * @returns True if the slug is valid
 */
export function validateSlug(slug: string): boolean {
  // Check if slug matches expected pattern and length
  return /^[a-z0-9-]+$/.test(slug) && 
         slug.length >= 3 && 
         slug.length <= 60 &&
         !slug.startsWith('-') && 
         !slug.endsWith('-') &&
         !slug.includes('--');
}

/**
 * Creates a shortened URL for social media sharing
 * @param originalUrl The original URL to shorten
 * @param campaign Optional campaign identifier
 * @returns Shortened URL with tracking
 */
export function createShortURL(originalUrl: string, campaign?: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const shortId = Math.random().toString(36).substring(2, 8);
  
  // In a real implementation, this would save to a database
  // For now, we'll use a simple format
  let shortUrl = `${base}/s/${shortId}`;
  
  if (campaign) {
    shortUrl += `?utm_campaign=${encodeURIComponent(campaign)}`;
  }
  
  return shortUrl;
}

/**
 * Adds tracking parameters to URLs for social media campaigns
 * @param url The base URL
 * @param source Social media platform (facebook, twitter, etc.)
 * @param campaign Campaign identifier
 * @param content Optional content identifier
 * @returns URL with UTM parameters
 */
export function addTrackingParams(
  url: string, 
  source: string, 
  campaign?: string, 
  content?: string
): string {
  const urlObj = new URL(url);
  
  urlObj.searchParams.set('utm_source', source);
  urlObj.searchParams.set('utm_medium', 'social');
  
  if (campaign) {
    urlObj.searchParams.set('utm_campaign', campaign);
  }
  
  if (content) {
    urlObj.searchParams.set('utm_content', content);
  }
  
  return urlObj.toString();
}

/**
 * Legacy URL redirect mapping
 * Maps old event URLs to new slug-based URLs
 */
export const legacyUrlRedirects: Record<string, string> = {
  '/event/1': '/event/chicago-step-championship-2024-chicago',
  '/event/2': '/event/beginner-step-workshop-2024-atlanta',
  // Add more mappings as needed
};

/**
 * Gets the new URL for a legacy event URL
 * @param legacyUrl The old event URL
 * @returns New slug-based URL or null if no mapping exists
 */
export function getLegacyRedirect(legacyUrl: string): string | null {
  return legacyUrlRedirects[legacyUrl] || null;
} 