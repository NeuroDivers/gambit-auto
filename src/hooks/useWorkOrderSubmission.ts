
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrderFormValues } from "@/components/work-orders/types"
import { format } from "date-fns"

interface SubmitParams {
  values: WorkOrderFormValues
  onSuccess?: (data: any) => void
  onClientNotFound?: () => void
}

interface MutationParams {
  clientId?: string
  customerInfo: {
    customer_first_name: string
    customer_last_name: string
    customer_email: string
    customer_phone: string
    customer_address?: string
  }
  vehicleInfo: {
    customer_vehicle_make: string
    customer_vehicle_model: string
    customer_vehicle_year: number
    customer_vehicle_vin?: string
    customer_vehicle_color?: string
    customer_vehicle_body_class?: string
    customer_vehicle_doors?: number
    customer_vehicle_trim?: string
    customer_vehicle_license_plate?: string
  }
  scheduling: {
    start_time: string
    end_time: string
    estimated_duration: number
  }
  details: {
    status: string
    contact_preference: 'phone' | 'email'
    assigned_bay_id?: string
    service_items: Array<{
      service_id: string
      service_name: string
      quantity: number
      unit_price: number
      description?: string
      assigned_profile_id?: string
      package_id?: string | null
    }>
    additional_notes?: string
  }
}

export function useWorkOrderSubmission() {
  return useMutation({
    mutationFn: async ({ values, onSuccess, onClientNotFound }: SubmitParams) => {
      console.log("Form values for work order submission:", values)
      
      const { customer_first_name, customer_last_name, customer_email, customer_phone, contact_preference } = values
      
      // First check if the client exists
      let clientId = values.client_id
      
      if (!clientId && customer_email) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('email', customer_email)
          .maybeSingle()
        
        if (existingClient) {
          clientId = existingClient.id
        } else if (onClientNotFound) {
          // This callback can be used to prompt the user to create a client
          onClientNotFound()
          return null
        }
      }
      
      // Format dates
      const startTime = values.start_time ? format(values.start_time, "yyyy-MM-dd'T'HH:mm:ss") : null
      const endTime = values.end_time ? format(values.end_time, "yyyy-MM-dd'T'HH:mm:ss") : null
      
      const customerAddress = values.customer_address || '';
      
      // Prepare mutation parameters
      const params: MutationParams = {
        clientId,
        customerInfo: {
          customer_first_name,
          customer_last_name,
          customer_email,
          customer_phone,
          customer_address: customerAddress
        },
        vehicleInfo: {
          customer_vehicle_make: values.customer_vehicle_make || '',
          customer_vehicle_model: values.customer_vehicle_model || '',
          customer_vehicle_year: values.customer_vehicle_year || 0,
          customer_vehicle_vin: values.customer_vehicle_vin,
          customer_vehicle_color: values.customer_vehicle_color,
          customer_vehicle_body_class: values.customer_vehicle_body_class,
          customer_vehicle_doors: values.customer_vehicle_doors,
          customer_vehicle_trim: values.customer_vehicle_trim,
          customer_vehicle_license_plate: values.customer_vehicle_license_plate
        },
        scheduling: {
          start_time: startTime || '',
          end_time: endTime || '',
          estimated_duration: values.estimated_duration || 60
        },
        details: {
          status: 'pending',
          contact_preference,
          assigned_bay_id: values.assigned_bay_id || undefined,
          service_items: values.service_items.map(item => ({
            service_id: item.service_id,
            service_name: item.service_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            description: item.description,
            assigned_profile_id: item.assigned_profile_id,
            package_id: item.package_id
          })),
          additional_notes: values.additional_notes
        }
      }
      
      console.log("Prepared params for work order insertion:", params)
      
      // Create the work order
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .insert({
          client_id: params.clientId,
          customer_id: values.client_id,
          customer_first_name: params.customerInfo.customer_first_name,
          customer_last_name: params.customerInfo.customer_last_name,
          customer_email: params.customerInfo.customer_email,
          customer_phone: params.customerInfo.customer_phone,
          customer_address: params.customerInfo.customer_address,
          customer_vehicle_make: params.vehicleInfo.customer_vehicle_make,
          customer_vehicle_model: params.vehicleInfo.customer_vehicle_model,
          customer_vehicle_year: params.vehicleInfo.customer_vehicle_year,
          customer_vehicle_vin: params.vehicleInfo.customer_vehicle_vin,
          customer_vehicle_color: params.vehicleInfo.customer_vehicle_color,
          customer_vehicle_body_class: params.vehicleInfo.customer_vehicle_body_class,
          customer_vehicle_doors: params.vehicleInfo.customer_vehicle_doors,
          customer_vehicle_trim: params.vehicleInfo.customer_vehicle_trim,
          customer_vehicle_license_plate: params.vehicleInfo.customer_vehicle_license_plate,
          start_time: params.scheduling.start_time,
          end_time: params.scheduling.end_time,
          estimated_duration: params.scheduling.estimated_duration,
          status: params.details.status,
          contact_preference: params.details.contact_preference,
          assigned_bay_id: params.details.assigned_bay_id,
          additional_notes: params.details.additional_notes
        })
        .select()
        .single()
      
      if (error) throw error
      
      console.log("Work order created:", workOrder)
      
      // If work order was created successfully, add service items
      if (workOrder && params.details.service_items.length > 0) {
        const serviceItems = params.details.service_items.map(item => ({
          work_order_id: workOrder.id,
          ...item
        }))
        
        const { error: itemsError } = await supabase
          .from('work_order_items')
          .insert(serviceItems)
        
        if (itemsError) throw itemsError
      }
      
      // Create vehicle record for the client if requested
      if (values.save_vehicle && params.clientId && 
          params.vehicleInfo.customer_vehicle_make && 
          params.vehicleInfo.customer_vehicle_model) {
        
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            customer_id: params.clientId,
            make: params.vehicleInfo.customer_vehicle_make,
            model: params.vehicleInfo.customer_vehicle_model,
            year: params.vehicleInfo.customer_vehicle_year,
            vin: params.vehicleInfo.customer_vehicle_vin,
            color: params.vehicleInfo.customer_vehicle_color,
            body_class: params.vehicleInfo.customer_vehicle_body_class,
            doors: params.vehicleInfo.customer_vehicle_doors,
            trim: params.vehicleInfo.customer_vehicle_trim,
            license_plate: params.vehicleInfo.customer_vehicle_license_plate,
            is_primary: values.is_primary_vehicle || false
          })
        
        if (vehicleError) {
          console.error('Error creating vehicle:', vehicleError)
          // Continue execution despite vehicle creation error
        }
      }
      
      if (onSuccess) onSuccess(workOrder)
      
      return workOrder
    }
  })
}
