import { createClient } from '@supabase/supabase-js'
import { serve } from 'https://deno.fresh.dev/std@v9.6.1/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, role } = await req.json()

    // Create user with admin API
    const { data: { user }, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (createUserError) throw createUserError

    if (!user) throw new Error('User creation failed')

    // Create user role
    const { error: roleError } = await supabaseClient.rpc('create_user_role', {
      user_id: user.id,
      role_name: role
    })

    if (roleError) throw roleError

    return new Response(
      JSON.stringify({ user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})