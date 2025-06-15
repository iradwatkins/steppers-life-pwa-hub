import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  storeDirectoryService, 
  StoreListing, 
  StoreCategory, 
  StoreSubmissionData,
  StoreImage 
} from '@/services/storeDirectoryService';
import { toast } from 'sonner';

export const useStoreDirectory = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [storeListings, setStoreListings] = useState<StoreListing[]>([]);
  const [userStores, setUserStores] = useState<StoreListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load store categories
  const loadCategories = async () => {
    try {
      setError(null);
      const data = await storeDirectoryService.getStoreCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      toast.error('Failed to load store categories');
    }
  };

  // Load store listings with optional filters
  const loadStoreListings = async (filters?: {
    category?: string;
    location?: string;
    search?: string;
    isVerified?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await storeDirectoryService.getStoreListings(filters);
      setStoreListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store listings');
      toast.error('Failed to load store listings');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's store listings
  const loadUserStores = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await storeDirectoryService.getUserStoreListings(user.id);
      setUserStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your stores');
      toast.error('Failed to load your store listings');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit a new store listing
  const submitStoreListing = async (data: StoreSubmissionData): Promise<StoreListing | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newStore = await storeDirectoryService.submitStoreListing(data);
      
      // Add to user stores list
      setUserStores(prev => [newStore, ...prev]);
      
      toast.success('Store listing submitted! It will be reviewed by our team before going live.');
      return newStore;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit store listing';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing store listing
  const updateStoreListing = async (storeId: string, data: Partial<StoreSubmissionData>): Promise<StoreListing | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedStore = await storeDirectoryService.updateStoreListing(storeId, data);
      
      // Update in user stores list
      setUserStores(prev => prev.map(store => 
        store.id === storeId ? updatedStore : store
      ));
      
      toast.success('Store listing updated successfully!');
      return updatedStore;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update store listing';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search categories with autocomplete
  const searchCategories = async (query: string): Promise<StoreCategory[]> => {
    try {
      if (!query.trim()) return categories;
      return await storeDirectoryService.searchCategories(query);
    } catch (err) {
      console.error('Category search error:', err);
      return [];
    }
  };

  // Get store by ID
  const getStoreById = async (storeId: string): Promise<StoreListing | null> => {
    try {
      return await storeDirectoryService.getStoreById(storeId);
    } catch (err) {
      console.error('Error fetching store:', err);
      return null;
    }
  };

  // Upload store images
  const uploadStoreImages = async (storeId: string, files: File[]): Promise<StoreImage[]> => {
    try {
      setIsLoading(true);
      const images = await storeDirectoryService.uploadStoreImages(storeId, files);
      toast.success(`${images.length} image(s) uploaded successfully!`);
      return images;
    } catch (err) {
      toast.error('Failed to upload images');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Suggest a new category
  const suggestCategory = async (name: string, description: string): Promise<void> => {
    try {
      await storeDirectoryService.suggestCategory(name, description);
      toast.success('Category suggestion submitted for review!');
    } catch (err) {
      toast.error('Failed to submit category suggestion');
      throw err;
    }
  };

  // Helper functions
  const getCategoryById = (categoryId: string): StoreCategory | undefined => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = getCategoryById(categoryId);
    return category?.name || 'Unknown Category';
  };

  // Filter stores by various criteria
  const filterStores = (
    stores: StoreListing[],
    filters: {
      search?: string;
      category?: string;
      verified?: boolean;
    }
  ): StoreListing[] => {
    return stores.filter(store => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch = 
          store.name.toLowerCase().includes(query) ||
          store.description.toLowerCase().includes(query) ||
          store.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (filters.category && store.categoryId !== filters.category) {
        return false;
      }

      if (filters.verified !== undefined && store.isVerified !== filters.verified) {
        return false;
      }

      return true;
    });
  };

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, []);

  // Load user stores when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserStores();
    }
  }, [user?.id]);

  return {
    // State
    categories,
    storeListings,
    userStores,
    isLoading,
    isSubmitting,
    error,

    // Actions
    loadCategories,
    loadStoreListings,
    loadUserStores,
    submitStoreListing,
    updateStoreListing,
    searchCategories,
    getStoreById,
    uploadStoreImages,
    suggestCategory,

    // Utilities
    getCategoryById,
    getCategoryName,
    filterStores
  };
}; 