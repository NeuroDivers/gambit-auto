
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { WorkOrder, WorkOrderFormValues } from "../types"
import { useWorkOrderSubmission } from "./useWorkOrderSubmission"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

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
    quantity: z.number(),
    unit_price: z.number()
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
      estimated_duration: null,
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
        const { data: services, error } = await supabase
          .from('work_order_services')
          .select(`
            id,
            service_id,
            quantity,
            unit_price,
            service:service_types!work_order_services_service_id_fkey (
              id,
              name
            )
          `)
          .eq('work_order_id', workOrder.id)

        if (error) {
          console.error('Error fetching work order services:', error)
          return
        }

        if (services) {
          const formattedServices = services.map(service => {
            const serviceType = service.service as { id: string; name: string } | null
            return {
              service_id: service.service_id,
              service_name: serviceType?.name || '',
              quantity: service.quantity,
              unit_price: service.unit_price
            }
          })
          form.setValue('service_items', formattedServices)
        }
      } catch (error) {
        console.error('Error in fetchWorkOrderServices:', error)
      }
    }

    fetchWorkOrderServices()
  }, [workOrder?.id, form])

  const onSubmit = async (values: WorkOrderFormValues) => {
    console.log("Submitting work order with values:", values)
    const success = await submitWorkOrder(values, workOrder?.id)
    if (success) {
      onSuccess?.()
    }
  }

  return {
    form,
    onSubmit
  }
}
