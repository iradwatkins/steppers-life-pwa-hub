import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
}

export interface StorageDiagnostic {
  bucketsExist: string[];
  imagesBucket: boolean;
  canUpload: boolean;
  error?: string;
}

export class ImageUploadService {
  /**
   * Diagnose storage configuration issues
   */
  static async diagnoseStorage(): Promise<StorageDiagnostic> {
    try {
      console.log('🔍 Diagnosing storage configuration...');
      
      // Check what buckets exist
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Cannot list buckets:', listError);
        return {
          bucketsExist: [],
          imagesBucket: false,
          canUpload: false,
          error: `Cannot list buckets: ${listError.message}`
        };
      }
      
      const bucketNames = buckets?.map(b => b.name) || [];
      const hasImagesBucket = bucketNames.includes('images');
      
      console.log('📊 Storage diagnostic:', {
        availableBuckets: bucketNames,
        hasImagesBucket,
        totalBuckets: bucketNames.length
      });
      
      return {
        bucketsExist: bucketNames,
        imagesBucket: hasImagesBucket,
        canUpload: hasImagesBucket,
        error: hasImagesBucket ? undefined : 'Images bucket not found. Please run storage-diagnostic-and-fix.sql'
      };
    } catch (error) {
      console.error('❌ Storage diagnostic failed:', error);
      return {
        bucketsExist: [],
        imagesBucket: false,
        canUpload: false,
        error: `Diagnostic failed: ${error}`
      };
    }
  }

  /**
   * Upload a single image file to Supabase Storage
   */
  static async uploadImage(file: File, bucket: string = 'images', folder?: string): Promise<UploadResult> {
    try {
      console.log('📸 Starting image upload:', { 
        fileName: file.name, 
        fileSize: file.size, 
        bucket, 
        folder,
        environment: import.meta.env.VITE_APP_ENV 
      });

      // Step 1: Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Image must be smaller than 10MB');
      }

      // Step 2: Diagnose storage before attempting upload
      const diagnostic = await this.diagnoseStorage();
      if (!diagnostic.canUpload) {
        console.error('❌ Storage diagnostic failed:', diagnostic);
        throw new Error(`Storage not ready: ${diagnostic.error}`);
      }

      // Step 3: Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('📤 Uploading to path:', filePath);

      // Step 4: Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('❌ Upload error details:', error);
        
        // Provide specific error guidance
        if (error.message.includes('Bucket not found')) {
          throw new Error('Images bucket not found in production. Please run the storage-diagnostic-and-fix.sql script in your Supabase dashboard.');
        }
        
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ Upload successful:', data);

      // Step 5: Get public URL
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
  static async uploadMultipleImages(files: File[], bucket: string = 'images', folder?: string): Promise<UploadResult[]> {
    console.log(`📚 Uploading ${files.length} images...`);
    
    // Upload files sequentially to avoid overwhelming the server
    const results: UploadResult[] = [];
    for (const file of files) {
      try {
        const result = await this.uploadImage(file, bucket, folder);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        throw error; // Stop on first failure
      }
    }
    
    return results;
  }

  /**
   * Delete an image from storage
   */
  static async deleteImage(path: string, bucket: string = 'images'): Promise<void> {
    try {
      console.log('🗑️ Deleting image:', path);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      console.log('✅ Image deleted successfully');
    } catch (error) {
      console.error('❌ Image delete error:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture specifically
   */
  static async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    return this.uploadImage(file, 'images', `profiles/${userId}`);
  }

  /**
   * Upload event images
   */
  static async uploadEventImages(files: File[], eventId: string): Promise<UploadResult[]> {
    return this.uploadMultipleImages(files, 'images', `events/${eventId}`);
  }

  /**
   * Test storage connectivity
   */
  static async testStorageConnectivity(): Promise<boolean> {
    try {
      console.log('🧪 Testing storage connectivity...');
      
      const diagnostic = await this.diagnoseStorage();
      
      if (!diagnostic.canUpload) {
        console.error('❌ Storage test failed:', diagnostic.error);
        return false;
      }
      
      console.log('✅ Storage connectivity test passed');
      return true;
    } catch (error) {
      console.error('❌ Storage connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 10MB' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Image must be JPG, PNG, GIF, or WebP format' };
    }

    return { valid: true };
  }
}