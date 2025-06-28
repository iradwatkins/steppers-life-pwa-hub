import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, Upload, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ImageUploadService } from '@/services/imageUploadService';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userId: string;
  onImageUpdate: (imageUrl: string | null) => void;
  disabled?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  userId,
  onImageUpdate,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file using ImageUploadService
    const validation = ImageUploadService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    
    try {
      console.log('🔄 Uploading optimized profile image...');
      
      // Use the optimized ImageUploadService with enhanced error handling
      const uploadResult = await ImageUploadService.uploadProfilePicture(file, userId);
      
      console.log('✅ Optimized image uploaded successfully:', {
        url: uploadResult.url,
        originalSize: uploadResult.originalSize ? `${(uploadResult.originalSize / (1024 * 1024)).toFixed(2)}MB` : 'Unknown',
        optimizedSize: uploadResult.optimizedSize ? `${(uploadResult.optimizedSize / (1024 * 1024)).toFixed(2)}MB` : 'Unknown',
        compressionRatio: uploadResult.compressionRatio ? `${uploadResult.compressionRatio.toFixed(1)}%` : 'N/A'
      });

      // Update user profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: uploadResult.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        
        // Provide specific error message based on error type
        if (updateError.message.includes('violates row-level security')) {
          throw new Error('Permission denied updating profile. Please ensure you are logged in.');
        } else if (updateError.message.includes('not found')) {
          throw new Error('Profile not found. Please contact support.');
        }
        
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('✅ Profile updated with new optimized image URL');
      
      // Call callback to update parent component
      onImageUpdate(uploadResult.url);
      
      // Show success message with optimization stats
      const compressionInfo = uploadResult.compressionRatio 
        ? ` (${uploadResult.compressionRatio.toFixed(1)}% smaller)`
        : '';
      toast.success(`Profile picture updated successfully!${compressionInfo}`);
      
    } catch (error) {
      console.error('❌ Error uploading profile image:', error);
      
      // Provide user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      
      if (errorMessage.includes('bucket not found')) {
        toast.error('Upload system not configured. Please contact support.');
      } else if (errorMessage.includes('permission') || errorMessage.includes('authentication')) {
        toast.error('Please log in again and try uploading.');
      } else if (errorMessage.includes('File too large')) {
        toast.error('Image file is too large. Please use an image smaller than 10MB.');
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(`Upload failed: ${errorMessage}`);
      }
      
      // Reset preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    setIsUploading(true);
    
    try {
      console.log('🗑️ Removing profile image...');
      
      // Update profile to remove image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw updateError;
      }

      // Extract file path from URL and delete from storage
      if (currentImageUrl.includes('profile-images/')) {
        const filePath = currentImageUrl.split('/').slice(-2).join('/');
        await supabase.storage
          .from('images')
          .remove([filePath]);
      }

      console.log('✅ Profile image removed successfully');
      
      setPreviewUrl(null);
      onImageUpdate(null);
      
      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('❌ Error removing profile image:', error);
      toast.error('Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Image Display */}
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
              <AvatarFallback className="text-2xl bg-stepping-purple text-white">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                 onClick={triggerFileSelect}>
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <Button
              onClick={triggerFileSelect}
              disabled={disabled || isUploading}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            
            {previewUrl && (
              <Button
                onClick={handleRemoveImage}
                disabled={disabled || isUploading}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {/* Upload guidelines */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Upload a profile picture (JPG, PNG, GIF)</p>
            <p>Maximum file size: 5MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileImageUpload;