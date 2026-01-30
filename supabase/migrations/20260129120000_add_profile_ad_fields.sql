-- Add fields for "Crear anuncio" profile form
ALTER TABLE public.profiles
  ADD COLUMN phone TEXT,
  ADD COLUMN whatsapp BOOLEAN DEFAULT false,
  ADD COLUMN zone TEXT,
  ADD COLUMN postal_code TEXT,
  ADD COLUMN languages TEXT[] DEFAULT '{}',
  ADD COLUMN available_days TEXT[] DEFAULT '{}',
  ADD COLUMN schedule TEXT,
  ADD COLUMN hair_color TEXT,
  ADD COLUMN height_cm INTEGER,
  ADD COLUMN weight_kg INTEGER,
  ADD COLUMN profession TEXT,
  ADD COLUMN nationality TEXT,
  ADD COLUMN birth_place TEXT;

-- Basic validation constraints (optional fields allowed)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_9_digits_chk
    CHECK (phone IS NULL OR phone ~ '^\d{9}$');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_postal_code_5_digits_chk
    CHECK (postal_code IS NULL OR postal_code ~ '^\d{5}$');

