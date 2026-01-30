-- Media (images/videos) for profiles
CREATE TYPE public.profile_media_type AS ENUM ('image', 'video');

CREATE TABLE public.profile_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_type public.profile_media_type NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX profile_media_profile_id_idx ON public.profile_media(profile_id);
CREATE INDEX profile_media_profile_id_position_idx ON public.profile_media(profile_id, position);

ALTER TABLE public.profile_media ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own media
CREATE POLICY "Users can view their own profile media"
ON public.profile_media FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own profile media"
ON public.profile_media FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own profile media"
ON public.profile_media FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own profile media"
ON public.profile_media FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
);

-- Admins and moderators can view/manage any media
CREATE POLICY "Admins and moderators can view all profile media"
ON public.profile_media FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can manage any profile media"
ON public.profile_media FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Public can view media only for approved profiles
CREATE POLICY "Public can view approved profile media"
ON public.profile_media FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.status = 'approved'
  )
);

