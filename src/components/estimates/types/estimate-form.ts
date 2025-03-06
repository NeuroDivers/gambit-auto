import { ServiceItemType } from "@/types/service-item";

/**
 * This interface defines the form values for the estimate form.
 * It matches the structure of WorkOrderFormValues to ensure compatibility
 * with components that expect WorkOrderFormValues.
 */
export interface EstimateFormValues {
  // Customer information
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  contact_preference: "phone" | "email";
  client_id: string;
  
  // Address information
  street_address: string;
  unit_number: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  address?: string;
  
  // Vehicle information
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_serial: string;
  vehicle_color: string;
  vehicle_trim: string;
  vehicle_body_class: string;
  vehicle_doors: number | null;
  vehicle_license_plate: string;
  
  // Scheduling information
  start_time: Date | null;
  estimated_duration: number | null;
  end_time: Date | null;
  assigned_bay_id: string | null;
  
  // Service information
  service_items: ServiceItemType[];
  
  // Additional fields
  additional_notes?: string;
  is_primary_vehicle?: boolean;
  save_vehicle?: boolean;
  media_url?: string | null;
  
  // Estimate-specific fields (not in WorkOrderFormValues)
  notes: string;
  total: number;
  vehicle_id: string;
  // We'll rename services to match the WorkOrderFormValues pattern
  // but still keep the field for backward compatibility
  services?: any[];
}
