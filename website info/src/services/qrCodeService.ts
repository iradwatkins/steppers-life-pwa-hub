import QRCode from 'qrcode';

// QR Code interfaces
export interface QRCodeConfig {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  targetUrl: string;
  trackingParams: Record<string, string>;
  design: QRCodeDesign;
  format: QRCodeFormat;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  campaign?: string;
}

export interface QRCodeDesign {
  size: number; // in pixels
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  logoSize?: number;
  style: 'square' | 'rounded' | 'circle';
  frameStyle?: 'none' | 'simple' | 'branded';
  frameText?: string;
  margin: number;
}

export interface QRCodeFormat {
  type: 'png' | 'svg' | 'pdf';
  size: 'small' | 'medium' | 'large' | 'custom';
  dpi: number;
  customSize?: { width: number; height: number };
}

export interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  design: QRCodeDesign;
  format: QRCodeFormat;
  useCase: 'business-card' | 'flyer' | 'poster' | 'social-media' | 'custom';
  previewUrl?: string;
}

export interface QRCodeAnalytics {
  qrCodeId: string;
  totalScans: number;
  uniqueScans: number;
  conversions: number;
  conversionRate: number;
  scansByDate: Array<{ date: string; scans: number }>;
  scansBySource: Array<{ source: string; scans: number }>;
  scansByDevice: Array<{ device: string; scans: number }>;
  scansByLocation: Array<{ location: string; scans: number }>;
  lastScanAt?: Date;
}

export interface QRCodeCampaign {
  id: string;
  name: string;
  description?: string;
  eventIds: string[];
  qrCodeIds: string[];
  startDate: Date;
  endDate?: Date;
  goals: {
    targetScans?: number;
    targetConversions?: number;
    targetRevenue?: number;
  };
  analytics: {
    totalScans: number;
    uniqueScans: number;
    conversions: number;
    revenue: number;
  };
  isActive: boolean;
  createdAt: Date;
}

export interface QRCodeTestResult {
  isValid: boolean;
  readability: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  scanTime: number;
  errors: string[];
}

export interface QRCodeBatchOperation {
  eventIds: string[];
  template: QRCodeTemplate;
  namingPattern: string;
  targetUrlPattern: string;
  campaign?: string;
}

class QRCodeService {
  private qrCodes: Map<string, QRCodeConfig> = new Map();
  private templates: Map<string, QRCodeTemplate> = new Map();
  private analytics: Map<string, QRCodeAnalytics> = new Map();
  private campaigns: Map<string, QRCodeCampaign> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // QR Code Generation
  async generateQRCode(config: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<QRCodeConfig> {
    const id = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const qrCode: QRCodeConfig = {
      ...config,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.qrCodes.set(id, qrCode);
    this.initializeAnalytics(id);
    
    return qrCode;
  }

  async generateQRCodeImage(config: QRCodeConfig): Promise<string> {
    const fullUrl = this.buildTrackingUrl(config.targetUrl, config.trackingParams, config.id);
    
    const options = {
      errorCorrectionLevel: config.design.errorCorrectionLevel,
      type: 'image/png' as const,
      quality: 1,
      margin: config.design.margin,
      color: {
        dark: config.design.foregroundColor,
        light: config.design.backgroundColor,
      },
      width: config.design.size,
    };

    return await QRCode.toDataURL(fullUrl, options);
  }

  async generateQRCodeSVG(config: QRCodeConfig): Promise<string> {
    const fullUrl = this.buildTrackingUrl(config.targetUrl, config.trackingParams, config.id);
    
    const options = {
      errorCorrectionLevel: config.design.errorCorrectionLevel,
      type: 'svg' as const,
      margin: config.design.margin,
      color: {
        dark: config.design.foregroundColor,
        light: config.design.backgroundColor,
      },
      width: config.design.size,
    };

    return await QRCode.toString(fullUrl, options);
  }

  // Batch Operations
  async generateBatchQRCodes(operation: QRCodeBatchOperation): Promise<QRCodeConfig[]> {
    const qrCodes: QRCodeConfig[] = [];
    
    for (const eventId of operation.eventIds) {
      const name = operation.namingPattern.replace('{eventId}', eventId);
      const targetUrl = operation.targetUrlPattern.replace('{eventId}', eventId);
      
      const config: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'> = {
        eventId,
        name,
        description: `QR code for event ${eventId}`,
        targetUrl,
        trackingParams: {
          utm_source: 'qr_code',
          utm_medium: 'print',
          utm_campaign: operation.campaign || 'event_promotion',
          eventId,
        },
        design: operation.template.design,
        format: operation.template.format,
        isActive: true,
        campaign: operation.campaign,
      };
      
      const qrCode = await this.generateQRCode(config);
      qrCodes.push(qrCode);
    }
    
    return qrCodes;
  }

  // QR Code Management
  async updateQRCode(id: string, updates: Partial<QRCodeConfig>): Promise<QRCodeConfig> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) {
      throw new Error('QR code not found');
    }

    const updated = {
      ...qrCode,
      ...updates,
      updatedAt: new Date(),
    };

    this.qrCodes.set(id, updated);
    return updated;
  }

  async deleteQRCode(id: string): Promise<void> {
    this.qrCodes.delete(id);
    this.analytics.delete(id);
  }

  async getQRCodesByEvent(eventId: string): Promise<QRCodeConfig[]> {
    return Array.from(this.qrCodes.values()).filter(qr => qr.eventId === eventId);
  }

  async getAllQRCodes(): Promise<QRCodeConfig[]> {
    return Array.from(this.qrCodes.values());
  }

  async getQRCode(id: string): Promise<QRCodeConfig | null> {
    return this.qrCodes.get(id) || null;
  }

  // Templates
  async getTemplates(): Promise<QRCodeTemplate[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(template: Omit<QRCodeTemplate, 'id'>): Promise<QRCodeTemplate> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: QRCodeTemplate = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<QRCodeTemplate>): Promise<QRCodeTemplate> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const updated = { ...template, ...updates };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    this.templates.delete(id);
  }

  // Analytics
  async getAnalytics(qrCodeId: string): Promise<QRCodeAnalytics | null> {
    return this.analytics.get(qrCodeId) || null;
  }

  async getAnalyticsByEvent(eventId: string): Promise<QRCodeAnalytics[]> {
    const eventQRCodes = await this.getQRCodesByEvent(eventId);
    const analytics: QRCodeAnalytics[] = [];
    
    for (const qrCode of eventQRCodes) {
      const qrAnalytics = this.analytics.get(qrCode.id);
      if (qrAnalytics) {
        analytics.push(qrAnalytics);
      }
    }
    
    return analytics;
  }

  async trackScan(qrCodeId: string, source?: string, device?: string, location?: string): Promise<void> {
    const analytics = this.analytics.get(qrCodeId);
    if (!analytics) return;

    analytics.totalScans++;
    analytics.uniqueScans++; // Simplified - in real implementation, would check unique visitors
    analytics.lastScanAt = new Date();

    // Update scan by date
    const today = new Date().toISOString().split('T')[0];
    const dateEntry = analytics.scansByDate.find(s => s.date === today);
    if (dateEntry) {
      dateEntry.scans++;
    } else {
      analytics.scansByDate.push({ date: today, scans: 1 });
    }

    // Update scan by source
    if (source) {
      const sourceEntry = analytics.scansBySource.find(s => s.source === source);
      if (sourceEntry) {
        sourceEntry.scans++;
      } else {
        analytics.scansBySource.push({ source, scans: 1 });
      }
    }

    // Update scan by device
    if (device) {
      const deviceEntry = analytics.scansByDevice.find(s => s.device === device);
      if (deviceEntry) {
        deviceEntry.scans++;
      } else {
        analytics.scansByDevice.push({ device, scans: 1 });
      }
    }

    // Update scan by location
    if (location) {
      const locationEntry = analytics.scansByLocation.find(s => s.location === location);
      if (locationEntry) {
        locationEntry.scans++;
      } else {
        analytics.scansByLocation.push({ location, scans: 1 });
      }
    }

    this.analytics.set(qrCodeId, analytics);
  }

  async trackConversion(qrCodeId: string): Promise<void> {
    const analytics = this.analytics.get(qrCodeId);
    if (!analytics) return;

    analytics.conversions++;
    analytics.conversionRate = (analytics.conversions / analytics.totalScans) * 100;
    
    this.analytics.set(qrCodeId, analytics);
  }

  // Testing and Validation
  async testQRCode(config: QRCodeConfig): Promise<QRCodeTestResult> {
    const result: QRCodeTestResult = {
      isValid: true,
      readability: 'excellent',
      recommendations: [],
      scanTime: 150, // milliseconds
      errors: [],
    };

    // Test contrast ratio
    const contrast = this.calculateContrast(config.design.foregroundColor, config.design.backgroundColor);
    if (contrast < 3) {
      result.readability = 'poor';
      result.recommendations.push('Increase contrast between foreground and background colors');
    } else if (contrast < 4.5) {
      result.readability = 'fair';
      result.recommendations.push('Consider increasing contrast for better readability');
    }

    // Test size
    if (config.design.size < 100) {
      result.readability = 'poor';
      result.recommendations.push('Increase QR code size for better scanning');
    }

    // Test error correction
    if (config.design.logoUrl && config.design.errorCorrectionLevel === 'L') {
      result.recommendations.push('Use higher error correction level (M or Q) when including a logo');
    }

    // Test URL length
    const fullUrl = this.buildTrackingUrl(config.targetUrl, config.trackingParams, config.id);
    if (fullUrl.length > 2000) {
      result.errors.push('URL is too long for QR code generation');
      result.isValid = false;
    }

    return result;
  }

  // Campaign Management
  async createCampaign(campaign: Omit<QRCodeCampaign, 'id' | 'createdAt' | 'analytics'>): Promise<QRCodeCampaign> {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCampaign: QRCodeCampaign = {
      ...campaign,
      id,
      createdAt: new Date(),
      analytics: {
        totalScans: 0,
        uniqueScans: 0,
        conversions: 0,
        revenue: 0,
      },
    };

    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async getCampaigns(): Promise<QRCodeCampaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: string): Promise<QRCodeCampaign | null> {
    return this.campaigns.get(id) || null;
  }

  async updateCampaignAnalytics(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    let totalScans = 0;
    let uniqueScans = 0;
    let conversions = 0;

    for (const qrCodeId of campaign.qrCodeIds) {
      const analytics = this.analytics.get(qrCodeId);
      if (analytics) {
        totalScans += analytics.totalScans;
        uniqueScans += analytics.uniqueScans;
        conversions += analytics.conversions;
      }
    }

    campaign.analytics = {
      totalScans,
      uniqueScans,
      conversions,
      revenue: conversions * 50, // Mock revenue calculation
    };

    this.campaigns.set(campaignId, campaign);
  }

  // Utility methods
  private buildTrackingUrl(baseUrl: string, params: Record<string, string>, qrCodeId: string): string {
    const url = new URL(baseUrl);
    
    // Add QR code tracking parameter
    url.searchParams.set('qr', qrCodeId);
    
    // Add custom tracking parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  }

  private calculateContrast(color1: string, color2: string): number {
    // Simplified contrast calculation - in real implementation use proper color space calculations
    const getLuminance = (color: string) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private initializeAnalytics(qrCodeId: string): void {
    const analytics: QRCodeAnalytics = {
      qrCodeId,
      totalScans: 0,
      uniqueScans: 0,
      conversions: 0,
      conversionRate: 0,
      scansByDate: [],
      scansBySource: [],
      scansByDevice: [],
      scansByLocation: [],
    };

    this.analytics.set(qrCodeId, analytics);
  }

  private initializeMockData(): void {
    // Mock QR code templates
    const templates: QRCodeTemplate[] = [
      {
        id: 'template_business_card',
        name: 'Business Card',
        description: 'Small QR code optimized for business cards',
        useCase: 'business-card',
        design: {
          size: 200,
          errorCorrectionLevel: 'M',
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF',
          style: 'square',
          frameStyle: 'simple',
          margin: 2,
        },
        format: {
          type: 'png',
          size: 'small',
          dpi: 300,
        },
      },
      {
        id: 'template_flyer',
        name: 'Flyer/Poster',
        description: 'Medium QR code perfect for flyers and posters',
        useCase: 'flyer',
        design: {
          size: 300,
          errorCorrectionLevel: 'Q',
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF',
          style: 'square',
          frameStyle: 'branded',
          frameText: 'Scan for tickets',
          margin: 4,
        },
        format: {
          type: 'png',
          size: 'medium',
          dpi: 300,
        },
      },
      {
        id: 'template_social_media',
        name: 'Social Media',
        description: 'High contrast QR code optimized for social media',
        useCase: 'social-media',
        design: {
          size: 400,
          errorCorrectionLevel: 'H',
          foregroundColor: '#1A1A1A',
          backgroundColor: '#FFFFFF',
          style: 'rounded',
          frameStyle: 'branded',
          margin: 6,
        },
        format: {
          type: 'png',
          size: 'large',
          dpi: 150,
        },
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

export const qrCodeService = new QRCodeService(); 