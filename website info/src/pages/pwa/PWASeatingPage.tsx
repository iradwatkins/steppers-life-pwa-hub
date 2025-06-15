import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Circle, 
  Square, 
  RotateCcw,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Smartphone
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
  lastUpdated?: Date;
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

const PWASeatingPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  // Mobile-optimized state
  const [seatingChart, setSeatingChart] = useState<SeatingChart | null>(null);
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatPosition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const chartRef = useRef<HTMLDivElement>(null);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockChart: SeatingChart = {
      id: 'chart1',
      name: 'Main Venue Layout',
      imageUrl: '/placeholder.svg',
      venueType: 'theater',
      seats: [
        { id: '1', x: 20, y: 30, seatNumber: 'A1', row: 'A', priceCategory: 'premium', isADA: false, status: 'available', price: 150 },
        { id: '2', x: 25, y: 30, seatNumber: 'A2', row: 'A', priceCategory: 'premium', isADA: false, status: 'sold', price: 150 },
        { id: '3', x: 30, y: 30, seatNumber: 'A3', row: 'A', priceCategory: 'premium', isADA: true, status: 'available', price: 150 },
        { id: '4', x: 35, y: 30, seatNumber: 'A4', row: 'A', priceCategory: 'premium', isADA: false, status: 'held', price: 150, holdExpiresAt: new Date(Date.now() + 600000) },
        { id: '5', x: 20, y: 40, seatNumber: 'B1', row: 'B', priceCategory: 'standard', isADA: false, status: 'reserved', price: 100 },
        { id: '6', x: 25, y: 40, seatNumber: 'B2', row: 'B', priceCategory: 'standard', isADA: false, status: 'available', price: 100 },
        { id: '7', x: 30, y: 40, seatNumber: 'B3', row: 'B', priceCategory: 'standard', isADA: false, status: 'blocked', price: 100 },
        { id: '8', x: 35, y: 40, seatNumber: 'B4', row: 'B', priceCategory: 'standard', isADA: false, status: 'available', price: 100 },
      ]
    };

    const mockCategories: PriceCategory[] = [
      { id: 'premium', name: 'Premium', price: 150, color: '#FFD700' },
      { id: 'standard', name: 'Standard', price: 100, color: '#4169E1' },
      { id: 'economy', name: 'Economy', price: 75, color: '#32CD32' }
    ];

    setSeatingChart(mockChart);
    setPriceCategories(mockCategories);
  }, [eventId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In real app, refresh seat statuses from server
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeatDisplayColor = (seat: SeatPosition) => {
    switch (seat.status) {
      case 'available': return priceCategories.find(cat => cat.id === seat.priceCategory)?.color || '#3B82F6';
      case 'sold': return '#EF4444';
      case 'reserved': return '#F59E0B';
      case 'blocked': return '#6B7280';
      case 'held': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Circle className="w-4 h-4 text-green-500" />;
      case 'sold': return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'reserved': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'blocked': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'held': return <AlertTriangle className="w-4 h-4 text-purple-500" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const filteredSeats = seatingChart?.seats.filter(seat => {
    const matchesSearch = seat.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (seat.row && seat.row.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || seat.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSeatClick = (seat: SeatPosition) => {
    setSelectedSeat(seat);
  };

  const updateSeatStatus = (seatId: string, newStatus: SeatPosition['status']) => {
    if (!seatingChart) return;

    const updatedSeats = seatingChart.seats.map(seat => 
      seat.id === seatId 
        ? { ...seat, status: newStatus, lastUpdated: new Date() }
        : seat
    );

    setSeatingChart({
      ...seatingChart,
      seats: updatedSeats
    });

    setSelectedSeat(null);
    setLastUpdate(new Date());
  };

  // Touch handling for mobile
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

  const getStatusCounts = () => {
    if (!seatingChart) return {};
    
    return seatingChart.seats.reduce((counts, seat) => {
      counts[seat.status] = (counts[seat.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (!seatingChart) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-main">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <p className="text-text-secondary">Loading seating chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main">
      {/* Mobile Header */}
      <div className="bg-surface-card border-b border-border-default px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" />
              Seat Status Manager
            </h1>
            <p className="text-sm text-text-secondary">Event ID: {eventId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Updated {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      {showControls && (
        <div className="bg-surface-card border-b border-border-default p-4 space-y-3">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="text-lg font-bold text-green-600">{statusCounts.available || 0}</div>
              <div className="text-xs text-green-700">Available</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-center">
              <div className="text-lg font-bold text-red-600">{statusCounts.sold || 0}</div>
              <div className="text-xs text-red-700">Sold</div>
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <div className="text-lg font-bold text-purple-600">{statusCounts.held || 0}</div>
              <div className="text-xs text-purple-700">Held</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search seats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="held">Held</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}>
              -
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom + 0.25, 3))}>
              +
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Seating Chart */}
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <div 
          ref={chartRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing"
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
            className="w-full h-full relative"
          >
            <img 
              src={seatingChart.imageUrl}
              alt={seatingChart.name}
              className="w-full h-auto select-none"
              draggable={false}
            />
            
            {/* Render seats */}
            {seatingChart.seats.map(seat => {
              const isHighlighted = filteredSeats.includes(seat);
              const opacity = searchTerm || statusFilter !== 'all' ? (isHighlighted ? 1 : 0.3) : 1;
              
              return (
                <div
                  key={seat.id}
                  className={`absolute rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-white transition-all duration-200 cursor-pointer ${
                    isHighlighted ? 'ring-2 ring-brand-primary ring-offset-1' : ''
                  }`}
                  style={{
                    left: `${seat.x}%`,
                    top: `${seat.y}%`,
                    backgroundColor: getSeatDisplayColor(seat),
                    width: `${Math.max(24 / zoom, 16)}px`,
                    height: `${Math.max(24 / zoom, 16)}px`,
                    fontSize: `${Math.max(12 / zoom, 8)}px`,
                    borderWidth: `${Math.max(2 / zoom, 1)}px`,
                    opacity
                  }}
                  onClick={() => handleSeatClick(seat)}
                >
                  {seat.isADA ? '♿' : seat.seatNumber.slice(-2)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seat Details Modal */}
      <Dialog open={!!selectedSeat} onOpenChange={() => setSelectedSeat(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSeat && getStatusIcon(selectedSeat.status)}
              Seat {selectedSeat?.seatNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedSeat?.row && `Row ${selectedSeat.row} • `}
              {priceCategories.find(cat => cat.id === selectedSeat?.priceCategory)?.name} • 
              ${selectedSeat?.price}
              {selectedSeat?.isADA && ' • ADA Accessible'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(selectedSeat.status)}
                    <span className="capitalize">{selectedSeat.status}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <div className="mt-1">
                    {priceCategories.find(cat => cat.id === selectedSeat.priceCategory)?.name}
                  </div>
                </div>
              </div>

              {selectedSeat.holdExpiresAt && (
                <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                  <div className="text-sm text-purple-700">
                    Hold expires: {selectedSeat.holdExpiresAt.toLocaleTimeString()}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSeatStatus(selectedSeat.id, 'available')}
                    disabled={selectedSeat.status === 'available'}
                  >
                    <Circle className="w-4 h-4 mr-1" />
                    Available
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSeatStatus(selectedSeat.id, 'blocked')}
                    disabled={selectedSeat.status === 'blocked'}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Block
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSeatStatus(selectedSeat.id, 'reserved')}
                    disabled={selectedSeat.status === 'reserved'}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Reserve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSeatStatus(selectedSeat.id, 'sold')}
                    disabled={selectedSeat.status === 'sold'}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Sold
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="bg-surface-card border-t border-border-default p-4">
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Held</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWASeatingPage; 