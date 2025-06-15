import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  User, 
  BarChart3, 
  ArrowLeft,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import QRScannerComponent from '@/components/checkin/QRScannerComponent';
import ManualCheckinComponent from '@/components/checkin/ManualCheckinComponent';
import AttendanceDashboard from '@/components/checkin/AttendanceDashboard';

interface CheckinManagementPageProps {}

export const CheckinManagementPage: React.FC<CheckinManagementPageProps> = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('scanner');
  const [staffId] = useState('staff_001'); // Mock staff ID - in real app, get from auth
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checkinCount, setCheckinCount] = useState(0);

  // Mock event data - in real implementation, fetch from API
  const eventData = {
    id: eventId || 'event_1',
    name: 'Advanced Yoga Workshop',
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'Downtown Yoga Studio',
    capacity: 50,
    ticketsSold: 42
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle check-in completion from child components
  const handleCheckinComplete = (success: boolean, result?: any) => {
    if (success) {
      setCheckinCount(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Event Check-in Management
              </h1>
              <p className="text-gray-600 mt-1">
                {eventData.name} • {eventData.date} at {eventData.time}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Online Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>

            {/* Staff Badge */}
            <Badge variant="outline">
              Staff: {staffId}
            </Badge>

            {/* Settings */}
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Event Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{eventData.capacity}</div>
                <div className="text-sm text-gray-600">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{eventData.ticketsSold}</div>
                <div className="text-sm text-gray-600">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{checkinCount}</div>
                <div className="text-sm text-gray-600">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {((checkinCount / eventData.ticketsSold) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Scanner
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Manual Check-in
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <QRScannerComponent
              eventId={eventData.id}
              staffId={staffId}
              onCheckinComplete={handleCheckinComplete}
            />
          </TabsContent>

          {/* Manual Check-in Tab */}
          <TabsContent value="manual" className="space-y-6">
            <ManualCheckinComponent
              eventId={eventData.id}
              staffId={staffId}
              onCheckinComplete={handleCheckinComplete}
            />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AttendanceDashboard
              eventId={eventData.id}
              eventName={eventData.name}
              autoRefresh={true}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats Footer */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>📍 {eventData.location}</span>
                <span>🕒 {eventData.time}</span>
                <span>🎫 Event ID: {eventData.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <RefreshCw className="h-3 w-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckinManagementPage; 