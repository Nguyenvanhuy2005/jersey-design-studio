
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { customerData } = await req.json()

    // Create auth user with random password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: customerData.email,
      password: Math.random().toString(36).slice(-8),
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('No user was created')
    }

    // Insert customer profile
    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        id: authData.user.id,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        delivery_note: customerData.delivery_note,
        email: customerData.email // Add email field
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer profile:', customerError)
      throw customerError
    }

    return new Response(
      JSON.stringify({ customer: customerRecord }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-customer function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
