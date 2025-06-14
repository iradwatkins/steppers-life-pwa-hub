import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Upload,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  Eye,
  ArrowLeft,
  Save,
  Map,
  Users,
  DollarSign,
  Settings,
  MousePointer,
  CheckCircle,
  AlertTriangle,
  Wheelchair
} from 'lucide-react';

interface SeatMapping {
  id: string;
  x: number;
  y: number;
  seatNumber: string;
  section: string;
  price: number;
  isADA: boolean;
  isBlocked: boolean;
}

const seatMappingSchema = z.object({
  seatNumber: z.string().min(1, 'Seat number is required'),
  section: z.string().min(1, 'Section is required'),
  price: z.string().min(1, 'Price is required'),
  isADA: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
});

const chartFormSchema = z.object({
  eventId: z.string(),
  chartName: z.string().min(1, 'Chart name is required'),
  venue: z.string().min(1, 'Venue name is required'),
  totalCapacity: z.string().min(1, 'Total capacity is required'),
});

type ChartFormData = z.infer<typeof chartFormSchema>;
type SeatMappingData = z.infer<typeof seatMappingSchema>;

const EventSeatingChartPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedChart, setUploadedChart] = useState<string | null>(null);
  const [seatMappings, setSeatMappings] = useState<SeatMapping[]>([]);
  const [selectedSeatType, setSelectedSeatType] = useState<'regular' | 'premium' | 'vip' | 'ada'>('regular');
  const [isMapping, setIsMapping] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatMapping | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChartFormData>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: {
      eventId: eventId || '',
      chartName: '',
      venue: '',
      totalCapacity: '',
    }
  });

  const seatForm = useForm<SeatMappingData>({
    resolver: zodResolver(seatMappingSchema),
    defaultValues: {
      seatNumber: '',
      section: '',
      price: '',
      isADA: false,
      isBlocked: false,
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (!eventId) {
      navigate('/dashboard');
    }
  }, [user, eventId, navigate]);

  const seatTypeConfig = {
    regular: { color: '#3b82f6', price: '45', label: 'Regular' },
    premium: { color: '#f59e0b', price: '65', label: 'Premium' },
    vip: { color: '#ef4444', price: '95', label: 'VIP' },
    ada: { color: '#10b981', price: '45', label: 'ADA' }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or PDF file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedChart(e.target?.result as string);
      toast.success('Seating chart uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMapping) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - panOffset.x) / zoomLevel;
    const y = (event.clientY - rect.top - panOffset.y) / zoomLevel;

    const newSeat: SeatMapping = {
      id: `seat_${Date.now()}`,
      x,
      y,
      seatNumber: `${selectedSeatType.toUpperCase()}-${seatMappings.length + 1}`,
      section: selectedSeatType.toUpperCase(),
      price: parseFloat(seatTypeConfig[selectedSeatType].price),
      isADA: selectedSeatType === 'ada',
      isBlocked: false,
    };

    setSeatMappings(prev => [...prev, newSeat]);
  };

  const removeSeat = (seatId: string) => {
    setSeatMappings(prev => prev.filter(seat => seat.id !== seatId));
    setSelectedSeat(null);
  };

  const updateSeat = (seatId: string, updates: Partial<SeatMapping>) => {
    setSeatMappings(prev => 
      prev.map(seat => seat.id === seatId ? { ...seat, ...updates } : seat)
    );
  };

  const calculateStats = () => {
    const totalSeats = seatMappings.length;
    const adaSeats = seatMappings.filter(seat => seat.isADA).length;
    const blockedSeats = seatMappings.filter(seat => seat.isBlocked).length;
    const availableSeats = totalSeats - blockedSeats;
    const totalRevenue = seatMappings.reduce((sum, seat) => sum + (seat.isBlocked ? 0 : seat.price), 0);

    return { totalSeats, adaSeats, blockedSeats, availableSeats, totalRevenue };
  };

  const onSubmit = async (data: ChartFormData) => {
    if (!uploadedChart) {
      toast.error('Please upload a seating chart first');
      return;
    }

    if (seatMappings.length === 0) {
      toast.error('Please map at least one seat on the chart');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock API call - in real app would save to backend
      console.log('Chart Data:', { ...data, seatMappings, chartImage: uploadedChart });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Seating chart configuration saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save seating chart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = calculateStats();

  if (!user || !eventId) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Configure Seating Chart</h1>
          <p className="text-muted-foreground">Upload your venue seating chart and map individual seats</p>
        </div>

        {/* Stats Dashboard */}
        {seatMappings.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seating Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSeats}</div>
                  <div className="text-sm text-muted-foreground">Total Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.availableSeats}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.adaSeats}</div>
                  <div className="text-sm text-muted-foreground">ADA Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.blockedSeats}</div>
                  <div className="text-sm text-muted-foreground">Blocked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">${stats.totalRevenue}</div>
                  <div className="text-sm text-muted-foreground">Potential Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="upload">Upload Chart</TabsTrigger>
                <TabsTrigger value="mapping">Map Seats</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Setup Tab */}
              <TabsContent value="setup">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Chart Information
                    </CardTitle>
                    <CardDescription>
                      Basic information about your seating chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="chartName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chart Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Main Hall Seating Chart" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venue Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Navy Pier Grand Ballroom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="totalCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Venue Capacity *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Seating Chart
                    </CardTitle>
                    <CardDescription>
                      Upload your venue seating chart (PNG, JPG, or PDF - Max 10MB)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!uploadedChart ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                        <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <div className="text-lg font-medium mb-2">Upload Seating Chart</div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Drag and drop your chart here, or click to browse
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button type="button" onClick={() => fileInputRef.current?.click()}>
                          Choose File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Chart uploaded successfully</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setUploadedChart(null);
                              setSeatMappings([]);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={uploadedChart}
                            alt="Uploaded seating chart"
                            className="w-full max-h-96 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mapping Tab */}
              <TabsContent value="mapping">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Seat Type Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seat Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(seatTypeConfig).map(([type, config]) => (
                        <Button
                          key={type}
                          type="button"
                          variant={selectedSeatType === type ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedSeatType(type as any)}
                        >
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: config.color }}
                          />
                          {config.label} (${config.price})
                          {type === 'ada' && <Wheelchair className="h-4 w-4 ml-2" />}
                        </Button>
                      ))}
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant={isMapping ? "destructive" : "default"}
                          className="w-full"
                          onClick={() => setIsMapping(!isMapping)}
                        >
                          <MousePointer className="h-4 w-4 mr-2" />
                          {isMapping ? 'Stop Mapping' : 'Start Mapping'}
                        </Button>
                        
                        {isMapping && (
                          <div className="text-sm text-muted-foreground text-center">
                            Click on the chart to place seats
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chart Canvas */}
                  <div className="lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Map className="h-5 w-5" />
                          Interactive Chart Mapping
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm">
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {uploadedChart ? (
                          <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                            <div className="relative">
                              <img
                                src={uploadedChart}
                                alt="Seating chart for mapping"
                                className="w-full max-h-96 object-contain"
                              />
                              <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full cursor-crosshair"
                                onClick={handleCanvasClick}
                                style={{ 
                                  cursor: isMapping ? 'crosshair' : 'default',
                                  pointerEvents: isMapping ? 'auto' : 'none'
                                }}
                              />
                              {/* Render seat mappings */}
                              {seatMappings.map((seat) => (
                                <div
                                  key={seat.id}
                                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-2 hover:scale-125 transition-transform"
                                  style={{
                                    left: `${seat.x}px`,
                                    top: `${seat.y}px`,
                                    backgroundColor: seat.isBlocked ? '#6b7280' : seatTypeConfig[seat.isADA ? 'ada' : 'regular'].color
                                  }}
                                  onClick={() => setSelectedSeat(seat)}
                                  title={`${seat.seatNumber} - $${seat.price}`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <div className="text-muted-foreground">Upload a chart to start mapping seats</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Seat List */}
                {seatMappings.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Mapped Seats ({seatMappings.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {seatMappings.map((seat) => (
                            <div
                              key={seat.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: seat.isBlocked ? '#6b7280' : seatTypeConfig[seat.isADA ? 'ada' : 'regular'].color }}
                                />
                                <span className="text-sm font-medium">{seat.seatNumber}</span>
                                <span className="text-sm text-muted-foreground">${seat.price}</span>
                                {seat.isADA && <Wheelchair className="h-3 w-3" />}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSeat(seat.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Customer Preview
                    </CardTitle>
                    <CardDescription>
                      How customers will see and interact with your seating chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uploadedChart && seatMappings.length > 0 ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">Select Your Seats</h3>
                          <p className="text-sm text-muted-foreground">Click on available seats to select them</p>
                        </div>
                        <div className="relative border rounded-lg overflow-hidden">
                          <img
                            src={uploadedChart}
                            alt="Customer view seating chart"
                            className="w-full max-h-96 object-contain"
                          />
                          {seatMappings.map((seat) => (
                            <div
                              key={seat.id}
                              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-2 hover:scale-125 transition-transform"
                              style={{
                                left: `${seat.x}px`,
                                top: `${seat.y}px`,
                                backgroundColor: seat.isBlocked ? '#6b7280' : '#10b981'
                              }}
                              title={`Seat ${seat.seatNumber} - $${seat.price}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Selected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span>Unavailable</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <div className="text-muted-foreground">Complete chart upload and seat mapping to preview</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !uploadedChart || seatMappings.length === 0} className="bg-stepping-gradient">
                {isSubmitting ? (
                  <>Saving Chart...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Seating Chart
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EventSeatingChartPage;