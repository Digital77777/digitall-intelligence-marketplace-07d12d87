-- Fix 1: Update seller_profiles admin policies to use has_role() instead of deprecated admin_users table
DROP POLICY IF EXISTS "admins_can_update_seller_profiles" ON public.seller_profiles;
DROP POLICY IF EXISTS "admins_can_view_all_seller_profiles" ON public.seller_profiles;

CREATE POLICY "admins_can_update_seller_profiles"
ON public.seller_profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_can_view_all_seller_profiles"
ON public.seller_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Update voice-notes storage policy to enforce folder ownership
DROP POLICY IF EXISTS "Authenticated users can upload voice notes" ON storage.objects;

CREATE POLICY "Authenticated users can upload voice notes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix 3: Update functions with empty search_path to use 'public'
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id bigint, p_message text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id bigint;
BEGIN
    INSERT INTO public.notifications (user_id, message, created_at)
    VALUES (p_user_id::uuid, p_message, NOW())
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_seller_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Notify user about seller status change
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO public.notifications (user_id, type, message, metadata)
        VALUES (
            NEW.user_id,
            'seller_status',
            'Your seller profile status has been updated to: ' || NEW.status,
            jsonb_build_object('seller_profile_id', NEW.id, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;