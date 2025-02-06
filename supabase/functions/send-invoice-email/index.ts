import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    const { invoiceId, invoiceImage } = await req.json()
    if (!invoiceId) {
      throw new Error('Invoice ID is required')
    }

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        customer_email,
        customer_first_name
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    const { data: businessProfile, error: businessError } = await supabaseClient
      .from('business_profile')
      .select('company_name, email')
      .single()

    if (businessError || !businessProfile) {
      throw new Error('Business profile not found')
    }

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

    // Convert base64 image to Uint8Array for attachment
    const binaryStr = atob(invoiceImage)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    await client.send({
      from: Deno.env.get('SMTP_USER') || '',
      to: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: `
        <h1>Invoice from ${businessProfile.company_name}</h1>
        <p>Dear ${invoice.customer_first_name},</p>
        <p>Please find your invoice attached to this email.</p>
        <p>Thank you for your business!</p>
        <br>
        <p>Best regards,</p>
        <p>${businessProfile.company_name}</p>
      `,
      attachments: [{
        filename: `invoice-${invoice.invoice_number}.png`,
        content: bytes,
        contentType: 'image/png',
      }],
    })

    await client.close()

    return new Response(
      JSON.stringify({ message: 'Invoice email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending invoice email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})