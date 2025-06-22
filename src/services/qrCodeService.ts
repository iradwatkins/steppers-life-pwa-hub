/**
 * QR Code Service for Marketing Purposes
 * Generates and manages QR codes for events, promotional campaigns, and marketing materials
 */

import { supabase } from '@/integrations/supabase/client';
import { UrlUtils } from '@/utils/urlUtils';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

export interface QRCodeOptions {
  size?: number;
  format?: 'png' | 'svg' | 'pdf';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: string;
  backgroundColor?: string;
  logo?: string;
}

export interface MarketingQRCode {
  id: string;
  name: string;
  description?: string;
  qr_type: 'event' | 'venue' | 'organizer' | 'campaign' | 'custom';
  target_url: string;
  tracking_enabled: boolean;
  qr_code_url: string;
  scan_count: number;
  created_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface QRCodeAnalytics {
  total_codes: number;
  total_scans: number;
  most_scanned_code: string;
  scan_rate: number;
  recent_scans: Array<{
    code_id: string;
    scanned_at: string;
    location?: string;
    device_type?: string;
  }>;
}

export class QRCodeService {
  private static readonly QR_API_BASE = 'https://api.qrserver.com/v1';
  private static readonly CHART_API_BASE = 'https://chart.googleapis.com/chart';

  /**
   * Generate QR code URL using QR Server API
   */
  static generateQRCodeUrl(
    data: string, 
    options: QRCodeOptions = {}
  ): string {
    const {
      size = 300,
      format = 'png',
      errorCorrectionLevel = 'M',
      margin = 0,
      color = '000000',
      backgroundColor = 'ffffff'
    } = options;

    const params = new URLSearchParams({
      data: encodeURIComponent(data),
      size: `${size}x${size}`,
      format,
      ecc: errorCorrectionLevel,
      margin: margin.toString(),
      color,
      bgcolor: backgroundColor
    });

    return `${this.QR_API_BASE}/create-qr-code/?${params.toString()}`;
  }

  /**
   * Generate QR code using Google Charts API (alternative)
   */
  static generateQRCodeUrlGoogle(
    data: string,
    options: QRCodeOptions = {}
  ): string {
    const {
      size = 300,
      errorCorrectionLevel = 'M'
    } = options;

    const params = new URLSearchParams({
      cht: 'qr',
      chs: `${size}x${size}`,
      chl: encodeURIComponent(data),
      choe: 'UTF-8',
      chld: errorCorrectionLevel
    });

    return `${this.CHART_API_BASE}?${params.toString()}`;
  }

