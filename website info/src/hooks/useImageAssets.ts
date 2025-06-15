import { useState, useEffect } from 'react';
import { imageManagementService, ImageAsset, ImageCategory } from '@/services/imageManagementService';
import { toast } from '@/components/ui/sonner';

interface UseImageAssetsOptions {
  category?: ImageCategory;
  theme?: 'light' | 'dark' | 'auto';
  isActive?: boolean;
}

export const useImageAssets = (options: UseImageAssetsOptions = {}) => {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Temporarily disable database calls until Supabase is properly configured
      // This prevents 404 errors and constant retrying
      const isDatabaseReady = false; // Set to true when database is configured
      
      if (!isDatabaseReady) {
        console.info('📁 Image management database disabled - using static assets');
        setImages([]);
        return;
      }
      
      const filters = {
        category: options.category,
        theme: options.theme,
        isActive: options.isActive
      };

      try {
        const fetchedImages = await imageManagementService.getImages(filters);
        setImages(fetchedImages);
      } catch (dbError) {
        console.warn('Database not ready, using fallback:', dbError);
        
        // Fallback: return empty array if database isn't set up yet
        // This allows the system to work while the database is being configured
        setImages([]);
        
        // Don't throw error for database not being ready
        if (dbError instanceof Error && 
            (dbError.message.includes('relation') || 
             dbError.message.includes('does not exist') ||
             dbError.message.includes('table'))) {
          console.info('Image management database tables not yet created. Please run migrations.');
        } else {
          throw dbError; // Re-throw other errors
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMessage);
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [options.category, options.theme, options.isActive]);

  const refetch = () => {
    fetchImages();
  };

  return {
    images,
    loading,
    error,
    refetch
  };
};

/**
 * Hook to get active logos for the current theme
 */
export const useLogo = (theme: 'light' | 'dark' = 'light') => {
  const { images, loading, error } = useImageAssets({
    category: 'logo',
    theme,
    isActive: true
  });

  const logo = images.length > 0 ? images[0] : null;

  return {
    logo,
    logoUrl: logo?.url,
    loading,
    error
  };
};

/**
 * Hook to get active favicon
 */
export const useFavicon = () => {
  const { images, loading, error } = useImageAssets({
    category: 'favicon',
    isActive: true
  });

  const favicon = images.length > 0 ? images[0] : null;

  return {
    favicon,
    faviconUrl: favicon?.url,
    loading,
    error
  };
};

/**
 * Hook to get active images by category
 */
export const useImagesByCategory = (category: ImageCategory) => {
  return useImageAssets({
    category,
    isActive: true
  });
};

/**
 * Hook to get a specific image by ID
 */
export const useImageById = (imageId: string) => {
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const images = await imageManagementService.getImages();
        const foundImage = images.find(img => img.id === imageId);
        
        if (foundImage) {
          setImage(foundImage);
        } else {
          setError('Image not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch image';
        setError(errorMessage);
        console.error('Error fetching image:', err);
      } finally {
        setLoading(false);
      }
    };

    if (imageId) {
      fetchImage();
    }
  }, [imageId]);

  return {
    image,
    loading,
    error
  };
}; 