import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PendingEvent {
  id: string;
  title: string;
  date: string;
  organizer: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

const ReviewEventsPage: React.FC = () => {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockEvents: PendingEvent[] = [
      {
        id: '1',
        title: 'Summer Music Festival',
        date: '2024-07-15',
        organizer: 'Music Events Inc',
        submittedAt: '2024-03-15T10:00:00Z',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Tech Conference 2024',
        date: '2024-08-20',
        organizer: 'Tech Events Co',
        submittedAt: '2024-03-14T15:30:00Z',
        status: 'pending'
      },
      // Add more mock events as needed
    ];
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (eventId: string) => {
    // TODO: Implement actual API call
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, status: 'approved' } : event
    ));
  };

  const handleReject = async (eventId: string) => {
    // TODO: Implement actual API call
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, status: 'rejected', reason: 'Does not meet guidelines' } : event
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Review</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and moderate pending events
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>{new Date(event.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/admin/events/${event.id}`}>
                          <Button variant="ghost" size="sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                        {event.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(event.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(event.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewEventsPage; 