import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface WellnessMetric {
  id: string;
  user_id: string;
  metric_type: 'steps' | 'distance' | 'calories' | 'active_minutes' | 'dance_sessions' | 'mood' | 'energy_level';
  value: number;
  unit: string;
  recorded_date: string;
  source: 'manual' | 'device' | 'app_integration';
  notes?: string;
  created_at: string;
}

export interface WellnessGoal {
  id: string;
  user_id: string;
  goal_type: 'daily_steps' | 'weekly_distance' | 'monthly_events' | 'dance_hours' | 'weight_loss' | 'custom';
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WellnessStats {
  user_id: string;
  period: 'today' | 'week' | 'month' | 'year';
  total_steps: number;
  total_distance: number;
  total_calories: number;
  active_minutes: number;
  dance_sessions: number;
  events_attended: number;
  average_mood: number;
  average_energy: number;
  goals_achieved: number;
  streak_days: number;
}

export interface HealthIntegration {
  id: string;
  user_id: string;
  provider: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'strava';
  is_connected: boolean;
  last_sync: string;
  sync_enabled_metrics: string[];
  access_token?: string;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
}

export class WellnessTrackingService {
  
  // Record a wellness metric
  static async recordMetric(userId: string, metricData: {
    metric_type: WellnessMetric['metric_type'];
    value: number;
    unit: string;
    source?: WellnessMetric['source'];
    notes?: string;
    recorded_date?: string;
  }): Promise<WellnessMetric> {
    try {
      console.log('📊 Recording wellness metric:', metricData);

      const { data, error } = await supabase
        .from('wellness_metrics')
        .insert({
          user_id: userId,
          metric_type: metricData.metric_type,
          value: metricData.value,
          unit: metricData.unit,
          source: metricData.source || 'manual',
          notes: metricData.notes,
          recorded_date: metricData.recorded_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error recording wellness metric:', error);
        throw error;
      }

      console.log('✅ Wellness metric recorded successfully:', data);
      
      // Update daily aggregates
      await this.updateDailyAggregates(userId, metricData.recorded_date || new Date().toISOString().split('T')[0]);
      
      return data as WellnessMetric;
    } catch (error) {
      console.error('❌ Error in recordMetric:', error);
      throw error;
    }
  }

  // Get wellness metrics for a user
  static async getMetrics(userId: string, filters?: {
    metric_type?: WellnessMetric['metric_type'];
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<WellnessMetric[]> {
    try {
      let query = supabase
        .from('wellness_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false });

      if (filters?.metric_type) {
        query = query.eq('metric_type', filters.metric_type);
      }

      if (filters?.start_date) {
        query = query.gte('recorded_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('recorded_date', filters.end_date);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching wellness metrics:', error);
        throw error;
      }

      return data as WellnessMetric[];
    } catch (error) {
      console.error('❌ Error in getMetrics:', error);
      throw error;
    }
  }

  // Create a wellness goal
  static async createGoal(userId: string, goalData: {
    goal_type: WellnessGoal['goal_type'];
    target_value: number;
    unit: string;
    end_date: string;
    title: string;
    description?: string;
  }): Promise<WellnessGoal> {
    try {
      console.log('🎯 Creating wellness goal:', goalData);

      const { data, error } = await supabase
        .from('wellness_goals')
        .insert({
          user_id: userId,
          goal_type: goalData.goal_type,
          target_value: goalData.target_value,
          current_value: 0,
          unit: goalData.unit,
          start_date: new Date().toISOString().split('T')[0],
          end_date: goalData.end_date,
          status: 'active',
          title: goalData.title,
          description: goalData.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating wellness goal:', error);
        throw error;
      }

      console.log('✅ Wellness goal created successfully:', data);
      return data as WellnessGoal;
    } catch (error) {
      console.error('❌ Error in createGoal:', error);
      throw error;
    }
  }

  // Get wellness goals for a user
  static async getGoals(userId: string, status?: WellnessGoal['status']): Promise<WellnessGoal[]> {
    try {
      let query = supabase
        .from('wellness_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching wellness goals:', error);
        throw error;
      }

      return data as WellnessGoal[];
    } catch (error) {
      console.error('❌ Error in getGoals:', error);
      throw error;
    }
  }

  // Update goal progress
  static async updateGoalProgress(goalId: string, newValue: number): Promise<WellnessGoal> {
    try {
      // Get current goal
      const { data: goal, error: goalError } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (goalError || !goal) {
        throw new Error('Goal not found');
      }

      const updatedValue = Math.max(goal.current_value, newValue);
      const isCompleted = updatedValue >= goal.target_value;

      const { data, error } = await supabase
        .from('wellness_goals')
        .update({
          current_value: updatedValue,
          status: isCompleted ? 'completed' : goal.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating goal progress:', error);
        throw error;
      }

      // If goal completed, send notification
      if (isCompleted && goal.status !== 'completed') {
        try {
          const { NotificationService } = await import('./notificationService');
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', goal.user_id)
            .single();

          if (user?.email) {
            await NotificationService.sendGeneralNotification({
              to: user.email,
              subject: 'Wellness Goal Achieved! 🎉',
              message: `Congratulations! You've achieved your wellness goal: ${goal.title}`,
              type: 'email',
              templateData: {
                userName: user.full_name || 'User',
                goalTitle: goal.title,
                targetValue: goal.target_value,
                unit: goal.unit
              }
            });
          }
        } catch (notificationError) {
          console.warn('⚠️ Failed to send goal completion notification:', notificationError);
        }
      }

      return data as WellnessGoal;
    } catch (error) {
      console.error('❌ Error in updateGoalProgress:', error);
      throw error;
    }
  }

  // Get wellness statistics
  static async getWellnessStats(userId: string, period: WellnessStats['period'] = 'month'): Promise<WellnessStats> {
    try {
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get metrics for the period
      const metrics = await this.getMetrics(userId, {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      // Calculate stats
      const stats: WellnessStats = {
        user_id: userId,
        period,
        total_steps: 0,
        total_distance: 0,
        total_calories: 0,
        active_minutes: 0,
        dance_sessions: 0,
        events_attended: 0,
        average_mood: 0,
        average_energy: 0,
        goals_achieved: 0,
        streak_days: 0
      };

      // Aggregate metrics
      const moodValues = [];
      const energyValues = [];

      for (const metric of metrics) {
        switch (metric.metric_type) {
          case 'steps':
            stats.total_steps += metric.value;
            break;
          case 'distance':
            stats.total_distance += metric.value;
            break;
          case 'calories':
            stats.total_calories += metric.value;
            break;
          case 'active_minutes':
            stats.active_minutes += metric.value;
            break;
          case 'dance_sessions':
            stats.dance_sessions += metric.value;
            break;
          case 'mood':
            moodValues.push(metric.value);
            break;
          case 'energy_level':
            energyValues.push(metric.value);
            break;
        }
      }

      // Calculate averages
      stats.average_mood = moodValues.length > 0 
        ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length 
        : 0;
      
      stats.average_energy = energyValues.length > 0 
        ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length 
        : 0;

      // Get events attended
      const { data: eventsData } = await supabase
        .from('orders')
        .select('event_id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      stats.events_attended = eventsData?.length || 0;

      // Get completed goals
      const { data: goalsData } = await supabase
        .from('wellness_goals')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString());

      stats.goals_achieved = goalsData?.length || 0;

      // Calculate streak days (simplified)
      stats.streak_days = await this.calculateStreak(userId);

      return stats;
    } catch (error) {
      console.error('❌ Error in getWellnessStats:', error);
      throw error;
    }
  }

  // Connect health integration
  static async connectHealthIntegration(userId: string, provider: HealthIntegration['provider'], accessData: {
    access_token?: string;
    refresh_token?: string;
    sync_enabled_metrics: string[];
  }): Promise<HealthIntegration> {
    try {
      console.log('🔗 Connecting health integration:', provider);

      const { data, error } = await supabase
        .from('health_integrations')
        .upsert({
          user_id: userId,
          provider,
          is_connected: true,
          last_sync: new Date().toISOString(),
          sync_enabled_metrics: accessData.sync_enabled_metrics,
          access_token: accessData.access_token,
          refresh_token: accessData.refresh_token,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,provider'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error connecting health integration:', error);
        throw error;
      }

      console.log('✅ Health integration connected successfully:', data);
      return data as HealthIntegration;
    } catch (error) {
      console.error('❌ Error in connectHealthIntegration:', error);
      throw error;
    }
  }

  // Sync data from health integrations
  static async syncHealthData(userId: string, provider?: HealthIntegration['provider']): Promise<{
    synced_records: number;
    last_sync: string;
  }> {
    try {
      console.log('🔄 Syncing health data for user:', userId);

      let query = supabase
        .from('health_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_connected', true);

      if (provider) {
        query = query.eq('provider', provider);
      }

      const { data: integrations, error } = await query;

      if (error) {
        throw error;
      }

      let totalSynced = 0;
      const syncTime = new Date().toISOString();

      for (const integration of integrations || []) {
        try {
          // This would normally call the actual health provider APIs
          // For now, we'll simulate some data sync
          const mockMetrics = await this.simulateHealthDataSync(userId, integration);
          totalSynced += mockMetrics.length;

          // Update last sync time
          await supabase
            .from('health_integrations')
            .update({ last_sync: syncTime })
            .eq('id', integration.id);

        } catch (syncError) {
          console.warn(`⚠️ Failed to sync data from ${integration.provider}:`, syncError);
        }
      }

      return {
        synced_records: totalSynced,
        last_sync: syncTime
      };
    } catch (error) {
      console.error('❌ Error in syncHealthData:', error);
      throw error;
    }
  }

  // Private helper methods
  private static async updateDailyAggregates(userId: string, date: string): Promise<void> {
    try {
      // This would update daily aggregate tables for faster querying
      // Implementation depends on specific database schema
      console.log('📈 Updating daily aggregates for:', userId, date);
    } catch (error) {
      console.warn('⚠️ Failed to update daily aggregates:', error);
    }
  }

  private static async calculateStreak(userId: string): Promise<number> {
    try {
      // Calculate consecutive days with recorded activities
      // Simplified implementation - could be more sophisticated
      const recentDays = 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - recentDays);

      const { data: metrics, error } = await supabase
        .from('wellness_metrics')
        .select('recorded_date')
        .eq('user_id', userId)
        .gte('recorded_date', startDate.toISOString().split('T')[0])
        .order('recorded_date', { ascending: false });

      if (error || !metrics) {
        return 0;
      }

      // Count consecutive days from today backwards
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const uniqueDates = [...new Set(metrics.map(m => m.recorded_date))].sort().reverse();

      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(new Date().getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (uniqueDates[i] === expectedDateStr) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('❌ Error calculating streak:', error);
      return 0;
    }
  }

  private static async simulateHealthDataSync(userId: string, integration: HealthIntegration): Promise<WellnessMetric[]> {
    // Simulate syncing data from health providers
    // In real implementation, this would call provider APIs
    const mockData: Omit<WellnessMetric, 'id' | 'created_at'>[] = [];

    if (integration.sync_enabled_metrics.includes('steps')) {
      mockData.push({
        user_id: userId,
        metric_type: 'steps',
        value: Math.floor(Math.random() * 10000) + 5000,
        unit: 'steps',
        recorded_date: new Date().toISOString().split('T')[0],
        source: 'device',
        notes: `Synced from ${integration.provider}`
      });
    }

    if (integration.sync_enabled_metrics.includes('distance')) {
      mockData.push({
        user_id: userId,
        metric_type: 'distance',
        value: Math.random() * 5 + 2,
        unit: 'km',
        recorded_date: new Date().toISOString().split('T')[0],
        source: 'device',
        notes: `Synced from ${integration.provider}`
      });
    }

    // Record the metrics
    const recordedMetrics: WellnessMetric[] = [];
    for (const metric of mockData) {
      try {
        const recorded = await this.recordMetric(userId, metric);
        recordedMetrics.push(recorded);
      } catch (error) {
        console.warn('⚠️ Failed to record synced metric:', error);
      }
    }

    return recordedMetrics;
  }
}