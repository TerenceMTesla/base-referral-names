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

      if (error) throw error;
      
      if (data.success && data.session_url) {
        // Use the session URL to establish Supabase session
        const url = new URL(data.session_url);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) throw sessionError;
          
          setSession(sessionData.session);
          
          // Fetch the profile
          if (sessionData.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('dynamic_user_id', dynamicUser.userId)
              .single();
              
            if (profileData) {
              setProfile(profileData);
              await processReferralSignup(profileData);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error authenticating with Dynamic:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate. Please try again.",
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
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (profileData) {
              setProfile(profileData);
            }
          }, 0);
        } else if (!session) {
          setProfile(null);
        }
      }
    );

    // Handle Dynamic user authentication
    const handleAuthState = async () => {
      setLoading(true);
      
      if (user && !session) {
        await authenticateWithDynamic(user);
      } else if (!user) {
        setProfile(null);
        setSession(null);
      }
      
      setLoading(false);
    };

    handleAuthState();

    return () => subscription.unsubscribe();
  }, [user, session]);

  return {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!profile && !!session,
    loading,
  };
};