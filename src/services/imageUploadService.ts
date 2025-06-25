import { supabase } from '@/integrations/supabase/client';
import { verifyAndCreateStorageBucket } from '@/utils/storage-setup';

export interface UploadResult {
  url: string;
  path: string;
}

export class ImageUploadService {
  /**
   * Upload a single image file to Supabase Storage
   */
  static async uploadImage(file: File, bucket: string = 'user-uploads', folder?: string): Promise<UploadResult> {
    try {
      console.log('📸 Starting image upload:', { fileName: file.name, fileSize: file.size, bucket, folder });
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image must be smaller than 5MB');
      }

      // Ensure bucket exists
      console.log('🗂️ Verifying storage bucket exists...');
      const bucketExists = await verifyAndCreateStorageBucket();
      if (!bucketExists) {
        throw new Error('Failed to verify or create storage bucket');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('📤 Uploading to path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error details:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('🔗 Generated public URL:', publicUrl);

      return {
        url: publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('❌ Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(files: File[], bucket: string = 'user-uploads', folder?: string): Promise<UploadResult[]> {
    const uploads = files.map(file => this.uploadImage(file, bucket, folder));
    return Promise.all(uploads);
  }

  /**
   * Delete an image from storage
   */
  static async deleteImage(path: string, bucket: string = 'user-uploads'): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Image delete error:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture specifically
   */
  static async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    return this.uploadImage(file, 'user-uploads', `profiles/${userId}`);
  }

  /**
   * Upload event images
   */
  static async uploadEventImages(files: File[], eventId: string): Promise<UploadResult[]> {
    return this.uploadMultipleImages(files, 'user-uploads', `events/${eventId}`);
  }

  /**
   * Resize image client-side before upload (optional optimization)
   */
  static async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Fallback to original file
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 5MB' };
    }

    // Check image dimensions (optional)
    return { valid: true };
  }
}