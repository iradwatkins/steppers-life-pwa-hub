
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryStatusProps {
  ticketTypeId: string;
  className?: string;
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({ ticketTypeId, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Inventory tracking available.</p>
      </CardContent>
    </Card>
  );
};

export default InventoryStatus;
