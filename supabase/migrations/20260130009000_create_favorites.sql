-- Favoritos: usuarios registrados pueden guardar perfiles (límites por plan visitante).
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_profile_id_idx ON public.favorites(profile_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Solo el propio usuario puede ver, crear y borrar sus favoritos.
CREATE POLICY "Users can view own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
