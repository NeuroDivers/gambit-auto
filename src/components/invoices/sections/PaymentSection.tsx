
import { Button } from "@/components/ui/button"
import { usePayment } from "../hooks/usePayment"
import { Loader2 } from "lucide-react"
import { Invoice } from "../types"
import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51OpAcWB1FxNNsOFNKJ6RCR2pVvq79iBDqTz3mwYPUEQa8j7G26zfFn3KOVjwV1Fmw6wdpBz4wxjlZwTZrLxgZu0h00Yh1AOwag')

type PaymentSectionProps = {
  invoice: Invoice
}

type PaymentFormData = {
  email: string
}

function PaymentForm({ invoice, clientSecret }: { invoice: Invoice, clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<PaymentFormData>({
    defaultValues: {
      email: invoice.customer_email || '',
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/invoices/${invoice.id}`,
          payment_method_data: {
            billing_details: {
              email: form.getValues('email'),
            }
          }
        },
      })

      if (error) {
        console.error('Payment error:', error)
        throw error
      }
    } catch (error) {
      console.error('Payment submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Form {...form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </Form>

      <div className="border rounded-lg p-4">
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  )
}

export function PaymentSection({ invoice }: PaymentSectionProps) {
  const { mutate: processPayment, isPending, data } = usePayment()
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const handlePaymentStart = () => {
    processPayment({
      invoiceId: invoice.id,
      amount: invoice.total,
      email: invoice.customer_email || '',
    })
  }

  if (invoice.payment_status === 'succeeded') {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-700">Payment completed successfully</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">Total Amount: ${invoice.total.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Status: {invoice.payment_status || 'unpaid'}
          </p>
        </div>
      </div>

      {!showPaymentForm && !data?.paymentIntent?.client_secret ? (
        <Button 
          onClick={() => {
            setShowPaymentForm(true)
            handlePaymentStart()
          }}
          disabled={isPending}
          className="w-full"
        >
          Proceed to Payment
        </Button>
      ) : data?.paymentIntent?.client_secret ? (
        <Elements 
          stripe={stripePromise} 
          options={{
            clientSecret: data.paymentIntent.client_secret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <PaymentForm 
            invoice={invoice} 
            clientSecret={data.paymentIntent.client_secret}
          />
        </Elements>
      ) : null}
    </div>
  )
}
