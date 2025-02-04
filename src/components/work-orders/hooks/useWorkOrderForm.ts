import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { WorkOrder, WorkOrderFormValues } from "../types"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  contact_preference: z.enum(["phone", "email"]),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_serial: z.string().min(1, "Vehicle serial number is required"),
  additional_notes: z.string().optional(),
  address: z.string().optional(),
  scheduled_date: z.date().nullable().optional(),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number(),
    unit_price: z.number()
  }))
})

export function useWorkOrderForm(workOrder?: WorkOrder, onSuccess?: () => void) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: workOrder ? {
      first_name: workOrder.first_name,
      last_name: workOrder.last_name,
      email: workOrder.email,
      phone_number: workOrder.phone_number,
      contact_preference: workOrder.contact_preference,
      vehicle_make: workOrder.vehicle_make,
      vehicle_model: workOrder.vehicle_model,
      vehicle_year: workOrder.vehicle_year,
      vehicle_serial: workOrder.vehicle_serial,
      additional_notes: workOrder.additional_notes,
      address: workOrder.address,
      scheduled_date: workOrder.scheduled_date ? new Date(workOrder.scheduled_date) : null,
      service_items: []
    } : {
      contact_preference: "phone",
      service_items: []
    }
  })

  const onSubmit = async (values: WorkOrderFormValues) => {
    console.log("Submitting form with values:", values)
    try {
      if (workOrder) {
        // Update work order
        const { error: workOrderError } = await supabase
          .from("work_orders")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone_number: values.phone_number,
            contact_preference: values.contact_preference,
            vehicle_make: values.vehicle_make,
            vehicle_model: values.vehicle_model,
            vehicle_year: values.vehicle_year,
            vehicle_serial: values.vehicle_serial,
            additional_notes: values.additional_notes,
            address: values.address,
            scheduled_date: values.scheduled_date?.toISOString()
          })
          .eq("id", workOrder.id)

        if (workOrderError) throw workOrderError

        // Update service items
        if (values.service_items.length > 0) {
          // Delete existing services
          const { error: deleteError } = await supabase
            .from("work_order_services")
            .delete()
            .eq("work_order_id", workOrder.id)

          if (deleteError) throw deleteError

          // Insert new services
          const { error: servicesError } = await supabase
            .from("work_order_services")
            .insert(
              values.service_items.map(item => ({
                work_order_id: workOrder.id,
                service_id: item.service_id,
                quantity: item.quantity,
                unit_price: item.unit_price
              }))
            )

          if (servicesError) throw servicesError
        }

        toast({
          title: "Success",
          description: "Work order updated successfully",
        })
      } else {
        // Insert new work order
        const { data: workOrder, error: workOrderError } = await supabase
          .from("work_orders")
          .insert({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone_number: values.phone_number,
            contact_preference: values.contact_preference,
            vehicle_make: values.vehicle_make,
            vehicle_model: values.vehicle_model,
            vehicle_year: values.vehicle_year,
            vehicle_serial: values.vehicle_serial,
            additional_notes: values.additional_notes,
            address: values.address,
            scheduled_date: values.scheduled_date?.toISOString(),
            status: "pending"
          })
          .select()
          .single()

        if (workOrderError) throw workOrderError

        // Insert service items
        if (values.service_items.length > 0) {
          const { error: servicesError } = await supabase
            .from("work_order_services")
            .insert(
              values.service_items.map(item => ({
                work_order_id: workOrder.id,
                service_id: item.service_id,
                quantity: item.quantity,
                unit_price: item.unit_price
              }))
            )

          if (servicesError) throw servicesError
        }

        toast({
          title: "Success",
          description: "Work order created successfully",
        })

        // Reset form
        form.reset()
      }
      
      // Refresh work orders list
      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      
      // Call success callback
      onSuccess?.()
    } catch (error: any) {
      console.error("Error saving work order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save work order",
      })
    }
  }

  return {
    form,
    onSubmit
  }
}