/**
 * Storage Setup Utilities
 * 
 * Utilities for verifying and creating Supabase storage buckets
 * and testing image upload functionality.
 */

import { supabase } from '@/integrations/supabase/client';

export interface StorageBucketConfig {
  name: string;
  public: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}

/**
 * Verify that a storage bucket exists and create it if it doesn't
 */
export async function verifyAndCreateStorageBucket(config: StorageBucketConfig): Promise<{
  success: boolean;
  message: string;
  bucket?: any;
}> {
  try {
    console.log(`🔍 Checking bucket: ${config.name}`);

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const existingBucket = buckets?.find(bucket => bucket.name === config.name);
    
    if (existingBucket) {
      console.log(`✅ Bucket '${config.name}' already exists`);
      return {
        success: true,
        message: `Bucket '${config.name}' already exists`,
        bucket: existingBucket
      };
    }

    // Create bucket if it doesn't exist
    console.log(`🛠️ Creating bucket: ${config.name}`);
    
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(config.name, {
      public: config.public,
      fileSizeLimit: config.fileSizeLimit,
      allowedMimeTypes: config.allowedMimeTypes
    });

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }

    console.log(`✅ Bucket '${config.name}' created successfully`);
    return {
      success: true,
      message: `Bucket '${config.name}' created successfully`,
      bucket: newBucket
    };

  } catch (error) {
    console.error(`❌ Error with bucket '${config.name}':`, error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test image upload to a specific bucket
 */
export async function testImageUpload(bucketName: string = 'images'): Promise<{
  success: boolean;
  message: string;
  url?: string;
}> {
  try {
    console.log(`🧪 Testing image upload to bucket: ${bucketName}`);

    // Create a test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw a simple test pattern
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText('TEST', 35, 55);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });

    // Upload test image
    const fileName = `test-upload-${Date.now()}.png`;
    const filePath = `test/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log(`✅ Test upload successful: ${urlData.publicUrl}`);

    // Clean up test file
    await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    return {
      success: true,
      message: 'Image upload test successful',
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error(`❌ Image upload test failed:`, error);
    return {
      success: false,
      message: `Upload test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Setup all required storage buckets for the application
 */
export async function setupAllStorageBuckets(): Promise<{
  success: boolean;
  results: Array<{ bucket: string; success: boolean; message: string }>;
}> {
  const buckets: StorageBucketConfig[] = [
    {
      name: 'images',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    {
      name: 'user-uploads',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    {
      name: 'documents',
      public: false,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  ];

  const results = [];
  let allSuccess = true;

  for (const bucketConfig of buckets) {
    const result = await verifyAndCreateStorageBucket(bucketConfig);
    results.push({
      bucket: bucketConfig.name,
      success: result.success,
      message: result.message
    });

    if (!result.success) {
      allSuccess = false;
    }
  }

  return {
    success: allSuccess,
    results
  };
}

export default {
  verifyAndCreateStorageBucket,
  testImageUpload,
  setupAllStorageBuckets
};