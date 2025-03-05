
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEstimateRequestsData = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchEstimateRequests = async () => {
    setLoading(true);
    try {
      console.log("Fetching estimate requests data");
      
      // First check table info using our security definer function
      // We're passing the parameter as a string literal, not as a named parameter
      const { data: tableInfo, error: tableInfoError } = await supabase
        .rpc('get_table_info', { p_table_name: 'estimate_requests' });
      
      if (tableInfoError) {
        console.error("Error checking table info:", tableInfoError);
        throw tableInfoError;
      }
      
      console.log("Table info:", tableInfo);
      
      // Fetch all estimate requests with RLS now allowing access
      // Specify the exact relationship to use with the customers table
      const { data, error, count } = await supabase
        .from("estimate_requests")
        .select("*, customers!estimate_requests_customer_id_fkey(*)", { count: 'exact' })
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching estimate requests:", error);
        setDebugInfo({
          error: error,
          message: "Failed to fetch estimate requests",
          tableInfo,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
      
      console.log("Fetched estimate requests:", data?.length || 0, "records");
      
      // Prepare debug info to help troubleshoot
      setDebugInfo({
        recordCount: data?.length || 0,
        tableInfo,
        recordStats: data?.map(req => ({
          id: req.id,
          customerIdPresent: Boolean(req.customer_id),
          createdAt: req.created_at,
          status: req.status
        })) || [],
        timestamp: new Date().toISOString()
      });
      
      return {
        data,
        count,
        tableInfo
      };
    } catch (error) {
      console.error("Error in fetchEstimateRequests:", error);
      toast.error("Failed to fetch estimate requests");
      return {
        data: [],
        count: 0,
        error,
        tableInfo: null
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

      // Now create a test estimate request with our RPC function to bypass RLS
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
