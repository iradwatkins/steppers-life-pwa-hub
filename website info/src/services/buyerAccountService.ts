import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Types for buyer account management
export interface BuyerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  profile_picture_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface EventPreferences {
  user_id: string;
  dance_styles: string[];
  skill_levels: string[];
  event_types: string[];
  preferred_locations: string[];
  price_range: {
    min: number;
    max: number;
  };
  notification_settings: {
    email_recommendations: boolean;
    sms_reminders: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
  };
}

export interface SavedPaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last_four?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  nickname?: string;
  created_at: string;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  ticket_type: string;
  quantity: number;
  total_amount: number;
  purchase_date: string;
  status: 'completed' | 'cancelled' | 'refunded';
  qr_code_url?: string;
}

export interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_image_url?: string;
  ticket_price_range: string;
  saved_at: string;
}

export interface SecurityActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address: string;
  device_info: string;
  timestamp: string;
  is_suspicious: boolean;
}

export interface AccountDashboardData {
  profile: BuyerProfile;
  upcoming_events: PurchaseHistory[];
  past_events: PurchaseHistory[];
  saved_events: SavedEvent[];
  total_events_attended: number;
  total_amount_spent: number;
  recent_activity: SecurityActivity[];
}

class BuyerAccountService {
  // Profile Management
  async getBuyerProfile(userId: string): Promise<BuyerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('buyer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching buyer profile:', error);
      return null;
    }
  }

  async updateBuyerProfile(userId: string, profileData: Partial<BuyerProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('buyer_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating buyer profile:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadProfilePicture(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new picture URL
      await this.updateBuyerProfile(userId, { profile_picture_url: data.publicUrl });

      return { success: true, url: data.publicUrl };
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      return { success: false, error: error.message };
    }
  }

  // Event Preferences
  async getEventPreferences(userId: string): Promise<EventPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('event_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching event preferences:', error);
      return null;
    }
  }

  async updateEventPreferences(userId: string, preferences: Partial<EventPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('event_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating event preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Saved Payment Methods
  async getSavedPaymentMethods(userId: string): Promise<SavedPaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching saved payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(userId: string, paymentMethod: Omit<SavedPaymentMethod, 'id' | 'user_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      // If this is set as default, remove default from others
      if (paymentMethod.is_default) {
        await supabase
          .from('saved_payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { error } = await supabase
        .from('saved_payment_methods')
        .insert({
          user_id: userId,
          ...paymentMethod,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      return { success: false, error: error.message };
    }
  }

  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error removing payment method:', error);
      return { success: false, error: error.message };
    }
  }

  // Purchase History
  async getPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
    try {
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          events (
            title,
            date,
            venue_name
          )
        `)
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      return data?.map(purchase => ({
        id: purchase.id,
        user_id: purchase.user_id,
        event_id: purchase.event_id,
        event_title: purchase.events?.title || 'Unknown Event',
        event_date: purchase.events?.date || '',
        event_venue: purchase.events?.venue_name || 'Unknown Venue',
        ticket_type: purchase.ticket_type,
        quantity: purchase.quantity,
        total_amount: purchase.total_amount,
        purchase_date: purchase.purchase_date,
        status: purchase.status,
        qr_code_url: purchase.qr_code_url
      })) || [];
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
  }

  // Saved Events (Wishlist)
  async getSavedEvents(userId: string): Promise<SavedEvent[]> {
    try {
      const { data, error } = await supabase
        .from('saved_events')
        .select(`
          *,
          events (
            title,
            date,
            venue_name,
            image_url,
            price_range
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return data?.map(saved => ({
        id: saved.id,
        user_id: saved.user_id,
        event_id: saved.event_id,
        event_title: saved.events?.title || 'Unknown Event',
        event_date: saved.events?.date || '',
        event_venue: saved.events?.venue_name || 'Unknown Venue',
        event_image_url: saved.events?.image_url,
        ticket_price_range: saved.events?.price_range || 'Price TBD',
        saved_at: saved.saved_at
      })) || [];
    } catch (error) {
      console.error('Error fetching saved events:', error);
      return [];
    }
  }

  async saveEvent(userId: string, eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_events')
        .insert({
          user_id: userId,
          event_id: eventId,
          saved_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error saving event:', error);
      return { success: false, error: error.message };
    }
  }

  async unsaveEvent(userId: string, eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('saved_events')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error unsaving event:', error);
      return { success: false, error: error.message };
    }
  }

  // Security Activity
  async getSecurityActivity(userId: string, limit: number = 10): Promise<SecurityActivity[]> {
    try {
      const { data, error } = await supabase
        .from('security_activity')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching security activity:', error);
      return [];
    }
  }

  async logSecurityActivity(userId: string, action: string, description: string, isSuspicious: boolean = false): Promise<void> {
    try {
      await supabase
        .from('security_activity')
        .insert({
          user_id: userId,
          action,
          description,
          ip_address: 'Unknown', // In production, get from request
          device_info: navigator.userAgent,
          timestamp: new Date().toISOString(),
          is_suspicious: isSuspicious
        });
    } catch (error) {
      console.error('Error logging security activity:', error);
    }
  }

  // Account Dashboard
  async getAccountDashboard(userId: string): Promise<AccountDashboardData | null> {
    try {
      const [
        profile,
        purchaseHistory,
        savedEvents,
        securityActivity
      ] = await Promise.all([
        this.getBuyerProfile(userId),
        this.getPurchaseHistory(userId),
        this.getSavedEvents(userId),
        this.getSecurityActivity(userId, 5)
      ]);

      if (!profile) return null;

      const now = new Date();
      const upcomingEvents = purchaseHistory.filter(p => 
        new Date(p.event_date) > now && p.status === 'completed'
      );
      const pastEvents = purchaseHistory.filter(p => 
        new Date(p.event_date) <= now && p.status === 'completed'
      );

      const totalAmount = purchaseHistory
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.total_amount, 0);

      return {
        profile,
        upcoming_events: upcomingEvents,
        past_events: pastEvents,
        saved_events: savedEvents,
        total_events_attended: pastEvents.length,
        total_amount_spent: totalAmount,
        recent_activity: securityActivity
      };
    } catch (error) {
      console.error('Error fetching account dashboard:', error);
      return null;
    }
  }

  // Password Change
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    }
  }

  // Account Deletion
  async requestAccountDeletion(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, this would trigger a deletion workflow
      // For now, we'll just mark the account for deletion
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: userId,
          reason: reason || 'User requested',
          requested_at: new Date().toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      return { success: false, error: error.message };
    }
  }

  // Data Export
  async exportAccountData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const [
        profile,
        preferences,
        purchaseHistory,
        savedEvents,
        securityActivity
      ] = await Promise.all([
        this.getBuyerProfile(userId),
        this.getEventPreferences(userId),
        this.getPurchaseHistory(userId),
        this.getSavedEvents(userId),
        this.getSecurityActivity(userId, 100)
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        profile,
        preferences,
        purchase_history: purchaseHistory,
        saved_events: savedEvents,
        security_activity: securityActivity
      };

      return { success: true, data: exportData };
    } catch (error: any) {
      console.error('Error exporting account data:', error);
      return { success: false, error: error.message };
    }
  }
}

export const buyerAccountService = new BuyerAccountService(); 