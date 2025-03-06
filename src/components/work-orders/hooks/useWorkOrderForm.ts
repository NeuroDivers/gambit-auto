import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ServiceItemType } from "@/types/service-item";
import { convertServiceItemForWorkOrder } from "../utils/serviceItemConverters";

export function useWorkOrderForm(workOrderId?: string) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customer, setCustomer] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({
    id: null,
    year: "",
    make: "",
    model: "",
    vin: "",
    license_plate: "",
    color: "",
  });
  const [scheduleInfo, setScheduleInfo] = useState({
    date: new Date(),
    start_time: "09:00",
    end_time: "10:00",
  });
  const [bayId, setBayId] = useState(null);
  const [notes, setNotes] = useState("");
  const [services, setServices] = useState<ServiceItemType[]>([]);
  
  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderData();
    }
  }, [workOrderId]);
  
  const fetchWorkOrderData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          customer:customer_id(*),
          vehicle:vehicle_id(*),
          service_items:work_order_services(*),
          service_bay:bay_id(*)
        `)
        .eq("id", workOrderId)
        .single();
        
      if (error) throw error;
      
      setCustomer(data.customer);
      setVehicleInfo({
        id: data.vehicle.id,
        year: data.vehicle.year,
        make: data.vehicle.make,
        model: data.vehicle.model,
        vin: data.vehicle.vin,
        license_plate: data.vehicle.license_plate,
        color: data.vehicle.color,
      });
      
      const workOrderDate = new Date(data.scheduled_date);
      const startTime = data.start_time.substring(0, 5);
      const endTime = data.end_time.substring(0, 5);
      
      setScheduleInfo({
        date: workOrderDate,
        start_time: startTime,
        end_time: endTime,
      });
      
      setBayId(data.bay_id);
      setNotes(data.notes || "");
      
      const formattedServices = data.service_items.map(item => ({
        service_id: item.service_id,
        service_name: item.service_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        commission_rate: item.commission_rate,
        commission_type: item.commission_type,
        description: item.description || "",
        assigned_profile_id: item.assigned_profile_id,
      }));
      
      setServices(formattedServices);
    } catch (error) {
      console.error("Error fetching work order:", error);
      toast({
        title: "Error",
        description: "Failed to load work order data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!customer) {
      toast({
        title: "Validation Error",
        description: "Customer information is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!vehicleInfo.make || !vehicleInfo.model) {
      toast({
        title: "Validation Error",
        description: "Vehicle information is required",
        variant: "destructive",
      });
      return;
    }
    
    if (services.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one service is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let vehicleId = vehicleInfo.id;
      
      if (!vehicleId) {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            customer_id: customer.id,
            year: vehicleInfo.year,
            make: vehicleInfo.make,
            model: vehicleInfo.model,
            vin: vehicleInfo.vin,
            license_plate: vehicleInfo.license_plate,
            color: vehicleInfo.color,
          })
          .select()
          .single();
          
        if (vehicleError) throw vehicleError;
        vehicleId = vehicleData.id;
      }
      
      const formattedDate = scheduleInfo.date.toISOString().split('T')[0];
      
      let workOrderData;
      if (workOrderId) {
        const { data, error } = await supabase
          .from("work_orders")
          .update({
            customer_id: customer.id,
            vehicle_id: vehicleId,
            scheduled_date: formattedDate,
            start_time: scheduleInfo.start_time,
            end_time: scheduleInfo.end_time,
            bay_id: bayId,
            notes: notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workOrderId)
          .select()
          .single();
          
        if (error) throw error;
        workOrderData = data;
        
        const { error: deleteError } = await supabase
          .from("work_order_services")
          .delete()
          .eq("work_order_id", workOrderId);
          
        if (deleteError) throw deleteError;
      } else {
        const { data, error } = await supabase
          .from("work_orders")
          .insert({
            customer_id: customer.id,
            vehicle_id: vehicleId,
            scheduled_date: formattedDate,
            start_time: scheduleInfo.start_time,
            end_time: scheduleInfo.end_time,
            bay_id: bayId,
            notes: notes,
            status: "scheduled",
          })
          .select()
          .single();
          
        if (error) throw error;
        workOrderData = data;
      }
      
      const serviceItems = services.map(service => ({
        work_order_id: workOrderData.id,
        service_id: service.service_id,
        service_name: service.service_name,
        quantity: service.quantity,
        unit_price: service.unit_price,
        commission_rate: service.commission_rate,
        commission_type: service.commission_type,
        description: service.description,
        assigned_profile_id: service.assigned_profile_id,
      }));
      
      const { error: servicesError } = await supabase
        .from("work_order_services")
        .insert(serviceItems);
        
      if (servicesError) throw servicesError;
      
      toast({
        title: "Success",
        description: workOrderId 
          ? "Work order updated successfully" 
          : "Work order created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      navigate("/admin/work-orders");
    } catch (error) {
      console.error("Error submitting work order:", error);
      toast({
        title: "Error",
        description: "Failed to save work order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isLoading,
    isSubmitting,
    customer,
    setCustomer,
    vehicleInfo,
    setVehicleInfo,
    scheduleInfo,
    setScheduleInfo,
    bayId,
    setBayId,
    notes,
    setNotes,
    services,
    setServices,
    handleSubmit,
  };
}

export function convertServiceItemForWorkOrder(item: any): ServiceItemType {
  return {
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    commission_rate: item.commission_rate,
    commission_type: item.commission_type === 'flat' ? 'fixed' : item.commission_type,
    description: item.description || "",
    assigned_profile_id: item.assigned_profile_id
  };
}
