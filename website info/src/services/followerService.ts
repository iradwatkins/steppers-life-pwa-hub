import { addDays, subDays, format } from 'date-fns';

// User Role Types
export type UserRole = 'follower' | 'sales_agent' | 'event_staff' | 'marketing_assistant';

// Permission Categories
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'events' | 'financial' | 'attendees' | 'marketing' | 'settings';
}

// Role Configuration
export interface RoleConfig {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
}

// Team Member Profile
export interface TeamMember {
  id: string;
  userId: string;
  organizerId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  invitedBy?: string;
  specialties: string[];
  contactInfo: {
    phone?: string;
    timezone: string;
    availability: 'full_time' | 'part_time' | 'weekend_only' | 'event_only';
  };
  performance: {
    eventsManaged: number;
    totalSales: number;
    averageRating: number;
    completedTasks: number;
  };
  notes?: string;
}

// Team Invitation
export interface TeamInvitation {
  id: string;
  organizerId: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  message?: string;
  token: string;
}

// Activity Log Entry
export interface ActivityLog {
  id: string;
  userId: string;
  organizerId: string;
  action: string;
  details: string;
  category: 'login' | 'event_management' | 'sales' | 'marketing' | 'system';
  timestamp: string;
  metadata?: Record<string, any>;
}

// Team Analytics
export interface TeamAnalytics {
  totalMembers: number;
  activeMembers: number;
  roleDistribution: Record<UserRole, number>;
  totalSales: number;
  totalEventsManaged: number;
  averageTeamRating: number;
  activitySummary: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topPerformers: TeamMember[];
}

// Filters and Search
export interface TeamMemberFilters {
  role?: UserRole[];
  status?: ('active' | 'suspended' | 'pending')[];
  searchTerm?: string;
  joinDateRange?: {
    start: string;
    end: string;
  };
  lastActiveRange?: {
    start: string;
    end: string;
  };
  specialties?: string[];
  availability?: string[];
}

// Permission system configuration
const PERMISSIONS: Permission[] = [
  // Event Management Permissions
  { id: 'view_events', name: 'View Events', description: 'View event details and listings', category: 'events' },
  { id: 'create_events', name: 'Create Events', description: 'Create new events', category: 'events' },
  { id: 'edit_events', name: 'Edit Events', description: 'Modify event details and settings', category: 'events' },
  { id: 'delete_events', name: 'Delete Events', description: 'Delete events', category: 'events' },
  { id: 'publish_events', name: 'Publish Events', description: 'Publish and unpublish events', category: 'events' },
  
  // Financial Permissions
  { id: 'view_financial', name: 'View Financial Data', description: 'View revenue and financial reports', category: 'financial' },
  { id: 'manage_pricing', name: 'Manage Pricing', description: 'Set and modify ticket prices', category: 'financial' },
  { id: 'process_refunds', name: 'Process Refunds', description: 'Handle refund requests', category: 'financial' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access financial analytics and reports', category: 'financial' },
  
  // Attendee Management Permissions
  { id: 'view_attendees', name: 'View Attendees', description: 'View attendee lists and information', category: 'attendees' },
  { id: 'manage_checkin', name: 'Manage Check-in', description: 'Handle event check-in process', category: 'attendees' },
  { id: 'export_attendees', name: 'Export Attendee Data', description: 'Export attendee information', category: 'attendees' },
  { id: 'send_communications', name: 'Send Communications', description: 'Send emails and notifications to attendees', category: 'attendees' },
  
  // Marketing Permissions
  { id: 'manage_campaigns', name: 'Manage Campaigns', description: 'Create and manage marketing campaigns', category: 'marketing' },
  { id: 'manage_social', name: 'Manage Social Media', description: 'Handle social media promotion', category: 'marketing' },
  { id: 'view_marketing_analytics', name: 'View Marketing Analytics', description: 'Access marketing performance data', category: 'marketing' },
  { id: 'manage_promo_codes', name: 'Manage Promo Codes', description: 'Create and manage promotional codes', category: 'marketing' },
  
  // Settings Permissions
  { id: 'manage_team', name: 'Manage Team', description: 'Add, remove, and manage team members', category: 'settings' },
  { id: 'view_activity_logs', name: 'View Activity Logs', description: 'Access team activity and audit logs', category: 'settings' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'settings' }
];

// Role configurations with permissions
const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'follower',
    name: 'Follower',
    description: 'Basic follower with view-only access',
    permissions: ['view_events'],
    color: '#6B7280',
    icon: '👥'
  },
  {
    role: 'sales_agent',
    name: 'Sales Agent',
    description: 'Can manage sales, pricing, and customer communications',
    permissions: [
      'view_events', 'edit_events', 'manage_pricing', 'view_attendees', 
      'manage_checkin', 'send_communications', 'manage_promo_codes', 'view_financial'
    ],
    color: '#10B981',
    icon: '💼'
  },
  {
    role: 'event_staff',
    name: 'Event Staff',
    description: 'Can manage events and attendees during event operations',
    permissions: [
      'view_events', 'edit_events', 'view_attendees', 'manage_checkin', 
      'send_communications', 'export_attendees'
    ],
    color: '#3B82F6',
    icon: '🎭'
  },
  {
    role: 'marketing_assistant',
    name: 'Marketing Assistant',
    description: 'Can manage marketing campaigns and social media promotion',
    permissions: [
      'view_events', 'manage_campaigns', 'manage_social', 'view_marketing_analytics',
      'manage_promo_codes', 'send_communications'
    ],
    color: '#8B5CF6',
    icon: '📢'
  }
];

