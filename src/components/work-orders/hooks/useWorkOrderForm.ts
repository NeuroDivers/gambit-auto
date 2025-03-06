
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
  contact_preference: z.enum(["phone", "email"]),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_vin: z.string().optional(),
  vehicle_color: z.string().optional(),
  vehicle_body_class: z.string().optional(),
  vehicle_doors: z.number().nullable().optional(),
  vehicle_trim: z.string().optional(),
  vehicle_license_plate: z.string().optional(),
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
    service_name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    commission_rate: z.number(),
    commission_type: z.enum(['percentage', 'flat']).nullable(),
    assigned_profile_id: z.string().nullable().optional(),
    description: z.string().optional(),
    sub_services: z.array(z.object({
      service_id: z.string(),
      service_name: z.string(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
      commission_rate: z.number().optional(),
      commission_type: z.enum(['percentage', 'flat']).nullable().optional(),
      assigned_profile_id: z.string().nullable().optional(),
      description: z.string().optional(),
      parent_id: z.string().optional()
    })).optional()
  })),
  save_vehicle: z.boolean().optional(),
  is_primary_vehicle: z.boolean().optional()
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
      vehicle_make: workOrder?.vehicle_make || "",
      vehicle_model: workOrder?.vehicle_model || "",
      vehicle_year: workOrder?.vehicle_year || new Date().getFullYear(),
      vehicle_vin: workOrder?.vehicle_vin || "",
      vehicle_color: workOrder?.vehicle_color || "",
      vehicle_body_class: workOrder?.vehicle_body_class || "",
      vehicle_doors: workOrder?.vehicle_doors || null,
      vehicle_trim: workOrder?.vehicle_trim || "",
      vehicle_license_plate: workOrder?.vehicle_license_plate || "",
      additional_notes: workOrder?.additional_notes || "",
      customer_address: workOrder?.customer_address || "",
      customer_street_address: workOrder?.customer_street_address || "",
      customer_unit_number: workOrder?.customer_unit_number || "",
      customer_city: workOrder?.customer_city || "",
      customer_state_province: workOrder?.customer_state_province || "",
      customer_postal_code: workOrder?.customer_postal_code || "",
      customer_country: workOrder?.customer_country || "",
      start_time: workOrder?.start_time ? new Date(workOrder.start_time) : defaultStartTime || null,
      estimated_duration: workOrder?.estimated_duration ? parseInt(workOrder.estimated_duration.toString()) : null,
      end_time: workOrder?.end_time ? new Date(workOrder.end_time) : null,
      assigned_bay_id: workOrder?.assigned_bay_id || null,
      service_items: [],
      save_vehicle: false,
      is_primary_vehicle: false
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
            service_types:service_types!work_order_services_service_id_fkey (
              name,
              description
            )
          `)
          .eq('work_order_id', workOrder.id)

        if (servicesError) throw servicesError

        if (servicesData && Array.isArray(servicesData)) {
          // Group services by main and sub-services
          const mainServices: Record<string, any> = {}
          const subServices: Record<string, any[]> = {}

          servicesData.forEach(service => {
            const serviceType = service.service_types as unknown as { name: string; description?: string } | null;
            
            if (!service.main_service_id) {
              // This is a main service
              mainServices[service.service_id] = {
                service_id: service.service_id,
                service_name: serviceType?.name || '',
                quantity: service.quantity,
                unit_price: service.unit_price,
                commission_rate: service.commission_rate ?? 0,
                commission_type: service.commission_type as 'percentage' | 'flat' | null,
                assigned_profile_id: service.assigned_profile_id,
                description: serviceType?.description || '',
                is_parent: true,
                sub_services: []
              };
            } else {
              // This is a sub-service
              if (!subServices[service.main_service_id]) {
                subServices[service.main_service_id] = [];
              }
              
              subServices[service.main_service_id].push({
                service_id: service.service_id,
                service_name: serviceType?.name || '',
                quantity: service.quantity,
                unit_price: service.unit_price,
                commission_rate: service.commission_rate ?? 0,
                commission_type: service.commission_type as 'percentage' | 'flat' | null,
                assigned_profile_id: service.assigned_profile_id,
                description: serviceType?.description || '',
                parent_id: service.main_service_id
              });
            }
          });

          // Add sub-services to their main services
          Object.keys(mainServices).forEach(mainServiceId => {
            if (subServices[mainServiceId]) {
              mainServices[mainServiceId].sub_services = subServices[mainServiceId];
            }
          });

          // Set form value with the processed services
          form.setValue('service_items', Object.values(mainServices));
        }
      } catch (error) {
        console.error('Error fetching work order services:', error)
      }
    }

    fetchWorkOrderServices()
  }, [workOrder?.id, form])

  const onSubmit = async (values: WorkOrderFormValues) => {
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
