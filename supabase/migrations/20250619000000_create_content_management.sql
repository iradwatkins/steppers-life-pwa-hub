-- Content Management System Database Schema
-- For managing static pages and content

-- Create enum types for content management
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_type AS ENUM ('page', 'post', 'faq_item');

-- Content pages table
CREATE TABLE public.content_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    meta_keywords TEXT[],
    type content_type DEFAULT 'page',
    status content_status DEFAULT 'draft',
    featured_image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_system_page BOOLEAN DEFAULT false, -- For pages like Terms, Privacy, etc.
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content page versions for version history and rollback
CREATE TABLE public.content_page_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES public.content_pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    meta_keywords TEXT[],
    status content_status NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(page_id, version_number)
);

-- Indexes for performance
CREATE INDEX idx_content_pages_slug ON public.content_pages(slug);
CREATE INDEX idx_content_pages_status ON public.content_pages(status);
CREATE INDEX idx_content_pages_type ON public.content_pages(type);
CREATE INDEX idx_content_pages_system ON public.content_pages(is_system_page);
CREATE INDEX idx_content_page_versions_page_id ON public.content_page_versions(page_id);
CREATE INDEX idx_content_page_versions_version ON public.content_page_versions(page_id, version_number DESC);

-- Row Level Security policies
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_page_versions ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Public can read published content" ON public.content_pages
    FOR SELECT USING (status = 'published');

-- Admin users can manage all content
CREATE POLICY "Admin users can manage content" ON public.content_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Admin users can manage content versions
CREATE POLICY "Admin users can manage content versions" ON public.content_page_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Function to auto-increment version numbers
CREATE OR REPLACE FUNCTION increment_content_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the next version number for this page
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM public.content_page_versions
    WHERE page_id = NEW.page_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version numbers
CREATE TRIGGER trigger_increment_content_version
    BEFORE INSERT ON public.content_page_versions
    FOR EACH ROW
    EXECUTE FUNCTION increment_content_version();

-- Function to create version when content is updated
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a new version record when content changes
    IF TG_OP = 'UPDATE' AND (
        OLD.title != NEW.title OR 
        OLD.content != NEW.content OR 
        OLD.meta_description != NEW.meta_description OR 
        OLD.status != NEW.status
    ) THEN
        INSERT INTO public.content_page_versions (
            page_id,
            title,
            content,
            meta_description,
            meta_keywords,
            status,
            created_by
        ) VALUES (
            NEW.id,
            NEW.title,
            NEW.content,
            NEW.meta_description,
            NEW.meta_keywords,
            NEW.status,
            NEW.updated_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create versions
CREATE TRIGGER trigger_create_content_version
    AFTER UPDATE ON public.content_pages
    FOR EACH ROW
    EXECUTE FUNCTION create_content_version();

-- Insert default system pages
INSERT INTO public.content_pages (title, slug, content, type, status, is_system_page) VALUES 
    ('About Us', 'about-us', '<h1>About SteppersLife</h1><p>Welcome to SteppersLife - your premier destination for step dancing and community events.</p>', 'page', 'published', true),
    ('Contact Us', 'contact-us', '<h1>Contact Us</h1><p>Get in touch with the SteppersLife team.</p><p>Email: info@stepperslife.com</p>', 'page', 'published', true),
    ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>Please read these terms carefully before using our service.</p>', 'page', 'published', true),
    ('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your information.</p>', 'page', 'published', true),
    ('Frequently Asked Questions', 'faq', '<h1>FAQ</h1><p>Find answers to commonly asked questions about SteppersLife.</p>', 'page', 'published', true);