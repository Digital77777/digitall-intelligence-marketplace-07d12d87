
-- Add pricing_tiers column to store tier-based pricing (Free, Starter, Pro, Enterprise)
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS pricing_tiers jsonb DEFAULT NULL;

-- Example structure: [{"name": "Free", "price": 0, "period": "forever", "features": ["Basic access"]}, {"name": "Pro", "price": 29, "period": "monthly", "features": ["All features"]}]
COMMENT ON COLUMN public.marketplace_listings.pricing_tiers IS 'JSON array of pricing tiers with name, price, period, and features';
