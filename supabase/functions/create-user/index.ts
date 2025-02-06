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
    const { email, password, role, firstName, lastName } = await req.json()
    if (!email || !password || !role) {
      throw new Error('Missing required fields: email, password, or role')
    }

    console.log('Creating user:', { email, role })

    // Create the user using Supabase Admin API (does not affect current session)
    const { data: { user }, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Ensure email is confirmed upon creation
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
    console.error('Error creating user:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})