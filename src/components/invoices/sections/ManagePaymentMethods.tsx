
import { useState, useEffect } from "react"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe('pk_test_51OpAcWB1FxNNsOFNKJ6RCR2pVvq79iBDqTz3mwYPUEQa8j7G26zfFn3KOVjwV1Fmw6wdpBz4wxjlZwTZrLxgZu0h00Yh1AOwag')

type SavedPaymentMethod = {
  id: string
  card_brand: string
  card_last4: string
  card_exp_month: number
  card_exp_year: number
}

function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        onSuccess()
        toast.success("Payment method added successfully")
      }
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast.error("Failed to add payment method")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Payment Method'
        )}
      </Button>
    </form>
  )
}

export function ManagePaymentMethods({ customerId }: { customerId?: string }) {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [setupIntent, setSetupIntent] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  const fetchPaymentMethods = async () => {
    if (!customerId) return

    try {
      console.log('Fetching payment methods for customer:', customerId)
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customerId)

      if (error) {
        console.error('Error fetching payment methods:', error)
        toast.error("Failed to fetch payment methods")
        return
      }

      console.log('Payment methods fetched:', data)
      setPaymentMethods(data || [])
    } catch (error) {
      console.error('Error in fetchPaymentMethods:', error)
      toast.error("Failed to fetch payment methods")
    } finally {
      setIsLoading(false)
    }
  }

  const createSetupIntent = async () => {
    if (!customerId) return

    try {
      console.log('Creating setup intent for customer:', customerId)
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { customerId }
      })

      if (error) {
        console.error('Error creating setup intent:', error)
        toast.error("Failed to create setup intent")
        return
      }

      console.log('Setup intent created:', data)
      setSetupIntent(data.client_secret)
    } catch (error) {
      console.error('Error in createSetupIntent:', error)
      toast.error("Failed to create setup intent")
    }
  }

  const handleDelete = async (paymentMethodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)

      if (error) {
        console.error('Error deleting payment method:', error)
        toast.error("Failed to delete payment method")
        return
      }

      toast.success("Payment method deleted")
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast.error("Failed to delete payment method")
    }
  }

  useEffect(() => {
    if (customerId) {
      fetchPaymentMethods()
    }
  }, [customerId])

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
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {method.card_brand} **** {method.card_last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.card_exp_month}/{method.card_exp_year}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(method.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
                fetchPaymentMethods()
              }}
            />
          </Elements>
        ) : null}
      </CardContent>
    </Card>
  )
}
