import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.fresh.run/std@v9.6.1/http/server.ts'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    // Create SMTP client for Zoho
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.zoho.com",
        port: 587,
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') ?? '',
          password: Deno.env.get('SMTP_PASSWORD') ?? '',
        },
      },
    });

    // Format email content with HTML
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice #${invoice.invoice_number}</h2>
        <p>Dear ${invoice.work_order.first_name} ${invoice.work_order.last_name},</p>
        <p>Please find attached your invoice from ${businessProfile.company_name}.</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3>Invoice Details:</h3>
          <p>Invoice Number: ${invoice.invoice_number}</p>
          <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
          <p>Total Amount: $${invoice.total}</p>
        </div>

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

    // Send email using SMTP
    await client.send({
      from: Deno.env.get('SMTP_USER') ?? '',
      to: invoice.work_order.email,
      subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: emailContent,
    });

    await client.close();
    console.log('Email sent successfully to:', invoice.work_order.email)

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