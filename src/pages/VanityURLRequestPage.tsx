/**
 * Vanity URL Request Page - Epic M.001: Vanity URL System
 * 
 * User interface for organizers and sales agents to request custom vanity URLs
 * for their events, profiles, and promotional materials.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Info, 
  CheckCircle, 
  Clock, 
  XCircle,
  BarChart3,
  Copy,
  Share
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VanityURLRequest {
  id: string;
  requestedUrl: string;
  targetUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewDate?: string;
  rejectionReason?: string;
  clickCount: number;
  isActive: boolean;
}

interface URLSuggestion {
  url: string;
  available: boolean;
  reason?: string;
}

const VanityURLRequestPage: React.FC = () => {
  const { toast } = useToast();
  const [requestedUrl, setRequestedUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<URLSuggestion[]>([]);
  const [userRequests, setUserRequests] = useState<VanityURLRequest[]>([]);
  const [selectedRequestType, setSelectedRequestType] = useState<string>('event');

  // Load user's existing requests
  useEffect(() => {
    loadUserRequests();
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (requestedUrl.length > 3) {
      generateSuggestions(requestedUrl);
    } else {
      setSuggestions([]);
    }
  }, [requestedUrl]);

  const loadUserRequests = async () => {
    try {
      if (!user?.id) return;
      
      const { VanityURLService } = await import('@/services/vanityUrlService');
      const requests = await VanityURLService.getUserRequests(user.id);
      setUserRequests(requests);
    } catch (error) {
      console.error('Error loading user requests:', error);
    }
  };

  const generateSuggestions = async (baseUrl: string) => {
    try {
      const { VanityURLService } = await import('@/services/vanityUrlService');
      const suggestions = await VanityURLService.generateSuggestions(baseUrl);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const validateUrl = (url: string): boolean => {
    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9-_]+$/;
    return urlPattern.test(url) && url.length >= 3 && url.length <= 50;
  };

  const checkAvailability = async (url: string): Promise<boolean> => {
    try {
      const { VanityURLService } = await import('@/services/vanityUrlService');
      return await VanityURLService.checkURLAvailability(url);
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(requestedUrl)) {
      toast({
        title: "Invalid URL",
        description: "URL must be 3-50 characters and contain only letters, numbers, hyphens, and underscores.",
        variant: "destructive",
      });
      return;
    }

    if (!targetUrl.startsWith('http')) {
      toast({
        title: "Invalid Target URL",
        description: "Target URL must be a valid HTTP or HTTPS URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isAvailable = await checkAvailability(requestedUrl);
      
      if (!isAvailable) {
        toast({
          title: "URL Not Available",
          description: "This vanity URL is already taken. Please try a different one.",
          variant: "destructive",
        });
        return;
      }

      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a vanity URL request.",
          variant: "destructive",
        });
        return;
      }

      const { VanityURLService } = await import('@/services/vanityUrlService');
      await VanityURLService.createRequest({
        requestedUrl: requestedUrl,
        targetUrl: targetUrl,
        description: purpose,
        userId: user.id
      });
      
      // Reload user requests to show the new one
      await loadUserRequests();

      // Reset form
      setRequestedUrl('');
      setTargetUrl('');
      setPurpose('');

      toast({
        title: "Request Submitted",
        description: "Your vanity URL request has been submitted for review. You'll be notified once it's processed.",
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    toast({
      title: "Copied",
      description: "URL copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-green-600">Active</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vanity URL Manager</h1>
        <p className="text-muted-foreground">
          Create custom short URLs for your events, profiles, and promotional content
        </p>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request New Vanity URL</CardTitle>
          <CardDescription>
            Create a memorable, easy-to-share URL that redirects to your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Select value={selectedRequestType} onValueChange={setSelectedRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event Promotion</SelectItem>
                    <SelectItem value="profile">Organizer Profile</SelectItem>
                    <SelectItem value="sales">Sales Agent Link</SelectItem>
                    <SelectItem value="campaign">Marketing Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedUrl">Desired URL Path</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                    stepperslife.com/
                  </span>
                  <Input
                    id="requestedUrl"
                    value={requestedUrl}
                    onChange={(e) => setRequestedUrl(e.target.value.toLowerCase())}
                    placeholder="myevent"
                    className="rounded-l-none"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  3-50 characters, letters, numbers, hyphens, and underscores only
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://stepperslife.com/events/my-stepping-event"
                required
              />
              <p className="text-xs text-muted-foreground">
                The full URL where users should be redirected
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (Optional)</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe how you plan to use this vanity URL..."
                rows={3}
              />
            </div>

            {/* URL Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Suggestions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        suggestion.available
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : 'border-red-200 bg-red-50'
                      }`}
                      onClick={() => suggestion.available && setRequestedUrl(suggestion.url.split('/').pop() || '')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{suggestion.url}</span>
                        {suggestion.available ? (
                          <Badge variant="outline" className="text-green-600">Available</Badge>
                        ) : (
                          <Badge variant="destructive">Taken</Badge>
                        )}
                      </div>
                      {suggestion.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Vanity URL requests are reviewed by our team within 24-48 hours. 
                URLs must comply with our content guidelines and cannot impersonate other brands.
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={isSubmitting || !requestedUrl || !targetUrl}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User's Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Your Vanity URLs</CardTitle>
          <CardDescription>
            Track the status of your vanity URL requests and view analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vanity URL</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span>{request.requestedUrl}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={request.targetUrl}>
                      {request.targetUrl}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.requestDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{request.clickCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {request.isActive && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyUrl(request.requestedUrl)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const { VanityURLService } = await import('@/services/vanityUrlService');
                                const shareData = VanityURLService.generateShareData(
                                  request.requestedUrl,
                                  'Check out this SteppersLife event!'
                                );
                                
                                if (navigator.share) {
                                  try {
                                    await navigator.share(shareData);
                                  } catch (error) {
                                    console.log('Share cancelled or failed');
                                  }
                                } else {
                                  // Fallback: copy to clipboard
                                  await navigator.clipboard.writeText(shareData.url);
                                  toast({
                                    title: "Copied to Clipboard",
                                    description: "URL copied to clipboard for sharing.",
                                  });
                                }
                              }}
                            >
                              <Share className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {request.status === 'rejected' && request.rejectionReason && (
                          <span className="text-xs text-red-600" title={request.rejectionReason}>
                            View Reason
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vanity URL requests yet. Submit your first request above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VanityURLRequestPage;