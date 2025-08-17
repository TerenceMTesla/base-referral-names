import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ENSDomain {
  name: string;
  resolvedAddress: string;
  isValid: boolean;
}

export const useENSDetection = () => {
  const { user, profile } = useAuth();
  const [ensDomain, setEnsDomain] = useState<ENSDomain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.verifiedCredentials && profile) {
      checkENSDomain();
    }
  }, [user?.verifiedCredentials, profile]);

  const checkENSDomain = async () => {
    if (!user?.verifiedCredentials || !profile?.wallet_address) return;

    setLoading(true);
    setError(null);

    try {
      // Call edge function to check ENS domain
      const { data, error } = await supabase.functions.invoke('check-ens-domain', {
        body: { 
          walletAddress: profile.wallet_address,
          userId: profile.id 
        }
      });

      if (error) throw error;

      if (data?.ensDomain) {
        setEnsDomain(data.ensDomain);
      } else {
        setEnsDomain(null);
      }
    } catch (error: any) {
      console.error('Error checking ENS domain:', error);
      setError(error.message || 'Failed to check ENS domain');
    } finally {
      setLoading(false);
    }
  };

  return {
    ensDomain,
    loading,
    error,
    checkENSDomain,
    hasENSDomain: !!ensDomain?.isValid
  };
};