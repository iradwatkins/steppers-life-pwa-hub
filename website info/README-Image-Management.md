# 🎨 Image Management System

## Overview
A comprehensive image management system for SteppersLife that allows admins to upload, organize, and manage website assets including logos, favicons, banners, and other visual content.

## ✨ Features

### 🔧 Admin Management Interface
- **Upload Interface**: Drag-and-drop file upload with category selection
- **Organization**: Categorize images (logos, favicons, banners, backgrounds, icons, avatars, social media, marketing, content)
- **Theme Support**: Light/dark theme variants for logos
- **Tagging System**: Add tags for better organization and searchability
- **Active/Inactive Status**: Control which images are live on the website
- **Grid/List Views**: Switch between visual and detailed views
- **Search & Filter**: Find images by name, tags, or category

### 🌐 Dynamic Website Integration
- **Auto-Loading Logos**: Logos automatically load based on current theme (light/dark)
- **Dynamic Favicon**: Browser favicon updates automatically from managed assets
- **Fallback System**: Graceful fallbacks when images fail to load
- **Performance**: Optimized loading with caching

### 🔒 Security & Permissions
- **Admin-Only Access**: Only users with admin role can manage images
- **Row Level Security**: Database-level access controls
- **Secure Storage**: Files stored in Supabase with proper permissions
- **File Validation**: Type and size restrictions (JPG, PNG, SVG, WebP, GIF, max 10MB)

## 📍 Access Points

### Admin Dashboard
1. **Login** as admin user
2. **Navigate** to Admin Dashboard (`/admin`)
3. **Click** "Image Management" in Management Tools
4. **URL**: `/admin/image-management`

### API Integration
```typescript
// Get active logos for current theme
const { logoUrl } = useLogo('light' | 'dark');

// Get active favicon
const { faviconUrl } = useFavicon();

// Get images by category
const { images } = useImagesByCategory('banner');
```

## 🏗️ Component Usage

### Logo Components
```tsx
import { Logo, HeaderLogo, FooterLogo, MobileLogo } from '@/components/ui/Logo';

// Basic logo with auto theme detection
<Logo />

// Specific size logo
<HeaderLogo className="custom-class" />
<FooterLogo />
<MobileLogo />
```

### Favicon Management
```tsx
import { FaviconManager } from '@/components/ui/FaviconManager';

// Add to main App component (already integrated)
<FaviconManager fallbackFavicon="/default-favicon.svg" />
```

## 📊 Database Schema

### `image_assets` Table
- **id**: UUID primary key
- **filename**: Unique filename in storage
- **original_name**: User-friendly filename
- **url**: Public URL to the image
- **category**: Image category (logo, favicon, etc.)
- **tags**: Array of searchable tags
- **description**: Optional description
- **size**: File size in bytes
- **width/height**: Image dimensions
- **format**: File format (PNG, JPG, SVG, etc.)
- **theme**: Theme variant (light, dark, auto)
- **is_active**: Whether image is live on site
- **created_by**: User who uploaded
- **created_at/updated_at**: Timestamps

### `image_asset_usage` Table
- **id**: UUID primary key
- **image_asset_id**: Reference to image asset
- **location**: Where the image is used
- **description**: Usage description
- **is_active**: Whether usage is active

## 🚀 Implementation Status

### ✅ Completed
- [x] Image management admin interface
- [x] File upload with categorization
- [x] Dynamic logo loading in headers
- [x] Automatic favicon management
- [x] Database schema and migrations
- [x] Storage bucket configuration
- [x] Row-level security policies
- [x] Theme-aware logo switching
- [x] Search and filtering
- [x] Grid and list views
- [x] Image preview and details
- [x] Active/inactive status management

### 🎯 Categories Available
- 🏢 **Logos**: Brand logos for headers, footers, navigation
- 🌐 **Favicons**: Browser tab icons and app icons
- 📱 **Banners**: Hero banners and promotional images
- 🎨 **Backgrounds**: Page backgrounds and patterns
- ⭐ **Icons**: UI icons and symbols
- 👤 **Avatars**: Profile pictures and user avatars
- 📢 **Social Media**: Social sharing images and platform assets
- 🎯 **Marketing**: Promotional and marketing materials
- 📝 **Content**: Blog images and content assets
- 📁 **Other**: Miscellaneous images

## 🔄 Automatic Features

### Logo Management
- Automatically switches between light/dark logos based on theme
- Fallback to text "SteppersLife" if no logo is available
- Loading placeholders while fetching
- Error handling with graceful degradation

### Favicon Management
- Updates browser favicon automatically
- Handles multiple favicon formats
- Updates Apple touch icons
- Fallback to default favicon

## 📝 Usage Examples

### Upload Images
1. Go to `/admin/image-management`
2. Click "Upload Images"
3. Select category, theme, and tags
4. Drag and drop or select files
5. Images are automatically processed and stored

### Activate Images
1. Find the image in the management interface
2. Click the activation toggle (checkmark icon)
3. Active images will be used on the website

### Search and Filter
- Use search bar to find images by name or tags
- Filter by category using dropdown
- Switch between grid and list views

## 🛠️ Technical Details

### Storage
- **Bucket**: `website-assets` in Supabase Storage
- **Public Access**: Yes, for website display
- **Admin Control**: Upload, update, delete restricted to admins
- **CDN**: Automatic CDN distribution via Supabase

### Performance
- **Caching**: Browser caching with proper headers
- **Optimization**: Automatic image optimization (future enhancement)
- **Lazy Loading**: Component-level loading states
- **Error Handling**: Graceful fallbacks for failed loads

### Security
- **File Validation**: Type and size restrictions
- **Access Control**: Admin-only management
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Proper escaping and validation

## 🎉 Benefits

1. **Centralized Management**: All website images in one place
2. **Theme Consistency**: Automatic theme-appropriate assets
3. **Performance**: Optimized loading and caching
4. **Flexibility**: Easy to update branding across entire site
5. **Security**: Proper access controls and validation
6. **User Experience**: Seamless logo and favicon management
7. **Developer Experience**: Simple hooks and components for integration

The image management system is now fully integrated and ready for use! Admins can upload and manage all website assets through the intuitive interface, while the website automatically uses the appropriate images based on theme and category. 