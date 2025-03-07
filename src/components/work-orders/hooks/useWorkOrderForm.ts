
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { WorkOrder, WorkOrderFormValues } from "../types"
import { useWorkOrderSubmission } from "./useWorkOrderSubmission"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

const formSchema = z.object({
  customer_first_name: z.string().min(1, "First name is required"),
  customer_last_name: z.string().min(1, "Last name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().min(1, "Phone number is required"),
  contact_preference: z.enum(["phone", "email", "text", "any"]),
  customer_vehicle_make: z.string().min(1, "Vehicle make is required"),
  customer_vehicle_model: z.string().min(1, "Vehicle model is required"),
  customer_vehicle_year: z.string().min(4, "Valid year is required"),
  customer_vehicle_vin: z.string().optional(),
  customer_vehicle_color: z.string().optional(),
  customer_vehicle_body_class: z.string().optional(),
  customer_vehicle_doors: z.string().optional(),
  customer_vehicle_trim: z.string().optional(),
  customer_vehicle_license_plate: z.string().optional(),
  additional_notes: z.string().optional(),
  customer_address: z.string().optional(),
  customer_street_address: z.string().optional(),
  customer_unit_number: z.string().optional(),
  customer_city: z.string().optional(),
  customer_state_province: z.string().optional(),
  customer_postal_code: z.string().optional(),
  customer_country: z.string().optional(),
  start_time: z.date().nullable(),
  estimated_duration: z.number().nullable(),
  end_time: z.date().nullable(),
  assigned_bay_id: z.string().nullable(),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string().optional(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    commission_rate: z.number().optional(),
    commission_type: z.enum(['percentage', 'flat', 'flat_rate']).nullable().optional(),
    assigned_profile_id: z.string().nullable().optional(),
    description: z.string().optional(),
    is_main_service: z.boolean().optional(),
    sub_services: z.array(z.object({
      service_id: z.string(),
      service_name: z.string().optional(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
      commission_rate: z.number().optional(),
      commission_type: z.enum(['percentage', 'flat', 'flat_rate']).nullable().optional(),
      assigned_profile_id: z.string().nullable().optional(),
      description: z.string().optional(),
    })).optional()
  })).optional(),
  save_vehicle: z.boolean().optional(),
  is_primary_vehicle: z.boolean().optional(),
  client_id: z.string().optional(),
})

export function useWorkOrderForm(workOrder?: WorkOrder, onSuccess?: () => void, defaultStartTime?: Date) {
  const { submitWorkOrder } = useWorkOrderSubmission()

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_first_name: workOrder?.customer_first_name || "",
      customer_last_name: workOrder?.customer_last_name || "",
      customer_email: workOrder?.customer_email || "",
      customer_phone: workOrder?.customer_phone || "",
      contact_preference: workOrder?.contact_preference || "phone",
      customer_vehicle_make: workOrder?.customer_vehicle_make || "",
      customer_vehicle_model: workOrder?.customer_vehicle_model || "",
      customer_vehicle_year: workOrder?.customer_vehicle_year?.toString() || new Date().getFullYear().toString(),
      customer_vehicle_vin: workOrder?.customer_vehicle_vin || "",
      customer_vehicle_color: workOrder?.customer_vehicle_color || "",
      customer_vehicle_body_class: workOrder?.customer_vehicle_body_class || "",
      customer_vehicle_doors: workOrder?.customer_vehicle_doors?.toString() || "",
      customer_vehicle_trim: workOrder?.customer_vehicle_trim || "",
      customer_vehicle_license_plate: workOrder?.customer_vehicle_license_plate || "",
      additional_notes: workOrder?.additional_notes || "",
      customer_address: workOrder?.customer_address || "",
      start_time: workOrder?.start_time ? new Date(workOrder.start_time) : defaultStartTime || null,
      estimated_duration: workOrder?.estimated_duration ? parseInt(workOrder.estimated_duration.toString()) : null,
      end_time: workOrder?.end_time ? new Date(workOrder.end_time) : null,
      assigned_bay_id: workOrder?.assigned_bay_id || null,
      service_items: [],
      save_vehicle: false,
      is_primary_vehicle: false,
      client_id: workOrder?.client_id || undefined,
    }
  })

  useEffect(() => {
    async function fetchWorkOrderServices() {
      if (!workOrder?.id) return

      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('work_order_services')
          .select(`
            service_id,
            quantity,
            unit_price,
            commission_rate,
            commission_type,
            assigned_profile_id,
            main_service_id,
            sub_service_id,
            service_types!work_order_services_service_id_fkey (
              name,
              description
            )
          `)
          .eq('work_order_id', workOrder.id)

        if (servicesError) throw servicesError

        if (servicesData && Array.isArray(servicesData)) {
          const mainServices: Record<string, any> = {}
          const subServices: Record<string, any[]> = {}

          servicesData.forEach(service => {
            const serviceType = service.service_types as unknown as { name: string; description?: string } | null;
            
            if (!service.main_service_id) {
              mainServices[service.service_id] = {
                service_id: service.service_id,
                service_name: serviceType?.name || '',
                quantity: service.quantity,
                unit_price: service.unit_price,
                commission_rate: service.commission_rate ?? 0,
                commission_type: service.commission_type as 'percentage' | 'flat_rate' | null,
                assigned_profile_id: service.assigned_profile_id,
                description: serviceType?.description || '',
                is_main_service: true,
                sub_services: []
              };
            } else {
              if (!subServices[service.main_service_id]) {
                subServices[service.main_service_id] = [];
              }
              
              subServices[service.main_service_id].push({
                service_id: service.service_id,
                service_name: serviceType?.name || '',
                quantity: service.quantity,
                unit_price: service.unit_price,
                commission_rate: service.commission_rate ?? 0,
                commission_type: service.commission_type as 'percentage' | 'flat_rate' | null,
                assigned_profile_id: service.assigned_profile_id,
                description: serviceType?.description || '',
                main_service_id: service.main_service_id
              });
            }
          });

          Object.keys(mainServices).forEach(mainServiceId => {
            if (subServices[mainServiceId]) {
              mainServices[mainServiceId].sub_services = subServices[mainServiceId];
            }
          });

          form.setValue('service_items', Object.values(mainServices));
        }
      } catch (error) {
        console.error('Error fetching work order services:', error)
      }
    }

    fetchWorkOrderServices()
  }, [workOrder?.id, form])

  const onSubmit = async (values: WorkOrderFormValues) => {
    console.log("Submitting values:", values);
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
