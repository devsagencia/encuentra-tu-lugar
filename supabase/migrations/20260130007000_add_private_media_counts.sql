-- Conteos de contenido privado (no público) por perfil, para mostrar placeholders
-- desenfocados a visitantes sin login sin exponer el contenido.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS private_images_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS private_videos_count integer NOT NULL DEFAULT 0;

-- Función que recalcula los conteos para un perfil (media con visibility != 'public').
CREATE OR REPLACE FUNCTION public.update_profile_private_media_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_profile_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_profile_id := OLD.profile_id;
  ELSE
    target_profile_id := NEW.profile_id;
  END IF;

  UPDATE public.profiles
  SET
    private_images_count = (
      SELECT count(*)::integer
      FROM public.profile_media
      WHERE profile_id = target_profile_id
        AND media_type = 'image'
        AND visibility != 'public'
    ),
    private_videos_count = (
      SELECT count(*)::integer
      FROM public.profile_media
      WHERE profile_id = target_profile_id
        AND media_type = 'video'
        AND visibility != 'public'
    )
  WHERE id = target_profile_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_profile_private_media_counts ON public.profile_media;
CREATE TRIGGER trigger_update_profile_private_media_counts
  AFTER INSERT OR UPDATE OR DELETE
  ON public.profile_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_private_media_counts();

-- Rellenar valores iniciales para perfiles existentes.
UPDATE public.profiles p
SET
  private_images_count = (
    SELECT count(*)::integer
    FROM public.profile_media m
    WHERE m.profile_id = p.id
      AND m.media_type = 'image'
      AND m.visibility != 'public'
  ),
  private_videos_count = (
    SELECT count(*)::integer
    FROM public.profile_media m
    WHERE m.profile_id = p.id
      AND m.media_type = 'video'
      AND m.visibility != 'public'
  );
