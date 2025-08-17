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

  console.log('useAuth state:', { user: !!user, profile: !!profile, session: !!session, loading });

  const authenticateWithDynamic = async (dynamicUser: any) => {
    try {
      console.log('Authenticating with Dynamic user:', dynamicUser.userId);
      console.log('Dynamic user data:', dynamicUser);
      
      // Call our edge function to handle Dynamic authentication
      const { data, error } = await supabase.functions.invoke('dynamic-auth', {
        body: { dynamicUser }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.success && data?.session_url) {
        // Use the session URL to establish Supabase session
        const url = new URL(data.session_url);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }
          
          setSession(sessionData.session);
          
          // Fetch the profile
          if (sessionData.user) {
            setTimeout(async () => {
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('dynamic_user_id', dynamicUser.userId)
                  .single();
                  
                if (profileData) {
                  setProfile(profileData);
                  await processReferralSignup(profileData);
                }
              } catch (profileError) {
                console.error('Error fetching profile:', profileError);
              }
            }, 100);
          }
        }
      } else {
        console.error('Invalid response from dynamic-auth function:', data);
        throw new Error('Invalid authentication response');
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

  // Check for fallback authentication
  const fallbackAuth = localStorage.getItem('fallback_auth') === 'true';
  
  return {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!profile && !!session || fallbackAuth,
    loading: loading && !fallbackAuth,
  };
};