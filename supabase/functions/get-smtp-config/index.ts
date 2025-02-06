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

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .single()

    if (roleData?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Get SMTP settings
    const settings = {
      SMTP_HOST: Deno.env.get('SMTP_HOST'),
      SMTP_PORT: Deno.env.get('SMTP_PORT'),
      SMTP_USER: Deno.env.get('SMTP_USER'),
      // Don't send the actual password, just a placeholder if it exists
      SMTP_PASSWORD: Deno.env.get('SMTP_PASSWORD') ? '********' : '',
    }

    return new Response(
      JSON.stringify({ settings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})