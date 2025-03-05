
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEstimateRequestsData = () => {
  const [loading, setLoading] = useState(false);

  const createTestEstimateRequest = async () => {
    setLoading(true);
    try {
      // First, check if we already have a test customer
      let customerId = null;
      const { data: existingCustomers } = await supabase
        .from("customers")
        .select("id")
        .limit(1);
      
      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        // Create a test customer if none exists
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            first_name: "Test",
            last_name: "Customer",
            email: "test@example.com",
            phone_number: "555-123-4567",
          })
          .select("id")
          .single();

        if (customerError) {
          console.error("Error creating test customer:", customerError);
          throw new Error("Failed to create test customer");
        }
        
        customerId = newCustomer.id;
      }

      // Now create a test estimate request
      const { data, error } = await supabase
        .from("estimate_requests")
        .insert({
          customer_id: customerId,
          vehicle_make: "Test",
          vehicle_model: "Vehicle",
          vehicle_year: new Date().getFullYear(),
          description: "This is a test estimate request",
          status: "pending",
          service_ids: [],
          service_details: { note: "Created for testing purposes" }
        })
        .select();

      if (error) {
        console.error("Error creating test estimate request:", error);
        throw new Error("Failed to create test estimate request");
      }

      toast.success("Test estimate request created successfully");
      return data;
    } catch (error) {
      console.error("Error in create test estimate request:", error);
      toast.error("Failed to create test data. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTestEstimateRequest
  };
};
