-- Create enum for referral status
CREATE TYPE public.referral_status AS ENUM ('pending', 'verified', 'rewarded');

-- Create profiles table for user data from Dynamic auth
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    wallet_address TEXT,
    dynamic_user_id TEXT UNIQUE,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table to track referral relationships
CREATE TABLE public.referrals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL UNIQUE,
    referred_email TEXT,
    status public.referral_status NOT NULL DEFAULT 'pending',
    reward_given BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subnames table for issued ENS subnames
CREATE TABLE public.subnames (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subname TEXT NOT NULL UNIQUE,
    referral_count INTEGER NOT NULL DEFAULT 0,
    nft_token_id TEXT UNIQUE,
    contract_address TEXT,
    transaction_hash TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subnames ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referrals table
CREATE POLICY "Users can view their referrals" 
ON public.referrals FOR SELECT 
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = referrer_id
    )
    OR 
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = referred_id
    )
);

CREATE POLICY "Users can create referrals" 
ON public.referrals FOR INSERT 
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = referrer_id
    )
);

CREATE POLICY "Users can update their own referrals" 
ON public.referrals FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = referrer_id
    )
);

-- RLS Policies for subnames table
CREATE POLICY "Users can view their own subnames" 
ON public.subnames FOR SELECT 
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = subnames.user_id
    )
);

CREATE POLICY "Users can insert their own subnames" 
ON public.subnames FOR INSERT 
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = subnames.user_id
    )
);

-- Public policy to view subnames for leaderboard/display purposes
CREATE POLICY "Public can view subnames for display" 
ON public.subnames FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subnames_updated_at
    BEFORE UPDATE ON public.subnames
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_dynamic_user_id ON public.profiles(dynamic_user_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_subnames_user_id ON public.subnames(user_id);
CREATE INDEX idx_subnames_subname ON public.subnames(subname);

-- Create a function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;