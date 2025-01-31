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
import { SidekickSelectionField } from "./form-fields/SidekickSelectionField"
import { workOrderFormSchema, type WorkOrderFormValues, type WorkOrderFormProps } from "./types"
import { Calendar } from "@/components/ui/calendar"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

export function WorkOrderForm({ selectedDate, quoteRequest, workOrder, onSuccess }: WorkOrderFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      quote_request_id: workOrder?.quote_request_id || quoteRequest?.id,
      assigned_bay_id: workOrder?.assigned_bay_id || "",
      assigned_sidekick_id: workOrder?.assigned_sidekick_id || "",
      start_date: workOrder ? format(new Date(workOrder.start_date), "yyyy-MM-dd'T'HH:mm") 
        : selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : "",
      end_date: workOrder ? format(new Date(workOrder.end_date), "yyyy-MM-dd'T'HH:mm")
        : selectedDate ? format(addHours(selectedDate, 2), "yyyy-MM-dd'T'HH:mm") : "",
      notes: workOrder?.notes || "",
    },
  })

  // Fetch existing work orders
  const { data: existingWorkOrders } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          service_bays (
            name
          ),
          quote_requests (
            first_name,
            last_name,
            quote_request_services (
              service_types (
                name
              )
            )
          )
        `)
      if (error) throw error
      return data
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

  // Function to check if a date has work orders
  const getWorkOrdersForDate = (date: Date) => {
    return existingWorkOrders?.filter(order => {
      const orderDate = new Date(order.start_date)
      return orderDate.toDateString() === date.toDateString()
    }) || []
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            className="w-full"
            components={{
              Day: ({ date, ...dayProps }) => {
                const workOrders = getWorkOrdersForDate(date)
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                
                return (
                  <div
                    className={cn(
                      "relative w-full p-2 text-center",
                      isSelected && "text-primary-foreground",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    )}
                    {...dayProps}
                  >
                    <time dateTime={format(date, "yyyy-MM-dd")}>{format(date, "d")}</time>
                    {workOrders.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                        <div className="flex -space-x-1">
                          {workOrders.map((_, index) => (
                            <div
                              key={index}
                              className="h-1 w-1 rounded-full bg-primary"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              },
            }}
            classNames={{
              months: "w-full",
              month: "w-full",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.9rem] capitalize",
              row: "flex w-full mt-2",
              cell: cn(
                "relative w-full p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              ),
              day: cn(
                "h-9 w-full p-0 font-normal aria-selected:opacity-100",
              ),
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
            }}
          />
        </div>

        <BaySelectionField control={form.control} />
        <SidekickSelectionField control={form.control} />
        <DateTimeFields control={form.control} />
        <NotesField control={form.control} />
        
        <Button type="submit" className="w-full">
          {workOrder ? 'Update Work Order' : 'Create Work Order'}
        </Button>
      </form>
    </Form>
  )
}
