
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRemoveSkillMutation(profileId: string) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (skillId: string) => {
    if (!profileId) return;
    
    try {
      setIsPending(true);
      
      const { error } = await supabase
        .from('profile_skills')
        .delete()
        .eq('profile_id', profileId)
        .eq('service_id', skillId);
        
      if (error) throw error;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries(['profile-skills', profileId]);
      queryClient.invalidateQueries(['staff-skills']);
      
      toast.success('Skill removed successfully');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
      throw error;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate, isPending };
}
