import React, { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, MapPin, Settings, Eye, Save, Trash2, Download, Accessibility } from 'lucide-react';
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
  description?: string;
}

const AdvancedSeatingPage = () => {
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
    { id: '1', name: 'General Admission', price: 25, color: '#3B82F6', description: 'Standard seating' },
    { id: '2', name: 'VIP', price: 50, color: '#F59E0B', description: 'Premium seating with perks' },
    { id: '3', name: 'Premium', price: 75, color: '#8B5CF6', description: 'Best seats in the house' },
    { id: '4', name: 'ADA', price: 25, color: '#10B981', description: 'Accessible seating' }
  ]);

  // New category form
  const [newCategory, setNewCategory] = useState({
    name: '',
    price: 0,
    color: '#3B82F6',
    description: ''
  });

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
  }, [toast]);

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
  }, [isMapping, currentChart, selectedSeatType, placingADA, priceCategories, toast]);

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

  const addPriceCategory = () => {
    if (!newCategory.name || newCategory.price <= 0) {
      toast({
        title: "Invalid category",
        description: "Please provide a valid name and price.",
        variant: "destructive"
      });
      return;
    }

    const category: PriceCategory = {
      id: (priceCategories.length + 1).toString(),
      ...newCategory
    };

    setPriceCategories(prev => [...prev, category]);
    setNewCategory({ name: '', price: 0, color: '#3B82F6', description: '' });

    toast({
      title: "Category added",
      description: `Price category "${category.name}" added successfully.`
    });
  };

  const getPriceCategoryColor = (categoryId: string) => {
    return priceCategories.find(cat => cat.id === categoryId)?.color || '#3B82F6';
  };

  const getTotalRevenue = () => {
    if (!currentChart) return 0;
    return currentChart.seats.reduce((total, seat) => {
      const category = priceCategories.find(cat => cat.id === seat.priceCategory);
      return total + (category?.price || 0);
    }, 0);
  };

  const getSeatsByCategory = () => {
    if (!currentChart) return {};
    const counts: Record<string, number> = {};
    currentChart.seats.forEach(seat => {
      counts[seat.priceCategory] = (counts[seat.priceCategory] || 0) + 1;
    });
    return counts;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <MapPin className="mr-2 h-6 w-6" />
              Advanced Seating Chart Manager - Event {eventId}
            </CardTitle>
            <CardDescription>
              Create interactive seating charts with dynamic pricing and accessibility features.
            </CardDescription>
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
                <TabsTrigger value="preview" disabled={!currentChart || currentChart.seats.length === 0}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* Setup Pricing Tab */}
              <TabsContent value="setup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Price Categories</CardTitle>
                    <CardDescription>
                      Configure different price tiers for your seating
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Existing Categories */}
                    <div className="grid gap-4">
                      {priceCategories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-muted-foreground">{category.description}</div>
                            </div>
                          </div>
                          <div className="text-lg font-semibold">${category.price}</div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Category */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Add New Category</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., VIP, Premium"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryPrice">Price ($)</Label>
                          <Input
                            id="categoryPrice"
                            type="number"
                            value={newCategory.price}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryColor">Color</Label>
                          <Input
                            id="categoryColor"
                            type="color"
                            value={newCategory.color}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDescription">Description</Label>
                          <Input
                            id="categoryDescription"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description"
                          />
                        </div>
                      </div>
                      <Button onClick={addPriceCategory} className="mt-4">
                        Add Category
                      </Button>
                    </div>

                    <Button 
                      onClick={() => setActiveTab('upload')} 
                      className="w-full"
                      disabled={priceCategories.length === 0}
                    >
                      Continue to Upload Chart
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Chart Tab */}
              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Venue Layout</CardTitle>
                    <CardDescription>
                      Upload an image of your venue to start mapping seats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-lg font-medium mb-2">Upload your venue layout</div>
                      <div className="text-gray-500 mb-4">PNG, JPG or JPEG (max 10MB)</div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mapping Tab */}
              <TabsContent value="mapping" className="space-y-6">
                {currentChart && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chart Display */}
                    <div className="lg:col-span-3">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>{currentChart.name}</CardTitle>
                            <div className="flex space-x-2">
                              <Button
                                variant={isMapping ? "default" : "outline"}
                                onClick={() => setIsMapping(!isMapping)}
                              >
                                {isMapping ? "Stop Mapping" : "Start Mapping"}
                              </Button>
                              <Button onClick={() => handleSaveChart()}>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div 
                            className="relative border rounded-lg overflow-hidden cursor-crosshair"
                            onClick={handleChartClick}
                            style={{ aspectRatio: '16/9', minHeight: '400px' }}
                          >
                            <img 
                              src={currentChart.imageUrl} 
                              alt="Venue layout"
                              className="w-full h-full object-contain"
                            />
                            {/* Render seats */}
                            {currentChart.seats.map(seat => (
                              <div
                                key={seat.id}
                                className="absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
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
                                }}
                              >
                                {seat.isADA && (
                                  <Accessibility className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Mapping Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Seat Type</Label>
                            <Select value={selectedSeatType} onValueChange={setSelectedSeatType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {priceCategories.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-3 h-3 rounded"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <span>{category.name} (${category.price})</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="ada" 
                              checked={placingADA} 
                              onCheckedChange={(checked) => setPlacingADA(checked as boolean)}
                            />
                            <Label htmlFor="ada">ADA Accessible</Label>
                          </div>

                          {isMapping && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-sm font-medium text-blue-800 mb-1">Mapping Mode Active</div>
                              <div className="text-sm text-blue-600">
                                Click on the venue layout to place {placingADA ? 'ADA ' : ''}
                                {priceCategories.find(cat => cat.id === selectedSeatType)?.name} seats
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Statistics */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Total Seats:</span>
                            <span className="font-semibold">{currentChart.seats.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Potential Revenue:</span>
                            <span className="font-semibold">${getTotalRevenue()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ADA Seats:</span>
                            <span className="font-semibold">
                              {currentChart.seats.filter(seat => seat.isADA).length}
                            </span>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t">
                            <div className="text-sm font-medium">By Category:</div>
                            {Object.entries(getSeatsByCategory()).map(([categoryId, count]) => {
                              const category = priceCategories.find(cat => cat.id === categoryId);
                              return (
                                <div key={categoryId} className="flex justify-between text-sm">
                                  <span className="flex items-center">
                                    <div 
                                      className="w-2 h-2 rounded mr-2"
                                      style={{ backgroundColor: category?.color }}
                                    />
                                    {category?.name}:
                                  </span>
                                  <span>{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Configure Seat Tab */}
              <TabsContent value="configure" className="space-y-6">
                {selectedSeat && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Configure Seat: {selectedSeat.seatNumber}</CardTitle>
                      <CardDescription>
                        Modify seat details and properties
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="seatNumber">Seat Number</Label>
                          <Input
                            id="seatNumber"
                            value={seatForm.seatNumber}
                            onChange={(e) => setSeatForm(prev => ({ ...prev, seatNumber: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="row">Row</Label>
                          <Input
                            id="row"
                            value={seatForm.row}
                            onChange={(e) => setSeatForm(prev => ({ ...prev, row: e.target.value }))}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={seatForm.section}
                            onChange={(e) => setSeatForm(prev => ({ ...prev, section: e.target.value }))}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label>Price Category</Label>
                          <Select value={seatForm.priceCategory} onValueChange={(value) => setSeatForm(prev => ({ ...prev, priceCategory: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priceCategories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name} (${category.price})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="seatADA" 
                          checked={seatForm.isADA} 
                          onCheckedChange={(checked) => setSeatForm(prev => ({ ...prev, isADA: checked as boolean }))}
                        />
                        <Label htmlFor="seatADA">ADA Accessible Seat</Label>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={handleSeatUpdate}>
                          Update Seat
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleSeatDelete(selectedSeat.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Seat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                {currentChart && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Seating Chart Preview</CardTitle>
                      <CardDescription>
                        This is how customers will see your seating chart
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                          <div className="relative border rounded-lg overflow-hidden">
                            <img 
                              src={currentChart.imageUrl} 
                              alt="Venue layout"
                              className="w-full h-full object-contain"
                              style={{ aspectRatio: '16/9', minHeight: '400px' }}
                            />
                            {currentChart.seats.map(seat => (
                              <div
                                key={seat.id}
                                className="absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
                                style={{
                                  left: `${seat.x}%`,
                                  top: `${seat.y}%`,
                                  backgroundColor: getPriceCategoryColor(seat.priceCategory)
                                }}
                                title={`${seat.seatNumber} - ${priceCategories.find(cat => cat.id === seat.priceCategory)?.name} - $${priceCategories.find(cat => cat.id === seat.priceCategory)?.price}${seat.isADA ? ' (ADA)' : ''}`}
                              >
                                {seat.isADA && (
                                  <Accessibility className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Card>
                            <CardHeader>
                              <CardTitle>Legend</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {priceCategories.map(category => {
                                const count = currentChart.seats.filter(seat => seat.priceCategory === category.id).length;
                                if (count === 0) return null;
                                
                                return (
                                  <div key={category.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-4 h-4 rounded-full border border-white"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <div>
                                        <div className="font-medium">{category.name}</div>
                                        <div className="text-sm text-muted-foreground">${category.price}</div>
                                      </div>
                                    </div>
                                    <Badge variant="secondary">{count}</Badge>
                                  </div>
                                );
                              })}
                              
                              <div className="pt-2 border-t">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Accessibility className="w-4 h-4" />
                                  <span>ADA Accessible</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button onClick={() => handleSaveChart()}>
                          <Save className="mr-2 h-4 w-4" />
                          Save & Publish
                        </Button>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export Configuration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedSeatingPage;