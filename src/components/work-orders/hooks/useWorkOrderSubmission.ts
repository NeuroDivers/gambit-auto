
import { WorkOrderFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export function useWorkOrderSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitWorkOrder = async (values: WorkOrderFormValues, workOrderId?: string) => {
    try {
      console.log("Submitting work order with values:", values)
      console.log("Service items to submit:", values.service_items)
      
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
  console.log("Updating work order with values:", values)
  
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
      assigned_profile_id: values.assigned_profile_id === "unassigned" ? null : values.assigned_profile_id,
      updated_at: new Date().toISOString()
    })
    .eq("id", workOrderId)

  if (workOrderError) {
    console.error("Error updating work order:", workOrderError)
    throw workOrderError
  }

  // If a bay is assigned, update the bay's assigned profile
  if (values.assigned_bay_id && values.assigned_bay_id !== "unassigned") {
    const { error: bayError } = await supabase
      .from('service_bays')
      .update({ 
        assigned_profile_id: values.assigned_profile_id === "unassigned" ? null : values.assigned_profile_id 
      })
      .eq('id', values.assigned_bay_id)

    if (bayError) {
      console.error("Error updating service bay:", bayError)
      throw bayError
    }
  }

  // Handle services update
  console.log("Handling services update for work order:", workOrderId)
  console.log("Service items to process:", values.service_items)

  // First, delete existing services
  const { error: deleteError } = await supabase
    .from('work_order_services')
    .delete()
    .eq('work_order_id', workOrderId)

  if (deleteError) {
    console.error("Error deleting work order services:", deleteError)
    throw deleteError
  }

  // Then insert new services if there are any valid ones
  const validServices = values.service_items.filter(item => item.service_id && item.service_id.trim() !== "")
  
  if (validServices.length > 0) {
    const servicesToInsert = validServices.map(item => ({
      work_order_id: workOrderId,
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))

    console.log("Inserting new services:", servicesToInsert)

    const { error: servicesError } = await supabase
      .from('work_order_services')
      .insert(servicesToInsert)

    if (servicesError) {
      console.error("Error inserting work order services:", servicesError)
      throw servicesError
    }
  }
}

async function createWorkOrder(values: WorkOrderFormValues) {
  console.log("Creating work order with values:", values)
  
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
      assigned_profile_id: values.assigned_profile_id === "unassigned" ? null : values.assigned_profile_id,
      status: "pending"
    })
    .select()
    .single()

  if (workOrderError || !workOrder) {
    console.error("Error creating work order:", workOrderError)
    throw workOrderError
  }

  // If a bay is assigned, update the bay's assigned profile
  if (values.assigned_bay_id && values.assigned_bay_id !== "unassigned") {
    const { error: bayError } = await supabase
      .from('service_bays')
      .update({ 
        assigned_profile_id: values.assigned_profile_id === "unassigned" ? null : values.assigned_profile_id 
      })
      .eq('id', values.assigned_bay_id)

    if (bayError) {
      console.error("Error updating service bay:", bayError)
      throw bayError
    }
  }

  // Insert service items
  const validServices = values.service_items.filter(item => item.service_id && item.service_id.trim() !== "")
  
  if (validServices.length > 0) {
    console.log("Creating services for new work order:", validServices)
    
    const servicesToInsert = validServices.map(item => ({
      work_order_id: workOrder.id,
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))

    const { error: servicesError } = await supabase
      .from("work_order_services")
      .insert(servicesToInsert)

    if (servicesError) {
      console.error("Error inserting work order services:", servicesError)
      throw servicesError
    }

    console.log("Successfully inserted services for new work order")
  }
}
