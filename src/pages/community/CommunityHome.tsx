import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MapPin, Phone, Globe, Star, Clock, Plus, Store as StoreIcon, Briefcase } from 'lucide-react';
import { communityService } from '@/services/communityService';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from '@/components/following/FollowButton';
import type { Store, Service, StoreCategory, ServiceCategory, CommunityListFilters } from '@/types/community';

const CommunityHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'all' | 'stores' | 'services'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesResult, servicesResult, storeCatsResult, serviceCatsResult] = await Promise.all([
        communityService.getStores({ is_featured: true, limit: 6 }),
        communityService.getServices({ is_featured: true, limit: 6 }),
        communityService.getStoreCategories(),
        communityService.getServiceCategories()
      ]);

      if (storesResult.success) setStores(storesResult.data || []);
      if (servicesResult.success) setServices(servicesResult.data || []);
      if (storeCatsResult.success) setStoreCategories(storeCatsResult.data || []);
      if (serviceCatsResult.success) setServiceCategories(serviceCatsResult.data || []);
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters: CommunityListFilters = {
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      type: activeTab !== 'all' ? activeTab : undefined
    };

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    navigate(`/community/browse?${queryParams.toString()}`);
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

  const currentCategories = activeTab === 'stores' ? (storeCategories || []) : 
                           activeTab === 'services' ? (serviceCategories || []) : 
                           [...(storeCategories || []), ...(serviceCategories || [])];

  const locations = [
    { value: 'all', label: 'All Areas' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'south-side', label: 'South Side' },
    { value: 'north-side', label: 'North Side' },
    { value: 'west-side', label: 'West Side' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">Loading community directory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Directory</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover local businesses and services that support the Chicago stepping community. From stores to service providers, find everything you need.
          </p>
          
          {user && (
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => navigate('/community/stores/create')}
                className="bg-stepping-gradient"
              >
                <StoreIcon className="h-4 w-4 mr-2" />
                List Your Store
              </Button>
              <Button 
                onClick={() => navigate('/community/services/create')}
                variant="outline"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                List Your Service
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'stores' | 'services')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Listings</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(currentCategories || []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Areas" />
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
        </div>

        {/* Featured Listings */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <Button variant="outline" onClick={() => navigate('/community/browse')}>
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...(stores || []), ...(services || [])].slice(0, 6).map((listing) => {
              const isStore = 'name' in listing;
              const title = isStore ? (listing as Store).name : (listing as Service).business_name;
              const linkPath = isStore ? `/community/stores/${listing.id}` : `/community/services/${listing.id}`;
              
              return (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-md mb-4 relative">
                      <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                      <Badge className={`absolute top-2 right-2 ${isStore ? 'bg-blue-500' : 'bg-green-500'}`}>
                        {isStore ? 'Store' : 'Service'}
                      </Badge>
                    </div>
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
                        entityType={isStore ? 'store' : 'service'}
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StoreIcon className="h-5 w-5" />
                Browse Stores
              </CardTitle>
              <CardDescription>
                Find stepping shoes, apparel, accessories, and supplies from community-recommended stores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/community/stores">Browse All Stores</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Browse Services
              </CardTitle>
              <CardDescription>
                Discover service providers including DJs, photographers, venues, and event planning services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/community/services">Browse All Services</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Categories Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...(storeCategories || []), ...(serviceCategories || [])]
              .sort((a, b) => b.sort_order - a.sort_order)
              .slice(0, 12)
              .map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                      onClick={() => navigate(`/community/browse?category=${category.id}`)}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${getCategoryBadgeColor(category.slug)} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                      {category.name.charAt(0)}
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;