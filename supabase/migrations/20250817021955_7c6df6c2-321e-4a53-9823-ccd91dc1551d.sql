-- Add campaign and description metadata to referrals table
ALTER TABLE public.referrals 
ADD COLUMN campaign_name TEXT,
ADD COLUMN description TEXT,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN click_count INTEGER NOT NULL DEFAULT 0;

-- Add index for better performance on active referrals
CREATE INDEX idx_referrals_active ON public.referrals(referrer_id, is_active) WHERE is_active = true;

-- Add index for campaign lookup
CREATE INDEX idx_referrals_campaign ON public.referrals(referrer_id, campaign_name) WHERE campaign_name IS NOT NULL;