  /**
   * Create a marketing QR code for an event
   */
  static async createEventQRCode(
    eventId: string,
    organizerId: string,
    options: {
      name: string;
      description?: string;
      campaignSource?: string;
      trackingEnabled?: boolean;
      expiresAt?: string;
      qrOptions?: QRCodeOptions;
    }
  ): Promise<MarketingQRCode | null> {
    try {
      // Generate tracking URL
      const baseUrl = UrlUtils.createEventShareUrl(eventId, options.campaignSource || 'qr_code');
      const trackingUrl = UrlUtils.addTrackingParams(baseUrl, {
        source: options.campaignSource || 'qr_code',
        medium: 'qr',
        campaign: `event_${eventId}`,
        content: options.name.toLowerCase().replace(/\s+/g, '_')
      });

      // Generate QR code image URL
      const qrCodeUrl = this.generateQRCodeUrl(trackingUrl, options.qrOptions);

      // Save to database
      const { data, error } = await supabase
        .from('marketing_qr_codes')
        .insert({
          organizer_id: organizerId,
          event_id: eventId,
          name: options.name,
          description: options.description,
          qr_type: 'event',
          target_url: trackingUrl,
          tracking_enabled: options.trackingEnabled ?? true,
          qr_code_url: qrCodeUrl,
          scan_count: 0,
          expires_at: options.expiresAt,
          metadata: {
            event_id: eventId,
            campaign_source: options.campaignSource,
            qr_options: options.qrOptions
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating QR code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createEventQRCode:', error);
      return null;
    }
  }

  /**
   * Create a marketing QR code for a venue
   */
  static async createVenueQRCode(
    venueId: string,
    organizerId: string,
    options: {
      name: string;
      description?: string;
      targetPage?: 'profile' | 'events' | 'contact';
      trackingEnabled?: boolean;
      expiresAt?: string;
      qrOptions?: QRCodeOptions;
    }
  ): Promise<MarketingQRCode | null> {
    try {
      // Generate venue URL
      const baseUrl = `${window.location.origin}/venues/${venueId}${
        options.targetPage ? `/${options.targetPage}` : ''
      }`;
      
      const trackingUrl = UrlUtils.addTrackingParams(baseUrl, {
        source: 'qr_code',
        medium: 'qr',
        campaign: `venue_${venueId}`,
        content: options.name.toLowerCase().replace(/\s+/g, '_')
      });

      // Generate QR code image URL
      const qrCodeUrl = this.generateQRCodeUrl(trackingUrl, options.qrOptions);

      // Save to database
      const { data, error } = await supabase
        .from('marketing_qr_codes')
        .insert({
          organizer_id: organizerId,
          venue_id: venueId,
          name: options.name,
          description: options.description,
          qr_type: 'venue',
          target_url: trackingUrl,
          tracking_enabled: options.trackingEnabled ?? true,
          qr_code_url: qrCodeUrl,
          scan_count: 0,
          expires_at: options.expiresAt,
          metadata: {
            venue_id: venueId,
            target_page: options.targetPage,
            qr_options: options.qrOptions
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating venue QR code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createVenueQRCode:', error);
      return null;
    }
  }

  /**
   * Create a custom marketing QR code
   */
  static async createCustomQRCode(
    organizerId: string,
    options: {
      name: string;
      description?: string;
      targetUrl: string;
      qrType?: 'campaign' | 'custom';
      trackingEnabled?: boolean;
      expiresAt?: string;
      qrOptions?: QRCodeOptions;
    }
  ): Promise<MarketingQRCode | null> {
    try {
      let finalUrl = options.targetUrl;

      // Add tracking if enabled
      if (options.trackingEnabled) {
        finalUrl = UrlUtils.addTrackingParams(options.targetUrl, {
          source: 'qr_code',
          medium: 'qr',
          campaign: options.name.toLowerCase().replace(/\s+/g, '_')
        });
      }

      // Generate QR code image URL
      const qrCodeUrl = this.generateQRCodeUrl(finalUrl, options.qrOptions);

      // Save to database
      const { data, error } = await supabase
        .from('marketing_qr_codes')
        .insert({
          organizer_id: organizerId,
          name: options.name,
          description: options.description,
          qr_type: options.qrType || 'custom',
          target_url: finalUrl,
          tracking_enabled: options.trackingEnabled ?? true,
          qr_code_url: qrCodeUrl,
          scan_count: 0,
          expires_at: options.expiresAt,
          metadata: {
            original_url: options.targetUrl,
            qr_options: options.qrOptions
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating custom QR code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createCustomQRCode:', error);
      return null;
    }
  }

  /**
   * Get all QR codes for an organizer
   */
  static async getOrganizerQRCodes(organizerId: string): Promise<MarketingQRCode[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_qr_codes')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching QR codes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrganizerQRCodes:', error);
      return [];
    }
  }

  /**
   * Get QR code by ID
   */
  static async getQRCodeById(qrCodeId: string): Promise<MarketingQRCode | null> {
    try {
      const { data, error } = await supabase
        .from('marketing_qr_codes')
        .select('*')
        .eq('id', qrCodeId)
        .single();

      if (error) {
        console.error('Error fetching QR code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getQRCodeById:', error);
      return null;
    }
  }

  /**
   * Update QR code
   */
  static async updateQRCode(
    qrCodeId: string,
    updates: Partial<{
      name: string;
      description: string;
      expires_at: string;
      tracking_enabled: boolean;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketing_qr_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', qrCodeId);

      if (error) {
        console.error('Error updating QR code:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateQRCode:', error);
      return false;
    }
  }

  /**
   * Delete QR code
   */
  static async deleteQRCode(qrCodeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketing_qr_codes')
        .delete()
        .eq('id', qrCodeId);

      if (error) {
        console.error('Error deleting QR code:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteQRCode:', error);
      return false;
    }
  }

  /**
   * Track QR code scan
   */
  static async trackScan(
    qrCodeId: string,
    metadata?: {
      location?: string;
      deviceType?: string;
      userAgent?: string;
    }
  ): Promise<boolean> {
    try {
      // Increment scan count
      const { error: updateError } = await supabase
        .rpc('increment_qr_scan_count', { qr_code_id: qrCodeId });

      if (updateError) {
        console.error('Error incrementing scan count:', updateError);
        return false;
      }

      // Record scan event
      const { error: insertError } = await supabase
        .from('qr_code_scans')
        .insert({
          qr_code_id: qrCodeId,
          scanned_at: new Date().toISOString(),
          metadata
        });

      if (insertError) {
        console.error('Error recording scan event:', insertError);
        // Don't fail if we can't record the event, scan count is more important
      }

      return true;
    } catch (error) {
      console.error('Error in trackScan:', error);
      return false;
    }
  }

  /**
   * Get QR code analytics
   */
  static async getQRCodeAnalytics(organizerId: string): Promise<QRCodeAnalytics | null> {
    try {
      const qrCodes = await this.getOrganizerQRCodes(organizerId);
      
      if (qrCodes.length === 0) {
        return {
          total_codes: 0,
          total_scans: 0,
          most_scanned_code: '',
          scan_rate: 0,
          recent_scans: []
        };
      }

      const totalScans = qrCodes.reduce((sum, code) => sum + code.scan_count, 0);
      const mostScannedCode = qrCodes.reduce((prev, current) => 
        current.scan_count > prev.scan_count ? current : prev
      );

      // Get recent scans
      const { data: recentScans } = await supabase
        .from('qr_code_scans')
        .select(`
          qr_code_id,
          scanned_at,
          metadata
        `)
        .in('qr_code_id', qrCodes.map(code => code.id))
        .order('scanned_at', { ascending: false })
        .limit(50);

      return {
        total_codes: qrCodes.length,
        total_scans: totalScans,
        most_scanned_code: mostScannedCode.name,
        scan_rate: qrCodes.length > 0 ? totalScans / qrCodes.length : 0,
        recent_scans: (recentScans || []).map(scan => ({
          code_id: scan.qr_code_id,
          scanned_at: scan.scanned_at,
          location: scan.metadata?.location,
          device_type: scan.metadata?.deviceType
        }))
      };
    } catch (error) {
      console.error('Error in getQRCodeAnalytics:', error);
      return null;
    }
  }

  /**
   * Generate downloadable QR code (high resolution)
   */
  static generateDownloadableQRCode(
    data: string,
    options: QRCodeOptions & { filename?: string } = {}
  ): { url: string; filename: string } {
    const {
      size = 1000, // High resolution for print
      format = 'png',
      filename = 'qr-code'
    } = options;

    const qrUrl = this.generateQRCodeUrl(data, { ...options, size });
    const downloadFilename = `${filename}.${format}`;

    return {
      url: qrUrl,
      filename: downloadFilename
    };
  }

  /**
   * Generate QR code for bulk printing
   */
  static generateBulkQRCodes(
    codes: Array<{ data: string; label: string }>,
    options: QRCodeOptions = {}
  ): Array<{ url: string; label: string; data: string }> {
    return codes.map(code => ({
      url: this.generateQRCodeUrl(code.data, options),
      label: code.label,
      data: code.data
    }));
  }

  /**
   * Validate QR code URL
   */
  static validateQRData(data: string): { isValid: boolean; error?: string } {
    if (!data || data.trim().length === 0) {
      return { isValid: false, error: 'QR code data cannot be empty' };
    }

    if (data.length > 4296) { // QR code character limit
      return { isValid: false, error: 'QR code data exceeds maximum length' };
    }

    // Check if it's a valid URL if it looks like one
    if (data.startsWith('http://') || data.startsWith('https://')) {
      if (!UrlUtils.isValidUrl(data)) {
        return { isValid: false, error: 'Invalid URL format' };
      }
    }

    return { isValid: true };
  }

  /**
   * Get QR code usage recommendations
   */
  static getUsageRecommendations(qrType: string): Array<{
    title: string;
    description: string;
    sizeRecommendation: number;
  }> {
    const recommendations = {
      event: [
        {
          title: 'Event Flyers',
          description: 'Place QR codes on printed flyers for easy event discovery',
          sizeRecommendation: 150
        },
        {
          title: 'Social Media Posts',
          description: 'Add QR codes to Instagram stories and Facebook posts',
          sizeRecommendation: 200
        },
        {
          title: 'Event Banners',
          description: 'Large QR codes for outdoor banners and signage',
          sizeRecommendation: 500
        }
      ],
      venue: [
        {
          title: 'Table Tents',
          description: 'Small QR codes for restaurant tables and waiting areas',
          sizeRecommendation: 100
        },
        {
          title: 'Business Cards',
          description: 'Professional cards with venue information',
          sizeRecommendation: 80
        },
        {
          title: 'Storefront Signage',
          description: 'Window displays and entrance signage',
          sizeRecommendation: 300
        }
      ],
      campaign: [
        {
          title: 'Print Advertisements',
          description: 'Magazine and newspaper ads',
          sizeRecommendation: 120
        },
        {
          title: 'Digital Displays',
          description: 'TV screens and digital billboards',
          sizeRecommendation: 400
        }
      ]
    };

    return recommendations[qrType as keyof typeof recommendations] || [];
  }
}

export default QRCodeService;