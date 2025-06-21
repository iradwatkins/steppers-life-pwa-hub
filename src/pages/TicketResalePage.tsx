/**
 * Ticket Resale Marketplace Page
 * Story B.014: Ticket Resale Platform - UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  TicketResaleService, 
  type ResaleListing, 
  type ResaleTransaction 
} from '@/services/ticketResaleService';
import { 
  ShoppingCart, 
  Star, 
  Eye, 
  Heart, 
  Shield, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Clock,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Tag
} from 'lucide-react';

const TicketResalePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [userListings, setUserListings] = useState<ResaleListing[]>([]);
  const [userPurchases, setUserPurchases] = useState<ResaleTransaction[]>([]);

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    eventId: searchParams.get('eventId') || '',
    priceMin: '',
    priceMax: '',
    category: searchParams.get('category') || 'all',
    verifiedOnly: false,
    sortBy: 'newest' as 'price_low' | 'price_high' | 'newest' | 'ending_soon',
  });

  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadResaleListings();
    if (user) {
      loadUserData();
    }
  }, [user, searchFilters]);

  const loadResaleListings = async () => {
    setIsLoading(true);
    try {
      const criteria = {
        eventId: searchFilters.eventId || undefined,
        priceRange: (searchFilters.priceMin || searchFilters.priceMax) ? {
          min: parseFloat(searchFilters.priceMin) || 0,
          max: parseFloat(searchFilters.priceMax) || 1000,
        } : undefined,
        category: searchFilters.category !== 'all' ? searchFilters.category as any : undefined,
        verifiedOnly: searchFilters.verifiedOnly,
        sortBy: searchFilters.sortBy,
      };

      const results = await TicketResaleService.searchResaleListings(criteria);
      setListings(results);
    } catch (error) {
      console.error('Error loading resale listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [userListingsData, userPurchasesData] = await Promise.all([
        TicketResaleService.getUserResaleListings(user.id),
        TicketResaleService.getUserResalePurchases(user.id),
      ]);

      setUserListings(userListingsData);
      setUserPurchases(userPurchasesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handlePurchaseTicket = async (listing: ResaleListing) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    setSelectedListing(listing);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedListing || !user) return;

    setIsLoading(true);
    try {
      const result = await TicketResaleService.purchaseResaleTicket({
        listingId: selectedListing.id,
        buyerId: user.id,
        buyerEmail: user.email,
        buyerName: user.full_name,
        paymentMethodId: 'mock_payment_method',
        agreedPrice: selectedListing.resalePrice,
      });

      if (result.success) {
        toast({
          title: "Purchase Successful!",
          description: `Transfer code: ${result.transferCode}`,
        });
        setShowPurchaseModal(false);
        setSelectedListing(null);
        loadResaleListings();
        loadUserData();
      } else {
        toast({
          title: "Purchase Failed",
          description: result.errorMessage || "Failed to purchase ticket",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'below_face':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'above_face':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'face_value':
        return <Minus className="h-4 w-4 text-blue-600" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'below_face':
        return 'Below Face Value';
      case 'above_face':
        return 'Above Face Value';
      case 'face_value':
        return 'Face Value';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'below_face':
        return 'border-green-300 text-green-700 bg-green-50';
      case 'above_face':
        return 'border-red-300 text-red-700 bg-red-50';
      case 'face_value':
        return 'border-blue-300 text-blue-700 bg-blue-50';
      default:
        return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };

  const renderListingCard = (listing: ResaleListing) => (
    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{listing.eventTitle}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {listing.eventDate.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.ticketType}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${listing.resalePrice}
            </div>
            <div className="text-sm text-muted-foreground">
              was ${listing.originalPrice}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className={getCategoryColor(listing.category)}>
            <div className="flex items-center gap-1">
              {getCategoryIcon(listing.category)}
              {getCategoryLabel(listing.category)}
            </div>
          </Badge>
          
          {listing.isVerified && (
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              {listing.sellerRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.views}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {listing.watchlists}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            by {listing.sellerName}
          </div>
        </div>

        {listing.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => handlePurchaseTicket(listing)}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy Now
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ticket Resale Marketplace</h1>
          <p className="text-muted-foreground">
            Buy and sell tickets safely with verified transfers and buyer protection
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Tickets</TabsTrigger>
            <TabsTrigger value="my-listings" disabled={!user}>My Listings</TabsTrigger>
            <TabsTrigger value="my-purchases" disabled={!user}>My Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceMin">Min Price</Label>
                    <Input
                      id="priceMin"
                      type="number"
                      placeholder="$0"
                      value={searchFilters.priceMin}
                      onChange={(e) => setSearchFilters(prev => ({ 
                        ...prev, 
                        priceMin: e.target.value 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priceMax">Max Price</Label>
                    <Input
                      id="priceMax"
                      type="number"
                      placeholder="$500"
                      value={searchFilters.priceMax}
                      onChange={(e) => setSearchFilters(prev => ({ 
                        ...prev, 
                        priceMax: e.target.value 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Price Category</Label>
                    <Select
                      value={searchFilters.category}
                      onValueChange={(value) => setSearchFilters(prev => ({ 
                        ...prev, 
                        category: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="below_face">Below Face Value</SelectItem>
                        <SelectItem value="face_value">Face Value</SelectItem>
                        <SelectItem value="above_face">Above Face Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sortBy">Sort By</Label>
                    <Select
                      value={searchFilters.sortBy}
                      onValueChange={(value) => setSearchFilters(prev => ({ 
                        ...prev, 
                        sortBy: value as any 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="ending_soon">Ending Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={searchFilters.verifiedOnly}
                    onChange={(e) => setSearchFilters(prev => ({ 
                      ...prev, 
                      verifiedOnly: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="verifiedOnly">Verified sellers only</Label>
                </div>
              </CardContent>
            </Card>

            {/* Listings Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Available Tickets ({listings.length})
                </h2>
                {isLoading && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </div>

              {listings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No tickets found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search filters or check back later for new listings.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(renderListingCard)}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Listings ({userListings.length})</h2>
              <Button onClick={() => navigate('/sell-ticket')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Sell Ticket
              </Button>
            </div>

            {userListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No active listings</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't listed any tickets for resale yet.
                  </p>
                  <Button onClick={() => navigate('/sell-ticket')}>
                    Create Your First Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map(renderListingCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-purchases" className="space-y-6">
            <h2 className="text-xl font-semibold">My Purchases ({userPurchases.length})</h2>

            {userPurchases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground">
                    You haven't purchased any resale tickets yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPurchases.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Transaction #{transaction.id.slice(-8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Purchased on {transaction.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${transaction.salePrice}</div>
                          <Badge variant="outline" className={
                            transaction.status === 'completed' ? 'border-green-300 text-green-700' :
                            transaction.status === 'pending' ? 'border-yellow-300 text-yellow-700' :
                            'border-red-300 text-red-700'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Purchase Confirmation Modal */}
        {showPurchaseModal && selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Confirm Purchase</CardTitle>
                <CardDescription>
                  Review your ticket purchase details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold">{selectedListing.eventTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedListing.eventDate.toLocaleDateString()} • {selectedListing.ticketType}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ticket Price:</span>
                    <span>${selectedListing.resalePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee:</span>
                    <span>${(selectedListing.resalePrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${(selectedListing.resalePrice * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your payment is protected. The ticket will be transferred to you after purchase.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button 
                    onClick={confirmPurchase}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirm Purchase
                  </Button>
                  <Button 
                    onClick={() => setShowPurchaseModal(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketResalePage;