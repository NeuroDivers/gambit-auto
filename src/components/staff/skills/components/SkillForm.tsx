
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ServiceType } from "../types";

interface SkillFormProps {
  serviceTypes?: ServiceType[];
  onSubmit: (serviceTypeId: string, level: string) => void;
  onCancel: () => void;
}

export function SkillForm({
  serviceTypes = [],
  onSubmit,
  onCancel
}: SkillFormProps) {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [proficiency, setProficiency] = useState("intermediate");

  const handleAddSkill = () => {
    if (selectedServiceId) {
      onSubmit(selectedServiceId, proficiency);
      setSelectedServiceId("");
      setProficiency("intermediate");
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Add New Skill</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service</label>
          <Select 
            value={selectedServiceId} 
            onValueChange={setSelectedServiceId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Proficiency</label>
          <Select 
            value={proficiency} 
            onValueChange={setProficiency}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end gap-2">
          <Button 
            onClick={handleAddSkill} 
            disabled={!selectedServiceId}
            className="w-full md:w-auto"
          >
            Add Skill
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SkillForm;
