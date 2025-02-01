import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.fresh.run/std@v9.6.1/http/server.ts'
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
    const { invoiceId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch invoice data with related information
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        work_order:work_orders (
          *,
          services:work_order_services (
            *,
            service:service_types (*)
          )
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError

    // Fetch business profile
    const { data: businessProfile } = await supabaseClient
      .from('business_profile')
      .select('*')
      .single()

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? '',
        port: Number(Deno.env.get('SMTP_PORT')) ?? 587,
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') ?? '',
          password: Deno.env.get('SMTP_PASSWORD') ?? '',
        },
      },
    });

    // Format email content
    const emailContent = `
      Dear ${invoice.work_order.first_name} ${invoice.work_order.last_name},

      Please find attached your invoice #${invoice.invoice_number} from ${businessProfile?.company_name}.

      Invoice Details:
      - Invoice Number: ${invoice.invoice_number}
      - Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
      - Total Amount: $${invoice.total}

      If you have any questions, please don't hesitate to contact us.

      Best regards,
      ${businessProfile?.company_name}
      ${businessProfile?.email}
      ${businessProfile?.phone_number}
    `

    // Send email
    await client.send({
      from: Deno.env.get('SMTP_USER') ?? '',
      to: invoice.work_order.email,
      subject: `Invoice #${invoice.invoice_number} from ${businessProfile?.company_name}`,
      content: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})