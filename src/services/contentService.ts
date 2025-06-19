import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ContentPage = Database['public']['Tables']['content_pages']['Row'];
type ContentPageInsert = Database['public']['Tables']['content_pages']['Insert'];
type ContentPageUpdate = Database['public']['Tables']['content_pages']['Update'];
type ContentPageVersion = Database['public']['Tables']['content_page_versions']['Row'];

export interface CreateContentPageData {
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string[];
  type?: 'page' | 'post' | 'faq_item';
  status?: 'draft' | 'published' | 'archived';
  featuredImageUrl?: string;
  sortOrder?: number;
  isSystemPage?: boolean;
}

export interface UpdateContentPageData {
  title?: string;
  slug?: string;
  content?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status?: 'draft' | 'published' | 'archived';
  featuredImageUrl?: string;
  sortOrder?: number;
}

export interface ContentPageWithVersions extends ContentPage {
  versions?: ContentPageVersion[];
  latestVersion?: ContentPageVersion;
}

export class ContentService {
  // Get all content pages with optional filtering
  static async getContentPages(filters?: {
    status?: 'draft' | 'published' | 'archived';
    type?: 'page' | 'post' | 'faq_item';
    isSystemPage?: boolean;
  }): Promise<ContentPage[]> {
    console.log('🔧 ContentService.getContentPages called with filters:', filters);
    
    let query = supabase
      .from('content_pages')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.isSystemPage !== undefined) {
      query = query.eq('is_system_page', filters.isSystemPage);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching content pages:', error);
      throw new Error(`Failed to fetch content pages: ${error.message}`);
    }
    
    console.log('✅ Content pages fetched successfully:', data?.length);
    return data || [];
  }
  
  // Get a single content page by ID
  static async getContentPage(id: string): Promise<ContentPage | null> {
    console.log('🔧 ContentService.getContentPage called with ID:', id);
    
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('❌ Error fetching content page:', error);
      throw new Error(`Failed to fetch content page: ${error.message}`);
    }
    
    console.log('✅ Content page fetched successfully');
    return data;
  }
  
  // Get a content page by slug
  static async getContentPageBySlug(slug: string): Promise<ContentPage | null> {
    console.log('🔧 ContentService.getContentPageBySlug called with slug:', slug);
    
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('❌ Error fetching content page by slug:', error);
      throw new Error(`Failed to fetch content page: ${error.message}`);
    }
    
    console.log('✅ Content page fetched by slug successfully');
    return data;
  }
  
  // Create a new content page
  static async createContentPage(contentData: CreateContentPageData): Promise<ContentPage> {
    console.log('🔧 ContentService.createContentPage called with:', contentData);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create content');
    }
    
    // Check if slug already exists
    const existingPage = await this.getContentPageBySlug(contentData.slug);
    if (existingPage) {
      throw new Error(`A page with slug "${contentData.slug}" already exists`);
    }
    
    const contentPageData: ContentPageInsert = {
      title: contentData.title,
      slug: contentData.slug,
      content: contentData.content,
      meta_description: contentData.metaDescription,
      meta_keywords: contentData.metaKeywords,
      type: contentData.type || 'page',
      status: contentData.status || 'draft',
      featured_image_url: contentData.featuredImageUrl,
      sort_order: contentData.sortOrder || 0,
      is_system_page: contentData.isSystemPage || false,
      created_by: user.id,
      updated_by: user.id,
      published_at: contentData.status === 'published' ? new Date().toISOString() : null
    };
    
    const { data, error } = await supabase
      .from('content_pages')
      .insert(contentPageData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating content page:', error);
      throw new Error(`Failed to create content page: ${error.message}`);
    }
    
    console.log('✅ Content page created successfully:', data.id);
    return data;
  }
  
  // Update an existing content page
  static async updateContentPage(id: string, updateData: UpdateContentPageData): Promise<ContentPage> {
    console.log('🔧 ContentService.updateContentPage called with:', { id, updateData });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update content');
    }
    
    // Check if new slug already exists (if slug is being updated)
    if (updateData.slug) {
      const existingPage = await this.getContentPageBySlug(updateData.slug);
      if (existingPage && existingPage.id !== id) {
        throw new Error(`A page with slug "${updateData.slug}" already exists`);
      }
    }
    
    const contentPageUpdate: ContentPageUpdate = {
      ...updateData,
      meta_description: updateData.metaDescription,
      meta_keywords: updateData.metaKeywords,
      featured_image_url: updateData.featuredImageUrl,
      sort_order: updateData.sortOrder,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      published_at: updateData.status === 'published' ? new Date().toISOString() : undefined
    };
    
    const { data, error } = await supabase
      .from('content_pages')
      .update(contentPageUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating content page:', error);
      throw new Error(`Failed to update content page: ${error.message}`);
    }
    
    console.log('✅ Content page updated successfully');
    return data;
  }
  
  // Delete a content page
  static async deleteContentPage(id: string): Promise<void> {
    console.log('🔧 ContentService.deleteContentPage called with ID:', id);
    
    const { error } = await supabase
      .from('content_pages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting content page:', error);
      throw new Error(`Failed to delete content page: ${error.message}`);
    }
    
    console.log('✅ Content page deleted successfully');
  }
  
  // Get version history for a content page
  static async getContentPageVersions(pageId: string): Promise<ContentPageVersion[]> {
    console.log('🔧 ContentService.getContentPageVersions called with pageId:', pageId);
    
    const { data, error } = await supabase
      .from('content_page_versions')
      .select('*')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching content page versions:', error);
      throw new Error(`Failed to fetch content page versions: ${error.message}`);
    }
    
    console.log('✅ Content page versions fetched successfully:', data?.length);
    return data || [];
  }
  
  // Rollback to a specific version
  static async rollbackToVersion(pageId: string, versionId: string): Promise<ContentPage> {
    console.log('🔧 ContentService.rollbackToVersion called with:', { pageId, versionId });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to rollback content');
    }
    
    // Get the version data
    const { data: version, error: versionError } = await supabase
      .from('content_page_versions')
      .select('*')
      .eq('id', versionId)
      .eq('page_id', pageId)
      .single();
    
    if (versionError || !version) {
      console.error('❌ Error fetching version:', versionError);
      throw new Error('Version not found');
    }
    
    // Update the page with version data
    const updateData: UpdateContentPageData = {
      title: version.title,
      content: version.content,
      metaDescription: version.meta_description,
      metaKeywords: version.meta_keywords,
      status: version.status
    };
    
    return this.updateContentPage(pageId, updateData);
  }
  
  // Get content page with versions
  static async getContentPageWithVersions(id: string): Promise<ContentPageWithVersions | null> {
    console.log('🔧 ContentService.getContentPageWithVersions called with ID:', id);
    
    const page = await this.getContentPage(id);
    if (!page) {
      return null;
    }
    
    const versions = await this.getContentPageVersions(id);
    
    return {
      ...page,
      versions,
      latestVersion: versions[0] || null
    };
  }
  
  // Publish a draft page
  static async publishPage(id: string): Promise<ContentPage> {
    console.log('🔧 ContentService.publishPage called with ID:', id);
    
    return this.updateContentPage(id, { 
      status: 'published'
    });
  }
  
  // Archive a published page
  static async archivePage(id: string): Promise<ContentPage> {
    console.log('🔧 ContentService.archivePage called with ID:', id);
    
    return this.updateContentPage(id, { 
      status: 'archived'
    });
  }
}

export default ContentService;