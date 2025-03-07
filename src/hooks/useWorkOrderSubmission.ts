import { supabase } from "@/integrations/supabase/client";
import { ServiceItemType, WorkOrderFormValues } from "../components/work-orders/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useWorkOrderSubmission() {
  const queryClient = useQueryClient();

  const submitWorkOrder = async (
    formValues: WorkOrderFormValues,
    workOrderId?: string
  ) => {
    try {
      // Prepare work order data
      const workOrderData = {
        customer_first_name: formValues.customer_first_name,
        customer_last_name: formValues.customer_last_name,
        customer_email: formValues.customer_email,
        customer_phone: formValues.customer_phone,
        contact_preference: formValues.contact_preference,
        customer_vehicle_make: formValues.customer_vehicle_make,
        customer_vehicle_model: formValues.customer_vehicle_model,
        customer_vehicle_year: formValues.customer_vehicle_year,
        customer_vehicle_vin: formValues.customer_vehicle_vin,
        customer_vehicle_color: formValues.customer_vehicle_color,
        customer_vehicle_body_class: formValues.customer_vehicle_body_class,
        customer_vehicle_doors: formValues.customer_vehicle_doors,
        customer_vehicle_trim: formValues.customer_vehicle_trim,
        customer_vehicle_license_plate: formValues.customer_vehicle_license_plate,
        additional_notes: formValues.additional_notes,
        start_time: formValues.start_time ? formValues.start_time.toISOString() : null,
        end_time: formValues.end_time ? formValues.end_time.toISOString() : null,
        estimated_duration: formValues.estimated_duration !== null 
          ? Number(formValues.estimated_duration) 
          : null,
        assigned_bay_id: formValues.assigned_bay_id,
        status: workOrderId ? undefined : "pending", // Only set status for new work orders
      };

      // First check if the client exists
      let clientId = formValues.client_id;

      if (!clientId && formValues.customer_email) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('email', formValues.customer_email)
          .maybeSingle();
        
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          toast.error("Client not found. Please create a client.");
          return false;
        }
      }

      // Prepare mutation parameters
      const params: MutationParams = {
        clientId,
        customerInfo: {
          customer_first_name: formValues.customer_first_name,
          customer_last_name: formValues.customer_last_name,
          customer_email: formValues.customer_email,
          customer_phone: formValues.customer_phone,
          customer_address: formValues.customer_address || ''
        },
        vehicleInfo: {
          customer_vehicle_make: formValues.customer_vehicle_make || '',
          customer_vehicle_model: formValues.customer_vehicle_model || '',
          customer_vehicle_year: formValues.customer_vehicle_year || 0,
          customer_vehicle_vin: formValues.customer_vehicle_vin,
          customer_vehicle_color: formValues.customer_vehicle_color,
          customer_vehicle_body_class: formValues.customer_vehicle_body_class,
          customer_vehicle_doors: formValues.customer_vehicle_doors,
          customer_vehicle_trim: formValues.customer_vehicle_trim,
          customer_vehicle_license_plate: formValues.customer_vehicle_license_plate
        },
        scheduling: {
          start_time: workOrderData.start_time || '',
          end_time: workOrderData.end_time || '',
          estimated_duration: workOrderData.estimated_duration
        },
        details: {
          status: workOrderData.status,
          contact_preference: formValues.contact_preference,
          assigned_bay_id: workOrderData.assigned_bay_id,
          service_items: formValues.service_items.map(item => ({
            service_id: item.service_id,
            service_name: item.service_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            description: item.description,
            assigned_profile_id: item.assigned_profile_id,
            package_id: item.package_id
          })),
          additional_notes: formValues.additional_notes
        }
      };

      console.log("Prepared params for work order insertion:", params);

      // Create the work order
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .insert({
          client_id: params.clientId,
          customer_id: formValues.client_id,
          customer_first_name: params.customerInfo.customer_first_name,
          customer_last_name: params.customerInfo.customer_last_name,
          customer_email: params.customerInfo.customer_email,
          customer_phone: params.customerInfo.customer_phone,
          customer_address: params.customerInfo.customer_address,
          customer_vehicle_make: params.vehicleInfo.customer_vehicle_make,
          customer_vehicle_model: params.vehicleInfo.customer_vehicle_model,
          customer_vehicle_year: params.vehicleInfo.customer_vehicle_year,
          customer_vehicle_vin: params.vehicleInfo.customer_vehicle_vin,
          customer_vehicle_color: params.vehicleInfo.customer_vehicle_color,
          customer_vehicle_body_class: params.vehicleInfo.customer_vehicle_body_class,
          customer_vehicle_doors: params.vehicleInfo.customer_vehicle_doors,
          customer_vehicle_trim: params.vehicleInfo.customer_vehicle_trim,
          customer_vehicle_license_plate: params.vehicleInfo.customer_vehicle_license_plate,
          start_time: params.scheduling.start_time,
          end_time: params.scheduling.end_time,
          estimated_duration: params.scheduling.estimated_duration,
          status: params.details.status,
          contact_preference: params.details.contact_preference,
          assigned_bay_id: params.details.assigned_bay_id,
          additional_notes: params.details.additional_notes
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Work order created:", workOrder);

      // If work order was created successfully, add service items
      if (workOrder && params.details.service_items.length > 0) {
        const serviceItems = params.details.service_items.map(item => ({
          work_order_id: workOrder.id,
          ...item
        }));

        const { error: itemsError } = await supabase
          .from('work_order_items')
          .insert(serviceItems);

        if (itemsError) throw itemsError;
      }

      // Create vehicle record for the client if requested
      if (formValues.save_vehicle && params.clientId && 
          params.vehicleInfo.customer_vehicle_make && 
          params.vehicleInfo.customer_vehicle_model) {
        
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            customer_id: params.clientId,
            make: params.vehicleInfo.customer_vehicle_make,
            model: params.vehicleInfo.customer_vehicle_model,
            year: params.vehicleInfo.customer_vehicle_year,
            vin: params.vehicleInfo.customer_vehicle_vin,
            color: params.vehicleInfo.customer_vehicle_color,
            body_class: params.vehicleInfo.customer_vehicle_body_class,
            doors: params.vehicleInfo.customer_vehicle_doors,
            trim: params.vehicleInfo.customer_vehicle_trim,
            license_plate: params.vehicleInfo.customer_vehicle_license_plate,
            is_primary: formValues.is_primary_vehicle || false
          });

        if (vehicleError) {
          console.error('Error creating vehicle:', vehicleError);
          // Continue execution despite vehicle creation error
        }
      }

      if (workOrder) {
        queryClient.invalidateQueries(['work-orders']);
        toast.success("Work order saved successfully.");
      }

      return workOrder;
    } catch (error: any) {
      console.error("Work order submission error:", error);
      toast.error(error.message || "Failed to save work order");
      return false;
    }
  };

  return { submitWorkOrder };
}
