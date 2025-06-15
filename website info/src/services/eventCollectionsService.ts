import { Event } from '@/types/events';

// Types for event collections
export interface EventCollection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  organizerId: string;
  eventIds: string[];
  isPublic: boolean;
  branding: {
    color: string;
    logo?: string;
    banner?: string;
  };
  analytics: {
    totalViews: number;
    totalTicketsSold: number;
    totalRevenue: number;
    lastAnalyticsUpdate: Date;
  };
}

export interface EventSeries {
  id: string;
  name: string;
  description: string;
  templateEventId: string;
  recurrencePattern: {
    type: 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  generatedEventIds: string[];
  organizerId: string;
  createdAt: Date;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  sourceEventId: string;
  templateData: Partial<Event>;
  organizerId: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface BulkOperation {
  id: string;
  type: 'edit' | 'pricing' | 'publish' | 'unpublish' | 'delete';
  eventIds: string[];
  changes: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  organizerId: string;
  createdAt: Date;
  completedAt?: Date;
  errors?: string[];
}

export interface CollectionAnalytics {
  collectionId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    views: { date: string; count: number }[];
    ticketsSold: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
    topEvents: { eventId: string; views: number; tickets: number; revenue: number }[];
  };
}

// Mock data for development
const mockCollections: EventCollection[] = [
  {
    id: 'coll-1',
    name: 'Summer Dance Series',
    description: 'Our signature summer dance events featuring various styles',
    tags: ['summer', 'dance', 'series'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    organizerId: 'org-1',
    eventIds: ['1', '2', '3'],
    isPublic: true,
    branding: {
      color: '#FF6B35',
      logo: '/images/summer-series-logo.png',
    },
    analytics: {
      totalViews: 1250,
      totalTicketsSold: 87,
      totalRevenue: 2175.00,
      lastAnalyticsUpdate: new Date(),
    },
  },
  {
    id: 'coll-2',
    name: 'Beginner Workshops',
    description: 'Entry-level workshops for dance newcomers',
    tags: ['beginner', 'workshop', 'learning'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    organizerId: 'org-1',
    eventIds: ['4', '5'],
    isPublic: true,
    branding: {
      color: '#4ECDC4',
    },
    analytics: {
      totalViews: 890,
      totalTicketsSold: 45,
      totalRevenue: 675.00,
      lastAnalyticsUpdate: new Date(),
    },
  },
];

const mockEventSeries: EventSeries[] = [
  {
    id: 'series-1',
    name: 'Weekly Salsa Night',
    description: 'Every Friday salsa dancing event',
    templateEventId: '1',
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      endDate: new Date('2024-12-31'),
      daysOfWeek: [5], // Friday
    },
    generatedEventIds: ['1', '6', '7', '8'],
    organizerId: 'org-1',
    createdAt: new Date('2024-01-01'),
  },
];

const mockEventTemplates: EventTemplate[] = [
  {
    id: 'template-1',
    name: 'Salsa Night Template',
    description: 'Standard template for weekly salsa events',
    sourceEventId: '1',
    templateData: {
      title: 'Weekly Salsa Night',
      description: 'Join us for an evening of passionate salsa dancing...',
      duration: 180,
      capacity: 50,
      price: 25,
    },
    organizerId: 'org-1',
    isPublic: false,
    usageCount: 12,
    createdAt: new Date('2024-01-01'),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class EventCollectionsService {
  // Collection Management
  async getCollections(organizerId: string): Promise<EventCollection[]> {
    await delay(800);
    return mockCollections.filter(collection => collection.organizerId === organizerId);
  }

  async getCollection(collectionId: string): Promise<EventCollection | null> {
    await delay(500);
    return mockCollections.find(collection => collection.id === collectionId) || null;
  }

  async createCollection(collectionData: Omit<EventCollection, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>): Promise<EventCollection> {
    await delay(1000);
    const newCollection: EventCollection = {
      ...collectionData,
      id: `coll-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        totalViews: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        lastAnalyticsUpdate: new Date(),
      },
    };
    mockCollections.push(newCollection);
    return newCollection;
  }

  async updateCollection(collectionId: string, updates: Partial<EventCollection>): Promise<EventCollection> {
    await delay(800);
    const index = mockCollections.findIndex(c => c.id === collectionId);
    if (index === -1) throw new Error('Collection not found');
    
    mockCollections[index] = {
      ...mockCollections[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockCollections[index];
  }

  async deleteCollection(collectionId: string): Promise<void> {
    await delay(600);
    const index = mockCollections.findIndex(c => c.id === collectionId);
    if (index === -1) throw new Error('Collection not found');
    mockCollections.splice(index, 1);
  }

  // Event Organization
  async addEventsToCollection(collectionId: string, eventIds: string[]): Promise<EventCollection> {
    await delay(600);
    const collection = mockCollections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    collection.eventIds = [...new Set([...collection.eventIds, ...eventIds])];
    collection.updatedAt = new Date();
    return collection;
  }

  async removeEventsFromCollection(collectionId: string, eventIds: string[]): Promise<EventCollection> {
    await delay(600);
    const collection = mockCollections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    collection.eventIds = collection.eventIds.filter(id => !eventIds.includes(id));
    collection.updatedAt = new Date();
    return collection;
  }

  async reorderEventsInCollection(collectionId: string, eventIds: string[]): Promise<EventCollection> {
    await delay(400);
    const collection = mockCollections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    collection.eventIds = eventIds;
    collection.updatedAt = new Date();
    return collection;
  }

  // Event Series Management
  async getEventSeries(organizerId: string): Promise<EventSeries[]> {
    await delay(600);
    return mockEventSeries.filter(series => series.organizerId === organizerId);
  }

  async createEventSeries(seriesData: Omit<EventSeries, 'id' | 'createdAt' | 'generatedEventIds'>): Promise<EventSeries> {
    await delay(1200);
    const newSeries: EventSeries = {
      ...seriesData,
      id: `series-${Date.now()}`,
      createdAt: new Date(),
      generatedEventIds: [],
    };
    mockEventSeries.push(newSeries);
    return newSeries;
  }

  async generateSeriesEvents(seriesId: string): Promise<string[]> {
    await delay(1500);
    // Simulate generating events based on series template
    const generatedIds = [
      `event-${Date.now()}-1`,
      `event-${Date.now()}-2`,
      `event-${Date.now()}-3`,
    ];
    
    const series = mockEventSeries.find(s => s.id === seriesId);
    if (series) {
      series.generatedEventIds.push(...generatedIds);
    }
    
    return generatedIds;
  }

  // Event Templates
  async getEventTemplates(organizerId: string): Promise<EventTemplate[]> {
    await delay(500);
    return mockEventTemplates.filter(template => 
      template.organizerId === organizerId || template.isPublic
    );
  }

  async createEventTemplate(templateData: Omit<EventTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<EventTemplate> {
    await delay(800);
    const newTemplate: EventTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      usageCount: 0,
    };
    mockEventTemplates.push(newTemplate);
    return newTemplate;
  }

  async useEventTemplate(templateId: string): Promise<Partial<Event>> {
    await delay(400);
    const template = mockEventTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    template.usageCount++;
    return template.templateData;
  }

  // Bulk Operations
  async performBulkOperation(operation: Omit<BulkOperation, 'id' | 'createdAt' | 'status'>): Promise<BulkOperation> {
    await delay(2000);
    const bulkOp: BulkOperation = {
      ...operation,
      id: `bulk-${Date.now()}`,
      createdAt: new Date(),
      status: 'processing',
    };

    // Simulate processing
    setTimeout(() => {
      bulkOp.status = 'completed';
      bulkOp.completedAt = new Date();
    }, 3000);

    return bulkOp;
  }

  async getBulkOperationStatus(operationId: string): Promise<BulkOperation | null> {
    await delay(200);
    // In a real implementation, this would check the actual operation status
    return {
      id: operationId,
      type: 'edit',
      eventIds: ['1', '2', '3'],
      changes: {},
      status: 'completed',
      organizerId: 'org-1',
      createdAt: new Date(),
      completedAt: new Date(),
    };
  }

  // Analytics
  async getCollectionAnalytics(collectionId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<CollectionAnalytics> {
    await delay(1000);
    // Generate mock analytics data
    const generateMockData = (days: number) => {
      const data = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10,
        });
      }
      return data;
    };

    const generateRevenueData = (days: number) => {
      const data = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 500) + 100,
        });
      }
      return data;
    };

    const daysMap = { day: 7, week: 30, month: 90, year: 365 };
    const days = daysMap[period];

    return {
      collectionId,
      period,
      metrics: {
        views: generateMockData(days),
        ticketsSold: generateMockData(days),
        revenue: generateRevenueData(days),
        topEvents: [
          { eventId: '1', views: 450, tickets: 35, revenue: 875 },
          { eventId: '2', views: 380, tickets: 28, revenue: 700 },
          { eventId: '3', views: 320, tickets: 22, revenue: 550 },
        ],
      },
    };
  }

  // Public Collection URLs
  async getPublicCollectionUrl(collectionId: string): Promise<string> {
    await delay(300);
    const collection = mockCollections.find(c => c.id === collectionId);
    if (!collection || !collection.isPublic) {
      throw new Error('Collection not found or not public');
    }
    return `https://stepperslife.com/collections/${collectionId}`;
  }

  // Export functionality
  async exportCollectionData(collectionId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    await delay(1500);
    // Simulate export generation
    const mockData = format === 'json' 
      ? JSON.stringify({ collectionId, events: [], analytics: {} }, null, 2)
      : `Collection ID,Event Count,Total Revenue\n${collectionId},5,1250.00`;
    
    return new Blob([mockData], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
  }
}

export const eventCollectionsService = new EventCollectionsService(); 