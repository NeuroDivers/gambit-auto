import React from 'react'
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useWorkOrderForm } from "./form/useWorkOrderForm"
import { useWorkOrderSubmit } from "./form/useWorkOrderSubmit"
import { FormFields } from "./form-fields/FormFields"
import type { WorkOrderFormProps } from "./types"

export function WorkOrderForm({ 
  selectedDate,
  quoteRequest,
  onSuccess,
  workOrder 
}: WorkOrderFormProps) {
  const form = useWorkOrderForm({ selectedDate, workOrder, quoteRequest })
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