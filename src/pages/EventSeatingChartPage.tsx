import React from 'react';
import { useParams } from 'react-router-dom';

const EventSeatingChartPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Seating Chart Configuration</h1>
        <p className="text-lg">Event ID: {eventId}</p>
        <p className="text-muted-foreground">This is the seating chart configuration page.</p>
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Features:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Interactive seating chart</li>
            <li>Seat selection and booking</li>
            <li>Real-time availability updates</li>
            <li>Customer seat selection interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventSeatingChartPage;