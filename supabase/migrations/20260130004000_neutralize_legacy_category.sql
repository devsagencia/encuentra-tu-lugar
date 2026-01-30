-- Neutralize legacy `profiles.category` to align with Contactalia purpose.
-- The platform now uses `profiles.accompaniment_types` (multi-select activities) for discovery.

ALTER TABLE public.profiles
  ALTER COLUMN category SET DEFAULT 'social';

UPDATE public.profiles
SET category = 'social'
WHERE category IS NULL
   OR category IN ('escort', 'gay', 'trans', 'swinger', 'club', 'tienda');

