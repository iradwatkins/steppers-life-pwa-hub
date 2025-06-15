export interface AdminEvent {
  id: string;
  name: string;
  organizerId: string;
  organizerName: string;
  status: 'published' | 'draft' | 'unpublished' | 'suspended' | 'removed';
  category: string;
  date: string; // YYYY-MM-DD
  location: string;
  ticketsSold: number;
  revenue: number;
  isFeatured: boolean;
  userReportsCount: number;
  refundRate: number;
  createdAt: string;
  lastUpdated: string;
}

const mockAdminEvents: AdminEvent[] = [
  {
    id: 'event-admin-001',
    name: 'Summer Dance Fest',
    organizerId: 'org-001',
    organizerName: 'Elite Dance Academy',
    status: 'published',
    category: 'Hip-Hop',
    date: '2024-08-15',
    location: 'New York, NY',
    ticketsSold: 12000,
    revenue: 250000,
    isFeatured: true,
    userReportsCount: 2,
    refundRate: 0.01,
    createdAt: '2023-01-01',
    lastUpdated: '2024-07-20',
  },
  {
    id: 'event-admin-002',
    name: 'Winter Jam Showcase',
    organizerId: 'org-002',
    organizerName: 'Urban Beats Studio',
    status: 'published',
    category: 'Breakdance',
    date: '2024-12-01',
    location: 'Los Angeles, CA',
    ticketsSold: 9500,
    revenue: 180000,
    isFeatured: false,
    userReportsCount: 0,
    refundRate: 0.005,
    createdAt: '2023-03-10',
    lastUpdated: '2024-07-18',
  },
  {
    id: 'event-admin-003',
    name: 'Hip-Hop Battle Royale',
    organizerId: 'org-001',
    organizerName: 'Elite Dance Academy',
    status: 'suspended',
    category: 'Hip-Hop',
    date: '2024-09-20',
    location: 'Chicago, IL',
    ticketsSold: 8000,
    revenue: 150000,
    isFeatured: false,
    userReportsCount: 15,
    refundRate: 0.05,
    createdAt: '2023-05-01',
    lastUpdated: '2024-07-22',
  },
  {
    id: 'event-admin-004',
    name: 'Beginner Ballet Workshop',
    organizerId: 'org-003',
    organizerName: 'Classic Dance Co.',
    status: 'published',
    category: 'Ballet',
    date: '2024-10-05',
    location: 'New York, NY',
    ticketsSold: 6500,
    revenue: 90000,
    isFeatured: true,
    userReportsCount: 1,
    refundRate: 0.008,
    createdAt: '2023-07-15',
    lastUpdated: '2024-07-21',
  },
  {
    id: 'event-admin-005',
    name: 'Street Style Masterclass',
    organizerId: 'org-004',
    organizerName: 'Groove Nation',
    status: 'unpublished',
    category: 'Street Dance',
    date: '2024-11-10',
    location: 'Miami, FL',
    ticketsSold: 500,
    revenue: 10000,
    isFeatured: false,
    userReportsCount: 0,
    refundRate: 0,
    createdAt: '2024-01-20',
    lastUpdated: '2024-07-19',
  },
  {
    id: 'event-admin-006',
    name: 'Jazz Fusion Night',
    organizerId: 'org-005',
    organizerName: 'Rhythm Makers',
    status: 'published',
    category: 'Jazz',
    date: '2024-08-01',
    location: 'Seattle, WA',
    ticketsSold: 4200,
    revenue: 75000,
    isFeatured: false,
    userReportsCount: 0,
    refundRate: 0.002,
    createdAt: '2023-09-01',
    lastUpdated: '2024-07-20',
  },
  {
    id: 'event-admin-007',
    name: 'Salsa & Bachata Social',
    organizerId: 'org-006',
    organizerName: 'Dance Innovations',
    status: 'published',
    category: 'Latin Dance',
    date: '2024-09-01',
    location: 'Houston, TX',
    ticketsSold: 3800,
    revenue: 60000,
    isFeatured: false,
    userReportsCount: 3,
    refundRate: 0.015,
    createdAt: '2023-11-05',
    lastUpdated: '2024-07-17',
  },
  {
    id: 'event-admin-008',
    name: 'Kids Dance Camp',
    organizerId: 'org-007',
    organizerName: 'Footwork Masters',
    status: 'published',
    category: 'Kids & Family',
    date: '2024-08-25',
    location: 'Denver, CO',
    ticketsSold: 3000,
    revenue: 45000,
    isFeatured: false,
    userReportsCount: 0,
    refundRate: 0,
    createdAt: '2024-02-10',
    lastUpdated: '2024-07-21',
  },
  {
    id: 'event-admin-009',
    name: 'Contemporary Choreography',
    organizerId: 'org-003',
    organizerName: 'Classic Dance Co.',
    status: 'draft',
    category: 'Contemporary',
    date: '2024-10-15',
    location: 'New York, NY',
    ticketsSold: 0,
    revenue: 0,
    isFeatured: false,
    userReportsCount: 0,
    refundRate: 0,
    createdAt: '2024-06-01',
    lastUpdated: '2024-06-01',
  },
  {
    id: 'event-admin-010',
    name: 'Online Popping Class',
    organizerId: 'org-008',
    organizerName: 'Stage Presence Pro',
    status: 'published',
    category: 'Online',
    date: '2024-08-30',
    location: 'Virtual',
    ticketsSold: 2000,
    revenue: 20000,
    isFeatured: true,
    userReportsCount: 0,
    refundRate: 0.001,
    createdAt: '2023-10-20',
    lastUpdated: '2024-07-22',
  },
];

