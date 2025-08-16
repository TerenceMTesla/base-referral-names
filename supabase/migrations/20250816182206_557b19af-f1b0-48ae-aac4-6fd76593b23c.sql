-- Fix security warnings by setting search_path on functions

-- Update the timestamp function with security definer and search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update the referral code generation function with security definer and search path
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    code TEXT;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = code) THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$;