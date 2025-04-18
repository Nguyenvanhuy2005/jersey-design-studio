
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
    // Check for required environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables:', {
        hasUrl: !!SUPABASE_URL,
        hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY
      })
      throw new Error('Server configuration error: Missing required environment variables')
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

    // Parse request body, with error handling for malformed JSON
    let customerData
    try {
      const body = await req.json()
      customerData = body.customerData
      
      if (!customerData) {
        throw new Error('Invalid request: Missing customerData')
      }
      
      // Validate required fields
      if (!customerData.email || !customerData.name || !customerData.phone || !customerData.address) {
        throw new Error('Missing required customer information (email, name, phone, or address)')
      }
      
      console.log('Received customer data:', JSON.stringify(customerData, null, 2))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      throw new Error('Invalid request format')
    }

    // Create auth user with random password
    console.log('Creating auth user with email:', customerData.email)
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
      console.error('No user was created in auth')
      throw new Error('No user was created')
    }

    console.log('Auth user created successfully with ID:', authData.user.id)

    // Insert customer profile
    console.log('Creating customer profile for user:', authData.user.id)
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

    console.log('Customer profile created successfully')

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
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
