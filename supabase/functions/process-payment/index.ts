
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.3.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  invoiceId: string
  paymentMethodId?: string
  amount: number
  customerId?: string
  email: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { invoiceId, paymentMethodId, amount, customerId, email }: PaymentRequest = await req.json()

    // Get or create Stripe customer
    let stripeCustomerId = customerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabaseUserId: user.id,
        },
      })
      stripeCustomerId = customer.id

      // Update invoice with Stripe customer ID
      await supabaseClient
        .from('invoices')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', invoiceId)
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'cad',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${Deno.env.get('PUBLIC_APP_URL')}/invoices/${invoiceId}`,
      automatic_payment_methods: paymentMethodId ? undefined : {
        enabled: true,
        allow_redirects: 'always',
      },
    })

    // Create payment record
    await supabaseClient.from('payments').insert({
      invoice_id: invoiceId,
      amount,
      stripe_payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
    })

    // Update invoice payment status
    await supabaseClient
      .from('invoices')
      .update({ payment_status: paymentIntent.status })
      .eq('id', invoiceId)

    return new Response(
      JSON.stringify({ 
        paymentIntent,
        customer: stripeCustomerId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
