import React from 'react'
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { BaySelectionField } from "./form-fields/BaySelectionField"
import { DateTimeFields } from "./form-fields/DateTimeFields"
import { StatusField } from "./form-fields/StatusField"
import { NotesField } from "./form-fields/NotesField"
import { useWorkOrderForm } from "./form/useWorkOrderForm"
import { useWorkOrderSubmit } from "./form/useWorkOrderSubmit"
import type { WorkOrderFormProps } from "./types"

export function WorkOrderForm({ selectedDate, quoteRequest, workOrder, onSuccess }: WorkOrderFormProps) {
  const form = useWorkOrderForm({ selectedDate, quoteRequest, workOrder })
  const { handleSubmit } = useWorkOrderSubmit({ workOrder, onSuccess })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BaySelectionField control={form.control} />
        <StatusField control={form.control} />
        <DateTimeFields control={form.control} />
        <NotesField control={form.control} />
        
        <Button type="submit" className="w-full">
          {workOrder ? 'Update Work Order' : 'Create Work Order'}
        </Button>
      </form>
    </Form>
  )
}