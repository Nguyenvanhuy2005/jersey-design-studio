
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

    // Create the customer profile first
    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
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

    // If password is provided, create an auth user and link it
    if (profileData.password) {
      try {
        // Create auth user with phone or email
        const signUpData = profileData.email 
          ? { email: profileData.email, password: profileData.password }
          : { phone: profileData.phone, password: profileData.password }

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          ...signUpData,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            name: profileData.name,
            address: profileData.address
          }
        })

        if (authError) {
          // If auth user creation fails, we should handle it gracefully
          console.error('Error creating auth user:', authError)
          // We'll still return the customer record, just without auth
          return new Response(
            JSON.stringify({ 
              customer: customerRecord,
              authEnabled: false,
              warning: 'Không thể tạo tài khoản đăng nhập, nhưng đã lưu thông tin khách hàng'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        // Link the auth user to the customer profile
        const { error: updateError } = await supabaseAdmin
          .from('customers')
          .update({ auth_user_id: authUser.user.id })
          .eq('id', customerRecord.id)

        if (updateError) {
          console.error('Error linking auth user to customer:', updateError)
          // We'll still return success since both records exist
          return new Response(
            JSON.stringify({ 
              customer: customerRecord,
              authEnabled: true,
              warning: 'Tài khoản đã được tạo nhưng có lỗi khi liên kết với hồ sơ khách hàng'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        // Return success with both customer and auth status
        return new Response(
          JSON.stringify({ 
            customer: { ...customerRecord, auth_user_id: authUser.user.id },
            authEnabled: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        console.error('Error in auth user creation process:', error)
        // Return customer data even if auth creation fails
        return new Response(
          JSON.stringify({ 
            customer: customerRecord,
            authEnabled: false,
            warning: 'Đã lưu thông tin khách hàng nhưng không thể tạo tài khoản đăng nhập'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // If no password was provided, just return the customer record
    return new Response(
      JSON.stringify({ 
        customer: customerRecord,
        authEnabled: false
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
