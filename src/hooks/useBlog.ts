/**
 * Blog Hook - Epic I.001: Magazine Management System
 * 
 * React hook for managing blog/magazine state and operations with automatic
 * loading states, error handling, and optimistic updates.
 * Now uses magazine service for backwards compatibility.
 */

import { useState, useEffect, useCallback } from 'react';
import { magazineService as blogService } from '@/services/magazineService';
import { 
  BlogPost, 
  BlogCategory, 
  BlogTag, 
  BlogStats,
  CreateBlogPostData, 
  UpdateBlogPostData, 
  BlogListFilters 
} from '@/types/blog';
import { useToast } from '@/hooks/use-toast';

export interface UseBlogOptions {
  autoFetch?: boolean;
  filters?: BlogListFilters;
}

export interface UseBlogReturn {
  // State
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
  stats: BlogStats | null;
  loading: boolean;
  error: string | null;
  total: number;

  // Actions
  fetchPosts: (filters?: BlogListFilters) => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<BlogPost | null>;
  fetchPostById: (id: string) => Promise<BlogPost | null>;
  createPost: (postData: CreateBlogPostData) => Promise<BlogPost | null>;
  updatePost: (postData: UpdateBlogPostData) => Promise<BlogPost | null>;
  deletePost: (id: string) => Promise<boolean>;
  publishPost: (id: string) => Promise<BlogPost | null>;
  schedulePost: (id: string, scheduledAt: string) => Promise<BlogPost | null>;
  
  // Categories and Tags
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  createCategory: (categoryData: { name: string; description?: string; color?: string }) => Promise<BlogCategory | null>;
  createTag: (tagData: { name: string; color?: string }) => Promise<BlogTag | null>;
  
  // Media
  uploadImage: (file: File) => Promise<{ url: string; alt?: string } | null>;
  
  // Utilities
  fetchStats: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useBlog = (options: UseBlogOptions = {}): UseBlogReturn => {
  const { autoFetch = true, filters = {} } = options;
  const { toast } = useToast();

  // State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPosts(filters);
    }
  }, [autoFetch]);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Error handler
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Blog ${operation} error:`, error);
    const message = error.message || `Failed to ${operation}`;
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  // Success handler
  const handleSuccess = useCallback((message: string) => {
    clearError();
    toast({
      title: "Success",
      description: message,
    });
  }, [clearError, toast]);

  // Fetch posts with filtering
  const fetchPosts = useCallback(async (filters?: BlogListFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getArticles(filters);
      setPosts(response.articles);
      setCategories(response.categories);
      setTags(response.tags);
      setTotal(response.total);
    } catch (error) {
      handleError(error, 'fetch posts');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch single post by slug
  const fetchPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const post = await blogService.getArticleBySlug(slug);
      return post;
    } catch (error) {
      handleError(error, 'fetch post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch single post by ID
  const fetchPostById = useCallback(async (id: string): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const post = await blogService.getArticleById(id);
      return post;
    } catch (error) {
      handleError(error, 'fetch post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Create new post
  const createPost = useCallback(async (postData: CreateBlogPostData): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const newPost = await blogService.createArticle(postData);
      
      // Optimistic update
      setPosts(current => [newPost, ...current]);
      setTotal(current => current + 1);
      
      handleSuccess('Article created successfully');
      return newPost;
    } catch (error) {
      handleError(error, 'create post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Update existing post
  const updatePost = useCallback(async (postData: UpdateBlogPostData): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await blogService.updateArticle(postData);
      
      // Optimistic update
      setPosts(current => 
        current.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        )
      );
      
      handleSuccess('Article updated successfully');
      return updatedPost;
    } catch (error) {
      handleError(error, 'update post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Delete post
  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await blogService.deleteArticle(id);
      
      // Optimistic update
      setPosts(current => current.filter(post => post.id !== id));
      setTotal(current => current - 1);
      
      handleSuccess('Article deleted successfully');
      return true;
    } catch (error) {
      handleError(error, 'delete post');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Publish post
  const publishPost = useCallback(async (id: string): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const publishedPost = await blogService.publishArticle(id);
      
      // Optimistic update
      setPosts(current => 
        current.map(post => 
          post.id === publishedPost.id ? publishedPost : post
        )
      );
      
      handleSuccess('Article published successfully');
      return publishedPost;
    } catch (error) {
      handleError(error, 'publish post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Schedule post (deprecated - removed in magazine service)
  const schedulePost = useCallback(async (id: string, scheduledAt: string): Promise<BlogPost | null> => {
    console.warn('schedulePost is deprecated in magazine service');
    return null;
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categories = await blogService.getCategories();
      setCategories(categories);
    } catch (error) {
      handleError(error, 'fetch categories');
    }
  }, [handleError]);

  // Fetch tags
  const fetchTags = useCallback(async () => {
    try {
      const tags = await blogService.getTags();
      setTags(tags);
    } catch (error) {
      handleError(error, 'fetch tags');
    }
  }, [handleError]);

  // Create category
  const createCategory = useCallback(async (categoryData: { 
    name: string; 
    description?: string; 
    color?: string; 
  }): Promise<BlogCategory | null> => {
    try {
      const newCategory = await blogService.createCategory(categoryData);
      
      // Optimistic update
      setCategories(current => [...current, newCategory]);
      
      handleSuccess('Category created successfully');
      return newCategory;
    } catch (error) {
      handleError(error, 'create category');
      return null;
    }
  }, [handleError, handleSuccess]);

  // Create tag
  const createTag = useCallback(async (tagData: { 
    name: string; 
    color?: string; 
  }): Promise<BlogTag | null> => {
    try {
      const newTag = await blogService.createTag(tagData);
      
      // Optimistic update
      setTags(current => [...current, newTag]);
      
      handleSuccess('Tag created successfully');
      return newTag;
    } catch (error) {
      handleError(error, 'create tag');
      return null;
    }
  }, [handleError, handleSuccess]);

  // Upload image
  const uploadImage = useCallback(async (file: File): Promise<{ url: string; alt?: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.uploadImage(file);
      handleSuccess('Image uploaded successfully');
      return result;
    } catch (error) {
      handleError(error, 'upload image');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const stats = await blogService.getStats();
      setStats(stats);
    } catch (error) {
      handleError(error, 'fetch stats');
    }
  }, [handleError]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchPosts(filters),
      fetchCategories(),
      fetchTags(),
      fetchStats()
    ]);
  }, [fetchPosts, fetchCategories, fetchTags, fetchStats, filters]);

  return {
    // State
    posts,
    categories,
    tags,
    stats,
    loading,
    error,
    total,

    // Actions
    fetchPosts,
    fetchPostBySlug,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    schedulePost,

    // Categories and Tags
    fetchCategories,
    fetchTags,
    createCategory,
    createTag,

    // Media
    uploadImage,

    // Utilities
    fetchStats,
    refreshData,
    clearError
  };
};