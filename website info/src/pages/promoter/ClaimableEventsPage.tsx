import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, CalendarDays, MapPin, ExternalLink } from 'lucide-react';

interface ClaimableEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  status: 'Open' | 'Claimed' | 'PendingAdminApproval'; // For frontend simulation
  organizer?: string; // Could be 'Platform Admin' or similar
}

// Mock data for claimable events
const mockClaimableEvents: ClaimableEvent[] = [
  {
    id: 'cevt001',
    name: 'Downtown Steppers Weekly Meetup',
    description: 'Join us for our weekly steppers meetup in the heart of downtown. All levels welcome!',
    date: 'Every Friday, 7:00 PM',
    location: 'City Center Plaza',
    status: 'Open',
    organizer: 'Platform Admin',
  },
  {
    id: 'cevt002',
    name: 'Lakeside Smooth Groove Night',
    description: 'An evening of smooth stepping by the lake. DJ, refreshments, and great company.',
    date: '2025-08-15',
    location: 'Lakeview Pavilion',
    status: 'Open',
    organizer: 'Platform Admin',
  },
  {
    id: 'cevt003',
    name: 'Charity Steppers Fundraiser',
    description: 'Step for a cause! All proceeds go to local community programs. Special guest instructors.',
    date: '2025-09-20',
    location: 'Community Grand Hall',
    status: 'Open',
    organizer: 'Platform Admin',
  },
  {
    id: 'cevt004',
    name: 'Beginner Steppin\' Workshop',
    description: 'New to stepping? This workshop is for you! Learn the basics from experienced instructors.',
    date: '2025-07-30',
    location: 'Dance Studio West',
    status: 'Claimed', // Example of an already claimed event by someone else (or current user)
    organizer: 'Platform Admin',
  },
];

const ClaimableEventsPage = () => {
  const [events, setEvents] = useState<ClaimableEvent[]>(mockClaimableEvents);

  const handleClaimEvent = (eventId: string) => {
    // Simulate claiming the event - in a real app, this would call an API
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId ? { ...event, status: 'PendingAdminApproval' } : event
      )
    );
    alert(`Event ID ${eventId} claimed! Pending admin approval. (Mock action)`);
    // Potentially redirect to a 'My Claimed Events' page or show a toast
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Handshake className="mr-2 h-6 w-6 text-brand-primary" />
              Claimable Events
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Browse events available for promotion. Claim an event to manage its ticketing and promotion.
            </CardDescription>
          </CardHeader>
        </Card>

        {events.length === 0 && (
            <Card className="bg-surface-card">
                <CardContent className="p-6 text-center text-text-secondary">
                    <p>No events are currently available for claiming.</p>
                </CardContent>
            </Card>
        )}

        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-surface-card border-border-default overflow-hidden">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <CardTitle className="text-xl font-semibold text-text-primary mb-2 md:mb-0">{event.name}</CardTitle>
                    <Badge 
                        className={`text-xs font-medium px-2.5 py-0.5
                        ${event.status === 'Open' ? 'bg-green-100 text-green-700 border-green-300' : 
                            event.status === 'PendingAdminApproval' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
                            'bg-gray-100 text-gray-700 border-gray-300'}
                        `}
                    >
                        {event.status === 'PendingAdminApproval' ? 'Claim Pending' : event.status}
                    </Badge>
                </div>
                 {event.organizer && <CardDescription className="text-xs text-text-tertiary mt-1">Posted by: {event.organizer}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary mb-3 text-sm leading-relaxed">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary mb-4">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1.5 text-text-tertiary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-text-tertiary" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                {event.status === 'Open' && (
                  <Button onClick={() => handleClaimEvent(event.id)} className="bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary w-full sm:w-auto">
                    <Handshake className="mr-2 h-4 w-4" /> Claim Event
                  </Button>
                )}
                {event.status === 'PendingAdminApproval' && (
                  <Button disabled className="w-full sm:w-auto">
                    Claim Submitted - Awaiting Approval
                  </Button>
                )}
                {event.status === 'Claimed' && (
                  <Button disabled className="w-full sm:w-auto">
                    Event Already Claimed
                  </Button>
                )}
                 {/* Optionally, add a link to view full event details if there was a separate public page */}
                 {/* <Link to={`/events/${event.id}`} className="ml-2 text-sm text-brand-primary hover:underline"><ExternalLink className="inline h-3 w-3 mr-1"/>View Details</Link> */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClaimableEventsPage; 