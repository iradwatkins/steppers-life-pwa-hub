-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    capacity INTEGER,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT TRUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    amenities TEXT[],
    images TEXT[],
    accessibility_features TEXT[],
    parking_info TEXT
);

-- Enable RLS on venues
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Create policies for venues
CREATE POLICY "Enable read access for all users on venues"
ON venues FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for organizers and admins on venues"
ON venues FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'organizer')
    )
);

CREATE POLICY "Enable update for admins on venues"
ON venues FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create trigger for venues updated_at
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add venue_id to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

-- Add additional fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE events ADD COLUMN IF NOT EXISTS refund_policy TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS private_notes TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS public_notes TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sales_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sales_end_date TIMESTAMP WITH TIME ZONE;

-- Create event status enum type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed', 'postponed');
        
        -- Convert existing status column to use the enum
        ALTER TABLE events 
            ALTER COLUMN status DROP DEFAULT,
            ALTER COLUMN status TYPE event_status USING status::event_status,
            ALTER COLUMN status SET DEFAULT 'draft'::event_status;
    END IF;
END$$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_country ON venues(country);
CREATE INDEX IF NOT EXISTS idx_venues_is_active ON venues(is_active);
