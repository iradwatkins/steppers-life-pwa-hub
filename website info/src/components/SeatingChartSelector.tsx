import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Users, DollarSign } from 'lucide-react';

interface SeatPosition {
  id: string;
  x: number;
  y: number;
  seatNumber: string;
  row?: string;
  section?: string;
  priceCategory: string;
  isADA: boolean;
  status: 'available' | 'sold' | 'reserved' | 'blocked';
  price: number;
}

interface SeatingChart {
  id: string;
  name: string;
  imageUrl: string;
  seats: SeatPosition[];
}

interface PriceCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface SelectedSeat extends SeatPosition {
  selected: boolean;
}

interface SeatingChartSelectorProps {
  eventId: string;
  seatingChart: SeatingChart;
  priceCategories: PriceCategory[];
  onSeatsSelected: (seats: SelectedSeat[]) => void;
  maxSelectable?: number;
}

const SeatingChartSelector: React.FC<SeatingChartSelectorProps> = ({
  eventId,
  seatingChart,
  priceCategories,
  onSeatsSelected,
  maxSelectable = 10
}) => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  const handleSeatClick = useCallback((seat: SeatPosition) => {
    if (seat.status !== 'available') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      // Deselect seat
      const updated = selectedSeats.filter(s => s.id !== seat.id);
      setSelectedSeats(updated);
      onSeatsSelected(updated);
    } else {
      // Select seat (if under limit)
      if (selectedSeats.length >= maxSelectable) {
        alert(`You can select a maximum of ${maxSelectable} seats`);
        return;
      }

      const updated = [...selectedSeats, { ...seat, selected: true }];
      setSelectedSeats(updated);
      onSeatsSelected(updated);
    }
  }, [selectedSeats, maxSelectable, onSeatsSelected]);

  const getPriceCategoryColor = (categoryId: string) => {
    return priceCategories.find(cat => cat.id === categoryId)?.color || '#3B82F6';
  };

  const getSeatDisplayColor = (seat: SeatPosition) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) return '#10B981'; // Green for selected
    
    switch (seat.status) {
      case 'available': return getPriceCategoryColor(seat.priceCategory);
      case 'sold': return '#EF4444';
      case 'reserved': return '#F59E0B';
      case 'blocked': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const getSeatsByCategory = () => {
    const categoryCounts: { [key: string]: number } = {};
    selectedSeats.forEach(seat => {
      const categoryName = priceCategories.find(cat => cat.id === seat.priceCategory)?.name || 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });
    return categoryCounts;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-surface-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-text-primary flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-brand-primary" />
            Select Your Seats - {seatingChart.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Seating Chart */}
            <div className="lg:col-span-3">
              <div className="relative border border-border-default rounded-lg overflow-hidden bg-white">
                <img 
                  src={seatingChart.imageUrl} 
                  alt={seatingChart.name}
                  className="w-full h-auto"
                />
                
                {/* Render seats */}
                {seatingChart.seats.map(seat => (
                  <div
                    key={seat.id}
                    className={`absolute w-6 h-6 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-white transition-all duration-200 ${
                      seat.status === 'available' ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'
                    }`}
                    style={{
                      left: `${seat.x}%`,
                      top: `${seat.y}%`,
                      backgroundColor: getSeatDisplayColor(seat)
                    }}
                    onClick={() => handleSeatClick(seat)}
                    title={`${seat.seatNumber} ${seat.row ? `Row ${seat.row}` : ''} ${seat.section ? `Section ${seat.section}` : ''} - $${seat.price} ${seat.isADA ? '(ADA)' : ''}`}
                  >
                    {seat.isADA ? '♿' : seat.seatNumber.slice(-2)}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend and Selection Summary */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-text-primary mb-3">Legend</h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Sold</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Reserved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Unavailable</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Price Categories</h5>
                  {priceCategories.map(category => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">${category.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Summary */}
              {selectedSeats.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-text-primary mb-3 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Selected Seats ({selectedSeats.length})
                    </h4>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSeats.map(seat => (
                        <div key={seat.id} className="flex justify-between items-center p-2 bg-surface-accent rounded text-sm">
                          <span className="font-medium">
                            {seat.seatNumber}
                            {seat.isADA && <span className="ml-1">♿</span>}
                          </span>
                          <span>${seat.price}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      {Object.entries(getSeatsByCategory()).map(([category, count]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span>{category} ({count})</span>
                          <span>${priceCategories.find(cat => cat.name === category)?.price * count || 0}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center font-bold">
                      <span className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        Total:
                      </span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              {selectedSeats.length === 0 && (
                <div className="text-center text-text-secondary py-8">
                  <MapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Click on available seats to select them</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatingChartSelector; 