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
import { workOrderFormSchema, type WorkOrderFormValues } from "./types"

type WorkOrderFormProps = {
  selectedDate?: Date
  quoteRequest?: any // We'll type this properly later
  onSuccess?: () => void
}

export function WorkOrderForm({ selectedDate, quoteRequest, onSuccess }: WorkOrderFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      quote_request_id: quoteRequest?.id,
      start_date: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : "",
      end_date: selectedDate ? format(addHours(selectedDate, 2), "yyyy-MM-dd'T'HH:mm") : "",
      notes: "",
    },
  })

  const onSubmit = async (values: WorkOrderFormValues) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .insert({
          ...values,
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString(),
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Work order created successfully",
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
          Create Work Order
        </Button>
      </form>
    </Form>
  )
}