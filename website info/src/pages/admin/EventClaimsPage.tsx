import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, Calendar, Info } from 'lucide-react';

interface EventClaim {
  id: string; // Claim ID
  eventId: string;
  eventName: string;
  promoterId: string;
  promoterName: string; // Mocked
  promoterEmail: string; // Mocked
  claimDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Mock data for event claims - these would be events with status 'PendingAdminApproval' from a promoter's action
const mockInitialEventClaims: EventClaim[] = [
  {
    id: 'claim001',
    eventId: 'cevt001',
    eventName: 'Downtown Steppers Weekly Meetup',
    promoterId: 'promoterUser123',
    promoterName: 'John Promoter',
    promoterEmail: 'john.promoter@example.com',
    claimDate: '2024-07-28',
    status: 'Pending',
  },
  {
    id: 'claim002',
    eventId: 'cevt002',
    eventName: 'Lakeside Smooth Groove Night',
    promoterId: 'promoterUser456',
    promoterName: 'Alice StepStar',
    promoterEmail: 'alice.stepstar@example.com',
    claimDate: '2024-07-27',
    status: 'Pending',
  },
  {
    id: 'claim003',
    eventId: 'cevt003',
    eventName: 'Charity Steppers Fundraiser',
    promoterId: 'promoterUser789',
    promoterName: 'Mike Organizer',
    promoterEmail: 'mike.organizer@example.com',
    claimDate: '2024-07-29',
    status: 'Approved', // Example of an already processed claim
  },
];

const EventClaimsPage = () => {
  const [claims, setClaims] = useState<EventClaim[]>(mockInitialEventClaims);

  const handleApproveClaim = (claimId: string) => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.id === claimId ? { ...claim, status: 'Approved' } : claim
      )
    );
    alert(`Claim ID ${claimId} approved! (Mock action)`);
    // API call to update claim status and potentially assign promoter to event
  };

  const handleRejectClaim = (claimId: string) => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.id === claimId ? { ...claim, status: 'Rejected' } : claim
      )
    );
    alert(`Claim ID ${claimId} rejected. (Mock action)`);
    // API call to update claim status
  };

  const pendingClaims = claims.filter(claim => claim.status === 'Pending');
  const processedClaims = claims.filter(claim => claim.status !== 'Pending');

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Info className="mr-2 h-6 w-6 text-brand-primary" />
              Review Event Claims
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Approve or reject event claims submitted by promoters.
            </CardDescription>
          </CardHeader>
        </Card>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Pending Claims ({pendingClaims.length})</h2>
          {pendingClaims.length === 0 ? (
             <Card className="bg-surface-card"><CardContent className="p-6 text-text-secondary">No pending event claims.</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {pendingClaims.map(claim => (
                <Card key={claim.id} className="bg-surface-card border-border-default">
                  <CardHeader>
                    <CardTitle className="text-lg">{claim.eventName}</CardTitle>
                    <CardDescription>Event ID: {claim.eventId} | Claim ID: {claim.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm"><User className="inline h-4 w-4 mr-1 text-text-tertiary"/>Claimed by: <span className="font-medium text-text-primary">{claim.promoterName}</span> ({claim.promoterEmail})</div>
                    <div className="text-sm"><Calendar className="inline h-4 w-4 mr-1 text-text-tertiary"/>Claim Date: {claim.claimDate}</div>
                    <div className="flex space-x-3 pt-2">
                      <Button onClick={() => handleApproveClaim(claim.id)} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => handleRejectClaim(claim.id)} variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Processed Claims ({processedClaims.length})</h2>
          {processedClaims.length === 0 ? (
             <Card className="bg-surface-card"><CardContent className="p-6 text-text-secondary">No processed claims yet.</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {processedClaims.map(claim => (
                <Card key={claim.id} className="bg-surface-muted border-border-default opacity-80">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-md font-normal text-text-secondary">{claim.eventName}</CardTitle>
                        <Badge variant={claim.status === 'Approved' ? 'success' : 'destructive'} className="capitalize">
                            {claim.status}
                        </Badge>
                    </div>
                    <CardDescription className="text-xs">Event ID: {claim.eventId} | Claim ID: {claim.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-text-tertiary">
                    Claimed by: {claim.promoterName} on {claim.claimDate}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default EventClaimsPage; 