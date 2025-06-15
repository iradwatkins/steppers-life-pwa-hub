import { Event, TicketPurchase, User } from '../types';

export interface SalesAgentData {
  agentId: string;
  agentInfo: SalesAgentInfo;
  assignedEvents: AssignedEvent[];
  salesMetrics: SalesMetrics;
  commissionData: CommissionData;
  customerDatabase: Customer[];
  salesTargets: SalesTarget[];
  recentActivity: SalesActivity[];
  teamCollaboration: TeamCollaborationData;
  lastUpdated: Date;
}

export interface SalesAgentInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizerId: string;
  organizerName: string;
  startDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  specializations: string[];
  territoryAssignments: string[];
  performanceRating: number;
}

export interface AssignedEvent {
  eventId: string;
  eventName: string;
  eventDate: Date;
  venue: string;
  ticketTypes: EventTicketType[];
  salesTarget: number;
  salesProgress: number;
  commissionRate: number;
  inventory: InventoryStatus;
  lastSaleDate?: Date;
}

export interface EventTicketType {
  typeId: string;
  name: string;
  price: number;
  commissionRate: number;
  availableQuantity: number;
  totalQuantity: number;
  restrictions?: string[];
}

export interface InventoryStatus {
  totalAvailable: number;
  totalSold: number;
  totalCapacity: number;
  lastUpdated: Date;
  criticalLowThreshold: number;
  byTicketType: {
    typeId: string;
    available: number;
    sold: number;
  }[];
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  totalCommissions: number;
  conversionRate: number;
  averageOrderValue: number;
  salesThisMonth: number;
  salesThisWeek: number;
  salesToday: number;
  goalsAchieved: number;
  totalGoals: number;
  rankAmongPeers: number;
  performanceScore: number;
}

export interface CommissionData {
  totalEarned: number;
  totalPaid: number;
  pendingPayout: number;
  currentPeriodEarnings: number;
  nextPayoutDate: Date;
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  commissionHistory: CommissionRecord[];
  payoutHistory: PayoutRecord[];
}

export interface CommissionRecord {
  id: string;
  eventId: string;
  eventName: string;
  saleId: string;
  customerName: string;
  ticketType: string;
  quantity: number;
  ticketPrice: number;
  commissionRate: number;
  commissionAmount: number;
  saleDate: Date;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
}

export interface PayoutRecord {
  id: string;
  amount: number;
  payoutDate: Date;
  period: string;
  commissionsIncluded: string[];
  method: 'bank_transfer' | 'paypal' | 'check';
  status: 'processing' | 'completed' | 'failed';
  reference: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate: Date;
  notes: string;
  tags: string[];
  leadSource: string;
  followUpDate?: Date;
  communicationHistory: CustomerCommunication[];
  preferences: CustomerPreferences;
}

export interface CustomerCommunication {
  date: Date;
  type: 'call' | 'email' | 'text' | 'meeting' | 'note';
  content: string;
  outcome?: string;
  followUpRequired: boolean;
}

export interface CustomerPreferences {
  eventTypes: string[];
  priceRange: { min: number; max: number };
  preferredContactMethod: 'email' | 'phone' | 'text';
  timezone: string;
  communicationFrequency: 'high' | 'medium' | 'low';
}

export interface SalesTarget {
  id: string;
  eventId: string;
  eventName: string;
  targetType: 'tickets' | 'revenue' | 'commission';
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'overdue';
  reward?: string;
}

export interface SalesActivity {
  id: string;
  type: 'sale' | 'lead_added' | 'follow_up' | 'goal_achieved' | 'commission_earned';
  description: string;
  eventId?: string;
  customerId?: string;
  amount?: number;
  timestamp: Date;
  details: Record<string, any>;
}

export interface TeamCollaborationData {
  sharedLeads: SharedLead[];
  teamMessages: TeamMessage[];
  collaborativeGoals: CollaborativeGoal[];
  peerComparisons: PeerComparison[];
}

export interface SharedLead {
  id: string;
  customerId: string;
  customerName: string;
  sharedBy: string;
  sharedWith: string;
  eventId: string;
  notes: string;
  status: 'pending' | 'accepted' | 'converted' | 'declined';
  sharedDate: Date;
}

export interface TeamMessage {
  id: string;
  from: string;
  message: string;
  eventId?: string;
  timestamp: Date;
  type: 'general' | 'event_specific' | 'urgent';
}

