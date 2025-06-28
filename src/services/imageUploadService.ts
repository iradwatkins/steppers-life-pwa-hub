
/**
 * Enhanced Image Upload Service with Supabase Storage
 * Handles image uploads, optimization, and storage management
 */

import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  url: string;
  path: string;
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: number;
}

export interface ImageValidation {
  valid: boolean;
  error?: string;
}

export class ImageUploadService {
  // Maximum file size in bytes (10MB)
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // Allowed image types
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  /**
   * Validate image file before upload
   */
  static validateImageFile(file: File): ImageValidation {
    console.log('🔍 Validating image file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB` 
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please upload JPG, PNG, GIF, WebP, or SVG images.' 
      };
    }

    return { valid: true };
  }

  /**
   * Optimize image before upload
   */
  private static async optimizeImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<{
    blob: Blob;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  }> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback to original file if optimization fails
            resolve({
              blob: file,
              originalSize: file.size,
              optimizedSize: file.size,
              compressionRatio: 0
            });
            return;
          }

          const compressionRatio = ((file.size - blob.size) / file.size) * 100;

          resolve({
            blob,
            originalSize: file.size,
            optimizedSize: blob.size,
            compressionRatio: Math.max(0, compressionRatio)
          });
        }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
      };

      img.onerror = () => {
        // Fallback to original file if image loading fails
        resolve({
          blob: file,
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 0
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload image to Supabase storage
   */
  static async uploadImage(
    file: File,
    bucket: string = 'images',
    folder: string = 'uploads'
  ): Promise<ImageUploadResult> {
    console.log('🚀 Starting image upload process...', {
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      bucket,
      folder
    });

    // Validate file
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Optimize image
      const { blob, originalSize, optimizedSize, compressionRatio } = await this.optimizeImage(file);
      
      console.log('✨ Image optimization complete:', {
        originalSize: `${(originalSize / (1024 * 1024)).toFixed(2)}MB`,
        optimizedSize: `${(optimizedSize / (1024 * 1024)).toFixed(2)}MB`,
        compressionRatio: `${compressionRatio.toFixed(1)}%`
      });

      // Generate unique filename
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      console.log('📁 Uploading to path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('✅ Upload successful:', {
        path: data.path,
        url: urlData.publicUrl
      });

      return {
        url: urlData.publicUrl,
        path: data.path,
        originalSize,
        optimizedSize,
        compressionRatio
      };

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error('Image storage not configured. Please contact support.');
        }
        if (error.message.includes('The resource was not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred during upload');
    }
  }

  /**
   * Upload profile picture with specific optimization
   */
  static async uploadProfilePicture(file: File, userId: string): Promise<ImageUploadResult> {
    console.log('👤 Uploading profile picture for user:', userId);
    
    return this.uploadImage(file, 'images', `profile-images/${userId}`);
  }

  /**
   * Upload event image with specific optimization
   */
  static async uploadEventImage(file: File, eventId?: string): Promise<ImageUploadResult> {
    console.log('🎪 Uploading event image:', { eventId });
    
    const folder = eventId ? `events/${eventId}` : 'events/general';
    return this.uploadImage(file, 'images', folder);
  }

  /**
   * Delete image from storage
   */
  static async deleteImage(path: string, bucket: string = 'images'): Promise<boolean> {
    try {
      console.log('🗑️ Deleting image:', { path, bucket });

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('❌ Delete error:', error);
        return false;
      }

      console.log('✅ Image deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Delete failed:', error);
      return false;
    }
  }

  /**
   * Test storage connectivity
   */
  static async testStorageConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing storage connection...');

      // Try to list buckets
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        return {
          success: false,
          message: `Storage connection failed: ${error.message}`
        };
      }

      const imagesBucket = data?.find(bucket => bucket.name === 'images');
      
      if (!imagesBucket) {
        return {
          success: false,
          message: 'Images bucket not found'
        };
      }

      console.log('✅ Storage connection successful');
      return {
        success: true,
        message: 'Storage connection successful'
      };

    } catch (error) {
      console.error('❌ Storage test failed:', error);
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export default ImageUploadService;
