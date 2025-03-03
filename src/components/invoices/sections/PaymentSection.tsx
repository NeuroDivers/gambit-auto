
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Invoice } from "../types"
import { usePayment } from "../hooks/usePayment"
import { ManagePaymentMethods } from "./ManagePaymentMethods"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe only if the key is available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  null;

type PaymentSectionProps = {
  invoice: Invoice
}

export function PaymentSection({ invoice }: PaymentSectionProps) {
  const { mutate, isPending } = usePayment()

  const handlePayment = async () => {
    mutate({
      invoiceId: invoice.id,
      amount: invoice.total,
      email: invoice.customer_email || '',
      customerId: invoice.stripe_customer_id,
    })
  }

  // Ensure we calculate the total correctly using subtotal and both GST and QST amounts
  const total = invoice.total || 0

  if (invoice.payment_status === 'paid') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>This invoice has been paid</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">Total Amount: ${total.toFixed(2)}</p>
        </CardContent>
      </Card>
    )
  }

  // Don't show payment options if Stripe is not configured
  if (!stripePromise) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Payment processing is not configured</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">Total Amount: ${total.toFixed(2)}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete your payment for this invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">Total Amount: ${total.toFixed(2)}</p>
        <Button onClick={handlePayment} disabled={isPending}>
          {isPending ? "Processing..." : "Pay Now"}
        </Button>
      </CardContent>
      <CardFooter>
        <ManagePaymentMethods />
      </CardFooter>
    </Card>
  )
}
