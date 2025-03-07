
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StaffSkill } from '../types';
import { toast } from 'sonner';

export function useStaffSkills(profileId: string) {
  const [skills, setSkills] = useState<StaffSkill[]>([]);
  const [availableServiceTypes, setAvailableServiceTypes] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Fetch staff skills
  const { data: skillsData, isLoading: isLoadingSkills, error: skillsError } = useQuery({
    queryKey: ['staff-skills', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_skills')
        .select(`
          id,
          expertise_level,
          profile_id,
          service_type_id,
          service_types (
            id,
            name,
            description
          )
        `)
        .eq('profile_id', profileId);

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  // Fetch available service types
  const { data: serviceTypesData, isLoading: isLoadingServiceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name, description');

      if (error) throw error;
      return data;
    },
  });

  // Process data when it loads
  useEffect(() => {
    if (skillsData) {
      const processedSkills: StaffSkill[] = skillsData.map((skill) => ({
        id: skill.id,
        serviceTypeId: skill.service_type_id,
        expertiseLevel: skill.expertise_level,
        profileId: skill.profile_id,
        serviceName: skill.service_types?.name || '',
        serviceDescription: skill.service_types?.description || '',
      }));
      setSkills(processedSkills);
    }

    if (serviceTypesData) {
      // Filter out service types that are already assigned as skills
      const existingServiceTypeIds = skillsData?.map(skill => skill.service_type_id) || [];
      const availableTypes = serviceTypesData.filter(
        serviceType => !existingServiceTypeIds.includes(serviceType.id)
      );
      setAvailableServiceTypes(availableTypes);
    }
  }, [skillsData, serviceTypesData]);

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async (newSkill: { service_type_id: string; expertise_level: string }) => {
      const { data, error } = await supabase
        .from('staff_skills')
        .insert({
          profile_id: profileId,
          service_type_id: newSkill.service_type_id,
          expertise_level: newSkill.expertise_level,
        })
        .select('id');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-skills', profileId] });
      toast.success('Skill added successfully');
    },
    onError: (error: any) => {
      toast.error(`Error adding skill: ${error.message}`);
    },
  });

  // Update skill mutation
  const updateSkillMutation = useMutation({
    mutationFn: async ({ skillId, expertiseLevel }: { skillId: string; expertiseLevel: string }) => {
      const { data, error } = await supabase
        .from('staff_skills')
        .update({ expertise_level: expertiseLevel })
        .eq('id', skillId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-skills', profileId] });
      toast.success('Skill updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating skill: ${error.message}`);
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('staff_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-skills', profileId] });
      toast.success('Skill removed successfully');
    },
    onError: (error: any) => {
      toast.error(`Error removing skill: ${error.message}`);
    },
  });

  return {
    skills,
    availableServiceTypes,
    isLoading: isLoadingSkills || isLoadingServiceTypes,
    error: skillsError,
    addSkill: addSkillMutation.mutate,
    updateSkill: updateSkillMutation.mutate,
    removeSkill: removeSkillMutation.mutate,
  };
}
