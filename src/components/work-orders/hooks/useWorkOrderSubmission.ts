
import { supabase } from "@/integrations/supabase/client";
import { ServiceItemType, WorkOrderFormValues } from "../types";
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
        estimated_duration: formValues.estimated_duration,
        assigned_bay_id: formValues.assigned_bay_id,
        status: workOrderId ? undefined : "pending", // Only set status for new work orders
      };

      // Address fields if provided
      if (formValues.customer_address) {
        workOrderData["customer_address"] = formValues.customer_address;
      } else if (
        formValues.customer_street_address ||
        formValues.customer_city ||
        formValues.customer_state_province
      ) {
        const addressParts = [];
        
        if (formValues.customer_street_address) {
          let streetAddress = formValues.customer_street_address;
          if (formValues.customer_unit_number) {
            streetAddress = `${formValues.customer_unit_number} - ${streetAddress}`;
          }
          addressParts.push(streetAddress);
        }
        
        if (formValues.customer_city) addressParts.push(formValues.customer_city);
        
        if (formValues.customer_state_province) {
          let stateProvince = formValues.customer_state_province;
          if (formValues.customer_postal_code) {
            stateProvince = `${stateProvince} ${formValues.customer_postal_code}`;
          }
          addressParts.push(stateProvince);
        }
        
        if (formValues.customer_country) addressParts.push(formValues.customer_country);
        
        workOrderData["customer_address"] = addressParts.join(", ");
      }

      // Check for client ID
      if (formValues.client_id) {
        workOrderData["client_id"] = formValues.client_id;
      }

      // Create or update work order
      let workOrder;
      if (workOrderId) {
        // Update existing work order
        const { data, error } = await supabase
          .from("work_orders")
          .update(workOrderData)
          .eq("id", workOrderId)
          .select()
          .single();

        if (error) throw error;
        workOrder = data;
      } else {
        // Create new work order
        const { data, error } = await supabase
          .from("work_orders")
          .insert(workOrderData)
          .select()
          .single();

        if (error) throw error;
        workOrder = data;
      }

      // Delete existing services if updating
      if (workOrderId) {
        const { error: deleteError } = await supabase
          .from("work_order_services")
          .delete()
          .eq("work_order_id", workOrderId);

        if (deleteError) {
          console.error("Error deleting services:", deleteError);
          throw deleteError;
        }
      }

      // Add services
      if (formValues.service_items && formValues.service_items.length > 0) {
        // Process main services and sub-services
        const allServices = [];
        
        // First, add all main services
        formValues.service_items.forEach((service) => {
          allServices.push({
            work_order_id: workOrder.id,
            service_id: service.service_id,
            quantity: service.quantity,
            unit_price: service.unit_price,
            commission_rate: service.commission_rate,
            commission_type: service.commission_type,
            assigned_profile_id: service.assigned_profile_id,
          });
          
          // Then add all sub-services with reference to their parent
          if (service.sub_services && service.sub_services.length > 0) {
            service.sub_services.forEach((subService) => {
              allServices.push({
                work_order_id: workOrder.id,
                service_id: subService.service_id,
                quantity: subService.quantity,
                unit_price: subService.unit_price,
                commission_rate: subService.commission_rate,
                commission_type: subService.commission_type,
                assigned_profile_id: subService.assigned_profile_id,
                main_service_id: service.service_id,
                sub_service_id: subService.service_id,
              });
            });
          }
        });
        
        // Insert all services in one operation
        if (allServices.length > 0) {
          const { error: servicesError } = await supabase
            .from("work_order_services")
            .insert(allServices);
          
          if (servicesError) {
            console.error("Error adding services:", servicesError);
            throw servicesError;
          }
        }
      }

      // Save vehicle if requested
      if (formValues.save_vehicle && formValues.client_id) {
        try {
          const vehicleData = {
            customer_id: formValues.client_id,
            make: formValues.customer_vehicle_make,
            model: formValues.customer_vehicle_model,
            year: formValues.customer_vehicle_year,
            vin: formValues.customer_vehicle_vin || null,
            color: formValues.customer_vehicle_color || null,
            license_plate: formValues.customer_vehicle_license_plate || null,
            is_primary: formValues.is_primary_vehicle || false,
            body_class: formValues.customer_vehicle_body_class || null,
            doors: formValues.customer_vehicle_doors || null,
            trim: formValues.customer_vehicle_trim || null,
          };

          await supabase.from("vehicles").insert(vehicleData);
        } catch (error) {
          console.error("Error saving vehicle:", error);
          // Don't fail the work order creation if vehicle save fails
        }
      }

      // Invalidate the work orders query to update the list
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      
      return true;
    } catch (error: any) {
      console.error("Work order submission error:", error);
      toast.error(error.message || "Failed to save work order");
      return false;
    }
  };

  return { submitWorkOrder };
}
