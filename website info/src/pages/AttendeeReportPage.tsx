import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Mail,
  Tag,
  Star,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  MapPin,
  Phone,
  Eye,
  Edit,
  X,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { toast } from 'sonner';
import { useAttendeeReport } from '../hooks/useAttendeeReport';
import { AttendeeProfile, AttendeeFilters, AttendeeSort } from '../services/attendeeReportService';

const AttendeeReportPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  // Hook for attendee management
  const {
    attendees,
    analytics,
    selectedAttendee,
    activities,
    loading,
    error,
    selectedAttendeeIds,
    filters,
    sort,
    page,
    totalPages,
    total,
    exporting,
    exportProgress,
    hasSelection,
    isAllSelected,
    hasFilters,
    
    // Actions
    loadAttendeeDetails,
    loadAttendeeActivities,
    updateAttendee,
    setFilters,
    clearFilters,
    setSort,
    setSearch,
    setPage,
    selectAll,
    clearSelection,
    toggleAttendeeSelection,
    addTagToSelected,
    removeTagFromSelected,
    addNoteToSelected,
    setVipStatusForSelected,
    exportAttendees,
    exportSelected,
    clearError,
    refresh
  } = useAttendeeReport(eventId);

  // Local state
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showAttendeeDetail, setShowAttendeeDetail] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [bulkTag, setBulkTag] = useState('');
  const [bulkNote, setBulkNote] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTicketTypes, setFilterTicketTypes] = useState<string[]>([]);
  const [filterCheckInStatus, setFilterCheckInStatus] = useState<string[]>([]);
  const [filterVipStatus, setFilterVipStatus] = useState<boolean | undefined>();
  const [filterDateRange, setFilterDateRange] = useState<{ start: Date; end: Date } | undefined>();
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);

  useEffect(() => {
    if (!eventId) {
      navigate('/organizer/events');
      return;
    }
  }, [eventId, navigate]);

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, setSearch]);

  // Handle filter changes
  useEffect(() => {
    const newFilters: AttendeeFilters = {};
    
    if (filterTicketTypes.length > 0) newFilters.ticketTypeIds = filterTicketTypes;
    if (filterCheckInStatus.length > 0) newFilters.checkInStatus = filterCheckInStatus as any;
    if (filterVipStatus !== undefined) newFilters.vipStatus = filterVipStatus;
    if (filterDateRange) newFilters.purchaseDateRange = filterDateRange;
    if (filterTags.length > 0) newFilters.tags = filterTags;
    if (filterSource.length > 0) newFilters.source = filterSource;

    setFilters(newFilters);
  }, [filterTicketTypes, filterCheckInStatus, filterVipStatus, filterDateRange, filterTags, filterSource, setFilters]);

  // Get unique values for filter options
  const uniqueTicketTypes = Array.from(new Set(attendees.map(a => a.ticketType.id)));
  const uniqueTags = Array.from(new Set(attendees.flatMap(a => a.tags || [])));
  const uniqueSources = Array.from(new Set(attendees.map(a => a.source).filter(Boolean)));

  const handleAttendeeClick = async (attendee: AttendeeProfile) => {
    await loadAttendeeDetails(attendee.id);
    await loadAttendeeActivities(attendee.id);
    setShowAttendeeDetail(true);
  };

  const handleSort = (field: AttendeeSort['field']) => {
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field, direction });
  };

  const handleBulkAddTag = async () => {
    if (bulkTag.trim()) {
      await addTagToSelected(bulkTag.trim());
      setBulkTag('');
      setShowBulkActions(false);
      toast.success(`Tag "${bulkTag}" added to ${selectedAttendeeIds.length} attendees`);
    }
  };

  const handleBulkAddNote = async () => {
    if (bulkNote.trim()) {
      await addNoteToSelected(bulkNote.trim());
      setBulkNote('');
      setShowBulkActions(false);
      toast.success(`Note added to ${selectedAttendeeIds.length} attendees`);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!eventId) return;
    
    await exportAttendees(eventId, {
      format,
      fields: ['firstName', 'lastName', 'email', 'phone', 'ticketType', 'purchaseDate', 'checkInStatus', 'vipStatus'],
      filters,
      includeCustomResponses: true,
      includeNotes: true
    });
    
    setShowExportDialog(false);
    toast.success(`Attendee data exported as ${format.toUpperCase()}`);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterTicketTypes([]);
    setFilterCheckInStatus([]);
    setFilterVipStatus(undefined);
    setFilterDateRange(undefined);
    setFilterTags([]);
    setFilterSource([]);
    clearFilters();
  };

  const getStatusBadge = (status: AttendeeProfile['checkInStatus']) => {
    switch (status) {
      case 'checked_in':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Checked In</Badge>;
      case 'no_show':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />No Show</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Not Checked In</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Attendees</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={clearError} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendee Report</h1>
          <p className="text-gray-600 mt-1">
            Manage and analyze your event attendees
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Attendee Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export {total} attendees (filtered) to your preferred format.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => handleExport('csv')} disabled={exporting}>
                    CSV
                  </Button>
                  <Button onClick={() => handleExport('excel')} disabled={exporting}>
                    Excel
                  </Button>
                  <Button onClick={() => handleExport('pdf')} disabled={exporting}>
                    PDF
                  </Button>
                </div>
                {exporting && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Attendees</p>
                  <p className="text-2xl font-bold">{analytics.totalAttendees}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Checked In</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.checkedInCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">No Shows</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.noShowCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">VIP Attendees</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.vipCount}</p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search attendees by name, email, phone, or ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={hasFilters ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasFilters && <Badge variant="secondary" className="ml-2">{Object.keys(filters).length}</Badge>}
              </Button>
              
              {hasFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Ticket Type Filter */}
                <div>
                  <Label>Ticket Types</Label>
                  <Select
                    value={filterTicketTypes.join(',')}
                    onValueChange={(value) => setFilterTicketTypes(value ? value.split(',') : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ticket types" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTicketTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Check-in Status Filter */}
                <div>
                  <Label>Check-in Status</Label>
                  <Select
                    value={filterCheckInStatus.join(',')}
                    onValueChange={(value) => setFilterCheckInStatus(value ? value.split(',') : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* VIP Status Filter */}
                <div>
                  <Label>VIP Status</Label>
                  <Select
                    value={filterVipStatus?.toString() || ''}
                    onValueChange={(value) => setFilterVipStatus(value === 'true' ? true : value === 'false' ? false : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All attendees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">VIP Only</SelectItem>
                      <SelectItem value="false">Non-VIP Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <Label>Purchase Date Range</Label>
                <DatePickerWithRange
                  dateRange={filterDateRange}
                  onDateRangeChange={setFilterDateRange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {hasSelection && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {selectedAttendeeIds.length} selected
                </Badge>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Tag className="w-4 h-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Actions ({selectedAttendeeIds.length} attendees)</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="tag">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="tag">Add Tag</TabsTrigger>
                        <TabsTrigger value="note">Add Note</TabsTrigger>
                        <TabsTrigger value="vip">VIP Status</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="tag" className="space-y-4">
                        <div>
                          <Label htmlFor="bulk-tag">Tag Name</Label>
                          <Input
                            id="bulk-tag"
                            value={bulkTag}
                            onChange={(e) => setBulkTag(e.target.value)}
                            placeholder="Enter tag name"
                          />
                        </div>
                        <Button onClick={handleBulkAddTag} disabled={!bulkTag.trim()}>
                          Add Tag to Selected
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="note" className="space-y-4">
                        <div>
                          <Label htmlFor="bulk-note">Note</Label>
                          <Textarea
                            id="bulk-note"
                            value={bulkNote}
                            onChange={(e) => setBulkNote(e.target.value)}
                            placeholder="Enter note for selected attendees"
                          />
                        </div>
                        <Button onClick={handleBulkAddNote} disabled={!bulkNote.trim()}>
                          Add Note to Selected
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="vip" className="space-y-4">
                        <div className="flex gap-2">
                          <Button onClick={() => setVipStatusForSelected(true)}>
                            Set as VIP
                          </Button>
                          <Button variant="outline" onClick={() => setVipStatusForSelected(false)}>
                            Remove VIP
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportSelected(eventId!, 'csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendee List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Attendees ({total})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
              />
              <Label className="text-sm">Select All</Label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendees...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
              <p className="text-gray-600">
                {hasFilters ? 'Try adjusting your filters or search terms.' : 'No attendees have registered for this event yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
                      />
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('firstName')}
                    >
                      Name {sort.field === 'firstName' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('email')}
                    >
                      Email {sort.field === 'email' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('ticketType')}
                    >
                      Ticket Type {sort.field === 'ticketType' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('purchaseDate')}
                    >
                      Purchase Date {sort.field === 'purchaseDate' && (sort.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedAttendeeIds.includes(attendee.id)}
                          onCheckedChange={() => toggleAttendeeSelection(attendee.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {attendee.firstName} {attendee.lastName}
                            </p>
                            {attendee.vipStatus && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{attendee.email}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {attendee.ticketType.name}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {attendee.purchaseDate.toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(attendee.checkInStatus)}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAttendeeClick(attendee)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} attendees
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendee Detail Dialog */}
      <Dialog open={showAttendeeDetail} onOpenChange={setShowAttendeeDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAttendee ? `${selectedAttendee.firstName} ${selectedAttendee.lastName}` : 'Attendee Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAttendee && (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedAttendee.email}</span>
                      </div>
                      {selectedAttendee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{selectedAttendee.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Registered: {selectedAttendee.registrationDate.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ticket Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Ticket Type</Label>
                        <Badge variant="outline" className="ml-2">
                          {selectedAttendee.ticketType.name}
                        </Badge>
                      </div>
                      <div>
                        <Label>Order Number</Label>
                        <p className="font-mono text-sm">{selectedAttendee.orderNumber}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedAttendee.checkInStatus)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {selectedAttendee.specialRequests && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Special Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedAttendee.specialRequests}</p>
                    </CardContent>
                  </Card>
                )}
                
                {selectedAttendee.tags && selectedAttendee.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedAttendee.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.length === 0 ? (
                      <p className="text-gray-600">No activity recorded</p>
                    ) : (
                      <div className="space-y-3">
                        {activities.map(activity => (
                          <div key={activity.id} className="flex gap-3 border-l-2 border-gray-200 pl-4 pb-3">
                            <div className="flex-1">
                              <p className="font-medium">{activity.description}</p>
                              <p className="text-sm text-gray-600">
                                {activity.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Organizer Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedAttendee.organizerNotes || ''}
                      onChange={(e) => updateAttendee(selectedAttendee.id, { organizerNotes: e.target.value })}
                      placeholder="Add notes about this attendee..."
                      rows={6}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendeeReportPage; 