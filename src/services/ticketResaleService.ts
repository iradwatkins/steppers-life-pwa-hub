/**
 * Ticket Resale Service
 * Story B.014: Ticket Resale Platform
 */

import { supabase } from '@/integrations/supabase/client';
import { EmailService } from './emailService';
import { paymentGatewayManager } from './paymentGatewayManager';
import type { OrderWithItems } from './orderService';

export interface ResaleListingRequest {
  ticketId: string;
  sellerId: string;
  resalePrice: number;
  originalPrice: number;
  description?: string;
  category: 'face_value' | 'below_face' | 'above_face';
  isVerified: boolean;
  expiryDate?: Date;
}

export interface ResaleListing {
  id: string;
  ticketId: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  resalePrice: number;
  originalPrice: number;
  description?: string;
  category: 'face_value' | 'below_face' | 'above_face';
  isVerified: boolean;
  isActive: boolean;
  views: number;
  watchlists: number;
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  ticketType: string;
  sectionInfo?: {
    section: string;
    row?: string;
    seat?: string;
  };
}

export interface ResalePurchaseRequest {
  listingId: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  paymentMethodId: string;
  agreedPrice: number;
}

export interface ResaleTransaction {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  ticketId: string;
  salePrice: number;
  platformFee: number;
  sellerPayout: number;
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  paymentIntentId?: string;
  transferCode?: string;
  createdAt: Date;
  completedAt?: Date;
  escrowReleaseDate?: Date;
}

export interface ResaleResult {
  success: boolean;
  listingId?: string;
  transactionId?: string;
  transferCode?: string;
  errorMessage?: string;
  listing?: ResaleListing;
  transaction?: ResaleTransaction;
}

export class TicketResaleService {
  private static readonly PLATFORM_FEE_PERCENTAGE = 0.10; // 10%
  private static readonly MINIMUM_PLATFORM_FEE = 5.00; // $5 minimum
  private static readonly MAXIMUM_MARKUP_PERCENTAGE = 0.20; // 20% above face value
  private static readonly ESCROW_PERIOD_DAYS = 3; // 3 days escrow period
  private static readonly LISTING_DURATION_DAYS = 30; // 30 days default listing

  // Create resale listing
  static async createResaleListing(request: ResaleListingRequest): Promise<ResaleResult> {
    try {
      // Validate listing request
      const validation = this.validateResaleRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          errorMessage: validation.error,
        };
      }

      // Verify ticket ownership
      const ownsTicket = await this.verifyTicketOwnership(request.ticketId, request.sellerId);
      if (!ownsTicket) {
        return {
          success: false,
          errorMessage: 'You do not own this ticket or it has already been listed/sold',
        };
      }

      // Check if ticket is already listed
      const existingListing = await this.getActiveListingForTicket(request.ticketId);
      if (existingListing) {
        return {
          success: false,
          errorMessage: 'This ticket is already listed for resale',
        };
      }

      // Get ticket and event details
      const ticketDetails = await this.getTicketDetails(request.ticketId);
      if (!ticketDetails) {
        return {
          success: false,
          errorMessage: 'Unable to retrieve ticket details',
        };
      }

      // Calculate category based on price
      const category = this.categorizeResalePrice(request.resalePrice, request.originalPrice);

      // Set expiry date
      const expiryDate = request.expiryDate || new Date();
      if (!request.expiryDate) {
        expiryDate.setDate(expiryDate.getDate() + this.LISTING_DURATION_DAYS);
      }

      // Create listing (mock implementation)
      const listing: ResaleListing = {
        id: `listing_${Date.now()}`,
        ticketId: request.ticketId,
        sellerId: request.sellerId,
        sellerName: ticketDetails.sellerName,
        sellerRating: 4.5, // Mock rating
        resalePrice: request.resalePrice,
        originalPrice: request.originalPrice,
        description: request.description,
        category,
        isVerified: request.isVerified,
        isActive: true,
        views: 0,
        watchlists: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate,
        eventId: ticketDetails.eventId,
        eventTitle: ticketDetails.eventTitle,
        eventDate: ticketDetails.eventDate,
        ticketType: ticketDetails.ticketType,
        sectionInfo: ticketDetails.sectionInfo,
      };

      // In production, save to database
      console.log('🎫 Resale listing created:', listing);

      // Send listing confirmation email
      await this.sendListingConfirmationEmail(listing);

