
-- Fix the trigger to handle NULL prices
CREATE OR REPLACE FUNCTION public.track_listing_price_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only track if price is not null and actually changed or is new
  IF NEW.price IS NOT NULL AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.price IS DISTINCT FROM NEW.price)) THEN
    INSERT INTO public.listing_price_history (listing_id, price, currency)
    VALUES (NEW.id, NEW.price, NEW.currency);
  END IF;
  RETURN NEW;
END;
$function$;