class AdminEventService {
  private events: AdminEvent[] = [...mockAdminEvents];

  async getEvents(
    query: string = '',
    status: AdminEvent['status'] | '' = '',
    category: string = '',
    organizerId: string = '',
    dateRange?: { from?: string; to?: string },
    page: number = 1,
    limit: number = 10,
    sortBy: keyof AdminEvent = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ events: AdminEvent[]; total: number }> {
    console.log(`AdminEventService: Fetching events with query: "${query}", status: "${status}", category: "${category}", organizerId: "${organizerId}", dateRange: ${JSON.stringify(dateRange)}, page: ${page}, limit: ${limit}, sortBy: "${sortBy}", sortOrder: "${sortOrder}"`);

    let filteredEvents = this.events.filter(event => {
      const matchesQuery = query
        ? event.name.toLowerCase().includes(query.toLowerCase()) ||
          event.organizerName.toLowerCase().includes(query.toLowerCase()) ||
          event.location.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesStatus = status ? event.status === status : true;
      const matchesCategory = category ? event.category === category : true;
      const matchesOrganizer = organizerId ? event.organizerId === organizerId : true;
      const matchesDate = dateRange?.from && dateRange?.to
        ? event.date >= dateRange.from && event.date <= dateRange.to
        : true;
      return matchesQuery && matchesStatus && matchesCategory && matchesOrganizer && matchesDate;
    });

    // Sort events
    filteredEvents.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    const total = filteredEvents.length;
    const startIndex = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + limit);

    return new Promise((resolve) =>
      setTimeout(() => resolve({ events: paginatedEvents, total }), 500)
    );
  }

  async getEventById(eventId: string): Promise<AdminEvent | null> {
    console.log(`AdminEventService: Fetching event by ID: ${eventId}`);
    return new Promise((resolve) =>
      setTimeout(() => resolve(this.events.find(event => event.id === eventId) || null), 300)
    );
  }

  async updateEventStatus(eventId: string, newStatus: AdminEvent['status'], auditReason: string): Promise<AdminEvent> {
    console.log(`AdminEventService: Updating status for event ${eventId} to ${newStatus}. Reason: ${auditReason}`);
    const eventIndex = this.events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const updatedEvent = { ...this.events[eventIndex], status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] };
    this.events[eventIndex] = updatedEvent;

    console.log(`AUDIT: Event ${eventId} status changed to ${newStatus} by admin. Reason: ${auditReason}`);

    return new Promise((resolve) => setTimeout(() => resolve(updatedEvent), 300));
  }

  async featureEvent(eventId: string, isFeatured: boolean): Promise<AdminEvent> {
    console.log(`AdminEventService: Setting feature status for event ${eventId} to ${isFeatured}`);
    const eventIndex = this.events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const updatedEvent = { ...this.events[eventIndex], isFeatured: isFeatured, lastUpdated: new Date().toISOString().split('T')[0] };
    this.events[eventIndex] = updatedEvent;

    console.log(`AUDIT: Event ${eventId} featured status changed to ${isFeatured} by admin.`);

    return new Promise((resolve) => setTimeout(() => resolve(updatedEvent), 300));
  }

  async removeEvent(eventId: string, auditReason: string): Promise<{ message: string }> {
    console.log(`AdminEventService: Permanently removing event ${eventId}. Reason: ${auditReason}`);
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.id !== eventId);
    if (this.events.length === initialLength) {
      throw new Error('Event not found');
    }

    console.log(`AUDIT: Event ${eventId} permanently removed by admin. Reason: ${auditReason}`);

    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: `Event ${eventId} permanently removed.` }), 300)
    );
  }

  async submitClaim(eventId: string, claimType: string, description: string): Promise<{ message: string }> {
    console.log(`AdminEventService: Submitting claim for event ${eventId}: Type: ${claimType}, Description: ${description}`);
    // In a real system, this would store the claim and notify relevant parties.
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.userReportsCount += 1; // Simulate increase in reports
    }
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: `Claim for event ${eventId} (${claimType}) submitted.` }), 300)
    );
  }

  async resolveClaim(eventId: string, claimId: string, resolution: string): Promise<{ message: string }> {
    console.log(`AdminEventService: Resolving claim ${claimId} for event ${eventId}. Resolution: ${resolution}`);
    // In a real system, this would mark the claim as resolved.
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: `Claim ${claimId} for event ${eventId} resolved.` }), 300)
    );
  }

  async getEventClaims(eventId: string): Promise<{ id: string; type: string; description: string; status: string; date: string }[]> {
    console.log(`AdminEventService: Fetching claims for event ${eventId}`);
    // Mock claims for a given event
    const mockClaims = [
      { id: 'claim-001', type: 'Content Violation', description: 'Event promotes inappropriate content', status: 'open', date: '2024-07-10' },
      { id: 'claim-002', type: 'Intellectual Property', description: 'Unauthorized use of copyrighted music', status: 'open', date: '2024-07-12' },
      { id: 'claim-003', type: 'Spam', description: 'Multiple duplicate event listings', status: 'resolved', date: '2024-07-05' },
    ];
    return new Promise((resolve) => setTimeout(() => resolve(mockClaims), 300));
  }

  async getEventCategories(): Promise<string[]> {
    // In a real app, this would fetch from a central category service
    return new Promise((resolve) =>
      setTimeout(() => resolve([
        'Hip-Hop', 'Ballet', 'Contemporary', 'Jazz', 'Latin Dance', 'Street Dance', 'Online', 'Kids & Family', 'Other'
      ]), 200)
    );
  }
}

export const adminEventService = new AdminEventService(); 