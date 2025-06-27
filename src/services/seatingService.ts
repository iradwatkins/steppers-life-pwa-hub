import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SeatingChart = Database['public']['Tables']['seating_charts']['Row'];
type SeatingChartInsert = Database['public']['Tables']['seating_charts']['Insert'];
type SeatingChartUpdate = Database['public']['Tables']['seating_charts']['Update'];

type Seat = Database['public']['Tables']['seats']['Row'];
type SeatInsert = Database['public']['Tables']['seats']['Insert'];

export interface SeatingConfiguration {
  eventId: string;
  seatingType: 'general_admission' | 'reserved_seating' | 'assigned_seating';
  gaConfig?: {
    capacity: number;
    price: number;
    description?: string;
  };
  tables?: Array<{
    id: string;
    name: string;
    capacity: number;
    price: number;
    pricingModel: 'per_table' | 'per_person';
    x?: number;
    y?: number;
    isBlocked?: boolean;
  }>;
  sections?: Array<{
    id: string;
    name: string;
    capacity: number;
    pricePerSeat: number;
    color?: string;
    isBlocked?: boolean;
  }>;
}

export interface SeatingChartData {
  eventId: string;
  chartImage?: string;
  seats: Array<{
    id: string;
    seatNumber: string;
    row: string;
    section: string;
    x: number;
    y: number;
    price: number;
    type: string;
    isADA?: boolean;
    isBlocked?: boolean;
  }>;
  priceCategories: Array<{
    id: string;
    name: string;
    price: number;
    color: string;
    description?: string;
  }>;
}

export class SeatingService {
  static async saveSeatingConfiguration(eventId: string, config: SeatingConfiguration) {
    try {
      console.log('💾 Saving seating configuration to database:', config);

      const seatingChartData: SeatingChartInsert = {
        event_id: eventId,
        seating_type: config.seatingType,
        configuration: config as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('seating_charts')
        .upsert(seatingChartData, { 
          onConflict: 'event_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error saving seating configuration:', error);
        throw new Error(`Failed to save seating configuration: ${error.message}`);
      }

      console.log('✅ Seating configuration saved successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Error in saveSeatingConfiguration:', error);
      throw error;
    }
  }

  static async getSeatingConfiguration(eventId: string): Promise<SeatingChart | null> {
    try {
      const { data, error } = await supabase
        .from('seating_charts')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No configuration found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting seating configuration:', error);
      throw error;
    }
  }

  static async saveSeatingChart(eventId: string, chartData: SeatingChartData) {
    try {
      console.log('💾 Saving seating chart with mapped seats:', chartData);

      // First, save or update the seating chart
      const chartRecord: SeatingChartInsert = {
        event_id: eventId,
        seating_type: 'assigned_seating',
        chart_image_url: chartData.chartImage,
        configuration: {
          priceCategories: chartData.priceCategories
        } as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: chart, error: chartError } = await supabase
        .from('seating_charts')
        .upsert(chartRecord, { 
          onConflict: 'event_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (chartError) {
        console.error('❌ Error saving seating chart:', chartError);
        throw new Error(`Failed to save seating chart: ${chartError.message}`);
      }

      // Delete existing seats for this event
      const { error: deleteError } = await supabase
        .from('seats')
        .delete()
        .eq('event_id', eventId);

      if (deleteError) {
        console.error('❌ Error deleting existing seats:', deleteError);
      }

      // Insert new seats
      if (chartData.seats.length > 0) {
        const seatInserts: SeatInsert[] = chartData.seats.map(seat => ({
          event_id: eventId,
          seating_chart_id: chart.id,
          seat_number: seat.seatNumber,
          row_name: seat.row,
          section_name: seat.section,
          position_x: seat.x,
          position_y: seat.y,
          price: seat.price,
          seat_type: seat.type,
          is_ada_accessible: seat.isADA || false,
          is_blocked: seat.isBlocked || false,
          status: seat.isBlocked ? 'blocked' : 'available'
        }));

        const { data: seats, error: seatsError } = await supabase
          .from('seats')
          .insert(seatInserts)
          .select();

        if (seatsError) {
          console.error('❌ Error saving seats:', seatsError);
          throw new Error(`Failed to save seats: ${seatsError.message}`);
        }

        console.log(`✅ Saved ${seats.length} seats successfully`);
      }

      console.log('✅ Seating chart saved successfully:', chart);
      return chart;

    } catch (error) {
      console.error('❌ Error in saveSeatingChart:', error);
      throw error;
    }
  }

  static async getSeatingChart(eventId: string) {
    try {
      // Get seating chart
      const { data: chart, error: chartError } = await supabase
        .from('seating_charts')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (chartError) {
        if (chartError.code === 'PGRST116') {
          return null; // No chart found
        }
        throw chartError;
      }

      // Get seats
      const { data: seats, error: seatsError } = await supabase
        .from('seats')
        .select('*')
        .eq('event_id', eventId)
        .order('row_name, seat_number');

      if (seatsError) {
        console.error('❌ Error getting seats:', seatsError);
        throw seatsError;
      }

      return {
        chart,
        seats: seats || []
      };

    } catch (error) {
      console.error('❌ Error getting seating chart:', error);
      throw error;
    }
  }

  static async updateSeatStatus(seatId: string, status: 'available' | 'reserved' | 'sold' | 'blocked') {
    try {
      const { data, error } = await supabase
        .from('seats')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', seatId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update seat status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating seat status:', error);
      throw error;
    }
  }

  static async getAvailableSeats(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'available')
        .order('row_name, seat_number');

      if (error) {
        throw new Error(`Failed to get available seats: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting available seats:', error);
      throw error;
    }
  }

  static async reserveSeats(eventId: string, seatIds: string[], userId: string, expiresAt: Date) {
    try {
      const { data, error } = await supabase
        .from('seats')
        .update({
          status: 'reserved',
          reserved_by: userId,
          reserved_until: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .in('id', seatIds)
        .eq('status', 'available') // Only reserve available seats
        .select();

      if (error) {
        throw new Error(`Failed to reserve seats: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error reserving seats:', error);
      throw error;
    }
  }

  static async releaseExpiredReservations() {
    try {
      const { data, error } = await supabase
        .from('seats')
        .update({
          status: 'available',
          reserved_by: null,
          reserved_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('status', 'reserved')
        .lt('reserved_until', new Date().toISOString())
        .select();

      if (error) {
        throw new Error(`Failed to release expired reservations: ${error.message}`);
      }

      console.log(`✅ Released ${data?.length || 0} expired seat reservations`);
      return data || [];
    } catch (error) {
      console.error('❌ Error releasing expired reservations:', error);
      throw error;
    }
  }
}

export class SeatingChartService {
  static async saveSeatingChart(eventId: string, chartData: SeatingChartData) {
    return SeatingService.saveSeatingChart(eventId, chartData);
  }

  static async getSeatingChart(eventId: string) {
    return SeatingService.getSeatingChart(eventId);
  }
}