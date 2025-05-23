
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables')
      throw new Error('Server configuration error')
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    let userData
    try {
      const body = await req.json()
      userData = body.userData
      
      if (!userData?.email) {
        console.error('Missing required email in request body')
        throw new Error('Missing required email')
      }
      
      console.log('Creating auth user with email:', userData.email)
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      throw new Error('Invalid request format')
    }

    // Extract email verification preference from the request
    const requireEmailConfirm = userData.requireEmailConfirm ?? false;

    // Generate a random password and create user
    const password = Math.random().toString(36).slice(-8)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true, // Changed to true - Make email verification optional
      user_metadata: userData.metadata || {}
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      // Check for specific error cases
      if (authError.message.includes('already been registered')) {
        throw new Error('Email đã được đăng ký')
      }
      throw authError
    }

    if (!authData.user) {
      console.error('No user was created in auth')
      throw new Error('Failed to create user')
    }

    console.log('Auth user created successfully with ID:', authData.user.id)

    return new Response(
      JSON.stringify({ 
        user: authData.user, 
        passwordGenerated: true,
        password: password // Only included for temporary password flows
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-auth-user function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message?.includes('đăng ký') ? 409 : 400 
      }
    )
  }
})
