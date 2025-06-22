import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { checkEventExists } from '@/utils/eventChecker';
import { Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const EventDebugger: React.FC = () => {
  const [eventId, setEventId] = useState('90390df7-bb9b-43c7-aa8d-127d4c2ebbf5');
  const [result, setResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!eventId.trim()) return;
    
    setIsChecking(true);
    try {
      const checkResult = await checkEventExists(eventId.trim());
      setResult(checkResult);
    } catch (error) {
      setResult({ exists: false, error: 'Check failed' });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.exists) {
      return result.ticketCount > 0 ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> :
        <AlertTriangle className="h-5 w-5 text-orange-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (!result) return '';
    if (result.exists) {
      return result.ticketCount > 0 ? 
        'Event exists with tickets' :
        'Event exists but no tickets';
    }
    return 'Event not found';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Event Debugger
        </CardTitle>
        <CardDescription>
          Check if a specific event exists and has ticket types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter event ID"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleCheck} 
            disabled={isChecking || !eventId.trim()}
          >
            {isChecking ? 'Checking...' : 'Check'}
          </Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>

            {result.exists && result.event && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800">Event Details</h4>
                <p className="text-sm text-green-700">Title: {result.event.title}</p>
                <p className="text-sm text-green-700">Status: {result.event.status}</p>
                <p className="text-sm text-green-700">Organizer ID: {result.event.organizer_id}</p>
              </div>
            )}

            {result.exists && result.ticketTypes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800">
                  Ticket Types ({result.ticketCount})
                </h4>
                {result.ticketTypes.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {result.ticketTypes.map((ticket: any) => (
                      <div key={ticket.id} className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">{ticket.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">${ticket.price}</Badge>
                          <Badge variant="outline">{ticket.quantity_available} available</Badge>
                          {!ticket.is_active && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700 mt-1">No ticket types found</p>
                )}
              </div>
            )}

            {!result.exists && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}

            {result.ticketError && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800">Ticket Error</h4>
                <p className="text-sm text-orange-700">{result.ticketError}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 