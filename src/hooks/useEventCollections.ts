/**
 * useEventCollections Hook
 * Custom hook for managing event collections state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { EventCollectionsService, type EventCollectionWithEvents, type EventCollectionStats, type CreateEventCollectionData, type UpdateEventCollectionData } from '@/services/eventCollectionsService';
import { toast } from 'sonner';

interface UseEventCollectionsReturn {
  collections: EventCollectionWithEvents[];
  stats: EventCollectionStats | null;
  loading: boolean;
  error: string | null;
  createCollection: (data: CreateEventCollectionData) => Promise<boolean>;
  updateCollection: (data: UpdateEventCollectionData) => Promise<boolean>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  addEventsToCollection: (collectionId: string, eventIds: string[]) => Promise<boolean>;
  removeEventsFromCollection: (collectionId: string, eventIds: string[]) => Promise<boolean>;
  reorderEvents: (collectionId: string, eventOrders: { eventId: string; orderIndex: number }[]) => Promise<boolean>;
  searchCollections: (query: string) => Promise<EventCollectionWithEvents[]>;
  refreshCollections: () => Promise<void>;
}

export const useEventCollections = (organizerId?: string): UseEventCollectionsReturn => {
  const [collections, setCollections] = useState<EventCollectionWithEvents[]>([]);
  const [stats, setStats] = useState<EventCollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collections for the organizer
  const loadCollections = useCallback(async () => {
    if (!organizerId) {
      setCollections([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [collectionsData, statsData] = await Promise.all([
        EventCollectionsService.getOrganizerCollections(organizerId),
        EventCollectionsService.getCollectionStats(organizerId)
      ]);

      setCollections(collectionsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError('Failed to load event collections');
      setCollections([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  // Initial load
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Create new collection
  const createCollection = useCallback(async (data: CreateEventCollectionData): Promise<boolean> => {
    if (!organizerId) {
      toast.error('Organizer ID is required');
      return false;
    }

    try {
      const newCollection = await EventCollectionsService.createCollection(organizerId, data);
      
      if (newCollection) {
        toast.success('Event collection created successfully');
        await loadCollections(); // Refresh the list
        return true;
      } else {
        toast.error('Failed to create event collection');
        return false;
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      toast.error('Failed to create event collection');
      return false;
    }
  }, [organizerId, loadCollections]);

  // Update existing collection
  const updateCollection = useCallback(async (data: UpdateEventCollectionData): Promise<boolean> => {
    try {
      const success = await EventCollectionsService.updateCollection(data);
      
      if (success) {
        toast.success('Event collection updated successfully');
        await loadCollections(); // Refresh the list
        return true;
      } else {
        toast.error('Failed to update event collection');
        return false;
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      toast.error('Failed to update event collection');
      return false;
    }
  }, [loadCollections]);

  // Delete collection
  const deleteCollection = useCallback(async (collectionId: string): Promise<boolean> => {
    try {
      const success = await EventCollectionsService.deleteCollection(collectionId);
      
      if (success) {
        toast.success('Event collection deleted successfully');
        await loadCollections(); // Refresh the list
        return true;
      } else {
        toast.error('Failed to delete event collection');
        return false;
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      toast.error('Failed to delete event collection');
      return false;
    }
  }, [loadCollections]);

  // Add events to collection
  const addEventsToCollection = useCallback(async (
    collectionId: string, 
    eventIds: string[]
  ): Promise<boolean> => {
    try {
      const success = await EventCollectionsService.addEventsToCollection(collectionId, eventIds);
      
      if (success) {
        toast.success('Events added to collection successfully');
        await loadCollections(); // Refresh the list
        return true;
      } else {
        toast.error('Failed to add events to collection');
        return false;
      }
    } catch (err) {
      console.error('Error adding events to collection:', err);
      toast.error('Failed to add events to collection');
      return false;
    }
  }, [loadCollections]);

  // Remove events from collection
  const removeEventsFromCollection = useCallback(async (
    collectionId: string, 
    eventIds: string[]
  ): Promise<boolean> => {
    try {
      const success = await EventCollectionsService.removeEventsFromCollection(collectionId, eventIds);
      
      if (success) {
        toast.success('Events removed from collection successfully');
        await loadCollections(); // Refresh the list
        return true;
      } else {
        toast.error('Failed to remove events from collection');
        return false;
      }
    } catch (err) {
      console.error('Error removing events from collection:', err);
      toast.error('Failed to remove events from collection');
      return false;
    }
  }, [loadCollections]);

  // Reorder events in collection
  const reorderEvents = useCallback(async (
    collectionId: string, 
    eventOrders: { eventId: string; orderIndex: number }[]
  ): Promise<boolean> => {
    try {
      const success = await EventCollectionsService.reorderEventsInCollection(collectionId, eventOrders);
      
      if (success) {
        toast.success('Events reordered successfully');
        await loadCollections(); // Refresh the list
        return true;
      } else {
        toast.error('Failed to reorder events');
        return false;
      }
    } catch (err) {
      console.error('Error reordering events:', err);
      toast.error('Failed to reorder events');
      return false;
    }
  }, [loadCollections]);

  // Search collections
  const searchCollections = useCallback(async (query: string): Promise<EventCollectionWithEvents[]> => {
    try {
      const results = await EventCollectionsService.searchCollections(query, organizerId);
      return results;
    } catch (err) {
      console.error('Error searching collections:', err);
      toast.error('Failed to search collections');
      return [];
    }
  }, [organizerId]);

  // Refresh collections manually
  const refreshCollections = useCallback(async () => {
    await loadCollections();
  }, [loadCollections]);

  return {
    collections,
    stats,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addEventsToCollection,
    removeEventsFromCollection,
    reorderEvents,
    searchCollections,
    refreshCollections
  };
};

/**
 * Hook for loading public collections
 */
export const usePublicEventCollections = (limit: number = 20, offset: number = 0) => {
  const [collections, setCollections] = useState<EventCollectionWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPublicCollections = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const newCollections = await EventCollectionsService.getPublicCollections(limit, currentOffset);

      if (reset) {
        setCollections(newCollections);
      } else {
        setCollections(prev => [...prev, ...newCollections]);
      }

      setHasMore(newCollections.length === limit);
    } catch (err) {
      console.error('Error loading public collections:', err);
      setError('Failed to load public collections');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    loadPublicCollections(true);
  }, [loadPublicCollections]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPublicCollections(false);
    }
  }, [loading, hasMore, loadPublicCollections]);

  const refresh = useCallback(() => {
    loadPublicCollections(true);
  }, [loadPublicCollections]);

  return {
    collections,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

/**
 * Hook for loading a specific collection
 */
export const useEventCollection = (collectionId: string | null) => {
  const [collection, setCollection] = useState<EventCollectionWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollection = useCallback(async () => {
    if (!collectionId) {
      setCollection(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const collectionData = await EventCollectionsService.getCollectionById(collectionId);
      setCollection(collectionData);
    } catch (err) {
      console.error('Error loading collection:', err);
      setError('Failed to load collection');
      setCollection(null);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const refresh = useCallback(() => {
    loadCollection();
  }, [loadCollection]);

  return {
    collection,
    loading,
    error,
    refresh
  };
};

export default useEventCollections;