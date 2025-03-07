
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StaffSkill, ServiceType } from "../types";
import { toast } from "sonner";

export function useStaffSkills(profileId: string) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const queryClient = useQueryClient();

  // Fetch staff skills
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["staff-skills", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .select(`
          *,
          service_types (id, name, description)
        `)
        .eq("profileId", profileId);

      if (error) throw error;
      
      // Transform the data to match the StaffSkill interface
      return data.map((skill: any) => ({
        id: skill.id,
        serviceTypeId: skill.serviceTypeId,
        expertiseLevel: skill.expertiseLevel,
        profileId: skill.profileId,
        serviceName: skill.service_types.name,
        serviceDescription: skill.service_types.description,
        service_id: skill.serviceTypeId,
        proficiency: skill.expertiseLevel,
        service_types: {
          id: skill.service_types.id,
          name: skill.service_types.name,
          description: skill.service_types.description
        }
      })) as StaffSkill[];
    },
    enabled: !!profileId,
  });

  // Fetch service types
  const { data: serviceTypes = [], isLoading: isLoadingServiceTypes } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, description")
        .order("name");

      if (error) throw error;
      return data as ServiceType[];
    },
  });

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async ({
      serviceTypeId,
      expertiseLevel,
    }: {
      serviceTypeId: string;
      expertiseLevel: string;
    }) => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .insert({
          profileId,
          serviceTypeId,
          expertiseLevel,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-skills", profileId] });
      setIsAddingSkill(false);
      toast.success("Skill added successfully");
    },
    onError: (error) => {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    },
  });

  // Update skill mutation
  const updateSkillMutation = useMutation({
    mutationFn: async ({
      skillId,
      expertiseLevel,
    }: {
      skillId: string;
      expertiseLevel: string;
    }) => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .update({ expertiseLevel })
        .eq("id", skillId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-skills", profileId] });
      toast.success("Skill updated successfully");
    },
    onError: (error) => {
      console.error("Error updating skill:", error);
      toast.error("Failed to update skill");
    },
  });

  // Delete skill mutation
  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("staff_service_skills")
        .delete()
        .eq("id", skillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-skills", profileId] });
      toast.success("Skill removed successfully");
    },
    onError: (error) => {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill");
    },
  });

  const handleAddSkill = (serviceTypeId: string, expertiseLevel: string) => {
    addSkillMutation.mutate({ serviceTypeId, expertiseLevel });
  };

  const handleUpdateSkill = (skillId: string, expertiseLevel: string) => {
    updateSkillMutation.mutate({ skillId, expertiseLevel });
  };

  const handleDeleteSkill = (skillId: string) => {
    deleteSkillMutation.mutate(skillId);
  };

  return {
    skills,
    serviceTypes,
    isLoading: isLoadingSkills || isLoadingServiceTypes,
    isAddingSkill,
    setIsAddingSkill,
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkill,
  };
}
