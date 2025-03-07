
import { useServiceTypes } from './hooks/useServiceTypes';
import { useStaffSkills } from './hooks/useStaffSkills';
import { useRemoveSkillMutation } from '../hooks/useRemoveSkillMutation';
import { SkillForm } from './components/SkillForm';
import { SkillsList } from './components/SkillsList';

export interface ServiceSkillsManagerProps {
  profileId: string;
}

export function ServiceSkillsManager({ profileId }: ServiceSkillsManagerProps) {
  const { removeSkill, isLoading: isRemoving } = useRemoveSkillMutation();
  const { services, isLoadingServices } = useServiceTypes();
  const {
    skills,
    isLoadingSkills,
    selectedServiceId,
    setSelectedServiceId,
    proficiency,
    setProficiency,
    handleAddSkill,
    isAddingSkill,
    addSkill
  } = useStaffSkills(profileId);

  const handleRemoveSkill = (skillId: string) => {
    removeSkill(skillId, {
      onSuccess: () => {
        // Will be refetched automatically due to queryClient.invalidateQueries in the mutation
      }
    });
  };

  // Filter out services that the user already has
  const availableServices = services.filter(service => 
    !skills.some(skill => skill.service_id === service.id)
  );

  return (
    <div className="space-y-6">
      <SkillForm
        selectedServiceId={selectedServiceId}
        setSelectedServiceId={setSelectedServiceId}
        proficiency={proficiency}
        setProficiency={setProficiency}
        handleAddSkill={handleAddSkill}
        isAddingSkill={isAddingSkill}
        availableServices={availableServices}
        isLoadingServices={isLoadingServices}
      />

      <div>
        <h3 className="text-lg font-medium mb-4">Your Skills</h3>
        <SkillsList
          skills={skills}
          isLoading={isLoadingSkills}
          onRemoveSkill={handleRemoveSkill}
          isRemoving={isRemoving}
        />
      </div>
    </div>
  );
}
