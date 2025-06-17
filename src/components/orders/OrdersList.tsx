import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { OrderService, OrderWithItems } from '@/services/orderService';
import { TicketPDFService } from '@/services/ticketPDFService';
import {
  Calendar,
  MapPin,
  Download,
  Eye,
  Ticket,
  Clock,
  Loader2,
  Receipt,
  ExternalLink
} from 'lucide-react';

interface OrdersListProps {
  maxItems?: number;
  showHeader?: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  maxItems, 
  showHeader = true 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingOrders, setDownloadingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userOrders = await OrderService.getUserOrders(user.id);
      const ordersToShow = maxItems ? userOrders.slice(0, maxItems) : userOrders;
      setOrders(ordersToShow);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTickets = async (order: OrderWithItems) => {
    try {
      setDownloadingOrders(prev => new Set(prev).add(order.id));
      
      const success = await TicketPDFService.downloadTickets(order);
      
      if (success) {
        toast({
          title: "Tickets Downloaded",
          description: `Tickets for ${order.event.title} downloaded successfully`
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download tickets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Orders</h2>
          </div>
        )}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Orders</h2>
          </div>
        )}
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't made any ticket purchases yet.
            </p>
            <Button asChild>
              <Link to="/events">
                Browse Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Orders</h2>
          {maxItems && orders.length >= maxItems && (
            <Button variant="outline" asChild>
              <Link to="/dashboard?tab=orders">
                View All Orders
              </Link>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {(orders || []).map((order) => {
          const eventDateTime = formatEventDate(order.event.start_date);
          const isDownloading = downloadingOrders.has(order.id);
          
          return (
            <Card key={order.id} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{order.event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>Order #{order.order_number}</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{eventDateTime.date} at {eventDateTime.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {order.event.venue ? 
                        `${order.event.venue.name}, ${order.event.venue.city}` : 
                        'Venue TBD'
                      }
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Tickets Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {order.order_items.length} ticket{order.order_items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    ${order.final_amount.toFixed(2)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleDownloadTickets(order)}
                    disabled={isDownloading || order.status !== 'confirmed'}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? 'Generating...' : 'Download Tickets'}
                  </Button>
                  
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                  >
                    <Link to={`/events/${order.event_id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Event
                    </Link>
                  </Button>
                </div>

                {/* Status Messages */}
                {order.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Payment is being processed. You'll receive confirmation shortly.
                  </div>
                )}
                
                {order.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                    This order has been cancelled. If you have questions, please contact support.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersList;