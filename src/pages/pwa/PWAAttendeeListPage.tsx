import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  CheckSquare, 
  Square, 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  DollarSign,
  RefreshCw,
  ChevronLeft,
  MoreVertical,
  Eye,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { usePWAAttendees } from '@/hooks/usePWAAttendees';
import { PWAAttendeeInfo } from '@/services/pwaAttendeeService';

interface AttendeeDetailModalProps {
  attendee: PWAAttendeeInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const AttendeeDetailModal: React.FC<AttendeeDetailModalProps> = ({ 
  attendee, 
  isOpen, 
  onClose 
}) => {
  if (!attendee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendee Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{attendee.name}</h3>
            <p className="text-sm text-gray-600">{attendee.email}</p>
            {attendee.phone && (
              <p className="text-sm text-gray-600">{attendee.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Ticket ID</p>
              <p className="text-sm">{attendee.ticketId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Ticket Type</p>
              <div className="flex items-center gap-1">
                <Badge variant={attendee.isVIP ? "default" : "secondary"}>
                  {attendee.ticketType}
                </Badge>
                {attendee.isVIP && <Crown className="h-3 w-3 text-yellow-500" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <Badge variant={attendee.checkedIn ? "default" : "secondary"}>
                {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Amount Paid</p>
              <p className="text-sm font-medium">
                ${attendee.totalPaid.toFixed(2)}
                {attendee.compTicket && (
                  <Badge variant="outline" className="ml-1 text-xs">COMP</Badge>
                )}
              </p>
            </div>
          </div>

          {attendee.checkedIn && (
            <div>
              <p className="text-xs font-medium text-gray-500">Check-in Details</p>
              <p className="text-sm">
                {attendee.checkinTimestamp && 
                  new Date(attendee.checkinTimestamp).toLocaleString()
                }
              </p>
              <p className="text-xs text-gray-500">
                Method: {attendee.checkinMethod} | Staff: {attendee.staffId}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500">Purchase Date</p>
            <p className="text-sm">
              {new Date(attendee.purchaseDate).toLocaleDateString()}
            </p>
          </div>

          {attendee.specialNotes && (
            <div>
              <p className="text-xs font-medium text-gray-500">Special Notes</p>
              <p className="text-sm">{attendee.specialNotes}</p>
            </div>
          )}

          {attendee.emergencyContact && (
            <div>
              <p className="text-xs font-medium text-gray-500">Emergency Contact</p>
              <p className="text-sm">{attendee.emergencyContact}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PWAAttendeeListPage: React.FC = () => {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const {
    filteredAttendees,
    selectedAttendees,
    isLoading,
    isOnline,
    lastSyncTime,
    stats,
    filters,
    sortOptions,
    searchAttendees,
    setFilters,
    setSortOptions,
    selectAllAttendees,
    clearSelection,
    toggleAttendeeSelection,
    bulkCheckin,
    exportAttendees,
    getAttendeeDetails,
    syncData,
    refreshData,
    getTicketTypes,
    isAttendeeSelected
  } = usePWAAttendees(eventId);

  const [selectedAttendeeDetails, setSelectedAttendeeDetails] = useState<PWAAttendeeInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAttendees(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, searchAttendees]);

  const handleAttendeeDetails = async (attendeeId: string) => {
    const attendee = await getAttendeeDetails(attendeeId);
    setSelectedAttendeeDetails(attendee);
    setIsDetailModalOpen(true);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    const fields = [
      'name', 'email', 'phone', 'ticketId', 'ticketType', 
      'checkedIn', 'checkinTimestamp', 'totalPaid'
    ];
    
    try {
      const exportData = await exportAttendees(format, fields);
      
      // Create download link
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendees-${eventId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const ticketTypes = getTicketTypes();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/pwa/dashboard/${eventId}`)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Attendee List</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {isOnline ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                  {lastSyncTime && (
                    <span>• Last sync: {lastSyncTime.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={syncData} disabled={!isOnline}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync with Server
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.checkedIn}</div>
              <div className="text-xs text-gray-500">Checked In</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{stats.notCheckedIn}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.vipCount}</div>
              <div className="text-xs text-gray-500">VIP</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.checkinStatus} 
                onValueChange={(value) => setFilters({ ...filters, checkinStatus: value as any })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.ticketType || 'all'} 
                onValueChange={(value) => setFilters({ 
                  ...filters, 
                  ticketType: value === 'all' ? undefined : value 
                })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ticketTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAttendees.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedAttendees.length} selected
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => bulkCheckin()}
                disabled={isLoading}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Check In
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-2 mt-4">
            {filteredAttendees.map((attendee) => (
              <Card key={attendee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAttendeeSelected(attendee.id)}
                      onCheckedChange={() => toggleAttendeeSelection(attendee.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{attendee.name}</h3>
                            {attendee.isVIP && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{attendee.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={attendee.checkedIn ? "default" : "secondary"} className="text-xs">
                              {attendee.checkedIn ? 'Checked In' : 'Pending'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {attendee.ticketType}
                            </Badge>
                            {attendee.compTicket && (
                              <Badge variant="outline" className="text-xs">COMP</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">${attendee.totalPaid.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAttendeeDetails(attendee.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="grid" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAttendees.map((attendee) => (
                <Card key={attendee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Checkbox
                        checked={isAttendeeSelected(attendee.id)}
                        onCheckedChange={() => toggleAttendeeSelection(attendee.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAttendeeDetails(attendee.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{attendee.name}</h3>
                        {attendee.isVIP && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">{attendee.email}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={attendee.checkedIn ? "default" : "secondary"} className="text-xs">
                          {attendee.checkedIn ? 'Checked In' : 'Pending'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {attendee.ticketType}
                        </Badge>
                        {attendee.compTicket && (
                          <Badge variant="outline" className="text-xs">COMP</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium">${attendee.totalPaid.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredAttendees.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No attendees found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Attendee Detail Modal */}
      <AttendeeDetailModal
        attendee={selectedAttendeeDetails}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default PWAAttendeeListPage;