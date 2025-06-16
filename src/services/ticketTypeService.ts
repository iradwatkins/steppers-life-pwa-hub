import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TicketType = Database['public']['Tables']['ticket_types']['Row'];
type TicketTypeInsert = Database['public']['Tables']['ticket_types']['Insert'];
type TicketTypeUpdate = Database['public']['Tables']['ticket_types']['Update'];

export interface EnhancedTicketTypeData {
  eventId: string;
  name: string;
  description?: string;
  basePrice: number;
  quantityAvailable: number;
  // Enhanced pricing features
  pricingTier: 'basic' | 'premium' | 'vip' | 'early_bird' | 'last_minute';
  discountPercentage?: number;
  validFrom?: string;
  validUntil?: string;
  maxPerOrder?: number;
  // Perks and restrictions
  includes?: string[];
  restrictions?: {
    ageMin?: number;
    ageMax?: number;
    memberOnly?: boolean;
    requiresApproval?: boolean;
  };
  // Dynamic pricing
  isDynamic?: boolean;
  dynamicPricingRules?: {
    earlyBird?: { endDate: string; discount: number };
    lastMinute?: { startDate: string; surcharge: number };
    groupDiscount?: { minQuantity: number; discount: number };
  };
}

export interface TicketTypeWithPricing extends TicketType {
  currentPrice: number;
  originalPrice: number;
  discountAmount?: number;
  discountPercentage?: number;
  availableQuantity: number;
  pricingInfo?: {
    isEarlyBird?: boolean;
    isLastMinute?: boolean;
    hasGroupDiscount?: boolean;
    priceValidUntil?: string;
  };
}

export class TicketTypeService {
  // Create enhanced ticket type with pricing logic
  static async createEnhancedTicketType(data: EnhancedTicketTypeData): Promise<TicketType | null> {
    try {
      const currentPrice = this.calculateCurrentPrice(data);
      
      const ticketTypeData: TicketTypeInsert = {
        event_id: data.eventId,
        name: data.name,
        description: data.description,
        price: currentPrice,
        quantity_available: data.quantityAvailable,
        sale_start_date: data.validFrom,
        sale_end_date: data.validUntil,
        max_per_order: data.maxPerOrder || 10,
        includes_perks: {
          tier: data.pricingTier,
          basePrice: data.basePrice,
          includes: data.includes || [],
          restrictions: data.restrictions || {},
          dynamicPricing: data.dynamicPricingRules || {},
          discountPercentage: data.discountPercentage
        }
      };

      const { data: ticketType, error } = await supabase
        .from('ticket_types')
        .insert(ticketTypeData)
        .select()
        .single();

      if (error) throw error;
      return ticketType;
    } catch (error) {
      console.error('Error creating enhanced ticket type:', error);
      return null;
    }
  }

