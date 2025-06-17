import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  SortAsc
} from 'lucide-react';

interface ClaimableEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  startTime: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  capacity: string;
  ticketPrice: string;
  uploadedBy: 'admin' | 'system';
  uploadDate: string;
  potentialMatches: string[];
  isHighPriority?: boolean;
  status: 'unclaimed' | 'claimed' | 'pending_review';
}

interface ClaimRequest {
  eventId: string;
  reason: string;
  evidence: string;
  submittedAt: string;
}

const ClaimableEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<ClaimableEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ClaimableEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ClaimableEvent | null>(null);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [claimEvidence, setClaimEvidence] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'priority' | 'recent'>('all');

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const fetchClaimableEvents = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockEvents: ClaimableEvent[] = [
          {
            id: 'unclaimed_1',
            title: 'Chicago Stepping Summer Gala',
            description: 'Annual summer gala featuring live music and stepping competitions.',
            category: 'Chicago Stepping Social',
            startDate: '2024-08-15',
            startTime: '19:00',
            venue: 'Grand Ballroom',
            address: '456 Ballroom Ave',
            city: 'Chicago',
            state: 'IL',
            capacity: '200',
            ticketPrice: '65.00',
            uploadedBy: 'admin',
            uploadDate: '2024-06-01T10:00:00Z',
            potentialMatches: ['Chicago Stepping', 'Summer Gala', user?.firstName || ''],
            isHighPriority: true,
            status: 'unclaimed'
          },
          {
            id: 'unclaimed_2',
            title: 'Southside Stepping Workshop Series',
            description: 'Multi-week workshop series covering basic to advanced stepping techniques.',
            category: 'Workshop - Intermediate Stepping',
            startDate: '2024-07-20',
            startTime: '18:00',
            venue: 'Community Center',
            address: '789 Community St',
            city: 'Chicago',
            state: 'IL',
            capacity: '50',
            ticketPrice: '25.00',
            uploadedBy: 'admin',
            uploadDate: '2024-05-28T14:30:00Z',
            potentialMatches: ['Southside', 'Workshop'],
            status: 'unclaimed'
          },
          {
            id: 'unclaimed_3',
            title: 'Private Corporate Stepping Event',
            description: 'Corporate team building event with stepping instruction.',
            category: 'Private Event - Corporate',
            startDate: '2024-09-10',
            startTime: '17:00',
            venue: 'Corporate Center',
            address: '321 Business Blvd',
            city: 'Chicago',
            state: 'IL',
            capacity: '100',
            ticketPrice: '0.00',
            uploadedBy: 'system',
            uploadDate: '2024-06-10T09:15:00Z',
            potentialMatches: ['Corporate'],
            status: 'pending_review'
          }
        ];
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
        setIsLoading(false);
      }, 1000);
    };

    fetchClaimableEvents();
  }, [user]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'priority':
        filtered = filtered.filter(event => event.isHighPriority);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => 
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filter]);

  const handleClaimEvent = async () => {
    if (!selectedEvent || !claimReason.trim()) {
      toast.error('Please provide a reason for claiming this event');
      return;
    }

    try {
      // Mock API call to submit claim
      const claimRequest: ClaimRequest = {
        eventId: selectedEvent.id,
        reason: claimReason,
        evidence: claimEvidence,
        submittedAt: new Date().toISOString()
      };

      console.log('Claim Request:', claimRequest);

      // Update event status locally
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, status: 'pending_review' as const }
          : event
      ));

      toast.success('Claim request submitted successfully! You will be notified when it\'s reviewed.');
      handleCloseClaimDialog();
    } catch (error) {
      toast.error('Failed to submit claim request. Please try again.');
    }
  };

  const handleCloseClaimDialog = () => {
    setIsClaimDialogOpen(false);
    setSelectedEvent(null);
    setClaimReason('');
    setClaimEvidence('');
  };

  const getStatusColor = (status: ClaimableEvent['status']) => {
    switch (status) {
      case 'unclaimed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'claimed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ClaimableEvent['status']) => {
    switch (status) {
      case 'unclaimed':
        return <Flag className="h-4 w-4" />;
      case 'pending_review':
        return <Clock className="h-4 w-4" />;
      case 'claimed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Profile</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Claimable Events</h1>
              <p className="text-gray-600">Find and claim events that might belong to you</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events by title, venue, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All Events
                </Button>
                <Button
                  variant={filter === 'priority' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('priority')}
                >
                  High Priority
                </Button>
                <Button
                  variant={filter === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('recent')}
                >
                  Recent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Matches Alert */}
        {events.some(event => event.isHighPriority && event.potentialMatches.includes(user.firstName || '')) && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              We found events that might be yours based on your profile information. Check the high priority events below.
            </AlertDescription>
          </Alert>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Claimable Events Found
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.'
                  : 'There are currently no events available for claiming.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(filteredEvents || []).map((event) => (
              <Card key={event.id} className={`hover:shadow-md transition-shadow ${event.isHighPriority ? 'ring-2 ring-orange-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                            {event.isHighPriority && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                High Priority
                              </Badge>
                            )}
                            <Badge className={`flex items-center space-x-1 ${getStatusColor(event.status)}`}>
                              {getStatusIcon(event.status)}
                              <span className="capitalize">{event.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.startDate).toLocaleDateString()} at {event.startTime}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue}, {event.city}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{event.capacity} capacity</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span>${event.ticketPrice}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>Uploaded by {event.uploadedBy}</span>
                            <span>•</span>
                            <span>{new Date(event.uploadDate).toLocaleDateString()}</span>
                            {event.potentialMatches.length > 0 && (
                              <>
                                <span>•</span>
                                <span>Potential matches: {event.potentialMatches.join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                      
                      {event.status === 'unclaimed' && (
                        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              className="flex items-center space-x-2"
                              onClick={() => setSelectedEvent(event)}
                            >
                              <Flag className="h-4 w-4" />
                              <span>Claim Event</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Claim Event</DialogTitle>
                              <DialogDescription>
                                Tell us why this event belongs to you. Your request will be reviewed by our admin team.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Reason for claiming *</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="I am the original organizer of this event because..."
                                  value={claimReason}
                                  onChange={(e) => setClaimReason(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="evidence">Supporting evidence (optional)</Label>
                                <Textarea
                                  id="evidence"
                                  placeholder="Additional details, contact information, or links that support your claim..."
                                  value={claimEvidence}
                                  onChange={(e) => setClaimEvidence(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={handleCloseClaimDialog}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleClaimEvent}
                                disabled={!claimReason.trim()}
                              >
                                Submit Claim
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {event.status === 'pending_review' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Review Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimableEventsPage;