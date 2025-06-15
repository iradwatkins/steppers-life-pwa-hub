// User Dashboard Service
// Handles user roles, dashboard content, role activation, and onboarding

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: boolean;
  activatedAt?: string;
  requirements?: string[];
  benefits: string[];
  permissions: string[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'recent_activity' | 'quick_actions' | 'recommendations' | 'progress';
  roleRestriction?: string[];
  data: any;
  priority: number;
  isVisible: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    type: 'link' | 'modal' | 'tour';
    target: string;
    label: string;
  };
}

export interface UserProgress {
  profileCompletion: number;
  rolesActivated: number;
  totalSteps: number;
  completedSteps: number;
  nextSteps: OnboardingStep[];
}

export interface ContentCreationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  roleRequired: string;
  route: string;
  comingSoon?: boolean;
  featured?: boolean;
}

// Map auth roles to dashboard roles
const roleMappings: Record<string, UserRole> = {
  'buyer': {
    id: 'buyer',
    name: 'buyer',
    displayName: 'Community Member',
    description: 'Basic community member who attends events and classes',
    icon: 'Users',
    isActive: true,
    activatedAt: '2024-01-01T00:00:00Z',
    benefits: ['Browse events', 'Purchase tickets', 'Join community discussions', 'Rate and review events'],
    permissions: ['view_events', 'purchase_tickets', 'write_reviews']
  },
  'organizer': {
    id: 'organizer',
    name: 'organizer', 
    displayName: 'Event Organizer',
    description: 'Create and manage events, track sales and analytics',
    icon: 'Calendar',
    isActive: true,
    requirements: ['Create your first event'],
    benefits: ['Create unlimited events', 'Access sales analytics', 'Manage attendees', 'Email marketing tools'],
    permissions: ['create_events', 'manage_events', 'view_analytics', 'send_campaigns']
  },
  'instructor': {
    id: 'instructor',
    name: 'instructor',
    displayName: 'Dance Instructor', 
    description: 'Teach classes and workshops, build your following',
    icon: 'GraduationCap',
    isActive: true,
    requirements: ['List your first class or workshop'],
    benefits: ['Create class listings', 'Build instructor profile', 'Manage students', 'Offer VOD classes'],
    permissions: ['create_classes', 'manage_students', 'create_vod', 'instructor_analytics']
  },
  'admin': {
    id: 'admin',
    name: 'admin',
    displayName: 'Platform Administrator',
    description: 'Full platform access and management capabilities',
    icon: 'Shield',
    isActive: true,
    activatedAt: '2024-01-01T00:00:00Z',
    benefits: ['Full platform access', 'User management', 'System configuration', 'Analytics dashboard'],
    permissions: ['admin_dashboard', 'manage_users', 'system_config', 'full_analytics']
  },
  'event_staff': {
    id: 'event_staff',
    name: 'event_staff',
    displayName: 'Event Staff',
    description: 'Help organize and manage events',
    icon: 'Briefcase',
    isActive: true,
    requirements: ['Be assigned to an event'],
    benefits: ['Event management tools', 'Check-in capabilities', 'Attendee management'],
    permissions: ['manage_checkins', 'view_attendees', 'event_support']
  },
  'sales_agent': {
    id: 'sales_agent',
    name: 'sales_agent',
    displayName: 'Sales Agent',
    description: 'Help promote and sell event tickets',
    icon: 'Store',
    isActive: true,
    requirements: ['Be approved as sales agent'],
    benefits: ['Sales tracking', 'Commission reports', 'Promotional tools'],
    permissions: ['track_sales', 'view_commissions', 'promotional_access']
  }
};

// Get all available roles
const getAllRoles = (): UserRole[] => {
  return Object.values(roleMappings);
};

// Content creation options for all roles
const allContentOptions: ContentCreationOption[] = [
  {
    id: 'admin_dashboard',
    title: 'Admin Dashboard',
    description: 'Access platform administration and management tools',
    icon: 'Shield',
    roleRequired: 'admin',
    route: '/admin',
    featured: true
  },
  {
    id: 'create_event',
    title: 'Post an Event',
    description: 'Create a stepping event, social, or competition',
    icon: 'Calendar',
    roleRequired: 'organizer',
    route: '/organizer/events/create',
    featured: true
  },
  {
    id: 'instructor_dashboard',
    title: 'Instructor Dashboard',
    description: 'Manage your classes and students',
    icon: 'GraduationCap',
    roleRequired: 'instructor',
    route: '/instructor/dashboard',
    featured: true
  },
  {
    id: 'sales_agent_dashboard',
    title: 'Sales Dashboard',
    description: 'Track your sales and commissions',
    icon: 'Store',
    roleRequired: 'sales_agent',
    route: '/agent/dashboard',
    featured: true
  },
  {
    id: 'create_class',
    title: 'List a Physical Class',
    description: 'Offer in-person dance classes and workshops', 
    icon: 'GraduationCap',
    roleRequired: 'instructor',
    route: '/instructor/classes/create',
    comingSoon: true
  },
  {
    id: 'create_vod',
    title: 'Offer a VOD Class',
    description: 'Create video-on-demand dance instruction',
    icon: 'Video',
    roleRequired: 'instructor', 
    route: '/instructor/vod/create',
    comingSoon: true
  },
  {
    id: 'list_store',
    title: 'Submit Your Store', 
    description: 'Add your store to the community directory',
    icon: 'Store',
    roleRequired: 'buyer',
    route: '/stores/submit',
    featured: true
  }
];

class UserDashboardService {
  // Get user roles and their activation status
  async getUserRoles(userId: string): Promise<UserRole[]> {
    // Import supabase and auth hooks dynamically to avoid circular imports
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      // Get user's roles from database
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        // Fallback to buyer role
        return [roleMappings['buyer']];
      }

      // Convert database roles to dashboard roles
      const dashboardRoles: UserRole[] = [];
      
      if (userRoles && userRoles.length > 0) {
        userRoles.forEach(userRole => {
          const mappedRole = roleMappings[userRole.role];
          if (mappedRole) {
            dashboardRoles.push(mappedRole);
          }
        });
      } else {
        // No roles found, default to buyer
        dashboardRoles.push(roleMappings['buyer']);
      }

      // Always show all available roles for discovery, but mark active/inactive
      const allRoles = getAllRoles().map(role => ({
        ...role,
        isActive: dashboardRoles.some(dr => dr.id === role.id)
      }));

      return allRoles;
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      // Fallback to all roles with buyer active
      return getAllRoles().map(role => ({
        ...role,
        isActive: role.id === 'buyer'
      }));
    }
  }

  // Activate a new role for the user
  async activateRole(userId: string, roleId: string): Promise<UserRole> {
    const role = roleMappings[roleId];
    if (!role) {
      throw new Error('Role not found');
    }

    try {
      // Import supabase dynamically
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      // Add role to database
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          profile_id: profile.id,
          role: roleId,
          is_primary: false, // Don't override primary role
          granted_by: userId
        });

      if (insertError) {
        throw new Error('Failed to activate role');
      }

      // Mark role as active and return
      const activatedRole = {
        ...role,
        isActive: true,
        activatedAt: new Date().toISOString()
      };

      return activatedRole;
    } catch (error) {
      console.error('Error activating role:', error);
      throw error;
    }
  }

  // Get content creation options based on user roles
  async getContentCreationOptions(userRoles: string[]): Promise<ContentCreationOption[]> {
    // Filter options based on user's active roles
    const availableOptions = allContentOptions.filter(option => 
      userRoles.includes(option.roleRequired) || option.roleRequired === 'buyer'
    );

    return Promise.resolve(availableOptions);
  }

  // Get all content creation options (for discovery)
  async getAllContentCreationOptions(): Promise<ContentCreationOption[]> {
    return Promise.resolve(allContentOptions);
  }

  // Get dashboard widgets based on user roles
  async getDashboardWidgets(userId: string, userRoles: string[]): Promise<DashboardWidget[]> {
    const widgets: DashboardWidget[] = [
      {
        id: 'welcome',
        title: 'Welcome to SteppersLife',
        type: 'recommendations',
        data: {
          message: 'Start your journey by exploring events, classes, and connecting with the community.',
          suggestions: [
            { title: 'Complete your profile', route: '/account/profile', icon: 'User' },
            { title: 'Browse upcoming events', route: '/events', icon: 'Calendar' },
            { title: 'Find dance classes', route: '/classes', icon: 'GraduationCap' },
            { title: 'Join community discussions', route: '/community', icon: 'MessageCircle' }
          ]
        },
        priority: 1,
        isVisible: true
      },
      {
        id: 'recent_activity',
        title: 'Recent Activity',
        type: 'recent_activity',
        data: {
          activities: [
            { type: 'ticket_purchase', event: 'Chicago Steppers Social', date: '2024-01-15', icon: 'Ticket' },
            { type: 'class_enrollment', class: 'Beginner Workshop', date: '2024-01-10', icon: 'GraduationCap' },
            { type: 'review_posted', event: 'Advanced Techniques', rating: 5, date: '2024-01-08', icon: 'Star' }
          ]
        },
        priority: 2,
        isVisible: true
      },
      {
        id: 'upcoming_events',
        title: 'Your Upcoming Events',
        type: 'stats',
        data: {
          count: 3,
          items: [
            { title: 'Chicago Steppers Social', date: '2024-02-15', time: '8:00 PM', location: 'Chicago Cultural Center' },
            { title: 'Beginner Workshop', date: '2024-02-18', time: '2:00 PM', location: 'Dance Studio Downtown' },
            { title: 'Advanced Masterclass', date: '2024-02-22', time: '7:30 PM', location: 'Community Center' }
          ]
        },
        priority: 3,
        isVisible: true
      }
    ];

    // Add role-specific widgets
    if (userRoles.includes('admin')) {
      widgets.push({
        id: 'admin_stats',
        title: 'Platform Overview',
        type: 'stats',
        roleRestriction: ['admin'],
        data: {
          total_users: 1247,
          active_events: 34,
          total_revenue: 156789,
          pending_approvals: 8
        },
        priority: 1,
        isVisible: true
      });
    }

    if (userRoles.includes('organizer')) {
      widgets.push({
        id: 'organizer_stats',
        title: 'Your Events',
        type: 'stats',
        roleRestriction: ['organizer'],
        data: {
          total_events: 5,
          active_events: 2,
          total_revenue: 2500,
          total_attendees: 180
        },
        priority: 1,
        isVisible: true
      });
    }

    if (userRoles.includes('instructor')) {
      widgets.push({
        id: 'instructor_stats',
        title: 'Your Classes',
        type: 'stats', 
        roleRestriction: ['instructor'],
        data: {
          total_classes: 8,
          active_classes: 3,
          total_students: 45,
          average_rating: 4.8
        },
        priority: 1,
        isVisible: true
      });
    }

    if (userRoles.includes('sales_agent')) {
      widgets.push({
        id: 'sales_agent_stats',
        title: 'Your Sales',
        type: 'stats', 
        roleRestriction: ['sales_agent'],
        data: {
          tickets_sold: 45,
          total_commission: 890,
          active_campaigns: 3,
          conversion_rate: 12.5
        },
        priority: 1,
        isVisible: true
      });
    }

    return Promise.resolve(widgets);
  }

  // Get user onboarding progress
  async getUserProgress(userId: string): Promise<UserProgress> {
    const mockProgress: UserProgress = {
      profileCompletion: 75,
      rolesActivated: 1,
      totalSteps: 8,
      completedSteps: 6,
      nextSteps: [
        {
          id: 'complete_profile',
          title: 'Complete Your Profile',
          description: 'Add a profile photo and bio to connect with the community',
          completed: false,
          action: {
            type: 'link',
            target: '/account/profile',
            label: 'Update Profile'
          }
        },
        {
          id: 'join_first_event',
          title: 'Attend Your First Event',
          description: 'Purchase tickets to a stepping event and join the community',
          completed: false,
          action: {
            type: 'link',
            target: '/events',
            label: 'Browse Events'
          }
        }
      ]
    };

    return Promise.resolve(mockProgress);
  }

  // Get role activation suggestions
  async getRoleActivationSuggestions(userId: string, currentRoles: string[]): Promise<UserRole[]> {
    // Return roles that haven't been activated yet (exclude admin and event_staff as they need special approval)
    const allRoles = getAllRoles();
    const inactiveRoles = allRoles.filter(role => 
      !currentRoles.includes(role.id) && 
      role.id !== 'buyer' && 
      role.id !== 'admin' && 
      role.id !== 'event_staff'
    );

    return Promise.resolve(inactiveRoles);
  }

  // Update dashboard widget visibility
  async updateWidgetVisibility(userId: string, widgetId: string, isVisible: boolean): Promise<void> {
    // In real implementation, save to user preferences
    return Promise.resolve();
  }

  // Get community recommendations
  async getCommunityRecommendations(userId: string): Promise<any[]> {
    const recommendations = [
      {
        type: 'event',
        title: 'Chicago Steppers Social',
        description: 'Perfect for meeting other steppers in your area',
        image: '/placeholder.svg',
        route: '/event/chicago-steppers-social',
        reason: 'Popular in your area'
      },
      {
        type: 'instructor',
        title: 'Angela Davis',
        description: 'Master instructor with 15+ years experience',
        image: '/placeholder.svg',
        route: '/instructor/angela-davis',
        reason: 'Highly rated instructor'
      },
      {
        type: 'class',
        title: 'Beginner Workshop',
        description: 'Perfect for learning the fundamentals',
        image: '/placeholder.svg',
        route: '/class/beginner-workshop',
        reason: 'Matches your skill level'
      }
    ];

    return Promise.resolve(recommendations);
  }
}

export const userDashboardService = new UserDashboardService(); 