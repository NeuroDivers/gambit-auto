
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEstimateRequestsData = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchEstimateRequests = async () => {
    setLoading(true);
    try {
      console.log("Checking if estimate_requests table exists and contains data");
      
      // First try to get metadata about the table
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'estimate_requests' });
      
      if (tableError) {
        console.error("Error checking table info:", tableError);
        setDebugInfo({
          error: tableError,
          message: "Failed to get table information",
          timestamp: new Date().toISOString()
        });
        throw new Error("Failed to verify estimate_requests table");
      }
      
      console.log("Table info:", tableInfo);
      setDebugInfo({ tableInfo, timestamp: new Date().toISOString() });
      
      // Fetch all estimate requests with RLS bypass
      const { data, error, count } = await supabase
        .from("estimate_requests")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching estimate requests:", error);
        throw error;
      }
      
      return {
        data,
        count,
        tableInfo
      };
    } catch (error) {
      console.error("Error in fetchEstimateRequests:", error);
      toast.error("Failed to fetch estimate requests. RLS policy may be blocking access.");
      return {
        data: [],
        count: 0,
        error
      };
    } finally {
      setLoading(false);
    }
  };

  const createTestEstimateRequest = async () => {
    setLoading(true);
    try {
      // First, check if we already have a test customer
      let customerId = null;
      const { data: existingCustomers, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .limit(1);
      
      if (customerError) {
        console.error("Error finding customers:", customerError);
        // Try to create a customer even if query failed
      }
      
      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        // Create a test customer if none exists
        const { data: newCustomer, error: createCustomerError } = await supabase
          .from("customers")
          .insert({
            first_name: "Test",
            last_name: "Customer",
            email: `test${Date.now()}@example.com`, // Ensure unique email
            phone_number: "555-123-4567",
          })
          .select("id")
          .single();

        if (createCustomerError) {
          console.error("Error creating test customer:", createCustomerError);
          throw new Error("Failed to create test customer: " + createCustomerError.message);
        }
        
        customerId = newCustomer.id;
      }

      // Now create a test estimate request with the service_rls policy enabled
      const { data, error } = await supabase.rpc('create_estimate_request', {
        p_customer_id: customerId,
        p_vehicle_make: "Test",
        p_vehicle_model: "Vehicle",
        p_vehicle_year: new Date().getFullYear(),
        p_description: "This is a test estimate request",
        p_service_details: { note: "Created for testing purposes" }
      });

      if (error) {
        console.error("Error creating test estimate request:", error);
        throw new Error("Failed to create test estimate request: " + error.message);
      }

      toast.success("Test estimate request created successfully");
      return data;
    } catch (error) {
      console.error("Error in create test estimate request:", error);
      toast.error("Failed to create test data: " + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    debugInfo,
    createTestEstimateRequest,
    fetchEstimateRequests
  };
};
