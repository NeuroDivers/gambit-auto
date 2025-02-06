import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch invoice details with items
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Failed to fetch invoice');
    }

    // Fetch business profile
    const { data: businessProfile, error: businessError } = await supabaseClient
      .from('business_profile')
      .select('*')
      .limit(1)
      .single();

    if (businessError || !businessProfile) {
      throw new Error('Failed to fetch business profile');
    }

    // Generate invoice HTML
    const invoiceHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { margin-bottom: 20px; }
            .company-info { margin-bottom: 20px; }
            .invoice-details { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .totals { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice from ${businessProfile.company_name}</h1>
          </div>
          
          <div class="company-info">
            <p>${businessProfile.company_name}</p>
            <p>${businessProfile.address || ''}</p>
            <p>${businessProfile.phone_number || ''}</p>
            <p>${businessProfile.email || ''}</p>
          </div>

          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
          </div>

          <div class="customer-info">
            <h3>Bill To:</h3>
            <p>${invoice.customer_first_name} ${invoice.customer_last_name}</p>
            ${invoice.customer_email ? `<p>${invoice.customer_email}</p>` : ''}
            ${invoice.customer_phone ? `<p>${invoice.customer_phone}</p>` : ''}
            ${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoice_items.map(item => `
                <tr>
                  <td>${item.service_name}</td>
                  <td>${item.description || ''}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unit_price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> $${invoice.tax_amount.toFixed(2)}</p>
            <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
          </div>

          <div style="margin-top: 40px; text-align: center;">
            <p>Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact us at ${businessProfile.email}</p>
          </div>
        </body>
      </html>
    `;

    try {
      const emailResponse = await resend.emails.send({
        from: `${businessProfile.company_name} <onboarding@resend.dev>`,
        to: [invoice.customer_email || ''],
        subject: `Invoice ${invoice.invoice_number} from ${businessProfile.company_name}`,
        html: invoiceHtml,
      });

      console.log('Email sent successfully:', emailResponse);

      return new Response(
        JSON.stringify({ message: 'Email sent successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in send-invoice-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});