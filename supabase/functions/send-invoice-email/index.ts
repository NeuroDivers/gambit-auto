
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) throw new Error('Invoice ID is required')

    // Log SMTP configuration for debugging (without sensitive data)
    console.log('SMTP Configuration:', {
      host: Deno.env.get('SMTP_HOST'),
      port: Deno.env.get('SMTP_PORT'),
      hasUser: !!Deno.env.get('SMTP_USER'),
      hasPassword: !!Deno.env.get('SMTP_PASSWORD')
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    // Get business profile
    const { data: businessProfile } = await supabaseClient
      .from('business_profile')
      .select('*')
      .single()

    // Configure SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') || '',
        port: Number(Deno.env.get('SMTP_PORT')) || 587,
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') || '',
          password: Deno.env.get('SMTP_PASSWORD') || '',
        },
      },
    })

    // Create email content
    const publicInvoiceUrl = `${Deno.env.get('PUBLIC_APP_URL')}/i/${invoiceId}`
    const emailContent = `
      <h1>Invoice ${invoice.invoice_number}</h1>
      <p>Dear ${invoice.customer_first_name} ${invoice.customer_last_name},</p>
      <p>Please find your invoice details below:</p>
      <p><a href="${publicInvoiceUrl}">View Invoice Online</a></p>
      <div style="margin: 20px 0;">
        <h2>Invoice Summary</h2>
        <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
        <p>GST (${invoice.gst_number}): $${invoice.gst_amount.toFixed(2)}</p>
        <p>QST (${invoice.qst_number}): $${invoice.qst_amount.toFixed(2)}</p>
        <p><strong>Total Amount: $${invoice.total.toFixed(2)}</strong></p>
      </div>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>${businessProfile?.company_name || 'The Team'}</p>
    `

    // Send email
    try {
      console.log('Attempting to send email...')
      await client.send({
        from: businessProfile?.company_email || Deno.env.get('SMTP_USER') || '',
        to: invoice.customer_email,
        subject: `Invoice ${invoice.invoice_number} from ${businessProfile?.company_name || 'Us'}`,
        html: emailContent,
      })
      console.log('Email sent successfully')
    } catch (emailError) {
      console.error('SMTP Error:', emailError)
      throw new Error(`SMTP Error: ${emailError.message}`)
    }

    // Update invoice status to sent if it was in draft
    if (invoice.status === 'draft') {
      await supabaseClient
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending invoice:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
