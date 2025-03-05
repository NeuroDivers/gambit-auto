
import { WorkOrder as TypesWorkOrder } from "@/types/work-order";
import { WorkOrder as ComponentsWorkOrder } from "@/components/work-orders/types";

/**
 * This utility converts between different WorkOrder type definitions
 * to ensure compatibility across the application
 */
export class WorkOrderTypeAdapter {
  /**
   * Converts a WorkOrder from any source to the canonical type
   */
  static toCanonical(workOrder: any): TypesWorkOrder {
    return {
      id: workOrder.id || "",
      first_name: workOrder.first_name || workOrder.customer_first_name || "",
      last_name: workOrder.last_name || workOrder.customer_last_name || "",
      email: workOrder.email || workOrder.customer_email || "",
      phone_number: workOrder.phone_number || workOrder.customer_phone || "",
      contact_preference: workOrder.contact_preference || "phone",
      client_id: workOrder.client_id || workOrder.customer_id,
      
      vehicle_id: workOrder.vehicle_id,
      vehicle_make: workOrder.vehicle_make || "",
      vehicle_model: workOrder.vehicle_model || "",
      vehicle_year: Number(workOrder.vehicle_year) || new Date().getFullYear(),
      vehicle_serial: workOrder.vehicle_serial || workOrder.vehicle_vin || "",
      vehicle_color: workOrder.vehicle_color,
      
      status: workOrder.status || "pending",
      created_at: workOrder.created_at || new Date().toISOString(),
      additional_notes: workOrder.additional_notes || workOrder.notes || "",
      
      start_time: workOrder.start_time,
      end_time: workOrder.end_time,
      estimated_duration: workOrder.estimated_duration,
      
      assigned_bay_id: workOrder.assigned_bay_id || workOrder.bay_id,
      service_items: workOrder.service_items || workOrder.services || [],
      
      // Include any other fields that might be present
      ...(workOrder as object)
    };
  }
  
  /**
   * Converts a canonical WorkOrder to the components/work-orders specific type
   */
  static toComponentsType(workOrder: TypesWorkOrder): ComponentsWorkOrder {
    return workOrder as unknown as ComponentsWorkOrder;
  }
}
