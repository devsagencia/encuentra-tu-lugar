-- Función para que solo los admins puedan obtener el email de usuarios (auth.users no es accesible desde el cliente).
-- Sin parámetros para evitar 400 con array uuid[] en PostgREST. Devuelve emails de todos los user_id en user_roles.

CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin()
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Solo los administradores pueden consultar emails de usuarios';
  END IF;
  RETURN QUERY
  SELECT r.user_id, r.email
  FROM (
    SELECT DISTINCT ur.user_id::uuid AS user_id, (u.email)::text AS email
    FROM public.user_roles ur
    INNER JOIN auth.users u ON u.id = ur.user_id
  ) r;
END;
$$;

COMMENT ON FUNCTION public.get_user_emails_for_admin() IS 'Devuelve user_id y email de auth.users para todos los user_roles. Solo admins.';
