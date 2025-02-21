
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()

    if (!id) {
      throw new Error('Quote request ID is required')
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get quote request details
    const { data: quoteRequest, error: fetchError } = await supabase
      .from('quote_requests')
      .select('media_urls')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete media files if they exist
    if (quoteRequest?.media_urls && quoteRequest.media_urls.length > 0) {
      const { error: deleteStorageError } = await supabase
        .storage
        .from('quote-request-media')
        .remove(quoteRequest.media_urls)

      if (deleteStorageError) {
        console.error('Error deleting media files:', deleteStorageError)
      }
    }

    // Delete the quote request
    const { error: deleteError } = await supabase
      .from('quote_requests')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return new Response(
      JSON.stringify({ message: 'Quote request deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
