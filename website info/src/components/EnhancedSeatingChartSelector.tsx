import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, DollarSign, ZoomIn, ZoomOut, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

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
}

interface SeatingChart {
  id: string;
  name: string;
  imageUrl: string;
  seats: SeatPosition[];
  venueType: 'theater' | 'stadium' | 'arena' | 'table-service' | 'general-admission';
}

interface PriceCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface SelectedSeat extends SeatPosition {
  selected: boolean;
  holdId?: string;
}

interface HoldTimer {
  seatId: string;
  expiresAt: Date;
  holdId: string;
}

interface EnhancedSeatingChartSelectorProps {
  eventId: string;
  seatingChart: SeatingChart;
  priceCategories: PriceCategory[];
  onSeatsSelected: (seats: SelectedSeat[]) => void;
  maxSelectable?: number;
  sessionId?: string;
  userId?: string;
  enableRealTimeUpdates?: boolean;
  enableHoldTimers?: boolean;
  holdDurationMinutes?: number;
}

const EnhancedSeatingChartSelector: React.FC<EnhancedSeatingChartSelectorProps> = ({
  eventId,
  seatingChart,
  priceCategories,
  onSeatsSelected,
  maxSelectable = 10,
  sessionId,
  userId,
  enableRealTimeUpdates = true,
  enableHoldTimers = true,
  holdDurationMinutes = 15
}) => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [holdTimers, setHoldTimers] = useState<HoldTimer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showZoomDialog, setShowZoomDialog] = useState(false);
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const chartRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Inventory integration
  const {
    getTicketAvailabilityStatus,
    createHold,
    releaseHold,
    isLoading: inventoryLoading,
    error: inventoryError
  } = useInventory(eventId);

  // Real-time updates effect
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    // Listen for inventory updates and refresh seat statuses
    const handleInventoryUpdate = () => {
      // Refresh seat availability statuses
      refreshSeatStatuses();
    };

    // Subscribe to real-time updates (would use WebSocket in production)
    const interval = setInterval(handleInventoryUpdate, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [eventId, enableRealTimeUpdates]);

  // Hold timer management
  useEffect(() => {
    if (!enableHoldTimers) return;

    const interval = setInterval(() => {
      const now = new Date();
      setHoldTimers(prev => prev.filter(timer => timer.expiresAt > now));
      
      // Release expired holds
      holdTimers.forEach(timer => {
        if (timer.expiresAt <= now) {
          releaseHold(timer.holdId);
          setSelectedSeats(prev => prev.filter(seat => seat.id !== timer.seatId));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [holdTimers, enableHoldTimers, releaseHold]);

  const refreshSeatStatuses = useCallback(() => {
    // In a real implementation, this would fetch current seat statuses from the server
    // For now, we'll simulate some updates
  }, []);

  const handleSeatClick = useCallback(async (seat: SeatPosition) => {
    if (seat.status !== 'available' || isProcessing) return;

    setIsProcessing(true);

    try {
      const isSelected = selectedSeats.some(s => s.id === seat.id);

      if (isSelected) {
        // Release hold and deselect seat
        const selectedSeat = selectedSeats.find(s => s.id === seat.id);
        if (selectedSeat?.holdId) {
          await releaseHold(selectedSeat.holdId);
        }
        
        const updated = selectedSeats.filter(s => s.id !== seat.id);
        setSelectedSeats(updated);
        setHoldTimers(prev => prev.filter(t => t.seatId !== seat.id));
        onSeatsSelected(updated);
      } else {
        // Select seat and create hold
        if (selectedSeats.length >= maxSelectable) {
          alert(`You can select a maximum of ${maxSelectable} seats`);
          return;
        }

        // Create inventory hold for this seat
        if (enableHoldTimers && sessionId) {
          const holdResult = await createHold({
            eventId,
            ticketTypeId: seat.priceCategory,
            quantity: 1,
            sessionId,
            userId,
            holdType: 'checkout',
            holdDurationMinutes
          });

          if (!holdResult.success) {
            alert(holdResult.message || 'Unable to reserve this seat');
            return;
          }

          // Add hold timer
          const expiresAt = new Date(Date.now() + holdDurationMinutes * 60000);
          setHoldTimers(prev => [...prev, {
            seatId: seat.id,
            expiresAt,
            holdId: holdResult.hold!.id
          }]);

          const selectedSeat: SelectedSeat = {
            ...seat,
            selected: true,
            holdId: holdResult.hold!.id,
            holdExpiresAt: expiresAt
          };

          const updated = [...selectedSeats, selectedSeat];
          setSelectedSeats(updated);
          onSeatsSelected(updated);
        } else {
          // Simple selection without hold
          const updated = [...selectedSeats, { ...seat, selected: true }];
          setSelectedSeats(updated);
          onSeatsSelected(updated);
        }
      }
    } catch (error) {
      console.error('Error handling seat selection:', error);
      alert('Error selecting seat. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSeats, maxSelectable, eventId, sessionId, userId, enableHoldTimers, holdDurationMinutes, createHold, releaseHold, onSeatsSelected, isProcessing]);

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
      case 'held': return '#8B5CF6'; // Purple for held by others
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

  const getTimeRemaining = (seatId: string): number => {
    const timer = holdTimers.find(t => t.seatId === seatId);
    if (!timer) return 0;
    
    const now = new Date().getTime();
    const expires = timer.expiresAt.getTime();
    return Math.max(0, expires - now);
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Zoom and pan handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    setPanX(touch.clientX - dragStart.x);
    setPanY(touch.clientY - dragStart.y);
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div className="space-y-6">
      <Card className="bg-surface-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-text-primary flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-brand-primary" />
              Select Your Seats - {seatingChart.name}
            </CardTitle>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-text-secondary min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowZoomDialog(true)}>
                View Options
              </Button>
            </div>
          </div>
          
          {/* Loading/Error States */}
          {inventoryLoading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="animate-spin w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full" />
              Updating availability...
            </div>
          )}
          
          {inventoryError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              Error loading seat availability. Please refresh.
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Seating Chart */}
            <div className="lg:col-span-3">
              <div 
                ref={chartRef}
                className="relative border border-border-default rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing"
                style={{ 
                  height: '500px',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease'
                  }}
                >
                  <img 
                    ref={imageRef}
                    src={seatingChart.imageUrl} 
                    alt={seatingChart.name}
                    className="w-full h-auto select-none"
                    draggable={false}
                  />
                  
                  {/* Render seats */}
                  {seatingChart.seats.map(seat => {
                    const timeRemaining = getTimeRemaining(seat.id);
                    const isExpiringSoon = timeRemaining > 0 && timeRemaining < 60000; // Less than 1 minute
                    
                    return (
                      <div
                        key={seat.id}
                        className={`absolute rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-white transition-all duration-200 ${
                          seat.status === 'available' && !isProcessing 
                            ? 'cursor-pointer hover:scale-110 hover:z-10' 
                            : 'cursor-not-allowed'
                        } ${isExpiringSoon ? 'animate-pulse ring-2 ring-red-400' : ''}`}
                        style={{
                          left: `${seat.x}%`,
                          top: `${seat.y}%`,
                          backgroundColor: getSeatDisplayColor(seat),
                          width: `${24 / zoom}px`,
                          height: `${24 / zoom}px`,
                          fontSize: `${12 / zoom}px`,
                          borderWidth: `${2 / zoom}px`
                        }}
                        onClick={() => handleSeatClick(seat)}
                        title={`${seat.seatNumber} ${seat.row ? `Row ${seat.row}` : ''} ${seat.section ? `Section ${seat.section}` : ''} - $${seat.price} ${seat.isADA ? '(ADA)' : ''} ${timeRemaining > 0 ? `- Hold expires in ${formatTimeRemaining(timeRemaining)}` : ''}`}
                      >
                        {seat.isADA ? '♿' : seat.seatNumber.slice(-2)}
                      </div>
                    );
                  })}
                </div>
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
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Held by Others</span>
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
                      {selectedSeats.map(seat => {
                        const timeRemaining = getTimeRemaining(seat.id);
                        return (
                          <div key={seat.id} className="p-2 bg-surface-accent rounded text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {seat.seatNumber}
                                {seat.isADA && <span className="ml-1">♿</span>}
                              </span>
                              <span>${seat.price}</span>
                            </div>
                            {timeRemaining > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-orange-500" />
                                <span className="text-xs text-orange-600">
                                  Hold expires: {formatTimeRemaining(timeRemaining)}
                                </span>
                                <Progress 
                                  value={(timeRemaining / (holdDurationMinutes * 60000)) * 100} 
                                  className="flex-1 h-1"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                    
                    {enableHoldTimers && holdTimers.length > 0 && (
                      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Seats are held for {holdDurationMinutes} minutes</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedSeats.length === 0 && (
                <div className="text-center text-text-secondary py-8">
                  <MapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Click on available seats to select them</p>
                  {seatingChart.venueType === 'table-service' && (
                    <p className="text-xs mt-1">Each selection represents a table</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zoom Options Dialog */}
      <Dialog open={showZoomDialog} onOpenChange={setShowZoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Options</DialogTitle>
            <DialogDescription>
              Adjust the seating chart view for better visibility
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zoom Level</label>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>-</Button>
                <span className="min-w-[4rem] text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>+</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setZoom(0.5)}>50%</Button>
              <Button variant="outline" onClick={() => setZoom(1)}>100%</Button>
              <Button variant="outline" onClick={() => setZoom(1.5)}>150%</Button>
              <Button variant="outline" onClick={() => setZoom(2)}>200%</Button>
              <Button variant="outline" onClick={() => setZoom(2.5)}>250%</Button>
              <Button variant="outline" onClick={() => setZoom(3)}>300%</Button>
            </div>
            
            <Button onClick={handleResetView} className="w-full">
              Reset View
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSeatingChartSelector; 