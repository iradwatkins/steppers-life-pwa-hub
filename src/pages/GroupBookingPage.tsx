/**
 * Group Booking Management Page
 * Story B.013: Group Booking System - UI
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  GroupBookingService, 
  type GroupBookingRequest, 
  type GroupBooking,
  type GroupParticipant 
} from '@/services/groupBookingService';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Copy, 
  Mail, 
  Phone,
  Percent,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Plus,
  UserPlus
} from 'lucide-react';

const GroupBookingPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroupBooking, setCreatedGroupBooking] = useState<GroupBooking | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);

  // Form state for creating group booking
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    minTickets: 5,
    maxTickets: 20,
    ticketTypeId: 'general',
    discountPercentage: 0,
    deadlineDate: '',
    deadlineTime: '',
    isPublic: true,
    contactEmail: user?.email || '',
    contactPhone: '',
  });

  // Mock event data
  const mockEvent = {
    id: eventId || '1',
    title: 'Chicago Stepping Championship',
    date: 'December 15, 2024',
    time: '7:00 PM',
    location: 'Navy Pier Grand Ballroom',
    description: 'Join us for the most prestigious stepping competition in Chicago.',
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 45,
        available: 150
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 85,
        available: 25
      },
    ]
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // Set default deadline to 1 week from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);
    setFormData(prev => ({
      ...prev,
      deadlineDate: defaultDeadline.toISOString().split('T')[0],
      deadlineTime: '23:59',
    }));
  }, [user, navigate]);

  const handleCreateGroupBooking = async () => {
    if (!user || !eventId) return;

    // Validation
    if (!formData.groupName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a group name.",
        variant: "destructive"
      });
      return;
    }

    if (formData.minTickets >= formData.maxTickets) {
      toast({
        title: "Invalid Ticket Range",
        description: "Maximum tickets must be greater than minimum tickets.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const deadlineDateTime = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);
      
      const request: GroupBookingRequest = {
        eventId,
        organizerId: user.id,
        groupName: formData.groupName,
        description: formData.description,
        minTickets: formData.minTickets,
        maxTickets: formData.maxTickets,
        ticketTypeId: formData.ticketTypeId,
        discountPercentage: formData.discountPercentage,
        deadlineDate: deadlineDateTime,
        isPublic: formData.isPublic,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      };

      const result = await GroupBookingService.createGroupBooking(request);

      if (result.success && result.groupBooking) {
        setCreatedGroupBooking(result.groupBooking);
        setActiveTab('manage');
        
        toast({
          title: "Group Booking Created!",
          description: `Invite code: ${result.inviteCode}`,
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.errorMessage || "Failed to create group booking",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (!createdGroupBooking?.inviteCode) return;

    navigator.clipboard.writeText(createdGroupBooking.inviteCode);
    toast({
      title: "Code Copied",
      description: "Invite code copied to clipboard",
    });
  };

  const copyInviteLink = () => {
    if (!createdGroupBooking?.inviteCode) return;

    const link = `${window.location.origin}/group/join/${createdGroupBooking.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
    });
  };

  const shareGroup = async () => {
    if (!createdGroupBooking) return;

    const shareData = {
      title: `Join Group: ${createdGroupBooking.groupName}`,
      text: `Join my group booking for ${mockEvent.title}!`,
      url: `${window.location.origin}/group/join/${createdGroupBooking.inviteCode}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Invite link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing group:', error);
    }
  };

  const getSelectedTicketType = () => {
    return mockEvent.ticketTypes.find(tt => tt.id === formData.ticketTypeId);
  };

  const calculateDiscountedPrice = () => {
    const ticketType = getSelectedTicketType();
    if (!ticketType) return 0;
    
    const discount = (ticketType.price * formData.discountPercentage) / 100;
    return ticketType.price - discount;
  };

  const getProgressPercentage = () => {
    if (!createdGroupBooking) return 0;
    return Math.min((createdGroupBooking.totalTicketsReserved / createdGroupBooking.minTickets) * 100, 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-300">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-gray-600 border-gray-300">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Group Booking</h1>
              <p className="text-muted-foreground">
                Organize group ticket purchases with special pricing
              </p>
            </div>
          </div>
        </div>

        {/* Event Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{mockEvent.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {mockEvent.date}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {mockEvent.time}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {mockEvent.location}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Available Ticket Types:</h4>
                {mockEvent.ticketTypes.map(ticketType => (
                  <div key={ticketType.id} className="flex justify-between items-center">
                    <span>{ticketType.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">${ticketType.price}</Badge>
                      <Badge variant="secondary">{ticketType.available} available</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2" disabled={!createdGroupBooking}>
              <Users className="h-4 w-4" />
              Manage Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Group Booking</CardTitle>
                <CardDescription>
                  Set up a group booking to get better pricing and coordinate with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name *</Label>
                      <Input
                        id="groupName"
                        placeholder="Chicago Steppers Club"
                        value={formData.groupName}
                        onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ticketType">Ticket Type *</Label>
                      <Select
                        value={formData.ticketTypeId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, ticketTypeId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEvent.ticketTypes.map(ticketType => (
                            <SelectItem key={ticketType.id} value={ticketType.id}>
                              {ticketType.name} - ${ticketType.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your group and what makes it special..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Group Size & Pricing */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Group Size & Pricing</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minTickets">Minimum Tickets *</Label>
                      <Input
                        id="minTickets"
                        type="number"
                        min="2"
                        max="50"
                        value={formData.minTickets}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          minTickets: parseInt(e.target.value) || 2 
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxTickets">Maximum Tickets *</Label>
                      <Input
                        id="maxTickets"
                        type="number"
                        min="3"
                        max="50"
                        value={formData.maxTickets}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          maxTickets: parseInt(e.target.value) || 3 
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discount">Group Discount %</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          discountPercentage: parseInt(e.target.value) || 0 
                        }))}
                      />
                    </div>
                  </div>

                  {formData.discountPercentage > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900 dark:text-green-100">
                          Group Discount Applied
                        </span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Original price: ${getSelectedTicketType()?.price || 0} → 
                        Group price: ${calculateDiscountedPrice().toFixed(2)} 
                        (Save ${((getSelectedTicketType()?.price || 0) - calculateDiscountedPrice()).toFixed(2)} per ticket)
                      </p>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadlineDate">Deadline Date *</Label>
                      <Input
                        id="deadlineDate"
                        type="date"
                        value={formData.deadlineDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadlineDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deadlineTime">Deadline Time *</Label>
                      <Input
                        id="deadlineTime"
                        type="time"
                        value={formData.deadlineTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadlineTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic">Make this group publicly discoverable</Label>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateGroupBooking} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  Create Group Booking
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {createdGroupBooking && (
              <>
                {/* Group Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {createdGroupBooking.groupName}
                        </CardTitle>
                        <CardDescription>
                          Invite Code: <code className="font-mono font-semibold">{createdGroupBooking.inviteCode}</code>
                        </CardDescription>
                      </div>
                      {getStatusBadge(createdGroupBooking.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Group Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {createdGroupBooking.totalTicketsReserved} / {createdGroupBooking.minTickets} minimum
                        </span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {createdGroupBooking.totalTicketsReserved >= createdGroupBooking.minTickets 
                          ? "✅ Minimum requirement met!" 
                          : `${createdGroupBooking.minTickets - createdGroupBooking.totalTicketsReserved} more tickets needed`
                        }
                      </p>
                    </div>

                    {/* Group Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{createdGroupBooking.currentParticipants}</div>
                        <div className="text-xs text-muted-foreground">Participants</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{createdGroupBooking.totalTicketsReserved}</div>
                        <div className="text-xs text-muted-foreground">Tickets Reserved</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{createdGroupBooking.discountPercentage}%</div>
                        <div className="text-xs text-muted-foreground">Discount</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">
                          {Math.ceil((createdGroupBooking.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-xs text-muted-foreground">Days Left</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={copyInviteCode} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </Button>
                      <Button onClick={copyInviteLink} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                      <Button onClick={shareGroup} variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Participants ({participants.length})
                    </CardTitle>
                    <CardDescription>
                      Manage group members and their payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {participants.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">No participants yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Share your invite code or link to get people to join your group
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 font-mono text-center">
                          {createdGroupBooking.inviteCode}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {participants.map((participant) => (
                          <div key={participant.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{participant.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {participant.email}
                                  </span>
                                  {participant.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {participant.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {participant.ticketsRequested} tickets
                                </div>
                                <div className="flex gap-1">
                                  <Badge 
                                    variant={participant.status === 'confirmed' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {participant.status}
                                  </Badge>
                                  <Badge 
                                    variant={participant.paymentStatus === 'paid' ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {participant.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupBookingPage;