import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type EmailSegment = Database['public']['Tables']['email_segments']['Row'];
export type EmailSegmentInsert = Database['public']['Tables']['email_segments']['Insert'];
export type EmailSegmentUpdate = Database['public']['Tables']['email_segments']['Update'];

export interface SegmentCriteria {
  // User demographics
  age_range?: { min?: number; max?: number };
  location?: {
    cities?: string[];
    states?: string[];
    radius_miles?: number;
    center_lat?: number;
    center_lng?: number;
  };
  
  // Behavioral criteria
  events_attended?: {
    min_count?: number;
    event_types?: string[];
    date_range?: { start: string; end: string };
  };
  
  // Purchase behavior
  ticket_purchases?: {
    min_spent?: number;
    max_spent?: number;
    purchase_date_range?: { start: string; end: string };
    event_categories?: string[];
  };
  
  // Engagement criteria
  last_login?: {
    days_ago?: number;
    comparison?: 'less_than' | 'greater_than';
  };
  
  // Preferences
  preferred_event_types?: string[];
  notification_preferences?: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    push_enabled?: boolean;
  };
  
  // Custom fields
  custom_fields?: Record<string, any>;
}

export interface CreateSegmentData {
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  is_dynamic?: boolean;
}

export interface SegmentWithStats extends EmailSegment {
  stats: {
    total_users: number;
    active_users: number;
    avg_age: number;
    top_locations: Array<{ city: string; state: string; count: number }>;
    avg_events_attended: number;
    avg_lifetime_value: number;
  };
}

export class EmailSegmentService {
  // Create a new segment
  static async createSegment(
    organizerId: string,
    segmentData: CreateSegmentData
  ): Promise<EmailSegment | null> {
    try {
      const { data, error } = await supabase
        .from('email_segments')
        .insert({
          organizer_id: organizerId,
          name: segmentData.name,
          description: segmentData.description,
          criteria: segmentData.criteria,
          is_dynamic: segmentData.is_dynamic ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating segment:', error);
      return null;
    }
  }

  // Get segments for an organizer
  static async getOrganizerSegments(organizerId: string): Promise<EmailSegment[]> {
    try {
      const { data, error } = await supabase
        .from('email_segments')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching segments:', error);
      return [];
    }
  }

  // Get segment by ID with statistics
  static async getSegmentWithStats(segmentId: string): Promise<SegmentWithStats | null> {
    try {
      const { data: segment, error: segmentError } = await supabase
        .from('email_segments')
        .select('*')
        .eq('id', segmentId)
        .single();

      if (segmentError) throw segmentError;

      // Calculate segment statistics
      const users = await this.getSegmentUsers(segmentId);
      const stats = await this.calculateSegmentStats(users);

      return {
        ...segment,
        stats
      };
    } catch (error) {
      console.error('Error fetching segment with stats:', error);
      return null;
    }
  }

  // Update segment
  static async updateSegment(
    segmentId: string,
    updates: EmailSegmentUpdate
  ): Promise<EmailSegment | null> {
    try {
      const { data, error } = await supabase
        .from('email_segments')
        .update(updates)
        .eq('id', segmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating segment:', error);
      return null;
    }
  }

  // Delete segment
  static async deleteSegment(segmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_segments')
        .delete()
        .eq('id', segmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting segment:', error);
      return false;
    }
  }

  // Get users in a segment
  static async getSegmentUsers(segmentId: string): Promise<any[]> {
    try {
      const { data: segment, error: segmentError } = await supabase
        .from('email_segments')
        .select('criteria')
        .eq('id', segmentId)
        .single();

      if (segmentError) throw segmentError;

      // Build dynamic query based on criteria
      const users = await this.queryUsersByCriteria(segment.criteria as SegmentCriteria);
      return users;
    } catch (error) {
      console.error('Error fetching segment users:', error);
      return [];
    }
  }

  // Query users by criteria (complex segmentation logic)
  static async queryUsersByCriteria(criteria: SegmentCriteria): Promise<any[]> {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          orders(
            id,
            total_amount,
            created_at,
            events(
              id,
              title,
              category,
              start_date
            )
          )
        `);

      // Apply age filter
      if (criteria.age_range) {
        const currentYear = new Date().getFullYear();
        if (criteria.age_range.min) {
          const maxBirthYear = currentYear - criteria.age_range.min;
          query = query.lte('birth_year', maxBirthYear);
        }
        if (criteria.age_range.max) {
          const minBirthYear = currentYear - criteria.age_range.max;
          query = query.gte('birth_year', minBirthYear);
        }
      }

      // Apply location filter
      if (criteria.location?.cities?.length) {
        query = query.in('city', criteria.location.cities);
      }
      if (criteria.location?.states?.length) {
        query = query.in('state', criteria.location.states);
      }

      // Apply notification preferences filter
      if (criteria.notification_preferences) {
        if (criteria.notification_preferences.email_enabled !== undefined) {
          query = query.eq('email_notifications_enabled', criteria.notification_preferences.email_enabled);
        }
        if (criteria.notification_preferences.sms_enabled !== undefined) {
          query = query.eq('sms_notifications_enabled', criteria.notification_preferences.sms_enabled);
        }
      }

      const { data: users, error } = await query;

      if (error) throw error;

      // Apply complex filters that require post-processing
      let filteredUsers = users || [];

      // Filter by events attended
      if (criteria.events_attended) {
        filteredUsers = filteredUsers.filter(user => {
          const userOrders = (user as any).orders || [];
          const eventCount = userOrders.length;

          if (criteria.events_attended!.min_count && eventCount < criteria.events_attended!.min_count) {
            return false;
          }

          if (criteria.events_attended!.event_types?.length) {
            const userEventTypes = userOrders
              .map((order: any) => order.events?.category)
              .filter(Boolean);
            
            const hasMatchingEventType = criteria.events_attended!.event_types!.some(
              type => userEventTypes.includes(type)
            );
            
            if (!hasMatchingEventType) return false;
          }

          if (criteria.events_attended!.date_range) {
            const { start, end } = criteria.events_attended!.date_range;
            const hasEventInRange = userOrders.some((order: any) => {
              const eventDate = order.events?.start_date;
              return eventDate && eventDate >= start && eventDate <= end;
            });
            
            if (!hasEventInRange) return false;
          }

          return true;
        });
      }

      // Filter by purchase behavior
      if (criteria.ticket_purchases) {
        filteredUsers = filteredUsers.filter(user => {
          const userOrders = (user as any).orders || [];
          const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

          if (criteria.ticket_purchases!.min_spent && totalSpent < criteria.ticket_purchases!.min_spent) {
            return false;
          }

          if (criteria.ticket_purchases!.max_spent && totalSpent > criteria.ticket_purchases!.max_spent) {
            return false;
          }

          if (criteria.ticket_purchases!.purchase_date_range) {
            const { start, end } = criteria.ticket_purchases!.purchase_date_range;
            const hasPurchaseInRange = userOrders.some((order: any) => {
              const purchaseDate = order.created_at;
              return purchaseDate && purchaseDate >= start && purchaseDate <= end;
            });
            
            if (!hasPurchaseInRange) return false;
          }

          return true;
        });
      }

      // Filter by last login
      if (criteria.last_login) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - criteria.last_login.days_ago!);

        filteredUsers = filteredUsers.filter(user => {
          const lastLogin = user.last_login ? new Date(user.last_login) : null;
          
          if (!lastLogin) return false;

          if (criteria.last_login!.comparison === 'less_than') {
            return lastLogin > cutoffDate;
          } else {
            return lastLogin < cutoffDate;
          }
        });
      }

      return filteredUsers;
    } catch (error) {
      console.error('Error querying users by criteria:', error);
      return [];
    }
  }

  // Calculate segment statistics
  private static async calculateSegmentStats(users: any[]): Promise<{
    total_users: number;
    active_users: number;
    avg_age: number;
    top_locations: Array<{ city: string; state: string; count: number }>;
    avg_events_attended: number;
    avg_lifetime_value: number;
  }> {
    const currentYear = new Date().getFullYear();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate active users (logged in within 30 days)
    const activeUsers = users.filter(user => {
      const lastLogin = user.last_login ? new Date(user.last_login) : null;
      return lastLogin && lastLogin > thirtyDaysAgo;
    }).length;

    // Calculate average age
    const usersWithAge = users.filter(user => user.birth_year);
    const avgAge = usersWithAge.length > 0
      ? usersWithAge.reduce((sum, user) => sum + (currentYear - user.birth_year), 0) / usersWithAge.length
      : 0;

    // Calculate top locations
    const locationCounts = users.reduce((acc, user) => {
      if (user.city && user.state) {
        const location = `${user.city}, ${user.state}`;
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => {
        const [city, state] = location.split(', ');
        return { city, state, count };
      });

    // Calculate average events attended
    const totalEventsAttended = users.reduce((sum, user) => {
      return sum + ((user as any).orders?.length || 0);
    }, 0);
    const avgEventsAttended = users.length > 0 ? totalEventsAttended / users.length : 0;

    // Calculate average lifetime value
    const totalSpent = users.reduce((sum, user) => {
      return sum + ((user as any).orders?.reduce((orderSum: number, order: any) => 
        orderSum + (order.total_amount || 0), 0) || 0);
    }, 0);
    const avgLifetimeValue = users.length > 0 ? totalSpent / users.length : 0;

    return {
      total_users: users.length,
      active_users: activeUsers,
      avg_age: Math.round(avgAge),
      top_locations: topLocations,
      avg_events_attended: Math.round(avgEventsAttended * 100) / 100,
      avg_lifetime_value: Math.round(avgLifetimeValue * 100) / 100
    };
  }

  // Get predefined segment templates
  static getPredefinedSegments(): Array<{
    name: string;
    description: string;
    criteria: SegmentCriteria;
  }> {
    return [
      {
        name: 'Frequent Attendees',
        description: 'Users who have attended 3+ events in the last 6 months',
        criteria: {
          events_attended: {
            min_count: 3,
            date_range: {
              start: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            }
          }
        }
      },
      {
        name: 'High Value Customers',
        description: 'Users who have spent $200+ on tickets',
        criteria: {
          ticket_purchases: {
            min_spent: 200
          }
        }
      },
      {
        name: 'Local Chicago Steppers',
        description: 'Users in Chicago and surrounding areas',
        criteria: {
          location: {
            cities: ['Chicago', 'Evanston', 'Oak Park', 'Cicero', 'Berwyn']
          }
        }
      },
      {
        name: 'Young Adults',
        description: 'Users aged 21-35',
        criteria: {
          age_range: { min: 21, max: 35 }
        }
      },
      {
        name: 'Inactive Users',
        description: 'Users who haven\'t logged in for 60+ days',
        criteria: {
          last_login: {
            days_ago: 60,
            comparison: 'greater_than'
          }
        }
      },
      {
        name: 'Class Enthusiasts',
        description: 'Users who prefer classes and workshops',
        criteria: {
          preferred_event_types: ['class', 'workshop', 'lesson']
        }
      },
      {
        name: 'Party Goers',
        description: 'Users who prefer social events and parties',
        criteria: {
          preferred_event_types: ['party', 'social', 'birthday', 'celebration']
        }
      },
      {
        name: 'New Users',
        description: 'Users who joined in the last 30 days',
        criteria: {
          events_attended: {
            min_count: 0,
            date_range: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            }
          }
        }
      }
    ];
  }

  // Test segment criteria (preview results)
  static async testSegmentCriteria(criteria: SegmentCriteria): Promise<{
    total_matches: number;
    sample_users: any[];
    estimated_reach: number;
  }> {
    try {
      const users = await this.queryUsersByCriteria(criteria);
      const sampleUsers = users.slice(0, 10); // Return first 10 as sample

      return {
        total_matches: users.length,
        sample_users: sampleUsers.map(user => ({
          id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          city: user.city,
          state: user.state,
          events_attended: (user as any).orders?.length || 0,
          lifetime_value: (user as any).orders?.reduce((sum: number, order: any) => 
            sum + (order.total_amount || 0), 0) || 0
        })),
        estimated_reach: users.length
      };
    } catch (error) {
      console.error('Error testing segment criteria:', error);
      return {
        total_matches: 0,
        sample_users: [],
        estimated_reach: 0
      };
    }
  }
}