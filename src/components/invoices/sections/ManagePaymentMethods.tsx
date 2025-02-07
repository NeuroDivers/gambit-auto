
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { AddPaymentMethodForm } from "./payment-methods/AddPaymentMethodForm"
import { PaymentMethodCard } from "./payment-methods/PaymentMethodCard"
import { usePaymentMethods } from "./payment-methods/usePaymentMethods"

const stripePromise = loadStripe('pk_test_51OpAcWB1FxNNsOFNKJ6RCR2pVvq79iBDqTz3mwYPUEQa8j7G26zfFn3KOVjwV1Fmw6wdpBz4wxjlZwTZrLxgZu0h00Yh1AOwag')

export function ManagePaymentMethods({ customerId }: { customerId?: string }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const {
    paymentMethods,
    isLoading,
    setupIntent,
    createSetupIntent,
    handleDelete,
    refreshPaymentMethods
  } = usePaymentMethods(customerId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Manage your saved payment methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length > 0 ? (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No payment methods saved
          </p>
        )}

        {!showAddForm ? (
          <Button
            onClick={async () => {
              await createSetupIntent()
              setShowAddForm(true)
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        ) : setupIntent ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: setupIntent,
              appearance: { theme: 'stripe' },
            }}
          >
            <AddPaymentMethodForm
              onSuccess={() => {
                setShowAddForm(false)
                refreshPaymentMethods()
              }}
            />
          </Elements>
        ) : null}
      </CardContent>
    </Card>
  )
}
