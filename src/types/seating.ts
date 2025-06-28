
export type SeatStatus = 'sold' | 'reserved' | 'selected' | 'available' | 'held';

export interface SeatData {
  id: string;
  seatNumber: string;
  row?: string;
  section?: string;
  x: number;
  y: number;
  price: number;
  category: string;
  categoryColor: string;
  status: SeatStatus;
  isADA: boolean;
  holdExpiry?: Date;
}

export interface SeatingSection {
  id: string;
  name: string;
  color: string;
  basePrice: number;
  seats: SeatData[];
}

export interface SeatingChart {
  id: string;
  name: string;
  venue_id: string;
  sections: SeatingSection[];
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}
