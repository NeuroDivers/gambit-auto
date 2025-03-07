
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StaffSkill } from '../types';
import { toast } from 'sonner';
import { useState } from 'react';

export function useStaffSkills(profileId: string) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [proficiency, setProficiency] = useState<string>('beginner');

  const { data: userSkills = [], isLoading: isLoadingSkills, refetch: refetchSkills } = useQuery({
    queryKey: ['profile-skills', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_service_skills')
        .select(`
          id,
          service_id,
          proficiency,
          service_types (
            id,
            name,
            description
          )
        `)
        .eq('profile_id', profileId);

      if (error) throw error;
      
      // Transform the data to match our StaffSkill interface
      return (data || []).map(item => ({
        id: item.id,
        service_id: item.service_id,
        proficiency: item.proficiency,
        service_types: {
          id: item.service_types?.id,
          name: item.service_types?.name,
          description: item.service_types?.description,
        }
      })) as StaffSkill[];
    },
    enabled: !!profileId
  });

  const handleAddSkill = async () => {
    if (!selectedServiceId) {
      toast.error('Please select a service');
      return;
    }

    // Check if the skill already exists
    const existingSkill = userSkills.find(skill => skill.service_id === selectedServiceId);
    if (existingSkill) {
      toast.error('You already have this skill added');
      return;
    }

    setIsAddingSkill(true);
    try {
      const { error } = await supabase
        .from('staff_service_skills')
        .insert({
          profile_id: profileId,
          service_id: selectedServiceId,
          proficiency: proficiency
        });

      if (error) throw error;
      
      toast.success('Skill added successfully');
      refetchSkills();
      setSelectedServiceId('');
      setProficiency('beginner');
    } catch (error: any) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill: ' + error.message);
    } finally {
      setIsAddingSkill(false);
    }
  };

  return {
    userSkills,
    isLoadingSkills,
    refetchSkills,
    isAddingSkill,
    selectedServiceId,
    setSelectedServiceId,
    proficiency,
    setProficiency,
    handleAddSkill
  };
}
