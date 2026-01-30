-- Manual phone verification (Option A)
ALTER TABLE public.profiles
  ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN phone_verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Prevent non-admin/non-moderator users from setting phone_verified fields on their own
CREATE OR REPLACE FUNCTION public.prevent_user_phone_verification_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins/moderators to change anything
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator') THEN
    RETURN NEW;
  END IF;

  -- Allow owner to update profile, but not phone verification columns
  IF auth.uid() = OLD.user_id THEN
    IF NEW.phone_verified IS DISTINCT FROM OLD.phone_verified
      OR NEW.phone_verified_at IS DISTINCT FROM OLD.phone_verified_at
      OR NEW.phone_verified_by IS DISTINCT FROM OLD.phone_verified_by THEN
      RAISE EXCEPTION 'phone verification fields cannot be changed by the profile owner';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_user_phone_verification_changes ON public.profiles;
CREATE TRIGGER prevent_user_phone_verification_changes
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_phone_verification_changes();

