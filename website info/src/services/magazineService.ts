import { MagazineCategory, MagazineArticle, ArticleListResponse } from '@/hooks/useMagazine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Mock data for development (since backend might not be running)
const mockCategories: MagazineCategory[] = [
  {
    id: 1,
    name: 'Cover Story',
    slug: 'cover-story',
    description: 'Our featured cover stories highlighting the most important topics in dance and fitness',
    articleCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Tech',
    slug: 'tech',
    description: 'Technology innovations in dance, fitness tracking, and digital platforms',
    articleCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Health, wellness, and lifestyle content for dancers and fitness enthusiasts',
    articleCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Community',
    slug: 'community',
    description: 'Stories from our community members, instructors, and event organizers',
    articleCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Training',
    slug: 'training',
    description: 'Professional development, teaching techniques, and advanced training methods',
    articleCount: 6,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockArticles: MagazineArticle[] = [
  {
    id: 1,
    title: 'The Future of Dance Technology: How AR and VR are Transforming Learning',
    slug: 'future-dance-technology-ar-vr-transforming-learning',
    excerpt: 'Explore how augmented and virtual reality technologies are revolutionizing dance education and training methods.',
    featuredImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop',
    authorId: 1,
    authorName: 'Sarah Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    status: 'published',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    readTimeMinutes: 8,
    viewCount: 342,
    category: mockCategories[1], // Tech
    contentBlocks: [
      {
        id: 1,
        type: 'paragraph',
        content: '<p>The dance world is experiencing a technological revolution. From motion capture suits to virtual reality training environments, technology is reshaping how we learn, teach, and experience dance.</p>',
        order: 1
      },
      {
        id: 2,
        type: 'header',
        content: 'Virtual Reality in Dance Education',
        order: 2
      },
      {
        id: 3,
        type: 'paragraph',
        content: '<p>Virtual reality platforms are now offering immersive dance experiences that allow students to practice with world-renowned instructors from the comfort of their homes. Companies like DanceTech VR are pioneering this space with their groundbreaking applications.</p>',
        order: 3
      },
      {
        id: 4,
        type: 'image',
        content: '{"url": "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=400&fit=crop", "alt": "Person using VR headset for dance training", "caption": "VR technology enabling remote dance instruction"}',
        order: 4
      }
    ]
  },
  {
    id: 2,
    title: 'Building Sustainable Wellness Habits for Professional Dancers',
    slug: 'building-sustainable-wellness-habits-professional-dancers',
    excerpt: 'A comprehensive guide to maintaining physical and mental health throughout a demanding dance career.',
    featuredImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
    authorId: 2,
    authorName: 'Dr. Maria Rodriguez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    status: 'published',
    createdAt: '2024-11-28T14:00:00Z',
    updatedAt: '2024-11-28T14:00:00Z',
    readTimeMinutes: 12,
    viewCount: 528,
    category: mockCategories[2], // Lifestyle
    contentBlocks: [
      {
        id: 5,
        type: 'paragraph',
        content: '<p>Professional dancing demands extraordinary physical and mental resilience. This article explores evidence-based strategies for maintaining peak performance while preserving long-term health.</p>',
        order: 1
      },
      {
        id: 6,
        type: 'header',
        content: 'The Foundation: Sleep and Recovery',
        order: 2
      },
      {
        id: 7,
        type: 'paragraph',
        content: '<p>Quality sleep is non-negotiable for dancers. Research shows that adequate rest not only prevents injury but also enhances learning and memory consolidation of complex movement patterns.</p>',
        order: 3
      }
    ]
  },
  {
    id: 3,
    title: 'Spotlight: Local Dance Studio Creates Inclusive Community Space',
    slug: 'spotlight-local-dance-studio-inclusive-community-space',
    excerpt: 'How one studio is breaking barriers and creating opportunities for dancers of all backgrounds and abilities.',
    featuredImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=400&fit=crop',
    authorId: 3,
    authorName: 'Michael Thompson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    status: 'published',
    createdAt: '2024-11-25T16:00:00Z',
    updatedAt: '2024-11-25T16:00:00Z',
    readTimeMinutes: 6,
    viewCount: 289,
    category: mockCategories[3], // Community
    contentBlocks: [
      {
        id: 8,
        type: 'paragraph',
        content: '<p>In the heart of downtown, Movement for All Studio is redefining what it means to be an inclusive dance space. Founded by former professional dancer Anna Martinez, the studio welcomes everyone regardless of experience, background, or physical ability.</p>',
        order: 1
      },
      {
        id: 9,
        type: 'subheader',
        content: 'Breaking Down Barriers',
        order: 2
      },
      {
        id: 10,
        type: 'paragraph',
        content: '<p>"Dance should be accessible to everyone," says Martinez. "We offer adaptive classes, sliding scale pricing, and have made our entire facility wheelchair accessible."</p>',
        order: 3
      }
    ]
  }
];

class MagazineService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      // Return mock data when API is not available
      return this.getMockResponse(endpoint);
    }
  }

  private getMockResponse(endpoint: string): any {
    // Return appropriate mock data based on endpoint
    if (endpoint.includes('/categories')) {
      return mockCategories;
    }
    if (endpoint.includes('/articles')) {
      return {
        articles: mockArticles,
        total: mockArticles.length,
        page: 1,
        limit: 10,
        totalPages: 1
      };
    }
    return null;
  }

  // Public API methods
  async getCategories(): Promise<MagazineCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    return mockCategories;
  }

  async getArticles(filters: any = {}): Promise<ArticleListResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    let filteredArticles = [...mockArticles];
    
    // Apply filters
    if (filters.featured) {
      // For featured articles, return a subset
      filteredArticles = mockArticles.slice(0, 2);
    }
    
    if (filters.categorySlug) {
      const category = mockCategories.find(cat => cat.slug === filters.categorySlug);
      if (category) {
        filteredArticles = filteredArticles.filter(article => 
          article.category?.id === category.id
        );
      }
    }
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query))
      );
    }
    
    // Sort by creation date (newest first)
    filteredArticles.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return {
      articles: filteredArticles,
      total: filteredArticles.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(filteredArticles.length / (filters.limit || 10))
    };
  }

  async getArticlesByCategory(categorySlug: string, page = 1, limit = 10): Promise<ArticleListResponse> {
    return this.getArticles({ categorySlug, page, limit });
  }

  async getArticleBySlug(slug: string): Promise<MagazineArticle | null> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    const article = mockArticles.find(article => article.slug === slug);
    if (article && article.id) {
      // Increment view count (in real app, this would be server-side)
      article.viewCount = (article.viewCount || 0) + 1;
    }
    return article || null;
  }

  // Admin API methods
  async getAdminArticles(filters: any = {}): Promise<ArticleListResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    let filteredArticles = [...mockArticles];
    
    // Apply admin filters (including drafts)
    if (filters.status) {
      filteredArticles = filteredArticles.filter(article => article.status === filters.status);
    }
    
    if (filters.categoryId) {
      filteredArticles = filteredArticles.filter(article => 
        article.category?.id === filters.categoryId
      );
    }
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(query)
      );
    }
    
    // Sort by updated date (newest first)
    filteredArticles.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return {
      articles: filteredArticles,
      total: filteredArticles.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(filteredArticles.length / (filters.limit || 10))
    };
  }

  async createCategory(data: { name: string }): Promise<MagazineCategory> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const newCategory: MagazineCategory = {
      id: Math.max(...mockCategories.map(c => c.id)) + 1,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: `Explore our collection of ${data.name.toLowerCase()} articles`,
      articleCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCategories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: number, data: { name?: string }): Promise<MagazineCategory> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    
    const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...mockCategories[categoryIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    if (data.name) {
      updatedCategory.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    mockCategories[categoryIndex] = updatedCategory;
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
    
    const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    // Check if category has articles
    const hasArticles = mockArticles.some(article => article.category?.id === id);
    if (hasArticles) {
      throw new Error('Cannot delete category that contains articles');
    }
    
    mockCategories.splice(categoryIndex, 1);
  }

  async createArticle(data: any): Promise<MagazineArticle> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const category = mockCategories.find(cat => cat.id === data.magazineCategoryId);
    
    const newArticle: MagazineArticle = {
      id: Math.max(...mockArticles.map(a => a.id)) + 1,
      title: data.title,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      authorId: 1, // Current admin user
      authorName: 'Current Admin',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTimeMinutes: Math.max(1, Math.floor((data.contentBlocks || []).length * 2)),
      viewCount: 0,
      category: category,
      contentBlocks: (data.contentBlocks || []).map((block: any, index: number) => ({
        id: Date.now() + index,
        type: block.type,
        content: block.content,
        order: block.order
      }))
    };
    
    mockArticles.unshift(newArticle);
    return newArticle;
  }

  async updateArticle(id: number, data: any): Promise<MagazineArticle> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const articleIndex = mockArticles.findIndex(article => article.id === id);
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    const category = data.magazineCategoryId ? 
      mockCategories.find(cat => cat.id === data.magazineCategoryId) : 
      mockArticles[articleIndex].category;
    
    const updatedArticle = {
      ...mockArticles[articleIndex],
      ...data,
      category: category,
      updatedAt: new Date().toISOString()
    };
    
    if (data.title) {
      updatedArticle.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    if (data.contentBlocks) {
      updatedArticle.contentBlocks = data.contentBlocks.map((block: any, index: number) => ({
        id: block.id || Date.now() + index,
        type: block.type,
        content: block.content,
        order: block.order
      }));
    }
    
    mockArticles[articleIndex] = updatedArticle;
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
    
    const articleIndex = mockArticles.findIndex(article => article.id === id);
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    mockArticles.splice(articleIndex, 1);
  }
}

export const magazineService = new MagazineService(); 