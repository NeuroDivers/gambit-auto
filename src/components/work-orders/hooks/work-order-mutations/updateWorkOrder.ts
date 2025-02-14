
import { WorkOrderFormValues } from "../../types"
import { supabase } from "@/integrations/supabase/client"

export async function updateWorkOrder(workOrderId: string, values: WorkOrderFormValues) {
  console.log("Updating work order with values:", values)
  
  await updateWorkOrderDetails(workOrderId, values)
  await updateAssignedBay(values)
  await updateWorkOrderServices(workOrderId, values.service_items)
}

async function updateWorkOrderDetails(workOrderId: string, values: WorkOrderFormValues) {
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
}

async function updateAssignedBay(values: WorkOrderFormValues) {
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
}

async function updateWorkOrderServices(workOrderId: string, serviceItems: WorkOrderFormValues["service_items"]) {
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
  if (serviceItems && serviceItems.length > 0) {
    const validServices = serviceItems.filter(item => 
      item.service_id && 
      item.service_id !== "" && 
      item.service_id !== "unassigned"
    )

    if (validServices.length > 0) {
      const servicesToInsert = validServices.map(item => ({
        work_order_id: workOrderId,
        service_id: item.service_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      const { error: servicesError } = await supabase
        .from('work_order_services')
        .insert(servicesToInsert)
        .select()

      if (servicesError) {
        console.error("Error inserting work order services:", servicesError)
        throw servicesError
      }
    }
  }
}
