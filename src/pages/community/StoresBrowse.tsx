import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Phone, Globe, Star, Clock, SlidersHorizontal, Store as StoreIcon, Plus, Target } from 'lucide-react';
import { storeService } from '@/services/storeService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Store, StoreCategory, StoreFilters } from '@/types/store';

const StoresBrowse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'created_at' | 'distance'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedLocation, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await storeService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: StoreFilters = {
        keyword: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        city: selectedLocation !== 'all' ? selectedLocation : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset: (currentPage - 1) * limit,
        status: 'approved'
      };

      // Add location-based filtering if enabled
      if (useLocation && userLocation) {
        filters.latitude = userLocation.latitude;
        filters.longitude = userLocation.longitude;
        filters.radius = 25; // 25 mile radius
      }

      const result = await storeService.getStores(filters);
      setStores(result.stores);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to load stores:', error);
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
    setSearchParams(params);
  };

  const handleUseLocation = async () => {
    if (!useLocation) {
      try {
        const location = await storeService.getCurrentLocation();
        setUserLocation(location);
        setUseLocation(true);
        setSortBy('distance');
        toast.success('Location enabled! Showing stores near you.');
        loadData();
      } catch (error) {
        toast.error('Unable to access your location. Please check permissions.');
      }
    } else {
      setUseLocation(false);
      setUserLocation(null);
      setSortBy('rating');
      loadData();
    }
  };

  const getCategoryBadgeColor = (slug: string) => {
    const colors = {
      'apparel': 'bg-purple-500',
      'shoes': 'bg-blue-500',
      'accessories': 'bg-green-500',
      'supplies': 'bg-indigo-500'
    };
    return colors[slug as keyof typeof colors] || 'bg-gray-500';
  };

  const locations = [
    { value: 'all', label: 'All Areas' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'south-side', label: 'South Side' },
    { value: 'north-side', label: 'North Side' },
    { value: 'west-side', label: 'West Side' }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StoreIcon className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold">Stores Directory</h1>
                <p className="text-muted-foreground">
                  Find stepping shoes, apparel, and accessories from community-recommended stores.
                </p>
              </div>
            </div>
            
            {user && (
              <Button onClick={() => navigate('/community/stores/create')} className="bg-stepping-gradient">
                <Plus className="h-4 w-4 mr-2" />
                List Your Store
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
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
                {categories.map((category) => (
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
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'rating' | 'created_at' | 'distance')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Newest</SelectItem>
                {useLocation && <SelectItem value="distance">Distance</SelectItem>}
              </SelectContent>
            </Select>

            <Button
              variant={useLocation ? "default" : "outline"}
              size="sm"
              onClick={handleUseLocation}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {useLocation ? 'Near Me' : 'Use Location'}
            </Button>

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
            <div className="text-lg">Loading stores...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {stores.length} stores
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {store.images && store.images.length > 0 ? (
                      <div className="aspect-video bg-muted rounded-md mb-4 relative overflow-hidden">
                        <img 
                          src={store.images.find(img => img.is_primary)?.url || store.images[0]?.url} 
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                        {store.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-md mb-4 relative flex items-center justify-center">
                        <StoreIcon className="h-12 w-12 text-muted-foreground" />
                        {store.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`text-white ${getCategoryBadgeColor(store.category?.slug || '')}`}>
                        {store.category?.name || 'Uncategorized'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({store.review_count})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        <Link to={`/community/stores/${store.id}`} className="hover:underline">
                          {store.name}
                        </Link>
                      </CardTitle>
                      {useLocation && userLocation && store.latitude && store.longitude && (
                        <span className="text-sm text-muted-foreground">
                          {storeService.calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            store.latitude,
                            store.longitude
                          ).toFixed(1)} mi
                        </span>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">{store.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-4">
                      {store.location_type !== 'online' && store.physical_address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {store.physical_address}
                        </div>
                      )}
                      {store.location_type === 'online' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          Online Store
                        </div>
                      )}
                      {store.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {store.contact_phone}
                        </div>
                      )}
                      {store.operating_hours?.monday && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {store.operating_hours.monday}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-stepping-gradient flex-1" asChild>
                        <Link to={`/community/stores/${store.id}`}>
                          View Store
                        </Link>
                      </Button>
                      {store.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={store.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {stores.length === 0 && (
              <div className="text-center py-12">
                <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No stores found matching your criteria.</p>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    handleSearch();
                  }}>
                    Clear Filters
                  </Button>
                  {user && (
                    <Button onClick={() => navigate('/community/stores/create')} className="bg-stepping-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your Store
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoresBrowse;