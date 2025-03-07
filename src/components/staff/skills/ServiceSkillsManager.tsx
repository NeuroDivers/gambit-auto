
import { useStaffSkills } from "./hooks/useStaffSkills";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillsList } from "./components/SkillsList";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function ServiceSkillsManager({ profileId }: { profileId: string }) {
  const { skills, availableServiceTypes, isLoading, error, addSkill, updateSkill, removeSkill } = useStaffSkills(profileId);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [proficiency, setProficiency] = useState<string>("beginner");
  
  const handleAddSkill = async () => {
    if (!selectedServiceId) return;
    
    try {
      await addSkill.mutateAsync({
        service_type_id: selectedServiceId,
        expertise_level: proficiency
      });
      setIsAddingSkill(false);
      setSelectedServiceId("");
      setProficiency("beginner");
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">Failed to load skills: {error.message}</div>;
  }

  // Filter available services to exclude ones the user already has
  const unusedServices = availableServiceTypes.filter(
    (service) => !skills.some((skill) => skill.serviceTypeId === service.id)
  );

  return (
    <div className="space-y-6">
      {skills.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No skills have been added yet.</p>
          <Button onClick={() => setIsAddingSkill(true)}>Add First Skill</Button>
        </div>
      ) : (
        <SkillsList
          skills={skills}
          onUpdate={(skillId, level) => updateSkill.mutate({ skillId, expertise_level: level })}
          onDelete={(skillId) => removeSkill.mutate(skillId)}
        />
      )}

      {isAddingSkill ? (
        <div className="border p-4 rounded-md space-y-4">
          <h3 className="font-medium">Add New Skill</h3>
          
          <div className="space-y-2">
            <Label htmlFor="service-select">Service</Label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger id="service-select">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {unusedServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proficiency-select">Proficiency Level</Label>
            <Select value={proficiency} onValueChange={setProficiency}>
              <SelectTrigger id="proficiency-select">
                <SelectValue placeholder="Select proficiency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingSkill(false);
                setSelectedServiceId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSkill}
              disabled={!selectedServiceId || addSkill.isPending}
            >
              {addSkill.isPending ? "Adding..." : "Add Skill"}
            </Button>
          </div>
        </div>
      ) : (
        skills.length > 0 && (
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsAddingSkill(true)}
              disabled={unusedServices.length === 0}
            >
              Add Skill
            </Button>
          </div>
        )
      )}
    </div>
  );
}
