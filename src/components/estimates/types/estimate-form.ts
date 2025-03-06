
import { ServiceItemType } from "@/types/service-item";

/**
 * This interface defines the form values for the estimate form.
 * It matches the structure of WorkOrderFormValues to ensure compatibility
 * with components that expect WorkOrderFormValues.
 */
export interface EstimateFormValues {
  client_id: string;
  vehicle_id: string;
  services: any[];
  total: number;
  notes: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street_address: string;
  unit_number: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_serial: string;
  vehicle_color: string;
  vehicle_trim: string;
  vehicle_body_class: string;
  vehicle_doors: number | null;
  vehicle_license_plate: string;
  
  // Required fields that match WorkOrderFormValues
  contact_preference: "phone" | "email";
  start_time: Date | null;
  estimated_duration: number | null;
  end_time: Date | null;
  assigned_bay_id: string | null;
  service_items: ServiceItemType[];
  is_primary_vehicle: boolean;
  save_vehicle: boolean;
  
  // Optional fields to match WorkOrderFormValues
  additional_notes?: string;
  media_url?: string | null;
  address?: string;
}
