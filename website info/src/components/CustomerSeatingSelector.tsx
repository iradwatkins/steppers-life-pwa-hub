import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Users, 
  DollarSign, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Clock, 
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  Heart,
  Info
} from 'lucide-react';

interface SeatPosition {
  id: string;
  x: number;
  y: number;
  seatNumber: string;
  row?: string;
  section?: string;
  priceCategory: string;
  isADA: boolean;
  status: 'available' | 'sold' | 'reserved' | 'blocked' | 'held';
  price: number;
  holdExpiresAt?: Date;
  features?: string[]; // e.g., ['Best View', 'Close to Stage', 'Wheelchair Accessible']
  recommendedFor?: string[]; // e.g., ['Couples', 'Groups', 'Premium Experience']
}

interface SeatingChart {
  id: string;
  name: string;
  imageUrl: string;
  seats: SeatPosition[];
  venueInfo: {
    name: string;
    capacity: number;
    layout: string;
    features: string[];
  };
}

interface PriceCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  description?: string;
  perks?: string[];
}

interface SelectedSeat extends SeatPosition {
  selected: boolean;
}

interface CustomerSeatingSelectorProps {
  eventId: string;
  seatingChart: SeatingChart;
  priceCategories: PriceCategory[];
  onSeatsSelected: (seats: SelectedSeat[]) => void;
  maxSelectable?: number;
  showRecommendations?: boolean;
  allowHoldTimer?: boolean;
}

