
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ServiceItemType } from "@/types/service-item";
import { useForm } from "react-hook-form";
import { WorkOrderFormValues, WorkOrder } from "../types";

export function useWorkOrderForm(
  workOrder?: WorkOrder,
  onSuccess?: () => void,
  defaultStartTime?: Date
) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Initialize form with default values or workOrder data
  const form = useForm<WorkOrderFormValues>({
    defaultValues: workOrder ? {
      // Populate form fields from workOrder
      first_name: workOrder.first_name || "",
      last_name: workOrder.last_name || "",
      email: workOrder.email || "",
      phone_number: workOrder.phone_number || "",
      contact_preference: workOrder.contact_preference as "phone" | "email" || "phone",
      vehicle_make: workOrder.vehicle_make || "",
      vehicle_model: workOrder.vehicle_model || "",
      vehicle_year: workOrder.vehicle_year || new Date().getFullYear(),
      vehicle_serial: workOrder.vehicle_serial || "",
      additional_notes: workOrder.additional_notes || "",
      client_id: workOrder.client_id || undefined,
      start_time: workOrder.start_time ? new Date(workOrder.start_time) : null,
      end_time: workOrder.end_time ? new Date(workOrder.end_time) : null,
      estimated_duration: typeof workOrder.estimated_duration === 'string' 
        ? parseInt(workOrder.estimated_duration)
        : workOrder.estimated_duration || null,
      assigned_bay_id: workOrder.assigned_bay_id || null,
      service_items: workOrder.service_items || []
    } : {
      // Default values for a new work order
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      contact_preference: "phone",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_serial: "",
      additional_notes: "",
      client_id: undefined,
      start_time: defaultStartTime || null,
      end_time: null,
      estimated_duration: null,
      assigned_bay_id: null,
      service_items: []
    }
  });

  const onSubmit = async (data: WorkOrderFormValues) => {
    try {
      // Process form submission
      console.log("Submitting work order:", data);
      
      // Handle work order creation/update logic here
      let vehicleId = null;
      
      // Create or update vehicle if needed
      if (data.vehicle_make && data.vehicle_model) {
        const existingVehicleId = workOrder?.vehicle_id;
        
        if (existingVehicleId) {
          // Update existing vehicle
          const { error: vehicleError } = await supabase
            .from("vehicles")
            .update({
              make: data.vehicle_make,
              model: data.vehicle_model,
              year: data.vehicle_year,
              vin: data.vehicle_serial,
              // Add other vehicle fields as needed
            })
            .eq("id", existingVehicleId);
            
          if (vehicleError) throw vehicleError;
          vehicleId = existingVehicleId;
        } else {
          // Create new vehicle
          const { data: vehicleData, error: vehicleError } = await supabase
            .from("vehicles")
            .insert({
              customer_id: data.client_id,
              make: data.vehicle_make,
              model: data.vehicle_model,
              year: data.vehicle_year,
              vin: data.vehicle_serial,
              // Add other vehicle fields as needed
            })
            .select()
            .single();
            
          if (vehicleError) throw vehicleError;
          vehicleId = vehicleData.id;
        }
      }
      
      // Format dates for database
      const startTime = data.start_time ? new Date(data.start_time).toISOString() : null;
      const endTime = data.end_time ? new Date(data.end_time).toISOString() : null;
      
      // Create or update work order
      if (workOrder?.id) {
        // Update existing work order
        const { error } = await supabase
          .from("work_orders")
          .update({
            client_id: data.client_id,
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
            start_time: startTime,
            end_time: endTime,
            estimated_duration: data.estimated_duration,
            assigned_bay_id: data.assigned_bay_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workOrder.id);
          
        if (error) throw error;
        
        // Update service items
        if (data.service_items && data.service_items.length > 0) {
          // Delete existing service items
          const { error: deleteError } = await supabase
            .from("work_order_services")
            .delete()
            .eq("work_order_id", workOrder.id);
            
          if (deleteError) throw deleteError;
          
          // Insert new service items
          const { error: servicesError } = await supabase
            .from("work_order_services")
            .insert(
              data.service_items.map(item => ({
                work_order_id: workOrder.id,
                service_id: item.service_id,
                service_name: item.service_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                commission_rate: item.commission_rate,
                commission_type: item.commission_type,
                description: item.description,
                assigned_profile_id: item.assigned_profile_id,
              }))
            );
            
          if (servicesError) throw servicesError;
        }
      } else {
        // Create new work order
        const { data: newWorkOrder, error } = await supabase
          .from("work_orders")
          .insert({
            client_id: data.client_id,
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
            start_time: startTime,
            end_time: endTime,
            estimated_duration: data.estimated_duration,
            assigned_bay_id: data.assigned_bay_id,
            status: "scheduled",
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Insert service items
        if (data.service_items && data.service_items.length > 0 && newWorkOrder) {
          const { error: servicesError } = await supabase
            .from("work_order_services")
            .insert(
              data.service_items.map(item => ({
                work_order_id: newWorkOrder.id,
                service_id: item.service_id,
                service_name: item.service_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                commission_rate: item.commission_rate,
                commission_type: item.commission_type,
                description: item.description,
                assigned_profile_id: item.assigned_profile_id,
              }))
            );
            
          if (servicesError) throw servicesError;
        }
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving work order:", error);
      toast({
        title: "Error",
        description: "Failed to save work order",
        variant: "destructive",
      });
    }
  };

  return { form, onSubmit };
}
