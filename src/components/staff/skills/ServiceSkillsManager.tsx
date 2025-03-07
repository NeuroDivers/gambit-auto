
import { useState } from 'react';
import { useServiceTypes } from './hooks/useServiceTypes';
import { useStaffSkills } from './hooks/useStaffSkills';
import { useRemoveSkillMutation } from '../hooks/useRemoveSkillMutation';
import { SkillForm } from './components/SkillForm';
import { SkillsList } from './components/SkillsList';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface ServiceSkillsManagerProps {
  profileId: string;
}

export function ServiceSkillsManager({ profileId }: ServiceSkillsManagerProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus();
  const { removeSkill, isLoading: isRemoving } = useRemoveSkillMutation();
  const { services, isLoadingServices } = useServiceTypes();
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [proficiency, setProficiency] = useState<string>('beginner');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  
  const {
    skills,
    availableServiceTypes,
    isLoading,
    addSkill,
    updateSkill,
  } = useStaffSkills(profileId);

  // Check if current user has permission to manage this profile's skills
  const hasPermission = isAdmin || user?.id === profileId;

  const handleAddSkill = () => {
    if (!selectedServiceId) {
      return;
    }

    setIsAddingSkill(true);
    addSkill(
      {
        service_type_id: selectedServiceId,
        expertise_level: proficiency,
      },
      {
        onSuccess: () => {
          setSelectedServiceId('');
          setProficiency('beginner');
          setIsAddingSkill(false);
        },
        onError: () => {
          setIsAddingSkill(false);
        },
      }
    );
  };

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

  if (!hasPermission) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage service skills for this user. Only administrators or the user themselves can manage service skills.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <SkillForm
        selectedServiceId={selectedServiceId}
        setSelectedServiceId={setSelectedServiceId}
        proficiency={proficiency}
        setProficiency={setProficiency}
        handleAddSkill={handleAddSkill}
        isAddingSkill={isAddingSkill}
        availableServices={availableServiceTypes}
        isLoadingServices={isLoadingServices}
      />

      <div>
        <h3 className="text-lg font-medium mb-4">Your Skills</h3>
        <SkillsList
          skills={skills}
          isLoading={isLoading}
          onRemoveSkill={handleRemoveSkill}
          isRemoving={isRemoving}
        />
      </div>
    </div>
  );
}
