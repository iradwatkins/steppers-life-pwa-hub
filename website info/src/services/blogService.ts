import { 
  BlogPost, 
  BlogCategory, 
  BlogStats, 
  CreateBlogPostRequest, 
  UpdateBlogPostRequest, 
  BlogSearchFilters, 
  BlogListResponse,
  BlogEmbed
} from '@/types/blog';

// Mock data for development
const mockCategories: BlogCategory[] = [
  {
    id: '1',
    name: 'Dance Tips',
    slug: 'dance-tips',
    description: 'Tips and techniques for better dancing',
    color: '#3B82F6',
    postCount: 12
  },
  {
    id: '2',
    name: 'Event Planning',
    slug: 'event-planning',
    description: 'Guide to organizing successful dance events',
    color: '#10B981',
    postCount: 8
  },
  {
    id: '3',
    name: 'Community Spotlight',
    slug: 'community-spotlight',
    description: 'Featuring amazing people in our community',
    color: '#F59E0B',
    postCount: 15
  },
  {
    id: '4',
    name: 'Instructor Stories',
    slug: 'instructor-stories',
    description: 'Stories and insights from dance instructors',
    color: '#EF4444',
    postCount: 6
  }
];

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Hosting Your First Dance Event',
    slug: 'ultimate-guide-hosting-first-dance-event',
    content: `# The Ultimate Guide to Hosting Your First Dance Event

Hosting your first dance event can be both exciting and overwhelming. Whether you're planning a small community gathering or a larger celebration, this comprehensive guide will walk you through everything you need to know to create a memorable experience for your attendees.

## Planning Phase

### 1. Define Your Vision
Before diving into logistics, take time to clearly define what kind of event you want to host. Consider:
- What style of dance will be featured?
- What's the target audience (beginners, intermediate, advanced, all levels)?
- What's the overall vibe you're going for (casual, formal, educational, purely social)?

### 2. Set Your Budget
Establish a realistic budget early in the planning process. Key expenses to consider include:
- Venue rental
- Instructor fees
- Sound system and equipment
- Marketing and promotion
- Refreshments
- Insurance
- Decorations and ambiance

## Venue Selection

Choose a venue that matches your event's scale and style. Important factors:
- **Space**: Ensure adequate room for dancing with proper flooring
- **Sound System**: Professional audio equipment is crucial
- **Parking**: Convenient access for attendees
- **Amenities**: Restrooms, coat check, seating areas
- **Accessibility**: Ensure the venue is accessible to all attendees

## Marketing Your Event

Effective promotion is key to a successful turnout:
- Create compelling event descriptions
- Use high-quality photos and videos
- Leverage social media platforms
- Partner with local dance communities
- Offer early bird discounts
- Encourage word-of-mouth marketing

Remember, your first event doesn't need to be perfect – it just needs to bring people together to enjoy dancing!`,
    excerpt: 'A comprehensive guide for first-time event organizers covering planning, venue selection, and marketing strategies for successful dance events.',
    featuredImage: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&h=400&fit=crop',
    authorId: 'admin-1',
    authorName: 'Sarah Martinez',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'published',
    publishedAt: '2024-12-18T10:00:00Z',
    createdAt: '2024-12-17T14:30:00Z',
    updatedAt: '2024-12-18T09:45:00Z',
    tags: ['event planning', 'dance events', 'beginners guide', 'community'],
    categories: ['event-planning'],
    readTimeMinutes: 8,
    viewCount: 342,
    featured: true,
    seoTitle: 'Complete Guide to Hosting Your First Dance Event | SteppersLife',
    seoDescription: 'Learn how to plan, organize, and execute your first dance event successfully with our comprehensive step-by-step guide.',
    embeds: [
      {
        id: 'embed-1',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Event Planning Basics for Dance Organizers',
        startTime: 30,
        endTime: 180,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        position: 1
      }
    ]
  },
  {
    id: '2',
    title: '5 Essential Dance Tips for Absolute Beginners',
    slug: '5-essential-dance-tips-absolute-beginners',
    content: `# 5 Essential Dance Tips for Absolute Beginners

Starting your dance journey can feel intimidating, but with the right mindset and basic techniques, you'll be moving confidently on the dance floor in no time. Here are five fundamental tips that every beginner should know.

## 1. Start with the Basics

Don't rush into complex moves. Master the fundamental steps first:
- Learn proper posture and alignment
- Practice basic rhythm and timing
- Focus on simple step patterns
- Build muscle memory through repetition

## 2. Listen to the Music

Dancing is all about connecting with the music:
- Count the beats (most dance music is in 4/4 time)
- Feel the rhythm in your body
- Don't just hear the music, let it move you
- Start with slower songs to practice timing

## 3. Don't Be Afraid to Make Mistakes

Every dancer was once a beginner:
- Mistakes are part of the learning process
- Focus on progress, not perfection
- Laugh at yourself when you mess up
- Remember that everyone is focused on their own dancing

## 4. Take Classes and Practice Regularly

Consistent practice is key to improvement:
- Attend beginner-friendly classes
- Practice at home between lessons
- Watch dance videos online for extra tips
- Set aside dedicated practice time each week

## 5. Have Fun and Be Patient

Dancing should be enjoyable:
- Don't put too much pressure on yourself
- Celebrate small victories
- Find joy in the movement
- Be patient – skill development takes time

Remember, everyone progresses at their own pace. Focus on enjoying the journey rather than comparing yourself to others!`,
    excerpt: 'Five fundamental tips to help absolute beginners start their dance journey with confidence and proper technique.',
    featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    authorId: 'admin-1',
    authorName: 'Sarah Martinez',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'published',
    publishedAt: '2024-12-15T14:00:00Z',
    createdAt: '2024-12-14T16:20:00Z',
    updatedAt: '2024-12-15T13:30:00Z',
    tags: ['beginner tips', 'dance basics', 'learning', 'fundamentals'],
    categories: ['dance-tips'],
    readTimeMinutes: 5,
    viewCount: 528,
    featured: false,
    embeds: []
  },
  {
    id: '3',
    title: 'Community Spotlight: Meet Maria Rodriguez, Salsa Instructor Extraordinaire',
    slug: 'community-spotlight-maria-rodriguez-salsa-instructor',
    content: `# Community Spotlight: Meet Maria Rodriguez, Salsa Instructor Extraordinaire

This month, we're thrilled to feature Maria Rodriguez, a passionate salsa instructor who has been lighting up dance floors across the city for over a decade. Her infectious energy and dedication to the dance community make her a perfect addition to our Community Spotlight series.

## The Beginning of a Journey

Maria's love affair with salsa began somewhat unexpectedly. "I was actually attending a friend's birthday party at a Latin restaurant," she recalls with a smile. "There was live music, and people started dancing. I was mesmerized by the connection between the dancers and the music – it was like they were having a conversation without words."

That evening sparked a passion that would eventually reshape Maria's entire life. Within weeks, she had enrolled in her first salsa class and was practicing every spare moment she had.

## From Student to Teacher

After just two years of intensive training, Maria's instructors encouraged her to start teaching. "I was terrified at first," she admits. "But I realized that teaching would help me understand the dance even better, and I loved the idea of sharing this beautiful art form with others."

What started as assisting with beginner classes evolved into Maria developing her own unique teaching methodology. She focuses on breaking down complex movements into digestible steps while never losing sight of the emotional connection that makes salsa so captivating.

## Building Community Through Dance

"Salsa isn't just about the steps," Maria explains. "It's about building community, creating connections, and expressing joy through movement. When I see two complete strangers connect through dance in my class, that's when I know I'm doing something meaningful."

Maria has taught hundreds of students over the years, many of whom have become lifelong friends and continue to be active in the local dance community. Her classes are known for their welcoming atmosphere and emphasis on both technique and cultural appreciation.

## Looking Forward

When asked about her goals for the future, Maria's eyes light up. "I want to continue growing the salsa community here. I'm working on organizing a monthly social dance event and possibly bringing in guest instructors from different Latin American countries to share their regional styles."

Maria Rodriguez embodies everything we love about the SteppersLife community – passion, dedication, and a commitment to bringing people together through dance. If you haven't taken one of her classes yet, we highly recommend checking out her schedule on our platform.

*Want to be featured in our Community Spotlight? Send us your story at community@stepperslife.com*`,
    excerpt: 'Meet Maria Rodriguez, a passionate salsa instructor who has been building community through dance for over a decade.',
    featuredImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
    authorId: 'admin-2',
    authorName: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'published',
    publishedAt: '2024-12-12T16:00:00Z',
    createdAt: '2024-12-11T10:15:00Z',
    updatedAt: '2024-12-12T15:45:00Z',
    tags: ['community spotlight', 'salsa', 'instructor profile', 'inspiration'],
    categories: ['community-spotlight'],
    readTimeMinutes: 6,
    viewCount: 267,
    featured: true,
    embeds: [
      {
        id: 'embed-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop',
        title: 'Maria teaching a salsa class',
        description: 'Maria Rodriguez leading a beginner salsa class at SteppersLife Studio',
        position: 2
      }
    ]
  },
  {
    id: '4',
    title: 'The Psychology of Partner Dancing: Building Trust on the Dance Floor',
    slug: 'psychology-partner-dancing-building-trust',
    content: `# The Psychology of Partner Dancing: Building Trust on the Dance Floor

Partner dancing is much more than coordinated movement – it's a complex psychological interaction that requires trust, communication, and mutual respect. Understanding the mental aspects of partner dancing can dramatically improve your experience and connection with your dance partners.

## The Foundation: Trust and Vulnerability

When you step onto the dance floor with a partner, you're entering into a unique form of non-verbal communication. This requires a level of trust and vulnerability that many people find challenging at first.

### Physical Trust
- Trusting your partner to lead/follow appropriately
- Feeling safe in lifts, dips, and spins
- Confidence in your partner's spatial awareness

### Emotional Trust
- Being comfortable with physical proximity
- Allowing yourself to be guided or to guide others
- Accepting and giving constructive feedback

## Communication Without Words

Partner dancing creates its own language:
- **Lead and Follow**: A conversation in tension and release
- **Body Language**: Posture conveys confidence and intention
- **Eye Contact**: Maintains connection and shows engagement
- **Energy Exchange**: Sharing rhythm and musical interpretation

## Common Psychological Barriers

### Performance Anxiety
Many dancers struggle with fear of judgment or making mistakes. Remember:
- Everyone is learning and improving
- Mistakes are opportunities for growth
- Focus on the joy of movement rather than perfection

### Control Issues
Both leaders and followers can struggle with control:
- Leaders may over-lead or under-communicate
- Followers might back-lead or resist the partnership
- Balance comes with practice and mutual respect

### Personal Space Boundaries
Partner dancing requires comfortable physical proximity:
- Start with clear communication about comfort levels
- Respect personal boundaries at all times
- Build intimacy gradually through consistent, respectful interaction

## Building Better Partnerships

### For Leaders:
- Provide clear, confident guidance
- Be responsive to your partner's needs and abilities
- Create a safe space for exploration and mistakes

### For Followers:
- Stay present and responsive
- Communicate your boundaries clearly
- Trust in the partnership while maintaining your own balance

### For Everyone:
- Practice active listening with your body
- Stay present in the moment
- Celebrate the unique connection each partnership brings

## The Therapeutic Benefits

Research shows that partner dancing offers numerous psychological benefits:
- Reduced stress and anxiety
- Improved self-confidence
- Enhanced social connection
- Better emotional regulation
- Increased mindfulness and presence

Partner dancing teaches us valuable life skills: how to communicate without words, how to trust and be trustworthy, how to be present in our bodies, and how to create something beautiful together. These lessons extend far beyond the dance floor into our daily relationships and interactions.

Next time you dance with a partner, remember that you're not just learning steps – you're practicing the art of human connection.`,
    excerpt: 'Exploring the mental aspects of partner dancing and how trust, communication, and vulnerability create meaningful connections on the dance floor.',
    featuredImage: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=400&fit=crop',
    authorId: 'guest-1',
    authorName: 'Dr. Jessica Thompson',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'published',
    publishedAt: '2024-12-10T12:00:00Z',
    createdAt: '2024-12-09T14:45:00Z',
    updatedAt: '2024-12-10T11:30:00Z',
    tags: ['psychology', 'partner dancing', 'trust', 'communication', 'mental health'],
    categories: ['dance-tips', 'instructor-stories'],
    readTimeMinutes: 7,
    viewCount: 189,
    featured: false,
    embeds: []
  },
  {
    id: '5',
    title: 'How to Choose the Right Dance Shoes: A Complete Guide',
    slug: 'how-to-choose-right-dance-shoes-complete-guide',
    content: `# How to Choose the Right Dance Shoes: A Complete Guide

Draft content for upcoming blog post about selecting appropriate dance footwear for different dance styles and skill levels...`,
    excerpt: 'Comprehensive guide to selecting the perfect dance shoes for your style and skill level.',
    featuredImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=400&fit=crop',
    authorId: 'admin-1',
    authorName: 'Sarah Martinez',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'draft',
    publishedAt: undefined,
    createdAt: '2024-12-19T09:00:00Z',
    updatedAt: '2024-12-19T09:00:00Z',
    tags: ['dance shoes', 'equipment', 'beginners guide'],
    categories: ['dance-tips'],
    readTimeMinutes: 0,
    viewCount: 0,
    featured: false,
    embeds: []
  }
];

