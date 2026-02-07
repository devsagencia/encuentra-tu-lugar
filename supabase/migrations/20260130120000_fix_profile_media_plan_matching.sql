-- Fix: subscription plan is stored as 'premium_visitante', 'vip_anunciante', etc.
-- RLS was checking plan IN ('premium', 'vip') which never matched.
-- Use LIKE 'premium%' and LIKE 'vip%' so paid/vip visibility works.

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
  -- Paid visibility: active subscription with plan starting with 'premium' or 'vip'
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
        AND (subscriptions.plan LIKE 'premium%' OR subscriptions.plan LIKE 'vip%')
    )
  )
  OR
  -- VIP visibility: active subscription with plan starting with 'vip'
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
        AND subscriptions.plan LIKE 'vip%'
    )
  )
);
