import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { CreditCard, DollarSign, Users, AlertCircle } from 'lucide-react';
import { AssignedEvent } from '../services/salesAgentService';
import { useQuickSaleForm } from '../hooks/useSalesAgent';
import { formatCurrency } from '../utils/formatters';

interface QuickSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignedEvents: AssignedEvent[];
  form: ReturnType<typeof useQuickSaleForm>;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const QuickSaleDialog: React.FC<QuickSaleDialogProps> = ({
  isOpen,
  onClose,
  assignedEvents,
  form,
  onSubmit,
  isProcessing
}) => {
  const selectedEvent = assignedEvents.find(e => e.eventId === form.selectedEvent);
  const selectedTicketType = selectedEvent?.ticketTypes.find(t => t.typeId === form.selectedTicketType);
  
  const totalAmount = selectedTicketType ? selectedTicketType.price * form.quantity : 0;
  const commissionAmount = selectedTicketType ? totalAmount * (selectedTicketType.commissionRate / 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.isValid && !isProcessing) {
      onSubmit();
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Quick Ticket Sale
          </DialogTitle>
          <DialogDescription>
            Process a ticket sale for your assigned events
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event">Select Event</Label>
            <Select
              value={form.selectedEvent}
              onValueChange={form.setSelectedEvent}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {assignedEvents.map((event) => (
                  <SelectItem key={event.eventId} value={event.eventId}>
                    <div className="flex items-center justify-between w-full">
                      <span>{event.eventName}</span>
                      <Badge variant="outline" className="ml-2">
                        {event.inventory.totalAvailable} available
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Type Selection */}
          {selectedEvent && (
            <div className="space-y-2">
              <Label htmlFor="ticketType">Ticket Type</Label>
              <Select
                value={form.selectedTicketType}
                onValueChange={form.setSelectedTicketType}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedEvent.ticketTypes.map((ticketType) => (
                    <SelectItem 
                      key={ticketType.typeId} 
                      value={ticketType.typeId}
                      disabled={ticketType.availableQuantity === 0}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span>{ticketType.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(ticketType.price)} • {ticketType.commissionRate}% commission
                          </span>
                        </div>
                        <Badge variant={ticketType.availableQuantity > 0 ? "default" : "secondary"}>
                          {ticketType.availableQuantity} left
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          {selectedTicketType && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setQuantity(Math.max(1, form.quantity - 1))}
                  disabled={form.quantity <= 1 || isProcessing}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedTicketType.availableQuantity}
                  value={form.quantity}
                  onChange={(e) => form.setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                  disabled={isProcessing}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setQuantity(Math.min(selectedTicketType.availableQuantity, form.quantity + 1))}
                  disabled={form.quantity >= selectedTicketType.availableQuantity || isProcessing}
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">
                  Max: {selectedTicketType.availableQuantity}
                </span>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Customer Information</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Customer name"
                  value={form.customerInfo.name}
                  onChange={(e) => form.setCustomerInfo({
                    ...form.customerInfo,
                    name: e.target.value
                  })}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@email.com"
                  value={form.customerInfo.email}
                  onChange={(e) => form.setCustomerInfo({
                    ...form.customerInfo,
                    email: e.target.value
                  })}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone (Optional)</Label>
              <Input
                id="customerPhone"
                placeholder="Phone number"
                value={form.customerInfo.phone}
                onChange={(e) => form.setCustomerInfo({
                  ...form.customerInfo,
                  phone: e.target.value
                })}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={form.paymentMethod}
              onValueChange={(value: any) => form.setPaymentMethod(value)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Bank Transfer</SelectItem>
                <SelectItem value="agent_processed">Agent Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this sale..."
              value={form.notes}
              onChange={(e) => form.setNotes(e.target.value)}
              disabled={isProcessing}
              rows={2}
            />
          </div>

          {/* Sale Summary */}
          {selectedTicketType && form.quantity > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Sale Summary
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ticket Price:</span>
                  <span>{formatCurrency(selectedTicketType.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{form.quantity}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Your Commission ({selectedTicketType.commissionRate}%):</span>
                  <span>{formatCurrency(commissionAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {!form.isValid && form.selectedEvent && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Please fill in all required fields to proceed</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.isValid || isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Sale
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 