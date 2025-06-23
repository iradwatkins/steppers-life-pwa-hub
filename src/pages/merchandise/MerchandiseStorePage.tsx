import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  Heart,
  Shirt,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Palette,
  Package
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from '@/components/following/FollowButton';
import type { MerchandiseItem, MerchandiseCategory } from '@/types/merchandise';

const MerchandiseStorePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<MerchandiseCategory | 'all'>(
    (searchParams.get('category') as MerchandiseCategory) || 'all'
  );
  const [selectedInstructor, setSelectedInstructor] = useState(searchParams.get('instructor') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');

  useEffect(() => {
    loadMerchandise();
  }, [selectedCategory, selectedInstructor, sortBy, searchQuery]);

  const loadMerchandise = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setMerchandise(mockMerchandise);
    } catch (error) {
      console.error('Error loading merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tshirts', label: 'T-Shirts' },
    { value: 'hoodies', label: 'Hoodies' },
    { value: 'tank_tops', label: 'Tank Tops' },
    { value: 'polo_shirts', label: 'Polo Shirts' },
    { value: 'sweatshirts', label: 'Sweatshirts' },
    { value: 'hats', label: 'Hats & Caps' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'activewear', label: 'Activewear' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' }
  ];

  const filteredMerchandise = merchandise.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesInstructor = selectedInstructor === 'all' || item.instructor_id === selectedInstructor;
    
    return matchesSearch && matchesCategory && matchesInstructor && item.status === 'approved';
  });

  const featuredMerchandise = filteredMerchandise.filter(item => item.featured).slice(0, 4);
  const instructors = Array.from(new Set(merchandise.map(item => ({
    id: item.instructor_id,
    name: item.instructor_name,
    avatar: item.instructor_avatar
  })))).slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shirt className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold">Instructor Merchandise</h1>
            <p className="text-xl text-muted-foreground">
              Support your favorite instructors with exclusive stepping apparel
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-purple-800">Support Instructors Directly</h3>
              <p className="text-purple-700">
                Every purchase supports stepping instructors with revenue sharing
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-purple-700">
              <DollarSign className="h-4 w-4" />
              <span>25% goes to instructors</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <Package className="h-4 w-4" />
              <span>High-quality materials</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <Heart className="h-4 w-4" />
              <span>Community designed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchandise, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MerchandiseCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
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

            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="w-full sm:w-48">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Instructors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {instructors.map(instructor => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Merchandise</TabsTrigger>
          <TabsTrigger value="featured">Featured Items</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {/* Merchandise Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : filteredMerchandise.length === 0 ? (
            <div className="text-center py-12">
              <Shirt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Merchandise Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMerchandise.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img 
                      src={item.featured_image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.featured && (
                      <Badge className="absolute top-2 left-2 bg-purple-500">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className="absolute top-2 right-2 bg-white text-black">
                      {categories.find(c => c.value === item.category)?.label}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.instructor_avatar} />
                        <AvatarFallback>{item.instructor_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{item.instructor_name}</span>
                      <FollowButton
                        entityId={item.instructor_id}
                        entityType="instructor"
                        entityName={item.instructor_name}
                        variant="icon"
                        size="sm"
                      />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.avg_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({item.review_count})</span>
                      </div>
                      <span className="font-semibold text-lg">${item.base_price}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700" asChild>
                        <Link to={`/merchandise/${item.id}`}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Shop Now
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      {item.total_sales} sold • 25% supports instructor
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
              <h2 className="text-2xl font-bold mb-4">Featured Merchandise</h2>
              <p className="text-muted-foreground">
                Handpicked designs from our top instructors
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {featuredMerchandise.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img 
                      src={item.featured_image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.instructor_avatar} />
                        <AvatarFallback>{item.instructor_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{item.instructor_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {categories.find(c => c.value === item.category)?.label}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-xl mb-2">{item.name}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.avg_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({item.review_count})</span>
                      </div>
                      <span className="font-semibold text-xl">${item.base_price}</span>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500" asChild>
                      <Link to={`/merchandise/${item.id}`}>
                        <Palette className="h-4 w-4 mr-2" />
                        Customize & Order
                      </Link>
                    </Button>
                    
                    <div className="mt-3 text-xs text-center text-muted-foreground">
                      {item.total_sales} sold • Supporting {item.instructor_name}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Instructor Spotlight */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Instructors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.slice(0, 6).map((instructor) => {
            const instructorItems = merchandise.filter(item => item.instructor_id === instructor.id);
            const totalSales = instructorItems.reduce((sum, item) => sum + item.total_sales, 0);
            
            return (
              <Card key={instructor.id} className="text-center">
                <CardContent className="p-6">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={instructor.avatar} />
                    <AvatarFallback className="text-lg">{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg mb-2">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {instructorItems.length} designs • {totalSales} items sold
                  </p>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" asChild>
                      <Link to={`/merchandise?instructor=${instructor.id}`}>
                        View Store
                      </Link>
                    </Button>
                    <FollowButton
                      entityId={instructor.id}
                      entityType="instructor"
                      entityName={instructor.name}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Revenue Sharing Info */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">Supporting Our Community</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every purchase directly supports stepping instructors through our revenue sharing program
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">25% Revenue Share</h3>
            <p className="text-sm text-muted-foreground">
              Instructors earn 25% of every sale from their merchandise
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Quality Products</h3>
            <p className="text-sm text-muted-foreground">
              Premium materials and printing for long-lasting designs
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="font-semibold mb-2">Community Made</h3>
            <p className="text-sm text-muted-foreground">
              Designs created by and for the stepping community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockMerchandise: MerchandiseItem[] = [
  {
    id: '1',
    instructor_id: 'instructor-1',
    instructor_name: 'Marcus Johnson',
    instructor_avatar: '/placeholder-avatar.jpg',
    name: 'Stepping Fundamentals Tee',
    description: 'Classic cotton t-shirt with stepping fundamentals design',
    category: 'tshirts',
    base_price: 25.99,
    instructor_commission_rate: 25,
    platform_fee_rate: 10,
    design_images: [],
    product_options: [],
    featured_image: '/placeholder-tshirt.jpg',
    gallery_images: [],
    status: 'approved',
    featured: true,
    tags: ['stepping', 'fundamentals', 'classic'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    total_sales: 147,
    total_revenue: 3819.53,
    avg_rating: 4.8,
    review_count: 23
  },
  {
    id: '2',
    instructor_id: 'instructor-2',
    instructor_name: 'Diana Williams',
    instructor_avatar: '/placeholder-avatar.jpg',
    name: 'Smooth Steps Hoodie',
    description: 'Comfortable hoodie perfect for dance practice',
    category: 'hoodies',
    base_price: 45.99,
    instructor_commission_rate: 25,
    platform_fee_rate: 10,
    design_images: [],
    product_options: [],
    featured_image: '/placeholder-hoodie.jpg',
    gallery_images: [],
    status: 'approved',
    featured: true,
    tags: ['stepping', 'practice', 'comfort'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    total_sales: 89,
    total_revenue: 4093.11,
    avg_rating: 4.9,
    review_count: 17
  },
  {
    id: '3',
    instructor_id: 'instructor-3',
    instructor_name: 'James Mitchell',
    instructor_avatar: '/placeholder-avatar.jpg',
    name: 'Chicago Stepping Tank',
    description: 'Lightweight tank top for summer stepping sessions',
    category: 'tank_tops',
    base_price: 22.99,
    instructor_commission_rate: 25,
    platform_fee_rate: 10,
    design_images: [],
    product_options: [],
    featured_image: '/placeholder-tank.jpg',
    gallery_images: [],
    status: 'approved',
    featured: false,
    tags: ['summer', 'lightweight', 'chicago'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    total_sales: 203,
    total_revenue: 4667.97,
    avg_rating: 4.7,
    review_count: 31
  },
  {
    id: '4',
    instructor_id: 'instructor-1',
    instructor_name: 'Marcus Johnson',
    instructor_avatar: '/placeholder-avatar.jpg',
    name: 'Stepping Legend Cap',
    description: 'Embroidered cap showing your stepping pride',
    category: 'hats',
    base_price: 28.99,
    instructor_commission_rate: 25,
    platform_fee_rate: 10,
    design_images: [],
    product_options: [],
    featured_image: '/placeholder-cap.jpg',
    gallery_images: [],
    status: 'approved',
    featured: true,
    tags: ['embroidered', 'pride', 'legend'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    total_sales: 76,
    total_revenue: 2203.24,
    avg_rating: 4.6,
    review_count: 12
  }
];

export default MerchandiseStorePage;