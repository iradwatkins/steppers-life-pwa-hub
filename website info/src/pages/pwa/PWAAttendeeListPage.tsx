import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  Crown, 
  MoreVertical, 
  Download, 
  CheckSquare, 
  Square,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { usePWAAttendees } from '@/hooks/usePWAAttendees';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { PWAAttendeeInfo, AttendeeFilterOptions } from '@/services/pwaAttendeeService';

const PWAAttendeeListPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = usePWAAuth();

  // PWA Attendee hook
  const {
    attendees,
    metadata,
    selectedAttendees,
    loading,
    error,
    searchQuery,
    filters,
    isOffline,
    lastSync,
    searchAttendees,
    setFilters,
    selectAttendee,
    deselectAttendee,
    selectAllAttendees,
    clearSelection,
    toggleAttendeeSelection,
    checkInAttendee,
    performBulkOperation,
    exportAttendeeList,
    refreshData,
    getAttendeeById,
    getCheckedInCount,
    getVIPCount,
    getCapacityUtilization
  } = usePWAAttendees(eventId);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttendeeDetails, setSelectedAttendeeDetails] = useState<PWAAttendeeInfo | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionNotes, setBulkActionNotes] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter state
  const [localFilters, setLocalFilters] = useState<AttendeeFilterOptions>({
    checkinStatus: 'all',
    ticketType: 'all',
    isVIP: undefined,
    specialRequests: false
  });

  // Apply filters when they change
  useEffect(() => {
    setFilters(localFilters);
  }, [localFilters, setFilters]);

  // Handle search
  const handleSearch = (query: string) => {
    searchAttendees(query);
  };

  // Handle attendee selection
  const handleAttendeeClick = (attendee: PWAAttendeeInfo) => {
    setSelectedAttendeeDetails(attendee);
  };

  // Handle bulk check-in
  const handleBulkCheckIn = async () => {
    if (selectedAttendees.length === 0) return;

    const result = await performBulkOperation({
      type: 'checkin',
      attendeeIds: selectedAttendees,
      data: {
        staffId: user?.id || 'staff',
        notes: bulkActionNotes || 'Bulk check-in operation'
      }
    });

    if (result) {
      clearSelection();
      setBulkActionNotes('');
      setShowBulkActions(false);
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'json') => {
    await exportAttendeeList(format);
  };

  // Handle individual check-in
  const handleIndividualCheckIn = async (attendeeId: string) => {
    const result = await checkInAttendee(
      attendeeId,
      user?.id || 'staff',
      'Manual check-in from attendee list'
    );

    if (result) {
      // Close details dialog if it's the attendee we just checked in
      if (selectedAttendeeDetails?.attendeeId === attendeeId) {
        setSelectedAttendeeDetails(null);
      }
    }
  };

  // Get ticket types for filter
  const ticketTypes = [...new Set(attendees.map(a => a.ticketInfo.ticketType))];

  // Format time for display
  const formatTime = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">No event ID provided</p>
          <Button onClick={() => navigate('/pwa/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/pwa/dashboard')}
                className="p-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Attendee List</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Offline indicator */}
              {isOffline ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : (
                <Wifi className="h-4 w-4 text-green-500" />
              )}
              
              {/* Refresh button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData}
                disabled={loading}
                className="p-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Export menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats row */}
          {metadata && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">{metadata.totalAttendees}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">{getCheckedInCount()}</div>
                <div className="text-xs text-gray-500">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-purple-600">{getVIPCount()}</div>
                <div className="text-xs text-gray-500">VIP</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600">{getCapacityUtilization().toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Capacity</div>
              </div>
            </div>
          )}

          {/* Search and filter row */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 border-blue-300' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>

            {/* Select all / bulk actions */}
            {selectedAttendees.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBulkActions(true)}
              >
                {selectedAttendees.length} Selected
              </Button>
            )}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Select 
                  value={localFilters.checkinStatus || 'all'} 
                  onValueChange={(value) => setLocalFilters(prev => ({ 
                    ...prev, 
                    checkinStatus: value as 'all' | 'checked_in' | 'not_checked_in'
                  }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={localFilters.ticketType || 'all'} 
                  onValueChange={(value) => setLocalFilters(prev => ({ 
                    ...prev, 
                    ticketType: value === 'all' ? undefined : value
                  }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Ticket Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {ticketTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={localFilters.isVIP === true}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({ 
                      ...prev, 
                      isVIP: checked ? true : undefined
                    }))}
                  />
                  <span className="text-sm">VIP Only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={localFilters.specialRequests === true}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({ 
                      ...prev, 
                      specialRequests: checked || false
                    }))}
                  />
                  <span className="text-sm">Special Requests</span>
                </label>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocalFilters({
                    checkinStatus: 'all',
                    ticketType: 'all',
                    isVIP: undefined,
                    specialRequests: false
                  })}
                >
                  Clear Filters
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Hide Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && attendees.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-600">Loading attendees...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Attendees</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => refreshData()}>Try Again</Button>
          </div>
        ) : attendees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendees Found</h3>
            <p className="text-gray-600">No attendees match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Select all option */}
            {attendees.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedAttendees.length === attendees.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllAttendees();
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                  <span className="text-sm font-medium">
                    Select All ({attendees.length})
                  </span>
                </label>

                {selectedAttendees.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedAttendees.length} selected
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Attendee list */}
            {attendees.map((attendee) => (
              <AttendeeCard
                key={attendee.attendeeId}
                attendee={attendee}
                isSelected={selectedAttendees.includes(attendee.attendeeId)}
                onSelect={() => toggleAttendeeSelection(attendee.attendeeId)}
                onClick={() => handleAttendeeClick(attendee)}
                onCheckIn={() => handleIndividualCheckIn(attendee.attendeeId)}
              />
            ))}
          </div>
        )}

        {/* Last sync indicator */}
        {lastSync && (
          <div className="text-center mt-4 text-xs text-gray-500">
            Last synced: {formatTime(lastSync)}
          </div>
        )}
      </div>

      {/* Attendee Details Dialog */}
      <Dialog 
        open={!!selectedAttendeeDetails} 
        onOpenChange={() => setSelectedAttendeeDetails(null)}
      >
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
          </DialogHeader>
          
          {selectedAttendeeDetails && (
            <AttendeeDetailsContent 
              attendee={selectedAttendeeDetails}
              onCheckIn={() => handleIndividualCheckIn(selectedAttendeeDetails.attendeeId)}
              onClose={() => setSelectedAttendeeDetails(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog 
        open={showBulkActions} 
        onOpenChange={setShowBulkActions}
      >
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {selectedAttendees.length} attendees selected
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Notes (optional):
                </label>
                <Textarea
                  value={bulkActionNotes}
                  onChange={(e) => setBulkActionNotes(e.target.value)}
                  placeholder="Add notes for this bulk operation..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleBulkCheckIn}
                className="flex-1"
                disabled={loading}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Check In All
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowBulkActions(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Attendee Card Component
interface AttendeeCardProps {
  attendee: PWAAttendeeInfo;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onCheckIn: () => void;
}

const AttendeeCard: React.FC<AttendeeCardProps> = ({
  attendee,
  isSelected,
  onSelect,
  onClick,
  onCheckIn
}) => {
  return (
    <div 
      className={`bg-white rounded-lg border p-3 ${
        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Selection checkbox */}
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Avatar / Initial */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {attendee.firstName.charAt(0)}{attendee.lastName.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {attendee.firstName} {attendee.lastName}
              </h3>
              
              {/* Status badges */}
              {attendee.isVIP && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
              
              {attendee.isCheckedIn ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Checked In
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-300 text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>

            {/* Check-in button */}
            {!attendee.isCheckedIn && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckIn();
                }}
                className="ml-2"
              >
                <UserCheck className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="mt-1 space-y-1">
            <p className="text-xs text-gray-600 truncate">
              {attendee.ticketInfo.ticketType} • {attendee.email}
            </p>
            
            {attendee.isCheckedIn && attendee.checkinTime && (
              <p className="text-xs text-green-600">
                Checked in at {new Date(attendee.checkinTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Attendee Details Content Component
interface AttendeeDetailsContentProps {
  attendee: PWAAttendeeInfo;
  onCheckIn: () => void;
  onClose: () => void;
}

const AttendeeDetailsContent: React.FC<AttendeeDetailsContentProps> = ({
  attendee,
  onCheckIn,
  onClose
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg mx-auto mb-3">
          {attendee.firstName.charAt(0)}{attendee.lastName.charAt(0)}
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {attendee.firstName} {attendee.lastName}
        </h3>
        <div className="flex items-center justify-center space-x-2 mt-2">
          {attendee.isVIP && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Crown className="h-3 w-3 mr-1" />
              VIP
            </Badge>
          )}
          
          {attendee.isCheckedIn ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Checked In
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{attendee.email}</span>
        </div>
        
        {attendee.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{attendee.phone}</span>
          </div>
        )}
      </div>

      {/* Ticket Information */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Ticket Information</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Type: {attendee.ticketInfo.ticketType}</div>
          <div>ID: {attendee.ticketInfo.ticketId}</div>
          <div>Price: ${attendee.ticketInfo.price}</div>
          <div>Purchased: {new Date(attendee.purchaseDate).toLocaleDateString()}</div>
          {attendee.ticketInfo.seatNumber && (
            <div>Seat: {attendee.ticketInfo.seatNumber}</div>
          )}
        </div>
      </div>

      {/* Check-in Information */}
      {attendee.isCheckedIn && attendee.checkinTime && (
        <div className="bg-green-50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium text-green-900">Check-in Details</h4>
          <div className="space-y-1 text-sm text-green-700">
            <div>Time: {new Date(attendee.checkinTime).toLocaleString()}</div>
            <div>Method: {attendee.checkinMethod}</div>
            {attendee.notes && <div>Notes: {attendee.notes}</div>}
          </div>
        </div>
      )}

      {/* Special Requirements */}
      {(attendee.specialRequests || attendee.accessibilityNeeds || attendee.dietaryRestrictions) && (
        <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium text-yellow-900">Special Requirements</h4>
          <div className="space-y-1 text-sm text-yellow-700">
            {attendee.specialRequests && (
              <div>Requests: {attendee.specialRequests.join(', ')}</div>
            )}
            {attendee.accessibilityNeeds && (
              <div>Accessibility: {attendee.accessibilityNeeds.join(', ')}</div>
            )}
            {attendee.dietaryRestrictions && (
              <div>Dietary: {attendee.dietaryRestrictions.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        {!attendee.isCheckedIn ? (
          <Button onClick={onCheckIn} className="flex-1">
            <UserCheck className="h-4 w-4 mr-2" />
            Check In
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            <Check className="h-4 w-4 mr-2" />
            Already Checked In
          </Button>
        )}
        
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default PWAAttendeeListPage; 