import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  User, 
  UserCheck, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import useCheckin from '@/hooks/useCheckin';

interface ManualCheckinComponentProps {
  eventId: string;
  staffId: string;
  onCheckinComplete?: (success: boolean, result?: any) => void;
}

interface GuestListEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ticketType: string;
  isVIP: boolean;
  isCheckedIn: boolean;
  checkinTime?: Date;
  notes?: string;
  specialRequests?: string[];
}

export const ManualCheckinComponent: React.FC<ManualCheckinComponentProps> = ({
  eventId,
  staffId,
  onCheckinComplete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<GuestListEntry | null>(null);
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [guestList, setGuestList] = useState<GuestListEntry[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<GuestListEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  const {
    manualCheckinByName,
    isLoading,
    offlineMode
  } = useCheckin({ eventId });

  // Mock guest list data - in real implementation, this would come from the backend
  useEffect(() => {
    const mockGuestList: GuestListEntry[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        ticketType: 'VIP',
        isVIP: true,
        isCheckedIn: false,
        specialRequests: ['Wheelchair accessibility', 'Vegetarian meal']
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        ticketType: 'General Admission',
        isVIP: false,
        isCheckedIn: false
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        ticketType: 'Student',
        isVIP: false,
        isCheckedIn: true,
        checkinTime: new Date(Date.now() - 3600000), // 1 hour ago
        notes: 'Early arrival'
      },
      {
        id: '4',
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@example.com',
        phone: '+1-555-0104',
        ticketType: 'VIP',
        isVIP: true,
        isCheckedIn: false,
        specialRequests: ['Plus one guest', 'Media photographer']
      },
      {
        id: '5',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@example.com',
        ticketType: 'General Admission',
        isVIP: false,
        isCheckedIn: false
      }
    ];
    
    setGuestList(mockGuestList);
    setFilteredGuests(mockGuestList);
  }, []);

  // Filter guest list based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGuests(guestList);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = guestList.filter(guest => 
        guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.phone && guest.phone.includes(searchTerm))
      );
      setFilteredGuests(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, guestList]);

  // Handle guest selection
  const handleSelectGuest = (guest: GuestListEntry) => {
    setSelectedGuest(guest);
    setSearchTerm(`${guest.firstName} ${guest.lastName}`);
  };

  // Process manual check-in
  const handleManualCheckin = async () => {
    if (!selectedGuest) return;

    try {
      const success = await manualCheckinByName(
        selectedGuest.firstName,
        selectedGuest.lastName,
        staffId,
        notes
      );

      if (success) {
        // Update guest list to reflect check-in
        setGuestList(prev => prev.map(guest => 
          guest.id === selectedGuest.id 
            ? { ...guest, isCheckedIn: true, checkinTime: new Date(), notes }
            : guest
        ));
        
        // Reset form
        setSelectedGuest(null);
        setSearchTerm('');
        setNotes('');
        
        onCheckinComplete?.(true, selectedGuest);
      } else {
        onCheckinComplete?.(false);
      }
    } catch (error) {
      console.error('Manual check-in error:', error);
      onCheckinComplete?.(false);
    }
  };

  // Quick stats
  const totalGuests = guestList.length;
  const checkedInCount = guestList.filter(g => g.isCheckedIn).length;
  const vipCount = guestList.filter(g => g.isVIP && !g.isCheckedIn).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manual Check-in
            {offlineMode && (
              <Badge variant="outline" className="ml-auto">
                Offline Mode
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalGuests}</div>
              <div className="text-sm text-muted-foreground">Total Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{checkedInCount}</div>
              <div className="text-sm text-muted-foreground">Checked In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vipCount}</div>
              <div className="text-sm text-muted-foreground">VIP Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Guest Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone number..."
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <ScrollArea className="h-64 w-full border rounded-md">
            <div className="p-4 space-y-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => handleSelectGuest(guest)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedGuest?.id === guest.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    } ${guest.isCheckedIn ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {guest.isCheckedIn ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </p>
                            {guest.isVIP && (
                              <Badge variant="outline" className="text-xs">
                                VIP
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {guest.email}
                          </p>
                          {guest.phone && (
                            <p className="text-xs text-muted-foreground">
                              {guest.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={guest.isCheckedIn ? "default" : "outline"}>
                          {guest.ticketType}
                        </Badge>
                        {guest.isCheckedIn && guest.checkinTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {guest.checkinTime.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Special Requests */}
                    {guest.specialRequests && guest.specialRequests.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Special Requests:</span>
                        </div>
                        <div className="mt-1">
                          {guest.specialRequests.map((request, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                              {request}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No guests found</p>
                  <p className="text-xs">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Guest Check-in */}
      {selectedGuest && !selectedGuest.isCheckedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Check-in: {selectedGuest.firstName} {selectedGuest.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guest Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedGuest.email}</span>
                </div>
                {selectedGuest.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedGuest.phone}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedGuest.isVIP ? "default" : "outline"}>
                    {selectedGuest.ticketType}
                  </Badge>
                  {selectedGuest.isVIP && (
                    <Badge variant="outline" className="text-xs">VIP</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requests Alert */}
            {selectedGuest.specialRequests && selectedGuest.specialRequests.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Special Requests:</div>
                  <div className="space-y-1">
                    {selectedGuest.specialRequests.map((request, index) => (
                      <div key={index} className="text-sm">• {request}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Notes Input */}
            <div className="space-y-2">
              <Label htmlFor="check-in-notes">Check-in Notes (Optional)</Label>
              <Textarea
                id="check-in-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this check-in..."
                rows={3}
              />
            </div>

            {/* Check-in Button */}
            <Button 
              onClick={handleManualCheckin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Complete Check-in
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Already Checked In Message */}
      {selectedGuest && selectedGuest.isCheckedIn && (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Already Checked In</div>
                <div className="text-sm mt-1">
                  {selectedGuest.firstName} {selectedGuest.lastName} was checked in at{' '}
                  {selectedGuest.checkinTime?.toLocaleString()}
                </div>
                {selectedGuest.notes && (
                  <div className="text-sm mt-2 p-2 bg-muted rounded">
                    <div className="font-medium">Notes:</div>
                    {selectedGuest.notes}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">View All VIPs</div>
              </div>
            </Button>
            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">Recent Check-ins</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualCheckinComponent; 