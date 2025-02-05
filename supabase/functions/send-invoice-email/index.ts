import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'

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
        work_order:work_orders (
          *,
          services:work_order_services (
            *,
            service:service_types (
              name,
              price
            )
          )
        )
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

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()
    
    // Set the HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { margin-bottom: 20px; }
            .invoice-details { margin-bottom: 30px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>${businessProfile.company_name}</h1>
              <p>${businessProfile.address}</p>
              <p>${businessProfile.phone_number}</p>
              <p>${businessProfile.email}</p>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p>Invoice #: ${invoice.invoice_number}</p>
              <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="customer-info">
            <h3>Bill To:</h3>
            <p>${invoice.customer_first_name} ${invoice.customer_last_name}</p>
            <p>${invoice.customer_email}</p>
            <p>${invoice.customer_address || ''}</p>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoice_items?.map(item => `
                <tr>
                  <td>${item.service_name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unit_price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
            <p>Tax: $${invoice.tax_amount.toFixed(2)}</p>
            <h3>Total: $${invoice.total.toFixed(2)}</h3>
          </div>
        </body>
      </html>
    `

    await page.setContent(htmlContent)
    const pdf = await page.pdf({ format: 'A4' })
    await browser.close()

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

    // Format email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice #${invoice.invoice_number}</h2>
        <p>Dear ${invoice.customer_first_name} ${invoice.customer_last_name},</p>
        <p>Please find attached your invoice from ${businessProfile.company_name}.</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3>Invoice Details:</h3>
          <p>Invoice Number: ${invoice.invoice_number}</p>
          <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
          <p>Total Amount: $${invoice.total.toFixed(2)}</p>
        </div>

        <p>You can view your invoice online at: <a href="${invoiceUrl}">${invoiceUrl}</a></p>

        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Best regards,<br>${businessProfile.company_name}</p>
          <p style="color: #666;">
            ${businessProfile.email}<br>
            ${businessProfile.phone_number}
          </p>
        </div>
      </div>
    `

    // Send email with PDF attachment
    await client.send({
      from: Deno.env.get('SMTP_USER') ?? '',
      to: invoice.customer_email,
      subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: emailContent,
      attachments: [{
        filename: `invoice-${invoice.invoice_number}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      }],
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