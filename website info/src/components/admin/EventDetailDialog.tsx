import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Ban, 
  Trash2, 
  Flag, 
  Eye 
} from 'lucide-react';
import { AdminEvent, adminEventService } from '@/services/adminEventService';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";

interface EventDetailDialogProps {
  event: AdminEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: (updatedEvent: AdminEvent) => void;
  onEventRemoved: (eventId: string) => void;
}

const EventDetailDialog: React.FC<EventDetailDialogProps> = ({ event, isOpen, onClose, onEventUpdated, onEventRemoved }) => {
  const [loading, setLoading] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AdminEvent['status'] | ''>('');
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined);
  const [claims, setClaims] = useState<any[]>([]); // State for claims
  const [claimsLoading, setClaimsLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setSelectedStatus(event.status);
      setIsFeatured(event.isFeatured);
      setStatusReason('');
      fetchClaims(event.id);
    }
  }, [event]);

  const fetchClaims = async (eventId: string) => {
    setClaimsLoading(true);
    try {
      const fetchedClaims = await adminEventService.getEventClaims(eventId);
      setClaims(fetchedClaims);
    } catch (error: any) {
      toast.error(`Failed to fetch claims: ${error.message}`);
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!event || !selectedStatus || (event.status === selectedStatus && statusReason === '')) return;
    if (['suspended', 'removed'].includes(selectedStatus) && statusReason.trim() === '') {
      toast.error('Reason is required for suspending or removing events.');
      return;
    }

    setLoading(true);
    try {
      const updatedEvent = await adminEventService.updateEventStatus(event.id, selectedStatus as AdminEvent['status'], statusReason);
      onEventUpdated(updatedEvent);
      toast.success(`Event ${event.name}'s status updated to ${selectedStatus}.`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update event status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async () => {
    if (!event || typeof isFeatured === 'undefined') return;
    setLoading(true);
    try {
      const updatedEvent = await adminEventService.featureEvent(event.id, !isFeatured);
      onEventUpdated(updatedEvent);
      toast.success(`Event ${event.name} ${!isFeatured ? 'featured' : 'unfeatured'}.`);
      setIsFeatured(!isFeatured); // Optimistic update for dialog state
    } catch (error: any) {
      toast.error(`Failed to toggle feature status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEvent = async () => {
    if (!event || statusReason.trim() === '') {
      toast.error('Reason is required to permanently remove an event.');
      return;
    }
    if (!confirm('Are you sure you want to permanently remove this event? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await adminEventService.removeEvent(event.id, statusReason);
      onEventRemoved(event.id);
      toast.success(`Event ${event.name} permanently removed.`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to remove event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClaim = async (claimId: string) => {
    if (!event) return;
    setLoading(true);
    try {
      await adminEventService.resolveClaim(event.id, claimId, 'Admin resolved');
      toast.success(`Claim ${claimId} for event ${event.name} resolved.`);
      fetchClaims(event.id); // Re-fetch claims to update list
    } catch (error: any) {
      toast.error(`Failed to resolve claim: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: AdminEvent['status']) => {
    switch (status) {
      case 'published': return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1"/> Published</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'unpublished': return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1"/> Unpublished</Badge>;
      case 'suspended': return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1"/> Suspended</Badge>;
      case 'removed': return <Badge variant="destructive"><Trash2 className="h-3 w-3 mr-1"/> Removed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!event) return null;

  const showReasonField = (selectedStatus !== event.status && (selectedStatus === 'suspended' || selectedStatus === 'removed')) || selectedStatus === 'removed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Details: {event.name}</DialogTitle>
          <DialogDescription>Manage event information, status, and claims.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Event Name</Label>
            <Input id="name" value={event.name} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="organizer" className="text-right">Organizer</Label>
            <Input id="organizer" value={event.organizerName} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <div className="col-span-3 flex items-center gap-2">
              {renderStatusBadge(event.status)}
              <Select onValueChange={(value) => setSelectedStatus(value as AdminEvent['status'])} value={selectedStatus} disabled={loading}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {showReasonField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">Reason</Label>
              <Textarea 
                id="reason" 
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Reason for status change (required for suspend/remove)"
                className="col-span-3"
                disabled={loading}
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" value={event.category} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Input id="date" value={event.date} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">Location</Label>
            <Input id="location" value={event.location} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketsSold" className="text-right">Tickets Sold</Label>
            <Input id="ticketsSold" value={event.ticketsSold.toLocaleString()} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="revenue" className="text-right">Revenue</Label>
            <Input id="revenue" value={`$${event.revenue.toLocaleString()}`} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isFeatured" className="text-right">Featured</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Badge variant={isFeatured ? 'default' : 'outline'}>{isFeatured ? 'Yes' : 'No'}</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFeatureToggle} 
                disabled={loading}
              >
                {loading && !event.isFeatured ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
                {isFeatured ? 'Unfeature' : 'Feature'}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userReports" className="text-right">User Reports</Label>
            <Input id="userReports" value={event.userReportsCount.toLocaleString()} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="refundRate" className="text-right">Refund Rate</Label>
            <Input id="refundRate" value={`${(event.refundRate * 100).toFixed(2)}%`} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="createdAt" className="text-right">Created At</Label>
            <Input id="createdAt" value={event.createdAt} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastUpdated" className="text-right">Last Updated</Label>
            <Input id="lastUpdated" value={event.lastUpdated} readOnly className="col-span-3" />
          </div>

          {/* Claims Management */}
          <div className="col-span-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Event Claims ({claims.length})</h3>
            {claimsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                Loading claims...
              </div>
            ) : claims.length === 0 ? (
              <div className="text-muted-foreground text-sm">No active claims for this event.</div>
            ) : (
              <div className="space-y-3">
                {claims.map((claim) => (
                  <Card key={claim.id} className="shadow-none border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium flex items-center">
                          <Flag className="h-4 w-4 mr-2 text-red-500" /> {claim.type}
                          <Badge variant="outline" className={`ml-2 ${claim.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {claim.status}
                          </Badge>
                        </div>
                        {claim.status === 'open' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleResolveClaim(claim.id)} 
                            disabled={loading}
                          >
                            Resolve Claim
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{claim.description}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {claim.date}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={handleRemoveEvent} 
              disabled={loading || statusReason.trim() === '' || selectedStatus !== 'removed'}
              className="flex items-center"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Permanently Remove
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {selectedStatus && selectedStatus !== event.status && (
              <Button 
                onClick={handleUpdateStatus} 
                disabled={loading || (['suspended', 'removed'].includes(selectedStatus) && statusReason.trim() === '')}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Update Status
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailDialog; 