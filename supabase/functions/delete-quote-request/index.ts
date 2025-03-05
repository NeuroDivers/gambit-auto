
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
    console.log('Attempting to delete estimate request:', id)

    if (!id) {
      console.error('No estimate request ID provided')
      throw new Error('Estimate request ID is required')
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

    // First, get the estimate request to check if it exists and get media URLs
    const { data: estimateRequest, error: fetchError } = await supabaseAdmin
      .from('estimate_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching estimate request:', fetchError)
      throw new Error('Failed to fetch estimate request')
    }

    if (!estimateRequest) {
      console.error('Estimate request not found:', id)
      throw new Error('Estimate request not found')
    }

    // Delete media files if they exist
    if (estimateRequest.media_urls && estimateRequest.media_urls.length > 0) {
      console.log('Deleting media files:', estimateRequest.media_urls)
      const { error: deleteStorageError } = await supabaseAdmin
        .storage
        .from('quote-request-media')
        .remove(estimateRequest.media_urls)

      if (deleteStorageError) {
        console.error('Error deleting media files:', deleteStorageError)
        // Continue with estimate deletion even if media deletion fails
      }
    }

    // Delete the estimate request
    const { error: deleteError } = await supabaseAdmin
      .from('estimate_requests')
      .delete()
      .match({ id })

    if (deleteError) {
      console.error('Error deleting estimate request:', deleteError)
      throw new Error('Failed to delete estimate request')
    }

    console.log('Successfully deleted estimate request:', id)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Estimate request deleted successfully' 
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
        error: error.message || 'An error occurred while deleting the estimate request' 
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
