import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Camera, Image as ImageIcon, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUploadService } from '@/services/imageUploadService';
import { useAuth } from '@/hooks/useAuth';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  variant?: 'avatar' | 'gallery' | 'featured';
  className?: string;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  maxFiles = 3,
  variant = 'gallery',
  className,
  disabled = false,
  accept = 'image/*',
  maxSize = 5,
  placeholder
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentValue = Array.isArray(value) ? value : (value ? [value] : []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!user?.id) {
      setUploadError('You must be logged in to upload images');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate files
      for (const file of files) {
        const validation = ImageUploadService.validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Check total file count
      if (multiple && currentValue.length + files.length > maxFiles) {
        throw new Error(`Cannot upload more than ${maxFiles} images`);
      }

      // Upload files to Supabase Storage
      const uploadPromises = files.map(async (file) => {
        if (variant === 'avatar') {
          return await ImageUploadService.uploadProfilePicture(file, user.id);
        } else {
          return await ImageUploadService.uploadImage(file, 'images', `events/${user.id}`);
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      const newImageUrls = uploadResults.map(result => result.url);

      if (multiple) {
        onChange([...currentValue, ...newImageUrls]);
      } else {
        onChange(newImageUrls[0]);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexOrUrl: number | string) => {
    if (multiple) {
      const newValue = currentValue.filter((_, index) => index !== indexOrUrl);
      onChange(newValue);
    } else {
      onChange('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (variant === 'avatar') {
    return (
      <div className={cn('flex flex-col items-center space-y-4', className)}>
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={currentValue[0]} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          {currentValue[0] && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => handleRemove(0)}
              disabled={disabled || isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {isUploading ? 'Uploading...' : currentValue[0] ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            {placeholder || `Max ${maxSize}MB • JPG, PNG, GIF`}
          </p>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {uploadError}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/40 transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="font-medium">
                {variant === 'featured' ? 'Upload Featured Image' : 'Upload Images'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {placeholder || `Drag and drop or click to select ${multiple ? 'images' : 'an image'}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max {maxSize}MB per file • {multiple ? `${maxFiles} files max` : 'Single file'} • JPG, PNG, GIF
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={disabled || isUploading || (multiple && currentValue.length >= maxFiles)}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Images */}
      {currentValue.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(currentValue || []).map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
              >
                <X className="h-3 w-3" />
              </Button>

              {variant === 'featured' && index === 0 && (
                <Badge className="absolute bottom-2 left-2 bg-green-600">
                  Featured
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4" />
          {uploadError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};