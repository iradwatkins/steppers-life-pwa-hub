import React, { useState } from 'react';
import { Settings, CheckSquare, Clock, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkOperation } from '@/services/eventCollectionsService';

interface BulkOperationsPanelProps {
  organizerId: string;
  operations: BulkOperation[];
  isLoading: boolean;
  onClose: () => void;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  organizerId,
  operations,
  isLoading,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('active');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Settings className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getOperationDescription = (operation: BulkOperation) => {
    const eventCount = operation.eventIds.length;
    switch (operation.type) {
      case 'edit':
        return `Edit ${eventCount} event${eventCount > 1 ? 's' : ''}`;
      case 'pricing':
        return `Update pricing for ${eventCount} event${eventCount > 1 ? 's' : ''}`;
      case 'publish':
        return `Publish ${eventCount} event${eventCount > 1 ? 's' : ''}`;
      case 'unpublish':
        return `Unpublish ${eventCount} event${eventCount > 1 ? 's' : ''}`;
      case 'delete':
        return `Delete ${eventCount} event${eventCount > 1 ? 's' : ''}`;
      default:
        return `Process ${eventCount} event${eventCount > 1 ? 's' : ''}`;
    }
  };

  const activeOperations = operations.filter(op => 
    op.status === 'pending' || op.status === 'processing'
  );
  
  const completedOperations = operations.filter(op => 
    op.status === 'completed' || op.status === 'failed'
  );

  const getProgress = (operation: BulkOperation) => {
    switch (operation.status) {
      case 'pending':
        return 0;
      case 'processing':
        return 50;
      case 'completed':
        return 100;
      case 'failed':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Bulk Operations</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {operations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No bulk operations yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active
              {activeOperations.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeOperations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              History
              {completedOperations.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {completedOperations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeOperations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <p className="text-muted-foreground text-sm">No active operations</p>
                </CardContent>
              </Card>
            ) : (
              activeOperations.map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(operation.status)}
                        <div>
                          <p className="font-medium">{getOperationDescription(operation)}</p>
                          <p className="text-sm text-muted-foreground">
                            Started {formatDate(operation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(operation.status)}>
                        {operation.status}
                      </Badge>
                    </div>
                    
                    <Progress value={getProgress(operation)} className="h-2" />
                    
                    {operation.status === 'processing' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Processing your request...
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {completedOperations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <p className="text-muted-foreground text-sm">No completed operations</p>
                </CardContent>
              </Card>
            ) : (
              completedOperations.map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(operation.status)}
                        <div>
                          <p className="font-medium">{getOperationDescription(operation)}</p>
                          <p className="text-sm text-muted-foreground">
                            {operation.status === 'completed' ? 'Completed' : 'Failed'} {formatDate(operation.completedAt || operation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(operation.status)}>
                        {operation.status}
                      </Badge>
                    </div>
                    
                    {operation.status === 'failed' && operation.errors && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {operation.errors.join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {operations.length} total operation{operations.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Clear History
          </Button>
          <Button size="sm">
            New Operation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsPanel; 