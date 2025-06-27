import { supabase } from '@/integrations/supabase/client';
import { ImageOptimizer, type OptimizedImageResult } from '@/utils/imageOptimization';

export interface UploadResult {
  url: string;
  path: string;
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: number;
}

export interface StorageDiagnostic {
  bucketsExist: string[];
  imagesBucket: boolean;
  canUpload: boolean;
  error?: string;
}

export class ImageUploadService {
  /**
   * Diagnose storage configuration and check if images bucket exists
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
      
      if (!hasImagesBucket) {
        console.error('❌ Images bucket not found. Please run the storage setup SQL script in your Supabase dashboard.');
        return {
          bucketsExist: bucketNames,
          imagesBucket: false,
          canUpload: false,
          error: 'Images bucket not found. Please create the bucket using the SQL script in your database dashboard.'
        };
      }
      
      return {
        bucketsExist: bucketNames,
        imagesBucket: hasImagesBucket,
        canUpload: hasImagesBucket,
        error: undefined
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
   * Upload a single image file to Supabase Storage with optimization
   */
  static async uploadImage(file: File, bucket: string = 'images', folder?: string, optimize: boolean = true): Promise<UploadResult> {
    try {
      console.log('📸 Starting optimized image upload:', { 
        fileName: file.name, 
        fileSize: file.size, 
        bucket, 
        folder,
        optimize,
        environment: import.meta.env.VITE_APP_ENV 
      });

      // Step 1: Validate file
      const validation = ImageOptimizer.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Diagnose storage before attempting upload
      const diagnostic = await this.diagnoseStorage();
      if (!diagnostic.canUpload) {
        console.error('❌ Storage diagnostic failed:', diagnostic);
        throw new Error(`Storage not ready: ${diagnostic.error}`);
      }

      let fileToUpload = file;
      let optimizationResult: OptimizedImageResult | null = null;

      // Step 3: Optimize image if requested
      if (optimize) {
        console.log('🔧 Optimizing image...');
        optimizationResult = await ImageOptimizer.optimizeImage(file);
        fileToUpload = optimizationResult.file;
        
        console.log('✅ Image optimized:', {
          originalSize: optimizationResult.originalSize,
          optimizedSize: optimizationResult.optimizedSize,
          compressionRatio: optimizationResult.compressionRatio,
          format: optimizationResult.format
        });
      }

      // Step 4: Generate unique filename
      const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 'webp';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('📤 Uploading to path:', filePath);

      // Step 5: Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
          contentType: fileToUpload.type
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

      // Step 6: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('🔗 Generated public URL:', publicUrl);

      return {
        url: publicUrl,
        path: filePath,
        originalSize: optimizationResult?.originalSize,
        optimizedSize: optimizationResult?.optimizedSize,
        compressionRatio: optimizationResult?.compressionRatio
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
   * Upload profile picture specifically with optimization
   */
  static async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    try {
      console.log('👤 Uploading optimized profile picture for user:', userId);
      
      // Use specific profile picture optimization
      const optimizedResult = await ImageOptimizer.optimizeProfilePicture(file);
      
      // Upload the optimized file
      const result = await this.uploadImage(optimizedResult.file, 'images', `profiles/${userId}`, false);
      
      // Include optimization stats
      return {
        ...result,
        originalSize: optimizedResult.originalSize,
        optimizedSize: optimizedResult.optimizedSize,
        compressionRatio: optimizedResult.compressionRatio
      };
    } catch (error) {
      console.error('❌ Profile picture upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload event images with optimization
   */
  static async uploadEventImages(files: File[], eventId: string): Promise<UploadResult[]> {
    console.log(`🎉 Uploading ${files.length} optimized event images for event:`, eventId);
    
    const results: UploadResult[] = [];
    for (const file of files) {
      try {
        // Use specific event image optimization
        const optimizedResult = await ImageOptimizer.optimizeEventImage(file);
        
        // Upload the optimized file
        const result = await this.uploadImage(optimizedResult.file, 'images', `events/${eventId}`, false);
        
        // Include optimization stats
        results.push({
          ...result,
          originalSize: optimizedResult.originalSize,
          optimizedSize: optimizedResult.optimizedSize,
          compressionRatio: optimizedResult.compressionRatio
        });
      } catch (error) {
        console.error(`❌ Failed to upload event image ${file.name}:`, error);
        throw error;
      }
    }
    
    return results;
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