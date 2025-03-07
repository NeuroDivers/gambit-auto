
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaffSkill, ServiceType } from "../types";
import { toast } from "sonner";

export function useStaffSkills(profileId: string) {
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ['staff-skills', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_service_skills')
        .select(`
          id,
          proficiency,
          service_id,
          service_types:service_id (
            id,
            name,
            description
          )
        `)
        .eq('profile_id', profileId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as StaffSkill[] || [];
    }
  });

  const { mutate: removeSkill, isPending: isRemoving } = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('staff_service_skills')
        .delete()
        .eq('id', skillId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-skills', profileId] });
      toast.success("Skill removed successfully");
    },
    onError: (error) => {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill");
    }
  });

  const { mutate: addSkill, isPending: isAddingSkill } = useMutation({
    mutationFn: async ({ 
      serviceId, 
      proficiency 
    }: { 
      serviceId: string; 
      proficiency: string 
    }) => {
      // Check if skill already exists
      const { data: existingSkill, error: checkError } = await supabase
        .from('staff_service_skills')
        .select('id')
        .eq('profile_id', profileId)
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingSkill) {
        throw new Error("You already have this skill");
      }
      
      // Add new skill
      const { error } = await supabase
        .from('staff_service_skills')
        .insert({
          profile_id: profileId,
          service_id: serviceId,
          proficiency: proficiency,
          is_active: true
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-skills', profileId] });
      toast.success("Skill added successfully");
    },
    onError: (error: any) => {
      console.error("Error adding skill:", error);
      toast.error(error.message || "Failed to add skill");
    }
  });
  
  return {
    skills,
    isLoadingSkills,
    removeSkill,
    isRemoving,
    addSkill,
    isAddingSkill
  };
}
