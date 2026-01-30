-- Supabase Storage bucket + policies for profile media uploads
-- Creates bucket "profile-media" and allows authenticated users to upload/delete files under their own user folder.

-- 1) Create bucket (make it public to allow direct rendering via public URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-media', 'profile-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2) Policies on storage.objects
-- NOTE: storage.objects uses "name" as path inside bucket.
-- We store files as: {ownerUserId}/{profileId}/{mediaType}/{uuid}-{filename}

-- Allow public read (because bucket is public and UI uses getPublicUrl)
DROP POLICY IF EXISTS "Public read profile-media" ON storage.objects;
CREATE POLICY "Public read profile-media"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'profile-media');

-- Allow authenticated read (useful for listing)
DROP POLICY IF EXISTS "Authenticated read profile-media" ON storage.objects;
CREATE POLICY "Authenticated read profile-media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-media');

-- Allow authenticated upload only into their own user folder (prefix auth.uid()/)
DROP POLICY IF EXISTS "Users can upload own profile-media" ON storage.objects;
CREATE POLICY "Users can upload own profile-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-media'
  AND (name LIKE (auth.uid()::text || '/%'))
);

-- Allow authenticated delete only from their own user folder
DROP POLICY IF EXISTS "Users can delete own profile-media" ON storage.objects;
CREATE POLICY "Users can delete own profile-media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-media'
  AND (name LIKE (auth.uid()::text || '/%'))
);

-- Admin/moderator can manage any file in this bucket
DROP POLICY IF EXISTS "Admins can manage profile-media" ON storage.objects;
CREATE POLICY "Admins can manage profile-media"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'profile-media' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'profile-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Moderators can manage profile-media" ON storage.objects;
CREATE POLICY "Moderators can manage profile-media"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'profile-media' AND public.has_role(auth.uid(), 'moderator'))
WITH CHECK (bucket_id = 'profile-media' AND public.has_role(auth.uid(), 'moderator'));

