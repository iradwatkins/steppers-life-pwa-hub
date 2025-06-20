import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EnhancedTicketSelection } from "@/components/ticket/EnhancedTicketSelection";
import { useCart } from "@/contexts/CartContext";
import { Ticket, Table, Accessibility, Calendar, MapPin, Users } from 'lucide-react';
import type { Event, TicketType } from '@/types/ticket';

// Mock data - replace with actual API calls
const mockEvent: Event = {
  id: 1,
  name: "Summer Music Festival 2024",
  date: "2024-08-15T19:00:00Z",
  location: "Central Park Amphitheater",
  description: "Join us for an unforgettable evening of music under the stars featuring top artists from around the world.",
  ticket_types: [
    {
      id: 1,
      name: "General Admission",
      price: 75,
      description: "Standing room access to main festival area",
      available: 500,
      max_per_order: 8
    },
    {
      id: 2,
      name: "VIP Experience",
      price: 150,
      description: "Premium seating, complimentary drinks, and meet & greet",
      available: 100,
      max_per_order: 4
    },
    {
      id: 3,
      name: "Premium Box",
      price: 300,
      description: "Private box seating for up to 6 people with full service",
      available: 20,
      max_per_order: 2
    },
    {
      id: 4,
      name: "Student Discount",
      price: 45,
      description: "Discounted tickets for students with valid ID",
      available: 150,
      max_per_order: 2
    }
  ],
  sections: [
    {
      id: 1,
      name: "VIP Section A",
      description: "Prime viewing location with premium amenities",
      tables: [
        { id: 1, number: "A1", capacity: 8, price: 800, available: true },
        { id: 2, number: "A2", capacity: 8, price: 800, available: true },
        { id: 3, number: "A3", capacity: 6, price: 600, available: false }
      ]
    },
    {
      id: 2,
      name: "VIP Section B",
      description: "Elevated seating with bar access",
      tables: [
        { id: 4, number: "B1", capacity: 10, price: 1000, available: true },
        { id: 5, number: "B2", capacity: 8, price: 800, available: true }
      ]
    }
  ]
};