// Mock data for development
const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-001',
    userId: 'user-001',
    organizerId: 'org-001',
    email: 'sarah.johnson@email.com',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2eb4a7e?w=400&h=400&fit=crop&crop=face',
    role: 'sales_agent',
    status: 'active',
    joinDate: '2024-10-15T09:00:00Z',
    lastActive: '2024-12-19T14:30:00Z',
    specialties: ['Corporate Events', 'Sales', 'Customer Relations'],
    contactInfo: {
      phone: '+1-555-0123',
      timezone: 'America/New_York',
      availability: 'full_time'
    },
    performance: {
      eventsManaged: 8,
      totalSales: 25000,
      averageRating: 4.8,
      completedTasks: 45
    },
    notes: 'Excellent sales performance and customer relationships. Specializes in corporate events.'
  },
  {
    id: 'tm-002',
    userId: 'user-002',
    organizerId: 'org-001',
    email: 'mike.chen@email.com',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    role: 'event_staff',
    status: 'active',
    joinDate: '2024-11-02T10:15:00Z',
    lastActive: '2024-12-19T16:45:00Z',
    specialties: ['Event Operations', 'Check-in Management', 'Technical Support'],
    contactInfo: {
      phone: '+1-555-0124',
      timezone: 'America/Los_Angeles',
      availability: 'part_time'
    },
    performance: {
      eventsManaged: 12,
      totalSales: 0,
      averageRating: 4.6,
      completedTasks: 38
    },
    notes: 'Reliable event staff with strong technical skills. Great at managing check-in operations.'
  },
  {
    id: 'tm-003',
    userId: 'user-003',
    organizerId: 'org-001',
    email: 'emma.martinez@email.com',
    name: 'Emma Martinez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    role: 'marketing_assistant',
    status: 'active',
    joinDate: '2024-09-20T11:30:00Z',
    lastActive: '2024-12-19T13:15:00Z',
    specialties: ['Social Media', 'Content Creation', 'Email Marketing'],
    contactInfo: {
      phone: '+1-555-0125',
      timezone: 'America/Chicago',
      availability: 'weekend_only'
    },
    performance: {
      eventsManaged: 0,
      totalSales: 8500,
      averageRating: 4.9,
      completedTasks: 52
    },
    notes: 'Creative marketing specialist with excellent social media engagement rates.'
  },
  {
    id: 'tm-004',
    userId: 'user-004',
    organizerId: 'org-001',
    email: 'david.kim@email.com',
    name: 'David Kim',
    role: 'follower',
    status: 'active',
    joinDate: '2024-12-10T08:45:00Z',
    lastActive: '2024-12-18T20:30:00Z',
    specialties: ['Photography', 'Event Documentation'],
    contactInfo: {
      timezone: 'America/Denver',
      availability: 'event_only'
    },
    performance: {
      eventsManaged: 0,
      totalSales: 0,
      averageRating: 0,
      completedTasks: 3
    },
    notes: 'New follower interested in event photography opportunities.'
  }
];

const mockInvitations: TeamInvitation[] = [
  {
    id: 'inv-001',
    organizerId: 'org-001',
    email: 'alex.thompson@email.com',
    role: 'sales_agent',
    status: 'pending',
    invitedBy: 'org-001',
    invitedAt: '2024-12-18T10:00:00Z',
    expiresAt: '2024-12-25T10:00:00Z',
    message: 'Join our team as a Sales Agent for upcoming dance events.',
    token: 'inv-token-001'
  },
  {
    id: 'inv-002',
    organizerId: 'org-001',
    email: 'lisa.brown@email.com',
    role: 'marketing_assistant',
    status: 'pending',
    invitedBy: 'org-001',
    invitedAt: '2024-12-17T14:30:00Z',
    expiresAt: '2024-12-24T14:30:00Z',
    message: 'Help us with marketing campaigns and social media promotion.',
    token: 'inv-token-002'
  }
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-001',
    userId: 'tm-001',
    organizerId: 'org-001',
    action: 'Event Updated',
    details: 'Updated pricing for "Salsa Night Downtown"',
    category: 'event_management',
    timestamp: '2024-12-19T14:30:00Z',
    metadata: { eventId: 'event-001', field: 'pricing' }
  },
  {
    id: 'log-002',
    userId: 'tm-002',
    organizerId: 'org-001',
    action: 'Check-in Processed',
    details: 'Processed 25 attendee check-ins',
    category: 'event_management',
    timestamp: '2024-12-19T16:45:00Z',
    metadata: { eventId: 'event-002', attendeeCount: 25 }
  },
  {
    id: 'log-003',
    userId: 'tm-003',
    organizerId: 'org-001',
    action: 'Campaign Created',
    details: 'Created email campaign "Winter Dance Series"',
    category: 'marketing',
    timestamp: '2024-12-19T13:15:00Z',
    metadata: { campaignId: 'camp-001', type: 'email' }
  }
];

export interface Follower {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  followedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  followerSince: string;
  totalEventsAttended: number;
  totalSpent: number;
  interests: string[];
  location?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  organizerId: string;
  role: TeamRole;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  phoneNumber?: string;
  assignedAt: Date;
  assignedBy: string;
  lastLogin: Date;
  isActive: boolean;
  permissions: Permission[];
  specialties: string[];
  availability: AvailabilityStatus;
  performance: TeamMemberPerformance;
  notes?: string;
}

