/**
 * Image Optimization Utilities
 * 
 * Provides client-side image optimization, compression, and WebP conversion
 * to save bandwidth and storage space while maintaining quality.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maintainAspectRatio?: boolean;
}

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
}

export class ImageOptimizer {
  /**
   * Optimize an image with compression and format conversion
   */
  static async optimizeImage(
    file: File, 
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'webp',
      maintainAspectRatio = true
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight, 
            maintainAspectRatio
          );

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Draw image with high quality settings
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to optimized format
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'));
                return;
              }

              const originalSize = file.size;
              const optimizedSize = blob.size;
              const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

              // Create optimized file
              const optimizedFile = new File(
                [blob], 
                this.generateOptimizedFileName(file.name, format),
                { 
                  type: `image/${format}`,
                  lastModified: Date.now()
                }
              );

              resolve({
                file: optimizedFile,
                originalSize,
                optimizedSize,
                compressionRatio,
                format
              });
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too large
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  /**
   * Generate optimized filename with format extension
   */
  private static generateOptimizedFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}.${format}`;
  }

  /**
   * Optimize profile picture with specific settings
   */
  static async optimizeProfilePicture(file: File): Promise<OptimizedImageResult> {
    return this.optimizeImage(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.90,
      format: 'webp',
      maintainAspectRatio: true
    });
  }

  /**
   * Optimize event image with specific settings
   */
  static async optimizeEventImage(file: File): Promise<OptimizedImageResult> {
    return this.optimizeImage(file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.85,
      format: 'webp',
      maintainAspectRatio: true
    });
  }

  /**
   * Optimize gallery image with specific settings
   */
  static async optimizeGalleryImage(file: File): Promise<OptimizedImageResult> {
    return this.optimizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.80,
      format: 'webp',
      maintainAspectRatio: true
    });
  }

  /**
   * Create thumbnail version of an image
   */
  static async createThumbnail(file: File, size: number = 200): Promise<OptimizedImageResult> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.75,
      format: 'webp',
      maintainAspectRatio: true
    });
  }

  /**
   * Validate image file before optimization
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.' 
      };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File too large. Maximum size is 50MB.' 
      };
    }

    return { valid: true };
  }

  /**
   * Get optimization statistics
   */
  static getOptimizationStats(results: OptimizedImageResult[]): {
    totalOriginalSize: number;
    totalOptimizedSize: number;
    totalSavings: number;
    averageCompressionRatio: number;
  } {
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const averageCompressionRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;

    return {
      totalOriginalSize,
      totalOptimizedSize,
      totalSavings,
      averageCompressionRatio
    };
  }
}

export default ImageOptimizer;