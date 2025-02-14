
import { WorkOrderFormValues } from "../../types"
import { supabase } from "@/integrations/supabase/client"

async function ensureClientExists(values: WorkOrderFormValues) {
  // First check if client exists
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("email", values.email)
    .maybeSingle()

  if (!existingClient) {
    // Create new client if doesn't exist
    const { error: clientError } = await supabase
      .from("clients")
      .insert({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        address: values.address
      })

    if (clientError) {
      console.error("Error creating client:", clientError)
      throw clientError
    }
  }
}

export async function createWorkOrder(values: WorkOrderFormValues) {
  console.log("Creating work order with values:", values)
  
  // Ensure client exists before creating work order
  await ensureClientExists(values)

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

  await updateAssignedBay(values)
  await insertWorkOrderServices(values.service_items, workOrder.id)

  return workOrder
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

async function insertWorkOrderServices(serviceItems: WorkOrderFormValues["service_items"], workOrderId: string) {
  if (serviceItems && serviceItems.length > 0) {
    const validServices = serviceItems.filter(item => 
      item.service_id && 
      item.service_id !== "" && 
      item.service_id !== "unassigned"
    )

    if (validServices.length > 0) {
      console.log("Creating services for new work order:", validServices)
      
      const servicesToInsert = validServices.map(item => ({
        work_order_id: workOrderId,
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
    }
  }
}
