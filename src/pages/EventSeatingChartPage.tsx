import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import InteractiveSeatingChart from '@/components/seating/InteractiveSeatingChart';
import { 
  ArrowLeft,
  ArrowRight,
  Upload,
  Save,
  Eye,
  Trash2,
  MousePointer,
  Grid3X3
} from 'lucide-react';

// Seat Types
type SeatType = 'regular' | 'premium' | 'vip' | 'ada';

// Seat Configuration
interface SeatConfig {
  id: string;
  x: number;
  y: number;
  seatNumber: string;
  row?: string;
  section?: string;
  type: SeatType;
  price: number;
  isBlocked: boolean;
  isADA: boolean;
}

// Chart Upload Configuration
interface ChartConfig {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  seats: SeatConfig[];
  totalSeats: number;
  totalRevenue: number;
}

const chartFormSchema = z.object({
  name: z.string().min(1, 'Chart name is required'),
  file: z.any().optional(),
  seats: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    seatNumber: z.string(),
    row: z.string().optional(),
    section: z.string().optional(),
    type: z.enum(['regular', 'premium', 'vip', 'ada']),
    price: z.number().min(0),
    isBlocked: z.boolean(),
    isADA: z.boolean()
  })).default([])
});

type ChartFormData = z.infer<typeof chartFormSchema>;

const seatTypeColors = {
  regular: '#3b82f6',    // Blue
  premium: '#f59e0b',    // Orange  
  vip: '#8b5cf6',        // Purple
  ada: '#10b981'         // Green
};

const seatTypePrices = {
  regular: 25,
  premium: 50,
  vip: 100,
  ada: 25
};

const EventSeatingChartPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentTab, setCurrentTab] = useState('setup');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isMapping, setIsMapping] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>('regular');
  const [mappedSeats, setMappedSeats] = useState<SeatConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const form = useForm<ChartFormData>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: {
      name: '',
      seats: []
    }
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      
      // Create image element to get dimensions
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = result;
      
      form.setValue('file', file);
      toast.success('Chart uploaded successfully');
      setCurrentTab('upload');
    };
    reader.readAsDataURL(file);
  }, [form]);

  const drawSeatsOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw seats
      mappedSeats.forEach((seat) => {
        const scaleX = canvas.width / imageSize.width;
        const scaleY = canvas.height / imageSize.height;
        
        const canvasX = seat.x * scaleX;
        const canvasY = seat.y * scaleY;
        
        // Draw seat circle
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = seat.isBlocked ? '#ef4444' : seatTypeColors[seat.type];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw seat number
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(seat.seatNumber, canvasX, canvasY + 3);
      });
    };
    img.src = uploadedImage;
  }, [uploadedImage, mappedSeats, imageSize]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMapping || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const newSeat: SeatConfig = {
      id: `seat-${Date.now()}`,
      x,
      y,
      seatNumber: `${mappedSeats.length + 1}`,
      row: '',
      section: '',
      type: selectedSeatType,
      price: seatTypePrices[selectedSeatType],
      isBlocked: false,
      isADA: selectedSeatType === 'ada'
    };

    setMappedSeats(prev => [...prev, newSeat]);
    form.setValue('seats', [...mappedSeats, newSeat]);
    
    // Redraw canvas with new seat
    drawSeatsOnCanvas();
  }, [isMapping, imageSize, mappedSeats, selectedSeatType, form, drawSeatsOnCanvas]);

  const removeSeat = (seatId: string) => {
    const updatedSeats = mappedSeats.filter(seat => seat.id !== seatId);
    setMappedSeats(updatedSeats);
    form.setValue('seats', updatedSeats);
    drawSeatsOnCanvas();
  };

  const updateSeat = (seatId: string, updates: Partial<SeatConfig>) => {
    const updatedSeats = mappedSeats.map(seat => 
      seat.id === seatId ? { ...seat, ...updates } : seat
    );
    setMappedSeats(updatedSeats);
    form.setValue('seats', updatedSeats);
    drawSeatsOnCanvas();
  };

  const calculateStats = () => {
    const totalSeats = mappedSeats.filter(seat => !seat.isBlocked).length;
    const totalRevenue = mappedSeats
      .filter(seat => !seat.isBlocked)
      .reduce((sum, seat) => sum + seat.price, 0);
    
    const seatsByType = mappedSeats.reduce((acc, seat) => {
      if (!seat.isBlocked) {
        acc[seat.type] = (acc[seat.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<SeatType, number>);

    return { totalSeats, totalRevenue, seatsByType };
  };

  const onSubmit = async (data: ChartFormData) => {
    setIsLoading(true);
    
    try {
      console.log('💺 Saving seating chart:', data);
      
      // TODO: Implement backend integration
      // await SeatingChartService.saveSeatingChart(eventId, data);
      
      toast.success('Seating chart saved successfully!');
      navigate(`/organizer/event/${eventId}/seating`);
    } catch (error) {
      console.error('❌ Error saving seating chart:', error);
      toast.error('Failed to save seating chart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = calculateStats();

  // Convert mapped seats to InteractiveSeatingChart format
  const convertToInteractiveFormat = useMemo(() => {
    if (!uploadedImage || !imageSize.width || !imageSize.height) return { seats: [], priceCategories: [] };

    const seats = mappedSeats.map(seat => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      section: seat.section,
      x: (seat.x / imageSize.width) * 100, // Convert to percentage
      y: (seat.y / imageSize.height) * 100, // Convert to percentage
      price: seat.price,
      category: seat.type,
      categoryColor: seatTypeColors[seat.type],
      isADA: seat.isADA,
      status: seat.isBlocked ? 'sold' : 'available' as const
    }));

    const priceCategories = Object.entries(seatTypeColors).map(([type, color]) => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      price: seatTypePrices[type as SeatType],
      color,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} seating area`
    }));

    return { seats, priceCategories };
  }, [mappedSeats, uploadedImage, imageSize]);

  const handleSeatSelection = (selectedSeats: any[]) => {
    console.log('Selected seats:', selectedSeats);
  };

  const handlePurchaseClick = (selectedSeats: any[]) => {
    console.log('Purchase clicked for seats:', selectedSeats);
    toast.info('This is a preview - purchase functionality is disabled');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/organizer/event/${eventId}/seating`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Seating Chart Configuration</h1>
              <p className="text-muted-foreground">Upload and configure interactive seating charts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentTab('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Seating Chart Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalSeats}</div>
                <div className="text-sm text-muted-foreground">Total Seats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  ${stats.totalSeats > 0 ? (stats.totalRevenue / stats.totalSeats).toFixed(2) : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Object.keys(stats.seatsByType).length}</div>
                <div className="text-sm text-muted-foreground">Seat Types</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="upload" disabled={!uploadedImage}>Upload</TabsTrigger>
                <TabsTrigger value="map" disabled={!uploadedImage}>Map Seats</TabsTrigger>
                <TabsTrigger value="preview" disabled={mappedSeats.length === 0}>Preview</TabsTrigger>
              </TabsList>

              {/* Setup Tab */}
              <TabsContent value="setup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chart Setup</CardTitle>
                    <CardDescription>
                      Configure your seating chart name and upload your venue layout
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chart Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Main Venue Layout" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <Label>Upload Seating Chart</Label>
                      <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, or PDF up to 10MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chart Preview</CardTitle>
                    <CardDescription>
                      Review your uploaded chart and proceed to seat mapping
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uploadedImage && (
                      <div className="text-center space-y-4">
                        <img 
                          src={uploadedImage} 
                          alt="Seating chart"
                          className="max-w-full max-h-96 mx-auto border rounded-lg"
                        />
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Replace Chart
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setCurrentTab('map')}
                          >
                            Continue to Mapping
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Map Seats Tab */}
              <TabsContent value="map" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Interactive Seat Mapping</CardTitle>
                        <CardDescription>
                          Click on the chart to place seats. Select seat type before placing.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={isMapping ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsMapping(!isMapping)}
                        >
                          <MousePointer className="h-4 w-4 mr-2" />
                          {isMapping ? 'Stop Mapping' : 'Start Mapping'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Seat Type Selector */}
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <span className="font-medium">Selected Seat Type:</span>
                      <div className="flex items-center gap-2">
                        {Object.entries(seatTypeColors).map(([type, color]) => (
                          <button
                            key={type}
                            type="button"
                            className={`px-3 py-1 rounded-full text-sm border-2 ${
                              selectedSeatType === type 
                                ? 'border-primary' 
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color, color: 'white' }}
                            onClick={() => setSelectedSeatType(type as SeatType)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)} (${seatTypePrices[type as SeatType]})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Canvas */}
                    {uploadedImage && (
                      <div className="border rounded-lg overflow-hidden">
                        <canvas
                          ref={canvasRef}
                          width={800}
                          height={600}
                          className="w-full cursor-crosshair"
                          onClick={handleCanvasClick}
                          onLoad={drawSeatsOnCanvas}
                        />
                      </div>
                    )}

                    {/* Mapped Seats List */}
                    {mappedSeats.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Mapped Seats ({mappedSeats.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {mappedSeats.map((seat) => (
                              <div key={seat.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white"
                                    style={{ backgroundColor: seatTypeColors[seat.type] }}
                                  />
                                  <div className="text-sm">
                                    <div className="font-medium">Seat {seat.seatNumber}</div>
                                    <div className="text-muted-foreground">
                                      {seat.type} - ${seat.price}
                                      {seat.isADA && ' (ADA)'}
                                      {seat.isBlocked && ' (Blocked)'}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSeat(seat.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer-Facing Preview</CardTitle>
                    <CardDescription>
                      This is how customers will see and interact with your seating chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uploadedImage && mappedSeats.length > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Preview Mode - Seat selection is disabled for testing
                            </span>
                          </div>
                        </div>

                        <InteractiveSeatingChart
                          venueImageUrl={uploadedImage}
                          seats={convertToInteractiveFormat.seats}
                          priceCategories={convertToInteractiveFormat.priceCategories}
                          maxSeatsPerSelection={8}
                          onSeatSelection={handleSeatSelection}
                          onPurchaseClick={handlePurchaseClick}
                          showPricing={true}
                          className="border rounded-lg"
                        />
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Chart Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-2xl font-bold">{stats.totalSeats}</div>
                                <div className="text-muted-foreground">Total Seats</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  ${stats.totalRevenue.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">Revenue Potential</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  ${stats.totalSeats > 0 ? (stats.totalRevenue / stats.totalSeats).toFixed(2) : '0'}
                                </div>
                                <div className="text-muted-foreground">Avg. Price</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold">{Object.keys(stats.seatsByType).length}</div>
                                <div className="text-muted-foreground">Seat Types</div>
                              </div>
                            </div>
                            
                            {Object.keys(stats.seatsByType).length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(stats.seatsByType).map(([type, count]) => (
                                    <div key={type} className="flex justify-between">
                                      <span className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded-full border border-white"
                                          style={{ backgroundColor: seatTypeColors[type as SeatType] }}
                                        />
                                        {type.charAt(0).toUpperCase() + type.slice(1)}:
                                      </span>
                                      <span className="font-medium">{count} seats</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Upload a chart and map some seats to see the preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/organizer/event/${eventId}/seating`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Seating
              </Button>
              <div className="flex items-center gap-2">
                {mappedSeats.length > 0 && (
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Chart'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EventSeatingChartPage;