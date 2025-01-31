import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormFields } from "./form-fields/FormFields"
import { useWorkOrderSubmit } from "./form/useWorkOrderSubmit"
import { useWorkOrderForm } from "./form/useWorkOrderForm"
import type { WorkOrder } from "./types/work-order"
import type { QuoteRequest } from "../quotes/types"

type WorkOrderFormProps = {
  workOrder?: WorkOrder
  quoteRequest?: QuoteRequest
  selectedDate?: Date
  onSuccess?: () => void
}

const formSchema = z.object({
  service_ids: z.array(z.string().uuid()).min(1, "Please select at least one service"),
  assigned_bay_id: z.string().uuid("Please select a service bay"),
  start_date: z.string().min(1, "Please select a start date"),
  start_time: z.string().optional(),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending')
})

export type WorkOrderFormValues = z.infer<typeof formSchema>

export function WorkOrderForm({ workOrder, quoteRequest, selectedDate, onSuccess }: WorkOrderFormProps) {
  const form = useWorkOrderForm({ 
    workOrder,
    quoteRequest,
    selectedDate
  })

  const { handleSubmit } = useWorkOrderSubmit({ 
    workOrder,
    quoteRequest,
    onSuccess
  })

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