export interface CollaborativeGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  participants: string[];
  deadline: Date;
  reward: string;
}

export interface PeerComparison {
  agentId: string;
  agentName: string;
  salesThisMonth: number;
  commissionsThisMonth: number;
  conversionRate: number;
  rank: number;
}

export interface QuickSaleRequest {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'agent_processed';
}

export interface QuickSaleResponse {
  saleId: string;
  totalAmount: number;
  commissionAmount: number;
  confirmationCode: string;
  tickets: GeneratedTicket[];
  customerReceipt: string;
}

export interface GeneratedTicket {
  ticketId: string;
  qrCode: string;
  seatInfo?: string;
  specialInstructions?: string;
}

class SalesAgentService {
  private salesAgentData: Map<string, SalesAgentData> = new Map();

  async getSalesAgentData(agentId: string): Promise<SalesAgentData> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    if (this.salesAgentData.has(agentId)) {
      const data = this.salesAgentData.get(agentId)!;
      return this.updateRealTimeData(data);
    }

    // Generate mock data for demo
    const salesAgentData = this.generateMockSalesAgentData(agentId);
    this.salesAgentData.set(agentId, salesAgentData);
    return salesAgentData;
  }

  async processQuickSale(agentId: string, saleRequest: QuickSaleRequest): Promise<QuickSaleResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate ticket sale processing
    const saleId = `SALE-${Date.now()}`;
    const confirmationCode = this.generateConfirmationCode();
    
    // Calculate amounts
    const agentData = await this.getSalesAgentData(agentId);
    const event = agentData.assignedEvents.find(e => e.eventId === saleRequest.eventId);
    const ticketType = event?.ticketTypes.find(t => t.typeId === saleRequest.ticketTypeId);
    
    if (!event || !ticketType) {
      throw new Error('Event or ticket type not found');
    }

    const totalAmount = ticketType.price * saleRequest.quantity;
    const commissionAmount = totalAmount * (ticketType.commissionRate / 100);

    // Generate tickets
    const tickets: GeneratedTicket[] = Array.from({ length: saleRequest.quantity }, (_, i) => ({
      ticketId: `TIX-${saleId}-${i + 1}`,
      qrCode: this.generateQRCode(),
      seatInfo: event.eventName.includes('Reserved') ? `Section A, Row ${Math.floor(Math.random() * 10) + 1}, Seat ${Math.floor(Math.random() * 20) + 1}` : undefined,
    }));

    // Update inventory and sales data
    this.updateInventoryAfterSale(agentId, saleRequest);
    this.addSaleToHistory(agentId, saleRequest, totalAmount, commissionAmount);

    return {
      saleId,
      totalAmount,
      commissionAmount,
      confirmationCode,
      tickets,
      customerReceipt: `Receipt-${saleId}.pdf`
    };
  }

  async updateSalesTarget(agentId: string, targetId: string, newTargetValue: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agentData = this.salesAgentData.get(agentId);
    if (agentData) {
      const target = agentData.salesTargets.find(t => t.id === targetId);
      if (target) {
        target.targetValue = newTargetValue;
        target.status = target.currentValue >= newTargetValue ? 'completed' : 'active';
      }
    }
  }

  async addCustomer(agentId: string, customerData: Partial<Customer>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone,
      totalPurchases: 0,
      totalSpent: 0,
      lastPurchaseDate: new Date(),
      notes: customerData.notes || '',
      tags: customerData.tags || [],
      leadSource: 'agent_direct',
      communicationHistory: [],
      preferences: {
        eventTypes: [],
        priceRange: { min: 0, max: 1000 },
        preferredContactMethod: 'email',
        timezone: 'America/New_York',
        communicationFrequency: 'medium'
      }
    };

    const agentData = this.salesAgentData.get(agentId);
    if (agentData) {
      agentData.customerDatabase.push(newCustomer);
    }

    return newCustomer;
  }

  async shareLeadWithTeam(agentId: string, customerId: string, targetAgentId: string, eventId: string, notes: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const sharedLead: SharedLead = {
      id: `LEAD-${Date.now()}`,
      customerId,
      customerName: 'Customer Name', // Would get from customer database
      sharedBy: agentId,
      sharedWith: targetAgentId,
      eventId,
      notes,
      status: 'pending',
      sharedDate: new Date()
    };

    const agentData = this.salesAgentData.get(agentId);
    if (agentData) {
      agentData.teamCollaboration.sharedLeads.push(sharedLead);
    }
  }

  async exportSalesReport(agentId: string, format: 'csv' | 'pdf' | 'excel', dateRange: { start: Date; end: Date }): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const agentData = await this.getSalesAgentData(agentId);
    
    switch (format) {
      case 'csv':
        return this.exportAsCSV(agentData, dateRange);
      case 'excel':
        return this.exportAsExcel(agentData, dateRange);
      case 'pdf':
        return this.exportAsPDF(agentData, dateRange);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private updateRealTimeData(data: SalesAgentData): SalesAgentData {
    // Simulate real-time updates
    const now = new Date();
    const minutesSinceUpdate = Math.floor(
      (now.getTime() - data.lastUpdated.getTime()) / (1000 * 60)
    );

    if (minutesSinceUpdate > 0) {
      // Update metrics
      data.salesMetrics.salesToday += Math.floor(Math.random() * 2);
      data.salesMetrics.totalSales += Math.floor(Math.random() * 2);
      
      // Update inventory
      data.assignedEvents.forEach(event => {
        event.inventory.lastUpdated = now;
      });

      data.lastUpdated = now;
    }

    return data;
  }

  private generateMockSalesAgentData(agentId: string): SalesAgentData {
    const agentNames = ['Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis', 'Chris Rodriguez'];
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];

    return {
      agentId,
      agentInfo: {
        id: agentId,
        name: agentName,
        email: `${agentName.toLowerCase().replace(' ', '.')}@stepperslife.com`,
        phone: '+1-555-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        organizerId: 'ORG-001',
        organizerName: 'Steppers Life Events',
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        status: 'active',
        specializations: ['Salsa Events', 'Bachata Workshops', 'Social Dancing'],
        territoryAssignments: ['Downtown', 'North District'],
        performanceRating: 3.5 + Math.random() * 1.5
      },
      assignedEvents: this.generateMockAssignedEvents(),
      salesMetrics: this.generateMockSalesMetrics(),
      commissionData: this.generateMockCommissionData(),
      customerDatabase: this.generateMockCustomerDatabase(),
      salesTargets: this.generateMockSalesTargets(),
      recentActivity: this.generateMockRecentActivity(),
      teamCollaboration: this.generateMockTeamCollaboration(),
      lastUpdated: new Date()
    };
  }

  private generateMockAssignedEvents(): AssignedEvent[] {
    const eventNames = [
      'Advanced Salsa Workshop',
      'Bachata Social Night',
      'Kizomba Masterclass',
      'Latin Dance Festival',
      'Merengue Beginners Class'
    ];

    return eventNames.slice(0, 3).map((name, index) => ({
      eventId: `EVENT-${index + 1}`,
      eventName: name,
      eventDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      venue: `Dance Studio ${index + 1}`,
      ticketTypes: [
        {
          typeId: `TT-${index + 1}-1`,
          name: 'General Admission',
          price: 25 + Math.random() * 25,
          commissionRate: 10 + Math.random() * 5,
          availableQuantity: 80 + Math.floor(Math.random() * 40),
          totalQuantity: 100,
          restrictions: []
        },
        {
          typeId: `TT-${index + 1}-2`,
          name: 'VIP Access',
          price: 50 + Math.random() * 25,
          commissionRate: 15 + Math.random() * 5,
          availableQuantity: 15 + Math.floor(Math.random() * 10),
          totalQuantity: 25,
          restrictions: ['21+ Only']
        }
      ],
      salesTarget: 500 + Math.random() * 1000,
      salesProgress: Math.random() * 800,
      commissionRate: 12 + Math.random() * 8,
      inventory: {
        totalAvailable: 95 + Math.floor(Math.random() * 30),
        totalSold: Math.floor(Math.random() * 30),
        totalCapacity: 125,
        lastUpdated: new Date(),
        criticalLowThreshold: 10,
        byTicketType: [
          { typeId: `TT-${index + 1}-1`, available: 80, sold: 20 },
          { typeId: `TT-${index + 1}-2`, available: 15, sold: 10 }
        ]
      }
    }));
  }

  private generateMockSalesMetrics(): SalesMetrics {
    return {
      totalSales: 150 + Math.floor(Math.random() * 200),
      totalRevenue: 12000 + Math.random() * 15000,
      totalCommissions: 1800 + Math.random() * 2200,
      conversionRate: 0.15 + Math.random() * 0.20,
      averageOrderValue: 65 + Math.random() * 35,
      salesThisMonth: 45 + Math.floor(Math.random() * 30),
      salesThisWeek: 12 + Math.floor(Math.random() * 10),
      salesToday: 2 + Math.floor(Math.random() * 5),
      goalsAchieved: 8 + Math.floor(Math.random() * 5),
      totalGoals: 12,
      rankAmongPeers: 3 + Math.floor(Math.random() * 7),
      performanceScore: 75 + Math.random() * 20
    };
  }

  private generateMockCommissionData(): CommissionData {
    return {
      totalEarned: 15000 + Math.random() * 10000,
      totalPaid: 12000 + Math.random() * 8000,
      pendingPayout: 2500 + Math.random() * 1500,
      currentPeriodEarnings: 1200 + Math.random() * 800,
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      payoutSchedule: 'biweekly',
      commissionHistory: this.generateMockCommissionHistory(),
      payoutHistory: this.generateMockPayoutHistory()
    };
  }

  private generateMockCommissionHistory(): CommissionRecord[] {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `COMM-${i + 1}`,
      eventId: `EVENT-${Math.floor(Math.random() * 3) + 1}`,
      eventName: 'Sample Event',
      saleId: `SALE-${i + 1}`,
      customerName: `Customer ${i + 1}`,
      ticketType: Math.random() > 0.5 ? 'General Admission' : 'VIP Access',
      quantity: 1 + Math.floor(Math.random() * 3),
      ticketPrice: 25 + Math.random() * 50,
      commissionRate: 10 + Math.random() * 10,
      commissionAmount: 15 + Math.random() * 25,
      saleDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: ['pending', 'approved', 'paid'][Math.floor(Math.random() * 3)] as any
    }));
  }

  private generateMockPayoutHistory(): PayoutRecord[] {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `PAYOUT-${i + 1}`,
      amount: 1500 + Math.random() * 1000,
      payoutDate: new Date(Date.now() - (i + 1) * 14 * 24 * 60 * 60 * 1000),
      period: `Period ${i + 1}`,
      commissionsIncluded: [`COMM-${i * 3 + 1}`, `COMM-${i * 3 + 2}`, `COMM-${i * 3 + 3}`],
      method: ['bank_transfer', 'paypal'][Math.floor(Math.random() * 2)] as any,
      status: 'completed',
      reference: `REF-${i + 1}`
    }));
  }

  private generateMockCustomerDatabase(): Customer[] {
    const names = ['John Smith', 'Mary Johnson', 'David Wilson', 'Lisa Brown', 'Michael Davis'];
    
    return names.map((name, i) => ({
      id: `CUST-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      phone: '+1-555-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      totalPurchases: 1 + Math.floor(Math.random() * 10),
      totalSpent: 50 + Math.random() * 500,
      lastPurchaseDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      notes: 'Regular customer, prefers evening events',
      tags: ['VIP', 'Regular'],
      leadSource: 'referral',
      followUpDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
      communicationHistory: [],
      preferences: {
        eventTypes: ['Salsa', 'Bachata'],
        priceRange: { min: 20, max: 100 },
        preferredContactMethod: 'email',
        timezone: 'America/New_York',
        communicationFrequency: 'medium'
      }
    }));
  }

  private generateMockSalesTargets(): SalesTarget[] {
    return [
      {
        id: 'TARGET-1',
        eventId: 'EVENT-1',
        eventName: 'Advanced Salsa Workshop',
        targetType: 'tickets',
        targetValue: 50,
        currentValue: 32,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active',
        reward: '$100 bonus'
      },
      {
        id: 'TARGET-2',
        eventId: 'EVENT-2',
        eventName: 'Bachata Social Night',
        targetType: 'revenue',
        targetValue: 2000,
        currentValue: 1650,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        reward: 'Extra 2% commission'
      }
    ];
  }

  private generateMockRecentActivity(): SalesActivity[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `ACT-${i + 1}`,
      type: ['sale', 'lead_added', 'follow_up', 'goal_achieved', 'commission_earned'][Math.floor(Math.random() * 5)] as any,
      description: `Recent activity ${i + 1}`,
      eventId: `EVENT-${Math.floor(Math.random() * 3) + 1}`,
      customerId: `CUST-${Math.floor(Math.random() * 5) + 1}`,
      amount: Math.random() * 100,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      details: {}
    }));
  }

  private generateMockTeamCollaboration(): TeamCollaborationData {
    return {
      sharedLeads: [],
      teamMessages: [
        {
          id: 'MSG-1',
          from: 'Sarah Wilson',
          message: 'Great job on the weekend sales everyone!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'general'
        }
      ],
      collaborativeGoals: [
        {
          id: 'GOAL-1',
          title: 'Team Monthly Target',
          description: 'Sell 200 tickets collectively this month',
          targetValue: 200,
          currentValue: 145,
          participants: ['agent-1', 'agent-2', 'agent-3'],
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          reward: 'Team dinner'
        }
      ],
      peerComparisons: [
        {
          agentId: 'agent-1',
          agentName: 'Sarah Wilson',
          salesThisMonth: 52,
          commissionsThisMonth: 1850,
          conversionRate: 0.28,
          rank: 1
        },
        {
          agentId: 'agent-2',
          agentName: 'Mike Chen',
          salesThisMonth: 48,
          commissionsThisMonth: 1720,
          conversionRate: 0.25,
          rank: 2
        }
      ]
    };
  }

  private updateInventoryAfterSale(agentId: string, saleRequest: QuickSaleRequest): void {
    const agentData = this.salesAgentData.get(agentId);
    if (agentData) {
      const event = agentData.assignedEvents.find(e => e.eventId === saleRequest.eventId);
      if (event) {
        event.inventory.totalSold += saleRequest.quantity;
        event.inventory.totalAvailable -= saleRequest.quantity;
        
        const ticketTypeInventory = event.inventory.byTicketType.find(t => t.typeId === saleRequest.ticketTypeId);
        if (ticketTypeInventory) {
          ticketTypeInventory.sold += saleRequest.quantity;
          ticketTypeInventory.available -= saleRequest.quantity;
        }

        event.salesProgress += saleRequest.quantity;
      }
    }
  }

  private addSaleToHistory(agentId: string, saleRequest: QuickSaleRequest, totalAmount: number, commissionAmount: number): void {
    const agentData = this.salesAgentData.get(agentId);
    if (agentData) {
      // Update metrics
      agentData.salesMetrics.totalSales += saleRequest.quantity;
      agentData.salesMetrics.totalRevenue += totalAmount;
      agentData.salesMetrics.totalCommissions += commissionAmount;
      agentData.salesMetrics.salesToday += saleRequest.quantity;

      // Add commission record
      const commissionRecord: CommissionRecord = {
        id: `COMM-${Date.now()}`,
        eventId: saleRequest.eventId,
        eventName: agentData.assignedEvents.find(e => e.eventId === saleRequest.eventId)?.eventName || '',
        saleId: `SALE-${Date.now()}`,
        customerName: saleRequest.customerInfo.name,
        ticketType: agentData.assignedEvents.find(e => e.eventId === saleRequest.eventId)?.ticketTypes.find(t => t.typeId === saleRequest.ticketTypeId)?.name || '',
        quantity: saleRequest.quantity,
        ticketPrice: totalAmount / saleRequest.quantity,
        commissionRate: agentData.assignedEvents.find(e => e.eventId === saleRequest.eventId)?.ticketTypes.find(t => t.typeId === saleRequest.ticketTypeId)?.commissionRate || 0,
        commissionAmount,
        saleDate: new Date(),
        status: 'pending'
      };

      agentData.commissionData.commissionHistory.unshift(commissionRecord);
      agentData.commissionData.pendingPayout += commissionAmount;
      agentData.commissionData.currentPeriodEarnings += commissionAmount;
    }
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateQRCode(): string {
    return `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }

  private exportAsCSV(data: SalesAgentData, dateRange: { start: Date; end: Date }): Blob {
    const csvContent = `Agent,Event,Sale Date,Customer,Tickets,Revenue,Commission
${data.commissionData.commissionHistory
  .filter(record => record.saleDate >= dateRange.start && record.saleDate <= dateRange.end)
  .map(record => `${data.agentInfo.name},${record.eventName},${record.saleDate.toLocaleDateString()},${record.customerName},${record.quantity},${record.ticketPrice * record.quantity},${record.commissionAmount}`)
  .join('\n')}`;

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private exportAsExcel(data: SalesAgentData, dateRange: { start: Date; end: Date }): Blob {
    // Mock Excel export
    return new Blob(['Excel data would go here'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private exportAsPDF(data: SalesAgentData, dateRange: { start: Date; end: Date }): Blob {
    // Mock PDF export
    return new Blob(['PDF report data would go here'], { type: 'application/pdf' });
  }
}

export const salesAgentService = new SalesAgentService(); 