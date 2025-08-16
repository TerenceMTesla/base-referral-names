-- Create referral status enum
CREATE TYPE public.referral_status AS ENUM ('pending', 'verified', 'rewarded');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  wallet_address TEXT,
  dynamic_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code TEXT NOT NULL,
  referrer_id UUID NOT NULL,
  referred_id UUID,
  referred_email TEXT,
  status referral_status NOT NULL DEFAULT 'pending',
  reward_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = referrals.referrer_id
    ) OR auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = referrals.referred_id
    )
  );

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = referrals.referrer_id
    )
  );

CREATE POLICY "Users can update their own referrals" ON public.referrals
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = referrals.referrer_id
    )
  );

-- Create subnames table
CREATE TABLE public.subnames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subname TEXT NOT NULL,
  referral_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  contract_address TEXT,
  transaction_hash TEXT,
  nft_token_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subnames
ALTER TABLE public.subnames ENABLE ROW LEVEL SECURITY;

-- Create policies for subnames
CREATE POLICY "Users can view their own subnames" ON public.subnames
  FOR SELECT USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = subnames.user_id
    )
  );

CREATE POLICY "Public can view subnames for display" ON public.subnames
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own subnames" ON public.subnames
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = subnames.user_id
    )
  );

-- Create triggers for updated_at timestamps
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
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_subnames_user_id ON public.subnames(user_id);
CREATE INDEX idx_subnames_subname ON public.subnames(subname);