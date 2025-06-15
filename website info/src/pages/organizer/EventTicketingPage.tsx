import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Trash2, PlusCircle, Edit3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TicketType {
  id: string;
  name: string;
  price: string; // Using string for price input, can be parsed to number
  salesStartDate: string;
  salesStartTime: string;
  salesEndDate: string;
  salesEndTime: string;
  quantity?: string; // Optional
}

const EventTicketingPage = () => {
  // Assume an eventId would be passed via props or router params
  const eventId = 'mock-event-123'; 
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Partial<TicketType>>({
    id: '', // Will be set when adding/editing
    name: '',
    price: '',
    salesStartDate: '',
    salesStartTime: '',
    salesEndDate: '',
    salesEndTime: '',
    quantity: '',
  });
  const [isEditing, setIsEditing] = useState<string | null>(null); // Stores ID of ticket being edited

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateTicket = () => {
    if (!currentTicket.name || !currentTicket.price || !currentTicket.salesStartDate || !currentTicket.salesEndDate) {
      // Basic validation, consider using a toast notification here
      alert('Please fill in all required ticket fields.');
      return;
    }

    if (isEditing) {
      setTicketTypes(ticketTypes.map(tt => tt.id === isEditing ? { ...currentTicket, id: isEditing } as TicketType : tt));
      setIsEditing(null);
    } else {
      setTicketTypes([...ticketTypes, { ...currentTicket, id: Date.now().toString() } as TicketType]);
    }
    
    // Reset form
    setCurrentTicket({ name: '', price: '', salesStartDate: '', salesStartTime: '', salesEndDate: '', salesEndTime: '', quantity: '' });
  };

  const handleEditTicket = (ticket: TicketType) => {
    setIsEditing(ticket.id);
    setCurrentTicket(ticket);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTicketTypes(ticketTypes.filter(tt => tt.id !== ticketId));
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary">
              Configure Ticketing for Event ID: {eventId}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Define ticket types, pricing, and sales periods for your event.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Form for Adding/Editing Ticket Type */}
            <div className="border border-border-default p-6 rounded-lg bg-background-main shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {isEditing ? 'Edit Ticket Type' : 'Add New Ticket Type'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <Label htmlFor="name" className="text-text-primary font-medium">Ticket Name</Label>
                  <Input id="name" name="name" value={currentTicket.name || ''} onChange={handleInputChange} placeholder="e.g., General Admission, VIP" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="price" className="text-text-primary font-medium">Price (USD)</Label>
                  <Input id="price" name="price" type="number" value={currentTicket.price || ''} onChange={handleInputChange} placeholder="e.g., 25.00" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <Label htmlFor="salesStartDate" className="text-text-primary font-medium">Sales Start Date</Label>
                  <Input id="salesStartDate" name="salesStartDate" type="date" value={currentTicket.salesStartDate || ''} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="salesStartTime" className="text-text-primary font-medium">Sales Start Time</Label>
                  <Input id="salesStartTime" name="salesStartTime" type="time" value={currentTicket.salesStartTime || ''} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <Label htmlFor="salesEndDate" className="text-text-primary font-medium">Sales End Date</Label>
                  <Input id="salesEndDate" name="salesEndDate" type="date" value={currentTicket.salesEndDate || ''} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="salesEndTime" className="text-text-primary font-medium">Sales End Time</Label>
                  <Input id="salesEndTime" name="salesEndTime" type="time" value={currentTicket.salesEndTime || ''} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="quantity" className="text-text-primary font-medium">Available Quantity (Optional)</Label>
                <Input id="quantity" name="quantity" type="number" value={currentTicket.quantity || ''} onChange={handleInputChange} placeholder="e.g., 100 (leave blank for unlimited)" className="mt-1" />
              </div>
              <Button onClick={handleAddOrUpdateTicket} className="mt-6 bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                <PlusCircle className="mr-2 h-4 w-4" /> {isEditing ? 'Update Ticket Type' : 'Add Ticket Type'}
              </Button>
              {isEditing && (
                <Button onClick={() => { setIsEditing(null); setCurrentTicket({}); }} variant="outline" className="mt-6 ml-2">
                  Cancel Edit
                </Button>
              )}
            </div>

            <Separator />

            {/* List of Existing Ticket Types */}
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Current Ticket Types</h3>
              {ticketTypes.length === 0 ? (
                <p className="text-text-secondary">No ticket types defined yet. Add one using the form above.</p>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <Card key={ticket.id} className="bg-background-main border-border-default">
                      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-grow mb-4 md:mb-0">
                          <h4 className="font-semibold text-text-primary">{ticket.name} - ${ticket.price}</h4>
                          <p className="text-sm text-text-secondary">
                            Sales: {ticket.salesStartDate} {ticket.salesStartTime || '00:00'} to {ticket.salesEndDate} {ticket.salesEndTime || '23:59'}
                          </p>
                          {ticket.quantity && <p className="text-sm text-text-secondary">Quantity: {ticket.quantity}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditTicket(ticket)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Edit3 className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteTicket(ticket.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
             <Button className="bg-green-600 hover:bg-green-700 text-white">Save All Changes</Button>
             {/* This button would eventually submit all ticketTypes to the backend */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EventTicketingPage; 