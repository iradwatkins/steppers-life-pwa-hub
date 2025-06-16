-- Migration: Add missing RLS policies for organizers table and profile picture support
-- Date: 2025-01-16
-- Purpose: Fix organizer profile creation and add profile picture functionality

-- Add profile picture column to organizers table
ALTER TABLE public.organizers ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add missing RLS policies for organizers table
CREATE POLICY IF NOT EXISTS "Users can view own organizer profile" ON public.organizers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create own organizer profile" ON public.organizers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own organizer profile" ON public.organizers FOR UPDATE USING (auth.uid() = user_id);

-- Allow public to view verified organizer profiles (for event listings)
CREATE POLICY IF NOT EXISTS "Public can view verified organizers" ON public.organizers FOR SELECT USING (verified = true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.organizers TO authenticated;
GRANT USAGE ON SEQUENCE organizers_id_seq TO authenticated;