export interface TeamInvitation {
  id: string;
  organizerId: string;
  inviteeEmail: string;
  inviteeName?: string;
  role: TeamRole;
  invitedAt: Date;
  expiresAt: Date;
  status: InvitationStatus;
  invitationToken: string;
  message?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface TeamMemberActivity {
  id: string;
  teamMemberId: string;
  action: string;
  description: string;
  timestamp: Date;
  eventId?: string;
  eventName?: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'warning';
  metadata?: Record<string, any>;
}

export interface TeamMemberPerformance {
  eventsManaged: number;
  ticketsSold: number;
  revenue: number;
  customerRating: number;
  tasksCompleted: number;
  responseTimes: {
    average: number;
    fastest: number;
    slowest: number;
  };
  efficiency: number;
  reliability: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  level: PermissionLevel;
}

export type TeamRole = 'sales_agent' | 'event_staff' | 'marketing_assistant' | 'admin';

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline';

export type PermissionCategory = 'events' | 'financial' | 'attendees' | 'marketing' | 'team' | 'analytics';

export type PermissionLevel = 'read' | 'write' | 'admin';

export interface TeamAnalytics {
  totalTeamMembers: number;
  activeMembers: number;
  roleDistribution: Record<TeamRole, number>;
  avgPerformanceScore: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalEventsManaged: number;
  topPerformers: TeamMember[];
  recentActivity: TeamMemberActivity[];
  growthMetrics: {
    newMembersThisMonth: number;
    performanceImprovement: number;
    retentionRate: number;
  };
}

export interface BulkRoleUpdate {
  memberIds: string[];
  newRole: TeamRole;
  reason?: string;
}

export interface RoleChangeAudit {
  id: string;
  teamMemberId: string;
  previousRole: TeamRole;
  newRole: TeamRole;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

class FollowerService {
  private followers: Follower[] = [];
  private teamMembers: TeamMember[] = [];
  private invitations: TeamInvitation[] = [];
  private activities: TeamMemberActivity[] = [];
  private roleAudits: RoleChangeAudit[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock followers
    this.followers = [
      {
        id: 'follower-1',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@email.com',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
        followedAt: new Date('2024-01-15'),
        lastActivity: new Date('2024-12-18'),
        isActive: true,
        followerSince: '11 months',
        totalEventsAttended: 8,
        totalSpent: 450,
        interests: ['Yoga', 'Meditation', 'Wellness'],
        location: 'San Francisco, CA'
      },
      {
        id: 'follower-2',
        userId: 'user-2',
        userName: 'Mike Chen',
        userEmail: 'mike.chen@email.com',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        followedAt: new Date('2024-03-20'),
        lastActivity: new Date('2024-12-17'),
        isActive: true,
        followerSince: '9 months',
        totalEventsAttended: 12,
        totalSpent: 680,
        interests: ['Fitness', 'Dance', 'Workshops'],
        location: 'Los Angeles, CA'
      },
      {
        id: 'follower-3',
        userId: 'user-3',
        userName: 'Emma Wilson',
        userEmail: 'emma.wilson@email.com',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        followedAt: new Date('2024-06-10'),
        lastActivity: new Date('2024-12-19'),
        isActive: true,
        followerSince: '6 months',
        totalEventsAttended: 5,
        totalSpent: 325,
        interests: ['Arts', 'Culture', 'Music'],
        location: 'New York, NY'
      },
      {
        id: 'follower-4',
        userId: 'user-4',
        userName: 'David Rodriguez',
        userEmail: 'david.rodriguez@email.com',
        followedAt: new Date('2024-02-28'),
        lastActivity: new Date('2024-11-30'),
        isActive: false,
        followerSince: '10 months',
        totalEventsAttended: 3,
        totalSpent: 180,
        interests: ['Sports', 'Outdoor'],
        location: 'Austin, TX'
      }
    ];

    // Mock team members
    this.teamMembers = [
      {
        id: 'team-1',
        userId: 'user-5',
        organizerId: 'org-1',
        role: 'sales_agent',
        userName: 'Alex Thompson',
        userEmail: 'alex.thompson@email.com',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phoneNumber: '+1-555-0123',
        assignedAt: new Date('2024-09-15'),
        assignedBy: 'org-1',
        lastLogin: new Date('2024-12-19'),
        isActive: true,
        permissions: this.getPermissionsForRole('sales_agent'),
        specialties: ['Customer Relations', 'Sales Strategy', 'Event Promotion'],
        availability: 'available',
        performance: {
          eventsManaged: 15,
          ticketsSold: 450,
          revenue: 22500,
          customerRating: 4.8,
          tasksCompleted: 89,
          responseTimes: { average: 15, fastest: 5, slowest: 45 },
          efficiency: 92,
          reliability: 95
        },
        notes: 'Top performer with excellent customer feedback'
      },
      {
        id: 'team-2',
        userId: 'user-6',
        organizerId: 'org-1',
        role: 'event_staff',
        userName: 'Maria Garcia',
        userEmail: 'maria.garcia@email.com',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        phoneNumber: '+1-555-0124',
        assignedAt: new Date('2024-10-01'),
        assignedBy: 'org-1',
        lastLogin: new Date('2024-12-18'),
        isActive: true,
        permissions: this.getPermissionsForRole('event_staff'),
        specialties: ['Event Coordination', 'Check-in Management', 'Customer Service'],
        availability: 'available',
        performance: {
          eventsManaged: 8,
          ticketsSold: 0,
          revenue: 0,
          customerRating: 4.9,
          tasksCompleted: 67,
          responseTimes: { average: 12, fastest: 3, slowest: 30 },
          efficiency: 88,
          reliability: 98
        },
        notes: 'Excellent at event day operations'
      },
      {
        id: 'team-3',
        userId: 'user-7',
        organizerId: 'org-1',
        role: 'marketing_assistant',
        userName: 'Jordan Kim',
        userEmail: 'jordan.kim@email.com',
        phoneNumber: '+1-555-0125',
        assignedAt: new Date('2024-11-10'),
        assignedBy: 'org-1',
        lastLogin: new Date('2024-12-17'),
        isActive: true,
        permissions: this.getPermissionsForRole('marketing_assistant'),
        specialties: ['Social Media', 'Content Creation', 'Email Marketing'],
        availability: 'busy',
        performance: {
          eventsManaged: 3,
          ticketsSold: 0,
          revenue: 0,
          customerRating: 4.6,
          tasksCompleted: 34,
          responseTimes: { average: 20, fastest: 8, slowest: 60 },
          efficiency: 85,
          reliability: 91
        },
        notes: 'Creative marketing approach, growing into role'
      }
    ];

    // Mock invitations
    this.invitations = [
      {
        id: 'inv-1',
        organizerId: 'org-1',
        inviteeEmail: 'new.member@email.com',
        inviteeName: 'Robert Davis',
        role: 'sales_agent',
        invitedAt: new Date('2024-12-15'),
        expiresAt: new Date('2024-12-29'),
        status: 'pending',
        invitationToken: 'token-123',
        message: 'Join our team as a Sales Agent!'
      },
      {
        id: 'inv-2',
        organizerId: 'org-1',
        inviteeEmail: 'lisa.brown@email.com',
        role: 'event_staff',
        invitedAt: new Date('2024-12-10'),
        expiresAt: new Date('2024-12-24'),
        status: 'accepted',
        invitationToken: 'token-124',
        acceptedAt: new Date('2024-12-12'),
        message: 'We\'d love to have you on our event staff team!'
      }
    ];

    // Mock activities
    this.activities = [
      {
        id: 'activity-1',
        teamMemberId: 'team-1',
        action: 'ticket_sale',
        description: 'Sold 5 tickets for Yoga Workshop',
        timestamp: new Date('2024-12-19T10:30:00'),
        eventId: 'event-1',
        eventName: 'Morning Yoga Workshop',
        ipAddress: '192.168.1.100',
        userAgent: 'Mobile Safari',
        result: 'success',
        metadata: { ticketCount: 5, revenue: 250 }
      },
      {
        id: 'activity-2',
        teamMemberId: 'team-2',
        action: 'event_checkin',
        description: 'Processed check-ins for evening event',
        timestamp: new Date('2024-12-18T18:45:00'),
        eventId: 'event-2',
        eventName: 'Dance Workshop',
        ipAddress: '192.168.1.101',
        userAgent: 'Chrome Mobile',
        result: 'success',
        metadata: { checkinsProcessed: 45 }
      }
    ];
  }

