import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) throw new Error("No authorization header");

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    if (authError || !user) throw new Error("Not authenticated");

    const { invoiceId } = await req.json();
    if (!invoiceId) throw new Error("Invoice ID is required");

    // ✅ Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        id, invoice_number, due_date, subtotal, tax_amount, total, 
        customer_email, customer_first_name, 
        invoice_items ( service_name, quantity, unit_price )
      `)
      .eq("id", invoiceId)
      .single();

    console.log("Invoice Data:", invoice);
    if (invoiceError || !invoice) throw new Error("Invoice not found");

    // ✅ Fetch business profile
    const { data: businessProfile, error: businessError } = await supabaseClient
      .from("business_profile")
      .select("company_name, email, phone_number, address")
      .single();

    console.log("Business Profile Data:", businessProfile);
    if (businessError || !businessProfile) throw new Error("Business profile not found");

    const recipientEmail = invoice.customer_email;
    if (!recipientEmail) throw new Error("Customer email is required");

    const appUrl = Deno.env.get("PUBLIC_APP_URL") || "http://localhost:5173";
    // Use the public invoice URL format (/i/[id]) instead of the admin URL
    const invoiceUrl = `${appUrl}/i/${invoice.id}`;

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f8f9fa; text-align: left; padding: 12px 8px; }
            .total { font-weight: bold; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #7c3aed;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Invoice from ${businessProfile.company_name}</h2>
            </div>
            <p>Dear ${invoice.customer_first_name},</p>
            <p>Please find your invoice details below. You can also view your invoice online by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${invoiceUrl}" class="button" style="color: white;">View Invoice Online</a>
            </div>

            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            
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
                ${(invoice.invoice_items ?? []).map((item: any) => `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.service_name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unit_price)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.quantity * item.unit_price)}</td>
                  </tr>
                `).join("")}
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

            <div style="text-align: center; margin-top: 30px; color: #666;">
              <p>Thank you for your business!</p>
              <p>${businessProfile.company_name}<br>
              ${businessProfile.address}<br>
              ${businessProfile.phone_number}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = new Response(
      JSON.stringify({ message: "Invoice email is being sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    (async () => {
      try {
        const client = new SMTPClient({
          connection: {
            hostname: Deno.env.get("SMTP_HOST") || "",
            port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
            tls: true,
            auth: {
              username: Deno.env.get("SMTP_USER") || "",
              password: Deno.env.get("SMTP_PASSWORD") || "",
            },
          },
        });

        await client.send({
          from: Deno.env.get("SMTP_USER") || "",
          to: recipientEmail,
          subject: `Invoice ${invoice.invoice_number} from ${businessProfile.company_name}`,
          html: emailContent,
        });

        await client.close();
        console.log("Email sent successfully");
      } catch (error) {
        console.error("Email sending failed:", error);
      }
    })();

    return response;
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});