-- Create function to expire old job listings
CREATE OR REPLACE FUNCTION public.expire_old_job_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET status = 'expired'
  WHERE listing_type = 'job'
    AND status = 'active'
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the job to run daily at midnight
SELECT cron.schedule(
  'expire-old-job-listings',
  '0 0 * * *',
  $$SELECT public.expire_old_job_listings()$$
);