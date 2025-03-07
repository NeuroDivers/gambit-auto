
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRemoveSkillMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from("staff_service_skills")
          .delete()
          .eq("id", skillId);

        if (error) throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Fix: Replace string[] with proper invalidation filters
      queryClient.invalidateQueries({ queryKey: ["staff-skills"] });
      queryClient.invalidateQueries({ queryKey: ["profile-skills"] });
      toast.success("Skill removed successfully");
    },
    onError: (error) => {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill");
    },
  });

  return { 
    removeSkill: removeSkillMutation.mutate, 
    isLoading 
  };
}
