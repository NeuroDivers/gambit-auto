import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { invoiceId, recipientEmail } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch invoice details
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

    // Get the base URL from environment variables, fallback to a default if not set
    const baseUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://gambit-auto.lovable.app';
    const invoiceUrl = `${baseUrl}/invoices/${invoiceId}`;

    // Configure SMTP client
    const client = new SmtpClient();

    const emailContent = `
      <html>
        <body>
          <h2>Invoice from ${businessProfile.company_name}</h2>
          <p>Please find your invoice details below:</p>
          <ul>
            <li>Invoice Number: ${invoice.invoice_number}</li>
            <li>Total Amount: $${invoice.total}</li>
            <li>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</li>
          </ul>
          <p>You can view your invoice online at: <a href="${invoiceUrl}">${invoiceUrl}</a></p>
          <p>Thank you for your business!</p>
        </body>
      </html>
    `;

    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOST')!,
      port: Number(Deno.env.get('SMTP_PORT')),
      username: Deno.env.get('SMTP_USER')!,
      password: Deno.env.get('SMTP_PASSWORD')!,
    });

    await client.send({
      from: businessProfile.email,
      to: recipientEmail,
      subject: `Invoice ${invoice.invoice_number} from ${businessProfile.company_name}`,
      content: emailContent,
      html: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});