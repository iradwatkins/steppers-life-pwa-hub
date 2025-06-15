import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  eventCollectionsService, 
  EventCollection, 
  EventSeries, 
  EventTemplate, 
  BulkOperation,
  CollectionAnalytics 
} from '@/services/eventCollectionsService';

interface UseEventCollectionsReturn {
  // Collections state
  collections: EventCollection[];
  currentCollection: EventCollection | null;
  collectionsLoading: boolean;
  collectionsError: string | null;

  // Event series state
  eventSeries: EventSeries[];
  seriesLoading: boolean;
  seriesError: string | null;

  // Templates state
  eventTemplates: EventTemplate[];
  templatesLoading: boolean;
  templatesError: string | null;

  // Bulk operations state
  bulkOperations: BulkOperation[];
  bulkOperationLoading: boolean;

  // Analytics state
  collectionAnalytics: CollectionAnalytics | null;
  analyticsLoading: boolean;

  // Collection management functions
  loadCollections: (organizerId: string) => Promise<void>;
  loadCollection: (collectionId: string) => Promise<void>;
  createCollection: (collectionData: Omit<EventCollection, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>) => Promise<EventCollection>;
  updateCollection: (collectionId: string, updates: Partial<EventCollection>) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;

  // Event organization functions
  addEventsToCollection: (collectionId: string, eventIds: string[]) => Promise<void>;
  removeEventsFromCollection: (collectionId: string, eventIds: string[]) => Promise<void>;
  reorderEventsInCollection: (collectionId: string, eventIds: string[]) => Promise<void>;

  // Event series functions
  loadEventSeries: (organizerId: string) => Promise<void>;
  createEventSeries: (seriesData: Omit<EventSeries, 'id' | 'createdAt' | 'generatedEventIds'>) => Promise<void>;
  generateSeriesEvents: (seriesId: string) => Promise<string[]>;

  // Template functions
  loadEventTemplates: (organizerId: string) => Promise<void>;
  createEventTemplate: (templateData: Omit<EventTemplate, 'id' | 'createdAt' | 'usageCount'>) => Promise<void>;
  useEventTemplate: (templateId: string) => Promise<any>;

