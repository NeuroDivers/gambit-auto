import { useState } from "react"
import { ServiceItemType } from "@/types/service-item"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { InvoiceItemsFields } from "@/components/invoices/form-sections/InvoiceItemsFields"
import { Button } from "@/components/ui/button"

export interface QuoteFormProps {
  quote?: any
  onSuccess?: () => void
  defaultServices?: ServiceItemType[]
}

export function QuoteForm({ quote, onSuccess, defaultServices = [] }: QuoteFormProps) {
  const [services, setServices] = useState<ServiceItemType[]>(defaultServices)
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('quotes')
        .upsert(data)
        .select()

      if (error) {
        console.error("Error creating quote:", error)
        toast.error("Failed to save quote")
        throw error
      }
    },
    onSuccess: () => {
      if (onSuccess) onSuccess()
    }
  })

  // Replace isLoading checks with mutation.isPending
  const isSubmitting = mutation.isPending

  return (
    <div className="space-y-4">
      <InvoiceItemsFields
        services={services}
        setServices={setServices}
      />

      <Button
        onClick={() => {
          mutation.mutate({
            ...quote,
            service_items: services
          })
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Quote"}
      </Button>
    </div>
  )
}
