export interface EventStaffMember {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone?: string;
  role: 'event_staff' | 'scanner' | 'coordinator' | 'security';
  eventId: string;
  eventTitle: string;
  permissions: EventStaffPermissions;
  status: 'active' | 'inactive' | 'suspended';
  assignedAreas: string[];
  shiftSchedule: StaffShift[];
  profilePhoto?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  createdDate: Date;
  lastActiveDate?: Date;
}

export interface EventStaffPermissions {
  canCheckIn: boolean;
  canViewAttendeeList: boolean;
  canGenerateReports: boolean;
  canAccessInventory: boolean;
  canManageStaff: boolean;
  canViewFinancials: boolean;
  restrictedToAreas: string[];
  maxCheckinsPerHour?: number;
}

export interface StaffShift {
  id: string;
  startTime: Date;
  endTime: Date;
  area: string;
  role: string;
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'missed';
  actualStartTime?: Date;
  actualEndTime?: Date;
  notes?: string;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  staffName: string;
  eventId: string;
  activityType: 'check_in' | 'attendee_checkin' | 'report_generation' | 'manual_entry' | 'emergency_action' | 'break_start' | 'break_end' | 'shift_start' | 'shift_end';
  timestamp: Date;
  details: Record<string, any>;
  location?: {
    area: string;
    coordinates?: { lat: number; lng: number };
  };
  duration?: number; // in seconds
  relatedRecords?: string[]; // IDs of related attendees, reports, etc.
  deviceInfo?: {
    userAgent: string;
    platform: string;
    battery?: number;
    connectionType?: string;
  };
}

export interface StaffPerformanceMetrics {
  staffId: string;
  staffName: string;
  eventId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalHoursWorked: number;
  totalCheckIns: number;
  checkInsPerHour: number;
  averageCheckInTime: number; // in seconds
  errorRate: number; // percentage
  attendeesScannerSuccessRate: number;
  punctualityScore: number; // percentage
  reliabilityScore: number;
  customerServiceRating?: number;
  achievements: StaffAchievement[];
  incidents: StaffIncident[];
  feedback: StaffFeedback[];
}

export interface StaffAchievement {
  id: string;
  type: 'speed_record' | 'accuracy_award' | 'punctuality_star' | 'helper_hero' | 'problem_solver';
  title: string;
  description: string;
  earnedDate: Date;
  criteria: string;
  points: number;
}

export interface StaffIncident {
  id: string;
  type: 'late_arrival' | 'early_departure' | 'missed_shift' | 'equipment_issue' | 'customer_complaint' | 'policy_violation';
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: Date;
  impact: string;
}

export interface StaffFeedback {
  id: string;
  fromType: 'organizer' | 'attendee' | 'peer' | 'supervisor';
  fromName: string;
  rating: number; // 1-5
  comment: string;
  timestamp: Date;
  categories: string[];
  isPublic: boolean;
}

export interface EventStaffSummary {
  totalStaff: number;
  activeStaff: number;
  onShiftStaff: number;
  totalCheckIns: number;
  averageCheckInRate: number;
  topPerformers: Array<{
    staffId: string;
    staffName: string;
    score: number;
    checkIns: number;
  }>;
  areasCovered: Array<{
    area: string;
    staffCount: number;
    checkInRate: number;
  }>;
  shiftCoverage: {
    current: number; // percentage
    upcoming: number;
    gaps: Array<{
      area: string;
      time: Date;
      duration: number;
    }>;
  };
}

export interface PWAEventAccess {
  eventId: string;
  eventTitle: string;
  accessLevel: 'full' | 'limited' | 'read_only';
  permissions: EventStaffPermissions;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  lastAccessDate?: Date;
  accessToken: string;
}

class EventStaffService {
  private staffMembers: EventStaffMember[] = [];
  private activities: StaffActivity[] = [];
  private metrics: StaffPerformanceMetrics[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate mock staff members
    this.staffMembers = this.generateMockStaffMembers();
    this.activities = this.generateMockActivities();
    this.metrics = this.generateMockMetrics();
  }

