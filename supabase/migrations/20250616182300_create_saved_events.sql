-- Create saved_events table for user event wishlist functionality
CREATE TABLE saved_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- User notes and preferences
  notes TEXT,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10), -- 0 = low, 10 = high
  
  -- Tracking
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Prevent duplicate saves
  UNIQUE(user_id, event_id)
);

-- Create indexes for performance
CREATE INDEX idx_saved_events_user_id ON saved_events(user_id);
CREATE INDEX idx_saved_events_event_id ON saved_events(event_id);
CREATE INDEX idx_saved_events_saved_at ON saved_events(user_id, saved_at DESC);
CREATE INDEX idx_saved_events_priority ON saved_events(user_id, priority DESC);

-- Enable Row Level Security
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own saved events
CREATE POLICY "Users can view their own saved events" ON saved_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save events" ON saved_events
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved events" ON saved_events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own saved events" ON saved_events
FOR DELETE USING (auth.uid() = user_id);

-- Function to update last_viewed_at when event is accessed from wishlist
CREATE OR REPLACE FUNCTION update_saved_event_viewed(
  p_user_id UUID,
  p_event_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE saved_events 
  SET last_viewed_at = NOW()
  WHERE user_id = p_user_id 
  AND event_id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's saved events with full event details
CREATE OR REPLACE FUNCTION get_user_saved_events(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  saved_event_id UUID,
  event_id UUID,
  event_title TEXT,
  event_description TEXT,
  event_category TEXT,
  event_start_date TIMESTAMP WITH TIME ZONE,
  event_end_date TIMESTAMP WITH TIME ZONE,
  event_is_online BOOLEAN,
  venue_name TEXT,
  venue_city TEXT,
  venue_state TEXT,
  min_price DECIMAL,
  max_price DECIMAL,
  notes TEXT,
  priority INTEGER,
  saved_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id as saved_event_id,
    e.id as event_id,
    e.title as event_title,
    e.description as event_description,
    e.category as event_category,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    e.is_online as event_is_online,
    v.name as venue_name,
    v.city as venue_city,
    v.state as venue_state,
    COALESCE(MIN(tt.price), 0) as min_price,
    COALESCE(MAX(tt.price), 0) as max_price,
    se.notes,
    se.priority,
    se.saved_at,
    se.last_viewed_at
  FROM saved_events se
  JOIN events e ON se.event_id = e.id
  LEFT JOIN venues v ON e.venue_id = v.id
  LEFT JOIN ticket_types tt ON e.id = tt.event_id AND tt.is_active = TRUE
  WHERE se.user_id = p_user_id
  GROUP BY se.id, e.id, v.id
  ORDER BY se.priority DESC, se.saved_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has saved a specific event
CREATE OR REPLACE FUNCTION is_event_saved_by_user(
  p_user_id UUID,
  p_event_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM saved_events
    WHERE user_id = p_user_id AND event_id = p_event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get saved events count for a user
CREATE OR REPLACE FUNCTION get_user_saved_events_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM saved_events
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update last_viewed_at
CREATE OR REPLACE FUNCTION update_saved_event_last_viewed()
RETURNS TRIGGER AS $$
BEGIN
  -- This could be triggered when user views event details from their wishlist
  -- Implementation would depend on how we track view events
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to clean up saved events when events are deleted
-- This is already handled by the foreign key ON DELETE CASCADE

-- Add some sample saved event categories for metadata
CREATE TABLE saved_event_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_code TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO saved_event_categories (name, description, color_code) VALUES
('Must Attend', 'Events I definitely want to attend', '#ef4444'),
('Maybe', 'Events I might be interested in', '#f59e0b'),
('Backup Plans', 'Alternative events if main plans fall through', '#8b5cf6'),
('With Friends', 'Events to attend with specific friends', '#10b981'),
('Learning', 'Educational workshops and classes', '#3b82f6'),
('Social', 'Social events and networking', '#f97316'),
('Date Ideas', 'Events for dates or romantic occasions', '#ec4899');

-- Add comments for documentation
COMMENT ON TABLE saved_events IS 'User wishlist/saved events for later consideration and tracking';
COMMENT ON COLUMN saved_events.priority IS 'User-defined priority from 0 (low) to 10 (high priority)';
COMMENT ON COLUMN saved_events.notes IS 'User notes about why they saved this event';
COMMENT ON FUNCTION get_user_saved_events IS 'Efficiently retrieves saved events with full event details and pricing info';