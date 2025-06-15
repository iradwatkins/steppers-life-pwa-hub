import React, { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, MapPin, Settings, Eye, Save, Trash2, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
}

interface SeatingChart {
  id: string;
  name: string;
  imageUrl: string;
  imageFile?: File;
  seats: SeatPosition[];
  createdAt: Date;
}

interface PriceCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

const EventSeatingPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('setup');
  const [seatingCharts, setSeatingCharts] = useState<SeatingChart[]>([]);
  const [currentChart, setCurrentChart] = useState<SeatingChart | null>(null);
  const [isMapping, setIsMapping] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatPosition | null>(null);
  const [selectedSeatType, setSelectedSeatType] = useState<string>('1');
  const [placingADA, setPlacingADA] = useState(false);
  
  // Price categories
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([
    { id: '1', name: 'General Admission', price: 25, color: '#3B82F6' },
    { id: '2', name: 'VIP', price: 50, color: '#F59E0B' },
    { id: '3', name: 'Premium', price: 75, color: '#8B5CF6' }
  ]);

  // Seat configuration form
  const [seatForm, setSeatForm] = useState({
    seatNumber: '',
    row: '',
    section: '',
    priceCategory: '',
    isADA: false
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PNG, JPG, or JPEG files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    
    const newChart: SeatingChart = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      imageUrl,
      imageFile: file,
      seats: [],
      createdAt: new Date()
    };

    setSeatingCharts(prev => [...prev, newChart]);
    setCurrentChart(newChart);
    setActiveTab('mapping');

    toast({
      title: "Chart uploaded successfully",
      description: "You can now start mapping seats on your chart."
    });
  }, []);

  const handleChartClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMapping || !currentChart) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Find the appropriate price category based on selected seat type ID
    const priceCategory = priceCategories.find(cat => cat.id === selectedSeatType) || priceCategories[0];

    const newSeat: SeatPosition = {
      id: Date.now().toString(),
      x,
      y,
      seatNumber: `${priceCategory.name.charAt(0).toUpperCase()}${currentChart.seats.length + 1}`,
      priceCategory: priceCategory.id,
      isADA: placingADA,
      status: 'available'
    };

    const updatedChart = {
      ...currentChart,
      seats: [...currentChart.seats, newSeat]
    };

    setCurrentChart(updatedChart);
    setSeatingCharts(prev => 
      prev.map(chart => chart.id === currentChart.id ? updatedChart : chart)
    );

    setSelectedSeat(newSeat);
    setSeatForm({
      seatNumber: newSeat.seatNumber,
      row: newSeat.row || '',
      section: newSeat.section || '',
      priceCategory: newSeat.priceCategory,
      isADA: newSeat.isADA
    });

    toast({
      title: "Seat added",
      description: `${placingADA ? 'ADA ' : ''}${priceCategory.name} seat ${newSeat.seatNumber} placed successfully.`
    });
  }, [isMapping, currentChart, selectedSeatType, placingADA, priceCategories]);

  const handleSeatUpdate = () => {
    if (!selectedSeat || !currentChart) return;

    const updatedSeat = {
      ...selectedSeat,
      seatNumber: seatForm.seatNumber,
      row: seatForm.row,
      section: seatForm.section,
      priceCategory: seatForm.priceCategory,
      isADA: seatForm.isADA
    };

    const updatedChart = {
      ...currentChart,
      seats: currentChart.seats.map(seat => 
        seat.id === selectedSeat.id ? updatedSeat : seat
      )
    };

    setCurrentChart(updatedChart);
    setSeatingCharts(prev => 
      prev.map(chart => chart.id === currentChart.id ? updatedChart : chart)
    );

    toast({
      title: "Seat updated",
      description: `Seat ${seatForm.seatNumber} has been updated.`
    });
  };

  const handleSeatDelete = (seatId: string) => {
    if (!currentChart) return;

    const updatedChart = {
      ...currentChart,
      seats: currentChart.seats.filter(seat => seat.id !== seatId)
    };

    setCurrentChart(updatedChart);
    setSeatingCharts(prev => 
      prev.map(chart => chart.id === currentChart.id ? updatedChart : chart)
    );

    if (selectedSeat?.id === seatId) {
      setSelectedSeat(null);
    }

    toast({
      title: "Seat deleted",
      description: "Seat has been removed from the chart."
    });
  };

  const handleSaveChart = () => {
    if (!currentChart) return;

    // Here you would save to backend
    console.log('Saving seating chart:', currentChart);
    
    toast({
      title: "Chart saved",
      description: `Seating chart "${currentChart.name}" saved successfully with ${currentChart.seats.length} seats.`
    });
  };

  const getPriceCategoryColor = (categoryId: string) => {
    return priceCategories.find(cat => cat.id === categoryId)?.color || '#3B82F6';
  };

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'sold': return '#EF4444';
      case 'reserved': return '#F59E0B';
      case 'blocked': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-brand-primary" />
              Seating Chart Manager - Event ID: {eventId}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Upload your seating chart image and configure interactive seat selection.
            </CardDescription>
            
            {/* Advanced Editor Upgrade Notice */}
            <div className="mt-4 p-4 bg-gradient-to-r from-brand-primary/5 to-brand-primary-hover/5 border border-brand-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-primary">Need Advanced Features?</h4>
                    <p className="text-sm text-text-secondary">
                      Try our advanced editor with zoom controls, bulk operations, and import/export
                    </p>
                  </div>
                </div>
                <a 
                  href={`/organizer/event/${eventId}/seating/advanced`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                >
                  <span>⚡</span>
                  Try Advanced Editor
                </a>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="setup">
                  <Settings className="mr-2 h-4 w-4" />
                  Setup Pricing
                </TabsTrigger>
                <TabsTrigger value="upload" disabled={priceCategories.length === 0}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Chart
                </TabsTrigger>
                <TabsTrigger value="mapping" disabled={!currentChart}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Map Seats
                </TabsTrigger>
                <TabsTrigger value="configure" disabled={!selectedSeat}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Seat
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!currentChart}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6">
                <div className="space-y-6">
            <div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      Define Your Pricing Structure
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Set up your ticket types and pricing before mapping seats. This ensures consistency between your seating chart and ticket sales.
                    </p>
            </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-blue-900 font-semibold mb-2">Recommended Workflow</h4>
                    <div className="text-blue-800 text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <p><strong>Define pricing categories</strong> based on your venue sections</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <p><strong>Upload your seating chart</strong> image</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <p><strong>Map seats</strong> to your defined pricing categories</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <p><strong>Preview and generate</strong> your ticket types automatically</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Category Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Categories</CardTitle>
                      <CardDescription>
                        Create different price levels for your venue sections (e.g., General Admission, VIP, Premium)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {priceCategories.map((category, index) => (
                        <div key={category.id} className="flex items-center gap-4 p-3 border border-border-default rounded-lg">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="flex-1">
                            <Input 
                              value={category.name}
                              onChange={(e) => {
                                const updatedCategories = [...priceCategories];
                                updatedCategories[index].name = e.target.value;
                                setPriceCategories(updatedCategories);
                              }}
                              placeholder="Category name (e.g., General Admission)"
                            />
                          </div>
                          <div className="w-32">
                            <Input 
                              type="number"
                              value={category.price}
                              onChange={(e) => {
                                const updatedCategories = [...priceCategories];
                                updatedCategories[index].price = Number(e.target.value);
                                setPriceCategories(updatedCategories);
                              }}
                              placeholder="Price"
                            />
                          </div>
                          <div className="w-24">
                            <Input 
                              type="color"
                              value={category.color}
                              onChange={(e) => {
                                const updatedCategories = [...priceCategories];
                                updatedCategories[index].color = e.target.value;
                                setPriceCategories(updatedCategories);
                              }}
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setPriceCategories(priceCategories.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const newCategory: PriceCategory = {
                            id: Date.now().toString(),
                            name: `Category ${priceCategories.length + 1}`,
                            price: 25,
                            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
                          };
                          setPriceCategories([...priceCategories, newCategory]);
                        }}
                      >
                        + Add Price Category
                  </Button>
                    </CardContent>
                  </Card>

                  {/* Workflow Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Setup Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${priceCategories.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {priceCategories.length > 0 ? '✓' : '1'}
                          </div>
                          <span className={priceCategories.length > 0 ? 'text-green-700 font-medium' : ''}>
                            Define pricing categories ({priceCategories.length} created)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${currentChart ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {currentChart ? '✓' : '2'}
                          </div>
                          <span className={currentChart ? 'text-green-700 font-medium' : ''}>
                            Upload seating chart ({currentChart ? 'Completed' : 'Pending'})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${currentChart?.seats.length ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {currentChart?.seats.length ? '✓' : '3'}
                          </div>
                          <span className={currentChart?.seats.length ? 'text-green-700 font-medium' : ''}>
                            Map seats ({currentChart?.seats.length || 0} seats mapped)
                          </span>
                        </div>
                      </div>
                      
                      {priceCategories.length > 0 && (
                        <div className="mt-4">
                          <Button 
                            onClick={() => setActiveTab('upload')}
                            className="w-full"
                          >
                            Continue to Upload Chart →
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <div className="border-2 border-dashed border-border-default rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-text-secondary mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Upload Seating Chart
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Upload PNG, JPG, or JPEG files (max 10MB)
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {seatingCharts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-text-primary">Existing Charts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {seatingCharts.map(chart => (
                        <Card key={chart.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => {setCurrentChart(chart); setActiveTab('mapping');}}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{chart.name}</CardTitle>
                            <Badge variant="secondary">{chart.seats.length} seats</Badge>
                          </CardHeader>
                          <CardContent>
                            <img 
                              src={chart.imageUrl} 
                              alt={chart.name}
                              className="w-full h-32 object-cover rounded"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mapping" className="space-y-6">
                {currentChart && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-text-primary">
                        Mapping: {currentChart.name}
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          variant={isMapping ? "destructive" : "default"}
                          onClick={() => setIsMapping(!isMapping)}
                        >
                          {isMapping ? 'Stop Mapping' : 'Start Mapping'}
                        </Button>
                        <Button onClick={handleSaveChart}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Chart
                        </Button>
                      </div>
                    </div>

                    {/* Seat Count Dashboard - Moved to Top */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          Seat Mapping Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {/* Total Seats */}
                          <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                            <div className="text-2xl font-bold text-blue-600">{currentChart.seats.length}</div>
                            <div className="text-xs text-gray-600 font-medium">Total Seats</div>
                          </div>
                          
                          {/* ADA Seats */}
                          <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                            <div className="text-2xl font-bold text-green-600">{currentChart.seats.filter(s => s.isADA).length}</div>
                            <div className="text-xs text-gray-600 font-medium">ADA Seats</div>
                          </div>
                          
                          {/* Price Category Counts */}
                          {priceCategories.map(category => (
                            <div key={category.id} className="bg-white p-3 rounded-lg border text-center" style={{ borderColor: category.color }}>
                              <div className="text-2xl font-bold" style={{ color: category.color }}>
                                {currentChart.seats.filter(s => s.priceCategory === category.id).length}
                              </div>
                              <div className="text-xs text-gray-600 font-medium">{category.name}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Revenue Potential */}
                        {currentChart.seats.length > 0 && (
                          <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-800">Estimated Revenue</span>
                              <span className="text-xl font-bold text-green-800">
                                ${priceCategories.reduce((total, category) => {
                                  const categorySeats = currentChart.seats.filter(s => s.priceCategory === category.id).length;
                                  return total + (categorySeats * category.price);
                                }, 0)}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {isMapping && (
                      <div className="space-y-4">
                        {/* Instructions */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="text-blue-900 font-semibold mb-2">How to Map Seats</h4>
                          <p className="text-blue-800 text-sm mb-3">
                            Select a seat type below, then click on your seating chart to place seats. Each click creates a new seat of the selected type.
                          </p>
                          <div className="text-blue-700 text-sm space-y-1">
                            <p>• <strong>General Admission:</strong> Standard seating areas</p>
                            <p>• <strong>VIP:</strong> Premium seating with enhanced amenities</p>
                            <p>• <strong>Premium:</strong> Top-tier seating with exclusive perks</p>
                            <p>• <strong>ADA Toggle:</strong> Mark any seat type as wheelchair accessible</p>
                          </div>
                        </div>

                        {/* Seat Type Selection */}
                        <div className="bg-white p-4 rounded-lg border border-border-default">
                          <h4 className="font-medium text-text-primary mb-3">Select Seat Type to Place</h4>
                          <div className="flex flex-wrap gap-3">
                            {/* Dynamic Price Category Buttons */}
                            {priceCategories.map((category) => (
                              <Button
                                key={category.id}
                                variant={selectedSeatType === category.id ? 'default' : 'outline'}
                                onClick={() => setSelectedSeatType(category.id)}
                                className={`flex items-center gap-2 transition-all duration-200 relative group ${
                                  selectedSeatType === category.id 
                                    ? 'ring-2 ring-offset-2 scale-105 shadow-lg' 
                                    : 'hover:scale-105 hover:shadow-md'
                                }`}
                                style={selectedSeatType === category.id ? {
                                  backgroundColor: category.color,
                                  borderColor: category.color,
                                  color: 'white',
                                  ringColor: category.color
                                } : {
                                  borderColor: category.color,
                                  color: category.color
                                }}
                                title={`Click to select ${category.name} seats at $${category.price} each`}
                              >
                                <div 
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                    selectedSeatType === category.id ? 'border-white text-white' : 'border-current'
                                  }`}
                                  style={{ backgroundColor: selectedSeatType === category.id ? 'rgba(255,255,255,0.2)' : category.color }}
                                >
                                  {selectedSeatType === category.id ? '✓' : category.name.charAt(0)}
                                </div>
                                <span className="font-medium">
                                  {category.name} <span className="font-bold">(${category.price})</span>
                                </span>
                                
                                {/* Selection Indicator */}
                                {selectedSeatType === category.id && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                )}
                                
                                {/* Hover Tooltip */}
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {selectedSeatType === category.id ? 'Currently selected' : 'Click to select'}
                                </div>
                              </Button>
                            ))}

                            {/* ADA Toggle */}
                            <Button
                              variant={placingADA ? 'default' : 'outline'}
                              onClick={() => setPlacingADA(!placingADA)}
                              className={`flex items-center gap-2 border-2 transition-all duration-200 relative group ${
                                placingADA 
                                  ? 'ring-2 ring-green-500 ring-offset-2 scale-105 shadow-lg' 
                                  : 'hover:scale-105 hover:shadow-md hover:bg-green-50'
                              }`}
                              style={placingADA ? {
                                backgroundColor: '#059669',
                                borderColor: '#059669',
                                color: 'white'
                              } : {
                                borderColor: '#059669',
                                color: '#059669'
                              }}
                              title={`${placingADA ? 'Disable' : 'Enable'} ADA accessibility for placed seats`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                placingADA ? 'border-white bg-white/20' : 'border-green-600'
                              }`}>
                                <span className="text-sm">{placingADA ? '✓' : '♿'}</span>
                              </div>
                              <span className="font-medium">ADA Accessible</span>
                              
                              {/* Selection Indicator */}
                              {placingADA && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                              
                              {/* Hover Tooltip */}
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {placingADA ? 'Click to disable ADA mode' : 'Click to enable ADA mode'}
                              </div>
                  </Button>
                          </div>
                          
                          {/* Enhanced Current Selection Display */}
                          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Currently placing:</span>
                                <div className="flex items-center gap-2">
                                  {/* Preview Seat */}
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md"
                                    style={{ 
                                      backgroundColor: priceCategories.find(cat => cat.id === selectedSeatType)?.color || '#3B82F6' 
                                    }}
                                  >
                                    {placingADA ? '♿' : (priceCategories.find(cat => cat.id === selectedSeatType)?.name.charAt(0) || 'S')}
                                  </div>
                                  <div>
                                    <span className="text-brand-primary font-semibold">
                                      {placingADA ? 'ADA ' : ''}{priceCategories.find(cat => cat.id === selectedSeatType)?.name || 'No category selected'}
                                    </span>
                                    <div className="text-sm text-gray-600">
                                      ${priceCategories.find(cat => cat.id === selectedSeatType)?.price || 0} per seat
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                Click chart to place
                              </div>
                            </div>
                          </div>
                          
                          {/* Instructions with visual cues */}
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800 flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <strong>Tip:</strong> The seat preview above shows exactly how your placed seats will appear on the chart
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative border border-border-default rounded-lg overflow-hidden">
                      <div
                        className={`relative ${isMapping ? 'cursor-crosshair' : 'cursor-default'}`}
                        onClick={handleChartClick}
                      >
                        <img 
                          src={currentChart.imageUrl} 
                          alt={currentChart.name}
                          className="w-full h-auto"
                        />
                        
                        {/* Render seats */}
                        {currentChart.seats.map(seat => (
                          <div
                            key={seat.id}
                            className="absolute w-6 h-6 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-white hover:scale-110 transition-transform"
                            style={{
                              left: `${seat.x}%`,
                              top: `${seat.y}%`,
                              backgroundColor: getPriceCategoryColor(seat.priceCategory)
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSeat(seat);
                              setSeatForm({
                                seatNumber: seat.seatNumber,
                                row: seat.row || '',
                                section: seat.section || '',
                                priceCategory: seat.priceCategory,
                                isADA: seat.isADA
                              });
                              setActiveTab('configure');
                            }}
                            title={`${seat.seatNumber} - ${priceCategories.find(cat => cat.id === seat.priceCategory)?.name}`}
                          >
                            {seat.isADA ? '♿' : seat.seatNumber.slice(-2)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
              </TabsContent>

              <TabsContent value="configure" className="space-y-6">
                {selectedSeat && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-text-primary">
                        Configure Seat: {selectedSeat.seatNumber}
                      </h3>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleSeatDelete(selectedSeat.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Seat
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="seatNumber">Seat Number</Label>
                          <Input
                            id="seatNumber"
                            value={seatForm.seatNumber}
                            onChange={(e) => setSeatForm({...seatForm, seatNumber: e.target.value})}
                            placeholder="e.g., A12, VIP-01"
                          />
                        </div>

                        <div>
                          <Label htmlFor="row">Row (Optional)</Label>
                          <Input
                            id="row"
                            value={seatForm.row}
                            onChange={(e) => setSeatForm({...seatForm, row: e.target.value})}
                            placeholder="e.g., A, B, 1, 2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="section">Section (Optional)</Label>
                          <Input
                            id="section"
                            value={seatForm.section}
                            onChange={(e) => setSeatForm({...seatForm, section: e.target.value})}
                            placeholder="e.g., VIP, General, Balcony"
                          />
                        </div>

                        <div>
                          <Label htmlFor="priceCategory">Price Category</Label>
                          <Select 
                            value={seatForm.priceCategory} 
                            onValueChange={(value) => setSeatForm({...seatForm, priceCategory: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select price category" />
                            </SelectTrigger>
                            <SelectContent>
                              {priceCategories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name} - ${category.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isADA"
                            checked={seatForm.isADA}
                            onCheckedChange={(checked) => setSeatForm({...seatForm, isADA: checked as boolean})}
                          />
                          <Label htmlFor="isADA" className="text-sm">
                            ADA Accessible Seat
                          </Label>
                        </div>

                        <Button onClick={handleSeatUpdate} className="w-full">
                          Update Seat
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-text-primary">Preview</h4>
                        <div className="border border-border-default p-4 rounded-lg space-y-2">
                          <p><strong>Seat:</strong> {seatForm.seatNumber}</p>
                          {seatForm.row && <p><strong>Row:</strong> {seatForm.row}</p>}
                          {seatForm.section && <p><strong>Section:</strong> {seatForm.section}</p>}
                          <p><strong>Price:</strong> ${priceCategories.find(cat => cat.id === seatForm.priceCategory)?.price || 0}</p>
                          <p><strong>Category:</strong> {priceCategories.find(cat => cat.id === seatForm.priceCategory)?.name}</p>
                          {seatForm.isADA && (
                            <Badge variant="secondary">♿ ADA Accessible</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                {currentChart && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-text-primary">
                        Preview: {currentChart.name}
                      </h3>
                      <div className="flex space-x-2">
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export Chart
                        </Button>
                        <Button onClick={handleSaveChart}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Configuration
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3">
                        <div className="relative border border-border-default rounded-lg overflow-hidden">
                          <img 
                            src={currentChart.imageUrl} 
                            alt={currentChart.name}
                            className="w-full h-auto"
                          />
                          
                          {/* Render seats with status colors */}
                          {currentChart.seats.map(seat => (
                            <div
                              key={seat.id}
                              className="absolute w-6 h-6 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                left: `${seat.x}%`,
                                top: `${seat.y}%`,
                                backgroundColor: getSeatStatusColor(seat.status)
                              }}
                              title={`${seat.seatNumber} - ${seat.status.toUpperCase()}`}
                            >
                              {seat.isADA ? '♿' : seat.seatNumber.slice(-2)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-text-primary">Legend</h4>
                        
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Seat Status</h5>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-sm">Available</span>
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
                            <span className="text-sm">Blocked</span>
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

                        <div className="pt-4 border-t border-border-default">
                          <h5 className="text-sm font-medium mb-2">Chart Statistics</h5>
                          <div className="space-y-1 text-sm">
                            <p>Total Seats: {currentChart.seats.length}</p>
                            <p>ADA Seats: {currentChart.seats.filter(s => s.isADA).length}</p>
                            <p>Available: {currentChart.seats.filter(s => s.status === 'available').length}</p>
                            <p>Sold: {currentChart.seats.filter(s => s.status === 'sold').length}</p>
                          </div>
                        </div>

                        {/* Ticket Generation Section */}
                        <div className="pt-4 border-t border-border-default">
                          <h5 className="text-sm font-medium mb-3">Generate Ticket Types</h5>
                          <div className="space-y-3">
                            {priceCategories.map(category => {
                              const categorySeats = currentChart.seats.filter(s => s.priceCategory === category.id);
                              const adaSeats = categorySeats.filter(s => s.isADA);
                              
                              if (categorySeats.length === 0) return null;
                              
                              return (
                                <div key={category.id} className="p-3 border border-border-default rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: category.color }}
                                      ></div>
                                      <span className="font-medium text-sm">{category.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">${category.price}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p>• {categorySeats.length} total seats</p>
                                    {adaSeats.length > 0 && <p>• {adaSeats.length} ADA accessible</p>}
                                    <p>• Revenue potential: ${categorySeats.length * category.price}</p>
                                  </div>
                                </div>
                              );
                            })}
                            
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-800">Total Revenue Potential</span>
                                <span className="text-lg font-bold text-green-800">
                                  ${priceCategories.reduce((total, category) => {
                                    const categorySeats = currentChart.seats.filter(s => s.priceCategory === category.id).length;
                                    return total + (categorySeats * category.price);
                                  }, 0)}
                                </span>
                              </div>
                            </div>
                            
                            <Button className="w-full mt-3">
                              🎫 Generate Ticket Types & Go Live
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventSeatingPage; 