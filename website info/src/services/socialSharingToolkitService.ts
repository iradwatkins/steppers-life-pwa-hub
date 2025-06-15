export interface SocialMediaTemplate {
  id: string;
  name: string;
  platform: SocialPlatform;
  type: 'post' | 'story' | 'ad' | 'carousel' | 'video';
  content: TemplateContent;
  dimensions: ImageDimensions;
  tags: string[];
  category: 'promotional' | 'educational' | 'testimonial' | 'announcement' | 'countdown';
  isActive: boolean;
  createdDate: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface TemplateContent {
  title: string;
  description: string;
  template: string; // Template with placeholders like {eventName}, {date}, {agentName}
  hashtags: string[];
  mentions: string[];
  callToAction: string;
  mediaAssets: MediaAsset[];
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  altText: string;
  dimensions: ImageDimensions;
  fileSize: number;
  format: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export type SocialPlatform = 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'linkedin' 
  | 'tiktok' 
  | 'youtube' 
  | 'pinterest' 
  | 'snapchat';

export interface GeneratedContent {
  id: string;
  agentId: string;
  eventId: string;
  platform: SocialPlatform;
  template: SocialMediaTemplate;
  content: ProcessedContent;
  trackingLink: string;
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  analytics: ContentAnalytics;
  createdDate: Date;
}

export interface ProcessedContent {
  caption: string;
  hashtags: string[];
  mentions: string[];
  mediaUrls: string[];
  trackingLinks: string[];
  callToAction: string;
}

export interface ContentAnalytics {
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  revenue: number;
  lastUpdated: Date;
}

export interface SharingKit {
  agentId: string;
  eventId: string;
  eventDetails: EventSharingDetails;
  generatedContent: GeneratedContent[];
  availableTemplates: SocialMediaTemplate[];
  customBranding: BrandingOptions;
  trackingLinks: string[];
  performance: KitPerformance;
}

export interface EventSharingDetails {
  eventId: string;
  title: string;
  description: string;
  date: Date;
  venue: string;
  ticketPrice: number;
  category: string;
  images: string[];
  highlights: string[];
}

export interface BrandingOptions {
  agentName: string;
  agentPhoto?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: string;
  watermark?: string;
  signature: string;
}

export interface KitPerformance {
  totalShares: number;
  totalReach: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  bestPerformingPlatform: SocialPlatform;
  mostEngagingContent: string;
}

export interface ContentGenerationRequest {
  agentId: string;
  eventId: string;
  platforms: SocialPlatform[];
  templateIds?: string[];
  customization?: Partial<TemplateContent>;
  brandingOptions?: Partial<BrandingOptions>;
  schedulingOptions?: SchedulingOptions;
}

export interface SchedulingOptions {
  publishNow: boolean;
  scheduledDates: Date[];
  frequency: 'once' | 'daily' | 'weekly' | 'custom';
  timeZone: string;
  optimalTiming: boolean; // Use AI to determine best posting times
}

export interface PlatformSpecs {
  platform: SocialPlatform;
  characterLimits: {
    caption: number;
    hashtags: number;
    bio: number;
  };
  imageDimensions: ImageDimensions[];
  videoSpecs: {
    maxDuration: number;
    maxSize: number;
    formats: string[];
  };
  features: string[];
}

class SocialSharingToolkitService {
  private templates: Map<string, SocialMediaTemplate> = new Map();
  private generatedContent: Map<string, GeneratedContent[]> = new Map();
  private sharingKits: Map<string, SharingKit> = new Map();
  private platformSpecs: Map<SocialPlatform, PlatformSpecs> = new Map();

  constructor() {
    this.initializePlatformSpecs();
    this.initializeDefaultTemplates();
  }

  async createSharingKit(agentId: string, eventId: string): Promise<SharingKit> {
    const kitKey = `${agentId}-${eventId}`;
    
    if (this.sharingKits.has(kitKey)) {
      return this.sharingKits.get(kitKey)!;
    }

    const kit: SharingKit = {
      agentId,
      eventId,
      eventDetails: await this.getEventSharingDetails(eventId),
      generatedContent: [],
      availableTemplates: this.getTemplatesForEvent(eventId),
      customBranding: await this.getAgentBranding(agentId),
      trackingLinks: [],
      performance: this.createEmptyPerformance()
    };

    this.sharingKits.set(kitKey, kit);
    return kit;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent[]> {
    const kit = await this.createSharingKit(request.agentId, request.eventId);
    const generatedContent: GeneratedContent[] = [];

    for (const platform of request.platforms) {
      const templates = request.templateIds 
        ? kit.availableTemplates.filter(t => request.templateIds!.includes(t.id))
        : kit.availableTemplates.filter(t => t.platform === platform);

      for (const template of templates) {
        const content = await this.processTemplate(
          template, 
          kit.eventDetails, 
          kit.customBranding,
          request.customization
        );

        const trackingLink = await this.generateTrackingLink(request.agentId, request.eventId, platform);

        const generated: GeneratedContent = {
          id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          agentId: request.agentId,
          eventId: request.eventId,
          platform,
          template,
          content,
          trackingLink,
          scheduledDate: request.schedulingOptions?.publishNow ? undefined : request.schedulingOptions?.scheduledDates?.[0],
          status: 'draft',
          analytics: this.createEmptyAnalytics(),
          createdDate: new Date()
        };

        generatedContent.push(generated);
      }
    }

    // Update kit with new content
    const kitKey = `${request.agentId}-${request.eventId}`;
    const existingContent = this.generatedContent.get(kitKey) || [];
    this.generatedContent.set(kitKey, [...existingContent, ...generatedContent]);

    return generatedContent;
  }

  async getAvailableTemplates(filters?: {
    platform?: SocialPlatform;
    category?: string;
    type?: string;
  }): Promise<SocialMediaTemplate[]> {
    let templates = Array.from(this.templates.values()).filter(t => t.isActive);

    if (filters?.platform) {
      templates = templates.filter(t => t.platform === filters.platform);
    }

    if (filters?.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters?.type) {
      templates = templates.filter(t => t.type === filters.type);
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  async createCustomTemplate(templateData: Omit<SocialMediaTemplate, 'id' | 'createdDate' | 'usageCount'>): Promise<SocialMediaTemplate> {
    const template: SocialMediaTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
      usageCount: 0
    };

    this.templates.set(template.id, template);
    return template;
  }

  async updateTemplate(templateId: string, updates: Partial<SocialMediaTemplate>): Promise<SocialMediaTemplate> {
    const existing = this.templates.get(templateId);
    if (!existing) {
      throw new Error(`Template ${templateId} not found`);
    }

    const updated = { ...existing, ...updates };
    this.templates.set(templateId, updated);
    return updated;
  }

  async scheduleContent(contentId: string, scheduledDate: Date): Promise<void> {
    // Find content across all kits
    for (const [kitKey, contents] of this.generatedContent.entries()) {
      const content = contents.find(c => c.id === contentId);
      if (content) {
        content.scheduledDate = scheduledDate;
        content.status = 'scheduled';
        break;
      }
    }
  }

  async publishContent(contentId: string): Promise<void> {
    // Find and publish content
    for (const [kitKey, contents] of this.generatedContent.entries()) {
      const content = contents.find(c => c.id === contentId);
      if (content) {
        content.status = 'published';
        
        // Update template usage
        const template = this.templates.get(content.template.id);
        if (template) {
          template.usageCount++;
          template.lastUsed = new Date();
        }
        break;
      }
    }
  }

  async getContentAnalytics(contentId: string): Promise<ContentAnalytics> {
    // Find content and return its analytics
    for (const [kitKey, contents] of this.generatedContent.entries()) {
      const content = contents.find(c => c.id === contentId);
      if (content) {
        // In real implementation, this would fetch from social media APIs
        return this.generateMockAnalytics();
      }
    }
    throw new Error(`Content ${contentId} not found`);
  }

  async getAgentSharingKits(agentId: string): Promise<SharingKit[]> {
    return Array.from(this.sharingKits.values()).filter(kit => kit.agentId === agentId);
  }

  async getKitPerformance(agentId: string, eventId: string): Promise<KitPerformance> {
    const kitKey = `${agentId}-${eventId}`;
    const kit = this.sharingKits.get(kitKey);
    
    if (!kit) {
      return this.createEmptyPerformance();
    }

    const contents = this.generatedContent.get(kitKey) || [];
    
    // Aggregate performance from all content
    let totalShares = 0;
    let totalReach = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    const platformPerformance = new Map<SocialPlatform, number>();

    for (const content of contents) {
      totalShares++;
      totalReach += content.analytics.reach;
      totalClicks += content.analytics.clicks;
      totalConversions += content.analytics.conversions;
      totalRevenue += content.analytics.revenue;

      const platformClicks = platformPerformance.get(content.platform) || 0;
      platformPerformance.set(content.platform, platformClicks + content.analytics.clicks);
    }

    const bestPerformingPlatform = Array.from(platformPerformance.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'instagram';

    return {
      totalShares,
      totalReach,
      totalClicks,
      totalConversions,
      totalRevenue,
      bestPerformingPlatform,
      mostEngagingContent: contents.sort((a, b) => b.analytics.engagement - a.analytics.engagement)[0]?.id || ''
    };
  }

  async generateOptimalPostingSchedule(
    agentId: string, 
    platforms: SocialPlatform[], 
    timeZone: string
  ): Promise<{ platform: SocialPlatform; optimalTimes: Date[] }[]> {
    // Mock optimal posting times based on platform best practices
    const schedule: { platform: SocialPlatform; optimalTimes: Date[] }[] = [];

    for (const platform of platforms) {
      const optimalTimes = this.getOptimalTimesForPlatform(platform, timeZone);
      schedule.push({ platform, optimalTimes });
    }

    return schedule;
  }

  async exportSharingKit(agentId: string, eventId: string, format: 'pdf' | 'zip'): Promise<Blob> {
    const kit = await this.createSharingKit(agentId, eventId);
    const contents = this.generatedContent.get(`${agentId}-${eventId}`) || [];

    if (format === 'pdf') {
      return this.generatePDFReport(kit, contents);
    } else {
      return this.generateZipArchive(kit, contents);
    }
  }

  private async processTemplate(
    template: SocialMediaTemplate,
    eventDetails: EventSharingDetails,
    branding: BrandingOptions,
    customization?: Partial<TemplateContent>
  ): Promise<ProcessedContent> {
    const content = { ...template.content, ...customization };
    
    // Replace placeholders
    const processedCaption = this.replacePlaceholders(content.template, {
      eventName: eventDetails.title,
      eventDate: eventDetails.date.toLocaleDateString(),
      venue: eventDetails.venue,
      agentName: branding.agentName,
      price: eventDetails.ticketPrice.toString()
    });

    return {
      caption: processedCaption,
      hashtags: content.hashtags,
      mentions: content.mentions,
      mediaUrls: content.mediaAssets.map(asset => asset.url),
      trackingLinks: [], // Will be filled with actual tracking links
      callToAction: content.callToAction
    };
  }

  private replacePlaceholders(template: string, variables: Record<string, string>): string {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return processed;
  }

  private async generateTrackingLink(agentId: string, eventId: string, platform: SocialPlatform): Promise<string> {
    // This would integrate with the trackable link service
    return `https://stepperslife.com/e/${agentId}-${eventId}-${platform}`;
  }

  private async getEventSharingDetails(eventId: string): Promise<EventSharingDetails> {
    // Mock event details - in real app would fetch from event service
    return {
      eventId,
      title: 'Advanced Salsa Workshop',
      description: 'Learn advanced salsa techniques from professional instructors',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: 'Downtown Dance Studio',
      ticketPrice: 45,
      category: 'Dance Class',
      images: [
        'https://example.com/event-image1.jpg',
        'https://example.com/event-image2.jpg'
      ],
      highlights: ['Professional instructors', 'Small group setting', 'All skill levels welcome']
    };
  }

  private async getAgentBranding(agentId: string): Promise<BrandingOptions> {
    // Mock branding - in real app would fetch from agent profile
    return {
      agentName: 'Sarah Johnson',
      agentPhoto: 'https://example.com/agent-photo.jpg',
      brandColors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D'
      },
      logo: 'https://example.com/agent-logo.png',
      signature: 'Book your spot today! 💃 #DanceWithSarah'
    };
  }

  private getTemplatesForEvent(eventId: string): SocialMediaTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  private createEmptyPerformance(): KitPerformance {
    return {
      totalShares: 0,
      totalReach: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      bestPerformingPlatform: 'instagram',
      mostEngagingContent: ''
    };
  }

  private createEmptyAnalytics(): ContentAnalytics {
    return {
      reach: 0,
      impressions: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      lastUpdated: new Date()
    };
  }

  private generateMockAnalytics(): ContentAnalytics {
    return {
      reach: Math.floor(Math.random() * 1000),
      impressions: Math.floor(Math.random() * 2000),
      engagement: Math.floor(Math.random() * 100),
      clicks: Math.floor(Math.random() * 50),
      conversions: Math.floor(Math.random() * 10),
      revenue: Math.floor(Math.random() * 500),
      lastUpdated: new Date()
    };
  }

  private getOptimalTimesForPlatform(platform: SocialPlatform, timeZone: string): Date[] {
    // Mock optimal times - in real app would use analytics data
    const baseDate = new Date();
    const times: Date[] = [];

    switch (platform) {
      case 'instagram':
        // Best times: 6am, 12pm, 7pm
        [6, 12, 19].forEach(hour => {
          const time = new Date(baseDate);
          time.setHours(hour, 0, 0, 0);
          times.push(time);
        });
        break;
      case 'facebook':
        // Best times: 9am, 3pm, 8pm
        [9, 15, 20].forEach(hour => {
          const time = new Date(baseDate);
          time.setHours(hour, 0, 0, 0);
          times.push(time);
        });
        break;
      default:
        // Generic times
        [10, 14, 18].forEach(hour => {
          const time = new Date(baseDate);
          time.setHours(hour, 0, 0, 0);
          times.push(time);
        });
    }

    return times;
  }

  private generatePDFReport(kit: SharingKit, contents: GeneratedContent[]): Blob {
    // Mock PDF generation
    const reportData = `Sharing Kit Report for ${kit.eventDetails.title}\n\n${contents.length} pieces of content generated`;
    return new Blob([reportData], { type: 'application/pdf' });
  }

  private generateZipArchive(kit: SharingKit, contents: GeneratedContent[]): Blob {
    // Mock ZIP generation
    const archiveData = `Archive for ${kit.eventDetails.title}`;
    return new Blob([archiveData], { type: 'application/zip' });
  }

  private initializePlatformSpecs(): void {
    this.platformSpecs.set('instagram', {
      platform: 'instagram',
      characterLimits: { caption: 2200, hashtags: 30, bio: 150 },
      imageDimensions: [
        { width: 1080, height: 1080, aspectRatio: '1:1' },
        { width: 1080, height: 1350, aspectRatio: '4:5' },
        { width: 1080, height: 1920, aspectRatio: '9:16' }
      ],
      videoSpecs: { maxDuration: 60, maxSize: 100, formats: ['mp4', 'mov'] },
      features: ['stories', 'reels', 'igtv', 'posts']
    });

    this.platformSpecs.set('facebook', {
      platform: 'facebook',
      characterLimits: { caption: 63206, hashtags: 30, bio: 101 },
      imageDimensions: [
        { width: 1200, height: 630, aspectRatio: '1.91:1' },
        { width: 1080, height: 1080, aspectRatio: '1:1' }
      ],
      videoSpecs: { maxDuration: 240, maxSize: 4000, formats: ['mp4', 'mov', 'avi'] },
      features: ['posts', 'stories', 'events', 'groups']
    });

    // Add other platforms...
  }

  private initializeDefaultTemplates(): void {
    const templates: SocialMediaTemplate[] = [
      {
        id: 'inst-event-promo-1',
        name: 'Instagram Event Promotion',
        platform: 'instagram',
        type: 'post',
        content: {
          title: 'Event Promotion Post',
          description: 'Promote upcoming events with call to action',
          template: '🎉 Don\'t miss {eventName} on {eventDate} at {venue}! \n\nJoin me for an amazing experience. Book your tickets now! 🎫\n\n#{agentName}Events #Dance #Fun',
          hashtags: ['#dance', '#event', '#tickets', '#fun'],
          mentions: [],
          callToAction: 'Book your tickets now!',
          mediaAssets: []
        },
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1' },
        tags: ['promotion', 'event', 'tickets'],
        category: 'promotional',
        isActive: true,
        createdDate: new Date(),
        usageCount: 0
      },
      {
        id: 'fb-countdown-1',
        name: 'Facebook Countdown Post',
        platform: 'facebook',
        type: 'post',
        content: {
          title: 'Event Countdown',
          description: 'Create urgency with countdown posts',
          template: '⏰ Only 3 days left until {eventName}!\n\nSecure your spot at {venue} for just ${price}. Limited spaces available!\n\n{agentName} - Your dance journey starts here.',
          hashtags: ['#countdown', '#lastchance', '#dance'],
          mentions: [],
          callToAction: 'Get your tickets before they sell out!',
          mediaAssets: []
        },
        dimensions: { width: 1200, height: 630, aspectRatio: '1.91:1' },
        tags: ['countdown', 'urgency', 'tickets'],
        category: 'promotional',
        isActive: true,
        createdDate: new Date(),
        usageCount: 0
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

export const socialSharingToolkitService = new SocialSharingToolkitService(); 