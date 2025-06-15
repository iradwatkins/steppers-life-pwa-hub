// Meta Tags Hook for Dynamic SEO and Social Sharing
// Created for C-001: Social Media Sharing Tools & Public Event URLs

import { useEffect } from 'react';
import socialSharingService from '@/services/socialSharingService';
import type { EventData } from '@/services/socialSharingService';

interface MetaTagsConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  event?: EventData;
}

export function useMetaTags(config: MetaTagsConfig) {
  useEffect(() => {
    // Store original meta tags to restore later
    const originalTags = new Map<string, string>();
    
    // Helper function to set meta tag
    const setMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) ||
                   document.querySelector(`meta[name="${property}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('event:')) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
      } else {
        // Store original content
        originalTags.set(property, metaTag.getAttribute('content') || '');
      }
      
      metaTag.setAttribute('content', content);
    };

    // Helper function to set page title
    const setTitle = (title: string) => {
      const titleElement = document.querySelector('title');
      if (titleElement) {
        originalTags.set('title', titleElement.textContent || '');
        titleElement.textContent = title;
      }
    };

    // Generate meta tags from event data if provided
    if (config.event) {
      const eventMetaTags = socialSharingService.generateOpenGraphTags(config.event);
      
      // Set page title
      setTitle(config.event.title);
      
      // Set all event-specific meta tags
      Object.entries(eventMetaTags).forEach(([property, content]) => {
        setMetaTag(property, content);
      });
    } else {
      // Set individual meta tags from config
      if (config.title) {
        setTitle(config.title);
        setMetaTag('og:title', config.title);
        setMetaTag('twitter:title', config.title);
      }

      if (config.description) {
        setMetaTag('description', config.description);
        setMetaTag('og:description', config.description);
        setMetaTag('twitter:description', config.description);
      }

      if (config.image) {
        setMetaTag('og:image', config.image);
        setMetaTag('twitter:image', config.image);
      }

      if (config.url) {
        setMetaTag('og:url', config.url);
      }

      if (config.type) {
        setMetaTag('og:type', config.type);
      }

      if (config.siteName) {
        setMetaTag('og:site_name', config.siteName);
      }

      if (config.twitterCard) {
        setMetaTag('twitter:card', config.twitterCard);
      }

      if (config.twitterSite) {
        setMetaTag('twitter:site', config.twitterSite);
      }
    }

    // Cleanup function to restore original meta tags
    return () => {
      originalTags.forEach((originalContent, property) => {
        if (property === 'title') {
          const titleElement = document.querySelector('title');
          if (titleElement) {
            titleElement.textContent = originalContent;
          }
        } else {
          const metaTag = document.querySelector(`meta[property="${property}"]`) ||
                         document.querySelector(`meta[name="${property}"]`);
          if (metaTag) {
            if (originalContent) {
              metaTag.setAttribute('content', originalContent);
            } else {
              metaTag.remove();
            }
          }
        }
      });
    };
  }, [config]);
}

// Specialized hook for event pages
export function useEventMetaTags(event: EventData | null) {
  useMetaTags(event ? { event } : {});
}

// Default meta tags for the application
export const DEFAULT_META_TAGS = {
  title: 'SteppersLife - Premier Stepping Dance Community',
  description: 'Join the premier stepping dance community. Find events, connect with instructors, and experience the art of stepping.',
  image: '/og-default.jpg',
  siteName: 'SteppersLife',
  twitterCard: 'summary_large_image' as const,
  twitterSite: '@stepperslife'
};

// Hook for setting default meta tags
export function useDefaultMetaTags() {
  useMetaTags(DEFAULT_META_TAGS);
}

export default useMetaTags; 