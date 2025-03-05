
// If this file doesn't exist, we'll create a minimal version
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCreateInvoice() {
  // Form data state
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState<number>(0);
  const [vehicleVin, setVehicleVin] = useState('');
  const [vehicleBodyClass, setVehicleBodyClass] = useState('');
  const [vehicleDoors, setVehicleDoors] = useState<number>(0);
  const [vehicleTrim, setVehicleTrim] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  // Fetch work orders
  const { data: workOrders } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch business profile
  const { data: businessProfile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch business taxes
  const { data: businessTaxes } = useQuery({
    queryKey: ['business-taxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_taxes')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Function to handle work order selection
  const handleWorkOrderSelect = async (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);
    
    if (!workOrderId) return;
    
    // Fetch work order details
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        work_order_services (
          id,
          service_id,
          quantity,
          unit_price,
          service_types (
            name,
            description
          )
        )
      `)
      .eq('id', workOrderId)
      .single();
    
    if (error) {
      console.error('Error fetching work order:', error);
      return;
    }
    
    // Update form state with work order data
    setCustomerFirstName(data.first_name || '');
    setCustomerLastName(data.last_name || '');
    setCustomerEmail(data.email || '');
    setCustomerPhone(data.phone_number || '');
    setCustomerAddress(data.address || '');
    setVehicleMake(data.vehicle_make || '');
    setVehicleModel(data.vehicle_model || '');
    setVehicleYear(data.vehicle_year || 0);
    setVehicleVin(data.vehicle_vin || '');
    
    // Map work order services to invoice items
    if (data.work_order_services && data.work_order_services.length > 0) {
      const items = data.work_order_services.map((service: any) => ({
        service_id: service.service_id,
        service_name: service.service_types.name,
        description: service.service_types.description,
        quantity: service.quantity,
        unit_price: service.unit_price,
      }));
      
      setInvoiceItems(items);
    }
  };

  // Function to reset form
  const resetForm = () => {
    setSelectedWorkOrderId('');
    setCustomerFirstName('');
    setCustomerLastName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerId('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear(0);
    setVehicleVin('');
    setVehicleBodyClass('');
    setVehicleDoors(0);
    setVehicleTrim('');
    setInvoiceItems([]);
    setNotes('');
  };

  return {
    formData: {
      selectedWorkOrderId,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVin,
      vehicleBodyClass,
      vehicleDoors,
      vehicleTrim,
      invoiceItems,
      notes,
    },
    setters: {
      setSelectedWorkOrderId,
      setCustomerFirstName,
      setCustomerLastName,
      setCustomerEmail,
      setCustomerPhone,
      setCustomerAddress,
      setCustomerId,
      setVehicleMake,
      setVehicleModel,
      setVehicleYear,
      setVehicleVin,
      setVehicleBodyClass,
      setVehicleDoors,
      setVehicleTrim,
      setInvoiceItems,
      setNotes,
    },
    workOrders,
    businessProfile,
    businessTaxes,
    handleWorkOrderSelect,
    resetForm,
  };
}