      return {
        success: true,
        listingId: listing.id,
        listing,
      };
    } catch (error) {
      console.error('Error creating resale listing:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Listing creation failed',
      };
    }
  }

  // Purchase resale ticket
  static async purchaseResaleTicket(request: ResalePurchaseRequest): Promise<ResaleResult> {
    try {
      // Get listing details
      const listing = await this.getListingById(request.listingId);
      if (!listing) {
        return {
          success: false,
          errorMessage: 'Listing not found',
        };
      }

      // Validate listing availability
      if (!listing.isActive) {
        return {
          success: false,
          errorMessage: 'This listing is no longer active',
        };
      }

      if (listing.expiryDate && new Date() > listing.expiryDate) {
        await this.expireListing(listing.id);
        return {
          success: false,
          errorMessage: 'This listing has expired',
        };
      }

      // Verify price agreement
      if (request.agreedPrice !== listing.resalePrice) {
        return {
          success: false,
          errorMessage: 'Price mismatch. Please refresh and try again.',
        };
      }

      // Calculate fees
      const fees = this.calculateResaleFees(listing.resalePrice);
      const totalPrice = listing.resalePrice + fees.buyerFee;

      // Process payment
      const paymentResult = await paymentGatewayManager.processPayment(
        'square', // Default payment method - can be configurable
        {
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: 'USD',
          orderId: `resale_${Date.now()}`,
          customerEmail: request.buyerEmail,
          customerName: request.buyerName,
          description: `Resale ticket for ${listing.eventTitle}`,
        },
        request.paymentMethodId
      );

      if (!paymentResult.success) {
        return {
          success: false,
          errorMessage: 'Payment processing failed: ' + paymentResult.errorMessage,
        };
      }

      // Create transaction record
      const escrowReleaseDate = new Date();
      escrowReleaseDate.setDate(escrowReleaseDate.getDate() + this.ESCROW_PERIOD_DAYS);

      const transaction: ResaleTransaction = {
        id: `txn_${Date.now()}`,
        listingId: listing.id,
        sellerId: listing.sellerId,
        buyerId: request.buyerId,
        ticketId: listing.ticketId,
        salePrice: listing.resalePrice,
        platformFee: fees.platformFee,
        sellerPayout: fees.sellerPayout,
        status: 'pending',
        paymentIntentId: paymentResult.paymentId,
        transferCode: this.generateTransferCode(),
        createdAt: new Date(),
        escrowReleaseDate,
      };

      // Deactivate listing
      await this.deactivateListing(listing.id);

      // In production, save transaction to database
      console.log('💰 Resale transaction created:', transaction);

      // Send confirmation emails
      await this.sendPurchaseConfirmationEmails(transaction, listing, request);

      // Initiate ticket transfer
      await this.initiateTicketTransfer(transaction);

      return {
        success: true,
        transactionId: transaction.id,
        transferCode: transaction.transferCode,
        transaction,
      };
    } catch (error) {
      console.error('Error purchasing resale ticket:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  // Search resale listings
  static async searchResaleListings(criteria: {
    eventId?: string;
    priceRange?: { min: number; max: number };
    category?: 'face_value' | 'below_face' | 'above_face';
    verifiedOnly?: boolean;
    sortBy?: 'price_low' | 'price_high' | 'newest' | 'ending_soon';
    limit?: number;
    offset?: number;
  }): Promise<ResaleListing[]> {
    try {
      // Mock implementation - in production, query database with filters
      console.log('🔍 Searching resale listings:', criteria);
      
      // Return mock listings for demonstration
      const mockListings: ResaleListing[] = [
        {
          id: 'listing_1',
          ticketId: 'ticket_1',
          sellerId: 'seller_1',
          sellerName: 'Sarah Johnson',
          sellerRating: 4.8,
          resalePrice: 40,
          originalPrice: 45,
          category: 'below_face',
          isVerified: true,
          isActive: true,
          views: 15,
          watchlists: 3,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          eventId: 'event_1',
          eventTitle: 'Chicago Stepping Championship',
          eventDate: new Date('2024-12-15'),
          ticketType: 'General Admission',
        },
        {
          id: 'listing_2',
          ticketId: 'ticket_2',
          sellerId: 'seller_2',
          sellerName: 'Mike Davis',
          sellerRating: 4.2,
          resalePrice: 50,
          originalPrice: 45,
          category: 'above_face',
          isVerified: false,
          isActive: true,
          views: 8,
          watchlists: 1,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          eventId: 'event_1',
          eventTitle: 'Chicago Stepping Championship',
          eventDate: new Date('2024-12-15'),
          ticketType: 'General Admission',
        },
      ];

      return mockListings;
    } catch (error) {
      console.error('Error searching resale listings:', error);
      return [];
    }
  }

  // Get user's resale listings
  static async getUserResaleListings(userId: string, status?: 'active' | 'sold' | 'expired'): Promise<ResaleListing[]> {
    try {
      // Mock implementation
      console.log('📋 Getting user resale listings:', { userId, status });
      return [];
    } catch (error) {
      console.error('Error getting user resale listings:', error);
      return [];
    }
  }

  // Get user's resale purchases
  static async getUserResalePurchases(userId: string): Promise<ResaleTransaction[]> {
    try {
      // Mock implementation
      console.log('📋 Getting user resale purchases:', userId);
      return [];
    } catch (error) {
      console.error('Error getting user resale purchases:', error);
      return [];
    }
  }

  // Cancel resale listing
  static async cancelResaleListing(listingId: string, sellerId: string): Promise<ResaleResult> {
    try {
      const listing = await this.getListingById(listingId);
      if (!listing) {
        return {
          success: false,
          errorMessage: 'Listing not found',
        };
      }

      if (listing.sellerId !== sellerId) {
        return {
          success: false,
          errorMessage: 'You do not have permission to cancel this listing',
        };
      }

      if (!listing.isActive) {
        return {
          success: false,
          errorMessage: 'Listing is already inactive',
        };
      }

      // Deactivate listing
      await this.deactivateListing(listingId);

      // Send cancellation notification
      await this.sendListingCancellationEmail(listing);

      console.log('❌ Resale listing cancelled:', listingId);

      return {
        success: true,
        listingId,
      };
    } catch (error) {
      console.error('Error cancelling resale listing:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  }

  // Helper methods

  private static validateResaleRequest(request: ResaleListingRequest): {
    valid: boolean;
    error?: string;
  } {
    if (request.resalePrice <= 0) {
      return { valid: false, error: 'Resale price must be greater than 0' };
    }

    if (request.resalePrice > request.originalPrice * (1 + this.MAXIMUM_MARKUP_PERCENTAGE)) {
      return { 
        valid: false, 
        error: `Resale price cannot exceed ${this.MAXIMUM_MARKUP_PERCENTAGE * 100}% above original price` 
      };
    }

    return { valid: true };
  }

  private static categorizeResalePrice(resalePrice: number, originalPrice: number): 'face_value' | 'below_face' | 'above_face' {
    if (resalePrice === originalPrice) return 'face_value';
    if (resalePrice < originalPrice) return 'below_face';
    return 'above_face';
  }

  private static calculateResaleFees(resalePrice: number): {
    platformFee: number;
    buyerFee: number;
    sellerFee: number;
    sellerPayout: number;
  } {
    const platformFee = Math.max(
      resalePrice * this.PLATFORM_FEE_PERCENTAGE,
      this.MINIMUM_PLATFORM_FEE
    );
    
    const buyerFee = platformFee * 0.5; // Buyer pays 50% of platform fee
    const sellerFee = platformFee * 0.5; // Seller pays 50% of platform fee
    const sellerPayout = resalePrice - sellerFee;

    return {
      platformFee,
      buyerFee,
      sellerFee,
      sellerPayout,
    };
  }

  private static generateTransferCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static async verifyTicketOwnership(ticketId: string, userId: string): Promise<boolean> {
    // Mock implementation
    console.log('🔍 Verifying ticket ownership:', { ticketId, userId });
    return true;
  }

  private static async getActiveListingForTicket(ticketId: string): Promise<ResaleListing | null> {
    // Mock implementation
    console.log('🔍 Checking active listing for ticket:', ticketId);
    return null;
  }

  private static async getTicketDetails(ticketId: string): Promise<any> {
    // Mock implementation
    console.log('🔍 Getting ticket details:', ticketId);
    return {
      eventId: 'event_1',
      eventTitle: 'Chicago Stepping Championship',
      eventDate: new Date('2024-12-15'),
      ticketType: 'General Admission',
      sellerName: 'Current Owner',
      sectionInfo: {
        section: 'General',
      },
    };
  }

  private static async getListingById(listingId: string): Promise<ResaleListing | null> {
    // Mock implementation
    console.log('🔍 Getting listing by ID:', listingId);
    return null;
  }

  private static async deactivateListing(listingId: string): Promise<void> {
    console.log('🔇 Deactivating listing:', listingId);
    // Mock implementation
  }

  private static async expireListing(listingId: string): Promise<void> {
    console.log('⏰ Expiring listing:', listingId);
    // Mock implementation
  }

  private static async initiateTicketTransfer(transaction: ResaleTransaction): Promise<void> {
    console.log('🔄 Initiating ticket transfer:', transaction.id);
    // Integration with TicketTransferService
  }

  // Email notification methods

  private static async sendListingConfirmationEmail(listing: ResaleListing): Promise<void> {
    console.log('📧 Sending listing confirmation email');
    // Mock implementation
  }

  private static async sendPurchaseConfirmationEmails(
    transaction: ResaleTransaction, 
    listing: ResaleListing, 
    request: ResalePurchaseRequest
  ): Promise<void> {
    console.log('📧 Sending purchase confirmation emails');
    // Mock implementation
  }

  private static async sendListingCancellationEmail(listing: ResaleListing): Promise<void> {
    console.log('📧 Sending listing cancellation email');
    // Mock implementation
  }
}