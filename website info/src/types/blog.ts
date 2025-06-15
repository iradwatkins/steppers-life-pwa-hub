export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  categories: string[];
  readTimeMinutes: number;
  viewCount: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  embeds: BlogEmbed[];
}

export interface BlogEmbed {
  id: string;
  type: 'youtube' | 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
  startTime?: number; // for YouTube videos
  endTime?: number; // for YouTube videos
  thumbnail?: string;
  position: number; // position in content
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
  replies: BlogComment[];
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalComments: number;
  popularPosts: BlogPost[];
  recentPosts: BlogPost[];
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  tags: string[];
  categories: string[];
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  embeds: Omit<BlogEmbed, 'id'>[];
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string;
}

export interface BlogSearchFilters {
  query?: string;
  category?: string;
  tag?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 