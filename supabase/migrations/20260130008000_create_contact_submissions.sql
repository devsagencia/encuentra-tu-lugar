-- Formulario de contacto: guardar consultas para que el equipo pueda responder.
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

CREATE INDEX contact_submissions_created_at_idx ON public.contact_submissions(created_at DESC);
CREATE INDEX contact_submissions_status_idx ON public.contact_submissions(status);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Cualquiera (anon o autenticado) puede enviar un mensaje.
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo admins y moderadores pueden ver y gestionar las consultas.
CREATE POLICY "Admins and moderators can view all contact submissions"
ON public.contact_submissions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update contact submissions"
ON public.contact_submissions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