  // Bulk operations functions
  performBulkOperation: (operation: Omit<BulkOperation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  getBulkOperationStatus: (operationId: string) => Promise<BulkOperation | null>;

  // Analytics functions
  loadCollectionAnalytics: (collectionId: string, period: 'day' | 'week' | 'month' | 'year') => Promise<void>;

  // Utility functions
  getPublicCollectionUrl: (collectionId: string) => Promise<string>;
  exportCollectionData: (collectionId: string, format: 'csv' | 'json' | 'pdf') => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useEventCollections = (organizerId?: string): UseEventCollectionsReturn => {
  // State management
  const [collections, setCollections] = useState<EventCollection[]>([]);
  const [currentCollection, setCurrentCollection] = useState<EventCollection | null>(null);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  const [collectionAnalytics, setCollectionAnalytics] = useState<CollectionAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Collection management functions
  const loadCollections = useCallback(async (orgId: string) => {
    try {
      setCollectionsLoading(true);
      setCollectionsError(null);
      const data = await eventCollectionsService.getCollections(orgId);
      setCollections(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load collections';
      setCollectionsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const loadCollection = useCallback(async (collectionId: string) => {
    try {
      setCollectionsLoading(true);
      setCollectionsError(null);
      const collection = await eventCollectionsService.getCollection(collectionId);
      setCurrentCollection(collection);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load collection';
      setCollectionsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const createCollection = useCallback(async (collectionData: Omit<EventCollection, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>) => {
    try {
      setCollectionsLoading(true);
      const newCollection = await eventCollectionsService.createCollection(collectionData);
      setCollections(prev => [...prev, newCollection]);
      toast.success('Collection created successfully');
      return newCollection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create collection';
      toast.error(errorMessage);
      throw error;
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const updateCollection = useCallback(async (collectionId: string, updates: Partial<EventCollection>) => {
    try {
      setCollectionsLoading(true);
      const updatedCollection = await eventCollectionsService.updateCollection(collectionId, updates);
      setCollections(prev => prev.map(c => c.id === collectionId ? updatedCollection : c));
      if (currentCollection?.id === collectionId) {
        setCurrentCollection(updatedCollection);
      }
      toast.success('Collection updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update collection';
      toast.error(errorMessage);
      throw error;
    } finally {
      setCollectionsLoading(false);
    }
  }, [currentCollection]);

  const deleteCollection = useCallback(async (collectionId: string) => {
    try {
      setCollectionsLoading(true);
      await eventCollectionsService.deleteCollection(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
      if (currentCollection?.id === collectionId) {
        setCurrentCollection(null);
      }
      toast.success('Collection deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete collection';
      toast.error(errorMessage);
      throw error;
    } finally {
      setCollectionsLoading(false);
    }
  }, [currentCollection]);

  // Event organization functions
  const addEventsToCollection = useCallback(async (collectionId: string, eventIds: string[]) => {
    try {
      const updatedCollection = await eventCollectionsService.addEventsToCollection(collectionId, eventIds);
      setCollections(prev => prev.map(c => c.id === collectionId ? updatedCollection : c));
      if (currentCollection?.id === collectionId) {
        setCurrentCollection(updatedCollection);
      }
      toast.success(`${eventIds.length} event(s) added to collection`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add events to collection';
      toast.error(errorMessage);
      throw error;
    }
  }, [currentCollection]);

  const removeEventsFromCollection = useCallback(async (collectionId: string, eventIds: string[]) => {
    try {
      const updatedCollection = await eventCollectionsService.removeEventsFromCollection(collectionId, eventIds);
      setCollections(prev => prev.map(c => c.id === collectionId ? updatedCollection : c));
      if (currentCollection?.id === collectionId) {
        setCurrentCollection(updatedCollection);
      }
      toast.success(`${eventIds.length} event(s) removed from collection`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove events from collection';
      toast.error(errorMessage);
      throw error;
    }
  }, [currentCollection]);

  const reorderEventsInCollection = useCallback(async (collectionId: string, eventIds: string[]) => {
    try {
      const updatedCollection = await eventCollectionsService.reorderEventsInCollection(collectionId, eventIds);
      setCollections(prev => prev.map(c => c.id === collectionId ? updatedCollection : c));
      if (currentCollection?.id === collectionId) {
        setCurrentCollection(updatedCollection);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder events';
      toast.error(errorMessage);
      throw error;
    }
  }, [currentCollection]);

  // Event series functions
  const loadEventSeries = useCallback(async (orgId: string) => {
    try {
      setSeriesLoading(true);
      setSeriesError(null);
      const data = await eventCollectionsService.getEventSeries(orgId);
      setEventSeries(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load event series';
      setSeriesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  const createEventSeries = useCallback(async (seriesData: Omit<EventSeries, 'id' | 'createdAt' | 'generatedEventIds'>) => {
    try {
      setSeriesLoading(true);
      const newSeries = await eventCollectionsService.createEventSeries(seriesData);
      setEventSeries(prev => [...prev, newSeries]);
      toast.success('Event series created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event series';
      toast.error(errorMessage);
      throw error;
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  const generateSeriesEvents = useCallback(async (seriesId: string) => {
    try {
      const generatedIds = await eventCollectionsService.generateSeriesEvents(seriesId);
      // Update the series in state
      setEventSeries(prev => prev.map(s => 
        s.id === seriesId 
          ? { ...s, generatedEventIds: [...s.generatedEventIds, ...generatedIds] }
          : s
      ));
      toast.success(`Generated ${generatedIds.length} events from series`);
      return generatedIds;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate series events';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Template functions
  const loadEventTemplates = useCallback(async (orgId: string) => {
    try {
      setTemplatesLoading(true);
      setTemplatesError(null);
      const data = await eventCollectionsService.getEventTemplates(orgId);
      setEventTemplates(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load event templates';
      setTemplatesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const createEventTemplate = useCallback(async (templateData: Omit<EventTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    try {
      setTemplatesLoading(true);
      const newTemplate = await eventCollectionsService.createEventTemplate(templateData);
      setEventTemplates(prev => [...prev, newTemplate]);
      toast.success('Event template created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event template';
      toast.error(errorMessage);
      throw error;
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const useEventTemplate = useCallback(async (templateId: string) => {
    try {
      const templateData = await eventCollectionsService.useEventTemplate(templateId);
      // Update usage count in state
      setEventTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, usageCount: t.usageCount + 1 }
          : t
      ));
      return templateData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to use event template';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Bulk operations functions
  const performBulkOperation = useCallback(async (operation: Omit<BulkOperation, 'id' | 'createdAt' | 'status'>) => {
    try {
      setBulkOperationLoading(true);
      const bulkOp = await eventCollectionsService.performBulkOperation(operation);
      setBulkOperations(prev => [...prev, bulkOp]);
      toast.success('Bulk operation started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start bulk operation';
      toast.error(errorMessage);
      throw error;
    } finally {
      setBulkOperationLoading(false);
    }
  }, []);

  const getBulkOperationStatus = useCallback(async (operationId: string) => {
    try {
      const status = await eventCollectionsService.getBulkOperationStatus(operationId);
      if (status) {
        setBulkOperations(prev => prev.map(op => 
          op.id === operationId ? status : op
        ));
      }
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get operation status';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Analytics functions
  const loadCollectionAnalytics = useCallback(async (collectionId: string, period: 'day' | 'week' | 'month' | 'year') => {
    try {
      setAnalyticsLoading(true);
      const analytics = await eventCollectionsService.getCollectionAnalytics(collectionId, period);
      setCollectionAnalytics(analytics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      toast.error(errorMessage);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Utility functions
  const getPublicCollectionUrl = useCallback(async (collectionId: string) => {
    try {
      const url = await eventCollectionsService.getPublicCollectionUrl(collectionId);
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get public collection URL';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const exportCollectionData = useCallback(async (collectionId: string, format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await eventCollectionsService.exportCollectionData(collectionId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection-${collectionId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Collection data exported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export collection data';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (organizerId) {
      await Promise.all([
        loadCollections(organizerId),
        loadEventSeries(organizerId),
        loadEventTemplates(organizerId),
      ]);
    }
  }, [organizerId, loadCollections, loadEventSeries, loadEventTemplates]);

  const clearError = useCallback(() => {
    setCollectionsError(null);
    setSeriesError(null);
    setTemplatesError(null);
  }, []);

  // Auto-load data when organizerId changes
  useEffect(() => {
    if (organizerId) {
      refreshData();
    }
  }, [organizerId, refreshData]);

  return {
    // State
    collections,
    currentCollection,
    collectionsLoading,
    collectionsError,
    eventSeries,
    seriesLoading,
    seriesError,
    eventTemplates,
    templatesLoading,
    templatesError,
    bulkOperations,
    bulkOperationLoading,
    collectionAnalytics,
    analyticsLoading,

    // Functions
    loadCollections,
    loadCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addEventsToCollection,
    removeEventsFromCollection,
    reorderEventsInCollection,
    loadEventSeries,
    createEventSeries,
    generateSeriesEvents,
    loadEventTemplates,
    createEventTemplate,
    useEventTemplate,
    performBulkOperation,
    getBulkOperationStatus,
    loadCollectionAnalytics,
    getPublicCollectionUrl,
    exportCollectionData,
    refreshData,
    clearError,
  };
}; 