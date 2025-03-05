import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, UserPlus } from "lucide-react";
import { useMultiStaffCommission } from "@/hooks/useMultiStaffCommission";
import { ServiceItemType } from "./service-selection/types";

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface MultiStaffAssignmentProps {
  service: ServiceItemType;
  staffList: StaffMember[];
  onUpdate: (updatedService: ServiceItemType) => void;
  isLoading?: boolean;
}

export function MultiStaffAssignment({ 
  service, 
  staffList, 
  onUpdate, 
  isLoading = false 
}: MultiStaffAssignmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  
  const {
    assignedStaff,
    addStaffMember,
    removeStaffMember,
    updateStaffCommission,
    applyStaffToService
  } = useMultiStaffCommission(service);

  const handleAddStaff = () => {
    const staff = staffList.find(s => s.id === selectedStaffId);
    if (staff) {
      // Make email optional to match the interface
      const staffWithOptionalEmail: StaffMember = {
        id: staff.id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email
      };
      
      addStaffMember(staffWithOptionalEmail);
      setSelectedStaffId("");
      
      // Apply changes to service
      const updatedService = applyStaffToService(service);
      onUpdate(updatedService);
    }
  };
  
  const handleRemoveStaff = (profileId: string) => {
    removeStaffMember(profileId);
    
    // Apply changes to service
    const updatedService = {
      ...service,
      assigned_profiles: assignedStaff.filter(s => s.profile_id !== profileId)
    };
    onUpdate(updatedService);
  };
  
  const handleCommissionChange = (
    profileId: string, 
    field: 'rate' | 'type', 
    value: number | 'percentage' | 'flat'
  ) => {
    if (field === 'rate') {
      updateStaffCommission(profileId, value as number);
    } else {
      updateStaffCommission(profileId, undefined, value as 'percentage' | 'flat');
    }
    
    // Apply changes to service
    const updatedService = applyStaffToService(service);
    onUpdate(updatedService);
  };

  const availableStaff = staffList.filter(
    staff => !assignedStaff.some(s => s.profile_id === staff.id)
  );

  return (
    <div className="space-y-2">
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm font-medium text-primary hover:underline"
      >
        {isExpanded ? "Hide staff assignments" : "Assign multiple staff"}
        <UserPlus className="ml-1 h-4 w-4" />
      </button>
      
      {isExpanded && (
        <Card className="mt-2">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Staff Assignments</CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-4">
            {assignedStaff.length > 0 && (
              <div className="space-y-3">
                {assignedStaff.map((staff) => {
                  const staffInfo = staffList.find(s => s.id === staff.profile_id);
                  return (
                    <div key={staff.profile_id} className="flex items-start gap-2 p-2 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">
                          {staffInfo ? `${staffInfo.first_name} ${staffInfo.last_name}` : "Staff member"}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                          <div className="flex-1">
                            <Label className="text-xs">Commission Rate</Label>
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={staff.commission_rate}
                              onChange={(e) => handleCommissionChange(
                                staff.profile_id, 
                                'rate', 
                                parseFloat(e.target.value) || 0
                              )}
                              className="h-8"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={staff.commission_type || 'percentage'}
                              onValueChange={(value) => handleCommissionChange(
                                staff.profile_id,
                                'type',
                                value as 'percentage' | 'flat'
                              )}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="flat">Flat</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStaff(staff.profile_id)}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {availableStaff.length > 0 && (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs mb-1">Add Staff Member</Label>
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.first_name} {staff.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddStaff}
                  disabled={!selectedStaffId || isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}
            
            {assignedStaff.length === 0 && (
              <div className="text-sm text-muted-foreground py-2">
                No staff members assigned. Add staff to split commission.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
