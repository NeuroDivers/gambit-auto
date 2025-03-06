
import { ServiceItemType } from "@/types/service-item";

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
  vehicle_year: number; // Changed from string | number to just number
  vehicle_serial: string;
  vehicle_color: string;
  vehicle_trim: string;
  vehicle_body_class: string;
  vehicle_doors: number | null; // Changed from string | number to number | null to match WorkOrderFormValues
  vehicle_license_plate: string;
  
  // Make these required fields to match WorkOrderFormValues
  contact_preference: "phone" | "email";
  start_time: Date | null;
  estimated_duration: number | null;
  end_time: Date | null;
  assigned_bay_id: string | null;
  service_items: ServiceItemType[];
  is_primary_vehicle: boolean;
  save_vehicle: boolean;
}