  private getPermissionsForRole(role: TeamRole): Permission[] {
    const allPermissions: Permission[] = [
      { id: 'perm-1', name: 'View Events', description: 'View event details', category: 'events', level: 'read' },
      { id: 'perm-2', name: 'Edit Events', description: 'Edit event details', category: 'events', level: 'write' },
      { id: 'perm-3', name: 'Manage Events', description: 'Full event management', category: 'events', level: 'admin' },
      { id: 'perm-4', name: 'View Financial', description: 'View financial data', category: 'financial', level: 'read' },
      { id: 'perm-5', name: 'Manage Financial', description: 'Manage financial data', category: 'financial', level: 'admin' },
      { id: 'perm-6', name: 'View Attendees', description: 'View attendee information', category: 'attendees', level: 'read' },
      { id: 'perm-7', name: 'Manage Attendees', description: 'Manage attendee information', category: 'attendees', level: 'write' },
      { id: 'perm-8', name: 'View Marketing', description: 'View marketing campaigns', category: 'marketing', level: 'read' },
      { id: 'perm-9', name: 'Manage Marketing', description: 'Manage marketing campaigns', category: 'marketing', level: 'write' },
      { id: 'perm-10', name: 'View Team', description: 'View team members', category: 'team', level: 'read' },
      { id: 'perm-11', name: 'Manage Team', description: 'Manage team members', category: 'team', level: 'admin' },
      { id: 'perm-12', name: 'View Analytics', description: 'View analytics data', category: 'analytics', level: 'read' }
    ];

    switch (role) {
      case 'admin':
        return allPermissions;
      case 'sales_agent':
        return allPermissions.filter(p => 
          ['perm-1', 'perm-6', 'perm-7', 'perm-8', 'perm-12'].includes(p.id)
        );
      case 'event_staff':
        return allPermissions.filter(p => 
          ['perm-1', 'perm-6', 'perm-7', 'perm-10', 'perm-12'].includes(p.id)
        );
      case 'marketing_assistant':
        return allPermissions.filter(p => 
          ['perm-1', 'perm-6', 'perm-8', 'perm-9', 'perm-12'].includes(p.id)
        );
      default:
        return [];
    }
  }

