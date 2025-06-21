/**
 * Transfer Claim Page
 * Story B.012: Ticket Transfer System - Claim UI
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TicketTransferService } from '@/services/ticketTransferService';
import { 
  Ticket, 
  User, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Gift,
  ArrowRight
} from 'lucide-react';

const TransferClaimPage = () => {
  const { linkCode, transferCode } = useParams<{ linkCode?: string; transferCode?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [claimMode, setClaimMode] = useState<'link' | 'code'>('link');
  const [transferDetails, setTransferDetails] = useState<any>(null);
  
  // Form state for claiming
  const [claimForm, setClaimForm] = useState({
    email: user?.email || '',
    name: user?.full_name || '',
    transferCode: transferCode || '',
  });

  const [claimSuccess, setClaimSuccess] = useState(false);

  // Mock transfer/ticket data
  const mockTicketDetails = {
    eventTitle: 'Chicago Stepping Championship',
    eventDate: 'December 15, 2024',
    eventTime: '7:00 PM',
    venue: 'Navy Pier Grand Ballroom',
    ticketType: 'General Admission',
    price: '$45.00',
    fromName: 'Sarah Johnson',
    transferMessage: 'Hope you enjoy the event! Can\'t wait to hear how it goes.',
  };

  useEffect(() => {
    // Determine claim mode based on URL parameters
    if (linkCode) {
      setClaimMode('link');
      loadTransferLinkDetails();
    } else if (transferCode) {
      setClaimMode('code');
      setClaimForm(prev => ({ ...prev, transferCode }));
      loadTransferCodeDetails();
    }
  }, [linkCode, transferCode]);

  const loadTransferLinkDetails = async () => {
    if (!linkCode) return;
    
    setIsLoading(true);
    try {
      // Mock loading link details
      console.log('🔗 Loading transfer link details:', linkCode);
      setTransferDetails({
        ...mockTicketDetails,
        linkCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        maxUses: 1,
        usedCount: 0,
      });
    } catch (error) {
      console.error('Error loading transfer link details:', error);
      toast({
        title: "Invalid Link",
        description: "This transfer link is invalid or has expired.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransferCodeDetails = async () => {
    if (!transferCode) return;
    
    console.log('🔍 Loading transfer code details:', transferCode);
    // Mock loading - in production, fetch from API
  };

  const handleClaimFromLink = async () => {
    if (!linkCode || !claimForm.email || !claimForm.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email and name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await TicketTransferService.acceptTransferFromLink(
        linkCode,
        claimForm.email,
        claimForm.name,
        user?.id
      );

      if (result.success) {
        setClaimSuccess(true);
        toast({
          title: "Transfer Successful!",
          description: "The ticket has been transferred to your account.",
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: result.errorMessage || "Failed to claim ticket",
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

  const handleClaimFromCode = async () => {
    if (!claimForm.transferCode || !claimForm.email) {
      toast({
        title: "Missing Information",
        description: "Please enter the transfer code and your email.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await TicketTransferService.acceptTransfer(
        claimForm.transferCode,
        claimForm.email,
        user?.id
      );

      if (result.success) {
        setClaimSuccess(true);
        toast({
          title: "Transfer Successful!",
          description: "The ticket has been transferred to your account.",
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: result.errorMessage || "Failed to claim ticket",
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

  const handleViewMyTickets = () => {
    navigate('/dashboard');
  };

  if (claimSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Transfer Complete!</h2>
              <p className="text-muted-foreground">
                The ticket has been successfully transferred to your account.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h3 className="font-semibold mb-2">{mockTicketDetails.eventTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {mockTicketDetails.eventDate} at {mockTicketDetails.eventTime}
                </p>
                <p className="text-sm text-muted-foreground">{mockTicketDetails.venue}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{mockTicketDetails.ticketType}</Badge>
                  <Badge variant="outline">{mockTicketDetails.price}</Badge>
                </div>
              </div>

              <Button onClick={handleViewMyTickets} className="w-full">
                View My Tickets
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && claimMode === 'link') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Transfer Details</h2>
            <p className="text-muted-foreground">
              Please wait while we verify the transfer link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {claimMode === 'link' ? 'Claim Your Ticket' : 'Enter Transfer Code'}
          </h1>
          <p className="text-muted-foreground">
            {claimMode === 'link' 
              ? 'Someone has shared a ticket with you!' 
              : 'Enter your transfer code to claim your ticket'
            }
          </p>
        </div>

        {/* Ticket Details */}
        {(claimMode === 'link' && transferDetails) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{transferDetails.eventTitle}</h3>
                <p className="text-muted-foreground">
                  {transferDetails.eventDate} at {transferDetails.eventTime}
                </p>
                <p className="text-muted-foreground">{transferDetails.venue}</p>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="secondary">{transferDetails.ticketType}</Badge>
                <Badge variant="outline">{transferDetails.price}</Badge>
              </div>

              {transferDetails.transferMessage && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Message from {transferDetails.fromName}:</strong><br />
                    "{transferDetails.transferMessage}"
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Transfer expires: {transferDetails.expiresAt?.toLocaleDateString()} at {transferDetails.expiresAt?.toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claim Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Claim Information
            </CardTitle>
            <CardDescription>
              {claimMode === 'link' 
                ? 'Enter your details to claim the ticket'
                : 'Enter your transfer code and email address'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {claimMode === 'code' && (
              <div className="space-y-2">
                <Label htmlFor="transferCode">Transfer Code *</Label>
                <Input
                  id="transferCode"
                  placeholder="Enter 8-character transfer code"
                  value={claimForm.transferCode}
                  onChange={(e) => setClaimForm(prev => ({ 
                    ...prev, 
                    transferCode: e.target.value.toUpperCase() 
                  }))}
                  maxLength={8}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  The 8-character code sent to your email
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={claimForm.email}
                onChange={(e) => setClaimForm(prev => ({ ...prev, email: e.target.value }))}
              />
              {claimMode === 'code' && (
                <p className="text-xs text-muted-foreground">
                  Must match the email address the transfer was sent to
                </p>
              )}
            </div>

            {claimMode === 'link' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={claimForm.name}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  This will be the new attendee name on the ticket
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                onClick={claimMode === 'link' ? handleClaimFromLink : handleClaimFromCode}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ticket className="h-4 w-4 mr-2" />
                )}
                Claim Ticket
              </Button>
            </div>

            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Once you claim this ticket, it will be permanently transferred to your account. 
                The previous owner will no longer have access to it.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 border-muted">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Make sure you're using the correct transfer code or link</p>
              <p>• Check that the transfer hasn't expired</p>
              <p>• Verify your email address matches the transfer</p>
              <p>• Contact support if you continue having issues</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferClaimPage;