
export interface WorkOrder {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  contact_preference: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_serial?: string;
  additional_notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  estimated_duration?: string;
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  service_bays?: {
    name: string;
  };
}
