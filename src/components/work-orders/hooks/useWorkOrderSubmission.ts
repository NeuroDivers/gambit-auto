
import { WorkOrderFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export function useWorkOrderSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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

      navigate("/work-orders")
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
      start_time: values.start_time?.toISOString(),
      estimated_duration: values.estimated_duration ? `${values.estimated_duration} hours` : null,
      end_time: values.end_time?.toISOString(),
      assigned_bay_id: values.assigned_bay_id === "unassigned" ? null : values.assigned_bay_id,
      updated_at: new Date().toISOString()
    })
    .eq("id", workOrderId)

  if (workOrderError) throw workOrderError

  // Handle services update
  const { error: deleteError } = await supabase
    .from('work_order_services')
    .delete()
    .eq('work_order_id', workOrderId)

  if (deleteError) throw deleteError

  const validServices = values.service_items.filter(item => 
    item.service_id && 
    item.service_id.trim() !== "" && 
    item.service_name && 
    item.service_name.trim() !== ""
  );
  
  if (validServices.length > 0) {
    const servicesToInsert = validServices.map(item => ({
      work_order_id: workOrderId,
      service_id: item.service_id,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      commission_rate: item.commission_rate,
      commission_type: item.commission_type,
      assigned_profile_id: item.assigned_profile_id
    }))

    const { error: servicesError } = await supabase
      .from('work_order_services')
      .insert(servicesToInsert)

    if (servicesError) throw servicesError
  }
}

async function createWorkOrder(values: WorkOrderFormValues) {
  // Create work order
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
      assigned_bay_id: values.assigned_bay_id === "unassigned" ? null : values.assigned_bay_id,
      status: "pending"
    })
    .select()
    .single()

  if (workOrderError || !workOrder) throw workOrderError

  // Insert services
  const validServices = values.service_items.filter(item => 
    item.service_id && 
    item.service_id.trim() !== "" && 
    item.service_name && 
    item.service_name.trim() !== ""
  );
  
  if (validServices.length > 0) {
    const servicesToInsert = validServices.map(item => ({
      work_order_id: workOrder.id,
      service_id: item.service_id,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      commission_rate: item.commission_rate,
      commission_type: item.commission_type,
      assigned_profile_id: item.assigned_profile_id
    }))

    const { error: servicesError } = await supabase
      .from('work_order_services')
      .insert(servicesToInsert)

    if (servicesError) throw servicesError
  }
}
