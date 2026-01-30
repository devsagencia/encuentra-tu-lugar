-- Add "Tipo de acompañamiento" (multi-select) to advertiser profiles
-- Stored as text[] to keep it flexible and easy to extend.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accompaniment_types text[] NULL;

