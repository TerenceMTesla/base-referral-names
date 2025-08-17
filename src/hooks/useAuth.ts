import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useReferralTracking } from '@/hooks/useReferralTracking';
import type { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  wallet_address: string | null;
  dynamic_user_id: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const { user } = useDynamicContext();
  const { processReferralSignup } = useReferralTracking();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const authenticateWithDynamic = async (dynamicUser: any, isRetry = false) => {
    try {
      setAuthError(null);
      console.log('=== Starting Dynamic Authentication ===', { isRetry, retryCount });
      console.log('Dynamic user data:', {
        userId: dynamicUser.userId,
        email: dynamicUser.email,
        verifiedCredentials: dynamicUser.verifiedCredentials,
        walletPublicKey: dynamicUser.walletPublicKey
      });
      
      // Call our edge function to handle Dynamic authentication
      console.log('Calling dynamic-auth edge function...');
      const { data, error } = await supabase.functions.invoke('dynamic-auth', {
        body: { dynamicUser }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.success && data?.session_url) {
        console.log('Authentication successful, redirecting to session URL...');
        console.log('Session URL:', data.session_url);
        
        // Clear any previous error state
        setAuthError(null);
        setRetryCount(0);
        
        // Navigate to the session URL to establish authentication
        window.location.href = data.session_url;
        return; // Exit here as the page will redirect
      } else {
        console.error('Invalid response from dynamic-auth function:', data);
        throw new Error(data?.error || 'Invalid authentication response');
      }
    } catch (error: any) {
      console.error('=== Authentication Error ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        isRetry,
        retryCount
      });
      
      const errorMessage = error.message || "Failed to authenticate. Please try again.";
      setAuthError(errorMessage);
      
      // Auto-retry logic for transient errors
      if (!isRetry && retryCount < 2 && 
          (error.message?.includes('Service Unavailable') || 
           error.message?.includes('network') ||
           error.message?.includes('timeout'))) {
        console.log(`Auto-retrying authentication (attempt ${retryCount + 1}/2)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          authenticateWithDynamic(dynamicUser, true);
        }, 2000);
        return;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setLoading(false);
      throw error;
    }
  };

  const retryAuthentication = () => {
    if (user) {
      setRetryCount(0);
      setAuthError(null);
      setLoading(true);
      authenticateWithDynamic(user);
    }
  };

  const fetchProfile = async (dynamicUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('dynamic_user_id', dynamicUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user && !profile) {
          // Fetch profile when session is established
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
              if (profileData) {
                setProfile(profileData);
                // Process any stored referral when profile is loaded
                await processReferralSignup(profileData);
              }
            } catch (error) {
              console.error('Error fetching profile in auth state change:', error);
            }
          }, 100);
        } else if (!session) {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Handle Dynamic user authentication separately
    const handleAuthState = async () => {
      console.log('Auth state check:', { 
        hasUser: !!user, 
        hasSession: !!session, 
        userId: user?.userId,
        email: user?.email,
        walletAddress: user?.verifiedCredentials?.[0]?.address,
        loading 
      });
      
      if (user && !session) {
        console.log('Dynamic user authenticated, creating Supabase session...', {
          userId: user.userId,
          email: user.email,
          walletAddress: user.verifiedCredentials?.[0]?.address
        });
        setLoading(true);
        try {
          await authenticateWithDynamic(user);
        } catch (error) {
          console.error('Authentication failed:', error);
          setLoading(false);
        }
      } else if (!user && session) {
        // User logged out from Dynamic but still has Supabase session
        console.log('User logged out, clearing session...');
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
        setLoading(false);
      } else if (!user && !session) {
        console.log('No user and no session, authentication clear');
        setLoading(false);
      } else if (session && !profile) {
        console.log('Session exists but no profile, trying to fetch profile');
        setLoading(false);
      }
    };

    handleAuthState();
  }, [user, session]);

  return {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!profile && !!session,
    loading,
    authError,
    retryAuthentication,
    retryCount
  };
};