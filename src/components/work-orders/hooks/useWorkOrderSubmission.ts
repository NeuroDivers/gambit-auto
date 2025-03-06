
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
      customer_first_name: values.customer_first_name,
      customer_last_name: values.customer_last_name,
      customer_email: values.customer_email,
      customer_phone: values.customer_phone,
      contact_preference: values.contact_preference,
      customer_vehicle_make: values.customer_vehicle_make,
      customer_vehicle_model: values.customer_vehicle_model,
      customer_vehicle_year: values.customer_vehicle_year,
      customer_vehicle_vin: values.customer_vehicle_vin,
      customer_vehicle_color: values.customer_vehicle_color,
      customer_vehicle_body_class: values.customer_vehicle_body_class,
      customer_vehicle_doors: values.customer_vehicle_doors,
      customer_vehicle_trim: values.customer_vehicle_trim,
      customer_vehicle_license_plate: values.customer_vehicle_license_plate,
      additional_notes: values.additional_notes,
      customer_address: values.customer_address,
      customer_street_address: values.customer_street_address,
      customer_unit_number: values.customer_unit_number,
      customer_city: values.customer_city,
      customer_state_province: values.customer_state_province,
      customer_postal_code: values.customer_postal_code,
      customer_country: values.customer_country,
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

  // Process main services
  const validServices = values.service_items.filter(item => 
    item.service_id && 
    item.service_id.trim() !== "" && 
    item.service_name && 
    item.service_name.trim() !== ""
  );
  
  if (validServices.length > 0) {
    const servicesToInsert = [];
    
    // Add main services
    for (const item of validServices) {
      servicesToInsert.push({
        work_order_id: workOrderId,
        service_id: item.service_id,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        commission_rate: item.commission_rate,
        commission_type: item.commission_type,
        assigned_profile_id: item.assigned_profile_id
      });
      
      // Add sub-services if they exist
      if (item.sub_services && item.sub_services.length > 0) {
        for (const subItem of item.sub_services) {
          servicesToInsert.push({
            work_order_id: workOrderId,
            service_id: subItem.service_id,
            quantity: subItem.quantity || 1,
            unit_price: subItem.unit_price || 0,
            commission_rate: subItem.commission_rate,
            commission_type: subItem.commission_type,
            assigned_profile_id: subItem.assigned_profile_id,
            main_service_id: item.service_id,
            sub_service_id: subItem.service_id
          });
        }
      }
    }

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
      customer_first_name: values.customer_first_name,
      customer_last_name: values.customer_last_name,
      customer_email: values.customer_email,
      customer_phone: values.customer_phone,
      contact_preference: values.contact_preference,
      customer_vehicle_make: values.customer_vehicle_make,
      customer_vehicle_model: values.customer_vehicle_model,
      customer_vehicle_year: values.customer_vehicle_year,
      customer_vehicle_vin: values.customer_vehicle_vin,
      customer_vehicle_color: values.customer_vehicle_color,
      customer_vehicle_body_class: values.customer_vehicle_body_class,
      customer_vehicle_doors: values.customer_vehicle_doors,
      customer_vehicle_trim: values.customer_vehicle_trim,
      customer_vehicle_license_plate: values.customer_vehicle_license_plate,
      additional_notes: values.additional_notes,
      customer_address: values.customer_address,
      customer_street_address: values.customer_street_address,
      customer_unit_number: values.customer_unit_number,
      customer_city: values.customer_city,
      customer_state_province: values.customer_state_province,
      customer_postal_code: values.customer_postal_code,
      customer_country: values.customer_country,
      start_time: values.start_time?.toISOString(),
      estimated_duration: values.estimated_duration ? `${values.estimated_duration} hours` : null,
      end_time: values.end_time?.toISOString(),
      assigned_bay_id: values.assigned_bay_id === "unassigned" ? null : values.assigned_bay_id,
      status: "pending"
    })
    .select()
    .single()

  if (workOrderError || !workOrder) throw workOrderError

  // Process main services
  const validServices = values.service_items.filter(item => 
    item.service_id && 
    item.service_id.trim() !== "" && 
    item.service_name && 
    item.service_name.trim() !== ""
  );
  
  if (validServices.length > 0) {
    const servicesToInsert = [];
    
    // Add main services
    for (const item of validServices) {
      servicesToInsert.push({
        work_order_id: workOrder.id,
        service_id: item.service_id,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        commission_rate: item.commission_rate,
        commission_type: item.commission_type,
        assigned_profile_id: item.assigned_profile_id
      });
      
      // Add sub-services if they exist
      if (item.sub_services && item.sub_services.length > 0) {
        for (const subItem of item.sub_services) {
          servicesToInsert.push({
            work_order_id: workOrder.id,
            service_id: subItem.service_id,
            quantity: subItem.quantity || 1,
            unit_price: subItem.unit_price || 0,
            commission_rate: subItem.commission_rate,
            commission_type: subItem.commission_type,
            assigned_profile_id: subItem.assigned_profile_id,
            main_service_id: item.service_id,
            sub_service_id: subItem.service_id
          });
        }
      }
    }

    const { error: servicesError } = await supabase
      .from('work_order_services')
      .insert(servicesToInsert)

    if (servicesError) throw servicesError
  }
  
  // Save vehicle to customer's account if requested
  if (values.save_vehicle && values.client_id) {
    try {
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          customer_id: values.client_id,
          make: values.vehicle_make,
          model: values.vehicle_model,
          year: values.vehicle_year,
          vin: values.vehicle_vin || null,
          color: values.vehicle_color || null,
          body_class: values.vehicle_body_class || null,
          doors: values.vehicle_doors || null,
          trim: values.vehicle_trim || null,
          license_plate: values.vehicle_license_plate || null,
          is_primary: values.is_primary_vehicle || false
        });
      
      if (vehicleError) {
        console.error('Error saving vehicle:', vehicleError);
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  }
}
