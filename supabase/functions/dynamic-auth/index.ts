import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dynamicUser } = await req.json();
    
    if (!dynamicUser || !dynamicUser.userId) {
      throw new Error('Dynamic user data is required');
    }

    console.log('Processing Dynamic user:', dynamicUser.userId);

    // Extract user data from Dynamic
    const email = dynamicUser.email || null;
    const walletAddress = dynamicUser.verifiedCredentials?.[0]?.address || 
                         dynamicUser.walletPublicKey || null;
    
    // Create or get existing Supabase user
    let authUser;
    
    if (email) {
      // Try to find existing user by email
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      
      if (existingUser.user) {
        authUser = existingUser.user;
      } else {
        // Create new user with email
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            dynamic_user_id: dynamicUser.userId,
            wallet_address: walletAddress,
            display_name: email.split('@')[0]
          }
        });
        
        if (createError) throw createError;
        authUser = newUser.user;
      }
    } else {
      // For wallet-only users, try to find by wallet address or create anonymous
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email_confirm: true,
        user_metadata: {
          dynamic_user_id: dynamicUser.userId,
          wallet_address: walletAddress,
          display_name: `User${Date.now()}`
        }
      });
      
      if (createError) throw createError;
      authUser = newUser.user;
    }

    // Create or update profile
    const profileData = {
      user_id: authUser.id,
      email: email,
      wallet_address: walletAddress,
      dynamic_user_id: dynamicUser.userId,
      display_name: email?.split('@')[0] || `User${Date.now()}`,
    };

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('dynamic_user_id', dynamicUser.userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      await supabaseAdmin
        .from('profiles')
        .update({
          email: profileData.email,
          wallet_address: profileData.wallet_address,
          display_name: profileData.display_name,
        })
        .eq('id', existingProfile.id);
    } else {
      // Create new profile
      await supabaseAdmin
        .from('profiles')
        .insert(profileData);
    }

    // Generate session token for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.email || `${authUser.id}@placeholder.com`,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:5173'}/`
      }
    });

    if (sessionError) throw sessionError;

    return new Response(JSON.stringify({
      success: true,
      user: authUser,
      session_url: sessionData.properties?.action_link
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dynamic-auth function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});