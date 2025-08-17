import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Enhanced logging utility
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data ? JSON.stringify(data, null, 2) : undefined
  };
  console.log(`[${timestamp}] [${level}] ${message}`, data || '');
};

// Input validation utility
const validateDynamicUser = (dynamicUser: any) => {
  if (!dynamicUser) {
    throw new Error('Dynamic user data is required');
  }
  
  if (!dynamicUser.userId) {
    throw new Error('Dynamic user ID is required');
  }
  
  // Log the received user data for debugging
  log('INFO', 'Received Dynamic user data', {
    userId: dynamicUser.userId,
    email: dynamicUser.email,
    hasVerifiedCredentials: !!dynamicUser.verifiedCredentials,
    credentialsCount: dynamicUser.verifiedCredentials?.length || 0,
    walletPublicKey: dynamicUser.walletPublicKey ? 'present' : 'missing'
  });
  
  return true;
};

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  log('INFO', `[${requestId}] Processing authentication request`, {
    method: req.method,
    url: req.url,
    origin: req.headers.get('origin'),
    userAgent: req.headers.get('user-agent')
  });

  if (req.method === 'OPTIONS') {
    log('INFO', `[${requestId}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      log('INFO', `[${requestId}] Request body parsed successfully`);
    } catch (parseError) {
      log('ERROR', `[${requestId}] Failed to parse request body`, parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { dynamicUser } = requestBody;
    
    // Validate Dynamic user data
    validateDynamicUser(dynamicUser);
    
    log('INFO', `[${requestId}] Processing Dynamic user: ${dynamicUser.userId}`);

    // Extract user data from Dynamic with enhanced validation
    const email = dynamicUser.email || null;
    const walletAddress = dynamicUser.verifiedCredentials?.[0]?.address || 
                         dynamicUser.walletPublicKey || null;
    
    log('INFO', `[${requestId}] Extracted user data`, {
      email: email ? 'present' : 'missing',
      walletAddress: walletAddress ? 'present' : 'missing',
      dynamicUserId: dynamicUser.userId
    });
    
    if (!email && !walletAddress) {
      log('WARN', `[${requestId}] No email or wallet address provided`);
      throw new Error('Either email or wallet address is required');
    }
    
    // Create or get existing Supabase user
    let authUser;
    
    if (email) {
      log('INFO', `[${requestId}] Attempting to find existing user by email`);
      
      try {
        const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        
        if (getUserError) {
          log('WARN', `[${requestId}] Error fetching user by email`, getUserError);
        }
        
        if (existingUser.user) {
          log('INFO', `[${requestId}] Found existing user by email: ${existingUser.user.id}`);
          authUser = existingUser.user;
          
          // Update user metadata if needed
          if (walletAddress && existingUser.user.user_metadata?.wallet_address !== walletAddress) {
            log('INFO', `[${requestId}] Updating user metadata with new wallet address`);
            await supabaseAdmin.auth.admin.updateUserById(existingUser.user.id, {
              user_metadata: {
                ...existingUser.user.user_metadata,
                wallet_address: walletAddress,
                dynamic_user_id: dynamicUser.userId
              }
            });
          }
        } else {
          log('INFO', `[${requestId}] Creating new user with email`);
          
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              dynamic_user_id: dynamicUser.userId,
              wallet_address: walletAddress,
              display_name: email.split('@')[0],
              created_via: 'dynamic_labs',
              created_at: new Date().toISOString()
            }
          });
          
          if (createError) {
            log('ERROR', `[${requestId}] Failed to create user with email`, createError);
            throw createError;
          }
          
          log('INFO', `[${requestId}] Successfully created new user: ${newUser.user?.id}`);
          authUser = newUser.user;
        }
      } catch (emailAuthError) {
        log('ERROR', `[${requestId}] Email authentication process failed`, emailAuthError);
        throw emailAuthError;
      }
    } else {
      log('INFO', `[${requestId}] Creating wallet-only user`);
      
      try {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email_confirm: true,
          user_metadata: {
            dynamic_user_id: dynamicUser.userId,
            wallet_address: walletAddress,
            display_name: `User${Date.now()}`,
            created_via: 'dynamic_labs_wallet',
            created_at: new Date().toISOString()
          }
        });
        
        if (createError) {
          log('ERROR', `[${requestId}] Failed to create wallet-only user`, createError);
          throw createError;
        }
        
        log('INFO', `[${requestId}] Successfully created wallet-only user: ${newUser.user?.id}`);
        authUser = newUser.user;
      } catch (walletAuthError) {
        log('ERROR', `[${requestId}] Wallet authentication process failed`, walletAuthError);
        throw walletAuthError;
      }
    }

    // Create or update profile with enhanced error handling
    log('INFO', `[${requestId}] Managing user profile for user: ${authUser.id}`);
    
    const profileData = {
      user_id: authUser.id,
      email: email,
      wallet_address: walletAddress,
      dynamic_user_id: dynamicUser.userId,
      display_name: email?.split('@')[0] || `User${Date.now()}`,
    };

    try {
      // Check if profile exists
      log('INFO', `[${requestId}] Checking for existing profile`);
      const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('dynamic_user_id', dynamicUser.userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        log('WARN', `[${requestId}] Error fetching profile`, fetchError);
      }

      if (existingProfile) {
        log('INFO', `[${requestId}] Updating existing profile: ${existingProfile.id}`);
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            email: profileData.email,
            wallet_address: profileData.wallet_address,
            display_name: profileData.display_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id);
          
        if (updateError) {
          log('ERROR', `[${requestId}] Failed to update profile`, updateError);
          throw updateError;
        }
        
        log('INFO', `[${requestId}] Profile updated successfully`);
      } else {
        log('INFO', `[${requestId}] Creating new profile`);
        
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          log('ERROR', `[${requestId}] Failed to create profile`, insertError);
          throw insertError;
        }
        
        log('INFO', `[${requestId}] Profile created successfully`);
      }
    } catch (profileError) {
      log('ERROR', `[${requestId}] Profile management failed`, profileError);
      // Don't throw here - profile creation/update shouldn't block authentication
      // But log it for debugging
    }

    // Generate session token for the user with enhanced error handling
    log('INFO', `[${requestId}] Generating session for user: ${authUser.id}`);
    
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const redirectUrl = `${origin}/`;
    
    log('INFO', `[${requestId}] Session redirect URL: ${redirectUrl}`);
    
    try {
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: authUser.email || `${authUser.id}@placeholder.com`,
        options: {
          redirectTo: redirectUrl
        }
      });

      if (sessionError) {
        log('ERROR', `[${requestId}] Failed to generate session`, sessionError);
        throw sessionError;
      }
      
      if (!sessionData.properties?.action_link) {
        log('ERROR', `[${requestId}] Session generated but no action link present`, sessionData);
        throw new Error('Failed to generate valid session URL');
      }
      
      log('INFO', `[${requestId}] Session generated successfully`);
      
      const response = {
        success: true,
        user: {
          id: authUser.id,
          email: authUser.email,
          user_metadata: authUser.user_metadata
        },
        session_url: sessionData.properties.action_link,
        debug: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          dynamic_user_id: dynamicUser.userId
        }
      };

      log('INFO', `[${requestId}] Authentication completed successfully`);

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (sessionGenerationError) {
      log('ERROR', `[${requestId}] Session generation failed`, sessionGenerationError);
      throw sessionGenerationError;
    }

  } catch (error) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    log('ERROR', `[${requestId}] Authentication failed with error ID: ${errorId}`, {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Categorize errors for better debugging
    let errorCategory = 'UNKNOWN';
    let statusCode = 500;
    
    if (error.message.includes('email') || error.message.includes('Email')) {
      errorCategory = 'EMAIL_ERROR';
      statusCode = 400;
    } else if (error.message.includes('user') || error.message.includes('User')) {
      errorCategory = 'USER_ERROR';
      statusCode = 400;
    } else if (error.message.includes('profile') || error.message.includes('Profile')) {
      errorCategory = 'PROFILE_ERROR';
      statusCode = 422;
    } else if (error.message.includes('session') || error.message.includes('Session')) {
      errorCategory = 'SESSION_ERROR';
      statusCode = 500;
    } else if (error.message.includes('Dynamic') || error.message.includes('required')) {
      errorCategory = 'VALIDATION_ERROR';
      statusCode = 400;
    }
    
    const errorResponse = {
      error: error.message,
      success: false,
      debug: {
        error_id: errorId,
        request_id: requestId,
        category: errorCategory,
        timestamp: new Date().toISOString(),
        user_agent: req.headers.get('user-agent'),
        origin: req.headers.get('origin')
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});