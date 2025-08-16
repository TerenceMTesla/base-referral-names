import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createOrUpdateProfile = async (dynamicUser: any) => {
    try {
      const authUser = await supabase.auth.getUser();
      if (!authUser.data.user) {
        // Create anonymous session for Dynamic users
        const { data: sessionData, error: sessionError } = await supabase.auth.signInAnonymously();
        if (sessionError) throw sessionError;
      }

      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) return;

      const walletAddress = dynamicUser.verifiedCredentials?.[0]?.address || 
                           dynamicUser.walletPublicKey ||
                           null;

      const profileData = {
        user_id: currentUser.data.user.id,
        email: dynamicUser.email || null,
        wallet_address: walletAddress,
        dynamic_user_id: dynamicUser.userId,
        display_name: dynamicUser.email?.split('@')[0] || `User${Date.now()}`,
      };

      // Try to get existing profile first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('dynamic_user_id', dynamicUser.userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({
            email: profileData.email,
            wallet_address: profileData.wallet_address,
            display_name: profileData.display_name,
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error creating/updating profile:', error);
      toast({
        title: "Profile Error",
        description: "Failed to create or update profile. Please try again.",
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
    const handleAuthState = async () => {
      setLoading(true);
      
      if (user) {
        try {
          // Check if profile exists
          const existingProfile = await fetchProfile(user.userId);
          
          if (existingProfile) {
            setProfile(existingProfile);
          } else {
            // Create new profile
            await createOrUpdateProfile(user);
          }
        } catch (error) {
          console.error('Auth state error:', error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    handleAuthState();
  }, [user]);

  return {
    user,
    profile,
    isAuthenticated: !!user && !!profile,
    loading,
    createOrUpdateProfile,
  };
};