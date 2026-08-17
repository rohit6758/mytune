-- Run this in your Supabase SQL Editor to add cover support to playlists

-- 1. Add cover column to playlists table
ALTER TABLE public.playlists
ADD COLUMN IF NOT EXISTS cover TEXT;

-- 2. Create a storage bucket for playlist cover photos (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow authenticated users to upload to the covers bucket
-- (Note: If you run this multiple times and get a "policy already exists" error, that is perfectly fine and can be ignored!)
CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Anyone can view covers"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'covers');

CREATE POLICY "Users can update their own covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'covers');
