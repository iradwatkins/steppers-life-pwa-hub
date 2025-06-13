
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Clock, Users, DollarSign, Share2, Heart, ArrowLeft } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();

  // Mock event data - in real app, fetch based on id
  const event = {
    id: 1,
    title: "Chicago Stepping Championship",
    description: "The premier stepping competition featuring the best dancers from across the Midwest. This annual championship brings together seasoned professionals and rising stars for an unforgettable night of competition, entertainment, and community celebration.",
    longDescription: "Join us for the most anticipated stepping event of the year! The Chicago Stepping Championship showcases the finest talent in the stepping community, featuring multiple competition categories including Amateur, Professional, and Youth divisions. Beyond the competition, enjoy live music, vendor booths, and networking opportunities with fellow stepping enthusiasts.",
    date: "December 15, 2024",
    time: "7:00 PM - 11:00 PM",
    location: "Navy Pier Grand Ballroom",
    address: "600 E Grand Ave, Chicago, IL 60606",
    price: "$45",
    category: "competition",
    capacity: 500,
    attending: 342,
    featured: true,
    organizer: "Chicago Stepping Association",
    contact: "info@chicagostepping.org",
    image: "/placeholder.svg",
    schedule: [
      { time: "7:00 PM", activity: "Doors Open & Registration" },
      { time: "7:30 PM", activity: "Welcome & Opening Remarks" },
      { time: "8:00 PM", activity: "Amateur Division Competition" },
      { time: "9:00 PM", activity: "Professional Division Competition" },
      { time: "10:00 PM", activity: "Awards Ceremony" },
      { time: "10:30 PM", activity: "Social Dancing" }
    ],
    ticketTypes: [
      { name: "General Admission", price: "$45", description: "Standard seating and access to all activities" },
      { name: "VIP Table", price: "$85", description: "Reserved table seating with complimentary appetizers" },
      { name: "Competitor Entry", price: "$25", description: "Entry fee for competition participants" }
    ]
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="aspect-video bg-muted rounded-lg mb-8 relative">
          {event.featured && (
            <Badge className="absolute top-4 left-4 bg-stepping-gradient">Featured Event</Badge>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="icon" variant="secondary">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <Badge className="mb-2 bg-red-500 text-white">Competition</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-stepping-purple" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-stepping-purple" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-stepping-purple" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-stepping-purple" />
                  <span>{event.attending}/{event.capacity} attending</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.longDescription}</p>
            </div>

            <Separator />

            {/* Schedule */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Event Schedule</h2>
              <div className="space-y-3">
                {event.schedule.map((item, index) => (
                  <div key={index} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium text-stepping-purple min-w-20">{item.time}</div>
                    <div>{item.activity}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Organizer Info */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Event Organizer</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stepping-gradient rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.organizer}</h3>
                      <p className="text-sm text-muted-foreground">{event.contact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Purchase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Get Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticketTypes.map((ticket, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{ticket.name}</h4>
                      <span className="font-bold text-stepping-purple">{ticket.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                    <Button size="sm" className="w-full bg-stepping-gradient">
                      Select
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">{event.address}</p>
                  <div className="aspect-video bg-muted rounded-lg"></div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Map
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
