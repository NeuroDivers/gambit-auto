
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
    console.log('Attempting to delete quote request:', id)

    if (!id) {
      console.error('No quote request ID provided')
      throw new Error('Quote request ID is required')
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // First, get the quote request to check if it exists and get media URLs
    const { data: quoteRequest, error: fetchError } = await supabaseAdmin
      .from('quote_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching quote request:', fetchError)
      throw new Error('Failed to fetch quote request')
    }

    if (!quoteRequest) {
      console.error('Quote request not found:', id)
      throw new Error('Quote request not found')
    }

    // Delete media files if they exist
    if (quoteRequest.media_urls && quoteRequest.media_urls.length > 0) {
      console.log('Deleting media files:', quoteRequest.media_urls)
      const { error: deleteStorageError } = await supabaseAdmin
        .storage
        .from('quote-request-media')
        .remove(quoteRequest.media_urls)

      if (deleteStorageError) {
        console.error('Error deleting media files:', deleteStorageError)
        // Continue with quote deletion even if media deletion fails
      }
    }

    // Delete the quote request
    const { error: deleteError } = await supabaseAdmin
      .from('quote_requests')
      .delete()
      .match({ id })

    if (deleteError) {
      console.error('Error deleting quote request:', deleteError)
      throw new Error('Failed to delete quote request')
    }

    console.log('Successfully deleted quote request:', id)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Quote request deleted successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in delete-quote-request function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred while deleting the quote request' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    )
  }
})
