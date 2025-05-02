
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
        throw new Error('Vui lòng điền đầy đủ thông tin họ tên, số điện thoại và địa chỉ')
      }
      
      console.log('Creating customer profile:', profileData)
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      throw new Error('Invalid request format')
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

    // Create auth user first if password is provided
    let authUserId = null
    if (profileData.password) {
      try {
        if (!profileData.email) {
          throw new Error('Email là bắt buộc khi tạo tài khoản đăng nhập')
        }

        // Create auth user with email only
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: profileData.email,
          password: profileData.password,
          email_confirm: true, // Changed to true - Make email verification optional
          user_metadata: {
            name: profileData.name,
            address: profileData.address,
            phone: profileData.phone
          }
        })

        if (authError) {
          console.error('Error creating auth user:', authError)
          throw authError
        }

        authUserId = authUser.user.id
        
        // Check if a customer record was already created by the trigger
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('id', authUserId)
          .single()
          
        if (existingCustomer) {
          console.log('Customer already exists for auth user, updating instead of creating')
          
          // Update the existing customer with the provided data
          const { data: updatedCustomer, error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
              name: profileData.name,
              phone: profileData.phone,
              address: profileData.address,
              delivery_note: profileData.delivery_note,
              email: profileData.email
            })
            .eq('id', authUserId)
            .select()
            .single()
            
          if (updateError) {
            console.error('Error updating existing customer:', updateError)
            throw updateError
          }
          
          return new Response(
            JSON.stringify({ 
              customer: updatedCustomer,
              authEnabled: true
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      } catch (error) {
        console.error('Error in auth user creation process:', error)
        // Don't return here, continue to create a customer without auth if auth fails
      }
    }

    // Generate a UUID for the customer if no auth user was created
    // Using crypto.randomUUID() which is available in modern browsers and Deno
    const customerId = authUserId || crypto.randomUUID();
    console.log('Using customer ID:', customerId, 'Auth user ID:', authUserId);

    // Create the customer profile
    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        id: customerId, // Use the generated UUID if no auth user was created
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        delivery_note: profileData.delivery_note,
        email: profileData.email
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer profile:', customerError)
      throw customerError
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        customer: customerRecord,
        authEnabled: authUserId !== null
      }),
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
