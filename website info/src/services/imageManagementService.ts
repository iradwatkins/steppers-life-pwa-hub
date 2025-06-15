import { supabase } from '@/integrations/supabase/client';

export interface ImageAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  category: ImageCategory;
  tags: string[];
  description?: string;
  size: number;
  dimensions: { width: number; height: number };
  format: string;
  uploadedAt: Date;
  isActive: boolean;
  theme?: 'light' | 'dark' | 'auto';
  usage: ImageUsage[];
  createdBy: string;
  updatedAt: Date;
}

export interface ImageUsage {
  location: string;
  description: string;
  active: boolean;
}

export type ImageCategory = 
  | 'logo' 
  | 'favicon' 
  | 'banner' 
  | 'background' 
  | 'icon' 
  | 'avatar' 
  | 'social' 
  | 'marketing' 
  | 'content' 
  | 'other';

export interface ImageUploadOptions {
  category: ImageCategory;
  tags: string[];
  description?: string;
  theme?: 'light' | 'dark' | 'auto';
  overwriteExisting?: boolean;
}

export interface ImageFilters {
  category?: ImageCategory | 'all';
  tags?: string[];
  isActive?: boolean;
  theme?: 'light' | 'dark' | 'auto' | 'all';
  search?: string;
}

class ImageManagementService {
  private readonly bucketName = 'website-assets';
  private readonly storageUrl = `${supabase.supabaseUrl}/storage/v1/object/public/${this.bucketName}`;

  /**
   * Upload images to Supabase storage and save metadata
   */
  async uploadImages(files: File[], options: ImageUploadOptions, userId: string): Promise<ImageAsset[]> {
    const uploadedAssets: ImageAsset[] = [];

    for (const file of files) {
      try {
        // Validate file
        this.validateImageFile(file);
        
        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const timestamp = Date.now();
        const filename = `${options.category}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Get image dimensions
        const dimensions = await this.getImageDimensions(file);
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(this.bucketName)
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: options.overwriteExisting || false
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(filename);

        // Create asset metadata
        const assetData = {
          filename,
          original_name: file.name,
          url: publicUrl,
          category: options.category,
          tags: options.tags,
          description: options.description,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
          format: file.type.split('/')[1].toUpperCase(),
          theme: options.theme,
          is_active: false, // New uploads start inactive
          created_by: userId,
          updated_at: new Date().toISOString()
        };

        // Save metadata to database
        const { data: dbData, error: dbError } = await supabase
          .from('image_assets')
          .insert(assetData)
          .select()
          .single();

        if (dbError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage.from(this.bucketName).remove([filename]);
          throw new Error(`Database error: ${dbError.message}`);
        }

        // Convert database record to ImageAsset
        const imageAsset: ImageAsset = {
          id: dbData.id,
          filename: dbData.filename,
          originalName: dbData.original_name,
          url: dbData.url,
          category: dbData.category,
          tags: dbData.tags || [],
          description: dbData.description,
          size: dbData.size,
          dimensions: { width: dbData.width, height: dbData.height },
          format: dbData.format,
          uploadedAt: new Date(dbData.created_at),
          isActive: dbData.is_active,
          theme: dbData.theme,
          usage: [], // Would be loaded separately
          createdBy: dbData.created_by,
          updatedAt: new Date(dbData.updated_at)
        };

        uploadedAssets.push(imageAsset);

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    }

    return uploadedAssets;
  }

  /**
   * Get all images with optional filtering
   */
  async getImages(filters: ImageFilters = {}): Promise<ImageAsset[]> {
    let query = supabase
      .from('image_assets')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.theme && filters.theme !== 'all') {
      query = query.eq('theme', filters.theme);
    }

    if (filters.search) {
      query = query.or(`original_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }

    return data.map(this.mapDbRecordToImageAsset);
  }

  /**
   * Update image metadata
   */
  async updateImage(imageId: string, updates: Partial<ImageAsset>): Promise<ImageAsset> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.category) updateData.category = updates.category;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.theme) updateData.theme = updates.theme;

    const { data, error } = await supabase
      .from('image_assets')
      .update(updateData)
      .eq('id', imageId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update image: ${error.message}`);
    }

    return this.mapDbRecordToImageAsset(data);
  }

  /**
   * Delete image and its file
   */
  async deleteImage(imageId: string): Promise<void> {
    // Get image details first
    const { data: imageData, error: fetchError } = await supabase
      .from('image_assets')
      .select('filename')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch image details: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(this.bucketName)
      .remove([imageData.filename]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('image_assets')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      throw new Error(`Failed to delete image from database: ${dbError.message}`);
    }
  }

  /**
   * Toggle image active status
   */
  async toggleImageActive(imageId: string, isActive: boolean): Promise<ImageAsset> {
    return this.updateImage(imageId, { isActive });
  }

  /**
   * Get images by category
   */
  async getImagesByCategory(category: ImageCategory): Promise<ImageAsset[]> {
    return this.getImages({ category });
  }

  /**
   * Get active images for a specific usage (e.g., header logos)
   */
  async getActiveImagesByUsage(category: ImageCategory, theme?: 'light' | 'dark'): Promise<ImageAsset[]> {
    const filters: ImageFilters = {
      category,
      isActive: true
    };

    if (theme) {
      filters.theme = theme;
    }

    return this.getImages(filters);
  }

  /**
   * Generate optimized URLs for different sizes
   */
  getOptimizedImageUrl(asset: ImageAsset, options: { width?: number; height?: number; quality?: number } = {}): string {
    // In a real implementation, this would use a service like Supabase's image transformations
    // or integrate with services like Cloudinary, ImageKit, etc.
    let url = asset.url;
    
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File ${file.name} has unsupported format. Allowed: JPG, PNG, SVG, WebP, GIF.`);
    }
  }

  /**
   * Get image dimensions
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/svg+xml') {
        // For SVG files, return default dimensions
        resolve({ width: 0, height: 0 });
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension calculation'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Map database record to ImageAsset
   */
  private mapDbRecordToImageAsset(record: any): ImageAsset {
    return {
      id: record.id,
      filename: record.filename,
      originalName: record.original_name,
      url: record.url,
      category: record.category,
      tags: record.tags || [],
      description: record.description,
      size: record.size,
      dimensions: { width: record.width, height: record.height },
      format: record.format,
      uploadedAt: new Date(record.created_at),
      isActive: record.is_active,
      theme: record.theme,
      usage: [], // Would be loaded from a separate table in a real implementation
      createdBy: record.created_by,
      updatedAt: new Date(record.updated_at)
    };
  }
}

export const imageManagementService = new ImageManagementService(); 