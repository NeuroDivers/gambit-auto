import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { WorkOrderFormValues } from "../types";

interface UseWorkOrderSubmissionProps {
  workOrderId?: string;
  onSuccess?: () => void;
}

export function useWorkOrderSubmission({ workOrderId, onSuccess }: UseWorkOrderSubmissionProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formatDateToISOString = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue.toISOString();
    try {
      // Try to convert string to Date
      return new Date(dateValue).toISOString();
    } catch (e) {
      console.error("Invalid date value:", dateValue);
      return null;
    }
  };

  const toISOStringOrNull = (dateValue: Date | string | null): string | null => {
    if (!dateValue) return null;
    return dateValue instanceof Date ? dateValue.toISOString() : dateValue;
  };

  const submitWorkOrder = async (data: WorkOrderFormValues) => {
    try {
      setIsSubmitting(true);

      // Check if vehicle exists or needs to be created
      let vehicleId = data.vehicle_id;
      
      if (!vehicleId && data.vehicle_make && data.vehicle_model) {
        // Create vehicle if it doesn't exist
        const { data: vehicleData, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            customer_id: data.customer_id,
            make: data.vehicle_make,
            model: data.vehicle_model,
            year: data.vehicle_year,
            vin: data.vehicle_serial,
            // Additional fields as needed
          })
          .select("id")
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = vehicleData.id;
      }

      // Format dates for submission
      const start_time = toISOStringOrNull(data.start_time);
      const end_time = toISOStringOrNull(data.end_time);

      // Create work order payload
      const workOrderPayload = {
        customer_id: data.customer_id,
        vehicle_id: vehicleId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        contact_preference: data.contact_preference,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year,
        vehicle_serial: data.vehicle_serial,
        additional_notes: data.additional_notes,
        street_address: data.street_address,
        unit_number: data.unit_number,
        city: data.city,
        state_province: data.state_province,
        postal_code: data.postal_code,
        country: data.country,
        start_time: start_time,
        estimated_duration: data.estimated_duration ? Number(data.estimated_duration) : null,
        end_time: end_time,
        assigned_bay_id: data.assigned_bay_id || data.bay_id || null,
        status: data.status || "scheduled",
        // Set or update timestamps
        updated_at: new Date().toISOString(),
      };

      if (workOrderId) {
        // Update existing work order
        const { error } = await supabase
          .from("work_orders")
          .update(workOrderPayload)
          .eq("id", workOrderId);

        if (error) throw error;

        // Update service items
        if (data.service_items && data.service_items.length > 0) {
          // Delete existing service items
          const { error: deleteError } = await supabase
            .from("work_order_services")
            .delete()
            .eq("work_order_id", workOrderId);

          if (deleteError) throw deleteError;

          // Insert updated service items
          await insertServiceItems(workOrderId, data.service_items);
        }

        toast.success("Work order updated successfully");
      } else {
        // Create new work order
        const { data: newWorkOrder, error } = await supabase
          .from("work_orders")
          .insert({
            ...workOrderPayload,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) throw error;

        // Insert service items for new work order
        if (data.service_items && data.service_items.length > 0 && newWorkOrder) {
          await insertServiceItems(newWorkOrder.id, data.service_items);
        }

        toast.success("Work order created successfully");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      // Call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/work-orders");
      }
    } catch (error) {
      console.error("Error submitting work order:", error);
      toast.error("Failed to save work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to insert service items
  const insertServiceItems = async (workOrderId: string, serviceItems: any[]) => {
    const { error } = await supabase
      .from("work_order_services")
      .insert(
        serviceItems.map(item => ({
          work_order_id: workOrderId,
          service_id: item.service_id,
          service_name: item.service_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          description: item.description,
          commission_rate: item.commission_rate,
          commission_type: item.commission_type,
          assigned_profile_id: item.assigned_profile_id,
          // Handle nested fields
          main_service_id: item.parent_id || null,
          sub_service_id: item.is_sub_service ? item.service_id : null,
        }))
      );

    if (error) throw error;
  };

  return {
    submitWorkOrder,
    isSubmitting,
  };
}
