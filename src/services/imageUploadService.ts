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
      console.log('🌍 Environment:', {
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      
      // Check what buckets exist
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Cannot list buckets:', listError);
        
        // Provide specific guidance based on error type
        let errorMessage = `Cannot list buckets: ${listError.message}`;
        if (listError.message.includes('JWT')) {
          errorMessage = 'Authentication failed. Please check your Supabase credentials.';
        } else if (listError.message.includes('network') || listError.message.includes('fetch')) {
          errorMessage = 'Network error connecting to Supabase. Please check your internet connection.';
        }
        
        return {
          bucketsExist: [],
          imagesBucket: false,
          canUpload: false,
          error: errorMessage
        };
      }
      
      const bucketNames = buckets?.map(b => b.name) || [];
      const hasImagesBucket = bucketNames.includes('images');
      
      console.log('📊 Storage diagnostic:', {
        availableBuckets: bucketNames,
        hasImagesBucket,
        totalBuckets: bucketNames.length,
        environment: import.meta.env.PROD ? 'production' : 'development'
      });
      
      if (!hasImagesBucket) {
        const errorMessage = import.meta.env.PROD 
          ? 'Images bucket not found in production. Please execute the PRODUCTION-STORAGE-SETUP.sql script in your Supabase dashboard.'
          : 'Images bucket not found in development. Please check your development database setup.';
          
        console.error('❌', errorMessage);
        return {
          bucketsExist: bucketNames,
          imagesBucket: false,
          canUpload: false,
          error: errorMessage
        };
      }
      
      // Test write permissions by attempting a small operation
      try {
        const testResult = await this.testUploadPermissions();
        if (!testResult.canUpload) {
          return {
            bucketsExist: bucketNames,
            imagesBucket: true,
            canUpload: false,
            error: `Bucket exists but upload permissions failed: ${testResult.error}`
          };
        }
      } catch (permError) {
        console.warn('⚠️ Could not test upload permissions:', permError);
        // Continue anyway - permissions might work for actual uploads
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
        error: `Diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test upload permissions without actually uploading a file
   */
  private static async testUploadPermissions(): Promise<{ canUpload: boolean; error?: string }> {
    try {
      // Try to list objects in the bucket - this tests read permissions
      const { data, error } = await supabase.storage
        .from('images')
        .list('', { limit: 1 });
        
      if (error && !error.message.includes('does not exist')) {
        return { canUpload: false, error: error.message };
      }
      
      return { canUpload: true };
    } catch (error) {
      return { 
        canUpload: false, 
        error: error instanceof Error ? error.message : 'Permission test failed' 
      };
    }
  }

  /**
   * Upload a single image file to Supabase Storage with optimization
   */
  static async uploadImage(file: File, bucket: string = 'images', folder?: string, optimize: boolean = true, retries: number = 2): Promise<UploadResult> {
    const uploadAttempt = async (attemptNumber: number): Promise<UploadResult> => {
      try {
        console.log(`📸 Starting image upload (attempt ${attemptNumber}/${retries + 1}):`, { 
          fileName: file.name, 
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          bucket, 
          folder,
          optimize,
          environment: import.meta.env.PROD ? 'production' : 'development'
        });

        // Step 1: Validate file
        const validation = ImageOptimizer.validateImageFile(file);
        if (!validation.valid) {
          throw new Error(`File validation failed: ${validation.error}`);
        }

        // Step 2: Diagnose storage before attempting upload (only on first attempt)
        if (attemptNumber === 1) {
          const diagnostic = await this.diagnoseStorage();
          if (!diagnostic.canUpload) {
            console.error('❌ Storage diagnostic failed:', diagnostic);
            throw new Error(`Storage not ready: ${diagnostic.error}`);
          }
        }

        let fileToUpload = file;
        let optimizationResult: OptimizedImageResult | null = null;

        // Step 3: Optimize image if requested
        if (optimize) {
          console.log('🔧 Optimizing image...');
          try {
            optimizationResult = await ImageOptimizer.optimizeImage(file);
            fileToUpload = optimizationResult.file;
            
            console.log('✅ Image optimized:', {
              originalSize: `${(optimizationResult.originalSize / (1024 * 1024)).toFixed(2)}MB`,
              optimizedSize: `${(optimizationResult.optimizedSize / (1024 * 1024)).toFixed(2)}MB`,
              compressionRatio: `${optimizationResult.compressionRatio.toFixed(1)}%`,
              format: optimizationResult.format
            });
          } catch (optimizeError) {
            console.warn('⚠️ Image optimization failed, uploading original:', optimizeError);
            fileToUpload = file; // Fall back to original file
          }
        }

        // Step 4: Generate unique filename with proper extension handling
        const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 
                       (optimizationResult?.format || file.type.split('/')[1] || 'jpg');
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}-${random}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        console.log('📤 Uploading to path:', filePath);

        // Step 5: Upload to Supabase Storage with enhanced error handling
        const uploadStart = Date.now();
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
            contentType: fileToUpload.type || 'image/jpeg'
          });

        const uploadDuration = Date.now() - uploadStart;

        if (error) {
          console.error('❌ Upload error details:', {
            error: error.message,
            filePath,
            fileSize: fileToUpload.size,
            attemptNumber,
            uploadDuration: `${uploadDuration}ms`
          });
          
          // Provide specific error guidance with actionable solutions
          if (error.message.includes('Bucket not found')) {
            throw new Error('Images bucket not found. Please execute the PRODUCTION-STORAGE-SETUP.sql script in your Supabase dashboard.');
          } else if (error.message.includes('violates row-level security')) {
            throw new Error('Upload permission denied. Please check your authentication status and try again.');
          } else if (error.message.includes('File size')) {
            throw new Error(`File too large (${(fileToUpload.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${bucket === 'images' ? '50MB' : '10MB'}.`);
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            // This error might be retryable
            throw new Error(`Network error during upload: ${error.message}`);
          }
          
          throw new Error(`Upload failed: ${error.message}`);
        }

        console.log('✅ Upload successful:', {
          path: data.path,
          fullPath: data.fullPath,
          uploadDuration: `${uploadDuration}ms`,
          fileSize: `${(fileToUpload.size / (1024 * 1024)).toFixed(2)}MB`
        });

        // Step 6: Get public URL and validate it
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        // Validate the public URL format
        if (!publicUrl || !publicUrl.startsWith('http')) {
          throw new Error(`Invalid public URL generated: ${publicUrl}`);
        }

        console.log('🔗 Generated public URL:', publicUrl);

        return {
          url: publicUrl,
          path: filePath,
          originalSize: optimizationResult?.originalSize || file.size,
          optimizedSize: optimizationResult?.optimizedSize || fileToUpload.size,
          compressionRatio: optimizationResult?.compressionRatio || 0
        };
      } catch (error) {
        const isNetworkError = error instanceof Error && (
          error.message.includes('network') || 
          error.message.includes('fetch') ||
          error.message.includes('timeout')
        );
        
        // Only retry on network errors and if we have retries left
        if (isNetworkError && attemptNumber <= retries) {
          console.warn(`⚠️ Upload attempt ${attemptNumber} failed, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * attemptNumber)); // Exponential backoff
          return uploadAttempt(attemptNumber + 1);
        }
        
        console.error('❌ Image upload error (final):', error);
        throw error;
      }
    };

    return uploadAttempt(1);
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