import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  buyerAccountService, 
  BuyerProfile, 
  EventPreferences, 
  SavedPaymentMethod, 
  PurchaseHistory, 
  SavedEvent, 
  SecurityActivity,
  AccountDashboardData 
} from '@/services/buyerAccountService';
import { toast } from '@/components/ui/sonner';

export const useBuyerAccount = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [preferences, setPreferences] = useState<EventPreferences | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [securityActivity, setSecurityActivity] = useState<SecurityActivity[]>([]);
  const [dashboardData, setDashboardData] = useState<AccountDashboardData | null>(null);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const profileData = await buyerAccountService.getBuyerProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load event preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const preferencesData = await buyerAccountService.getEventPreferences(user.id);
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [user?.id]);

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const methods = await buyerAccountService.getSavedPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  }, [user?.id]);

  // Load purchase history
  const loadPurchaseHistory = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const history = await buyerAccountService.getPurchaseHistory(user.id);
      setPurchaseHistory(history);
    } catch (error) {
      console.error('Error loading purchase history:', error);
    }
  }, [user?.id]);

  // Load saved events
  const loadSavedEvents = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const events = await buyerAccountService.getSavedEvents(user.id);
      setSavedEvents(events);
    } catch (error) {
      console.error('Error loading saved events:', error);
    }
  }, [user?.id]);

  // Load security activity
  const loadSecurityActivity = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const activity = await buyerAccountService.getSecurityActivity(user.id);
      setSecurityActivity(activity);
    } catch (error) {
      console.error('Error loading security activity:', error);
    }
  }, [user?.id]);

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await buyerAccountService.getAccountDashboard(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Update profile
  const updateProfile = async (profileData: Partial<BuyerProfile>) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const result = await buyerAccountService.updateBuyerProfile(user.id, profileData);
      if (result.success) {
        await loadProfile();
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
      return result;
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const result = await buyerAccountService.uploadProfilePicture(user.id, file);
      if (result.success) {
        await loadProfile();
        toast.success('Profile picture updated successfully');
      } else {
        toast.error(result.error || 'Failed to upload profile picture');
      }
      return result;
    } catch (error) {
      toast.error('Failed to upload profile picture');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setLoading(false);
    }
  };

  // Update preferences
  const updatePreferences = async (preferencesData: Partial<EventPreferences>) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await buyerAccountService.updateEventPreferences(user.id, preferencesData);
      if (result.success) {
        await loadPreferences();
        toast.success('Preferences updated successfully');
      } else {
        toast.error(result.error || 'Failed to update preferences');
      }
      return result;
    } catch (error) {
      toast.error('Failed to update preferences');
      return { success: false, error: 'Unexpected error' };
    }
  };

  // Add payment method
  const addPaymentMethod = async (paymentMethod: Omit<SavedPaymentMethod, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await buyerAccountService.addPaymentMethod(user.id, paymentMethod);
      if (result.success) {
        await loadPaymentMethods();
        toast.success('Payment method added successfully');
      } else {
        toast.error(result.error || 'Failed to add payment method');
      }
      return result;
    } catch (error) {
      toast.error('Failed to add payment method');
      return { success: false, error: 'Unexpected error' };
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await buyerAccountService.removePaymentMethod(user.id, paymentMethodId);
      if (result.success) {
        await loadPaymentMethods();
        toast.success('Payment method removed successfully');
      } else {
        toast.error(result.error || 'Failed to remove payment method');
      }
      return result;
    } catch (error) {
      toast.error('Failed to remove payment method');
      return { success: false, error: 'Unexpected error' };
    }
  };

  // Save event
  const saveEvent = async (eventId: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await buyerAccountService.saveEvent(user.id, eventId);
      if (result.success) {
        await loadSavedEvents();
        toast.success('Event saved to wishlist');
      } else {
        toast.error(result.error || 'Failed to save event');
      }
      return result;
    } catch (error) {
      toast.error('Failed to save event');
      return { success: false, error: 'Unexpected error' };
    }
  };

  // Unsave event
  const unsaveEvent = async (eventId: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await buyerAccountService.unsaveEvent(user.id, eventId);
      if (result.success) {
        await loadSavedEvents();
        toast.success('Event removed from wishlist');
      } else {
        toast.error(result.error || 'Failed to remove event');
      }
      return result;
    } catch (error) {
      toast.error('Failed to remove event');
      return { success: false, error: 'Unexpected error' };
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const result = await buyerAccountService.changePassword(currentPassword, newPassword);
      if (result.success) {
        toast.success('Password changed successfully');
        if (user?.id) {
          await buyerAccountService.logSecurityActivity(
            user.id, 
            'password_change', 
            'Password changed successfully'
          );
        }
      } else {
        toast.error(result.error || 'Failed to change password');
      }
      return result;
    } catch (error) {
      toast.error('Failed to change password');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setLoading(false);
    }
  };

  // Request account deletion
  const requestAccountDeletion = async (reason?: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const result = await buyerAccountService.requestAccountDeletion(user.id, reason);
      if (result.success) {
        toast.success('Account deletion request submitted');
        await buyerAccountService.logSecurityActivity(
          user.id, 
          'account_deletion_request', 
          'Account deletion requested'
        );
      } else {
        toast.error(result.error || 'Failed to request account deletion');
      }
      return result;
    } catch (error) {
      toast.error('Failed to request account deletion');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setLoading(false);
    }
  };

  // Export account data
  const exportAccountData = async () => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const result = await buyerAccountService.exportAccountData(user.id);
      if (result.success) {
        // Create and download the export file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Account data exported successfully');
        await buyerAccountService.logSecurityActivity(
          user.id, 
          'data_export', 
          'Account data exported'
        );
      } else {
        toast.error(result.error || 'Failed to export account data');
      }
      return result;
    } catch (error) {
      toast.error('Failed to export account data');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setLoading(false);
    }
  };

  // Check if event is saved
  const isEventSaved = (eventId: string): boolean => {
    return savedEvents.some(event => event.event_id === eventId);
  };

  // Get upcoming events count
  const getUpcomingEventsCount = (): number => {
    if (!dashboardData) return 0;
    return dashboardData.upcoming_events.length;
  };

  // Get total events attended
  const getTotalEventsAttended = (): number => {
    if (!dashboardData) return 0;
    return dashboardData.total_events_attended;
  };

  // Get total amount spent
  const getTotalAmountSpent = (): number => {
    if (!dashboardData) return 0;
    return dashboardData.total_amount_spent;
  };

  // Initialize data when user changes
  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadPreferences();
      loadPaymentMethods();
      loadPurchaseHistory();
      loadSavedEvents();
      loadSecurityActivity();
      loadDashboard();
    } else {
      // Clear data when user logs out
      setProfile(null);
      setPreferences(null);
      setPaymentMethods([]);
      setPurchaseHistory([]);
      setSavedEvents([]);
      setSecurityActivity([]);
      setDashboardData(null);
    }
  }, [user?.id, loadProfile, loadPreferences, loadPaymentMethods, loadPurchaseHistory, loadSavedEvents, loadSecurityActivity, loadDashboard]);

  return {
    // State
    loading,
    profile,
    preferences,
    paymentMethods,
    purchaseHistory,
    savedEvents,
    securityActivity,
    dashboardData,
    
    // Actions
    updateProfile,
    uploadProfilePicture,
    updatePreferences,
    addPaymentMethod,
    removePaymentMethod,
    saveEvent,
    unsaveEvent,
    changePassword,
    requestAccountDeletion,
    exportAccountData,
    
    // Utilities
    isEventSaved,
    getUpcomingEventsCount,
    getTotalEventsAttended,
    getTotalAmountSpent,
    
    // Refresh functions
    refreshProfile: loadProfile,
    refreshPreferences: loadPreferences,
    refreshPaymentMethods: loadPaymentMethods,
    refreshPurchaseHistory: loadPurchaseHistory,
    refreshSavedEvents: loadSavedEvents,
    refreshSecurityActivity: loadSecurityActivity,
    refreshDashboard: loadDashboard,
  };
}; 