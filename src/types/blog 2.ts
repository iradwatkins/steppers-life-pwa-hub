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
  reading_time_minutes: number;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  replies: BlogComment[];
}

export interface CreateBlogPostData {
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  status: 'draft' | 'published';
  category_ids: string[];
  tag_names: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  youtube_video_id?: string;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

export interface BlogListFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
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
  total_likes: number;
  total_comments: number;
  categories_count: number;
  tags_count: number;
  most_viewed_posts: BlogPost[];
  most_liked_posts: BlogPost[];
  recent_posts: BlogPost[];
}