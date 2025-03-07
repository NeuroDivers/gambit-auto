import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from "@/integrations/supabase/client"

export function useCreateInvoice() {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState("")
  const [customerFirstName, setCustomerFirstName] = useState("")
  const [customerLastName, setCustomerLastName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear())
  const [vehicleVin, setVehicleVin] = useState("")
  const [vehicleBodyClass, setVehicleBodyClass] = useState("")
  const [vehicleDoors, setVehicleDoors] = useState(0)
  const [vehicleTrim, setVehicleTrim] = useState("")
  const [notes, setNotes] = useState("")
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])

  const { data: workOrders } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          work_order_services(
            service_id,
            quantity,
            unit_price,
            service:service_types!work_order_services_service_id_fkey(name)
          )
        `)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data
    },
  })

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const { data: businessTaxes } = useQuery({
    queryKey: ["business-taxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")

      if (error) throw error
      return data
    },
  })

  const handleWorkOrderSelect = async (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId)
    const workOrder = workOrders?.find(wo => wo.id === workOrderId)
    
    if (workOrder) {
      setCustomerFirstName(workOrder.first_name)
      setCustomerLastName(workOrder.last_name)
      setCustomerEmail(workOrder.email)
      setCustomerPhone(workOrder.phone_number)
      setCustomerAddress(workOrder.address || "")
      setVehicleMake(workOrder.vehicle_make)
      setVehicleModel(workOrder.vehicle_model)
      setVehicleYear(workOrder.vehicle_year)
      setVehicleVin(workOrder.vehicle_serial)
      setVehicleBodyClass(workOrder.vehicle_body_class)
      setVehicleDoors(workOrder.vehicle_doors)
      setVehicleTrim(workOrder.vehicle_trim)
      setNotes(workOrder.additional_notes || "")
      
      const items = workOrder.work_order_services.map((service: any) => ({
        service_name: service.service.name,
        description: service.service.name,
        quantity: service.quantity,
        unit_price: service.unit_price,
      }))
      setInvoiceItems(items)
    }
  }

  const resetForm = () => {
    setSelectedWorkOrderId("")
    setCustomerFirstName("")
    setCustomerLastName("")
    setCustomerEmail("")
    setCustomerPhone("")
    setCustomerAddress("")
    setVehicleMake("")
    setVehicleModel("")
    setVehicleYear(new Date().getFullYear())
    setVehicleVin("")
    setVehicleBodyClass("")
    setVehicleDoors(0)
    setVehicleTrim("")
    setNotes("")
    setInvoiceItems([])
  }

  return {
    formData: {
      selectedWorkOrderId,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      customerAddress,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVin,
      vehicleBodyClass,
      vehicleDoors,
      vehicleTrim,
      notes,
      invoiceItems,
    },
    setters: {
      setSelectedWorkOrderId,
      setCustomerFirstName,
      setCustomerLastName,
      setCustomerEmail,
      setCustomerPhone,
      setCustomerAddress,
      setVehicleMake,
      setVehicleModel,
      setVehicleYear,
      setVehicleVin,
      setVehicleBodyClass,
      setVehicleDoors,
      setVehicleTrim,
      setNotes,
      setInvoiceItems,
    },
    workOrders,
    businessProfile,
    businessTaxes,
    handleWorkOrderSelect,
    resetForm,
  }
}