  // Follower Management
  async getFollowers(organizerId: string): Promise<Follower[]> {
    await this.simulateApiDelay();
    return this.followers.filter(f => f.isActive);
  }

  async getFollowerById(followerId: string): Promise<Follower | null> {
    await this.simulateApiDelay();
    return this.followers.find(f => f.id === followerId) || null;
  }

  // Team Member Management
  async getTeamMembers(organizerId: string): Promise<TeamMember[]> {
    await this.simulateApiDelay();
    return this.teamMembers.filter(tm => tm.organizerId === organizerId);
  }

  async getTeamMemberById(memberId: string): Promise<TeamMember | null> {
    await this.simulateApiDelay();
    return this.teamMembers.find(tm => tm.id === memberId) || null;
  }

  async assignRole(followerId: string, role: TeamRole, organizerId: string, assignedBy: string): Promise<TeamMember> {
    await this.simulateApiDelay();
    
    const follower = this.followers.find(f => f.id === followerId);
    if (!follower) {
      throw new Error('Follower not found');
    }

    const newTeamMember: TeamMember = {
      id: `team-${Date.now()}`,
      userId: follower.userId,
      organizerId,
      role,
      userName: follower.userName,
      userEmail: follower.userEmail,
      userAvatar: follower.userAvatar,
      assignedAt: new Date(),
      assignedBy,
      lastLogin: new Date(),
      isActive: true,
      permissions: this.getPermissionsForRole(role),
      specialties: [],
      availability: 'available',
      performance: {
        eventsManaged: 0,
        ticketsSold: 0,
        revenue: 0,
        customerRating: 0,
        tasksCompleted: 0,
        responseTimes: { average: 0, fastest: 0, slowest: 0 },
        efficiency: 0,
        reliability: 0
      }
    };

    this.teamMembers.push(newTeamMember);
    
    // Add audit record
    this.roleAudits.push({
      id: `audit-${Date.now()}`,
      teamMemberId: newTeamMember.id,
      previousRole: 'sales_agent', // Default previous role
      newRole: role,
      changedBy: assignedBy,
      changedAt: new Date(),
      reason: 'Initial role assignment'
    });

    return newTeamMember;
  }

