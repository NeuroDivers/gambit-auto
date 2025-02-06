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

    // Format items table with proper HTML
    const itemsTable = invoice.invoice_items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${item.service_name}</td>
        <td style="padding: 8px;">${item.quantity}</td>
        <td style="padding: 8px;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 8px;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>
    `).join('')

    // Format email content with proper HTML structure
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="padding: 20px; background-color: #f8f9fa; margin-bottom: 20px;">
          <h2>Invoice #${invoice.invoice_number}</h2>
          <p>From: ${businessProfile.company_name}</p>
          <p>To: ${invoice.customer_first_name} ${invoice.customer_last_name}</p>
          <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 8px; text-align: left;">Service</th>
              <th style="padding: 8px; text-align: left;">Quantity</th>
              <th style="padding: 8px; text-align: left;">Unit Price</th>
              <th style="padding: 8px; text-align: left;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
          <p>Tax: $${invoice.tax_amount.toFixed(2)}</p>
          <h3>Total: $${invoice.total.toFixed(2)}</h3>
        </div>

        <div style="margin-top: 30px;">
          <p>You can view your invoice online at: <a href="${invoiceUrl}">${invoiceUrl}</a></p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>${businessProfile.company_name}</p>
          <p>${businessProfile.email}</p>
          <p>${businessProfile.phone_number}</p>
          <p>${businessProfile.address}</p>
        </div>
      </div>
    `

    // Send email
    await client.send({
      from: Deno.env.get('SMTP_USER') ?? '',
      to: invoice.customer_email,
      subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: emailContent,
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