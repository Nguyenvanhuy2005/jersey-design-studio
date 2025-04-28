
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

    let profileData
    try {
      const body = await req.json()
      profileData = body.profileData
      
      if (!profileData?.name || !profileData?.phone || !profileData?.address) {
        console.error('Missing required profile data:', profileData)
        throw new Error('Missing required profile information')
      }
      
      console.log('Creating customer profile:', profileData)
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      throw new Error('Invalid request format')
    }

    // Generate a UUID for the customer if not provided
    if (!profileData.id) {
      profileData.id = crypto.randomUUID();
    }

    // First check if customer with same phone already exists
    const { data: existingCustomerByPhone, error: checkPhoneError } = await supabaseAdmin
      .from('customers')
      .select('id, phone')
      .eq('phone', profileData.phone)
      .single()

    if (existingCustomerByPhone) {
      console.error('Customer already exists with phone:', profileData.phone)
      throw new Error('Khách hàng với số điện thoại này đã tồn tại')
    }

    // Insert the new customer
    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        id: profileData.id,
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        delivery_note: profileData.delivery_note,
        email: profileData.email || null
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer profile:', customerError)
      throw customerError
    }

    console.log('Customer profile created successfully:', customerRecord)

    return new Response(
      JSON.stringify({ customer: customerRecord }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-customer-profile function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message?.includes('tồn tại') ? 409 : 400 
      }
    )
  }
})
