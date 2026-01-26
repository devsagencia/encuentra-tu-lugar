-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix function search_path for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert stats" ON public.profile_stats;
DROP POLICY IF EXISTS "Anyone can update stats" ON public.profile_stats;

-- Create proper policies for profile_stats (tracking views anonymously but controlled)
CREATE POLICY "Authenticated can insert stats"
ON public.profile_stats FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can insert stats"
ON public.profile_stats FOR INSERT
TO anon
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = profile_stats.profile_id
        AND profiles.status = 'approved'
    )
);

CREATE POLICY "Stats can be updated by system"
ON public.profile_stats FOR UPDATE
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = profile_stats.profile_id
        AND profiles.status = 'approved'
    )
);