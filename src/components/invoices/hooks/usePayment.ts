
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function usePayment() {
  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      paymentMethodId,
      amount,
      customerId,
      email 
    }: {
      invoiceId: string
      paymentMethodId?: string
      amount: number
      customerId?: string
      email: string
    }) => {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          invoiceId,
          paymentMethodId,
          amount,
          customerId,
          email,
        },
      })

      if (error) {
        console.error('Payment error:', error)
        throw error
      }

      // If payment was successful and there's a new payment method, save it
      if (data?.paymentIntent?.payment_method && data?.customer) {
        const { error: saveError } = await supabase
          .from('payment_methods')
          .insert({
            customer_id: data.customer,
            payment_method_id: data.paymentIntent.payment_method,
            card_last4: data.paymentMethod?.card?.last4,
            card_brand: data.paymentMethod?.card?.brand,
            card_exp_month: data.paymentMethod?.card?.exp_month,
            card_exp_year: data.paymentMethod?.card?.exp_year,
          })

        if (saveError) {
          console.error('Error saving payment method:', saveError)
        }
      }

      return data
    },
    onError: (error) => {
      toast.error(error.message || "Payment failed")
      console.error("Payment error:", error)
    }
  })
}
