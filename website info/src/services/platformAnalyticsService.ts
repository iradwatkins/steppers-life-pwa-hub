export interface PlatformAnalytics {
  totalUsers: number;
  activeOrganizers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalVODSubscriptions: number;
  userGrowthOverTime: { date: string; users: number }[];
  ticketSalesVolumeOverTime: { date: string; sales: number }[];
  topEventsBySales: { id: string; name: string; sales: number }[];
  topActiveOrganizers: { id: string; name: string; events: number }[];
  topVODContent: { id: string; title: string; views: number }[];
}

const mockPlatformData: PlatformAnalytics = {
  totalUsers: 12500,
  activeOrganizers: 320,
  totalEvents: 1800,
  totalTicketsSold: 95000,
  totalVODSubscriptions: 1500,
  userGrowthOverTime: Array.from({ length: 12 }).map((_, i) => ({
    date: `2023-${String(i + 1).padStart(2, '0')}-01`,
    users: 10000 + i * 200 + Math.floor(Math.random() * 100),
  })),
  ticketSalesVolumeOverTime: Array.from({ length: 12 }).map((_, i) => ({
    date: `2023-${String(i + 1).padStart(2, '0')}-01`,
    sales: 5000 + i * 800 + Math.floor(Math.random() * 300),
  })),
  topEventsBySales: [
    { id: 'event-001', name: 'Summer Dance Fest', sales: 12000 },
    { id: 'event-002', name: 'Winter Jam Showcase', sales: 9500 },
    { id: 'event-003', name: 'Hip-Hop Battle Royale', sales: 8000 },
    { id: 'event-004', name: 'Beginner Ballet Workshop', sales: 6500 },
    { id: 'event-005', name: 'Street Style Masterclass', sales: 5000 },
    { id: 'event-006', name: 'Jazz Fusion Night', sales: 4200 },
    { id: 'event-007', name: 'Salsa & Bachata Social', sales: 3800 },
    { id: 'event-008', name: 'Kids Dance Camp', sales: 3000 },
    { id: 'event-009', name: 'Contemporary Choreography', sales: 2500 },
    { id: 'event-010', name: 'Online Popping Class', sales: 2000 },
  ],
  topActiveOrganizers: [
    { id: 'org-001', name: 'Elite Dance Academy', events: 50 },
    { id: 'org-002', name: 'Urban Beats Studio', events: 45 },
    { id: 'org-003', name: 'Classic Dance Co.', events: 38 },
    { id: 'org-004', name: 'Groove Nation', events: 30 },
    { id: 'org-005', name: 'Rhythm Makers', events: 25 },
    { id: 'org-006', name: 'Dance Innovations', events: 22 },
    { id: 'org-007', name: 'Footwork Masters', events: 18 },
    { id: 'org-008', name: 'Stage Presence Pro', events: 15 },
    { id: 'org-009', name: 'Creative Movement', events: 12 },
    { id: 'org-010', name: 'The Dance Hub', events: 10 },
  ],
  topVODContent: [
    { id: 'vod-001', title: 'Mastering Spins & Turns', views: 5000 },
    { id: 'vod-002', title: 'Advanced Choreography', views: 4500 },
    { id: 'vod-003', title: 'Hip-Hop Foundations', views: 4000 },
    { id: 'vod-004', title: 'Ballet Technique Basics', views: 3500 },
    { id: 'vod-005', title: 'Contemporary Flow', views: 3000 },
    { id: 'vod-006', title: 'Salsa Partnerwork', views: 2800 },
    { id: 'vod-007', title: 'Breaking Moves', views: 2500 },
    { id: 'vod-008', title: 'Flexibility & Conditioning', views: 2200 },
    { id: 'vod-009', title: 'Jazz Funk Routines', views: 2000 },
    { id: 'vod-010', title: 'Kids Dance Fun', views: 1800 },
  ],
};

class PlatformAnalyticsService {
  async getPlatformAnalytics(startDate?: string, endDate?: string): Promise<PlatformAnalytics> {
    console.log(`Fetching platform analytics for period: ${startDate || 'start'} to ${endDate || 'end'}`);
    // In a real application, this would fetch and aggregate data from various databases/services
    // For now, we return mock data, possibly filtered by date if implemented

    let filteredUserGrowth = mockPlatformData.userGrowthOverTime;
    let filteredTicketSales = mockPlatformData.ticketSalesVolumeOverTime;

    if (startDate && endDate) {
      filteredUserGrowth = mockPlatformData.userGrowthOverTime.filter(data => 
        data.date >= startDate && data.date <= endDate
      );
      filteredTicketSales = mockPlatformData.ticketSalesVolumeOverTime.filter(data => 
        data.date >= startDate && data.date <= endDate
      );
    }

    // Simulate slight variations if dates are provided to make it look dynamic
    const dynamicData: PlatformAnalytics = {
        ...mockPlatformData,
        userGrowthOverTime: filteredUserGrowth,
        ticketSalesVolumeOverTime: filteredTicketSales,
        // Simulate slight changes in macro numbers based on date filter (very basic)
        totalUsers: mockPlatformData.totalUsers + (startDate ? Math.floor(Math.random() * 500) - 250 : 0),
        totalTicketsSold: mockPlatformData.totalTicketsSold + (startDate ? Math.floor(Math.random() * 5000) - 2500 : 0),
    };

    return new Promise((resolve) =>
      setTimeout(() => resolve(dynamicData), 500)
    );
  }
}

export const platformAnalyticsService = new PlatformAnalyticsService(); 