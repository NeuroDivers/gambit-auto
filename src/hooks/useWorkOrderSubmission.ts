
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ServiceItemType, WorkOrderFormValues } from "@/components/work-orders/types";

export const useWorkOrderSubmission = (
  onSuccess?: () => void,
  workOrderId?: string
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createWorkOrderServices = async (
    workOrderId: string,
    services: ServiceItemType[]
  ) => {
    try {
      // If updating, delete existing services first
      if (workOrderId) {
        await supabase
          .from("work_order_services")
          .delete()
          .eq("work_order_id", workOrderId);
      }

      // Prepare service items for insertion
      const serviceItems = services.map((service) => ({
        work_order_id: workOrderId,
        service_id: service.service_id,
        quantity: service.quantity,
        unit_price: service.unit_price,
        commission_rate: service.commission_rate || 0,
        commission_type: service.commission_type || "percentage",
        assigned_profile_id: service.assigned_profile_id || null,
        package_id: service.package_id || null
      }));

      // Insert all service items
      const { error } = await supabase
        .from("work_order_services")
        .insert(serviceItems);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error adding services:", error);
      throw error;
    }
  };

  const workOrderMutation = useMutation({
    mutationFn: async (data: WorkOrderFormValues) => {
      setIsSubmitting(true);
      try {
        const {
          contact_preference,
          client_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          start_time,
          estimated_duration,
          end_time,
          assigned_bay_id,
          service_items,
          additional_notes,
          customer_vehicle_make,
          customer_vehicle_model,
          customer_vehicle_year,
          customer_vehicle_vin,
          customer_vehicle_license_plate,
          customer_vehicle_color,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_vin,
          vehicle_color,
          vehicle_trim,
          vehicle_body_class,
          vehicle_doors,
          save_vehicle,
          is_primary_vehicle,
        } = data;

        // First, create or update the work order
        const workOrderData = {
          contact_preference,
          client_id: client_id || null,
          customer_first_name: first_name,
          customer_last_name: last_name,
          customer_email: email,
          customer_phone: phone,
          customer_address: address,
          start_time: start_time ? start_time.toISOString() : null,
          estimated_duration,
          end_time: end_time ? end_time.toISOString() : null,
          assigned_bay_id,
          additional_notes,
          customer_vehicle_make,
          customer_vehicle_model,
          customer_vehicle_year,
          customer_vehicle_vin,
          customer_vehicle_license_plate,
          customer_vehicle_color,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_vin,
          vehicle_color,
          vehicle_trim,
          vehicle_body_class,
          vehicle_doors,
          status: workOrderId ? undefined : "pending", // Only set status on create
        };

        let savedWorkOrderId = workOrderId;

        if (workOrderId) {
          // Update existing work order
          const { error } = await supabase
            .from("work_orders")
            .update(workOrderData)
            .eq("id", workOrderId);

          if (error) throw error;
        } else {
          // Create new work order
          const { data: createdWorkOrder, error } = await supabase
            .from("work_orders")
            .insert(workOrderData)
            .select("id")
            .single();

          if (error) throw error;
          savedWorkOrderId = createdWorkOrder.id;
        }

        if (!savedWorkOrderId) {
          throw new Error("Failed to get work order ID");
        }

        // Create work order services
        await createWorkOrderServices(savedWorkOrderId, service_items);

        // If save_vehicle is true, save the vehicle info
        if (save_vehicle && client_id) {
          const vehicleData = {
            client_id,
            make: customer_vehicle_make,
            model: customer_vehicle_model,
            year: customer_vehicle_year,
            vin: customer_vehicle_vin,
            license_plate: customer_vehicle_license_plate,
            color: customer_vehicle_color,
            is_primary: is_primary_vehicle || false,
          };

          const { error: vehicleError } = await supabase
            .from("vehicles")
            .insert(vehicleData);

          if (vehicleError) {
            console.error("Error saving vehicle:", vehicleError);
            // Don't throw here, as the work order was already created
          }
        }

        return savedWorkOrderId;
      } catch (error) {
        console.error("Work order submission error:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (workOrderId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });

      toast.success(
        workOrderId ? "Work order updated successfully" : "Work order created successfully"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to the work order details page
        navigate(`/work-orders/${workOrderId}`);
      }
    },
    onError: (error: any) => {
      toast.error(
        `Failed to ${workOrderId ? "update" : "create"} work order: ${
          error.message
        }`
      );
    },
  });

  return {
    submitWorkOrder: workOrderMutation.mutate,
    isSubmitting: isSubmitting || workOrderMutation.isPending,
  };
};
