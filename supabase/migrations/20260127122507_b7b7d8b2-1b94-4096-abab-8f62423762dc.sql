-- Create price history table for tracking price changes
CREATE TABLE public.listing_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_price_history ENABLE ROW LEVEL SECURITY;

-- Anyone can view price history (for transparency)
CREATE POLICY "Anyone can view price history"
  ON public.listing_price_history
  FOR SELECT
  USING (true);

-- Only listing owners can insert price history (via trigger)
CREATE POLICY "System can insert price history"
  ON public.listing_price_history
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_price_history_listing_id ON public.listing_price_history(listing_id);
CREATE INDEX idx_price_history_recorded_at ON public.listing_price_history(recorded_at DESC);

-- Create trigger function to track price changes
CREATE OR REPLACE FUNCTION public.track_listing_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only track if price actually changed or is new
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.price IS DISTINCT FROM NEW.price) THEN
    INSERT INTO public.listing_price_history (listing_id, price, currency)
    VALUES (NEW.id, NEW.price, NEW.currency);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on marketplace_listings
CREATE TRIGGER trigger_track_price_change
AFTER INSERT OR UPDATE OF price ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.track_listing_price_change();

-- Create function to notify users of price drops on their favorites
CREATE OR REPLACE FUNCTION public.notify_price_drop()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_listing_title TEXT;
  v_old_price NUMERIC;
  v_favorite_user RECORD;
BEGIN
  -- Only process if price decreased
  IF NEW.price < OLD.price AND NEW.price IS NOT NULL AND OLD.price IS NOT NULL THEN
    v_listing_title := NEW.title;
    v_old_price := OLD.price;
    
    -- Notify all users who have this item in favorites
    FOR v_favorite_user IN 
      SELECT user_id FROM marketplace_favorites WHERE listing_id = NEW.id
    LOOP
      INSERT INTO public.notifications (user_id, type, message, metadata)
      VALUES (
        v_favorite_user.user_id,
        'price_drop',
        'Price drop! ' || v_listing_title || ' is now $' || NEW.price || ' (was $' || v_old_price || ')',
        jsonb_build_object(
          'listing_id', NEW.id,
          'listing_title', v_listing_title,
          'old_price', v_old_price,
          'new_price', NEW.price,
          'discount_percent', ROUND(((v_old_price - NEW.price) / v_old_price * 100)::NUMERIC, 0)
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for price drop notifications
CREATE TRIGGER trigger_notify_price_drop
AFTER UPDATE OF price ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.notify_price_drop();