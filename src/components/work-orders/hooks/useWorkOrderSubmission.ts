import { WorkOrderFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export function useWorkOrderSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitWorkOrder = async (values: WorkOrderFormValues, workOrderId?: string) => {
    try {
      if (workOrderId) {
        await updateWorkOrder(workOrderId, values)
      } else {
        await createWorkOrder(values)
      }

      await queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] })
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      
      toast({
        title: "Success",
        description: workOrderId ? "Work order updated successfully" : "Work order created successfully",
      })

      return true
    } catch (error: any) {
      console.error("Error saving work order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save work order",
      })
      return false
    }
  }

  return { submitWorkOrder }
}

async function updateWorkOrder(workOrderId: string, values: WorkOrderFormValues) {
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
      start_time: values.start_time?.toISOString(),
      estimated_duration: values.estimated_duration ? `${values.estimated_duration} hours` : null,
      end_time: values.end_time?.toISOString(),
      assigned_bay_id: values.assigned_bay_id,
      updated_at: new Date().toISOString()
    })
    .eq("id", workOrderId)

  if (workOrderError) throw workOrderError

  // Update work order services
  // First, delete existing services
  const { error: deleteError } = await supabase
    .from('work_order_services')
    .delete()
    .eq('work_order_id', workOrderId)

  if (deleteError) throw deleteError

  // Then insert new services
  if (values.service_items.length > 0) {
    const { error: servicesError } = await supabase
      .from('work_order_services')
      .insert(
        values.service_items.map(item => ({
          work_order_id: workOrderId,
          service_id: item.service_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      )

    if (servicesError) throw servicesError
  }
}

async function createWorkOrder(values: WorkOrderFormValues) {
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
      start_time: values.start_time?.toISOString(),
      estimated_duration: values.estimated_duration ? `${values.estimated_duration} hours` : null,
      end_time: values.end_time?.toISOString(),
      assigned_bay_id: values.assigned_bay_id,
      status: "pending"
    })
    .select()
    .single()

  if (workOrderError || !workOrder) throw workOrderError

  // Insert service items only for new work orders
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
}