  private generateMockStaffMembers(): EventStaffMember[] {
    const roles: EventStaffMember['role'][] = ['event_staff', 'scanner', 'coordinator', 'security'];
    const areas = ['Main Entrance', 'VIP Section', 'Dance Floor', 'Bar Area', 'Emergency Exit'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `staff_${i + 1}`,
      userId: `user_${i + 100}`,
      userName: `Staff Member ${i + 1}`,
      email: `staff${i + 1}@stepperslife.com`,
      phone: `+1555${String(i).padStart(3, '0')}${String(i + 1000).slice(-4)}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      eventId: `event_${Math.floor(Math.random() * 3) + 1}`,
      eventTitle: `Dance Event ${Math.floor(Math.random() * 3) + 1}`,
      permissions: this.generateMockPermissions(roles[Math.floor(Math.random() * roles.length)]),
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      assignedAreas: [areas[Math.floor(Math.random() * areas.length)]],
      shiftSchedule: this.generateMockShifts(),
      profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=staff${i + 1}`,
      emergencyContact: {
        name: `Emergency Contact ${i + 1}`,
        phone: `+1555${String(i + 500).padStart(3, '0')}${String(i + 2000).slice(-4)}`,
        relationship: ['spouse', 'parent', 'sibling', 'friend'][Math.floor(Math.random() * 4)]
      },
      notes: i % 3 === 0 ? `Special notes for staff member ${i + 1}` : undefined,
      createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastActiveDate: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
    }));
  }

  private generateMockPermissions(role: EventStaffMember['role']): EventStaffPermissions {
    switch (role) {
      case 'coordinator':
        return {
          canCheckIn: true,
          canViewAttendeeList: true,
          canGenerateReports: true,
          canAccessInventory: true,
          canManageStaff: true,
          canViewFinancials: false,
          restrictedToAreas: []
        };
      case 'scanner':
        return {
          canCheckIn: true,
          canViewAttendeeList: true,
          canGenerateReports: false,
          canAccessInventory: false,
          canManageStaff: false,
          canViewFinancials: false,
          restrictedToAreas: ['Main Entrance'],
          maxCheckinsPerHour: 100
        };
      case 'security':
        return {
          canCheckIn: true,
          canViewAttendeeList: true,
          canGenerateReports: true,
          canAccessInventory: false,
          canManageStaff: false,
          canViewFinancials: false,
          restrictedToAreas: []
        };
      default: // event_staff
        return {
          canCheckIn: true,
          canViewAttendeeList: true,
          canGenerateReports: false,
          canAccessInventory: false,
          canManageStaff: false,
          canViewFinancials: false,
          restrictedToAreas: ['Main Entrance', 'Dance Floor']
        };
    }
  }

  private generateMockShifts(): StaffShift[] {
    const areas = ['Main Entrance', 'VIP Section', 'Dance Floor', 'Bar Area'];
    const shifts: StaffShift[] = [];
    
    // Generate shifts for next 7 days
    for (let day = 0; day < 7; day++) {
      const shiftDate = new Date(Date.now() + day * 24 * 60 * 60 * 1000);
      
      if (Math.random() > 0.3) { // 70% chance of having a shift
        const startHour = Math.floor(Math.random() * 4) + 18; // 6PM - 10PM
        const duration = Math.floor(Math.random() * 4) + 4; // 4-8 hours
        
        shifts.push({
          id: `shift_${day}_${Math.random().toString(36).substr(2, 9)}`,
          startTime: new Date(shiftDate.setHours(startHour, 0, 0, 0)),
          endTime: new Date(shiftDate.setHours(startHour + duration, 0, 0, 0)),
          area: areas[Math.floor(Math.random() * areas.length)],
          role: 'Scanner',
          status: day < 2 ? 'checked_out' : 'scheduled',
          actualStartTime: day < 2 ? new Date(shiftDate.setHours(startHour, Math.floor(Math.random() * 30), 0, 0)) : undefined,
          actualEndTime: day < 2 ? new Date(shiftDate.setHours(startHour + duration, Math.floor(Math.random() * 30), 0, 0)) : undefined
        });
      }
    }
    
    return shifts;
  }

  private generateMockActivities(): StaffActivity[] {
    const activityTypes: StaffActivity['activityType'][] = [
      'check_in', 'attendee_checkin', 'report_generation', 'manual_entry', 'break_start', 'break_end', 'shift_start', 'shift_end'
    ];
    const areas = ['Main Entrance', 'VIP Section', 'Dance Floor', 'Bar Area', 'Emergency Exit'];
    
    return Array.from({ length: 200 }, (_, i) => ({
      id: `activity_${i + 1}`,
      staffId: `staff_${Math.floor(Math.random() * 15) + 1}`,
      staffName: `Staff Member ${Math.floor(Math.random() * 15) + 1}`,
      eventId: `event_${Math.floor(Math.random() * 3) + 1}`,
      activityType: activityTypes[Math.floor(Math.random() * activityTypes.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      details: this.generateActivityDetails(activityTypes[Math.floor(Math.random() * activityTypes.length)]),
      location: {
        area: areas[Math.floor(Math.random() * areas.length)],
        coordinates: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.01,
          lng: -74.0060 + (Math.random() - 0.5) * 0.01
        }
      },
      duration: Math.floor(Math.random() * 300) + 30, // 30 seconds to 5 minutes
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        platform: 'iOS',
        battery: Math.floor(Math.random() * 100),
        connectionType: ['wifi', '4g', '5g'][Math.floor(Math.random() * 3)]
      }
    }));
  }

  private generateActivityDetails(activityType: StaffActivity['activityType']): Record<string, any> {
    switch (activityType) {
      case 'attendee_checkin':
        return {
          attendeeId: `attendee_${Math.floor(Math.random() * 1000) + 1}`,
          scanMethod: ['qr_scan', 'manual_entry'][Math.floor(Math.random() * 2)],
          success: Math.random() > 0.05,
          attemptCount: Math.floor(Math.random() * 3) + 1
        };
      case 'manual_entry':
        return {
          reason: ['damaged_ticket', 'no_phone', 'technical_issue'][Math.floor(Math.random() * 3)],
          attendeeName: `Attendee ${Math.floor(Math.random() * 1000) + 1}`,
          verificationMethod: ['id_check', 'purchase_confirmation', 'guest_list'][Math.floor(Math.random() * 3)]
        };
      case 'report_generation':
        return {
          reportType: ['hourly_summary', 'incident_report', 'attendance_count'][Math.floor(Math.random() * 3)],
          recordCount: Math.floor(Math.random() * 100) + 10
        };
      default:
        return {
          action: activityType,
          timestamp: new Date(),
          success: true
        };
    }
  }

  private generateMockMetrics(): StaffPerformanceMetrics[] {
    return this.staffMembers.map((staff, i) => ({
      staffId: staff.id,
      staffName: staff.userName,
      eventId: staff.eventId,
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      totalHoursWorked: Math.floor(Math.random() * 40) + 10,
      totalCheckIns: Math.floor(Math.random() * 500) + 50,
      checkInsPerHour: Math.floor(Math.random() * 30) + 10,
      averageCheckInTime: Math.floor(Math.random() * 60) + 15,
      errorRate: Math.random() * 5,
      attendeesScannerSuccessRate: 95 + Math.random() * 5,
      punctualityScore: 80 + Math.random() * 20,
      reliabilityScore: 85 + Math.random() * 15,
      customerServiceRating: 3.5 + Math.random() * 1.5,
      achievements: this.generateMockAchievements(),
      incidents: Math.random() > 0.7 ? [this.generateMockIncident()] : [],
      feedback: this.generateMockFeedback()
    }));
  }

  private generateMockAchievements(): StaffAchievement[] {
    const achievementTypes: StaffAchievement['type'][] = [
      'speed_record', 'accuracy_award', 'punctuality_star', 'helper_hero', 'problem_solver'
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => {
      const type = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];
      return {
        id: `achievement_${i + 1}`,
        type,
        title: this.getAchievementTitle(type),
        description: this.getAchievementDescription(type),
        earnedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        criteria: this.getAchievementCriteria(type),
        points: Math.floor(Math.random() * 50) + 25
      };
    });
  }

  private getAchievementTitle(type: StaffAchievement['type']): string {
    switch (type) {
      case 'speed_record': return 'Speed Demon';
      case 'accuracy_award': return 'Accuracy Expert';
      case 'punctuality_star': return 'Always On Time';
      case 'helper_hero': return 'Helper Hero';
      case 'problem_solver': return 'Problem Solver';
      default: return 'Achievement';
    }
  }

  private getAchievementDescription(type: StaffAchievement['type']): string {
    switch (type) {
      case 'speed_record': return 'Fastest check-in processing in a single hour';
      case 'accuracy_award': return '100% accuracy rate for entire shift';
      case 'punctuality_star': return 'Perfect attendance and punctuality for 30 days';
      case 'helper_hero': return 'Exceptional assistance to attendees and colleagues';
      case 'problem_solver': return 'Successfully resolved complex technical issues';
      default: return 'Outstanding performance';
    }
  }

  private getAchievementCriteria(type: StaffAchievement['type']): string {
    switch (type) {
      case 'speed_record': return 'Process 50+ check-ins in one hour';
      case 'accuracy_award': return 'Zero errors during entire shift';
      case 'punctuality_star': return 'No late arrivals for 30+ days';
      case 'helper_hero': return 'Receive 5+ positive feedback in one event';
      case 'problem_solver': return 'Resolve 3+ technical issues independently';
      default: return 'Meet performance standards';
    }
  }

  private generateMockIncident(): StaffIncident {
    const incidentTypes: StaffIncident['type'][] = [
      'late_arrival', 'early_departure', 'equipment_issue', 'customer_complaint'
    ];
    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    
    return {
      id: `incident_${Date.now()}`,
      type,
      description: this.getIncidentDescription(type),
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as StaffIncident['severity'],
      resolution: Math.random() > 0.5 ? 'Issue resolved through training' : undefined,
      resolvedBy: Math.random() > 0.5 ? 'coordinator_1' : undefined,
      resolvedDate: Math.random() > 0.5 ? new Date() : undefined,
      impact: 'Minor delay in check-in process'
    };
  }

  private getIncidentDescription(type: StaffIncident['type']): string {
    switch (type) {
      case 'late_arrival': return 'Arrived 15 minutes late due to traffic';
      case 'early_departure': return 'Left shift 30 minutes early without permission';
      case 'equipment_issue': return 'Scanner device malfunctioned during peak hours';
      case 'customer_complaint': return 'Attendee complained about slow check-in process';
      default: return 'General incident occurred';
    }
  }

  private generateMockFeedback(): StaffFeedback[] {
    return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
      id: `feedback_${i + 1}`,
      fromType: ['organizer', 'attendee', 'peer', 'supervisor'][Math.floor(Math.random() * 4)] as StaffFeedback['fromType'],
      fromName: `Feedback Giver ${i + 1}`,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
      comment: 'Great work and professional attitude throughout the event.',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      categories: ['professionalism', 'efficiency', 'helpfulness'],
      isPublic: Math.random() > 0.3
    }));
  }

  // Core service methods
  async getEventStaffMembers(eventId: string): Promise<EventStaffMember[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.staffMembers.filter(staff => staff.eventId === eventId);
  }

  async getStaffMemberById(staffId: string): Promise<EventStaffMember | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staffMembers.find(staff => staff.id === staffId) || null;
  }

  async updateStaffMember(staffId: string, updates: Partial<EventStaffMember>): Promise<EventStaffMember> {
    const staff = this.staffMembers.find(s => s.id === staffId);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    Object.assign(staff, updates);
    return staff;
  }

  async recordStaffActivity(activity: Omit<StaffActivity, 'id' | 'timestamp'>): Promise<StaffActivity> {
    const newActivity: StaffActivity = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date()
    };

    this.activities.push(newActivity);
    
    // Update staff last active date
    const staff = this.staffMembers.find(s => s.id === activity.staffId);
    if (staff) {
      staff.lastActiveDate = new Date();
    }

    return newActivity;
  }

  async getStaffActivities(
    eventId: string,
    filters?: {
      staffId?: string;
      activityType?: StaffActivity['activityType'];
      dateRange?: { start: Date; end: Date };
      area?: string;
    }
  ): Promise<StaffActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = this.activities.filter(activity => activity.eventId === eventId);

    if (filters?.staffId) {
      filtered = filtered.filter(a => a.staffId === filters.staffId);
    }
    if (filters?.activityType) {
      filtered = filtered.filter(a => a.activityType === filters.activityType);
    }
    if (filters?.dateRange) {
      filtered = filtered.filter(a => 
        a.timestamp >= filters.dateRange!.start && 
        a.timestamp <= filters.dateRange!.end
      );
    }
    if (filters?.area) {
      filtered = filtered.filter(a => a.location?.area === filters.area);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getStaffPerformanceMetrics(staffId: string): Promise<StaffPerformanceMetrics | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.metrics.find(metric => metric.staffId === staffId) || null;
  }

  async getEventStaffSummary(eventId: string): Promise<EventStaffSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const eventStaff = this.staffMembers.filter(staff => staff.eventId === eventId);
    const activeStaff = eventStaff.filter(staff => staff.status === 'active');
    const eventActivities = this.activities.filter(activity => activity.eventId === eventId);
    
    // Calculate on-shift staff (those with shifts in the last 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const onShiftStaff = eventStaff.filter(staff => 
      staff.shiftSchedule.some(shift => 
        shift.startTime <= now && shift.endTime >= yesterday && shift.status === 'checked_in'
      )
    );

    const totalCheckIns = eventActivities.filter(a => a.activityType === 'attendee_checkin').length;
    
    // Calculate top performers
    const staffPerformance = eventStaff.map(staff => {
      const staffActivities = eventActivities.filter(a => a.staffId === staff.id);
      const checkIns = staffActivities.filter(a => a.activityType === 'attendee_checkin').length;
      const metrics = this.metrics.find(m => m.staffId === staff.id);
      
      return {
        staffId: staff.id,
        staffName: staff.userName,
        score: metrics ? metrics.reliabilityScore + metrics.punctualityScore : 0,
        checkIns
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    // Calculate area coverage
    const areas = ['Main Entrance', 'VIP Section', 'Dance Floor', 'Bar Area', 'Emergency Exit'];
    const areasCovered = areas.map(area => {
      const areaStaff = eventStaff.filter(staff => staff.assignedAreas.includes(area));
      const areaCheckIns = eventActivities.filter(a => a.location?.area === area && a.activityType === 'attendee_checkin');
      
      return {
        area,
        staffCount: areaStaff.length,
        checkInRate: areaCheckIns.length
      };
    });

    return {
      totalStaff: eventStaff.length,
      activeStaff: activeStaff.length,
      onShiftStaff: onShiftStaff.length,
      totalCheckIns,
      averageCheckInRate: totalCheckIns / Math.max(activeStaff.length, 1),
      topPerformers: staffPerformance,
      areasCovered,
      shiftCoverage: {
        current: Math.floor((onShiftStaff.length / Math.max(eventStaff.length, 1)) * 100),
        upcoming: 85, // Mock upcoming coverage
        gaps: [] // Mock - no gaps currently
      }
    };
  }

  async validatePWAAccess(userId: string, eventId: string): Promise<PWAEventAccess | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const staff = this.staffMembers.find(s => s.userId === userId && s.eventId === eventId);
    if (!staff || staff.status !== 'active') {
      return null;
    }

    return {
      eventId: staff.eventId,
      eventTitle: staff.eventTitle,
      accessLevel: staff.role === 'coordinator' ? 'full' : staff.role === 'scanner' ? 'limited' : 'read_only',
      permissions: staff.permissions,
      validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      lastAccessDate: staff.lastActiveDate,
      accessToken: `pwa_token_${userId}_${eventId}_${Date.now()}`
    };
  }

  async checkInStaff(staffId: string, location?: { area: string; coordinates?: { lat: number; lng: number } }): Promise<void> {
    await this.recordStaffActivity({
      staffId,
      staffName: this.staffMembers.find(s => s.id === staffId)?.userName || 'Unknown',
      eventId: this.staffMembers.find(s => s.id === staffId)?.eventId || '',
      activityType: 'shift_start',
      details: { location },
      location
    });

    // Update shift status
    const staff = this.staffMembers.find(s => s.id === staffId);
    if (staff) {
      const currentShift = staff.shiftSchedule.find(shift => 
        shift.status === 'scheduled' && 
        shift.startTime <= new Date() && 
        shift.endTime >= new Date()
      );
      
      if (currentShift) {
        currentShift.status = 'checked_in';
        currentShift.actualStartTime = new Date();
      }
    }
  }

  async checkOutStaff(staffId: string): Promise<void> {
    await this.recordStaffActivity({
      staffId,
      staffName: this.staffMembers.find(s => s.id === staffId)?.userName || 'Unknown',
      eventId: this.staffMembers.find(s => s.id === staffId)?.eventId || '',
      activityType: 'shift_end',
      details: { checkoutTime: new Date() }
    });

    // Update shift status
    const staff = this.staffMembers.find(s => s.id === staffId);
    if (staff) {
      const currentShift = staff.shiftSchedule.find(shift => shift.status === 'checked_in');
      
      if (currentShift) {
        currentShift.status = 'checked_out';
        currentShift.actualEndTime = new Date();
      }
    }
  }
}

export const eventStaffService = new EventStaffService(); 