import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Zap, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { type AttendeeInfo } from '@/services/pwaCheckinService';

interface EmergencyOverrideComponentProps {
  isOnline: boolean;
  onEmergencyCheckin: (attendeeId: string, reason: string, type: string) => Promise<boolean>;
  onBulkCheckin: (attendeeIds: string[], reason: string) => Promise<number>;
  searchAttendees: (query: string) => Promise<AttendeeInfo[]>;
}

type EmergencyType = 'technical' | 'medical' | 'security' | 'weather' | 'other';

interface EmergencyScenario {
  id: EmergencyType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const emergencyScenarios: EmergencyScenario[] = [
  {
    id: 'technical',
    label: 'Technical Issues',
    description: 'QR scanner malfunction, system errors',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-orange-600'
  },
  {
    id: 'medical',
    label: 'Medical Emergency',
    description: 'Quick entry needed for medical reasons',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-red-600'
  },
  {
    id: 'security',
    label: 'Security Override',
    description: 'Security personnel authorization',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-blue-600'
  },
  {
    id: 'weather',
    label: 'Weather Emergency',
    description: 'Rapid entry due to weather conditions',
    icon: <Clock className="h-5 w-5" />,
    color: 'text-purple-600'
  },
  {
    id: 'other',
    label: 'Other Emergency',
    description: 'Custom emergency situation',
    icon: <Users className="h-5 w-5" />,
    color: 'text-gray-600'
  }
];

export const EmergencyOverrideComponent: React.FC<EmergencyOverrideComponentProps> = ({
  isOnline,
  onEmergencyCheckin,
  onBulkCheckin,
  searchAttendees
}) => {
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<EmergencyType>('technical');
  const [overrideReason, setOverrideReason] = useState('');
  const [attendeeQuery, setAttendeeQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AttendeeInfo[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle attendee search
  const handleAttendeeSearch = async (query: string) => {
    setAttendeeQuery(query);
    
    if (query.length >= 2) {
      try {
        const results = await searchAttendees(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        toast.error('Search failed');
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle single emergency check-in
  const handleSingleOverride = async () => {
    if (!attendeeQuery || !overrideReason.trim()) {
      toast.error('Please select an attendee and provide a reason');
      return;
    }

    const selectedAttendee = searchResults.find(a => 
      a.name.toLowerCase().includes(attendeeQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(attendeeQuery.toLowerCase())
    );

    if (!selectedAttendee) {
      toast.error('Please select a valid attendee from search results');
      return;
    }

    setIsProcessing(true);
    try {
      const scenario = emergencyScenarios.find(s => s.id === selectedScenario);
      const fullReason = `${scenario?.label}: ${overrideReason}`;
      
      const success = await onEmergencyCheckin(selectedAttendee.id, fullReason, selectedScenario);
      
      if (success) {
        toast.success(`Emergency check-in completed for ${selectedAttendee.name}`);
        resetOverrideForm();
        setIsOverrideDialogOpen(false);
      }
    } catch (error) {
      console.error('Emergency override failed:', error);
      toast.error('Emergency override failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk emergency check-in
  const handleBulkOverride = async () => {
    if (selectedAttendees.length === 0 || !overrideReason.trim()) {
      toast.error('Please select attendees and provide a reason');
      return;
    }

    setIsProcessing(true);
    try {
      const scenario = emergencyScenarios.find(s => s.id === selectedScenario);
      const fullReason = `BULK ${scenario?.label}: ${overrideReason}`;
      
      const successCount = await onBulkCheckin(selectedAttendees, fullReason);
      
      toast.success(`Emergency check-in completed for ${successCount} attendees`);
      resetBulkForm();
      setIsBulkDialogOpen(false);
    } catch (error) {
      console.error('Bulk emergency override failed:', error);
      toast.error('Bulk emergency override failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset forms
  const resetOverrideForm = () => {
    setOverrideReason('');
    setAttendeeQuery('');
    setSearchResults([]);
    setSelectedScenario('technical');
  };

  const resetBulkForm = () => {
    setOverrideReason('');
    setSelectedAttendees([]);
    setSearchResults([]);
    setSelectedScenario('technical');
  };

  // Toggle attendee selection for bulk
  const toggleAttendeeSelection = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Emergency Status Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Emergency Override Mode</strong>
          <br />
          Use these tools only in emergency situations or when normal check-in methods fail.
          All emergency actions are logged and require justification.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        {/* Single Emergency Override */}
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Single Emergency Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Override normal check-in process for individual attendees in emergency situations.
            </p>
            <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Shield className="h-4 w-4 mr-2" />
                  Emergency Override
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Emergency Check-in Override</DialogTitle>
                  <DialogDescription>
                    Complete emergency check-in for an attendee. This action will be logged.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Emergency Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Emergency Type</label>
                    <Select value={selectedScenario} onValueChange={(value: EmergencyType) => setSelectedScenario(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emergencyScenarios.map((scenario) => (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            <div className="flex items-center gap-2">
                              {scenario.icon}
                              <span>{scenario.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Attendee Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Find Attendee</label>
                    <Input
                      placeholder="Search by name or email..."
                      value={attendeeQuery}
                      onChange={(e) => handleAttendeeSearch(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {searchResults.slice(0, 5).map((attendee) => (
                          <div
                            key={attendee.id}
                            className="p-2 text-sm bg-muted rounded cursor-pointer hover:bg-muted/80"
                            onClick={() => setAttendeeQuery(attendee.name)}
                          >
                            <div className="font-medium">{attendee.name}</div>
                            <div className="text-muted-foreground">{attendee.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reason for Override</label>
                    <Textarea
                      placeholder="Describe the emergency situation requiring override..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Offline Warning */}
                  {!isOnline && (
                    <Alert>
                      <WifiOff className="h-4 w-4" />
                      <AlertDescription>
                        You're offline. This override will be queued and synced when connected.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSingleOverride}
                    disabled={isProcessing || !attendeeQuery || !overrideReason.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isProcessing ? 'Processing...' : 'Override Check-in'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Bulk Emergency Override */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Bulk Emergency Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check in multiple attendees at once during mass emergency situations.
            </p>
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Bulk Emergency Override
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Emergency Check-in</DialogTitle>
                  <DialogDescription>
                    Check in multiple attendees simultaneously. Use only in emergency situations.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Emergency Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Emergency Type</label>
                    <Select value={selectedScenario} onValueChange={(value: EmergencyType) => setSelectedScenario(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emergencyScenarios.map((scenario) => (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            <div className="flex items-center gap-2">
                              {scenario.icon}
                              <span>{scenario.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Attendee Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Attendees ({selectedAttendees.length} selected)
                    </label>
                    <Input
                      placeholder="Search attendees..."
                      onChange={(e) => handleAttendeeSearch(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border rounded p-2">
                        {searchResults.map((attendee) => (
                          <div
                            key={attendee.id}
                            className={`p-2 text-sm rounded cursor-pointer flex items-center justify-between ${
                              selectedAttendees.includes(attendee.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => toggleAttendeeSelection(attendee.id)}
                          >
                            <div>
                              <div className="font-medium">{attendee.name}</div>
                              <div className="text-xs opacity-70">{attendee.email}</div>
                            </div>
                            {selectedAttendees.includes(attendee.id) && (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Emergency Reason</label>
                    <Textarea
                      placeholder="Describe the emergency requiring bulk check-in..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkOverride}
                    disabled={isProcessing || selectedAttendees.length === 0 || !overrideReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? 'Processing...' : `Override ${selectedAttendees.length} Check-ins`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Offline Mode</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isOnline ? 'Real-time sync enabled' : 'Queued for sync'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">Logging Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All overrides are recorded
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};