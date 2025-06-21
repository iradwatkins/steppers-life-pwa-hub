/**
 * Ticket Transfer Management Page
 * Story B.012: Ticket Transfer System - UI
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  TicketTransferService, 
  type TransferRequest, 
  type TicketTransfer 
} from '@/services/ticketTransferService';
import { 
  Send, 
  Link2, 
  Copy, 
  QrCode, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  Share2,
  Mail,
  Loader2
} from 'lucide-react';

const TicketTransferPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('direct');
  const [isLoading, setIsLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<TicketTransfer[]>([]);

  // Direct transfer form state
  const [directTransfer, setDirectTransfer] = useState({
    toEmail: '',
    toName: '',
    transferMessage: '',
  });

  // Link transfer state
  const [transferLink, setTransferLink] = useState<{
    linkCode?: string;
    expiresAt?: Date;
    maxUses: number;
    expiryHours: number;
  }>({
    maxUses: 1,
    expiryHours: 168, // 7 days
  });

  // Mock ticket data
  const mockTicket = {
    id: ticketId || '1',
    eventTitle: 'Chicago Stepping Championship',
    eventDate: 'December 15, 2024',
    eventTime: '7:00 PM',
    venue: 'Navy Pier Grand Ballroom',
    ticketType: 'General Admission',
    price: '$45.00',
    attendeeName: 'John Smith',
    orderNumber: 'SL123456',
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    loadTransferHistory();
  }, [user, navigate]);

  const loadTransferHistory = async () => {
    if (!user) return;
    
    try {
      const history = await TicketTransferService.getUserTransferHistory(user.id);
      setTransferHistory(history);
    } catch (error) {
      console.error('Error loading transfer history:', error);
    }
  };

  const handleDirectTransfer = async () => {
    if (!user || !ticketId) return;

    if (!directTransfer.toEmail || !directTransfer.toName) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient email and name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const request: TransferRequest = {
        ticketId,
        fromUserId: user.id,
        toEmail: directTransfer.toEmail,
        toName: directTransfer.toName,
        transferMessage: directTransfer.transferMessage,
        transferType: 'direct',
      };

      const result = await TicketTransferService.initiateDirectTransfer(request);

      if (result.success) {
        toast({
          title: "Transfer Initiated",
          description: `Transfer code ${result.transferCode} sent to ${directTransfer.toEmail}`,
        });
        
        // Reset form
        setDirectTransfer({
          toEmail: '',
          toName: '',
          transferMessage: '',
        });
        
        loadTransferHistory();
      } else {
        toast({
          title: "Transfer Failed",
          description: result.errorMessage || "Failed to initiate transfer",
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

  const handleCreateTransferLink = async () => {
    if (!user || !ticketId) return;

    setIsLoading(true);

    try {
      const result = await TicketTransferService.createTransferLink(
        ticketId,
        user.id,
        transferLink.maxUses,
        transferLink.expiryHours
      );

      if (result.success) {
        setTransferLink(prev => ({
          ...prev,
          linkCode: result.linkCode,
          expiresAt: result.expiresAt,
        }));

        toast({
          title: "Transfer Link Created",
          description: "Your transfer link is ready to share",
        });
      } else {
        toast({
          title: "Link Creation Failed",
          description: result.errorMessage || "Failed to create transfer link",
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

  const copyTransferLink = () => {
    if (!transferLink.linkCode) return;

    const link = `${window.location.origin}/transfer/claim/${transferLink.linkCode}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link Copied",
      description: "Transfer link copied to clipboard",
    });
  };

  const shareTransferLink = async () => {
    if (!transferLink.linkCode) return;

    const link = `${window.location.origin}/transfer/claim/${transferLink.linkCode}`;
    const shareData = {
      title: `Ticket Transfer - ${mockTicket.eventTitle}`,
      text: `I'm transferring my ticket to ${mockTicket.eventTitle}. Use this link to claim it.`,
      url: link,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link Copied",
          description: "Transfer link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing transfer link:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-300">Completed</Badge>;
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
              <h1 className="text-3xl font-bold">Transfer Ticket</h1>
              <p className="text-muted-foreground">
                Transfer your ticket to someone else safely and securely
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{mockTicket.eventTitle}</h3>
                  <p className="text-muted-foreground">
                    {mockTicket.eventDate} at {mockTicket.eventTime}
                  </p>
                  <p className="text-muted-foreground">{mockTicket.venue}</p>
                </div>
                
                <div className="flex gap-4">
                  <Badge variant="secondary">{mockTicket.ticketType}</Badge>
                  <Badge variant="outline">{mockTicket.price}</Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-medium">{mockTicket.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Holder:</span>
                  <span className="font-medium">{mockTicket.attendeeName}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Transfer Methods</CardTitle>
            <CardDescription>
              Choose how you'd like to transfer your ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Direct Transfer
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Transfer Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="space-y-6">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Send the ticket directly to someone's email address. They'll receive a transfer code to claim the ticket.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="toEmail">Recipient Email *</Label>
                      <Input
                        id="toEmail"
                        type="email"
                        placeholder="recipient@example.com"
                        value={directTransfer.toEmail}
                        onChange={(e) => setDirectTransfer(prev => ({ ...prev, toEmail: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="toName">Recipient Name *</Label>
                      <Input
                        id="toName"
                        placeholder="John Doe"
                        value={directTransfer.toName}
                        onChange={(e) => setDirectTransfer(prev => ({ ...prev, toName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferMessage">Message (Optional)</Label>
                    <Textarea
                      id="transferMessage"
                      placeholder="Add a personal message to the recipient..."
                      value={directTransfer.transferMessage}
                      onChange={(e) => setDirectTransfer(prev => ({ ...prev, transferMessage: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleDirectTransfer} 
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Transfer
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="link" className="space-y-6">
                <Alert>
                  <Share2 className="h-4 w-4" />
                  <AlertDescription>
                    Create a transfer link that anyone can use to claim the ticket. Perfect for sharing on social media or messaging apps.
                  </AlertDescription>
                </Alert>

                {!transferLink.linkCode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxUses">Maximum Uses</Label>
                        <Input
                          id="maxUses"
                          type="number"
                          min="1"
                          max="10"
                          value={transferLink.maxUses}
                          onChange={(e) => setTransferLink(prev => ({ 
                            ...prev, 
                            maxUses: parseInt(e.target.value) || 1 
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          How many people can use this link
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiryHours">Expires After (Hours)</Label>
                        <Input
                          id="expiryHours"
                          type="number"
                          min="1"
                          max="720"
                          value={transferLink.expiryHours}
                          onChange={(e) => setTransferLink(prev => ({ 
                            ...prev, 
                            expiryHours: parseInt(e.target.value) || 168 
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Link will expire after this many hours
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateTransferLink}
                      disabled={isLoading}
                      className="w-full md:w-auto"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4 mr-2" />
                      )}
                      Create Transfer Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900 dark:text-green-100">
                          Transfer Link Created
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-900 border rounded p-3 font-mono text-sm break-all">
                          {`${window.location.origin}/transfer/claim/${transferLink.linkCode}`}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={copyTransferLink} variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </Button>
                          <Button onClick={shareTransferLink} variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>
                            <Clock className="h-4 w-4 inline mr-1" />
                            Expires: {transferLink.expiresAt?.toLocaleDateString()} at {transferLink.expiresAt?.toLocaleTimeString()}
                          </p>
                          <p>
                            <Users className="h-4 w-4 inline mr-1" />
                            Maximum uses: {transferLink.maxUses}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transfer History */}
        {transferHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>
                Previous transfer attempts for this ticket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transfer.toName}</span>
                        <span className="text-muted-foreground">({transfer.toEmail})</span>
                        {getStatusBadge(transfer.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    
                    {transfer.transferMessage && (
                      <p className="text-sm text-muted-foreground mb-2">
                        "{transfer.transferMessage}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Code: {transfer.transferCode}</span>
                      <span>Expires: {transfer.expiresAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketTransferPage;