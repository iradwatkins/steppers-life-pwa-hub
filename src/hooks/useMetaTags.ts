/**
 * useMetaTags Hook
 * Manages dynamic meta tags for social sharing and SEO
 */

import { useEffect } from 'react';
import { SocialSharingService } from '@/services/socialSharingService';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
};

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  key?: string;
}

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterCard?: string;
  twitterSite?: string;
}

export const useMetaTags = (options?: MetaTagsOptions) => {
  useEffect(() => {
    if (!options) return;

    // Store original meta tags to restore later
    const originalTags = new Map<string, string>();
    
    // Helper function to set or update a meta tag
    const setMetaTag = (tag: MetaTag) => {
      const key = tag.key || (tag.name || tag.property);
      if (!key) return;

      const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (tag.name) element.name = tag.name;
        if (tag.property) element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      } else {
        // Store original content for cleanup
        originalTags.set(key, element.content);
      }
      
      element.content = tag.content;
    };

    // Set title
    if (options.title) {
      const originalTitle = document.title;
      document.title = options.title;
      
      // Store original title for cleanup
      originalTags.set('title', originalTitle);
    }

    // Set description
    if (options.description) {
      setMetaTag({
        name: 'description',
        content: options.description,
        key: 'description'
      });
    }

    // Set Open Graph tags
    const ogTags: MetaTag[] = [];
    
    if (options.title) {
      ogTags.push({ property: 'og:title', content: options.title });
    }
    
    if (options.description) {
      ogTags.push({ property: 'og:description', content: options.description });
    }
    
    if (options.image) {
      ogTags.push({ property: 'og:image', content: options.image });
    }
    
    if (options.url) {
      ogTags.push({ property: 'og:url', content: options.url });
    }
    
    if (options.type) {
      ogTags.push({ property: 'og:type', content: options.type });
    }
    
    if (options.siteName) {
      ogTags.push({ property: 'og:site_name', content: options.siteName });
    }

    // Set Twitter Card tags
    const twitterTags: MetaTag[] = [];
    
    if (options.twitterCard) {
      twitterTags.push({ name: 'twitter:card', content: options.twitterCard });
    }
    
    if (options.twitterSite) {
      twitterTags.push({ name: 'twitter:site', content: options.twitterSite });
    }
    
    if (options.title) {
      twitterTags.push({ name: 'twitter:title', content: options.title });
    }
    
    if (options.description) {
      twitterTags.push({ name: 'twitter:description', content: options.description });
    }
    
    if (options.image) {
      twitterTags.push({ name: 'twitter:image', content: options.image });
    }

    // Apply all meta tags
    [...ogTags, ...twitterTags].forEach(setMetaTag);

    // Cleanup function to restore original meta tags
    return () => {
      // Restore original title
      if (originalTags.has('title')) {
        document.title = originalTags.get('title')!;
      }

      // Restore or remove other tags
      originalTags.forEach((originalContent, key) => {
        if (key === 'title') return; // Already handled above
        
        const element = document.querySelector(`meta[name="${key}"], meta[property="${key}"]`) as HTMLMetaElement;
        if (element) {
          if (originalContent) {
            element.content = originalContent;
          } else {
            element.remove();
          }
        }
      });
    };
  }, [options?.title, options?.description, options?.image, options?.url, options?.type]);
};

/**
 * Hook specifically for event meta tags
 */
export const useEventMetaTags = (event: Event | null) => {
  const metaOptions: MetaTagsOptions | undefined = event ? {
    title: `${event.title} | Steppers Life`,
    description: event.short_description || event.description || `Join us for ${event.title}`,
    image: event.featured_image_url || undefined,
    url: `${window.location.origin}/events/${event.id}`,
    type: 'event',
    siteName: 'Steppers Life',
    twitterCard: 'summary_large_image',
    twitterSite: '@SteppersLife'
  } : undefined;

  useMetaTags(metaOptions);

  // Also set event-specific Open Graph tags
  useEffect(() => {
    if (!event) return;

    const ogTags = SocialSharingService.generateOpenGraphTags(event);
    const twitterTags = SocialSharingService.generateTwitterCardTags(event);

    // Apply event-specific tags
    const appliedTags: HTMLMetaElement[] = [];

    [...ogTags, ...twitterTags].forEach(tag => {
      const selector = 'property' in tag 
        ? `meta[property="${tag.property}"]` 
        : `meta[name="${tag.name}"]`;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if ('property' in tag) {
          element.setAttribute('property', tag.property);
        } else {
          element.name = tag.name;
        }
        document.head.appendChild(element);
        appliedTags.push(element);
      }
      
      element.content = tag.content;
    });

    // Cleanup function
    return () => {
      appliedTags.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [event?.id, event?.title, event?.description, event?.featured_image_url]);
};

/**
 * Hook for page meta tags with default Steppers Life branding
 */
export const usePageMetaTags = (
  title: string,
  description?: string,
  image?: string
) => {
  const metaOptions: MetaTagsOptions = {
    title: `${title} | Steppers Life`,
    description: description || 'Discover and book amazing stepping and dance events near you',
    image: image || `${window.location.origin}/og-default.jpg`,
    url: window.location.href,
    type: 'website',
    siteName: 'Steppers Life',
    twitterCard: 'summary_large_image',
    twitterSite: '@SteppersLife'
  };

  useMetaTags(metaOptions);
};

export default useMetaTags;