import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PromoCode = Database['public']['Tables']['promo_codes']['Row'];
type PromoCodeInsert = Database['public']['Tables']['promo_codes']['Insert'];
type PromoCodeUpdate = Database['public']['Tables']['promo_codes']['Update'];

export interface CreatePromoCodeData {
  eventId: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  minimumOrderAmount?: number;
  isActive?: boolean;
}

export interface PromoCodeValidation {
  isValid: boolean;
  discountAmount: number;
  errorMessage?: string;
  promoCode?: PromoCode;
}

export class PromoCodeService {
  // Create a new promo code
  static async createPromoCode(data: CreatePromoCodeData): Promise<PromoCode | null> {
    try {
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .insert({
          event_id: data.eventId,
          code: data.code.toUpperCase(),
          description: data.description,
          discount_type: data.discountType,
          discount_value: data.discountValue,
          max_uses: data.maxUses,
          valid_from: data.validFrom,
          valid_until: data.validUntil,
          minimum_order_amount: data.minimumOrderAmount,
          is_active: data.isActive ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return promoCode;
    } catch (error) {
      console.error('Error creating promo code:', error);
      return null;
    }
  }

  // Get promo codes for an event
  static async getPromoCodesByEvent(eventId: string): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return [];
    }
  }

  // Validate and calculate promo code discount
  static async validatePromoCode(
    code: string,
    eventId: string,
    orderTotal: number
  ): Promise<PromoCodeValidation> {
    try {
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single();

      if (error || !promoCode) {
        return {
          isValid: false,
          discountAmount: 0,
          errorMessage: 'Invalid promo code',
        };
      }

      // Check if promo code is within valid date range
      const now = new Date();
      if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
        return {
          isValid: false,
          discountAmount: 0,
          errorMessage: 'Promo code is not yet active',
        };
      }

      if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
        return {
          isValid: false,
          discountAmount: 0,
          errorMessage: 'Promo code has expired',
        };
      }

      // Check minimum order amount
      if (promoCode.minimum_order_amount && orderTotal < promoCode.minimum_order_amount) {
        return {
          isValid: false,
          discountAmount: 0,
          errorMessage: `Minimum order amount of $${promoCode.minimum_order_amount} required`,
        };
      }

      // Check usage limit
      if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
        return {
          isValid: false,
          discountAmount: 0,
          errorMessage: 'Promo code usage limit reached',
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (promoCode.discount_type === 'percentage') {
        discountAmount = (orderTotal * promoCode.discount_value) / 100;
      } else {
        discountAmount = promoCode.discount_value;
      }

      // Ensure discount doesn't exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);

      return {
        isValid: true,
        discountAmount,
        promoCode,
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        isValid: false,
        discountAmount: 0,
        errorMessage: 'Error validating promo code',
      };
    }
  }

  // Apply promo code (increment usage count)
  static async applyPromoCode(promoCodeId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_promo_code_usage', {
        promo_code_id: promoCodeId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error applying promo code:', error);
      return false;
    }
  }

  // Update promo code
  static async updatePromoCode(
    promoCodeId: string,
    updates: PromoCodeUpdate
  ): Promise<PromoCode | null> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', promoCodeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating promo code:', error);
      return null;
    }
  }

  // Delete promo code
  static async deletePromoCode(promoCodeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', promoCodeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting promo code:', error);
      return false;
    }
  }

  // Toggle promo code active status
  static async togglePromoCodeStatus(
    promoCodeId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', promoCodeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling promo code status:', error);
      return false;
    }
  }

  // Get promo code analytics
  static async getPromoCodeAnalytics(eventId: string): Promise<{
    totalCodes: number;
    activeCodes: number;
    totalUses: number;
    totalDiscount: number;
    topCodes: Array<{
      code: string;
      uses: number;
      discountGiven: number;
    }>;
  }> {
    try {
      const promoCodes = await this.getPromoCodesByEvent(eventId);
      
      const analytics = {
        totalCodes: promoCodes.length,
        activeCodes: promoCodes.filter(pc => pc.is_active).length,
        totalUses: promoCodes.reduce((sum, pc) => sum + pc.used_count, 0),
        totalDiscount: 0, // Would need to calculate from order data
        topCodes: promoCodes
          .filter(pc => pc.used_count > 0)
          .sort((a, b) => b.used_count - a.used_count)
          .slice(0, 5)
          .map(pc => ({
            code: pc.code,
            uses: pc.used_count,
            discountGiven: 0, // Would need to calculate from order data
          })),
      };

      return analytics;
    } catch (error) {
      console.error('Error getting promo code analytics:', error);
      return {
        totalCodes: 0,
        activeCodes: 0,
        totalUses: 0,
        totalDiscount: 0,
        topCodes: [],
      };
    }
  }

  // Get promo code by code string
  static async getPromoCodeByCode(code: string, eventId: string): Promise<PromoCode | null> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('event_id', eventId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching promo code by code:', error);
      return null;
    }
  }

  // Bulk create promo codes
  static async bulkCreatePromoCodes(codes: CreatePromoCodeData[]): Promise<PromoCode[]> {
    try {
      const insertData = codes.map(code => ({
        event_id: code.eventId,
        code: code.code.toUpperCase(),
        description: code.description,
        discount_type: code.discountType,
        discount_value: code.discountValue,
        max_uses: code.maxUses,
        valid_from: code.validFrom,
        valid_until: code.validUntil,
        minimum_order_amount: code.minimumOrderAmount,
        is_active: code.isActive ?? true,
      }));

      const { data, error } = await supabase
        .from('promo_codes')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating promo codes:', error);
      return [];
    }
  }

  // Generate unique promo code
  static generatePromoCode(prefix: string = '', length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix.toUpperCase();
    
    for (let i = 0; i < length - prefix.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Check if promo code exists
  static async isPromoCodeUnique(code: string, eventId: string): Promise<boolean> {
    try {
      const existingCode = await this.getPromoCodeByCode(code, eventId);
      return !existingCode;
    } catch (error) {
      console.error('Error checking promo code uniqueness:', error);
      return false;
    }
  }
}