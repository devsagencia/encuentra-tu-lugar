-- Public-facing plan badge for profile cards (Premium/VIP)
-- This is intentionally separate from subscriptions/payments so the public directory can display it.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_plan TEXT NOT NULL DEFAULT 'free'
  CHECK (public_plan IN ('free', 'premium', 'vip'));

