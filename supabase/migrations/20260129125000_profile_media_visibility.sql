-- Add visibility levels to profile media
-- public: visible for everyone
-- registered: visible only for authenticated users
-- paid: visible only for authenticated users with active subscription

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_media_visibility') THEN
    CREATE TYPE public.profile_media_visibility AS ENUM ('public', 'registered', 'paid');
  END IF;
END$$;

ALTER TABLE public.profile_media
  ADD COLUMN IF NOT EXISTS visibility public.profile_media_visibility NOT NULL DEFAULT 'public';

-- Replace SELECT policies to enforce visibility
DROP POLICY IF EXISTS "Public can view approved profile media" ON public.profile_media;
DROP POLICY IF EXISTS "Users can view their own profile media" ON public.profile_media;
DROP POLICY IF EXISTS "Admins and moderators can view all profile media" ON public.profile_media;

-- Public: only approved profile + visibility=public
CREATE POLICY "Public can view approved public media"
ON public.profile_media FOR SELECT
TO anon
USING (
  visibility = 'public'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.status = 'approved'
  )
);

-- Authenticated:
-- - owner sees all their media
-- - admins/moderators see all
-- - others see approved + public/registered
-- - paid requires active subscription (subscriptions.status='active')
CREATE POLICY "Authenticated can view media by visibility"
ON public.profile_media FOR SELECT
TO authenticated
USING (
  -- Owner
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
  OR
  -- Admin/moderator
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  OR
  -- Public/registered visibility on approved profiles
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_media.profile_id
        AND profiles.status = 'approved'
    )
    AND visibility IN ('public', 'registered')
  )
  OR
  -- Paid visibility requires active subscription
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_media.profile_id
        AND profiles.status = 'approved'
    )
    AND visibility = 'paid'
    AND EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status = 'active'
    )
  )
);

