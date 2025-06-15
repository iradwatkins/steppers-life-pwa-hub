import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { 
  ArrowUp, 
  ArrowDown, 
  Search, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Eye, 
  Ban, 
  Star, 
  XCircle 
} from 'lucide-react';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { AdminEvent } from '@/services/adminEventService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';

const EventOversightPage: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  const {
    events,
    totalEvents,
    loading,
    error,
    fetchEvents,
    currentPage,
    setPage,
    currentLimit,
    setLimit,
    currentSortBy,
    setSortBy,
    currentSortOrder,
    setSortOrder,
    currentQuery,
    setQuery,
    currentStatusFilter,
    setStatusFilter,
    currentCategoryFilter,
    setCategoryFilter,
    categories,
    currentDateRange,
    setDateRange,
  } = useAdminEvents();

  const totalPages = Math.ceil(totalEvents / currentLimit);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("You are not authorized to view this page.");
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleSort = (column: keyof AdminEvent) => {
    if (currentSortBy === column) {
      setSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); 
    }
  };

  const getSortIcon = (column: keyof AdminEvent) => {
    if (currentSortBy === column) {
      return currentSortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
    }
    return null;
  };

  const statusOptions: { value: AdminEvent['status'] | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'unpublished', label: 'Unpublished' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'removed', label: 'Removed' },
  ];

  const handleViewDetails = (eventId: string) => {
    toast.info(`Viewing details for event: ${eventId}`);
    // This will open a dialog or navigate to a detail page in Task 3
  };

  const handleFeatureToggle = (event: AdminEvent) => {
    toast.info(`Toggling feature status for event: ${event.name}`);
    // Logic to call adminEventService.featureEvent
  };

  const handleSuspendEvent = (eventId: string) => {
    toast.warning(`Suspending event: ${eventId}`);
    // Logic to call adminEventService.updateEventStatus
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-primary text-xl">Checking authorization...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirection is handled by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Event Oversight & Management</h1>
          <p className="text-lg text-muted-foreground">Centralized platform for overseeing and managing all events.</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Filter & Search Events</CardTitle>
            <Button variant="outline" onClick={() => fetchEvents()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event name, organizer, or location..."
                  className="pl-9"
                  value={currentQuery}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Select onValueChange={(value) => setStatusFilter(value as AdminEvent['status'] | '')} value={currentStatusFilter} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select onValueChange={(value) => setCategoryFilter(value)} value={currentCategoryFilter} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentDateRange?.from ? (
                      currentDateRange.to ? (
                        ` ${format(new Date(currentDateRange.from), "LLL dd, y")} - ${format(new Date(currentDateRange.to), "LLL dd, y")}`
                      ) : (
                        format(new Date(currentDateRange.from), "LLL dd, y")
                      )
                    ) : (
                      <span>Filter by Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={currentDateRange?.from ? new Date(currentDateRange.from) : new Date()}
                    selected={currentDateRange ? { from: new Date(currentDateRange.from!), to: new Date(currentDateRange.to!) } : undefined}
                    onSelect={(range) => setDateRange(range ? { from: format(range.from!, 'yyyy-MM-dd'), to: format(range.to!, 'yyyy-MM-dd') } : undefined)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Event List ({totalEvents} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-500 text-center py-4">
                Error: {error}
              </div>
            )}

            {loading && events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="mx-auto h-8 w-8 mb-4" />
                No events found matching your criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('name')}
                    >
                      Event Name {getSortIcon('name')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('organizerName')}
                    >
                      Organizer {getSortIcon('organizerName')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('category')}
                    >
                      Category {getSortIcon('category')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('date')}
                    >
                      Date {getSortIcon('date')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('ticketsSold')}
                    >
                      Sold {getSortIcon('ticketsSold')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('revenue')}
                    >
                      Revenue {getSortIcon('revenue')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground" 
                      onClick={() => handleSort('userReportsCount')}
                    >
                      Reports {getSortIcon('userReportsCount')}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.organizerName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={event.status === 'published' ? 'success' : event.status === 'suspended' ? 'destructive' : event.status === 'pending_approval' ? 'warning' : 'secondary'}
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.category}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.ticketsSold.toLocaleString()}</TableCell>
                      <TableCell>${event.revenue.toLocaleString()}</TableCell>
                      <TableCell className={event.userReportsCount > 0 ? 'text-red-500 font-semibold' : ''}>
                        {event.userReportsCount > 0 ? `${event.userReportsCount} warnings` : 'None'}
                      </TableCell>
                      <TableCell className="text-right flex space-x-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(event.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={event.isFeatured ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => handleFeatureToggle(event)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        {event.status === 'published' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleSuspendEvent(event.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {totalEvents > currentLimit && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationPrevious 
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setPage(i + 1)}
                        isActive={currentPage === i + 1}
                        disabled={loading}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationNext 
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  />
                </PaginationContent>
              </Pagination>
            )}

            <div className="flex items-center justify-end space-x-2 py-4">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select onValueChange={(value) => setLimit(Number(value))} value={String(currentLimit)} disabled={loading}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventOversightPage; 