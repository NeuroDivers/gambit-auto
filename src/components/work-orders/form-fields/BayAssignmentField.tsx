import { FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { isWithinInterval, parseISO } from "date-fns"

type BayAssignmentFieldProps = {
  form: any
}

export function BayAssignmentField({ form }: BayAssignmentFieldProps) {
  const startTime = form.watch("start_time")
  const duration = form.watch("estimated_duration")
  const currentWorkOrderId = form.getValues("id")

  const { data: serviceBays } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
  })

  const { data: existingWorkOrders } = useQuery({
    queryKey: ["workOrders", "bay-conflicts", startTime, duration],
    queryFn: async () => {
      if (!startTime || !duration) return []

      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + duration)

      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .not('id', 'eq', currentWorkOrderId)
        .not('assigned_bay_id', 'is', null)

      if (error) throw error
      return data || []
    },
    enabled: !!startTime && !!duration,
  })

  const checkBayAvailability = (bayId: string) => {
    if (!startTime || !duration || !existingWorkOrders) return true

    const proposedEndTime = new Date(startTime)
    proposedEndTime.setHours(proposedEndTime.getHours() + duration)

    const conflictingWorkOrder = existingWorkOrders.find(wo => {
      if (wo.assigned_bay_id !== bayId || !wo.start_time || !wo.estimated_duration) return false

      const woStartTime = parseISO(wo.start_time)
      // Extract the hours from the interval string (e.g., "2 hours" -> 2)
      const durationMatch = wo.estimated_duration.toString().match(/(\d+)\s*hours?/)
      const woDuration = durationMatch ? parseInt(durationMatch[1]) : 0
      
      const woEndTime = new Date(woStartTime)
      woEndTime.setHours(woEndTime.getHours() + woDuration)

      return (
        isWithinInterval(startTime, { start: woStartTime, end: woEndTime }) ||
        isWithinInterval(proposedEndTime, { start: woStartTime, end: woEndTime }) ||
        isWithinInterval(woStartTime, { start: startTime, end: proposedEndTime })
      )
    })

    return !conflictingWorkOrder
  }

  const handleBaySelection = (value: string) => {
    if (value === "none") {
      form.setValue("assigned_bay_id", null)
      return
    }

    if (!startTime || !duration) {
      toast.error("Please select a start time and duration first")
      return
    }

    if (!checkBayAvailability(value)) {
      toast.error("This bay is already booked during the selected time period")
      return
    }

    form.setValue("assigned_bay_id", value)
  }

  return (
    <FormField
      control={form.control}
      name="assigned_bay_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Service Bay</FormLabel>
          <Select
            value={field.value || "none"}
            onValueChange={handleBaySelection}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service bay..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {serviceBays?.map((bay) => (
                <SelectItem 
                  key={bay.id} 
                  value={bay.id}
                >
                  {bay.name} ({bay.status})
                  {!checkBayAvailability(bay.id) && " - Unavailable"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}