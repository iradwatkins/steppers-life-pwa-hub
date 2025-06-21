/**
 * Ticket Transfer Service
 * Story B.012: Ticket Transfer System
 */

import { supabase } from '@/integrations/supabase/client';
import { EmailService } from './emailService';
import type { OrderWithItems } from './orderService';

export interface TransferRequest {
  ticketId: string;
  fromUserId: string;
  toEmail: string;
  toName: string;
  transferMessage?: string;
  transferType: 'direct' | 'link';
}

export interface TransferLink {
  id: string;
  ticketId: string;
  fromUserId: string;
  linkCode: string;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface TicketTransfer {
  id: string;
  ticketId: string;
  fromUserId: string;
  toUserId?: string;
  toEmail: string;
  toName: string;
  transferMessage?: string;
  transferCode: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  linkCode?: string;
}

export interface TransferResult {
  success: boolean;
  transferId?: string;
  transferCode?: string;
  linkCode?: string;
  expiresAt?: Date;
  errorMessage?: string;
}

export class TicketTransferService {
  private static readonly TRANSFER_EXPIRY_HOURS = 72; // 3 days
  private static readonly LINK_EXPIRY_HOURS = 168; // 7 days
  private static readonly MAX_TRANSFER_ATTEMPTS = 3;

  // Generate unique transfer code
  static generateTransferCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate unique link code
  static generateLinkCode(): string {
    return `tl_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Initiate direct transfer to specific email
  static async initiateDirectTransfer(request: TransferRequest): Promise<TransferResult> {
    try {
      // Validate ticket ownership
      const isOwner = await this.validateTicketOwnership(request.ticketId, request.fromUserId);
      if (!isOwner) {
        return {
          success: false,
          errorMessage: 'You do not have permission to transfer this ticket',
        };
      }

      // Check if ticket is already being transferred
      const existingTransfer = await this.getActiveTransferForTicket(request.ticketId);
      if (existingTransfer) {
        return {
          success: false,
          errorMessage: 'This ticket is already being transferred',
        };
      }

      // Check transfer limits
      const transferCount = await this.getTransferCountForTicket(request.ticketId);
      if (transferCount >= this.MAX_TRANSFER_ATTEMPTS) {
        return {
          success: false,
          errorMessage: 'Maximum transfer attempts exceeded for this ticket',
        };
      }

      const transferCode = this.generateTransferCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.TRANSFER_EXPIRY_HOURS);

      // Create transfer record (mock implementation)
      const transfer: TicketTransfer = {
        id: `transfer_${Date.now()}`,
        ticketId: request.ticketId,
        fromUserId: request.fromUserId,
        toEmail: request.toEmail,
        toName: request.toName,
        transferMessage: request.transferMessage,
        transferCode,
        status: 'pending',
        createdAt: new Date(),
        expiresAt,
      };

      // In production, save to database
      console.log('📧 Direct transfer initiated:', transfer);

      // Send transfer email to recipient
      await this.sendTransferEmail(transfer);

      // Send confirmation email to sender
      await this.sendTransferConfirmationEmail(transfer);

      return {
        success: true,
        transferId: transfer.id,
        transferCode,
        expiresAt,
      };
    } catch (error) {
      console.error('Error initiating direct transfer:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Transfer initiation failed',
      };
    }
  }

  // Create transferable link
  static async createTransferLink(
    ticketId: string,
    fromUserId: string,
    maxUses: number = 1,
    expiryHours: number = this.LINK_EXPIRY_HOURS
  ): Promise<TransferResult> {
    try {
      // Validate ticket ownership
      const isOwner = await this.validateTicketOwnership(ticketId, fromUserId);
      if (!isOwner) {
        return {
          success: false,
          errorMessage: 'You do not have permission to create a transfer link for this ticket',
        };
      }

      // Check if ticket is already being transferred
      const existingTransfer = await this.getActiveTransferForTicket(ticketId);
      if (existingTransfer) {
        return {
          success: false,
          errorMessage: 'This ticket is already being transferred',
        };
      }

      const linkCode = this.generateLinkCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiryHours);

      // Create transfer link record (mock implementation)
      const transferLink: TransferLink = {
        id: `link_${Date.now()}`,
        ticketId,
        fromUserId,
        linkCode,
        expiresAt,
        maxUses,
        usedCount: 0,
        isActive: true,
        createdAt: new Date(),
      };

      // In production, save to database
      console.log('🔗 Transfer link created:', transferLink);

      return {
        success: true,
        linkCode,
        expiresAt,
      };
    } catch (error) {
      console.error('Error creating transfer link:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Link creation failed',
      };
    }
  }

  // Accept transfer using transfer code
  static async acceptTransfer(
    transferCode: string,
    recipientEmail: string,
    recipientUserId?: string
  ): Promise<TransferResult> {
    try {
      // Find transfer by code (mock implementation)
      const transfer = await this.getTransferByCode(transferCode);
      if (!transfer) {
        return {
          success: false,
          errorMessage: 'Invalid or expired transfer code',
        };
      }

      if (transfer.status !== 'pending') {
        return {
          success: false,
          errorMessage: 'This transfer has already been processed',
        };
      }

      if (new Date() > transfer.expiresAt) {
        await this.expireTransfer(transfer.id);
        return {
          success: false,
          errorMessage: 'Transfer has expired',
        };
      }

      if (transfer.toEmail.toLowerCase() !== recipientEmail.toLowerCase()) {
        return {
          success: false,
          errorMessage: 'Transfer code does not match your email address',
        };
      }

      // Complete the transfer
      await this.completeTransfer(transfer.id, recipientUserId);

      // Send completion notifications
      await this.sendTransferCompletionEmails(transfer, recipientUserId);

      return {
        success: true,
        transferId: transfer.id,
      };
    } catch (error) {
      console.error('Error accepting transfer:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Transfer acceptance failed',
      };
    }
  }

  // Accept transfer using link code
  static async acceptTransferFromLink(
    linkCode: string,
    recipientEmail: string,
    recipientName: string,
    recipientUserId?: string
  ): Promise<TransferResult> {
    try {
      // Find transfer link by code (mock implementation)
      const transferLink = await this.getTransferLinkByCode(linkCode);
      if (!transferLink) {
        return {
          success: false,
          errorMessage: 'Invalid or expired transfer link',
        };
      }

      if (!transferLink.isActive) {
        return {
          success: false,
          errorMessage: 'This transfer link is no longer active',
        };
      }

      if (new Date() > transferLink.expiresAt) {
        await this.deactivateTransferLink(transferLink.id);
        return {
          success: false,
          errorMessage: 'Transfer link has expired',
        };
      }

      if (transferLink.usedCount >= transferLink.maxUses) {
        return {
          success: false,
          errorMessage: 'Transfer link has reached maximum uses',
        };
      }

      // Create direct transfer from link
      const transferCode = this.generateTransferCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry for link-based transfers

      const transfer: TicketTransfer = {
        id: `transfer_link_${Date.now()}`,
        ticketId: transferLink.ticketId,
        fromUserId: transferLink.fromUserId,
        toEmail: recipientEmail,
        toName: recipientName,
        transferCode,
        status: 'pending',
        createdAt: new Date(),
        expiresAt,
        linkCode,
      };

      // Update link usage count
      await this.incrementLinkUsage(transferLink.id);

      // Auto-complete transfer for link-based transfers
      await this.completeTransfer(transfer.id, recipientUserId);

      // Send notification emails
      await this.sendLinkTransferNotifications(transfer, transferLink);

      return {
        success: true,
        transferId: transfer.id,
        transferCode,
      };
    } catch (error) {
      console.error('Error accepting transfer from link:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Link transfer failed',
      };
    }
  }

  // Cancel transfer
  static async cancelTransfer(transferId: string, userId: string): Promise<TransferResult> {
    try {
      const transfer = await this.getTransferById(transferId);
      if (!transfer) {
        return {
          success: false,
          errorMessage: 'Transfer not found',
        };
      }

      if (transfer.fromUserId !== userId) {
        return {
          success: false,
          errorMessage: 'You do not have permission to cancel this transfer',
        };
      }

      if (transfer.status !== 'pending') {
        return {
          success: false,
          errorMessage: 'Only pending transfers can be cancelled',
        };
      }

      // Update transfer status
      transfer.status = 'cancelled';
      console.log('❌ Transfer cancelled:', transfer);

      // Send cancellation notifications
      await this.sendTransferCancellationEmails(transfer);

      return {
        success: true,
        transferId: transfer.id,
      };
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Transfer cancellation failed',
      };
    }
  }

  // Get transfer history for user
  static async getUserTransferHistory(userId: string): Promise<TicketTransfer[]> {
    try {
      // Mock implementation - in production, query database
      console.log('📋 Getting transfer history for user:', userId);
      return [];
    } catch (error) {
      console.error('Error getting transfer history:', error);
      return [];
    }
  }

  // Private helper methods

  private static async validateTicketOwnership(ticketId: string, userId: string): Promise<boolean> {
    try {
      // Mock implementation - in production, check database
      console.log('🔍 Validating ticket ownership:', { ticketId, userId });
      return true; // Mock: always return true for demonstration
    } catch (error) {
      console.error('Error validating ticket ownership:', error);
      return false;
    }
  }

  private static async getActiveTransferForTicket(ticketId: string): Promise<TicketTransfer | null> {
    try {
      // Mock implementation
      console.log('🔍 Checking active transfers for ticket:', ticketId);
      return null; // Mock: no active transfers
    } catch (error) {
      console.error('Error checking active transfers:', error);
      return null;
    }
  }

  private static async getTransferCountForTicket(ticketId: string): Promise<number> {
    try {
      // Mock implementation
      console.log('🔍 Getting transfer count for ticket:', ticketId);
      return 0; // Mock: no previous transfers
    } catch (error) {
      console.error('Error getting transfer count:', error);
      return 0;
    }
  }

  private static async getTransferByCode(transferCode: string): Promise<TicketTransfer | null> {
    try {
      // Mock implementation
      console.log('🔍 Finding transfer by code:', transferCode);
      return null; // Mock implementation
    } catch (error) {
      console.error('Error finding transfer by code:', error);
      return null;
    }
  }

  private static async getTransferLinkByCode(linkCode: string): Promise<TransferLink | null> {
    try {
      // Mock implementation
      console.log('🔍 Finding transfer link by code:', linkCode);
      return null; // Mock implementation
    } catch (error) {
      console.error('Error finding transfer link by code:', error);
      return null;
    }
  }

  private static async getTransferById(transferId: string): Promise<TicketTransfer | null> {
    try {
      // Mock implementation
      console.log('🔍 Finding transfer by ID:', transferId);
      return null; // Mock implementation
    } catch (error) {
      console.error('Error finding transfer by ID:', error);
      return null;
    }
  }

  private static async completeTransfer(transferId: string, recipientUserId?: string): Promise<void> {
    console.log('✅ Completing transfer:', { transferId, recipientUserId });
    // Mock implementation - in production, update database
  }

  private static async expireTransfer(transferId: string): Promise<void> {
    console.log('⏰ Expiring transfer:', transferId);
    // Mock implementation
  }

  private static async deactivateTransferLink(linkId: string): Promise<void> {
    console.log('🔗❌ Deactivating transfer link:', linkId);
    // Mock implementation
  }

  private static async incrementLinkUsage(linkId: string): Promise<void> {
    console.log('🔗📈 Incrementing link usage:', linkId);
    // Mock implementation
  }

  // Email notification methods

  private static async sendTransferEmail(transfer: TicketTransfer): Promise<void> {
    try {
      console.log('📧 Sending transfer email to recipient:', transfer.toEmail);
      // Mock email sending - in production, use EmailService
    } catch (error) {
      console.error('Error sending transfer email:', error);
    }
  }

  private static async sendTransferConfirmationEmail(transfer: TicketTransfer): Promise<void> {
    try {
      console.log('📧 Sending transfer confirmation email to sender');
      // Mock email sending
    } catch (error) {
      console.error('Error sending transfer confirmation email:', error);
    }
  }

  private static async sendTransferCompletionEmails(transfer: TicketTransfer, recipientUserId?: string): Promise<void> {
    try {
      console.log('📧 Sending transfer completion emails');
      // Mock email sending
    } catch (error) {
      console.error('Error sending transfer completion emails:', error);
    }
  }

  private static async sendLinkTransferNotifications(transfer: TicketTransfer, transferLink: TransferLink): Promise<void> {
    try {
      console.log('📧 Sending link transfer notifications');
      // Mock email sending
    } catch (error) {
      console.error('Error sending link transfer notifications:', error);
    }
  }

  private static async sendTransferCancellationEmails(transfer: TicketTransfer): Promise<void> {
    try {
      console.log('📧 Sending transfer cancellation emails');
      // Mock email sending
    } catch (error) {
      console.error('Error sending transfer cancellation emails:', error);
    }
  }
}