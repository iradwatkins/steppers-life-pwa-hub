// Store Directory Service
// Handles store listings, categories, submissions, reviews, and administration

export interface StoreCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
  suggestedBy?: string; // user ID if user-suggested
  isApproved: boolean;
  createdAt: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isOnlineOnly: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OperatingHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

export interface StoreImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface StoreListing {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: StoreCategory;
  ownerId: string; // user ID of store owner
  ownerName: string;
  contactInfo: ContactInfo;
  address: Address;
  operatingHours?: OperatingHours;
  images: StoreImage[];
  tags: string[];
  isActive: boolean;
  isPending: boolean; // awaiting approval
  isVerified: boolean;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface StoreSubmissionData {
  name: string;
  description: string;
  categoryId: string;
  suggestedCategory?: string;
  contactInfo: ContactInfo;
  address: Address;
  operatingHours?: OperatingHours;
  images?: File[];
  tags: string[];
}

export interface StoreRating {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  review?: string;
  isVerified: boolean; // verified purchase/visit
  helpfulVotes: number;
  reportCount: number;
  isHidden: boolean;
  ownerResponse?: {
    text: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data for store categories
const mockStoreCategories: StoreCategory[] = [
  {
    id: 'cat_fashion',
    name: 'Fashion & Apparel',
    description: 'Clothing, shoes, and accessories',
    icon: 'Shirt',
    isActive: true,
    isApproved: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_dance_gear',
    name: 'Dance Gear & Equipment',
    description: 'Dance shoes, outfits, and accessories',
    icon: 'Music',
    isActive: true,
    isApproved: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_wellness',
    name: 'Health & Wellness',
    description: 'Supplements, fitness, and recovery products',
    icon: 'Heart',
    isActive: true,
    isApproved: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_food',
    name: 'Food & Beverage',
    description: 'Restaurants, cafes, and food services',
    icon: 'UtensilsCrossed',
    isActive: true,
    isApproved: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Personal Care',
    description: 'Hair, makeup, skincare, and salon services',
    icon: 'Sparkles',
    isActive: true,
    isApproved: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_lifestyle',
    name: 'Lifestyle & Home',
    description: 'Home goods, lifestyle products, and services',
    icon: 'Home',
    isActive: true,
    isApproved: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock store listings
const mockStoreListings: StoreListing[] = [
  {
    id: 'store_001',
    name: 'Stepping Style Boutique',
    description: 'Premium dance attire and accessories for the modern stepper. We specialize in elegant outfits perfect for stepping events and social dancing.',
    categoryId: 'cat_fashion',
    ownerId: 'user_001',
    ownerName: 'Michelle Johnson',
    contactInfo: {
      email: 'info@steppingstyle.com',
      phone: '(312) 555-0123',
      website: 'https://steppingstyle.com',
      instagram: '@steppingstyle'
    },
    address: {
      street: '123 Michigan Avenue',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      isOnlineOnly: false,
      coordinates: { lat: 41.8781, lng: -87.6298 }
    },
    operatingHours: {
      monday: { open: '10:00', close: '19:00' },
      tuesday: { open: '10:00', close: '19:00' },
      wednesday: { open: '10:00', close: '19:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '21:00' },
      saturday: { open: '09:00', close: '20:00' },
      sunday: { open: '11:00', close: '18:00' }
    },
    images: [
      {
        id: 'img_001',
        url: '/placeholder.svg',
        alt: 'Store front',
        isPrimary: true,
        uploadedAt: '2024-01-01T00:00:00Z'
      }
    ],
    tags: ['dance fashion', 'stepping attire', 'formal wear', 'chicago'],
    isActive: true,
    isPending: false,
    isVerified: true,
    averageRating: 4.8,
    totalRatings: 24,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    viewCount: 156
  },
  {
    id: 'store_002',
    name: 'Sole Steps Dance Shoes',
    description: 'Professional dance shoes for stepping, with custom fitting and repair services. Family-owned business serving the community for over 15 years.',
    categoryId: 'cat_dance_gear',
    ownerId: 'user_002',
    ownerName: 'Robert Williams',
    contactInfo: {
      email: 'orders@solesteps.com',
      phone: '(404) 555-0456',
      website: 'https://solesteps.com'
    },
    address: {
      street: '456 Peachtree Street',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'US',
      isOnlineOnly: false,
      coordinates: { lat: 33.7490, lng: -84.3880 }
    },
    images: [
      {
        id: 'img_002',
        url: '/placeholder.svg',
        alt: 'Dance shoes display',
        isPrimary: true,
        uploadedAt: '2024-01-01T00:00:00Z'
      }
    ],
    tags: ['dance shoes', 'stepping shoes', 'custom fitting', 'atlanta'],
    isActive: true,
    isPending: false,
    isVerified: true,
    averageRating: 4.9,
    totalRatings: 38,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    viewCount: 203
  }
];

class StoreDirectoryService {
  // Get all store categories
  async getStoreCategories(): Promise<StoreCategory[]> {
    return Promise.resolve(mockStoreCategories.filter(cat => cat.isActive));
  }

  // Search categories with autocomplete
  async searchCategories(query: string): Promise<StoreCategory[]> {
    const filtered = mockStoreCategories.filter(cat => 
      cat.isActive && 
      cat.name.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(filtered);
  }

  // Submit a new store listing
  async submitStoreListing(data: StoreSubmissionData): Promise<StoreListing> {
    const newStore: StoreListing = {
      id: `store_${Date.now()}`,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      ownerId: 'current_user_id', // Would come from auth context
      ownerName: 'Current User', // Would come from auth context
      contactInfo: data.contactInfo,
      address: data.address,
      operatingHours: data.operatingHours,
      images: [], // Would handle image upload separately
      tags: data.tags,
      isActive: false, // Starts inactive until approved
      isPending: true,
      isVerified: false,
      averageRating: 5.0, // Default 5-star rating
      totalRatings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0
    };

    // If user suggested a new category, handle that
    if (data.suggestedCategory) {
      const suggestedCat: StoreCategory = {
        id: `suggested_${Date.now()}`,
        name: data.suggestedCategory,
        description: `User suggested: ${data.suggestedCategory}`,
        isActive: false,
        isApproved: false,
        suggestedBy: 'current_user_id',
        createdAt: new Date().toISOString()
      };
      // In real implementation, this would be saved for admin review
      console.log('New category suggestion:', suggestedCat);
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return Promise.resolve(newStore);
  }

  // Get store listings for a user
  async getUserStoreListings(userId: string): Promise<StoreListing[]> {
    const userStores = mockStoreListings.filter(store => store.ownerId === userId);
    return Promise.resolve(userStores);
  }

  // Update an existing store listing
  async updateStoreListing(storeId: string, data: Partial<StoreSubmissionData>): Promise<StoreListing> {
    const existingStore = mockStoreListings.find(store => store.id === storeId);
    if (!existingStore) {
      throw new Error('Store not found');
    }

    const updatedStore: StoreListing = {
      ...existingStore,
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return Promise.resolve(updatedStore);
  }

  // Get all store listings (for browsing)
  async getStoreListings(filters?: {
    category?: string;
    location?: string;
    search?: string;
    isVerified?: boolean;
  }): Promise<StoreListing[]> {
    let filtered = mockStoreListings.filter(store => store.isActive && !store.isPending);

    if (filters?.category) {
      filtered = filtered.filter(store => store.categoryId === filters.category);
    }

    if (filters?.location) {
      filtered = filtered.filter(store => 
        store.address.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        store.address.state.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(query) ||
        store.description.toLowerCase().includes(query) ||
        store.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters?.isVerified !== undefined) {
      filtered = filtered.filter(store => store.isVerified === filters.isVerified);
    }

    return Promise.resolve(filtered);
  }

  // Get single store by ID
  async getStoreById(storeId: string): Promise<StoreListing | null> {
    const store = mockStoreListings.find(store => store.id === storeId);
    if (store) {
      // Increment view count
      store.viewCount++;
    }
    return Promise.resolve(store || null);
  }

  // Upload store images
  async uploadStoreImages(storeId: string, files: File[]): Promise<StoreImage[]> {
    const images: StoreImage[] = files.map((file, index) => ({
      id: `img_${storeId}_${Date.now()}_${index}`,
      url: URL.createObjectURL(file), // In real implementation, would upload to storage
      alt: file.name,
      isPrimary: index === 0,
      uploadedAt: new Date().toISOString()
    }));

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return Promise.resolve(images);
  }

  // Suggest a new category
  async suggestCategory(name: string, description: string): Promise<void> {
    const suggestion: StoreCategory = {
      id: `suggested_${Date.now()}`,
      name,
      description,
      isActive: false,
      isApproved: false,
      suggestedBy: 'current_user_id',
      createdAt: new Date().toISOString()
    };

    // In real implementation, would save for admin review
    console.log('Category suggestion submitted:', suggestion);
    
    return Promise.resolve();
  }
}

export const storeDirectoryService = new StoreDirectoryService(); 