
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface InventoryStatusProps {
  ticketTypeId: string;
  className?: string;
}

interface InventoryStatusBadgeProps {
  available: number;
  total: number;
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

export const InventoryStatusBadge: React.FC<InventoryStatusBadgeProps> = ({ 
  available, 
  total, 
  className 
}) => {
  const percentage = total > 0 ? (available / total) * 100 : 0;
  
  const getStatusColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIcon = () => {
    if (percentage > 50) return <CheckCircle className="w-3 h-3" />;
    if (percentage > 20) return <Package className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      {getIcon()}
      {available}/{total} available
    </Badge>
  );
};

export default InventoryStatus;
