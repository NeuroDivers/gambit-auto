
export interface StaffMember {
  staff_id: string
  profile_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  role_id: string | null
  role_name: string | null
  role_nicename: string | null
  position: string | null
  department: string | null
  employment_date: string | null
  status: string | null
  is_full_time: boolean | null
  employee_id: string | null
}

export interface StaffDetails {
  id: string
  profile_id: string
  employment_date: string | null
  department: string | null
  position: string | null
  employee_id: string | null
  status: string | null
  is_full_time: boolean | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at: string
  updated_at: string
}

export interface ProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  role_id: string
  created_at: string
  updated_at: string
  avatar_url: string | null
  [key: string]: any
}
