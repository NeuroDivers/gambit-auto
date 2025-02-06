
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            invoiceId,
            paymentMethodId,
            amount,
            customerId,
            email,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Payment failed")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Payment processed successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Payment failed")
      console.error("Payment error:", error)
    }
  })
}
