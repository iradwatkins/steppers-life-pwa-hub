import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Eye,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { TicketDiagnostics, type TicketDiagnosticResult } from '@/utils/ticketDiagnostics';
import { TicketFlowTester } from '@/utils/testTicketFlow';

const TicketDiagnosticsPage: React.FC = () => {
  const { user } = useAuth();
  const { organizerId, hasOrganizer } = useRoles();
  const navigate = useNavigate();
  
  const [diagnostics, setDiagnostics] = useState<TicketDiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (hasOrganizer && organizerId) {
      loadDiagnostics();
    }
  }, [hasOrganizer, organizerId]);

  const loadDiagnostics = async () => {
    if (!organizerId) return;
    
    setIsLoading(true);
    try {
      const results = await TicketDiagnostics.diagnoseOrganizerEvents(organizerId);
      setDiagnostics(results);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
      toast.error('Failed to load ticket diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixEvents = async () => {
    if (!organizerId) return;
    
    setIsFixing(true);
    try {
      const result = await TicketDiagnostics.fixEventsWithoutTickets(organizerId);
      
      if (result.fixed > 0) {
        toast.success(`Fixed ${result.fixed} event(s) by adding default ticket types`);
      }
      
      if (result.failed.length > 0) {
        toast.error(`Failed to fix ${result.failed.length} event(s)`);
        console.error('Failed events:', result.failed);
      }
      
      // Reload diagnostics
      setDiagnostics(result.results);
      
    } catch (error) {
      console.error('Error fixing events:', error);
      toast.error('Failed to fix events');
    } finally {
      setIsFixing(false);
    }
  };

  const handleTestTicketFlow = async () => {
    if (!organizerId) return;
    
    setIsTesting(true);
    try {
      const results = await TicketFlowTester.testCompleteFlow(organizerId);
      
      let successCount = 0;
      let failCount = 0;
      
      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error('Test failed:', result.message, result.error);
        }
      });
      
      if (failCount === 0) {
        toast.success(`All ${successCount} ticket flow tests passed successfully`);
      } else {
        toast.error(`${failCount} test(s) failed, ${successCount} passed. Check console for details.`);
      }
      
      // Reload diagnostics after testing
      await loadDiagnostics();
      
    } catch (error) {
      console.error('Error running ticket flow tests:', error);
      toast.error('Failed to run ticket flow tests');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (diagnostic: TicketDiagnosticResult) => {
    if (diagnostic.issues.length === 0) {
      return <Badge className="bg-green-500">✓ Healthy</Badge>;
    } else if (diagnostic.ticketTypesCount === 0) {
      return <Badge variant="destructive">✗ No Tickets</Badge>;
    } else {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">⚠ Issues</Badge>;
    }
  };

  const eventsWithIssues = diagnostics.filter(d => d.issues.length > 0);
  const eventsWithoutTickets = diagnostics.filter(d => d.ticketTypesCount === 0);
  const healthyEvents = diagnostics.filter(d => d.issues.length === 0);

  if (!user || !hasOrganizer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need an organizer profile to access ticket diagnostics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/organizer/events')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket Diagnostics</h1>
              <p className="text-gray-600 mt-1">
                Check and fix ticket data issues for your events
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDiagnostics} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {eventsWithoutTickets.length > 0 && (
                <Button 
                  onClick={handleFixEvents} 
                  disabled={isFixing}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Wrench className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
                  Fix Events ({eventsWithoutTickets.length})
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleTestTicketFlow} 
                disabled={isTesting}
                className="border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                <Activity className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
                Test Flow
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{diagnostics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Healthy</p>
                  <p className="text-2xl font-bold">{healthyEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Issues</p>
                  <p className="text-2xl font-bold">{eventsWithIssues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">No Tickets</p>
                  <p className="text-2xl font-bold">{eventsWithoutTickets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostics Results */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading diagnostics...
                </div>
              </CardContent>
            </Card>
          ) : diagnostics.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                  <p className="text-muted-foreground">
                    Create your first event to see diagnostics here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            diagnostics.map((diagnostic) => (
              <Card key={diagnostic.eventId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {diagnostic.eventTitle}
                        {getStatusBadge(diagnostic)}
                      </CardTitle>
                      <CardDescription>
                        Status: {diagnostic.eventStatus} • 
                        Ticket Types: {diagnostic.ticketTypesCount}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/events/${diagnostic.eventId}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Event
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Issues */}
                  {diagnostic.issues.length > 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">Issues Found:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {diagnostic.issues.map((issue, index) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Ticket Types */}
                  {diagnostic.ticketTypes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Ticket Types:</h4>
                      <div className="grid gap-3">
                        {diagnostic.ticketTypes.map((ticket, index) => (
                          <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{ticket.name}</span>
                                {!ticket.is_active && (
                                  <Badge variant="outline" className="text-xs">Inactive</Badge>
                                )}
                              </div>
                              {ticket.description && (
                                <p className="text-sm text-muted-foreground">{ticket.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="font-medium">${ticket.price}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {ticket.quantity_available - (ticket.quantity_sold || 0)} available
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDiagnosticsPage; 