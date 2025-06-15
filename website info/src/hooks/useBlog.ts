import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { blogService } from '@/services/blogService';
import { 
  BlogPost, 
  BlogCategory, 
  BlogStats, 
  CreateBlogPostRequest, 
  UpdateBlogPostRequest, 
  BlogSearchFilters, 
  BlogListResponse 
} from '@/types/blog';

// Hook for public blog functionality
export const useBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchPublishedPosts = useCallback(async (filters: BlogSearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getPublishedPosts(filters);
      setPosts(response.posts);
    } catch (err) {
      setError('Failed to fetch blog posts');
      console.error('Error fetching published posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const post = await blogService.getPostBySlug(slug);
      return post;
    } catch (err) {
      setError('Failed to fetch blog post');
      console.error('Error fetching post by slug:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = useCallback(async () => {
    try {
      const featured = await blogService.getFeaturedPosts();
      setFeaturedPosts(featured);
    } catch (err) {
      console.error('Error fetching featured posts:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Initialize data on mount - only once
  useEffect(() => {
    if (!initialized) {
      const initializeData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchPublishedPosts(),
            fetchFeaturedPosts(),
            fetchCategories()
          ]);
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };
      initializeData();
    }
  }, [initialized, fetchPublishedPosts, fetchFeaturedPosts, fetchCategories]);

  return {
    posts,
    categories,
    featuredPosts,
    loading,
    error,
    fetchPublishedPosts,
    fetchPostBySlug,
    fetchFeaturedPosts,
    fetchCategories
  };
};

// Hook for admin blog management
export const useAdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPosts = async (filters: BlogSearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getAllPosts(filters);
      setPosts(response.posts);
    } catch (err) {
      setError('Failed to fetch blog posts');
      toast.error('Failed to fetch blog posts');
      console.error('Error fetching all posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostById = async (id: string): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const post = await blogService.getPostById(id);
      return post;
    } catch (err) {
      setError('Failed to fetch blog post');
      toast.error('Failed to fetch blog post');
      console.error('Error fetching post by id:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data: CreateBlogPostRequest): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const newPost = await blogService.createPost(data);
      
      // Update local state
      setPosts(prev => [newPost, ...prev]);
      
      toast.success(`Blog post ${data.status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      return newPost;
    } catch (err) {
      setError('Failed to create blog post');
      toast.error('Failed to create blog post');
      console.error('Error creating post:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (data: UpdateBlogPostRequest): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedPost = await blogService.updatePost(data);
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ));
      
      toast.success('Blog post updated successfully!');
      return updatedPost;
    } catch (err) {
      setError('Failed to update blog post');
      toast.error('Failed to update blog post');
      console.error('Error updating post:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await blogService.deletePost(id);
      
      // Update local state
      setPosts(prev => prev.filter(post => post.id !== id));
      
      toast.success('Blog post deleted successfully!');
      return true;
    } catch (err) {
      setError('Failed to delete blog post');
      toast.error('Failed to delete blog post');
      console.error('Error deleting post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogStats = async () => {
    try {
      const blogStats = await blogService.getBlogStats();
      setStats(blogStats);
    } catch (err) {
      console.error('Error fetching blog stats:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchAllPosts();
    fetchBlogStats();
    fetchCategories();
  }, []);

  return {
    posts,
    categories,
    stats,
    loading,
    error,
    fetchAllPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    fetchBlogStats,
    fetchCategories
  };
}; 