
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] ?? ''
    )
    if (authError) throw authError

    // Check if user is admin using profiles table
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select(`
        role:role_id (
          name
        )
      `)
      .eq('id', user?.id)
      .single()

    // Check if role name contains "admin" (case insensitive)
    if (!profile?.role?.name || !profile.role.name.toLowerCase().includes('admin')) {
      throw new Error('Unauthorized')
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = await req.json()

    // Here you would typically update these values in your Supabase project settings
    // For now, we'll just return success
    console.log('SMTP settings update requested:', { SMTP_HOST, SMTP_PORT, SMTP_USER })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
