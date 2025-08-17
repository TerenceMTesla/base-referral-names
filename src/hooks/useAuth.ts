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
  const { toast } = useToast();

  const authenticateWithDynamic = async (dynamicUser: any) => {
    try {
      console.log('Authenticating with Dynamic user:', dynamicUser.userId);
      
      // Call our edge function to handle Dynamic authentication
      const { data, error } = await supabase.functions.invoke('dynamic-auth', {
        body: { dynamicUser }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.success && data?.session_url) {
        console.log('Authentication successful, setting up session...');
        
        // Navigate to the session URL to establish authentication
        window.location.href = data.session_url;
        return; // Exit here as the page will redirect
      } else {
        console.error('Invalid response from dynamic-auth function:', data);
        throw new Error(data?.error || 'Invalid authentication response');
      }
    } catch (error: any) {
      console.error('Error authenticating with Dynamic:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
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
      if (user && !session && !loading) {
        setLoading(true);
        try {
          await authenticateWithDynamic(user);
        } catch (error) {
          console.error('Authentication failed:', error);
        } finally {
          setLoading(false);
        }
      } else if (!user && session) {
        // User logged out from Dynamic but still has Supabase session
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
        setLoading(false);
      } else if (!user && !session) {
        setLoading(false);
      }
    };

    handleAuthState();
  }, [user]);

  return {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!profile && !!session,
    loading,
  };
};