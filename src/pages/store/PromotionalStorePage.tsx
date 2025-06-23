import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Truck, 
  MapPin, 
  Clock, 
  Shield,
  Star,
  Package,
  Users,
  Palette,
  Award,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { PromotionalProduct, ProductCategory, UserRole } from '@/types/promotional-store';

const PromotionalStorePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<PromotionalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(
    (searchParams.get('category') as ProductCategory) || 'all'
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    loadProducts();
    checkUserEligibility();
  }, [selectedCategory, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading promotional products:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserEligibility = async () => {
    if (!user) return;
    
    // Check user's roles to determine what products they can access
    // This would be determined by their instructor status, event organizing history, etc.
    setUserRole('instructor'); // Mock role
  };

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'business_cards', label: 'Business Cards' },
    { value: 'flyers', label: 'Flyers & Posters' },
    { value: 'banners', label: 'Banners' },
    { value: 'tickets', label: 'Event Tickets' },
    { value: 'wristbands', label: 'Wristbands' },
    { value: 'lawn_signs', label: 'Lawn Signs' },
    { value: 'stickers', label: 'Stickers & Labels' },
    { value: 'brochures', label: 'Brochures' }
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      instructor: 'bg-blue-500',
      event_organizer: 'bg-green-500',
      venue_owner: 'bg-purple-500',
      community_leader: 'bg-orange-500',
      premium_member: 'bg-yellow-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const isEligibleForProduct = (product: PromotionalProduct) => {
    if (!userRole) return false;
    return product.eligible_roles.includes(userRole);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const isEligible = isEligibleForProduct(product);
    
    return matchesSearch && matchesCategory && isEligible;
  });

  const featuredProducts = filteredProducts.filter(p => p.status === 'active').slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="h-10 w-10 text-blue-500" />
          <div>
            <h1 className="text-4xl font-bold">SteppersLife Store</h1>
            <p className="text-xl text-muted-foreground">
              Professional promotional products for the stepping community
            </p>
          </div>
        </div>
        
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Exclusive Access Required</h3>
            <p className="text-blue-700 mb-4">
              Our promotional products store is exclusively available to verified instructors, 
              event organizers, and community leaders.
            </p>
            <Button asChild>
              <Link to="/login">Sign In to Access Store</Link>
            </Button>
          </div>
        )}

        {user && !userRole && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
            <Crown className="h-8 w-8 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Access Under Review</h3>
            <p className="text-orange-700 mb-4">
              We're verifying your eligibility for our promotional products store. 
              This process typically takes 1-2 business days.
            </p>
            <Button variant="outline" asChild>
              <Link to="/profile">Update Profile</Link>
            </Button>
          </div>
        )}
      </div>

      {user && userRole && (
        <>
          {/* User Role Badge */}
          <div className="flex justify-center mb-8">
            <Badge className={`text-white ${getRoleBadgeColor(userRole)} px-4 py-2 text-sm`}>
              <Award className="h-4 w-4 mr-2" />
              Verified {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promotional products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'all')}>
                <SelectTrigger className="w-full md:w-64">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="products" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Browse Products</TabsTrigger>
              <TabsTrigger value="featured">Featured Items</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="aspect-square bg-muted animate-pulse" />
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                          <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                          <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or category filter
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img 
                          src={product.featured_image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-white text-black">
                          {categories.find(c => c.value === product.category)?.label}
                        </Badge>
                        {product.status === 'coming_soon' && (
                          <Badge className="absolute top-2 right-2 bg-blue-500">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Starting at:</span>
                            <span className="font-semibold text-lg">${product.base_price}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Min Quantity:</span>
                            <span>{product.minimum_quantity}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{product.turnaround_days} day turnaround</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span>
                              {product.shipping_info.pickup_available ? 'Pickup Available' : 'Shipping Available'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            disabled={product.status !== 'active'}
                            asChild={product.status === 'active'}
                          >
                            {product.status === 'active' ? (
                              <Link to={`/store/product/${product.id}`}>
                                Customize & Order
                              </Link>
                            ) : (
                              'Coming Soon'
                            )}
                          </Button>
                          
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/store/product/${product.id}/details`}>
                              Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                  <p className="text-muted-foreground">
                    Popular promotional materials trusted by the stepping community
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img 
                          src={product.featured_image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-stepping-gradient">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                        <p className="text-muted-foreground mb-4">{product.description}</p>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Starting at:</span>
                            <span className="font-semibold text-xl">${product.base_price}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span>Min: {product.minimum_quantity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{product.turnaround_days} days</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full bg-stepping-gradient" asChild>
                          <Link to={`/store/product/${product.id}`}>
                            <Palette className="h-4 w-4 mr-2" />
                            Customize Now
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Orders</h2>
                  <Button variant="outline" asChild>
                    <Link to="/store/orders/history">
                      View All Orders
                    </Link>
                  </Button>
                </div>

                {/* Recent orders would be loaded here */}
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start browsing our promotional products to place your first order
                  </p>
                  <Button asChild>
                    <Link to="#" onClick={() => document.querySelector('[data-value="products"]')?.click()}>
                      Browse Products
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Info Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle>Quality Guaranteed</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Professional-grade materials and printing for all your promotional needs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle>Chicago Pickup</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Convenient pickup locations throughout the Chicago area to save on shipping
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle>Community Focused</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Designed specifically for stepping events, classes, and community activities
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

// Mock data for demonstration
const mockProducts: PromotionalProduct[] = [
  {
    id: '1',
    name: 'Stepping Class Business Cards',
    description: 'Professional business cards for stepping instructors with multiple design templates',
    category: 'business_cards',
    base_price: 45.00,
    minimum_quantity: 100,
    maximum_quantity: 5000,
    dimensions: { width: 3.5, height: 2, unit: 'inches' },
    materials: ['Premium Card Stock', 'Glossy Finish', 'UV Coating'],
    customization_options: [],
    templates: [],
    featured_image: '/placeholder-business-cards.jpg',
    gallery_images: [],
    turnaround_days: 3,
    shipping_info: {
      weight: 0.5,
      weight_unit: 'lbs',
      dimensions: { width: 4, height: 3, depth: 1, unit: 'inches' },
      shipping_class: 'standard',
      pickup_available: true,
      pickup_locations: []
    },
    eligible_roles: ['instructor', 'event_organizer'],
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Event Flyers & Posters',
    description: 'Eye-catching flyers and posters to promote your stepping events',
    category: 'flyers',
    base_price: 85.00,
    minimum_quantity: 25,
    maximum_quantity: 1000,
    dimensions: { width: 8.5, height: 11, unit: 'inches' },
    materials: ['Premium Paper', 'Full Color Printing'],
    customization_options: [],
    templates: [],
    featured_image: '/placeholder-flyers.jpg',
    gallery_images: [],
    turnaround_days: 2,
    shipping_info: {
      weight: 2,
      weight_unit: 'lbs',
      dimensions: { width: 9, height: 12, depth: 2, unit: 'inches' },
      shipping_class: 'standard',
      pickup_available: true
    },
    eligible_roles: ['instructor', 'event_organizer', 'venue_owner'],
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Event Wristbands',
    description: 'Custom wristbands for event entry and VIP access',
    category: 'wristbands',
    base_price: 125.00,
    minimum_quantity: 100,
    maximum_quantity: 10000,
    materials: ['Tyvek', 'Silicone', 'Vinyl'],
    customization_options: [],
    templates: [],
    featured_image: '/placeholder-wristbands.jpg',
    gallery_images: [],
    turnaround_days: 5,
    shipping_info: {
      weight: 3,
      weight_unit: 'lbs',
      dimensions: { width: 10, height: 8, depth: 4, unit: 'inches' },
      shipping_class: 'standard',
      pickup_available: true
    },
    eligible_roles: ['event_organizer', 'venue_owner'],
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

export default PromotionalStorePage;