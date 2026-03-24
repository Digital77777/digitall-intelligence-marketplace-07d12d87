
-- Fix mutable search_path on review_seller_profile (the simple one)
CREATE OR REPLACE FUNCTION public.review_seller_profile(seller_id bigint, review_text text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN true;
END;
$function$;

-- Fix mutable search_path on rpc_create_connection
CREATE OR REPLACE FUNCTION public.rpc_create_connection(recipient_uuid uuid)
 RETURNS TABLE(id uuid, requester_id uuid, recipient_id uuid, status text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid := gen_random_uuid();
  requester uuid := (SELECT auth.uid());
BEGIN
  IF requester IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.user_connections(id, requester_id, recipient_id, status, created_at, updated_at)
  VALUES (new_id, requester, recipient_uuid, 'pending', now(), now())
  RETURNING user_connections.id, user_connections.requester_id, user_connections.recipient_id, user_connections.status, user_connections.created_at
  INTO id, requester_id, recipient_id, status, created_at;

  RETURN NEXT;
END;
$function$;
