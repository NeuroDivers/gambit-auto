import React from 'react'
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useWorkOrderForm } from "./form/useWorkOrderForm"
import { useWorkOrderSubmit } from "./form/useWorkOrderSubmit"
import { FormFields } from "./form-fields/FormFields"
import type { WorkOrderFormProps } from "./types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function WorkOrderForm({ 
  selectedDate,
  quoteRequest,
  onSuccess,
  workOrder 
}: WorkOrderFormProps) {
  // Fetch selected services if workOrder exists
  const { data: selectedServices } = useQuery({
    queryKey: ["workOrderServices", workOrder?.id],
    queryFn: async () => {
      if (!workOrder?.quote_request_id) return []
      const { data, error } = await supabase
        .from("quote_request_services")
        .select("service_id")
        .eq("quote_request_id", workOrder.quote_request_id)
      
      if (error) throw error
      return data.map(service => service.service_id)
    },
    enabled: !!workOrder?.quote_request_id
  })

  const form = useWorkOrderForm({ 
    selectedDate, 
    workOrder, 
    quoteRequest,
    selectedServices 
  })
  
  const { handleSubmit } = useWorkOrderSubmit({ workOrder, onSuccess })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormFields form={form} />
        <Button type="submit" className="w-full">
          {workOrder ? "Update Work Order" : "Create Work Order"}
        </Button>
      </form>
    </Form>
  )
}