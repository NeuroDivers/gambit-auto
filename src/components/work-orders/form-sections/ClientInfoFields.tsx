import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import CustomerInfoFields from "@/components/invoices/form-sections/CustomerInfoFields"

interface ClientInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ClientInfoFields({ form }: ClientInfoFieldsProps) {
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

  useEffect(() => {
    async function loadCustomers() {
      setIsLoadingCustomers(true)
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('customer_last_name', { ascending: true })

        if (error) {
          console.error("Error loading customers:", error)
          toast.error("Failed to load customers")
        }

        if (data) {
          setCustomers(data)
        }
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    loadCustomers()
  }, [])

  const handleCustomerSelect = (customerId: string) => {
    setCustomerId(customerId)
    form.setValue('client_id', customerId)
  }

  return (
    <CustomerInfoFields
      customerFirstName={form.watch('customer_first_name')}
      setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
      customerLastName={form.watch('customer_last_name')}
      setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
      customerEmail={form.watch('customer_email')}
      setCustomerEmail={(value) => form.setValue('customer_email', value)}
      customerPhone={form.watch('customer_phone')}
      setCustomerPhone={(value) => form.setValue('customer_phone', value)}
      customerAddress={form.watch('customer_address')}
      setCustomerAddress={(value) => form.setValue('customer_address', value)}
      customers={customers}
      isLoadingCustomers={isLoadingCustomers}
      onCustomerSelect={handleCustomerSelect}
    />
  )
}
