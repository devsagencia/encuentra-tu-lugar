-- Ejecuta este script en Supabase (SQL Editor) para recalcular los conteos
-- de contenido privado en todos los perfiles. Útil si:
-- - Acabas de ejecutar la migración 20260130007000 y ya tenías media con visibility != 'public'
-- - Los números no se actualizan al cambiar la visibilidad del media
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
