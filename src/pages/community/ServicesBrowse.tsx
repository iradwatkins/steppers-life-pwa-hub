import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Phone, Globe, Star, Clock, SlidersHorizontal, Briefcase, Plus, CheckCircle, Award, Target, Heart } from 'lucide-react';
import { serviceService } from '@/services/serviceService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Service, ServiceCategory, ServiceFilters } from '@/types/service';

const ServicesBrowse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [sortBy, setSortBy] = useState<'business_name' | 'rating' | 'created_at' | 'distance' | 'experience_years'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [recoveryFilter, setRecoveryFilter] = useState('all');
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedLocation, sortBy, sortOrder, currentPage, showVerifiedOnly, showEmergencyOnly, recoveryFilter, useLocation]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await serviceService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: ServiceFilters = {
        keyword: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        city: selectedLocation !== 'all' ? selectedLocation : undefined,
        verified_only: showVerifiedOnly,
        emergency_available: showEmergencyOnly,
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

      // Filter by recovery focus if specified
      if (recoveryFilter === 'recovery') {
        // This would need to be handled by filtering categories on the backend
        const recoveryCategories = categories.filter(cat => cat.is_recovery_focused).map(cat => cat.id);
        if (recoveryCategories.length > 0 && filters.category === undefined) {
          // For now, we'll handle this in the frontend filtering
        }
      }

      const result = await serviceService.getServices(filters);
      setServices(result.services);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to load services:', error);
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
    if (showVerifiedOnly) params.set('verified', 'true');
    setSearchParams(params);
  };

  const getCategoryBadgeColor = (slug: string) => {
    const colors = {
      'dj': 'bg-green-500',
      'photography': 'bg-yellow-500',
      'venue': 'bg-red-500',
      'planning': 'bg-orange-500',
      'instruction': 'bg-purple-500'
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
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold">Services Directory</h1>
                <p className="text-muted-foreground">
                  Find DJs, photographers, venues, and other service providers for your stepping events.
                </p>
              </div>
            </div>
            
            {user && (
              <Button onClick={() => navigate('/community/services/create')} className="bg-stepping-gradient">
                <Plus className="h-4 w-4 mr-2" />
                List Your Service
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
                placeholder="Search services..."
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

          {/* Sort and Filter Options */}
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

            <Button 
              variant={showVerifiedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified Only
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading services...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {services.length} services
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {service.images && service.images.length > 0 ? (
                      <div className="aspect-video bg-muted rounded-md mb-4 relative overflow-hidden">
                        <img 
                          src={service.images.find(img => img.is_primary)?.url || service.images[0]?.url} 
                          alt={service.business_name}
                          className="w-full h-full object-cover"
                        />
                        {service.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                        )}
                        {service.is_verified && (
                          <Badge className="absolute top-2 right-2 bg-blue-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-md mb-4 relative flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                        {service.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                        )}
                        {service.is_verified && (
                          <Badge className="absolute top-2 right-2 bg-blue-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`text-white ${getCategoryBadgeColor(service.category.slug)}`}>
                        {service.category.name}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating_average.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({service.rating_count})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        <Link to={`/community/services/${service.id}`} className="hover:underline">
                          {service.business_name}
                        </Link>
                      </CardTitle>
                      <FollowButton
                        entityId={service.id}
                        entityType="service"
                        entityName={service.business_name}
                        variant="icon"
                        size="sm"
                      />
                    </div>
                    <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                    
                    {/* Experience and Verification */}
                    <div className="flex items-center gap-2 mt-2">
                      {service.years_experience && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {service.years_experience}y exp
                        </Badge>
                      )}
                      {service.is_verified && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-4">
                      {!service.location.is_online_only && service.location.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {service.location.city || service.location.address}
                        </div>
                      )}
                      {service.location.is_online_only && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          Online Services
                        </div>
                      )}
                      {service.location.service_area_notes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {service.location.service_area_notes}
                        </div>
                      )}
                      {service.contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {service.contact.phone}
                        </div>
                      )}
                      {service.operating_hours?.notes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {service.operating_hours.notes}
                        </div>
                      )}
                    </div>
                    
                    {/* Service Types */}
                    {service.service_types.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {service.service_types.slice(0, 3).map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {service.service_types.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{service.service_types.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-stepping-gradient flex-1" asChild>
                        <Link to={`/community/services/${service.id}`}>
                          View Service
                        </Link>
                      </Button>
                      {service.contact.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={service.contact.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No services found matching your criteria.</p>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setShowVerifiedOnly(false);
                  }}>
                    Clear Filters
                  </Button>
                  {user && (
                    <Button onClick={() => navigate('/community/services/create')} className="bg-stepping-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your Service
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

export default ServicesBrowse;