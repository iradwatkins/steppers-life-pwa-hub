export interface MagazineArticle {
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
  author_bio?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  categories: MagazineCategory[];
  tags: MagazineTag[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  youtube_video_id?: string;
  reading_time_minutes: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  // Magazine-specific fields
  issue_number?: string;
  section: string; // Feature, Profile, Technique, Culture, Event Coverage, Editorial
  is_cover_story: boolean;
  is_featured: boolean;
  article_type: 'feature' | 'profile' | 'technique' | 'culture' | 'event_coverage' | 'editorial' | 'interview' | 'review';
  photo_essay?: boolean;
  gallery_images?: string[];
  sidebar_content?: string;
  pull_quotes?: string[];
}

export interface MagazineCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
  // Magazine-specific fields
  section_type: 'department' | 'feature' | 'regular';
  display_order: number;
}

export interface MagazineTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface MagazineComment {
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
  replies: MagazineComment[];
}

export interface CreateMagazineArticleData {
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
  // Magazine-specific fields
  issue_number?: string;
  section: string;
  is_cover_story?: boolean;
  is_featured?: boolean;
  article_type: 'feature' | 'profile' | 'technique' | 'culture' | 'event_coverage' | 'editorial' | 'interview' | 'review';
  photo_essay?: boolean;
  gallery_images?: string[];
  sidebar_content?: string;
  pull_quotes?: string[];
}

export interface UpdateMagazineArticleData extends Partial<CreateMagazineArticleData> {
  id: string;
}

export interface MagazineListFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  sort_by?: 'created_at' | 'published_at' | 'title' | 'view_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  // Magazine-specific filters
  section?: string;
  article_type?: string;
  issue_number?: string;
  is_featured?: boolean;
  is_cover_story?: boolean;
}

export interface MagazineStats {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  categories_count: number;
  tags_count: number;
  most_viewed_articles: MagazineArticle[];
  most_liked_articles: MagazineArticle[];
  recent_articles: MagazineArticle[];
  featured_articles: MagazineArticle[];
  cover_stories: MagazineArticle[];
}

export interface MagazineIssue {
  id: string;
  issue_number: string;
  title: string;
  cover_image?: string;
  description?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  articles: MagazineArticle[];
  is_current: boolean;
}

// Backwards compatibility - re-export as Blog types for existing components
export type BlogPost = MagazineArticle;
export type BlogCategory = MagazineCategory;
export type BlogTag = MagazineTag;
export type BlogComment = MagazineComment;
export type CreateBlogPostData = CreateMagazineArticleData;
export type UpdateBlogPostData = UpdateMagazineArticleData;
export type BlogListFilters = MagazineListFilters;
export type BlogStats = MagazineStats;