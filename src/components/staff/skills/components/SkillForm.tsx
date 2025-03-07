
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ServiceType } from "../types";

interface SkillFormProps {
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  proficiency: string;
  setProficiency: (value: string) => void;
  handleAddSkill: () => void;
  isAddingSkill: boolean;
  availableServices: ServiceType[];
  isLoadingServices: boolean;
}

export function SkillForm({
  selectedServiceId,
  setSelectedServiceId,
  proficiency,
  setProficiency,
  handleAddSkill,
  isAddingSkill,
  availableServices,
  isLoadingServices
}: SkillFormProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Add New Skill</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service</label>
          <Select 
            value={selectedServiceId} 
            onValueChange={setSelectedServiceId}
            disabled={isLoadingServices || isAddingSkill}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {availableServices.map(service => (
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
            disabled={isAddingSkill}
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
        
        <div className="flex items-end">
          <Button 
            onClick={handleAddSkill} 
            disabled={!selectedServiceId || isAddingSkill}
            className="w-full md:w-auto"
          >
            {isAddingSkill ? 'Adding...' : 'Add Skill'}
          </Button>
        </div>
      </div>
    </div>
  );
}
