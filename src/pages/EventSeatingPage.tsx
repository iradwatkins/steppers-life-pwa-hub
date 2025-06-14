import React from 'react';
import { useParams } from 'react-router-dom';

const EventSeatingPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Event Seating Management</h1>
        <p className="text-lg">Event ID: {eventId}</p>
        <p className="text-muted-foreground">This is the basic seating management page.</p>
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Features:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Create seating charts</li>
            <li>Manage seat categories</li>
            <li>Set pricing for different sections</li>
            <li>Configure seat availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventSeatingPage;