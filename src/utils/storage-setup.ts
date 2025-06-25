import { supabase } from '@/integrations/supabase/client';

export async function verifyAndCreateStorageBucket(): Promise<boolean> {
  try {
    console.log('🗂️ Checking if images bucket exists...');
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }
    
    const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
    
    if (imagesBucket) {
      console.log('✅ Images bucket already exists:', imagesBucket);
      return true;
    }
    
    console.log('📦 Creating images bucket...');
    
    // Create the images bucket with public access
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('images', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (createError) {
      console.error('❌ Error creating bucket:', createError);
      return false;
    }
    
    console.log('✅ Images bucket created successfully:', newBucket);
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error in bucket verification:', error);
    return false;
  }
}

export async function testImageUpload(): Promise<boolean> {
  try {
    console.log('🧪 Testing image upload functionality...');
    
    // Create a test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    
    // Draw a simple test pattern
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(50, 0, 50, 50);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 50, 50, 50);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(50, 50, 50, 50);
    
    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
    
    const testFile = new File([blob], 'test-upload.png', { type: 'image/png' });
    const testPath = `test/${Date.now()}-test.png`;
    
    // Upload test file
    const { data, error } = await supabase.storage
      .from('images')
      .upload(testPath, testFile);
    
    if (error) {
      console.error('❌ Test upload failed:', error);
      return false;
    }
    
    console.log('✅ Test upload successful:', data);
    
    // Clean up test file
    await supabase.storage.from('images').remove([testPath]);
    console.log('🧹 Test file cleaned up');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test upload error:', error);
    return false;
  }
}