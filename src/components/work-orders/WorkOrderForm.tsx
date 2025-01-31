import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { BaySelectionField } from "./form-fields/BaySelectionField"
import { DateTimeFields } from "./form-fields/DateTimeFields"
import { StatusField } from "./form-fields/StatusField"
import { NotesField } from "./form-fields/NotesField"
import { workOrderFormSchema, type WorkOrderFormValues, type WorkOrderFormProps } from "./types"

export function WorkOrderForm({ selectedDate, quoteRequest, workOrder, onSuccess }: WorkOrderFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      quote_request_id: workOrder?.quote_request_id || quoteRequest?.id,
      assigned_bay_id: workOrder?.assigned_bay_id || "",
      start_date: workOrder ? format(new Date(workOrder.start_date), "yyyy-MM-dd") 
        : selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      start_time: workOrder ? format(new Date(workOrder.start_date), "HH:mm")
        : selectedDate ? format(selectedDate, "HH:mm") : "",
      end_date: workOrder ? format(new Date(workOrder.end_date), "yyyy-MM-dd")
        : selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      end_time: workOrder ? format(new Date(workOrder.end_date), "HH:mm")
        : selectedDate ? format(selectedDate, "HH:mm") : "",
      status: workOrder?.status || "pending",
      notes: workOrder?.notes || "",
    },
  })

  const onSubmit = async (values: WorkOrderFormValues) => {
    try {
      const startDateTime = new Date(`${values.start_date}T${values.start_time}`).toISOString()
      const endDateTime = new Date(`${values.end_date}T${values.end_time}`).toISOString()

      const workOrderData = {
        quote_request_id: values.quote_request_id,
        assigned_bay_id: values.assigned_bay_id,
        start_date: startDateTime,
        end_date: endDateTime,
        status: values.status,
        notes: values.notes,
      }

      if (workOrder) {
        const { error } = await supabase
          .from("work_orders")
          .update(workOrderData)
          .eq('id', workOrder.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("work_orders")
          .insert([workOrderData])

        if (error) throw error
      }

      toast({
        title: "Success",
        description: workOrder ? "Work order updated successfully" : "Work order created successfully",
      })

      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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