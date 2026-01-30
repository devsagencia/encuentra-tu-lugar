-- Add VIP visibility level for profile media
-- - paid: accessible with active plan premium or vip
-- - vip: accessible only with active plan vip

-- IMPORTANT:
-- `ALTER TYPE ... ADD VALUE` can't run inside a DO block (or inside a transaction).
-- So we:
-- 1) create the enum if it doesn't exist (inside DO)
-- 2) add 'vip' as a separate statement (outside DO)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_media_visibility') THEN
    -- Safety: if visibility enum does not exist yet, create it with vip included
    CREATE TYPE public.profile_media_visibility AS ENUM ('public', 'registered', 'paid', 'vip');
  END IF;
END$$;

-- Add enum value if missing (run as its own statement; not inside DO)
ALTER TYPE public.profile_media_visibility ADD VALUE IF NOT EXISTS 'vip';

-- Ensure column exists and default is public
ALTER TABLE public.profile_media
  ADD COLUMN IF NOT EXISTS visibility public.profile_media_visibility NOT NULL DEFAULT 'public';

-- Replace authenticated policy to include vip logic (drop & recreate)
DROP POLICY IF EXISTS "Authenticated can view media by visibility" ON public.profile_media;

CREATE POLICY "Authenticated can view media by visibility"
ON public.profile_media FOR SELECT
TO authenticated
USING (
  -- Owner sees all their media
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_media.profile_id
      AND profiles.user_id = auth.uid()
  )
  OR
  -- Admin/moderator sees all
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
  -- Paid visibility requires active subscription premium or vip
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
        AND subscriptions.plan IN ('premium', 'vip')
    )
  )
  OR
  -- VIP visibility requires active VIP plan
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_media.profile_id
        AND profiles.status = 'approved'
    )
    AND visibility = 'vip'
    AND EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status = 'active'
        AND subscriptions.plan = 'vip'
    )
  )
);