// Mock API functions
export const blogService = {
  // Public API functions
  async getPublishedPosts(filters: BlogSearchFilters = {}): Promise<BlogListResponse> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay for smoother experience
    
    let filteredPosts = mockPosts.filter(post => post.status === 'published');
    
    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (filters.category) {
      filteredPosts = filteredPosts.filter(post =>
        post.categories.includes(filters.category!)
      );
    }
    
    if (filters.tag) {
      filteredPosts = filteredPosts.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === filters.tag!.toLowerCase())
      );
    }
    
    if (filters.featured !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
    }
    
    // Sort by publish date (newest first)
    filteredPosts.sort((a, b) => 
      new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
    );
    
    return {
      posts: filteredPosts,
      total: filteredPosts.length,
      page: 1,
      limit: filteredPosts.length,
      totalPages: 1
    };
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const post = mockPosts.find(p => p.slug === slug && p.status === 'published');
    
    if (post) {
      // Increment view count (in real app, this would be server-side)
      post.viewCount += 1;
    }
    
    return post || null;
  },

  async getFeaturedPosts(): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockPosts
      .filter(post => post.status === 'published' && post.featured)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 3);
  },

  async getCategories(): Promise<BlogCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCategories;
  },

  // Admin API functions
  async getAllPosts(filters: BlogSearchFilters = {}): Promise<BlogListResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredPosts = [...mockPosts];
    
    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    }
    
    if (filters.status) {
      filteredPosts = filteredPosts.filter(post => post.status === filters.status);
    }
    
    if (filters.category) {
      filteredPosts = filteredPosts.filter(post =>
        post.categories.includes(filters.category!)
      );
    }
    
    // Sort by updated date (newest first)
    filteredPosts.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return {
      posts: filteredPosts,
      total: filteredPosts.length,
      page: 1,
      limit: filteredPosts.length,
      totalPages: 1
    };
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPosts.find(post => post.id === id) || null;
  },

  async createPost(data: CreateBlogPostRequest): Promise<BlogPost> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      authorId: 'current-admin-id',
      authorName: 'Current Admin',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTimeMinutes: Math.max(1, Math.floor(data.content.split(' ').length / 200)),
      viewCount: 0,
      embeds: data.embeds.map((embed, index) => ({
        ...embed,
        id: `embed-${Date.now()}-${index}`
      })),
      ...data
    };
    
    mockPosts.unshift(newPost);
    console.log('Created new blog post:', newPost.title);
    
    return newPost;
  },

  async updatePost(data: UpdateBlogPostRequest): Promise<BlogPost> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockPosts.findIndex(post => post.id === data.id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    const updatedPost: BlogPost = {
      ...mockPosts[index],
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: data.status === 'published' && !mockPosts[index].publishedAt 
        ? new Date().toISOString() 
        : mockPosts[index].publishedAt,
      readTimeMinutes: data.content 
        ? Math.max(1, Math.floor(data.content.split(' ').length / 200))
        : mockPosts[index].readTimeMinutes,
      embeds: data.embeds 
        ? data.embeds.map((embed, embedIndex) => ({
            ...embed,
            id: embed.id || `embed-${Date.now()}-${embedIndex}`
          }))
        : mockPosts[index].embeds
    };
    
    mockPosts[index] = updatedPost;
    console.log('Updated blog post:', updatedPost.title);
    
    return updatedPost;
  },

  async deletePost(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockPosts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    const deletedPost = mockPosts.splice(index, 1)[0];
    console.log('Deleted blog post:', deletedPost.title);
  },

  async getBlogStats(): Promise<BlogStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const publishedPosts = mockPosts.filter(post => post.status === 'published');
    const draftPosts = mockPosts.filter(post => post.status === 'draft');
    
    return {
      totalPosts: mockPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews: mockPosts.reduce((sum, post) => sum + post.viewCount, 0),
      totalComments: 0, // Will be implemented when comments are added
      popularPosts: publishedPosts
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5),
      recentPosts: publishedPosts
        .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
        .slice(0, 5)
    };
  }
}; 