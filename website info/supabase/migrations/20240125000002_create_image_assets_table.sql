-- Create image_assets table for storing website image metadata
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_assets_category ON image_assets(category);
CREATE INDEX IF NOT EXISTS idx_image_assets_is_active ON image_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_image_assets_theme ON image_assets(theme);
CREATE INDEX IF NOT EXISTS idx_image_assets_created_by ON image_assets(created_by);
CREATE INDEX IF NOT EXISTS idx_image_assets_created_at ON image_assets(created_at);

-- Create a GIN index for tags array for efficient tag searching
CREATE INDEX IF NOT EXISTS idx_image_assets_tags ON image_assets USING GIN(tags);

-- Create a text search index for searching by filename and description
CREATE INDEX IF NOT EXISTS idx_image_assets_search ON image_assets USING GIN(
    to_tsvector('english', original_name || ' ' || COALESCE(description, ''))
);

-- Enable Row Level Security
ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;

-- Policy for admins to have full access
CREATE POLICY "Admins can manage all image assets" ON image_assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy for authenticated users to read active images
CREATE POLICY "Authenticated users can view active image assets" ON image_assets
    FOR SELECT USING (
        auth.role() = 'authenticated' AND is_active = TRUE
    );

-- Policy for users to read their own uploaded images
CREATE POLICY "Users can view their own uploaded images" ON image_assets
    FOR SELECT USING (
        created_by = auth.uid()
    );

-- Create image_asset_usage table for tracking where images are used
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

-- Enable RLS for usage table
ALTER TABLE image_asset_usage ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage usage records
CREATE POLICY "Admins can manage image asset usage" ON image_asset_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy for authenticated users to read usage records
CREATE POLICY "Authenticated users can view image asset usage" ON image_asset_usage
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at columns
CREATE TRIGGER update_image_assets_updated_at 
    BEFORE UPDATE ON image_assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_asset_usage_updated_at 
    BEFORE UPDATE ON image_asset_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get images with usage information
CREATE OR REPLACE FUNCTION get_images_with_usage()
RETURNS TABLE (
    id UUID,
    filename TEXT,
    original_name TEXT,
    url TEXT,
    category TEXT,
    tags TEXT[],
    description TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER,
    format TEXT,
    theme TEXT,
    is_active BOOLEAN,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    usage_locations JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ia.id,
        ia.filename,
        ia.original_name,
        ia.url,
        ia.category,
        ia.tags,
        ia.description,
        ia.size,
        ia.width,
        ia.height,
        ia.format,
        ia.theme,
        ia.is_active,
        ia.created_by,
        ia.created_at,
        ia.updated_at,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'location', iau.location,
                    'description', iau.description,
                    'active', iau.is_active
                )
            ) FILTER (WHERE iau.id IS NOT NULL),
            '[]'::JSON
        ) as usage_locations
    FROM image_assets ia
    LEFT JOIN image_asset_usage iau ON ia.id = iau.image_asset_id
    GROUP BY ia.id, ia.filename, ia.original_name, ia.url, ia.category, 
             ia.tags, ia.description, ia.size, ia.width, ia.height, 
             ia.format, ia.theme, ia.is_active, ia.created_by, 
             ia.created_at, ia.updated_at
    ORDER BY ia.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users to execute the function
GRANT EXECUTE ON FUNCTION get_images_with_usage() TO authenticated;

-- Insert some sample data for demonstration (optional)
-- This would be removed in production
-- INSERT INTO image_assets (
--     filename, original_name, url, category, tags, description, 
--     size, width, height, format, theme, is_active, created_by
-- ) VALUES 
-- (
--     'logo/steppers-logo-light.svg',
--     'SteppersLife Logo Light.svg',
--     '/steppers-icon.svg',
--     'logo',
--     ARRAY['light-theme', 'header', 'navigation'],
--     'Main logo for light theme',
--     12500,
--     200,
--     60,
--     'SVG',
--     'light',
--     TRUE,
--     (SELECT id FROM auth.users LIMIT 1)
-- ) ON CONFLICT (filename) DO NOTHING;

-- Insert corresponding usage record
-- INSERT INTO image_asset_usage (
--     image_asset_id, location, description, is_active
-- ) SELECT 
--     id, 
--     'Header Navigation', 
--     'Primary header logo', 
--     TRUE
-- FROM image_assets 
-- WHERE filename = 'logo/steppers-logo-light.svg'
-- ON CONFLICT (image_asset_id, location) DO NOTHING; 