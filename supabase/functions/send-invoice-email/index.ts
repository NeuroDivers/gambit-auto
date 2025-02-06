import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  invoiceId: string;
  recipientEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Unauthorized')
    }

    const { invoiceId, recipientEmail }: EmailRequest = await req.json()

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError)
      throw invoiceError
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

    // Verify SMTP settings are configured
    const smtpHost = Deno.env.get("SMTP_HOST")
    const smtpPort = Deno.env.get("SMTP_PORT")
    const smtpUser = Deno.env.get("SMTP_USER")
    const smtpPassword = Deno.env.get("SMTP_PASSWORD")

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      throw new Error('SMTP settings are not properly configured')
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    const items = invoice.invoice_items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.service_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.quantity * item.unit_price)}</td>
      </tr>
    `).join('');

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoice_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h2>Invoice #${invoice.invoice_number}</h2>
          <p><strong>From:</strong> ${businessProfile.company_name}</p>
          <p><strong>To:</strong> ${invoice.customer_first_name} ${invoice.customer_last_name}</p>
          <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left;">Service</th>
                <th style="padding: 12px 8px; text-align: center;">Quantity</th>
                <th style="padding: 12px 8px; text-align: right;">Unit Price</th>
                <th style="padding: 12px 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
            <p><strong>Tax:</strong> ${formatCurrency(invoice.tax_amount)}</p>
            <p style="font-size: 1.2em;"><strong>Total:</strong> ${formatCurrency(invoice.total)}</p>
          </div>

          <p style="margin-top: 30px;">
            You can view your invoice online at: 
            <a href="https://gambitauto.com/invoices/${invoice.id}">
              https://gambitauto.com/invoices/${invoice.id}
            </a>
          </p>
        </body>
      </html>
    `;

    await client.send({
      from: smtpUser,
      to: recipientEmail,
      subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
      content: "text/html",
      html: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
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
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})