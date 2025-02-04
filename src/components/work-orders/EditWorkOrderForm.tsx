import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { CustomerInfoFields } from "./form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "./form-sections/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ServiceItemType, WorkOrder } from "./types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

const workOrderFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  contact_preference: z.enum(["phone", "email"]),
  address: z.string().optional(),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900, "Invalid year"),
  vehicle_serial: z.string().min(1, "Vehicle serial number is required"),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0)
  })).min(1, "At least one service is required"),
  sidekick_assignments: z.record(z.string(), z.string().optional()).optional(),
  additional_notes: z.string().optional(),
})

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>

interface WorkOrderService {
  service_id: string
  quantity: number
  unit_price: number
  assigned_sidekick_id: string | null
  service_types: {
    name: string
  }
}

type EditWorkOrderFormProps = {
  workOrder: WorkOrder
  onSuccess?: () => void
}

export function EditWorkOrderForm({ workOrder, onSuccess }: EditWorkOrderFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders',
          filter: `id=eq.${workOrder.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["workOrderServices", workOrder.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workOrder.id, queryClient])

  // Fetch work order services and sidekick assignments
  const { data: workOrderServices = [] } = useQuery<WorkOrderService[]>({
    queryKey: ["workOrderServices", workOrder.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_order_services")
        .select(`
          service_id,
          quantity,
          unit_price,
          assigned_sidekick_id,
          service_types (
            name
          )
        `)
        .eq("work_order_id", workOrder.id)
      
      if (error) throw error
      
      return data.map(service => ({
        service_id: service.service_id,
        quantity: service.quantity,
        unit_price: service.unit_price,
        assigned_sidekick_id: service.assigned_sidekick_id,
        service_types: {
          name: service.service_types.name
        }
      }))
    }
  })

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      first_name: workOrder.first_name,
      last_name: workOrder.last_name,
      email: workOrder.email,
      phone_number: workOrder.phone_number,
      contact_preference: workOrder.contact_preference,
      address: workOrder.address || "",
      vehicle_make: workOrder.vehicle_make,
      vehicle_model: workOrder.vehicle_model,
      vehicle_year: workOrder.vehicle_year,
      vehicle_serial: workOrder.vehicle_serial,
      additional_notes: workOrder.additional_notes || "",
      service_items: workOrderServices?.map(service => ({
        service_id: service.service_id,
        service_name: service.service_types.name,
        quantity: service.quantity,
        unit_price: service.unit_price
      })) || [],
      sidekick_assignments: workOrderServices?.reduce((acc, service) => {
        if (service.assigned_sidekick_id) {
          acc[service.service_id] = service.assigned_sidekick_id
        }
        return acc
      }, {} as Record<string, string>) || {},
    },
  })

  // Update form values when workOrderServices changes
  useEffect(() => {
    if (workOrderServices) {
      form.setValue('service_items', workOrderServices.map(service => ({
        service_id: service.service_id,
        service_name: service.service_types.name,
        quantity: service.quantity,
        unit_price: service.unit_price
      })))

      const sidekickAssignments = workOrderServices.reduce((acc, service) => {
        if (service.assigned_sidekick_id) {
          acc[service.service_id] = service.assigned_sidekick_id
        }
        return acc
      }, {} as Record<string, string>)
      
      form.setValue('sidekick_assignments', sidekickAssignments)
    }
  }, [workOrderServices, form])

  const onSubmit = async (data: WorkOrderFormValues) => {
    try {
      // Update work order
      const { error: workOrderError } = await supabase
        .from("work_orders")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          contact_preference: data.contact_preference,
          address: data.address,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_serial: data.vehicle_serial,
          additional_notes: data.additional_notes,
        })
        .eq('id', workOrder.id)

      if (workOrderError) throw workOrderError

      // Delete existing services
      const { error: deleteError } = await supabase
        .from("work_order_services")
        .delete()
        .eq('work_order_id', workOrder.id)

      if (deleteError) throw deleteError

      // Insert updated services with sidekick assignments
      const { error: servicesError } = await supabase
        .from("work_order_services")
        .insert(
          data.service_items.map((item) => ({
            work_order_id: workOrder.id,
            service_id: item.service_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            assigned_sidekick_id: data.sidekick_assignments?.[item.service_id],
          }))
        )

      if (servicesError) throw servicesError

      toast({
        title: "Success",
        description: "Work order has been updated successfully.",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error updating work order:", error)
      toast({
        title: "Error",
        description: "There was an error updating your work order. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <CustomerInfoFields form={form} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            <VehicleInfoFields form={form} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Services</h3>
            <ServiceSelectionField form={form} />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Update Work Order
        </Button>
      </form>
    </Form>
  )
}