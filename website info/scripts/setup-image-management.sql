-- Setup script for Image Management System
-- Run this in your Supabase SQL Editor

-- 1. Create image_assets table for storing website image metadata
CREATE TABLE IF NOT EXISTS image_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('logo', 'favicon', 'banner', 'background', 'icon', 'avatar', 'social', 'marketing', 'content', 'other')),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    size INTEGER NOT NULL CHECK (size > 0),
    width INTEGER NOT NULL DEFAULT 0,
    height INTEGER NOT NULL DEFAULT 0,
    format TEXT NOT NULL,
    theme TEXT CHECK (theme IN ('light', 'dark', 'auto')),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_assets_category ON image_assets(category);
CREATE INDEX IF NOT EXISTS idx_image_assets_is_active ON image_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_image_assets_theme ON image_assets(theme);
CREATE INDEX IF NOT EXISTS idx_image_assets_created_by ON image_assets(created_by);
CREATE INDEX IF NOT EXISTS idx_image_assets_created_at ON image_assets(created_at);

-- 3. Create a GIN index for tags array for efficient tag searching
CREATE INDEX IF NOT EXISTS idx_image_assets_tags ON image_assets USING GIN(tags);

-- 4. Create a text search index for searching by filename and description
CREATE INDEX IF NOT EXISTS idx_image_assets_search ON image_assets USING GIN(
    to_tsvector('english', original_name || ' ' || COALESCE(description, ''))
);

-- 5. Enable Row Level Security
ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for image_assets table
CREATE POLICY "Admins can manage all image assets" ON image_assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can view active image assets" ON image_assets
    FOR SELECT USING (
        auth.role() = 'authenticated' AND is_active = TRUE
    );

CREATE POLICY "Users can view their own uploaded images" ON image_assets
    FOR SELECT USING (
        created_by = auth.uid()
    );

-- 7. Create image_asset_usage table for tracking where images are used
CREATE TABLE IF NOT EXISTS image_asset_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_asset_id UUID NOT NULL REFERENCES image_assets(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_asset_id, location)
);

-- 8. Enable RLS for usage table
ALTER TABLE image_asset_usage ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for usage table
CREATE POLICY "Admins can manage image asset usage" ON image_asset_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can view image asset usage" ON image_asset_usage
    FOR SELECT USING (auth.role() = 'authenticated');

-- 10. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create triggers to auto-update updated_at columns
DROP TRIGGER IF EXISTS update_image_assets_updated_at ON image_assets;
CREATE TRIGGER update_image_assets_updated_at 
    BEFORE UPDATE ON image_assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_image_asset_usage_updated_at ON image_asset_usage;
CREATE TRIGGER update_image_asset_usage_updated_at 
    BEFORE UPDATE ON image_asset_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Create website-assets storage bucket
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'website-assets',
  'website-assets',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'],
  10485760  -- 10MB in bytes
) ON CONFLICT (id) DO NOTHING;

-- 13. Storage bucket policies
CREATE POLICY "Admins can upload website assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'website-assets' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update website assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'website-assets' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete website assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'website-assets' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Website assets are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'website-assets');

-- 14. Insert sample data (optional - remove in production)
-- This will only work if you have at least one user in auth.users
DO $$ 
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get the first user ID (or use a specific admin user)
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO image_assets (
            filename, original_name, url, category, tags, description, 
            size, width, height, format, theme, is_active, created_by
        ) VALUES 
        (
            'logo/steppers-logo-light.svg',
            'SteppersLife Logo Light.svg',
            '/steppers-icon.svg',
            'logo',
            ARRAY['light-theme', 'header', 'navigation'],
            'Main logo for light theme',
            12500,
            200,
            60,
            'SVG',
            'light',
            TRUE,
            sample_user_id
        ),
        (
            'logo/steppers-logo-dark.svg',
            'SteppersLife Logo Dark.svg',
            '/steppers-icon.svg',
            'logo',
            ARRAY['dark-theme', 'header', 'navigation'],
            'Main logo for dark theme',
            12500,
            200,
            60,
            'SVG',
            'dark',
            TRUE,
            sample_user_id
        ),
        (
            'favicon/favicon.svg',
            'SteppersLife Favicon.svg',
            '/steppers-icon.svg',
            'favicon',
            ARRAY['favicon', 'browser-icon'],
            'Website favicon',
            8500,
            32,
            32,
            'SVG',
            'auto',
            TRUE,
            sample_user_id
        ) ON CONFLICT (filename) DO NOTHING;
        
        RAISE NOTICE 'Sample image assets created successfully';
    ELSE
        RAISE NOTICE 'No users found - skipping sample data creation';
    END IF;
END $$;

-- Success message
SELECT 'Image Management System setup completed successfully!' as status; 