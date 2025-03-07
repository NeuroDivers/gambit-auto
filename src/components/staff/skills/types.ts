
export interface ServiceType {
  id: string;
  name: string;
  description: string;
}

export interface StaffSkill {
  id: string;
  service_id: string;
  proficiency: string;
  service_types: ServiceType;
}
