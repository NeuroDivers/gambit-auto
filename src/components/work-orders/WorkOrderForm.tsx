import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { addHours, format } from "date-fns"
import { BaySelectionField } from "./form-fields/BaySelectionField"
import { DateTimeFields } from "./form-fields/DateTimeFields"
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
      start_date: workOrder ? format(new Date(workOrder.start_date), "yyyy-MM-dd'T'HH:mm") 
        : selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : "",
      end_date: workOrder ? format(new Date(workOrder.end_date), "yyyy-MM-dd'T'HH:mm")
        : selectedDate ? format(addHours(selectedDate, 2), "yyyy-MM-dd'T'HH:mm") : "",
      notes: workOrder?.notes || "",
    },
  })

  const onSubmit = async (values: WorkOrderFormValues) => {
    try {
      if (workOrder) {
        // Update existing work order
        const { error } = await supabase
          .from("work_orders")
          .update({
            ...values,
            start_date: new Date(values.start_date).toISOString(),
            end_date: new Date(values.end_date).toISOString(),
          })
          .eq('id', workOrder.id)

        if (error) throw error
      } else {
        // Create new work order
        const { error } = await supabase
          .from("work_orders")
          .insert({
            ...values,
            start_date: new Date(values.start_date).toISOString(),
            end_date: new Date(values.end_date).toISOString(),
          })

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
        <DateTimeFields control={form.control} />
        <NotesField control={form.control} />
        
        <Button type="submit" className="w-full">
          {workOrder ? 'Update Work Order' : 'Create Work Order'}
        </Button>
      </form>
    </Form>
  )
}