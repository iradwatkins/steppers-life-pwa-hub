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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Check,
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  History,
  Filter
} from 'lucide-react';

interface EventClaim {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  reason: string;
  evidence?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  priority: 'high' | 'medium' | 'low';
}

interface ClaimableEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  venue: string;
  city: string;
  state: string;
  uploadedBy: string;
  uploadDate: string;
  claimCount: number;
}

const EventClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claims, setClaims] = useState<EventClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<EventClaim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<EventClaim | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockClaims: EventClaim[] = [
          {
            id: 'claim_1',
            eventId: 'unclaimed_1',
            eventTitle: 'Chicago Stepping Summer Gala',
            eventDate: '2024-08-15',
            eventVenue: 'Grand Ballroom',
            claimantId: 'user_1',
            claimantName: 'Marcus Johnson',
            claimantEmail: 'marcus.johnson@email.com',
            claimantPhone: '(312) 555-0123',
            reason: 'I am the original organizer of this event. I have been running the Chicago Stepping Summer Gala for the past 5 years. This event was uploaded without my knowledge.',
            evidence: 'I have contracts with the venue, promotional materials from previous years, and social media posts documenting my involvement. I can provide receipts and vendor contacts as proof.',
            status: 'pending',
            submittedAt: '2024-06-15T10:30:00Z',
            priority: 'high'
          },
          {
            id: 'claim_2',
            eventId: 'unclaimed_2',
            eventTitle: 'Southside Stepping Workshop Series',
            eventDate: '2024-07-20',
            eventVenue: 'Community Center',
            claimantId: 'user_2',
            claimantName: 'Diana Williams',
            claimantEmail: 'diana.williams@email.com',
            reason: 'This is my workshop series that I run monthly. The event details match exactly with my planned workshop.',
            status: 'pending',
            submittedAt: '2024-06-14T14:45:00Z',
            priority: 'medium'
          },
          {
            id: 'claim_3',
            eventId: 'unclaimed_3',
            eventTitle: 'Private Corporate Stepping Event',
            eventDate: '2024-09-10',
            eventVenue: 'Corporate Center',
            claimantId: 'user_3',
            claimantName: 'Robert Davis',
            claimantEmail: 'robert.davis@email.com',
            reason: 'I was hired to organize this corporate event. I have the contract and communications with the client.',
            evidence: 'Contract dated June 1st, 2024, with ABC Corporation for team building stepping event.',
            status: 'approved',
            submittedAt: '2024-06-12T09:15:00Z',
            reviewedAt: '2024-06-13T11:30:00Z',
            reviewedBy: 'Admin User',
            reviewNotes: 'Verified contract and client communication. Claim approved.',
            priority: 'low'
          },
          {
            id: 'claim_4',
            eventId: 'unclaimed_4',
            eventTitle: 'Weekend Social Dance',
            eventDate: '2024-07-28',
            eventVenue: 'Dance Studio',
            claimantId: 'user_4',
            claimantName: 'Sarah Thompson',
            claimantEmail: 'sarah.thompson@email.com',
            reason: 'This looks like my event but I\'m not sure. The details are similar but not exact.',
            status: 'rejected',
            submittedAt: '2024-06-10T16:20:00Z',
            reviewedAt: '2024-06-11T10:15:00Z',
            reviewedBy: 'Admin User',
            reviewNotes: 'Insufficient evidence provided. Details do not match claimant\'s previous events.',
            priority: 'low'
          }
        ];
        setClaims(mockClaims);
        setFilteredClaims(mockClaims);
        setIsLoading(false);
      }, 1000);
    };

    fetchClaims();
  }, []);

  // Filter claims based on active tab and search
  useEffect(() => {
    let filtered = claims;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(claim => claim.status === activeTab);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(claim => 
        claim.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.eventVenue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClaims(filtered);
  }, [claims, activeTab, searchTerm]);

  const handleReviewClaim = async (action: 'approve' | 'reject') => {
    if (!selectedClaim) return;

    try {
      // Mock API call to review claim
      const updatedClaim: EventClaim = {
        ...selectedClaim,
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.firstName + ' ' + user?.lastName || 'Admin User',
        reviewNotes: reviewNotes || (action === 'approve' ? 'Claim approved' : 'Claim rejected')
      };

      // Update claims list
      setClaims(claims.map(claim => 
        claim.id === selectedClaim.id ? updatedClaim : claim
      ));

      toast.success(`Claim ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      if (action === 'approve') {
        toast.success('Event has been linked to the promoter\'s dashboard.');
      }

      handleCloseReviewDialog();
    } catch (error) {
      toast.error('Failed to review claim. Please try again.');
    }
  };

  const handleCloseReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setSelectedClaim(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  const getStatusColor = (status: EventClaim['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EventClaim['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: EventClaim['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getClaimStats = () => {
    const pending = claims.filter(claim => claim.status === 'pending').length;
    const approved = claims.filter(claim => claim.status === 'approved').length;
    const rejected = claims.filter(claim => claim.status === 'rejected').length;
    return { pending, approved, rejected, total: claims.length };
  };

  // Check if user has admin privileges (mock check)
  const isAdmin = user?.email?.includes('admin') || user?.firstName === 'Admin';

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. You need admin privileges to view this page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const stats = getClaimStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Claims Management</h1>
              <p className="text-gray-600">Review and manage event claiming requests</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Flag className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search claims by event title, claimant name, or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Claims Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Claims</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
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
            ) : filteredClaims.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Claims Found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Try adjusting your search terms.'
                      : `No ${activeTab === 'all' ? '' : activeTab} claims at this time.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredClaims.map((claim) => (
                  <Card key={claim.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">{claim.eventTitle}</h3>
                            <Badge className={`flex items-center space-x-1 ${getStatusColor(claim.status)}`}>
                              {getStatusIcon(claim.status)}
                              <span className="capitalize">{claim.status}</span>
                            </Badge>
                            <Badge className={`${getPriorityColor(claim.priority)}`}>
                              {claim.priority.charAt(0).toUpperCase() + claim.priority.slice(1)} Priority
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(claim.eventDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{claim.eventVenue}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>{claim.claimantName}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{claim.claimantEmail}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Claim Reason:</h4>
                            <p className="text-gray-700 text-sm">{claim.reason}</p>
                            {claim.evidence && (
                              <div className="mt-2">
                                <h5 className="font-medium text-gray-900 mb-1">Supporting Evidence:</h5>
                                <p className="text-gray-700 text-sm">{claim.evidence}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</span>
                            {claim.reviewedAt && (
                              <>
                                <span>•</span>
                                <span>Reviewed: {new Date(claim.reviewedAt).toLocaleDateString()}</span>
                                <span>by {claim.reviewedBy}</span>
                              </>
                            )}
                          </div>

                          {claim.reviewNotes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-1">Review Notes:</h5>
                              <p className="text-gray-700 text-sm">{claim.reviewNotes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Event</span>
                          </Button>
                          
                          {claim.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center space-x-2 text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedClaim(claim);
                                      setReviewAction('approve');
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                    <span>Approve</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {reviewAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {reviewAction === 'approve' 
                                        ? 'This will link the event to the claimant\'s dashboard and grant them organizer access.'
                                        : 'This will reject the claim and notify the claimant.'
                                      }
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="reviewNotes">Review Notes</Label>
                                      <Textarea
                                        id="reviewNotes"
                                        placeholder={reviewAction === 'approve' 
                                          ? 'Optional notes about the approval...'
                                          : 'Please provide a reason for rejection...'
                                        }
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={handleCloseReviewDialog}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => handleReviewClaim(reviewAction!)}
                                      className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                    >
                                      {reviewAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setReviewAction('reject');
                                  setIsReviewDialogOpen(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventClaimsPage;