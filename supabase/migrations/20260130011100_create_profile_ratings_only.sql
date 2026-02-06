-- Solo tabla de valoraciones (estrellas). Ejecuta esto en Supabase si profile_ratings da 404.

CREATE TABLE IF NOT EXISTS public.profile_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id)
);

ALTER TABLE public.profile_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read ratings" ON public.profile_ratings;
CREATE POLICY "Anyone can read ratings"
  ON public.profile_ratings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own rating" ON public.profile_ratings;
CREATE POLICY "Users can insert own rating"
  ON public.profile_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rating" ON public.profile_ratings;
CREATE POLICY "Users can update own rating"
  ON public.profile_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_profile_rating_from_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid := COALESCE(NEW.profile_id, OLD.profile_id);
BEGIN
  UPDATE public.profiles p
  SET
    rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM public.profile_ratings r WHERE r.profile_id = v_profile_id), 0),
    reviews_count = (SELECT COUNT(*)::integer FROM public.profile_ratings r WHERE r.profile_id = v_profile_id)
  WHERE p.id = v_profile_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_profile_rating ON public.profile_ratings;
CREATE TRIGGER trigger_sync_profile_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.profile_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_rating_from_ratings();

COMMENT ON TABLE public.profile_ratings IS 'Valoraciones 1-5 estrellas de visitantes a perfiles.';
