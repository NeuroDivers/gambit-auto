
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    // Initialize Supabase Client with Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { email, password, role, firstName, lastName } = await req.json()

    // Validate required fields
    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, or role' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Starting user creation process for:', email)

    // Create the user using Supabase Admin API
    const { data: { user }, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (createUserError) {
      console.error('Error creating auth user:', createUserError)
      throw createUserError
    }

    if (!user) {
      throw new Error('User creation failed - no user ID returned')
    }

    console.log('Auth user created successfully:', user.id)

    try {
      // Insert user details into profiles table
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role_id: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Clean up the auth user if profile creation fails
        await supabaseClient.auth.admin.deleteUser(user.id)
        throw profileError
      }

      console.log('Profile created successfully for user:', user.id)
    } catch (profileError) {
      console.error('Failed to create profile:', profileError)
      // Clean up the auth user
      await supabaseClient.auth.admin.deleteUser(user.id)
      throw new Error('Failed to create user profile')
    }

    return new Response(
      JSON.stringify({ 
        user,
        message: 'User and profile created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while creating the user' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
