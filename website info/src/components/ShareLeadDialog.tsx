import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Share2 } from 'lucide-react';
import { Customer, AssignedEvent } from '../services/salesAgentService';

interface ShareLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: any) => void;
  customers: Customer[];
  events: AssignedEvent[];
}

export const ShareLeadDialog: React.FC<ShareLeadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  events
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    targetAgentId: '',
    eventId: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customerId && formData.targetAgentId && formData.eventId) {
      onSubmit(formData);
      setFormData({ customerId: '', targetAgentId: '', eventId: '', notes: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Lead with Team
          </DialogTitle>
          <DialogDescription>
            Share a customer lead with another team member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData({ ...formData, customerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Related Event</Label>
            <Select
              value={formData.eventId}
              onValueChange={(value) => setFormData({ ...formData, eventId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.eventId} value={event.eventId}>
                    {event.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent">Share with Agent</Label>
            <Select
              value={formData.targetAgentId}
              onValueChange={(value) => setFormData({ ...formData, targetAgentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent-2">Sarah Wilson</SelectItem>
                <SelectItem value="agent-3">Mike Chen</SelectItem>
                <SelectItem value="agent-4">Emma Davis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information about this lead..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.customerId || !formData.targetAgentId || !formData.eventId}
            >
              Share Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 