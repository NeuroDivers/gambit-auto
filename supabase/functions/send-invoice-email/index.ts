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
    const { invoiceId } = await req.json()
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

    // Create a clean HTML table for invoice items
    const itemsTable = invoice.invoice_items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.service_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>
    `).join('')

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Invoice #${invoice.invoice_number}</h2>
            <p style="margin: 5px 0;"><strong>From:</strong> ${businessProfile.company_name}</p>
            <p style="margin: 5px 0;"><strong>To:</strong> ${invoice.customer_first_name} ${invoice.customer_last_name}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Service</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #eee;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Unit Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Tax:</strong> $${invoice.tax_amount.toFixed(2)}</p>
            <p style="margin: 15px 0; font-size: 1.2em;"><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>
              You can view your invoice online at: 
              <a href="${invoiceUrl}" style="color: #4299e1;">${invoiceUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `

    try {
      await client.send({
        from: Deno.env.get('SMTP_USER') ?? '',
        to: invoice.customer_email,
        subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
        content: "text/html",
        html: emailContent,
        encoding: '8bit', // Prevent quoted-printable encoding
      })

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
    } finally {
      await client.close()
    }
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