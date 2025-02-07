
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { SavedPaymentMethod } from "./types"

export function usePaymentMethods(customerId?: string) {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [setupIntent, setSetupIntent] = useState<string>()

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

  return {
    paymentMethods,
    isLoading,
    setupIntent,
    createSetupIntent,
    handleDelete,
    refreshPaymentMethods: fetchPaymentMethods
  }
}
