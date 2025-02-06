import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader)
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Unauthorized - Admin access required')
    }

    // Validate SMTP settings
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Deno.env.get('SMTP_PORT')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASSWORD')

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error('Missing SMTP configuration:', { smtpHost, smtpPort, smtpUser })
      throw new Error('SMTP settings are not properly configured')
    }

    const { invoiceId } = await req.json()

    if (!invoiceId) {
      throw new Error('Invoice ID is required')
    }

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Fetch business profile
    const { data: businessProfile, error: businessError } = await supabaseClient
      .from('business_profile')
      .select('*')
      .single()

    if (businessError || !businessProfile) {
      throw new Error('Business profile not found')
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
      }).format(amount)
    }

    const itemsHtml = invoice.invoice_items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.service_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.quantity * item.unit_price)}</td>
      </tr>
    `).join('');

    const recipientEmail = invoice.customer_email
    if (!recipientEmail) {
      throw new Error('Customer email is required')
    }

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f8f9fa; text-align: left; padding: 12px 8px; }
            .total { font-weight: bold; font-size: 1.1em; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Invoice from ${businessProfile.company_name}</h2>
            </div>
            <div class="invoice-details">
              <p>Dear ${invoice.customer_first_name},</p>
              <p>Please find your invoice details below:</p>
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr class="total">
                  <td colspan="3" style="text-align: right; padding: 8px;">Subtotal:</td>
                  <td style="text-align: right; padding: 8px;">${formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr class="total">
                  <td colspan="3" style="text-align: right; padding: 8px;">Tax:</td>
                  <td style="text-align: right; padding: 8px;">${formatCurrency(invoice.tax_amount)}</td>
                </tr>
                <tr class="total">
                  <td colspan="3" style="text-align: right; padding: 8px;">Total:</td>
                  <td style="text-align: right; padding: 8px;">${formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
            <p>You can view your invoice online at: <a href="https://app.gambitauto.com/invoices/${invoice.id}">View Invoice</a></p>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>${businessProfile.company_name}<br>
              ${businessProfile.address}<br>
              ${businessProfile.phone_number}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    // Use the authenticated SMTP_USER as the sender
    await client.send({
      from: smtpUser,
      to: recipientEmail,
      subject: `Invoice ${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: emailContent,
    });

    await client.close();

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