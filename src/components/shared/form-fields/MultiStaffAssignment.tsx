
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServiceItemType } from "./service-selection/types";

type StaffMember = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
};

type StaffAssignment = {
  profile_id: string;
  commission_rate: number;
  commission_type: "percentage" | "flat";
};

interface MultiStaffAssignmentProps {
  service: ServiceItemType;
  staffList: StaffMember[];
  onUpdate: (updates: Partial<ServiceItemType>) => void;
  disabled?: boolean;
}

export function MultiStaffAssignment({ 
  service, 
  staffList, 
  onUpdate,
  disabled = false
}: MultiStaffAssignmentProps) {
  const [assignments, setAssignments] = useState<StaffAssignment[]>(
    service.assigned_profiles || []
  );

  const handleAddStaff = () => {
    if (staffList.length === 0) return;
    
    const newAssignment: StaffAssignment = {
      profile_id: staffList[0].id,
      commission_rate: 0,
      commission_type: "percentage"
    };
    
    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    onUpdate({ assigned_profiles: updatedAssignments });
  };

  const handleRemoveStaff = (index: number) => {
    const updatedAssignments = [...assignments];
    updatedAssignments.splice(index, 1);
    setAssignments(updatedAssignments);
    onUpdate({ assigned_profiles: updatedAssignments });
  };

  const handleAssignmentChange = (index: number, field: keyof StaffAssignment, value: any) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      [field]: value
    };
    setAssignments(updatedAssignments);
    onUpdate({ assigned_profiles: updatedAssignments });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Staff Assignments</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddStaff}
          disabled={disabled || staffList.length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Staff
        </Button>
      </div>
      
      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No staff assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Staff Member</Label>
                    <Select 
                      value={assignment.profile_id}
                      onValueChange={(value) => handleAssignmentChange(index, "profile_id", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.first_name} {staff.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Commission Rate</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step={assignment.commission_type === "percentage" ? "1" : "0.01"}
                        value={assignment.commission_rate}
                        onChange={(e) => handleAssignmentChange(
                          index, 
                          "commission_rate", 
                          parseFloat(e.target.value) || 0
                        )}
                        disabled={disabled}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStaff(index)}
                        disabled={disabled}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <RadioGroup
                      defaultValue={assignment.commission_type}
                      value={assignment.commission_type}
                      onValueChange={(value) => handleAssignmentChange(
                        index, 
                        "commission_type", 
                        value as "percentage" | "flat"
                      )}
                      className="flex gap-4"
                      disabled={disabled}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id={`percentage-${index}`} />
                        <Label htmlFor={`percentage-${index}`}>Percentage</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="flat" id={`flat-${index}`} />
                        <Label htmlFor={`flat-${index}`}>Flat Amount</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
