
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaffSkill, ServiceType } from "../types";
import { toast } from "sonner";
import { useState } from "react";

export function useStaffSkills(profileId: string) {
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [proficiency, setProficiency] = useState<string>("beginner");

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
      
      // Transform the data to match the StaffSkill interface
      return (data || []).map(item => ({
        id: item.id,
        service_id: item.service_id,
        proficiency: item.proficiency,
        service_types: {
          id: item.service_types.id,
          name: item.service_types.name,
          description: item.service_types.description
        }
      })) as StaffSkill[];
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
      // Reset form fields after successful addition
      setSelectedServiceId("");
      setProficiency("beginner");
    },
    onError: (error: any) => {
      console.error("Error adding skill:", error);
      toast.error(error.message || "Failed to add skill");
    }
  });
  
  const handleAddSkill = () => {
    if (!selectedServiceId) {
      toast.error("Please select a service");
      return;
    }
    
    addSkill({ 
      serviceId: selectedServiceId, 
      proficiency 
    });
  };

  return {
    skills,
    isLoadingSkills,
    addSkill,
    isAddingSkill,
    selectedServiceId,
    setSelectedServiceId,
    proficiency,
    setProficiency,
    handleAddSkill
  };
}
