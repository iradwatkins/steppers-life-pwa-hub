import React, { useState, useEffect } from 'react';
import { useLogo } from '@/hooks/useImageAssets';
import { useTheme } from 'next-themes';
import { ImageIcon } from 'lucide-react';

interface LogoProps {
  className?: string;
  alt?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  useStaticImages?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-10 w-auto',
  xl: 'h-12 w-auto'
};

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  alt = 'SteppersLife Logo',
  fallbackText = 'SteppersLife',
  size = 'md',
  priority = false,
  useStaticImages = true
}) => {
  const { theme, systemTheme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoKey, setLogoKey] = useState(() => Date.now()); // Initialize once
  
  // Determine the effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const logoTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
  
  // Always call useLogo hook to avoid hooks order issues
  const { logo, logoUrl, loading, error } = useLogo(logoTheme);
  
  // Reset error state and force new logo when theme changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    // Only update logoKey if theme actually changed, not undefined
    if (effectiveTheme !== undefined) {
      setLogoKey(Date.now());
    }
  }, [effectiveTheme]);
  
  if (useStaticImages) {
    // Use static logo images with aggressive cache busting for updated logos
    const logoSrc = effectiveTheme === 'dark' 
      ? `/icons/logo-light.png?theme=dark&v=${logoKey}` 
      : `/icons/logo-dark.png?theme=light&v=${logoKey}`;
    
    // Enhanced debug logging (only log when theme actually changes)
    const shouldLog = import.meta.env.DEV && effectiveTheme !== undefined;
    if (shouldLog) {
      console.log('🎨 Logo Theme Switch:', { 
        theme, 
        systemTheme, 
        effectiveTheme, 
        logoSrc,
        isDark: effectiveTheme === 'dark'
      });
    }
    
    // If we've had an error, try the database approach
    if (imageError) {
      if (loading) {
        return (
          <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}>
            <ImageIcon className="h-4 w-4 text-gray-400" />
          </div>
        );
      }
      
      if (error || !logoUrl) {
        return (
          <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              {fallbackText}
            </span>
          </div>
        );
      }
      
      return (
        <img
          src={logoUrl}
          alt={alt}
          className={`${sizeClasses[size]} ${className} object-contain`}
        />
      );
    }
    
    return (
      <div className={`${sizeClasses[size]} ${className} relative`} data-theme={effectiveTheme} data-logo-type={effectiveTheme === 'dark' ? 'light' : 'dark'}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded animate-pulse">
            <ImageIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <img
          src={logoSrc}
          alt={alt}
          key={logoKey} // Force React to re-render the image element
          className={`${sizeClasses[size]} ${className} object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => {
            console.log('✅ Logo loaded successfully:', logoSrc);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.log('❌ Static logo failed, falling back to database logo:', logoSrc);
            setImageError(true);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }
  
  // Show loading placeholder
  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}>
        <ImageIcon className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  // Show fallback if no logo or error
  if (error || !logoUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <span className="font-bold text-gray-900 dark:text-white text-lg">
          {fallbackText}
        </span>
      </div>
    );
  }

  // Render the logo
  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
};

// Specialized logo components for common use cases - no text fallback for header
export const HeaderLogo: React.FC<Omit<LogoProps, 'size' | 'fallbackText'>> = (props) => (
  <Logo {...props} size="lg" fallbackText="" useStaticImages={true} />
);

export const FooterLogo: React.FC<Omit<LogoProps, 'size'>> = (props) => (
  <Logo {...props} size="md" useStaticImages={true} />
);

export const MobileLogo: React.FC<Omit<LogoProps, 'size' | 'fallbackText'>> = (props) => (
  <Logo {...props} size="md" fallbackText="" useStaticImages={true} />
);

export const EmailLogo: React.FC<Omit<LogoProps, 'size'>> = (props) => (
  <Logo {...props} size="xl" useStaticImages={true} />
);
