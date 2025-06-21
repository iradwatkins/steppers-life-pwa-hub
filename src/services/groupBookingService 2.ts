/**
 * Group Booking Service
 * Story B.013: Group Booking System
 */

import { supabase } from '@/integrations/supabase/client';
import { EmailService } from './emailService';
import { InventoryService } from './inventoryService';
import type { OrderWithItems } from './orderService';

export interface GroupBookingRequest {
  eventId: string;
  organizerId: string;
  groupName: string;
  description?: string;
  minTickets: number;
  maxTickets: number;
  ticketTypeId: string;
  discountPercentage?: number;
  deadlineDate: Date;
  isPublic: boolean;
  inviteCode?: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface GroupBooking {
  id: string;
  eventId: string;
  organizerId: string;
  groupName: string;
  description?: string;
  minTickets: number;
  maxTickets: number;
  ticketTypeId: string;
  discountPercentage: number;
  deadlineDate: Date;
  isPublic: boolean;
  inviteCode?: string;
  contactEmail: string;
  contactPhone?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  currentParticipants: number;
  totalTicketsReserved: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupParticipant {
  id: string;
  groupBookingId: string;
  userId?: string;
  email: string;
  name: string;
  phone?: string;
  ticketsRequested: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  joinedAt: Date;
  confirmedAt?: Date;
  orderId?: string;
}

export interface GroupBookingResult {
  success: boolean;
  groupBookingId?: string;
  inviteCode?: string;
  errorMessage?: string;
  groupBooking?: GroupBooking;
}

export interface JoinGroupResult {
  success: boolean;
  participantId?: string;
  waitingForPayment?: boolean;
  groupIsFull?: boolean;
  errorMessage?: string;
}

export class GroupBookingService {
  private static readonly INVITE_CODE_LENGTH = 8;
  private static readonly MAX_GROUP_SIZE = 50;
  private static readonly MIN_GROUP_SIZE = 2;

  // Generate unique invite code
  static generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < this.INVITE_CODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create new group booking
  static async createGroupBooking(request: GroupBookingRequest): Promise<GroupBookingResult> {
    try {
      // Validate request
      const validation = this.validateGroupBookingRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          errorMessage: validation.error,
        };
      }

      // Check inventory availability
      const inventoryService = InventoryService.getInstance();
      const availability = await inventoryService.checkAvailability(
        request.ticketTypeId,
        request.maxTickets,
        false
      );

      if (!availability.available) {
        return {
          success: false,
          errorMessage: `Only ${availability.availableQuantity} tickets available. Cannot create group booking for ${request.maxTickets} tickets.`,
        };
      }

      // Generate invite code if not provided
      const inviteCode = request.inviteCode || this.generateInviteCode();

      // Create group booking record (mock implementation)
      const groupBooking: GroupBooking = {
        id: `group_${Date.now()}`,
        eventId: request.eventId,
        organizerId: request.organizerId,
        groupName: request.groupName,
        description: request.description,
        minTickets: request.minTickets,
        maxTickets: request.maxTickets,
        ticketTypeId: request.ticketTypeId,
        discountPercentage: request.discountPercentage || 0,
        deadlineDate: request.deadlineDate,
        isPublic: request.isPublic,
        inviteCode,
        contactEmail: request.contactEmail,
        contactPhone: request.contactPhone,
        status: 'active',
        currentParticipants: 1, // Organizer counts as first participant
        totalTicketsReserved: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // In production, save to database
      console.log('👥 Group booking created:', groupBooking);

      // Add organizer as first participant
      await this.addParticipant({
        groupBookingId: groupBooking.id,
        userId: request.organizerId,
        email: request.contactEmail,
        name: 'Group Organizer',
        phone: request.contactPhone,
        ticketsRequested: 1,
        status: 'confirmed',
        paymentStatus: 'unpaid',
        joinedAt: new Date(),
      });

      // Send confirmation email to organizer
      await this.sendGroupBookingConfirmationEmail(groupBooking);

      return {
        success: true,
        groupBookingId: groupBooking.id,
        inviteCode,
        groupBooking,
      };
    } catch (error) {
      console.error('Error creating group booking:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Group booking creation failed',
      };
    }
  }

  // Join existing group booking
  static async joinGroupBooking(
    inviteCode: string,
    participantInfo: {
      userId?: string;
      email: string;
      name: string;
      phone?: string;
      ticketsRequested: number;
    }
  ): Promise<JoinGroupResult> {
    try {
      // Find group booking by invite code
      const groupBooking = await this.getGroupBookingByInviteCode(inviteCode);
      if (!groupBooking) {
        return {
          success: false,
          errorMessage: 'Invalid invite code or group booking not found',
        };
      }

      // Check if group booking is still active
      if (groupBooking.status !== 'active') {
        return {
          success: false,
          errorMessage: 'This group booking is no longer active',
        };
      }

      // Check deadline
      if (new Date() > groupBooking.deadlineDate) {
        await this.expireGroupBooking(groupBooking.id);
        return {
          success: false,
          errorMessage: 'Group booking deadline has passed',
        };
      }

      // Check if participant is already in the group
      const existingParticipant = await this.getParticipantByEmail(groupBooking.id, participantInfo.email);
      if (existingParticipant) {
        return {
          success: false,
          errorMessage: 'You are already part of this group booking',
        };
      }

      // Check group capacity
      const newTotalTickets = groupBooking.totalTicketsReserved + participantInfo.ticketsRequested;
      if (newTotalTickets > groupBooking.maxTickets) {
        return {
          success: false,
          groupIsFull: true,
          errorMessage: `Group booking is full. Only ${groupBooking.maxTickets - groupBooking.totalTicketsReserved} tickets remaining.`,
        };
      }

      // Check inventory availability
      const inventoryService = InventoryService.getInstance();
      const availability = await inventoryService.checkAvailability(
        groupBooking.ticketTypeId,
        participantInfo.ticketsRequested,
        false
      );

      if (!availability.available) {
        return {
          success: false,
          errorMessage: `Only ${availability.availableQuantity} tickets available`,
        };
      }

      // Add participant to group
      const participant = await this.addParticipant({
        groupBookingId: groupBooking.id,
        userId: participantInfo.userId,
        email: participantInfo.email,
        name: participantInfo.name,
        phone: participantInfo.phone,
        ticketsRequested: participantInfo.ticketsRequested,
        status: 'pending',
        paymentStatus: 'unpaid',
        joinedAt: new Date(),
      });

      // Update group booking totals
      await this.updateGroupBookingTotals(groupBooking.id);

      // Send welcome email to participant
      await this.sendParticipantWelcomeEmail(participant, groupBooking);

      // Notify organizer of new participant
      await this.notifyOrganizerOfNewParticipant(groupBooking, participant);

      // Check if group is now complete
      await this.checkGroupCompletionStatus(groupBooking.id);

      return {
        success: true,
        participantId: participant.id,
        waitingForPayment: true,
      };
    } catch (error) {
      console.error('Error joining group booking:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to join group booking',
      };
    }
  }

  // Process group booking completion
  static async completeGroupBooking(groupBookingId: string): Promise<GroupBookingResult> {
    try {
      const groupBooking = await this.getGroupBookingById(groupBookingId);
      if (!groupBooking) {
        return {
          success: false,
          errorMessage: 'Group booking not found',
        };
      }

      if (groupBooking.status !== 'active') {
        return {
          success: false,
          errorMessage: 'Group booking is not active',
        };
      }

      // Check if minimum requirements are met
      if (groupBooking.totalTicketsReserved < groupBooking.minTickets) {
        return {
          success: false,
          errorMessage: `Group booking requires minimum ${groupBooking.minTickets} tickets. Only ${groupBooking.totalTicketsReserved} reserved.`,
        };
      }

      // Get all confirmed participants
      const participants = await this.getGroupParticipants(groupBookingId, 'confirmed');
      
      // Process individual orders for each participant
      const orderResults = [];
      for (const participant of participants) {
        if (participant.paymentStatus === 'paid' && !participant.orderId) {
          const orderResult = await this.createIndividualOrder(participant, groupBooking);
          orderResults.push(orderResult);
        }
      }

      // Update group booking status
      groupBooking.status = 'completed';
      groupBooking.updatedAt = new Date();
      
      console.log('✅ Group booking completed:', groupBooking);

      // Send completion notifications
      await this.sendGroupCompletionNotifications(groupBooking, participants);

      return {
        success: true,
        groupBookingId: groupBooking.id,
        groupBooking,
      };
    } catch (error) {
      console.error('Error completing group booking:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Group booking completion failed',
      };
    }
  }

  // Cancel group booking
  static async cancelGroupBooking(
    groupBookingId: string,
    organizerId: string,
    reason?: string
  ): Promise<GroupBookingResult> {
    try {
      const groupBooking = await this.getGroupBookingById(groupBookingId);
      if (!groupBooking) {
        return {
          success: false,
          errorMessage: 'Group booking not found',
        };
      }

      if (groupBooking.organizerId !== organizerId) {
        return {
          success: false,
          errorMessage: 'Only the organizer can cancel this group booking',
        };
      }

      if (groupBooking.status !== 'active') {
        return {
          success: false,
          errorMessage: 'Group booking is not active',
        };
      }

      // Update group booking status
      groupBooking.status = 'cancelled';
      groupBooking.updatedAt = new Date();

      // Process refunds for paid participants
      const participants = await this.getGroupParticipants(groupBookingId);
      for (const participant of participants) {
        if (participant.paymentStatus === 'paid') {
          await this.processParticipantRefund(participant, reason);
        }
      }

      // Send cancellation notifications
      await this.sendGroupCancellationNotifications(groupBooking, participants, reason);

      console.log('❌ Group booking cancelled:', groupBooking);

      return {
        success: true,
        groupBookingId: groupBooking.id,
        groupBooking,
      };
    } catch (error) {
      console.error('Error cancelling group booking:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Group booking cancellation failed',
      };
    }
  }

  // Get group booking details
  static async getGroupBookingDetails(inviteCode: string): Promise<GroupBooking | null> {
    try {
      return await this.getGroupBookingByInviteCode(inviteCode);
    } catch (error) {
      console.error('Error getting group booking details:', error);
      return null;
    }
  }

  // Get group participants
  static async getGroupParticipants(
    groupBookingId: string,
    status?: 'pending' | 'confirmed' | 'cancelled'
  ): Promise<GroupParticipant[]> {
    try {
      // Mock implementation - in production, query database
      console.log('👥 Getting group participants:', { groupBookingId, status });
      return [];
    } catch (error) {
      console.error('Error getting group participants:', error);
      return [];
    }
  }

  // Get user's group bookings
  static async getUserGroupBookings(userId: string): Promise<GroupBooking[]> {
    try {
      // Mock implementation - in production, query database
      console.log('📋 Getting user group bookings:', userId);
      return [];
    } catch (error) {
      console.error('Error getting user group bookings:', error);
      return [];
    }
  }

  // Private helper methods

  private static validateGroupBookingRequest(request: GroupBookingRequest): {
    valid: boolean;
    error?: string;
  } {
    if (request.minTickets < this.MIN_GROUP_SIZE) {
      return { valid: false, error: `Minimum tickets must be at least ${this.MIN_GROUP_SIZE}` };
    }

    if (request.maxTickets > this.MAX_GROUP_SIZE) {
      return { valid: false, error: `Maximum tickets cannot exceed ${this.MAX_GROUP_SIZE}` };
    }

    if (request.minTickets > request.maxTickets) {
      return { valid: false, error: 'Minimum tickets cannot be greater than maximum tickets' };
    }

    if (request.deadlineDate <= new Date()) {
      return { valid: false, error: 'Deadline must be in the future' };
    }

    if (request.discountPercentage && (request.discountPercentage < 0 || request.discountPercentage > 50)) {
      return { valid: false, error: 'Discount percentage must be between 0 and 50' };
    }

    return { valid: true };
  }

  private static async getGroupBookingByInviteCode(inviteCode: string): Promise<GroupBooking | null> {
    // Mock implementation
    console.log('🔍 Finding group booking by invite code:', inviteCode);
    return null;
  }

  private static async getGroupBookingById(groupBookingId: string): Promise<GroupBooking | null> {
    // Mock implementation
    console.log('🔍 Finding group booking by ID:', groupBookingId);
    return null;
  }

  private static async getParticipantByEmail(groupBookingId: string, email: string): Promise<GroupParticipant | null> {
    // Mock implementation
    console.log('🔍 Finding participant by email:', { groupBookingId, email });
    return null;
  }

  private static async addParticipant(participantData: Omit<GroupParticipant, 'id'>): Promise<GroupParticipant> {
    const participant: GroupParticipant = {
      id: `participant_${Date.now()}`,
      ...participantData,
    };
    
    console.log('👤 Adding participant:', participant);
    return participant;
  }

  private static async updateGroupBookingTotals(groupBookingId: string): Promise<void> {
    console.log('📊 Updating group booking totals:', groupBookingId);
    // Mock implementation
  }

  private static async expireGroupBooking(groupBookingId: string): Promise<void> {
    console.log('⏰ Expiring group booking:', groupBookingId);
    // Mock implementation
  }

  private static async checkGroupCompletionStatus(groupBookingId: string): Promise<void> {
    console.log('✅ Checking group completion status:', groupBookingId);
    // Mock implementation
  }

  private static async createIndividualOrder(participant: GroupParticipant, groupBooking: GroupBooking): Promise<any> {
    console.log('🎫 Creating individual order for participant:', participant.id);
    // Mock implementation - in production, create actual order
    return { success: true, orderId: `order_${Date.now()}` };
  }

  private static async processParticipantRefund(participant: GroupParticipant, reason?: string): Promise<void> {
    console.log('💰 Processing refund for participant:', participant.id);
    // Mock implementation
  }

  // Email notification methods

  private static async sendGroupBookingConfirmationEmail(groupBooking: GroupBooking): Promise<void> {
    console.log('📧 Sending group booking confirmation email');
    // Mock implementation
  }

  private static async sendParticipantWelcomeEmail(participant: GroupParticipant, groupBooking: GroupBooking): Promise<void> {
    console.log('📧 Sending participant welcome email');
    // Mock implementation
  }

  private static async notifyOrganizerOfNewParticipant(groupBooking: GroupBooking, participant: GroupParticipant): Promise<void> {
    console.log('📧 Notifying organizer of new participant');
    // Mock implementation
  }

  private static async sendGroupCompletionNotifications(groupBooking: GroupBooking, participants: GroupParticipant[]): Promise<void> {
    console.log('📧 Sending group completion notifications');
    // Mock implementation
  }

  private static async sendGroupCancellationNotifications(
    groupBooking: GroupBooking, 
    participants: GroupParticipant[], 
    reason?: string
  ): Promise<void> {
    console.log('📧 Sending group cancellation notifications');
    // Mock implementation
  }
}