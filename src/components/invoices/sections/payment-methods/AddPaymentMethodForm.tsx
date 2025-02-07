
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
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
