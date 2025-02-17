
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Client with Service Role Key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { email, password, role, firstName, lastName, action = 'create' } = await req.json()

    console.log(`Processing ${action} request for user:`, email)

    if (action === 'reset_password') {
      if (!email || !password) {
        throw new Error('Missing required fields: email or password')
      }

      // Update user password using admin API
      const { data: { user }, error: updateError } = await supabaseClient.auth.admin.updateUserById(
        (await supabaseClient.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || '',
        { password }
      )

      if (updateError) throw updateError
      if (!user) throw new Error('User not found')

      console.log('Password updated successfully for user:', email)

      return new Response(
        JSON.stringify({ user }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Handle user creation (existing code)
    if (!email || !password || !role) {
      throw new Error('Missing required fields: email, password, or role')
    }

    console.log('Creating user:', { email, role })

    // Create the user using Supabase Admin API (does not affect current session)
    const { data: { user }, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (createUserError) throw createUserError
    if (!user) throw new Error('User creation failed')

    // Insert user details into profiles table
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
      })

    if (profileError) throw profileError

    // Assign the correct role using a Postgres function
    const { error: roleError } = await supabaseClient.rpc('create_user_role', {
      user_id: user.id,
      role_name: role
    })

    if (roleError) throw roleError

    console.log('User created successfully:', user.id)

    return new Response(
      JSON.stringify({ user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing user request:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
