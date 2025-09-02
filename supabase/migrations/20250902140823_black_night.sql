/*
  # Fix Storage RLS Policies for Admin Image Upload

  1. Storage Policies
    - Create policy to allow public read access to Affiches bucket
    - Create policy to allow public insert access to Affiches bucket (for admin uploads)
    - Create policy to allow public update access to Affiches bucket
    - Create policy to allow public delete access to Affiches bucket

  2. Security Notes
    - Since this is an admin-only system with password protection at app level
    - Public storage policies are acceptable for this use case
    - The admin authentication happens at the application level
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access for Affiches" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for Affiches" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for Affiches" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for Affiches" ON storage.objects;

-- Allow public read access to Affiches bucket
CREATE POLICY "Public read access for Affiches"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'Affiches');

-- Allow public insert access to Affiches bucket
CREATE POLICY "Public insert access for Affiches"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'Affiches');

-- Allow public update access to Affiches bucket
CREATE POLICY "Public update access for Affiches"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'Affiches')
  WITH CHECK (bucket_id = 'Affiches');

-- Allow public delete access to Affiches bucket
CREATE POLICY "Public delete access for Affiches"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'Affiches');

-- Ensure the Affiches bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Affiches',
  'Affiches',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];