  async updateTeamMemberRole(memberId: string, newRole: TeamRole, changedBy: string, reason?: string): Promise<TeamMember> {
    await this.simulateApiDelay();
    
    const member = this.teamMembers.find(tm => tm.id === memberId);
    if (!member) {
      throw new Error('Team member not found');
    }

    const previousRole = member.role;
    member.role = newRole;
    member.permissions = this.getPermissionsForRole(newRole);

    // Add audit record
    this.roleAudits.push({
      id: `audit-${Date.now()}`,
      teamMemberId: memberId,
      previousRole,
      newRole,
      changedBy,
      changedAt: new Date(),
      reason
    });

    return member;
  }

  async bulkUpdateRoles(updates: BulkRoleUpdate[], changedBy: string): Promise<TeamMember[]> {
    await this.simulateApiDelay();
    
    const updatedMembers: TeamMember[] = [];
    
    for (const update of updates) {
      for (const memberId of update.memberIds) {
        try {
          const updatedMember = await this.updateTeamMemberRole(
            memberId, 
            update.newRole, 
            changedBy, 
            update.reason
          );
          updatedMembers.push(updatedMember);
        } catch (error) {
          console.warn(`Failed to update role for member ${memberId}:`, error);
        }
      }
    }
    
    return updatedMembers;
  }

  async removeTeamMember(memberId: string, removedBy: string, reason?: string): Promise<void> {
    await this.simulateApiDelay();
    
    const memberIndex = this.teamMembers.findIndex(tm => tm.id === memberId);
    if (memberIndex === -1) {
      throw new Error('Team member not found');
    }

    const member = this.teamMembers[memberIndex];
    member.isActive = false;

    // Add audit record
    this.roleAudits.push({
      id: `audit-${Date.now()}`,
      teamMemberId: memberId,
      previousRole: member.role,
      newRole: 'sales_agent', // Default role after removal
      changedBy: removedBy,
      changedAt: new Date(),
      reason: reason || 'Team member removed'
    });
  }

  // Team Invitations
  async getInvitations(organizerId: string): Promise<TeamInvitation[]> {
    await this.simulateApiDelay();
    return this.invitations.filter(inv => inv.organizerId === organizerId);
  }

  async sendInvitation(
    organizerId: string, 
    inviteeEmail: string, 
    role: TeamRole, 
    message?: string,
    inviteeName?: string
  ): Promise<TeamInvitation> {
    await this.simulateApiDelay();
    
    const invitation: TeamInvitation = {
      id: `inv-${Date.now()}`,
      organizerId,
      inviteeEmail,
      inviteeName,
      role,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'pending',
      invitationToken: `token-${Date.now()}`,
      message
    };

    this.invitations.push(invitation);
    return invitation;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await this.simulateApiDelay();
    
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      invitation.status = 'cancelled';
    }
  }

  async resendInvitation(invitationId: string): Promise<TeamInvitation> {
    await this.simulateApiDelay();
    
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    invitation.invitedAt = new Date();
    invitation.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    invitation.status = 'pending';
    invitation.invitationToken = `token-${Date.now()}`;

    return invitation;
  }

