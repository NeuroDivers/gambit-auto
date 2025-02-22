
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
    console.log("Starting user creation process. Data:", { email, role, firstName, lastName })

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

    // Check if user already exists in auth
    const { data: existingUser } = await supabaseClient.auth.admin.listUsers()
    const userExists = existingUser.users.some(u => u.email === email)
    if (userExists) {
      throw new Error('User with this email already exists')
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)
      throw new Error(authError?.message || 'Failed to create auth user')
    }

    const user = authData.user
    console.log('Auth user created successfully:', user.id)

    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('Profile already exists, updating it')
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role_id: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        await supabaseClient.auth.admin.deleteUser(user.id)
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }
    } else {
      console.log('Creating new profile')
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
        await supabaseClient.auth.admin.deleteUser(user.id)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }
    }

    console.log('Profile created/updated successfully for user:', user.id)

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
