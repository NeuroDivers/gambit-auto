
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

      return data
    },
    onError: (error) => {
      toast.error(error.message || "Payment failed")
      console.error("Payment error:", error)
    }
  })
}
