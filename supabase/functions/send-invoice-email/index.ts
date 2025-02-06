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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch invoice with work order details
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

    // Fetch business profile
    const { data: businessProfile, error: profileError } = await supabaseClient
      .from('business_profile')
      .select('*')
      .single()

    if (profileError) {
      console.error('Error fetching business profile:', profileError)
      throw profileError
    }

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

    const appUrl = Deno.env.get('PUBLIC_APP_URL')
    const invoiceUrl = `${appUrl}/invoices/${invoiceId}`

    // Format items table with proper HTML
    const itemsTable = invoice.invoice_items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${item.service_name}</td>
        <td style="padding: 8px;">${item.quantity}</td>
        <td style="padding: 8px;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 8px;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>
    `).join('')

    // Format email content with proper HTML structure and content-type
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="padding: 20px; background-color: #f8f9fa; margin-bottom: 20px;">
            <h2>Invoice #${invoice.invoice_number}</h2>
            <p>From: ${businessProfile.company_name}</p>
            <p>To: ${invoice.customer_first_name} ${invoice.customer_last_name}</p>
            <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>

          <p>Please find your invoice attached to this email.</p>
          
          <p>You can also view your invoice online at: <a href="${invoiceUrl}">${invoiceUrl}</a></p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>${businessProfile.company_name}</p>
            <p>${businessProfile.email}</p>
            <p>${businessProfile.phone_number}</p>
            <p>${businessProfile.address}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Convert base64 PDF to Uint8Array for attachment
    const pdfBytes = Uint8Array.from(atob(pdfBase64.split(',')[1]), c => c.charCodeAt(0))

    // Send email with proper content type and PDF attachment
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
  } catch (error) {
    console.error('Error sending invoice email:', error)
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