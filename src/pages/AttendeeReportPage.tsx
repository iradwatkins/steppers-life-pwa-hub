import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAttendeeReport } from '@/hooks/useAttendeeReport';
import { AttendeeInfo } from '@/services/attendeeReportService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Search,
  Filter,
  Users, 
  UserCheck,
  UserX,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const AttendeeReportPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeInfo | null>(null);
  const [bulkNotes, setBulkNotes] = useState('');
  const [exportFields, setExportFields] = useState<string[]>([
    'firstName', 'lastName', 'email', 'ticketType', 'checkInStatus'
  ]);

  const {
    attendees,
    analytics,
    loading,
    error,
    filters,
    setFilters,
    selectedAttendees,
    setSelectedAttendees,
    selectAll,
    clearSelection,
    refreshData,
    exportData,
    executeBulkOperation,
    updateAttendeeNotes,
    checkInAttendee,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    paginatedAttendees,
    sortField,
    sortDirection,
    setSorting,
    lastRefresh
  } = useAttendeeReport(eventId!);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error || 'Failed to load attendee report data'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSort = (field: keyof AttendeeInfo) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSorting(field, newDirection);
  };

  const handleAttendeeSelect = (attendeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedAttendees);
    if (checked) {
      newSelected.add(attendeeId);
    } else {
      newSelected.delete(attendeeId);
    }
    setSelectedAttendees(newSelected);
  };

  const getStatusBadge = (status: AttendeeInfo['checkInStatus']) => {
    switch (status) {
      case 'checked_in':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Checked In</Badge>;
      case 'no_show':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />No Show</Badge>;
      default:
        return <Badge variant="secondary"><Calendar className="h-3 w-3 mr-1" />Not Checked In</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Attendee Report</h1>
            <p className="text-muted-foreground">
              Manage and analyze event attendees
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportData('csv', exportFields)}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('excel', exportFields)}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('pdf', exportFields)}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Attendee List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAttendees}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.vipCount} VIP attendees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checked In</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.checkedInCount}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.checkInRate.toFixed(1)}% check-in rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Shows</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.noShowCount}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalAttendees > 0 ? ((analytics.noShowCount / analytics.totalAttendees) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${analytics.averageTicketPrice.toFixed(2)} average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Name, email, phone..."
                        value={filters.searchTerm || ''}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Check-in Status</Label>
                    <Select 
                      value={filters.checkInStatus || 'all'} 
                      onValueChange={(value) => setFilters({ ...filters, checkInStatus: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ticket Type</Label>
                    <Select 
                      value={filters.ticketType || 'all'} 
                      onValueChange={(value) => setFilters({ ...filters, ticketType: value === 'all' ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {analytics.ticketTypeDistribution.map(type => (
                          <SelectItem key={type.type} value={type.type}>{type.type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>VIP Status</Label>
                    <Select 
                      value={filters.vipStatus?.toString() || 'all'} 
                      onValueChange={(value) => setFilters({ ...filters, vipStatus: value === 'all' ? undefined : value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">VIP Only</SelectItem>
                        <SelectItem value="false">Non-VIP Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk Actions */}
          {selectedAttendees.size > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {selectedAttendees.size} attendees selected
                    </span>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Bulk Check-in
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Check-in</DialogTitle>
                          <DialogDescription>
                            Check in {selectedAttendees.size} selected attendees?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => executeBulkOperation({
                              type: 'check_in',
                              attendeeIds: Array.from(selectedAttendees)
                            })}
                          >
                            Confirm Check-in
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Add Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Notes to Selected Attendees</DialogTitle>
                          <DialogDescription>
                            Add notes to {selectedAttendees.size} selected attendees
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Enter notes..."
                            value={bulkNotes}
                            onChange={(e) => setBulkNotes(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                executeBulkOperation({
                                  type: 'add_note',
                                  attendeeIds: Array.from(selectedAttendees),
                                  data: { note: bulkNotes }
                                });
                                setBulkNotes('');
                              }}
                            >
                              Add Notes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendee Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendees ({attendees.length})</CardTitle>
                  <CardDescription>Manage and view attendee information</CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedAttendees.size === paginatedAttendees.length && paginatedAttendees.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll();
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                  <Label className="text-sm">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-12">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('firstName')}>
                        <div className="flex items-center gap-1">
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('email')}>
                        <div className="flex items-center gap-1">
                          Email
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('ticketType')}>
                        <div className="flex items-center gap-1">
                          Ticket Type
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('checkInStatus')}>
                        <div className="flex items-center gap-1">
                          Status
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('totalPaid')}>
                        <div className="flex items-center justify-end gap-1">
                          Amount
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAttendees.map((attendee) => (
                      <tr key={attendee.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <Checkbox
                            checked={selectedAttendees.has(attendee.id)}
                            onCheckedChange={(checked) => handleAttendeeSelect(attendee.id, checked as boolean)}
                          />
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{attendee.firstName} {attendee.lastName}</div>
                            {attendee.vipStatus && <Badge variant="outline" className="text-xs">VIP</Badge>}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {attendee.email}
                          </div>
                          {attendee.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {attendee.phone}
                            </div>
                          )}
                        </td>
                        <td className="p-2">{attendee.ticketType}</td>
                        <td className="p-2">{getStatusBadge(attendee.checkInStatus)}</td>
                        <td className="text-right p-2">${attendee.totalPaid.toFixed(2)}</td>
                        <td className="text-center p-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedAttendee(attendee)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {attendee.checkInStatus === 'not_checked_in' && (
                                <DropdownMenuItem onClick={() => checkInAttendee(attendee.id)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Check In
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAttendeeSelect(attendee.id, true)}>
                                <Checkbox className="h-4 w-4 mr-2" />
                                Select
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, attendees.length)} to {Math.min(currentPage * pageSize, attendees.length)} of {attendees.length} results
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Timeline</CardTitle>
                <CardDescription>Daily registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.registrationTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="registrations" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ticket Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Distribution</CardTitle>
                <CardDescription>Breakdown by ticket category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.ticketTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.ticketTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Attendee locations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.geographicBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Payment method breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.paymentMethodBreakdown.map((method, index) => (
                    <div key={method.method} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{method.count} tickets</div>
                        <div className="text-sm text-muted-foreground">
                          ${method.totalAmount.toFixed(2)} ({method.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Attendee Details Dialog */}
      <Dialog open={!!selectedAttendee} onOpenChange={() => setSelectedAttendee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p>{selectedAttendee.firstName} {selectedAttendee.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p>{selectedAttendee.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p>{selectedAttendee.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ticket Type</Label>
                  <p>{selectedAttendee.ticketType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Purchase Date</Label>
                  <p>{new Date(selectedAttendee.purchaseDate).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount Paid</Label>
                  <p>${selectedAttendee.totalPaid.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="capitalize">{selectedAttendee.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Check-in Status</Label>
                  <div>{getStatusBadge(selectedAttendee.checkInStatus)}</div>
                </div>
              </div>
              
              {selectedAttendee.specialRequests && (
                <div>
                  <Label className="text-sm font-medium">Special Requests</Label>
                  <p className="mt-1">{selectedAttendee.specialRequests}</p>
                </div>
              )}
              
              {selectedAttendee.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="mt-1">{selectedAttendee.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendeeReportPage;