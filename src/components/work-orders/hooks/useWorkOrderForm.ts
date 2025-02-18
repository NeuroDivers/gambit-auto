import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { WorkOrder, WorkOrderFormValues } from "../types"
import { useWorkOrderSubmission } from "./useWorkOrderSubmission"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface ServiceType {
  id: string;
  name: string;
}

// Define the shape of the raw data from Supabase
interface RawWorkOrderService {
  id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  service: {
    id: string;
    name: string;
    price: number | null;
  };
}

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  contact_preference: z.enum(["phone", "email"]),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_serial: z.string().min(1, "Vehicle serial number is required"),
  additional_notes: z.string().optional(),
  address: z.string().optional(),
  start_time: z.date().nullable().optional(),
  estimated_duration: z.number().nullable().optional(),
  end_time: z.date().nullable().optional(),
  assigned_bay_id: z.string().nullable().optional(),
  assigned_profile_id: z.string().nullable().optional(),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0)
  }))
})

export function useWorkOrderForm(workOrder?: WorkOrder, onSuccess?: () => void, defaultStartTime?: Date) {
  const { submitWorkOrder } = useWorkOrderSubmission()

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: workOrder?.first_name || "",
      last_name: workOrder?.last_name || "",
      email: workOrder?.email || "",
      phone_number: workOrder?.phone_number || "",
      contact_preference: workOrder?.contact_preference || "phone",
      vehicle_make: workOrder?.vehicle_make || "",
      vehicle_model: workOrder?.vehicle_model || "",
      vehicle_year: workOrder?.vehicle_year || new Date().getFullYear(),
      vehicle_serial: workOrder?.vehicle_serial || "",
      additional_notes: workOrder?.additional_notes || "",
      address: workOrder?.address || "",
      start_time: workOrder?.start_time ? new Date(workOrder.start_time) : defaultStartTime || null,
      estimated_duration: workOrder?.estimated_duration ? parseInt(workOrder.estimated_duration.toString()) : null,
      end_time: workOrder?.end_time ? new Date(workOrder.end_time) : null,
      assigned_bay_id: workOrder?.assigned_bay_id || null,
      assigned_profile_id: workOrder?.assigned_profile_id || null,
      service_items: []
    }
  })

  useEffect(() => {
    async function fetchWorkOrderServices() {
      if (!workOrder?.id) return

      try {
        // First verify if the work order exists and the ID is valid
        const { data: workOrderExists, error: workOrderError } = await supabase
          .from('work_orders')
          .select('id')
          .eq('id', workOrder.id)
          .maybeSingle()

        if (workOrderError || !workOrderExists) {
          console.error('Error verifying work order:', workOrderError)
          return
        }

        // Then fetch the services with the correct relationship specified
        const { data: servicesData, error: servicesError } = await supabase
          .from('work_order_services')
          .select(`
            id,
            service_id,
            quantity,
            unit_price,
            service:service_types!work_order_services_service_id_fkey (
              id,
              name,
              price
            )
          `)
          .eq('work_order_id', workOrder.id)

        if (servicesError) {
          console.error('Error fetching work order services:', servicesError)
          return
        }

        console.log('Fetched services:', servicesData)

        if (servicesData && Array.isArray(servicesData)) {
          // First cast the raw data to our known shape
          const rawServices = servicesData as unknown as RawWorkOrderService[]
          
          const formattedServices = rawServices
            .filter(service => service.service && service.service.id)
            .map(service => ({
              service_id: service.service.id,
              service_name: service.service.name,
              quantity: service.quantity,
              unit_price: service.unit_price || service.service.price || 0
            }))

          console.log('Formatted services for form:', formattedServices)
          form.setValue('service_items', formattedServices, { shouldDirty: true })
        }
      } catch (error) {
        console.error('Error in fetchWorkOrderServices:', error)
      }
    }

    fetchWorkOrderServices()
  }, [workOrder?.id, form])

  const onSubmit = async (values: WorkOrderFormValues) => {
    console.log("Form values before submission:", values)
    
    if (!values.service_items || values.service_items.length === 0) {
      values.service_items = []
    }

    console.log("Service items before submission:", values.service_items)

    // Filter out any service items with empty service_id
    const validServiceItems = values.service_items.filter(item => 
      item.service_id && 
      item.service_id.trim() !== "" && 
      item.service_name && 
      item.service_name.trim() !== ""
    )

    console.log("Valid service items:", validServiceItems)

    const success = await submitWorkOrder({
      ...values,
      service_items: validServiceItems
    }, workOrder?.id)

    if (success) {
      onSuccess?.()
    }
  }

  return {
    form,
    onSubmit
  }
}
