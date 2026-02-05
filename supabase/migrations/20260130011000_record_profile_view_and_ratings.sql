-- Registrar vista al abrir un perfil (anon o auth) y actualizar profiles.views_count
CREATE OR REPLACE FUNCTION public.record_profile_view(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_profile_id AND status = 'approved') THEN
    RETURN;
  END IF;
  INSERT INTO public.profile_stats (profile_id, view_date, views)
  VALUES (p_profile_id, CURRENT_DATE, 1)
  ON CONFLICT (profile_id, view_date) DO UPDATE SET views = profile_stats.views + 1;
  UPDATE public.profiles
  SET views_count = (SELECT COALESCE(SUM(views), 0)::integer FROM public.profile_stats WHERE profile_id = p_profile_id)
  WHERE id = p_profile_id;
END;
$$;

COMMENT ON FUNCTION public.record_profile_view(uuid) IS 'Registra una vista del perfil (anon/auth) y actualiza views_count.';

-- Tabla de valoraciones (estrellas) por usuario
CREATE TABLE IF NOT EXISTS public.profile_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id)
);

ALTER TABLE public.profile_ratings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer valoraciones (para mostrar media y reseñas)
CREATE POLICY "Anyone can read ratings"
  ON public.profile_ratings FOR SELECT
  USING (true);

-- Solo autenticados pueden insertar/actualizar su propia valoración
CREATE POLICY "Users can insert own rating"
  ON public.profile_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
  ON public.profile_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No valorar tu propio perfil: lo comprobamos en la app o con trigger
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
    rating = (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM public.profile_ratings r WHERE r.profile_id = v_profile_id),
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