  // Activity Tracking
  async getTeamMemberActivities(memberId: string, limit: number = 50): Promise<TeamMemberActivity[]> {
    await this.simulateApiDelay();
    return this.activities
      .filter(activity => activity.teamMemberId === memberId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getTeamActivities(organizerId: string, limit: number = 100): Promise<TeamMemberActivity[]> {
    await this.simulateApiDelay();
    const teamMemberIds = this.teamMembers
      .filter(tm => tm.organizerId === organizerId)
      .map(tm => tm.id);
    
    return this.activities
      .filter(activity => teamMemberIds.includes(activity.teamMemberId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async logActivity(activity: Omit<TeamMemberActivity, 'id' | 'timestamp'>): Promise<TeamMemberActivity> {
    await this.simulateApiDelay();
    
    const newActivity: TeamMemberActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date()
    };

    this.activities.push(newActivity);
    return newActivity;
  }

  // Analytics
  async getTeamAnalytics(organizerId: string): Promise<TeamAnalytics> {
    await this.simulateApiDelay();
    
    const teamMembers = this.teamMembers.filter(tm => tm.organizerId === organizerId);
    const activeMembers = teamMembers.filter(tm => tm.isActive);
    
    const roleDistribution = teamMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<TeamRole, number>);

    const totalRevenue = activeMembers.reduce((sum, member) => sum + member.performance.revenue, 0);
    const totalTicketsSold = activeMembers.reduce((sum, member) => sum + member.performance.ticketsSold, 0);
    const totalEventsManaged = activeMembers.reduce((sum, member) => sum + member.performance.eventsManaged, 0);
    
    const avgPerformanceScore = activeMembers.length > 0 
      ? activeMembers.reduce((sum, member) => sum + member.performance.efficiency, 0) / activeMembers.length 
      : 0;

    const topPerformers = activeMembers
      .sort((a, b) => b.performance.efficiency - a.performance.efficiency)
      .slice(0, 5);

    const recentActivity = await this.getTeamActivities(organizerId, 10);

    return {
      totalTeamMembers: teamMembers.length,
      activeMembers: activeMembers.length,
      roleDistribution,
      avgPerformanceScore,
      totalRevenue,
      totalTicketsSold,
      totalEventsManaged,
      topPerformers,
      recentActivity,
      growthMetrics: {
        newMembersThisMonth: 2,
        performanceImprovement: 15,
        retentionRate: 94
      }
    };
  }

  async getRoleChangeAudit(organizerId: string): Promise<RoleChangeAudit[]> {
    await this.simulateApiDelay();
    
    const teamMemberIds = this.teamMembers
      .filter(tm => tm.organizerId === organizerId)
      .map(tm => tm.id);
    
    return this.roleAudits
      .filter(audit => teamMemberIds.includes(audit.teamMemberId))
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }

  // Utility methods
  private async simulateApiDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  }

  hasPermission(teamMember: TeamMember, permissionId: string): boolean {
    return teamMember.permissions.some(p => p.id === permissionId);
  }

  getAvailableRoles(): { value: TeamRole; label: string; description: string }[] {
    return [
      {
        value: 'sales_agent',
        label: 'Sales Agent',
        description: 'Can sell tickets and manage customer relationships'
      },
      {
        value: 'event_staff',
        label: 'Event Staff',
        description: 'Can manage event operations and check-in attendees'
      },
      {
        value: 'marketing_assistant',
        label: 'Marketing Assistant',
        description: 'Can create and manage marketing campaigns'
      },
      {
        value: 'admin',
        label: 'Admin',
        description: 'Full access to all organizer features'
      }
    ];
  }
}

export const followerService = new FollowerService();
export { PERMISSIONS, ROLE_CONFIGS };
export type { 
  Follower,
  TeamMember, 
  TeamInvitation, 
  TeamMemberActivity, 
  TeamAnalytics, 
  TeamRole,
  BulkRoleUpdate,
  RoleChangeAudit,
  Permission,
  AvailabilityStatus,
  InvitationStatus,
  TeamMemberPerformance,
  PermissionCategory,
  PermissionLevel
}; 