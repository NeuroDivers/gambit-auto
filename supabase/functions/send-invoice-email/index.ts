import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

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
    const { invoiceId } = await req.json()
    
    if (!invoiceId) {
      throw new Error('Invoice ID is required')
    }

    console.log('Sending invoice email for invoice:', invoiceId)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError)
      throw invoiceError
    }

    if (!invoice.customer_email) {
      throw new Error('Customer email is required')
    }

    // Fetch business profile
    const { data: businessProfile, error: businessError } = await supabaseClient
      .from('business_profile')
      .select('*')
      .single()

    if (businessError) {
      console.error('Error fetching business profile:', businessError)
      throw businessError
    }

    const appUrl = Deno.env.get('PUBLIC_APP_URL')
    if (!appUrl) {
      throw new Error('PUBLIC_APP_URL environment variable is not set')
    }

    const invoiceUrl = `${appUrl}/invoices/${invoiceId}`
    
    // Send email using SMTP
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') || '',
        port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') || '',
          password: Deno.env.get('SMTP_PASSWORD') || '',
        },
      },
    })

    await client.send({
      from: Deno.env.get('SMTP_USER') || '',
      to: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice from ${businessProfile.company_name}</h2>
          <p>Dear ${invoice.customer_first_name},</p>
          <p>Please find your invoice details below:</p>
          <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
          <p><strong>Total Amount:</strong> $${invoice.total}</p>
          <div style="margin: 30px 0;">
            <a href="${invoiceUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              View Invoice
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 40px;">
            ${businessProfile.company_name}<br>
            ${businessProfile.address || ''}<br>
            ${businessProfile.phone_number || ''}<br>
            ${businessProfile.email || ''}
          </p>
        </div>
      `,
    })

    await client.close()

    console.log('Email sent successfully for invoice:', invoiceId)

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )

  } catch (error) {
    console.error('Error sending invoice email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    )
  }
})