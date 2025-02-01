import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

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

    // Format email content
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

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${businessProfile.company_name} <onboarding@resend.dev>`,
      to: invoice.work_order.email,
      subject: `Invoice #${invoice.invoice_number} from ${businessProfile.company_name}`,
      html: emailContent,
    })

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})