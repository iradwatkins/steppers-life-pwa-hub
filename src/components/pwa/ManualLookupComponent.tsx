import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Users, 
  Crown, 
  UserCheck, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { type AttendeeInfo } from '@/services/pwaCheckinService';

interface ManualLookupComponentProps {
  eventId: string;
  onCheckin: (attendee: AttendeeInfo) => Promise<boolean>;
  onGetCheckinStatus: (attendeeId: string) => Promise<any>;
  searchAttendees: (query: string) => Promise<AttendeeInfo[]>;
}

type SortBy = 'name' | 'email' | 'ticketType' | 'purchaseDate';
type SortOrder = 'asc' | 'desc';
type FilterBy = 'all' | 'vip' | 'general' | 'checkedIn' | 'notCheckedIn';

export const ManualLookupComponent: React.FC<ManualLookupComponentProps> = ({
  eventId,
  onCheckin,
  onGetCheckinStatus,
  searchAttendees
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AttendeeInfo[]>([]);
  const [checkinStatuses, setCheckinStatuses] = useState<Record<string, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchAttendees(searchQuery);
          setSearchResults(results);
          
          // Check check-in status for each result
          const statuses: Record<string, boolean> = {};
          for (const attendee of results) {
            const checkinRecord = await onGetCheckinStatus(attendee.id);
            statuses[attendee.id] = !!checkinRecord;
          }
          setCheckinStatuses(statuses);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setCheckinStatuses({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchAttendees, onGetCheckinStatus]);

  // Handle check-in
  const handleCheckin = async (attendee: AttendeeInfo) => {
    const success = await onCheckin(attendee);
    if (success) {
      // Update local check-in status
      setCheckinStatuses(prev => ({ ...prev, [attendee.id]: true }));
    }
  };

  // Filtered and sorted results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = searchResults;

    // Apply filters
    switch (filterBy) {
      case 'vip':
        filtered = filtered.filter(a => a.isVIP);
        break;
      case 'general':
        filtered = filtered.filter(a => !a.isVIP);
        break;
      case 'checkedIn':
        filtered = filtered.filter(a => checkinStatuses[a.id]);
        break;
      case 'notCheckedIn':
        filtered = filtered.filter(a => !checkinStatuses[a.id]);
        break;
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let valueA: string | Date;
      let valueB: string | Date;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'email':
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case 'ticketType':
          valueA = a.ticketType.toLowerCase();
          valueB = b.ticketType.toLowerCase();
          break;
        case 'purchaseDate':
          valueA = new Date(a.purchaseDate);
          valueB = new Date(b.purchaseDate);
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [searchResults, checkinStatuses, sortBy, sortOrder, filterBy]);

  // Get status color and icon
  const getStatusDisplay = (attendee: AttendeeInfo) => {
    const isCheckedIn = checkinStatuses[attendee.id];
    
    if (isCheckedIn) {
      return {
        icon: <UserCheck className="h-4 w-4 text-green-600" />,
        badge: <Badge variant="default" className="bg-green-500">Checked In</Badge>,
        disabled: true
      };
    }

    if (attendee.status === 'expired') {
      return {
        icon: <Clock className="h-4 w-4 text-orange-600" />,
        badge: <Badge variant="destructive">Expired</Badge>,
        disabled: true
      };
    }

    if (attendee.status === 'invalid') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        badge: <Badge variant="destructive">Invalid</Badge>,
        disabled: true
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
      badge: <Badge variant="outline">Ready</Badge>,
      disabled: false
    };
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Instructions */}
      {!searchQuery && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            Enter at least 2 characters to search for attendees by name, email, or phone number.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Sorting */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Search Results ({filteredAndSortedResults.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by:</label>
                  <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Attendees</SelectItem>
                      <SelectItem value="vip">VIP Only</SelectItem>
                      <SelectItem value="general">General Only</SelectItem>
                      <SelectItem value="checkedIn">Checked In</SelectItem>
                      <SelectItem value="notCheckedIn">Not Checked In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort by:</label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="ticketType">Ticket Type</SelectItem>
                        <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Search Results */}
      {filteredAndSortedResults.length > 0 && (
        <div className="space-y-3">
          {filteredAndSortedResults.map((attendee) => {
            const statusDisplay = getStatusDisplay(attendee);
            
            return (
              <Card key={attendee.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">{attendee.name}</h3>
                        {attendee.isVIP && (
                          <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                        {statusDisplay.icon}
                        {statusDisplay.badge}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{attendee.email}</span>
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{attendee.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Info */}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {attendee.ticketType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{attendee.ticketId}
                        </span>
                      </div>

                      {/* Special Notes */}
                      {attendee.specialNotes && (
                        <div className="mt-2">
                          <Alert className="py-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>Note:</strong> {attendee.specialNotes}
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="ml-4 flex-shrink-0">
                      <Button 
                        size="sm"
                        onClick={() => handleCheckin(attendee)}
                        disabled={statusDisplay.disabled}
                        className="min-w-[80px]"
                      >
                        {statusDisplay.disabled ? 'Done' : 'Check In'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {searchQuery.length >= 2 && filteredAndSortedResults.length === 0 && !isSearching && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No attendees found</h3>
          <p className="text-muted-foreground">
            No attendees match your search criteria for "{searchQuery}".
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  );
};