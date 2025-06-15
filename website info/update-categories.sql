-- Update SteppersLife Event Categories to Real Categories
-- Run this in Supabase SQL Editor

-- First, clear existing categories
DELETE FROM public.categories;

-- Insert the real SteppersLife event categories
INSERT INTO public.categories (name, description, slug, color, icon, sort_order) VALUES
('Sets', 'Stepping sets and performances by teams and individuals', 'sets', '#EF4444', 'Music', 1),
('Cruises', 'Stepping cruises and boat events with music and dancing', 'cruises', '#0EA5E9', 'Ship', 2),
('Parks', 'Outdoor park stepping events and gatherings', 'parks', '#10B981', 'Trees', 3),
('Workshops', 'Learning and skill development sessions for all levels', 'workshops', '#3B82F6', 'BookOpen', 4),
('Classes', 'Regular stepping instruction classes and lessons', 'classes', '#8B5CF6', 'GraduationCap', 5),
('Competitions', 'Competitive stepping events and battles', 'competitions', '#F59E0B', 'Trophy', 6);

-- Verify the update
SELECT * FROM public.categories ORDER BY sort_order;