const EnhancedPurchasePage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem, setEvent: setCartEvent, setAttendeeInfo } = useCart();
  
  const [activeTab, setActiveTab] = useState<'tickets' | 'tables'>('tickets');
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    // Simulate API call
    const loadEvent = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvent(mockEvent);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, toast]);

  const handleTicketSelection = (ticketData: {
    ticketType: string;
    quantity: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
    totalAmount: number;
  }) => {
    // Set event info in cart
    setCartEvent(event!.id.toString(), event!.name);
    
    // Find the ticket type from event data
    const selectedTicketType = event!.ticket_types.find(tt => tt.name === ticketData.ticketType);
    if (selectedTicketType) {
      // Add item using original cart format
      addItem({
        id: selectedTicketType.id.toString(),
        name: selectedTicketType.name,
        price: selectedTicketType.price,
        description: selectedTicketType.description,
        availableQuantity: selectedTicketType.available
      }, ticketData.quantity);
      
      // Set attendee info
      setAttendeeInfo({
        firstName: ticketData.attendeeName.split(' ')[0] || ticketData.attendeeName,
        lastName: ticketData.attendeeName.split(' ').slice(1).join(' ') || '',
        email: ticketData.attendeeEmail,
        phone: ticketData.attendeePhone || '',
        emergencyContact: '',
        emergencyPhone: '',
        dietaryRestrictions: '',
        specialRequests: ''
      });
    }

    navigate('/checkout/details');
  };

  const handleTableSelection = (table: Table) => {
    setSelectedTable(table);
  };

  const handleTableReservation = (attendeeData: {
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
  }) => {
    if (!selectedTable) return;

    // Set event info in cart
    setCartEvent(event!.id.toString(), event!.name);
    
    // Create a table as a special ticket type
    addItem({
      id: `table-${selectedTable.id}`,
      name: `Table ${selectedTable.number}`,
      price: selectedTable.price,
      description: `Table reservation for up to ${selectedTable.capacity} people`,
      availableQuantity: selectedTable.available ? 1 : 0
    }, 1);
    
    // Set attendee info
    setAttendeeInfo({
      firstName: attendeeData.attendeeName.split(' ')[0] || attendeeData.attendeeName,
      lastName: attendeeData.attendeeName.split(' ').slice(1).join(' ') || '',
      email: attendeeData.attendeeEmail,
      phone: attendeeData.attendeePhone || '',
      emergencyContact: '',
      emergencyPhone: '',
      dietaryRestrictions: '',
      specialRequests: ''
    });

    navigate('/checkout/details');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading event details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/events')}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold mb-2">{event.name}</CardTitle>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="ml-4">
                Event #{event.id}
              </Badge>
            </div>
            {event.description && (
              <p className="text-muted-foreground mt-4">{event.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Purchase Options */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tickets' | 'tables')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="tickets" className="flex items-center">
                  <Ticket className="mr-2 h-4 w-4" />
                  Individual Tickets
                </TabsTrigger>
                <TabsTrigger value="tables" className="flex items-center">
                  <Table className="mr-2 h-4 w-4" />
                  Table Reservations
                </TabsTrigger>
              </TabsList>

              {/* Individual Tickets Tab */}
              <TabsContent value="tickets">
                <EnhancedTicketSelection
                  event={event}
                  onSelectionComplete={handleTicketSelection}
                />
              </TabsContent>

              {/* Table Reservations Tab */}
              <TabsContent value="tables">
                <div className="space-y-6">
                  {event.sections && event.sections.length > 0 ? (
                    event.sections.map((section) => (
                      <Card key={section.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            {section.name}
                          </CardTitle>
                          {section.description && (
                            <p className="text-muted-foreground">{section.description}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            {section.tables.map((table) => (
                              <div
                                key={table.id}
                                className={`p-4 border rounded-lg transition-all duration-200 ${
                                  !table.available 
                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                    : selectedTable?.id === table.id
                                      ? 'border-primary bg-primary/5 shadow-md cursor-pointer'
                                      : 'border-border hover:border-primary/50 hover:shadow-sm cursor-pointer'
                                }`}
                                onClick={() => table.available && handleTableSelection(table)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-lg">Table {table.number}</h4>
                                    <div className="flex items-center mt-1 text-muted-foreground">
                                      <Users className="mr-1 h-4 w-4" />
                                      <span>Seats up to {table.capacity} people</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-2xl font-bold text-primary">
                                      ${table.price.toFixed(2)}
                                    </span>
                                    <div className="mt-1">
                                      <Badge variant={table.available ? "secondary" : "destructive"}>
                                        {table.available ? "Available" : "Reserved"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                {selectedTable?.id === table.id && (
                                  <div className="mt-4 pt-4 border-t">
                                    <Badge variant="default">Selected</Badge>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Table className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Table Reservations Available</h3>
                        <p className="text-muted-foreground">
                          This event doesn't offer table reservations. Please check the individual tickets tab.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Table Reservation Form */}
                  {selectedTable && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Reserve Table {selectedTable.number}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleTableReservation({
                              attendeeName: formData.get('name') as string,
                              attendeeEmail: formData.get('email') as string,
                              attendeePhone: formData.get('phone') as string || undefined
                            });
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="name" className="text-sm font-medium">
                                Contact Name *
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full px-3 py-2 border border-input rounded-md"
                                placeholder="Enter contact name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-3 py-2 border border-input rounded-md"
                                placeholder="Enter email address"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                              Phone Number (Optional)
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              className="w-full px-3 py-2 border border-input rounded-md"
                              placeholder="Enter phone number"
                            />
                          </div>

                          {/* Reservation Summary */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium mb-3">Reservation Summary</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Table {selectedTable.number}</span>
                                <span>Up to {selectedTable.capacity} people</span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between font-semibold text-lg">
                                  <span>Total</span>
                                  <span>${selectedTable.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button type="submit" className="w-full" size="lg">
                            Continue to Payment - ${selectedTable.price.toFixed(2)}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPurchasePage;