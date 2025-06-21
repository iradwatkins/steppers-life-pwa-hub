import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MapPin, Phone, Globe, Star, Clock, SlidersHorizontal } from 'lucide-react';
import { communityService } from '@/services/communityService';
import FollowButton from '@/components/following/FollowButton';
import type { Store, Service, StoreCategory, ServiceCategory, CommunityListFilters, CommunityListing } from '@/types/community';

const CommunityBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'all' | 'stores' | 'services'>(
    (searchParams.get('type') as 'all' | 'stores' | 'services') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'created_at'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [listings, setListings] = useState<CommunityListing[]>([]);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory, selectedLocation, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [storeCatsResult, serviceCatsResult] = await Promise.all([
        communityService.getStoreCategories(),
        communityService.getServiceCategories()
      ]);

      if (storeCatsResult.success) setStoreCategories(storeCatsResult.data || []);
      if (serviceCatsResult.success) setServiceCategories(serviceCatsResult.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: CommunityListFilters = {
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset: (currentPage - 1) * limit
      };

      let result;
      if (activeTab === 'stores') {
        result = await communityService.getStores(filters);
      } else if (activeTab === 'services') {
        result = await communityService.getServices(filters);
      } else {
        result = await communityService.searchCommunity(filters);
      }

      if (result.success) {
        setListings(result.data || []);
        // Note: In a real implementation, you'd get total count from the API response
        setTotalCount(result.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    if (activeTab !== 'all') params.set('type', activeTab);
    setSearchParams(params);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      'apparel': 'bg-purple-500',
      'shoes': 'bg-blue-500',
      'dj': 'bg-green-500',
      'venue': 'bg-red-500',
      'photography': 'bg-yellow-500',
      'alterations': 'bg-pink-500',
      'supplies': 'bg-indigo-500',
      'planning': 'bg-orange-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const currentCategories = activeTab === 'stores' ? storeCategories : 
                           activeTab === 'services' ? serviceCategories : 
                           [...storeCategories, ...serviceCategories];

  const locations = [
    { value: 'all', label: 'All Areas' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'south-side', label: 'South Side' },
    { value: 'north-side', label: 'North Side' },
    { value: 'west-side', label: 'West Side' }
  ];

  const isStore = (listing: CommunityListing): listing is Store => 'name' in listing;
  const getListingTitle = (listing: CommunityListing) => 
    isStore(listing) ? listing.name : listing.business_name;
  const getListingPath = (listing: CommunityListing) => 
    isStore(listing) ? `/community/stores/${listing.id}` : `/community/services/${listing.id}`;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Community Directory</h1>
          <p className="text-muted-foreground">
            Find stores and services that support the Chicago stepping community.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'all' | 'stores' | 'services');
            setCurrentPage(1);
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Listings ({totalCount})</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {currentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="bg-stepping-gradient">
              Search
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Sort by:</span>
            </div>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'rating' | 'created_at')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Newest</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">↓</SelectItem>
                <SelectItem value="asc">↑</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading listings...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {listings.length} results
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => {
                const title = getListingTitle(listing);
                const linkPath = getListingPath(listing);
                const listingIsStore = isStore(listing);
                
                return (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {listing.images && listing.images.length > 0 ? (
                        <div className="aspect-video bg-muted rounded-md mb-4 relative overflow-hidden">
                          <img 
                            src={listing.images.find(img => img.is_primary)?.url || listing.images[0]?.url} 
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                          {listing.is_featured && (
                            <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                          )}
                          <Badge className={`absolute top-2 right-2 ${listingIsStore ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {listingIsStore ? 'Store' : 'Service'}
                          </Badge>
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted rounded-md mb-4 relative flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                          {listing.is_featured && (
                            <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                          )}
                          <Badge className={`absolute top-2 right-2 ${listingIsStore ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {listingIsStore ? 'Store' : 'Service'}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-white ${getCategoryBadgeColor(listing.category.slug)}`}>
                          {listing.category.name}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{listing.rating_average.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({listing.rating_count})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          <Link to={linkPath} className="hover:underline">
                            {title}
                          </Link>
                        </CardTitle>
                        <FollowButton
                          entityId={listing.id}
                          entityType={listingIsStore ? 'store' : 'service'}
                          entityName={title}
                          variant="icon"
                          size="sm"
                        />
                      </div>
                      <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 mb-4">
                        {!listing.location.is_online_only && listing.location.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {listing.location.address}
                          </div>
                        )}
                        {listing.location.is_online_only && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            Online Only
                          </div>
                        )}
                        {listing.contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {listing.contact.phone}
                          </div>
                        )}
                        {listing.operating_hours?.notes && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {listing.operating_hours.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-stepping-gradient flex-1" asChild>
                          <Link to={linkPath}>
                            View Details
                          </Link>
                        </Button>
                        {listing.contact.website && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={listing.contact.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {listings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No listings found matching your criteria.</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setActiveTab('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination would go here in a real implementation */}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityBrowse;