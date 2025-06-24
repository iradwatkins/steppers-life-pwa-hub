/**
 * Magazine Service - Enhanced Content Management System
 * 
 * Comprehensive magazine service for managing articles, categories, tags, and comments
 * with rich text editing, YouTube integration, issue management, and magazine-specific features.
 */

import { apiClient } from './apiClient';
import {
  MagazineArticle,
  MagazineCategory,
  MagazineTag,
  MagazineComment,
  CreateMagazineArticleData,
  UpdateMagazineArticleData,
  MagazineListFilters,
  MagazineStats,
  MagazineIssue
} from '@/types/magazine';

class MagazineService {
  private baseUrl = '/api/v1/magazine';

  /**
   * Get all magazine articles with filtering and pagination
   */
  async getArticles(filters?: MagazineListFilters): Promise<{
    articles: MagazineArticle[];
    categories: MagazineCategory[];
    tags: MagazineTag[];
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

      const response = await apiClient.get(`${this.baseUrl}/articles?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching magazine articles:', error);
      // Return mock data for development
      return this.getMockMagazineData(filters);
    }
  }

  /**
   * Get a single magazine article by slug
   */
  async getArticleBySlug(slug: string): Promise<MagazineArticle> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/articles/slug/${slug}`);
      
      // Track article view
      this.trackArticleView(response.data.id);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching magazine article:', error);
      throw new Error('Magazine article not found');
    }
  }

  /**
   * Get a single magazine article by ID
   */
  async getArticleById(id: string): Promise<MagazineArticle> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching magazine article by ID:', error);
      throw new Error('Magazine article not found');
    }
  }

  /**
   * Get featured articles for magazine homepage
   */
  async getFeaturedArticles(): Promise<MagazineArticle[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/articles/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      return this.getMockFeaturedArticles();
    }
  }

  /**
   * Get cover stories
   */
  async getCoverStories(): Promise<MagazineArticle[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/articles/cover-stories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cover stories:', error);
      return this.getMockCoverStories();
    }
  }

  /**
   * Get articles by section
   */
  async getArticlesBySection(section: string): Promise<MagazineArticle[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/articles/section/${section}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching articles by section:', error);
      return [];
    }
  }

  /**
   * Create a new magazine article
   */
  async createArticle(articleData: CreateMagazineArticleData): Promise<MagazineArticle> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/articles`, {
        ...articleData,
        slug: this.generateSlug(articleData.title),
        reading_time_minutes: this.calculateReadingTime(articleData.content)
      });

      console.log('Magazine article created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating magazine article:', error);
      throw new Error('Failed to create magazine article');
    }
  }

  /**
   * Update an existing magazine article
   */
  async updateArticle(articleData: UpdateMagazineArticleData): Promise<MagazineArticle> {
    try {
      const updateData = { ...articleData };
      
      if (articleData.title) {
        updateData.slug = this.generateSlug(articleData.title);
      }
      
      if (articleData.content) {
        updateData.reading_time_minutes = this.calculateReadingTime(articleData.content);
      }

      const response = await apiClient.patch(`${this.baseUrl}/articles/${articleData.id}`, updateData);

      console.log('Magazine article updated:', articleData.id);

      return response.data;
    } catch (error) {
      console.error('Error updating magazine article:', error);
      throw new Error('Failed to update magazine article');
    }
  }

  /**
   * Delete a magazine article
   */
  async deleteArticle(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/articles/${id}`);

      console.log('Magazine article deleted:', id);
    } catch (error) {
      console.error('Error deleting magazine article:', error);
      throw new Error('Failed to delete magazine article');
    }
  }

  /**
   * Publish a draft article
   */
  async publishArticle(id: string): Promise<MagazineArticle> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/articles/${id}/publish`);

      console.log('Magazine article published:', id);

      return response.data;
    } catch (error) {
      console.error('Error publishing magazine article:', error);
      throw new Error('Failed to publish magazine article');
    }
  }

  /**
   * Set article as featured
   */
  async setFeaturedArticle(id: string, featured: boolean): Promise<MagazineArticle> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/articles/${id}/featured`, {
        is_featured: featured
      });

      console.log('Magazine article featured status updated:', id, featured);

      return response.data;
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw new Error('Failed to update featured status');
    }
  }

  /**
   * Set article as cover story
   */
  async setCoverStory(id: string, isCoverStory: boolean): Promise<MagazineArticle> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/articles/${id}/cover-story`, {
        is_cover_story: isCoverStory
      });

      console.log('Magazine article cover story status updated:', id, isCoverStory);

      return response.data;
    } catch (error) {
      console.error('Error updating cover story status:', error);
      throw new Error('Failed to update cover story status');
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<MagazineCategory[]> {
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
    section_type: 'department' | 'feature' | 'regular';
    display_order: number;
  }): Promise<MagazineCategory> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/categories`, {
        ...categoryData,
        slug: this.generateSlug(categoryData.name)
      });

      console.log('Magazine category created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<MagazineTag[]> {
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
  }): Promise<MagazineTag> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/tags`, {
        ...tagData,
        slug: this.generateSlug(tagData.name)
      });

      console.log('Magazine tag created:', response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }
  }

  /**
   * Get magazine statistics
   */
  async getStats(): Promise<MagazineStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching magazine stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Get magazine issues
   */
  async getIssues(): Promise<MagazineIssue[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/issues`);
      return response.data;
    } catch (error) {
      console.error('Error fetching magazine issues:', error);
      return [];
    }
  }

  /**
   * Upload an image for magazine articles
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
   * Track article view
   */
  private async trackArticleView(articleId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/articles/${articleId}/view`);
    } catch (error) {
      console.error('Error tracking article view:', error);
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
  private getMockMagazineData(filters?: MagazineListFilters): {
    articles: MagazineArticle[];
    categories: MagazineCategory[];
    tags: MagazineTag[];
    total: number;
  } {
    const mockArticles: MagazineArticle[] = [
      {
        id: '1',
        title: 'The Evolution of Chicago Stepping: From the 1970s to Today',
        slug: 'evolution-chicago-stepping-1970s-today',
        excerpt: 'Explore the rich history and cultural significance of Chicago stepping, from its origins in the African American community to its modern-day evolution.',
        content: '<p>Chicago stepping is a partner dance that combines smooth footwork with elegant styling...</p>',
        featured_image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
        featured_image_alt: 'Historic Chicago stepping dancers',
        author_id: 'admin',
        author_name: 'Marcus Johnson',
        author_bio: 'Cultural historian specializing in African American dance traditions',
        status: 'published',
        published_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-14T15:30:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        categories: [
          { id: '1', name: 'Culture & History', slug: 'culture-history', post_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'feature', display_order: 1 }
        ],
        tags: [
          { id: '1', name: 'Chicago Stepping', slug: 'chicago-stepping', post_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
          { id: '2', name: 'History', slug: 'history', post_count: 8, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        ],
        youtube_video_id: 'dQw4w9WgXcQ',
        reading_time_minutes: 8,
        view_count: 1247,
        like_count: 89,
        comment_count: 23,
        issue_number: '2024-01',
        section: 'Culture',
        is_cover_story: true,
        is_featured: true,
        article_type: 'feature',
        photo_essay: false,
        gallery_images: [],
        pull_quotes: ['The elegance of stepping lies not just in the moves, but in the connection between partners and the music.']
      },
      {
        id: '2',
        title: 'Mastering the Turn: Advanced Stepping Techniques',
        slug: 'mastering-turn-advanced-stepping-techniques',
        excerpt: 'Learn the secrets behind smooth, controlled turns that will elevate your stepping game to the next level.',
        content: '<p>Advanced stepping requires precision, timing, and connection...</p>',
        featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        featured_image_alt: 'Stepping dancers performing advanced turn',
        author_id: 'instructor1',
        author_name: 'Diana Williams',
        author_bio: 'Professional stepping instructor with 20+ years experience',
        status: 'published',
        published_at: '2024-01-10T14:00:00Z',
        created_at: '2024-01-09T12:00:00Z',
        updated_at: '2024-01-10T14:00:00Z',
        categories: [
          { id: '2', name: 'Techniques', slug: 'techniques', post_count: 18, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'regular', display_order: 2 }
        ],
        tags: [
          { id: '3', name: 'Advanced', slug: 'advanced', post_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
          { id: '4', name: 'Turns', slug: 'turns', post_count: 6, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
        ],
        reading_time_minutes: 6,
        view_count: 892,
        like_count: 67,
        comment_count: 15,
        issue_number: '2024-01',
        section: 'Techniques',
        is_cover_story: false,
        is_featured: true,
        article_type: 'technique',
        photo_essay: false,
        gallery_images: [],
        pull_quotes: []
      }
    ];

    const mockCategories = this.getMockCategories();
    const mockTags = this.getMockTags();

    return {
      articles: mockArticles,
      categories: mockCategories,
      tags: mockTags,
      total: mockArticles.length
    };
  }

  private getMockFeaturedArticles(): MagazineArticle[] {
    return this.getMockMagazineData().articles.filter(article => article.is_featured);
  }

  private getMockCoverStories(): MagazineArticle[] {
    return this.getMockMagazineData().articles.filter(article => article.is_cover_story);
  }

  private getMockCategories(): MagazineCategory[] {
    return [
      { id: '1', name: 'Culture & History', slug: 'culture-history', description: 'Exploring stepping culture and heritage', post_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'feature', display_order: 1 },
      { id: '2', name: 'Techniques', slug: 'techniques', description: 'Dance techniques and instruction', post_count: 18, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'regular', display_order: 2 },
      { id: '3', name: 'Profiles', slug: 'profiles', description: 'Community member spotlights', post_count: 8, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'feature', display_order: 3 },
      { id: '4', name: 'Events', slug: 'events', description: 'Event coverage and previews', post_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'regular', display_order: 4 },
      { id: '5', name: 'Fashion & Style', slug: 'fashion-style', description: 'Stepping fashion and style tips', post_count: 7, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'department', display_order: 5 }
    ];
  }

  private getMockTags(): MagazineTag[] {
    return [
      { id: '1', name: 'Chicago Stepping', slug: 'chicago-stepping', post_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'History', slug: 'history', post_count: 8, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Advanced', slug: 'advanced', post_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'Beginner', slug: 'beginner', post_count: 20, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'Community', slug: 'community', post_count: 10, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'Music', slug: 'music', post_count: 6, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ];
  }

  private getMockStats(): MagazineStats {
    return {
      total_articles: 45,
      published_articles: 38,
      draft_articles: 7,
      total_views: 12470,
      total_likes: 892,
      total_comments: 234,
      categories_count: 5,
      tags_count: 12,
      most_viewed_articles: [],
      most_liked_articles: [],
      recent_articles: [],
      featured_articles: [],
      cover_stories: []
    };
  }
}

export const magazineService = new MagazineService();

// Backwards compatibility export
export const blogService = magazineService;