  // Get enhanced ticket types with dynamic pricing
  static async getEnhancedTicketTypes(eventId: string): Promise<TicketTypeWithPricing[]> {
    try {
      const { data: ticketTypes, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      return (ticketTypes || []).map(ticketType => {
        const enhanced = this.enhanceTicketTypeWithPricing(ticketType);
        return enhanced;
      });
    } catch (error) {
      console.error('Error fetching enhanced ticket types:', error);
      return [];
    }
  }

  // Enhanced pricing calculation
  static enhanceTicketTypeWithPricing(ticketType: TicketType): TicketTypeWithPricing {
    const perks = ticketType.includes_perks as any;
    const basePrice = perks?.basePrice || ticketType.price;
    const now = new Date();
    
    let currentPrice = basePrice;
    let discountAmount = 0;
    let discountPercentage = 0;
    const pricingInfo: any = {};

    // Apply early bird pricing
    if (perks?.dynamicPricing?.earlyBird) {
      const earlyBirdEnd = new Date(perks.dynamicPricing.earlyBird.endDate);
      if (now <= earlyBirdEnd) {
        discountPercentage = perks.dynamicPricing.earlyBird.discount;
        discountAmount = (basePrice * discountPercentage) / 100;
        currentPrice = basePrice - discountAmount;
        pricingInfo.isEarlyBird = true;
        pricingInfo.priceValidUntil = earlyBirdEnd.toISOString();
      }
    }

    // Apply last minute surcharge
    if (perks?.dynamicPricing?.lastMinute && !pricingInfo.isEarlyBird) {
      const lastMinuteStart = new Date(perks.dynamicPricing.lastMinute.startDate);
      if (now >= lastMinuteStart) {
        const surcharge = (basePrice * perks.dynamicPricing.lastMinute.surcharge) / 100;
        currentPrice = basePrice + surcharge;
        pricingInfo.isLastMinute = true;
      }
    }

    // Apply fixed discount percentage if set
    if (perks?.discountPercentage && !pricingInfo.isEarlyBird && !pricingInfo.isLastMinute) {
      discountPercentage = perks.discountPercentage;
      discountAmount = (basePrice * discountPercentage) / 100;
      currentPrice = basePrice - discountAmount;
    }

    // Check for group discount availability
    if (perks?.dynamicPricing?.groupDiscount) {
      pricingInfo.hasGroupDiscount = true;
    }

    return {
      ...ticketType,
      currentPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimals
      originalPrice: basePrice,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountPercentage,
      availableQuantity: ticketType.quantity_available - (ticketType.quantity_sold || 0),
      pricingInfo
    };
  }

  // Calculate current price based on rules
  static calculateCurrentPrice(data: EnhancedTicketTypeData): number {
    let price = data.basePrice;

    // Apply discount percentage
    if (data.discountPercentage) {
      price = price * (1 - data.discountPercentage / 100);
    }

    // Apply early bird discount if currently active
    if (data.dynamicPricingRules?.earlyBird) {
      const earlyBirdEnd = new Date(data.dynamicPricingRules.earlyBird.endDate);
      if (new Date() <= earlyBirdEnd) {
        const discount = data.dynamicPricingRules.earlyBird.discount;
        price = price * (1 - discount / 100);
      }
    }

    return Math.round(price * 100) / 100;
  }

  // Calculate group discount price
  static calculateGroupPrice(ticketType: TicketTypeWithPricing, quantity: number): {
    totalPrice: number;
    discountAmount: number;
    pricePerTicket: number;
  } {
    const perks = ticketType.includes_perks as any;
    let pricePerTicket = ticketType.currentPrice;
    let discountAmount = 0;

    // Apply group discount if eligible
    if (perks?.dynamicPricing?.groupDiscount && quantity >= perks.dynamicPricing.groupDiscount.minQuantity) {
      const groupDiscountPercent = perks.dynamicPricing.groupDiscount.discount;
      discountAmount = (ticketType.currentPrice * quantity * groupDiscountPercent) / 100;
      pricePerTicket = ticketType.currentPrice * (1 - groupDiscountPercent / 100);
    }

    return {
      totalPrice: Math.round(pricePerTicket * quantity * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      pricePerTicket: Math.round(pricePerTicket * 100) / 100
    };
  }

  // Update ticket type pricing
  static async updateTicketTypePricing(
    ticketTypeId: string, 
    updates: Partial<EnhancedTicketTypeData>
  ): Promise<TicketType | null> {
    try {
      // Get current ticket type
      const { data: currentTicketType, error: fetchError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketTypeId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new price if needed
      let newPrice = currentTicketType.price;
      if (updates.basePrice || updates.discountPercentage || updates.dynamicPricingRules) {
        const enhancedData: EnhancedTicketTypeData = {
          eventId: currentTicketType.event_id,
          name: updates.name || currentTicketType.name,
          basePrice: updates.basePrice || (currentTicketType.includes_perks as any)?.basePrice || currentTicketType.price,
          quantityAvailable: updates.quantityAvailable || currentTicketType.quantity_available,
          pricingTier: updates.pricingTier || (currentTicketType.includes_perks as any)?.tier || 'basic',
          discountPercentage: updates.discountPercentage,
          dynamicPricingRules: updates.dynamicPricingRules
        };
        newPrice = this.calculateCurrentPrice(enhancedData);
      }

      // Merge perks data
      const currentPerks = (currentTicketType.includes_perks as any) || {};
      const updatedPerks = {
        ...currentPerks,
        ...(updates.pricingTier && { tier: updates.pricingTier }),
        ...(updates.basePrice && { basePrice: updates.basePrice }),
        ...(updates.includes && { includes: updates.includes }),
        ...(updates.restrictions && { restrictions: updates.restrictions }),
        ...(updates.dynamicPricingRules && { dynamicPricing: updates.dynamicPricingRules }),
        ...(updates.discountPercentage !== undefined && { discountPercentage: updates.discountPercentage })
      };

      const updateData: TicketTypeUpdate = {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        price: newPrice,
        ...(updates.quantityAvailable && { quantity_available: updates.quantityAvailable }),
        ...(updates.validFrom && { sale_start_date: updates.validFrom }),
        ...(updates.validUntil && { sale_end_date: updates.validUntil }),
        ...(updates.maxPerOrder && { max_per_order: updates.maxPerOrder }),
        includes_perks: updatedPerks,
        updated_at: new Date().toISOString()
      };

      const { data: updatedTicketType, error } = await supabase
        .from('ticket_types')
        .update(updateData)
        .eq('id', ticketTypeId)
        .select()
        .single();

      if (error) throw error;
      return updatedTicketType;
    } catch (error) {
      console.error('Error updating ticket type pricing:', error);
      return null;
    }
  }

  // Get pricing tiers with their characteristics
  static getPricingTiers(): Array<{
    id: string;
    name: string;
    description: string;
    features: string[];
    suggestedPriceMultiplier: number;
  }> {
    return [
      {
        id: 'basic',
        name: 'General Admission',
        description: 'Standard access to the event',
        features: ['Event access', 'Basic amenities'],
        suggestedPriceMultiplier: 1.0
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Discounted tickets for early purchasers',
        features: ['Event access', 'Early bird savings', 'Basic amenities'],
        suggestedPriceMultiplier: 0.8
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Enhanced experience with additional perks',
        features: ['Event access', 'Premium seating', 'Welcome drink', 'Event program'],
        suggestedPriceMultiplier: 1.5
      },
      {
        id: 'vip',
        name: 'VIP',
        description: 'Exclusive access and premium amenities',
        features: ['Event access', 'VIP seating', 'Meet & greet', 'Complimentary refreshments', 'Event swag'],
        suggestedPriceMultiplier: 2.5
      },
      {
        id: 'last_minute',
        name: 'Last Minute',
        description: 'Limited availability with premium pricing',
        features: ['Event access', 'Last-minute availability'],
        suggestedPriceMultiplier: 1.2
      }
    ];
  }

  // Validate ticket type restrictions
  static validateTicketRestrictions(
    ticketType: TicketTypeWithPricing, 
    userAge?: number, 
    isMember?: boolean
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const restrictions = (ticketType.includes_perks as any)?.restrictions || {};

    // Age restrictions
    if (restrictions.ageMin && userAge && userAge < restrictions.ageMin) {
      errors.push(`Minimum age requirement: ${restrictions.ageMin} years`);
    }
    if (restrictions.ageMax && userAge && userAge > restrictions.ageMax) {
      errors.push(`Maximum age requirement: ${restrictions.ageMax} years`);
    }

    // Member-only tickets
    if (restrictions.memberOnly && !isMember) {
      errors.push('This ticket is available to members only');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}