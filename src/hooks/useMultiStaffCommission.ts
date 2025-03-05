
import { useState } from 'react';
import { ServiceItemType } from '@/components/shared/form-fields/service-selection/types';

type StaffMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type StaffAssignment = {
  profile_id: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | null;
};

export function useMultiStaffCommission(initialService?: ServiceItemType) {
  const [assignedStaff, setAssignedStaff] = useState<StaffAssignment[]>(
    initialService?.assigned_profiles || []
  );

  // Add a staff member to the service
  const addStaffMember = (staff: StaffMember, rate: number = 0, type: 'percentage' | 'flat' = 'percentage') => {
    // Check if already assigned
    if (assignedStaff.some(s => s.profile_id === staff.id)) {
      return;
    }

    setAssignedStaff([
      ...assignedStaff, 
      { 
        profile_id: staff.id, 
        commission_rate: rate, 
        commission_type: type 
      }
    ]);
  };

  // Remove a staff member
  const removeStaffMember = (profileId: string) => {
    setAssignedStaff(assignedStaff.filter(s => s.profile_id !== profileId));
  };

  // Update a staff member's commission rate or type
  const updateStaffCommission = (
    profileId: string, 
    rate?: number, 
    type?: 'percentage' | 'flat'
  ) => {
    setAssignedStaff(
      assignedStaff.map(staff => 
        staff.profile_id === profileId 
          ? { 
              ...staff, 
              ...(rate !== undefined && { commission_rate: rate }),
              ...(type !== undefined && { commission_type: type })
            } 
          : staff
      )
    );
  };

  // Apply staff assignments to a service
  const applyStaffToService = (service: ServiceItemType): ServiceItemType => {
    return {
      ...service,
      assigned_profiles: [...assignedStaff]
    };
  };

  return {
    assignedStaff,
    addStaffMember,
    removeStaffMember,
    updateStaffCommission,
    applyStaffToService
  };
}
