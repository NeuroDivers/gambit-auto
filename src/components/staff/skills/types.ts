
export interface StaffSkill {
  id: string;
  serviceTypeId: string;
  expertiseLevel: string;
  profileId: string;
  serviceName: string;
  serviceDescription: string;
  service_id: string;
  proficiency: string;
  service_types: ServiceType;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
}
