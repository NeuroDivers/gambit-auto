
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RemoveSkillOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRemoveSkillMutation() {
  const mutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('staff_service_skills')
        .delete()
        .eq('id', skillId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Skill removed successfully');
    },
    onError: (error: Error) => {
      console.error('Error removing skill:', error);
      toast.error(`Failed to remove skill: ${error.message}`);
    }
  });

  return {
    removeSkill: (skillId: string, options?: RemoveSkillOptions) => {
      return mutation.mutate(skillId, {
        onSuccess: options?.onSuccess,
        onError: options?.onError
      });
    },
    isLoading: mutation.isPending
  };
}