const CustomerSeatingSelector: React.FC<CustomerSeatingSelectorProps> = ({
  eventId,
  seatingChart,
  priceCategories,
  onSeatsSelected,
  maxSelectable = 8,
  showRecommendations = true,
  allowHoldTimer = true
}) => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [holdTimer, setHoldTimer] = useState<number>(0);
  const [selectedSeatInfo, setSelectedSeatInfo] = useState<SeatPosition | null>(null);

  // Hold timer countdown
  useEffect(() => {
    if (selectedSeats.length > 0 && allowHoldTimer) {
      setHoldTimer(600); // 10 minutes
      const interval = setInterval(() => {
        setHoldTimer(prev => {
          if (prev <= 1) {
            setSelectedSeats([]);
            onSeatsSelected([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedSeats.length, allowHoldTimer, onSeatsSelected]);

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
        // Could show a toast notification here
        return;
      }

      const updated = [...selectedSeats, { ...seat, selected: true }];
      setSelectedSeats(updated);
      onSeatsSelected(updated);
    }
  }, [selectedSeats, maxSelectable, onSeatsSelected]);

  const handleSeatHover = (seat: SeatPosition) => {
    setSelectedSeatInfo(seat);
  };

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
      case 'held': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRecommendedSeats = () => {
    return seatingChart.seats.filter(seat => 
      seat.status === 'available' && 
      seat.features && seat.features.length > 0
    ).slice(0, 6);
  };

  const filteredSeats = seatingChart.seats.filter(seat => {
    if (selectedPriceRange.length === 0) return true;
    return selectedPriceRange.includes(seat.priceCategory);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-surface-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-text-primary flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-brand-primary" />
                Select Your Seats
              </CardTitle>
              <p className="text-text-secondary mt-1">{seatingChart.venueInfo.name} • {seatingChart.name}</p>
            </div>
            
            {/* Hold Timer */}
            {selectedSeats.length > 0 && allowHoldTimer && holdTimer > 0 && (
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Seats held for</div>
                <div className={`text-lg font-bold ${holdTimer < 60 ? 'text-red-500' : 'text-brand-primary'}`}>
                  {formatTime(holdTimer)}
                </div>
                <Progress 
                  value={(holdTimer / 600) * 100} 
                  className="w-24 h-2 mt-1"
                />
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Seating Chart */}
        <div className="lg:col-span-3">
          <Card className="bg-surface-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium">Interactive Seating Chart</h3>
                  <Badge variant="secondary">{seatingChart.seats.filter(s => s.status === 'available').length} available</Badge>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                  >
                    {showPriceFilter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Price Filter */}
              {showPriceFilter && (
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <span className="text-sm font-medium">Filter by price:</span>
                  {priceCategories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedPriceRange.includes(category.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedPriceRange.includes(category.id)) {
                          setSelectedPriceRange(prev => prev.filter(id => id !== category.id));
                        } else {
                          setSelectedPriceRange(prev => [...prev, category.id]);
                        }
                      }}
                      className="h-8"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name} (${category.price})
                    </Button>
                  ))}
                  {selectedPriceRange.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPriceRange([])}
                      className="h-8"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="relative border border-border-default rounded-lg overflow-hidden bg-white">
                <div
                  style={{
                    transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.1s ease'
                  }}
                  className="w-full h-auto relative"
                >
                  <img 
                    src={seatingChart.imageUrl} 
                    alt={seatingChart.name}
                    className="w-full h-auto select-none"
                    draggable={false}
                  />
                  
                  {/* Render seats */}
                  {(selectedPriceRange.length > 0 ? filteredSeats : seatingChart.seats).map(seat => {
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const isAvailable = seat.status === 'available';
                    const isHighlighted = selectedPriceRange.length > 0 && !selectedPriceRange.includes(seat.priceCategory);
                    
                    return (
                      <div
                        key={seat.id}
                        className={`absolute w-6 h-6 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-white transition-all duration-200 ${
                          isAvailable ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : 'cursor-not-allowed'
                        } ${isSelected ? 'ring-2 ring-green-400 ring-offset-2 scale-110' : ''}`}
                        style={{
                          left: `${seat.x}%`,
                          top: `${seat.y}%`,
                          backgroundColor: getSeatDisplayColor(seat),
                          opacity: isHighlighted ? 0.3 : 1,
                          zIndex: isSelected ? 10 : 1
                        }}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => handleSeatHover(seat)}
                        onMouseLeave={() => setSelectedSeatInfo(null)}
                        title={`${seat.seatNumber} ${seat.row ? `Row ${seat.row}` : ''} - $${seat.price} ${seat.isADA ? '(ADA)' : ''}`}
                      >
                        {seat.isADA ? '♿' : seat.seatNumber.slice(-2)}
                        
                        {/* Premium indicators */}
                        {seat.features && seat.features.includes('Best View') && (
                          <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-current" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Seat hover info */}
                {selectedSeatInfo && (
                  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-20">
                    <div className="font-medium">{selectedSeatInfo.seatNumber}</div>
                    <div className="text-sm text-gray-600">
                      {selectedSeatInfo.row && `Row ${selectedSeatInfo.row} • `}
                      ${selectedSeatInfo.price}
                    </div>
                    {selectedSeatInfo.features && selectedSeatInfo.features.length > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        {selectedSeatInfo.features.join(' • ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Your Selection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">Sold Out</span>
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

              <Separator />

              <div className="space-y-2">
                <h5 className="text-sm font-medium">Pricing</h5>
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
            </CardContent>
          </Card>

          {/* Recommendations */}
          {showRecommendations && getRecommendedSeats().length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Recommended
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getRecommendedSeats().slice(0, 3).map(seat => (
                    <div 
                      key={seat.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSeatClick(seat)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{seat.seatNumber}</div>
                          <div className="text-xs text-gray-600">${seat.price}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {seat.features?.[0]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selection Summary */}
          {selectedSeats.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Your Selection ({selectedSeats.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="flex justify-between items-center p-2 bg-surface-accent rounded text-sm">
                      <div>
                        <span className="font-medium">{seat.seatNumber}</span>
                        {seat.isADA && <span className="ml-1">♿</span>}
                        {seat.row && <div className="text-xs text-gray-600">Row {seat.row}</div>}
                      </div>
                      <span className="font-medium">${seat.price}</span>
                    </div>
                  ))}
                </div>

                <Separator />
                
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Total:
                  </span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>

                {allowHoldTimer && holdTimer > 0 && holdTimer < 60 && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Hurry! Seats expire in {formatTime(holdTimer)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedSeats.length === 0 && (
            <div className="text-center text-text-secondary py-8">
              <MapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Click on available seats to select them</p>
              <p className="text-xs text-gray-500 mt-1">Max {maxSelectable} seats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSeatingSelector; 