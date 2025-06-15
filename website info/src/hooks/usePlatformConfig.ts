import { useState, useEffect, useCallback } from 'react';
import { platformConfigService, Category, SiteSettings, VODSettings, PickupLocation } from '@/services/platformConfigService';
import { toast } from 'sonner';

export interface PlatformConfigState {
  categories: Category[];
  siteSettings: SiteSettings | null;
  vodSettings: VODSettings | null;
  pickupLocations: PickupLocation[];
  loading: boolean;
  error: string | null;
}

export interface PlatformConfigActions {
  fetchConfig: () => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'order'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  updateVODSettings: (settings: Partial<VODSettings>) => Promise<void>;
  addPickupLocation: (location: Omit<PickupLocation, 'id' | 'isActive'>) => Promise<void>;
  updatePickupLocation: (location: PickupLocation) => Promise<void>;
  deletePickupLocation: (id: string) => Promise<void>;
}

export const usePlatformConfig = (): PlatformConfigState & PlatformConfigActions => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [vodSettings, setVODSettings] = useState<VODSettings | null>(null);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedCategories, fetchedSiteSettings, fetchedVODSettings, fetchedPickupLocations] = await Promise.all([
        platformConfigService.getCategories(),
        platformConfigService.getSiteSettings(),
        platformConfigService.getVODSettings(),
        platformConfigService.getPickupLocations(),
      ]);
      setCategories(fetchedCategories);
      setSiteSettings(fetchedSiteSettings);
      setVODSettings(fetchedVODSettings);
      setPickupLocations(fetchedPickupLocations);
    } catch (err: any) {
      console.error('Failed to fetch platform configuration:', err);
      setError(err.message || 'Failed to fetch configuration');
      toast.error(err.message || 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const callService = useCallback(async (serviceCall: Promise<any>, successMessage: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceCall;
      toast.success(successMessage);
      fetchConfig(); // Re-fetch all data to ensure consistency
      return result;
    } catch (err: any) {
      toast.error(`Operation failed: ${err.message}`);
      setError(err.message);
      throw err; // Re-throw to allow component to handle specific errors if needed
    } finally {
      setLoading(false);
    }
  }, [fetchConfig]);

  const updateCategory = useCallback(async (category: Category) => {
    await callService(platformConfigService.updateCategory(category), `Category '${category.name}' updated.`);
  }, [callService]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'order'>) => {
    await callService(platformConfigService.addCategory(category), `Category '${category.name}' added.`);
  }, [callService]);

  const deleteCategory = useCallback(async (id: string) => {
    await callService(platformConfigService.deleteCategory(id), 'Category deleted.');
  }, [callService]);

  const reorderCategories = useCallback(async (orderedIds: string[]) => {
    await callService(platformConfigService.reorderCategories(orderedIds), 'Categories reordered.');
  }, [callService]);

  const updateSiteSettings = useCallback(async (settings: Partial<SiteSettings>) => {
    await callService(platformConfigService.updateSiteSettings(settings), 'Site settings updated.');
  }, [callService]);

  const updateVODSettings = useCallback(async (settings: Partial<VODSettings>) => {
    await callService(platformConfigService.updateVODSettings(settings), 'VOD settings updated.');
  }, [callService]);

  const addPickupLocation = useCallback(async (location: Omit<PickupLocation, 'id' | 'isActive'>) => {
    await callService(platformConfigService.addPickupLocation(location), `Pickup location '${location.name}' added.`);
  }, [callService]);

  const updatePickupLocation = useCallback(async (location: PickupLocation) => {
    await callService(platformConfigService.updatePickupLocation(location), `Pickup location '${location.name}' updated.`);
  }, [callService]);

  const deletePickupLocation = useCallback(async (id: string) => {
    await callService(platformConfigService.deletePickupLocation(id), 'Pickup location deleted.');
  }, [callService]);

  return {
    categories,
    siteSettings,
    vodSettings,
    pickupLocations,
    loading,
    error,
    fetchConfig,
    updateCategory,
    addCategory,
    deleteCategory,
    reorderCategories,
    updateSiteSettings,
    updateVODSettings,
    addPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
  };
}; 