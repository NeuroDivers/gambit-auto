
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StaffSkill } from "../types";

export const useStaffSkills = (profileId: string) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch staff skills
  const { data: skills = [], error } = useQuery({
    queryKey: ["staff-skills", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .select(`
          id,
          service_type_id,
          expertise_level,
          profile_id,
          service_types(id, name, description)
        `)
        .eq("profile_id", profileId);

      if (error) {
        console.error("Error fetching skills:", error);
        throw error;
      }

      // Transform the data to match the StaffSkill type
      return data.map((item) => ({
        id: item.id,
        serviceTypeId: item.service_type_id,
        expertiseLevel: item.expertise_level,
        profileId: item.profile_id,
        serviceName: item.service_types ? item.service_types.name : "",
        serviceDescription: item.service_types ? item.service_types.description : "",
        // Add these fields to satisfy the type
        service_id: item.service_type_id,
        proficiency: item.expertise_level,
        service_types: {
          id: item.service_types ? item.service_types.id : "",
          name: item.service_types ? item.service_types.name : "",
          description: item.service_types ? item.service_types.description : ""
        }
      })) as StaffSkill[];
    },
  });

  // Fetch available service types
  const { data: availableServiceTypes = [] } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, description");

      if (error) {
        console.error("Error fetching service types:", error);
        throw error;
      }

      return data;
    },
  });

  // Add a new skill
  const addSkill = useMutation({
    mutationFn: async ({ service_type_id, expertise_level }: { service_type_id: string; expertise_level: string }) => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .insert({
          profile_id: profileId,
          service_type_id,
          expertise_level,
        })
        .select();

      if (error) {
        console.error("Error adding skill:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-skills", profileId] });
      toast.success("Skill added successfully");
    },
    onError: (error) => {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    },
  });

  // Update skill
  const updateSkill = useMutation({
    mutationFn: async ({ skillId, expertise_level }: { skillId: string; expertise_level: string }) => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .update({ expertise_level })
        .eq("id", skillId)
        .select();

      if (error) {
        console.error("Error updating skill:", error);
        throw error;
      }

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

  // Remove skill
  const removeSkill = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("staff_service_skills")
        .delete()
        .eq("id", skillId);

      if (error) {
        console.error("Error removing skill:", error);
        throw error;
      }
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

  return {
    skills,
    availableServiceTypes,
    isLoading,
    error,
    addSkill,
    updateSkill,
    removeSkill,
  };
};
