/**
 * Blog Service - Epic I.001: Blog Management System
 * 
 * Comprehensive blog service for managing blog posts, categories, tags, and comments
 * with rich text editing, YouTube integration, and content management features.
 */

import { apiClient } from './apiClient';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  categories: BlogCategory[];
  tags: BlogTag[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  youtube_video_id?: string;
  youtube_start_time?: number;
  youtube_end_time?: number;
  reading_time_minutes: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  scheduled_at?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  post_count: number;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  post_count: number;
  created_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  author_avatar?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'deleted';
  created_at: string;
  updated_at: string;
  parent_id?: string;
  replies?: BlogComment[];
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  featured_image_alt?: string;
  status: 'draft' | 'published' | 'archived';
  category_ids: string[];
  tag_names: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  youtube_video_id?: string;
  youtube_start_time?: number;
  youtube_end_time?: number;
  scheduled_at?: string;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

export interface BlogListFilters {
  search?: string;
  category?: string;
  tag?: string;
  author_id?: string;
  status?: string;
  sort_by?: 'created_at' | 'published_at' | 'title' | 'view_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  total_comments: number;
  popular_posts: { id: string; title: string; view_count: number }[];
  recent_comments: BlogComment[];
}

class BlogService {
  private baseUrl = '/api/v1/blog';

  /**
   * Get all blog posts with filtering and pagination
   */
  async getPosts(filters?: BlogListFilters): Promise<{
    posts: BlogPost[];
    categories: BlogCategory[];
    tags: BlogTag[];
    total: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}/posts?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Return mock data for development
      return this.getMockBlogData(filters);
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/posts/slug/${slug}`);
      
      // Track post view
      this.trackPostView(response.data.id);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw new Error('Blog post not found');
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getPostById(id: string): Promise<BlogPost> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog post by ID:', error);
      throw new Error('Blog post not found');
    }
  }

  /**
   * Create a new blog post
   */
  async createPost(postData: CreateBlogPostData): Promise<BlogPost> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/posts`, {
        ...postData,
        slug: this.generateSlug(postData.title),
        reading_time_minutes: this.calculateReadingTime(postData.content)
      });

      // Track event for analytics (can be implemented later)
      console.log('Blog post created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw new Error('Failed to create blog post');
    }
  }

  /**
   * Update an existing blog post
   */
  async updatePost(postData: UpdateBlogPostData): Promise<BlogPost> {
    try {
      const updateData = { ...postData };
      
      if (postData.title) {
        updateData.slug = this.generateSlug(postData.title);
      }
      
      if (postData.content) {
        updateData.reading_time_minutes = this.calculateReadingTime(postData.content);
      }

      const response = await apiClient.patch(`${this.baseUrl}/posts/${postData.id}`, updateData);

      console.log('Blog post updated:', postData.id);

      return response.data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw new Error('Failed to update blog post');
    }
  }

  /**
   * Delete a blog post
   */
  async deletePost(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/posts/${id}`);

      console.log('Blog post deleted:', id);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw new Error('Failed to delete blog post');
    }
  }

  /**
   * Publish a draft post
   */
  async publishPost(id: string): Promise<BlogPost> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/posts/${id}/publish`);

      console.log('Blog post published:', id);

      return response.data;
    } catch (error) {
      console.error('Error publishing blog post:', error);
      throw new Error('Failed to publish blog post');
    }
  }

  /**
   * Schedule a post for future publication
   */
  async schedulePost(id: string, scheduledAt: string): Promise<BlogPost> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/posts/${id}/schedule`, {
        scheduled_at: scheduledAt
      });

      console.log('Blog post scheduled:', id, scheduledAt);

      return response.data;
    } catch (error) {
      console.error('Error scheduling blog post:', error);
      throw new Error('Failed to schedule blog post');
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getMockCategories();
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<BlogCategory> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/categories`, {
        ...categoryData,
        slug: this.generateSlug(categoryData.name)
      });

      console.log('Blog category created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<BlogTag[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/tags`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return this.getMockTags();
    }
  }

  /**
   * Create a new tag
   */
  async createTag(tagData: {
    name: string;
    color?: string;
  }): Promise<BlogTag> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/tags`, {
        ...tagData,
        slug: this.generateSlug(tagData.name)
      });

      console.log('Blog tag created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }
  }

  /**
   * Get blog statistics
   */
  async getStats(): Promise<BlogStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Upload an image for blog posts
   */
  async uploadImage(file: File): Promise<{ url: string; alt?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`${this.baseUrl}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Extract YouTube video ID from URL
   */
  extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Generate YouTube embed URL with custom start/end times
   */
  generateYouTubeEmbedUrl(videoId: string, startTime?: number, endTime?: number): string {
    let url = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams();

    if (startTime) {
      params.append('start', startTime.toString());
    }
    
    if (endTime) {
      params.append('end', endTime.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Track post view
   */
  private async trackPostView(postId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/posts/${postId}/view`);
    } catch (error) {
      console.error('Error tracking post view:', error);
      // Don't throw error for analytics
    }
  }

  /**
   * Generate URL slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Calculate reading time based on content
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Mock data for development
   */
  private getMockBlogData(filters?: BlogListFilters): {
    posts: BlogPost[];
    categories: BlogCategory[];
    tags: BlogTag[];
    total: number;
  } {
    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'The Art of Chicago Stepping: A Beginner\'s Guide',
        slug: 'art-of-chicago-stepping-beginners-guide',
        excerpt: 'Discover the smooth, sophisticated dance style that originated in Chicago and learn the basic steps to get you started.',
        content: '<p>Chicago stepping is a partner dance that combines smooth footwork with elegant styling...</p>',
        featured_image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
        featured_image_alt: 'Couple dancing Chicago stepping',
        author_id: 'admin',
        author_name: 'SteppersLife Team',
        status: 'published',
        published_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-14T15:30:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        categories: [
          { id: '1', name: 'Dance Tutorials', slug: 'dance-tutorials', post_count: 5, created_at: '2024-01-01T00:00:00Z' }
        ],
        tags: [
          { id: '1', name: 'Chicago Stepping', slug: 'chicago-stepping', post_count: 3, created_at: '2024-01-01T00:00:00Z' },
          { id: '2', name: 'Beginner', slug: 'beginner', post_count: 7, created_at: '2024-01-01T00:00:00Z' }
        ],
        youtube_video_id: 'dQw4w9WgXcQ',
        reading_time_minutes: 5,
        view_count: 247,
        like_count: 32,
        comment_count: 8
      },
      {
        id: '2',
        title: 'Event Planning: Creating Memorable Stepping Events',
        slug: 'event-planning-memorable-stepping-events',
        excerpt: 'Learn the essential elements of organizing successful stepping events that bring the community together.',
        content: '<p>Creating a memorable stepping event requires careful planning and attention to detail...</p>',
        featured_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        featured_image_alt: 'Event planning setup',
        author_id: 'admin',
        author_name: 'SteppersLife Team',
        status: 'published',
        published_at: '2024-01-10T14:00:00Z',
        created_at: '2024-01-09T12:00:00Z',
        updated_at: '2024-01-10T14:00:00Z',
        categories: [
          { id: '2', name: 'Event Planning', slug: 'event-planning', post_count: 3, created_at: '2024-01-01T00:00:00Z' }
        ],
        tags: [
          { id: '3', name: 'Events', slug: 'events', post_count: 5, created_at: '2024-01-01T00:00:00Z' },
          { id: '4', name: 'Community', slug: 'community', post_count: 4, created_at: '2024-01-01T00:00:00Z' }
        ],
        reading_time_minutes: 8,
        view_count: 186,
        like_count: 25,
        comment_count: 12
      }
    ];

    const mockCategories = this.getMockCategories();
    const mockTags = this.getMockTags();

    return {
      posts: mockPosts,
      categories: mockCategories,
      tags: mockTags,
      total: mockPosts.length
    };
  }

  private getMockCategories(): BlogCategory[] {
    return [
      { id: '1', name: 'Dance Tutorials', slug: 'dance-tutorials', description: 'Learn new dance moves and techniques', post_count: 5, created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Event Planning', slug: 'event-planning', description: 'Tips for organizing great events', post_count: 3, created_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Community Stories', slug: 'community-stories', description: 'Stories from our community members', post_count: 7, created_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'Health & Wellness', slug: 'health-wellness', description: 'Stay healthy while dancing', post_count: 2, created_at: '2024-01-01T00:00:00Z' }
    ];
  }

  private getMockTags(): BlogTag[] {
    return [
      { id: '1', name: 'Chicago Stepping', slug: 'chicago-stepping', post_count: 3, created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Beginner', slug: 'beginner', post_count: 7, created_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Events', slug: 'events', post_count: 5, created_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'Community', slug: 'community', post_count: 4, created_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'Advanced', slug: 'advanced', post_count: 2, created_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'Music', slug: 'music', post_count: 3, created_at: '2024-01-01T00:00:00Z' }
    ];
  }

  private getMockStats(): BlogStats {
    return {
      total_posts: 15,
      published_posts: 12,
      draft_posts: 3,
      total_views: 1247,
      total_comments: 89,
      popular_posts: [
        { id: '1', title: 'The Art of Chicago Stepping: A Beginner\'s Guide', view_count: 247 },
        { id: '2', title: 'Event Planning: Creating Memorable Stepping Events', view_count: 186 },
        { id: '3', title: 'Advanced Stepping Techniques', view_count: 164 }
      ],
      recent_comments: []
    };
  }
}

export const blogService = new BlogService();