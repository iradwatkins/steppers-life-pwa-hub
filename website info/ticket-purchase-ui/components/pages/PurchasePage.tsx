import React, { useState } from 'react';
import type { Event } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TicketSelection } from '../ticket/TicketSelection';
import { TableSelection } from '../table/TableSelection';
import { CheckoutForm } from '../checkout/CheckoutForm';
import { useToast } from '../../hooks/use-toast';

interface PurchasePageProps {
  event: Event;
  onPurchaseComplete: (orderId: number) => void;
}

type PurchaseStep = 'selection' | 'checkout';
type PurchaseType = 'ticket' | 'table';

interface PurchaseData {
  type: PurchaseType;
  ticketType?: string;
  quantity?: number;
  tableId?: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
}

export const PurchasePage: React.FC<PurchasePageProps> = ({
  event,
  onPurchaseComplete
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<PurchaseStep>('selection');
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);

  const handleTicketSelection = (data: {
    ticketType: string;
    quantity: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
  }) => {
    setPurchaseData({
      type: 'ticket',
      ...data
    });
    setCurrentStep('checkout');
  };

  const handleTableSelection = (data: {
    tableId: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
  }) => {
    setPurchaseData({
      type: 'table',
      ...data
    });
    setCurrentStep('checkout');
  };

  const handleCheckoutComplete = (orderId: number) => {
    onPurchaseComplete(orderId);
  };

  const handleBack = () => {
    setCurrentStep('selection');
  };

  if (currentStep === 'checkout' && purchaseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="text-primary hover:text-primary/80"
              >
                ← Back to Selection
              </button>
            </div>
            <CheckoutForm
              event={event}
              purchaseType={purchaseData.type}
              purchaseData={purchaseData}
              onCheckoutComplete={handleCheckoutComplete}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Purchase {event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
            </TabsList>
            <TabsContent value="tickets">
              <TicketSelection
                event={event}
                onSelectionComplete={handleTicketSelection}
              />
            </TabsContent>
            <TabsContent value="tables">
              <TableSelection
                event={event}
                onSelectionComplete={handleTableSelection}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 