import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
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
    const { invoiceId, pdfBase64 } = await req.json()
    console.log('Processing invoice:', invoiceId)

    // Validate PDF size before processing
    const pdfSize = (pdfBase64.length * 3) / 4 // Approximate size in bytes
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB limit
    
    if (pdfSize > MAX_SIZE) {
      throw new Error('PDF file size exceeds 5MB limit')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch invoice with related data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError
    if (!invoice) throw new Error('Invoice not found')

    // Fetch business profile
    const { data: businessProfile, error: profileError } = await supabaseClient
      .from('business_profile')
      .select('*')
      .single()

    if (profileError) throw profileError
    if (!businessProfile) throw new Error('Business profile not found')

    const appUrl = Deno.env.get('PUBLIC_APP_URL')
    const invoiceUrl = `${appUrl}/invoices/${invoiceId}`

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: "smtppro.zoho.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') ?? '',
          password: Deno.env.get('SMTP_PASSWORD') ?? '',
        },
      },
    })

    // Simplified email content to reduce memory usage
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Please find your invoice attached to this email.</p>
          <p>You can also view your invoice online at: <a href="${invoiceUrl}">${invoiceUrl}</a></p>
          <div style="margin-top: 20px;">
            <p>${businessProfile.company_name}</p>
            <p>${businessProfile.email}</p>
            <p>${businessProfile.phone_number}</p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      // Convert base64 PDF to Uint8Array for attachment
      const pdfData = pdfBase64.split(',')[1]
      const pdfBytes = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))

      // Send email with PDF attachment
      await client.send({
        from: Deno.env.get('SMTP_USER') ?? '',
        to: invoice.customer_email,
        subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
        html: emailContent,
        attachments: [{
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: pdfBytes,
          contentType: 'application/pdf'
        }],
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        }
      })

      await client.close()
      console.log('Email sent successfully to:', invoice.customer_email)

      return new Response(
        JSON.stringify({ message: 'Email sent successfully' }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      throw emailError
    }
  } catch (error) {
    console.error('Error in send-invoice-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})