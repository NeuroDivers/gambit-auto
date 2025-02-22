
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function useWorkOrderAssignment() {
  const handleAssignUser = async (workOrderId: string, userId: string | null) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ assigned_profile_id: userId })
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success("User assigned successfully");
      return true;
    } catch (error) {
      console.error('Error assigning user:', error);
      toast.error("Failed to assign user");
      return false;
    }
  };

  const handleAssignBay = async (workOrderId: string, bayId: string | null) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ assigned_bay_id: bayId })
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success("Bay assigned successfully");
      return true;
    } catch (error) {
      console.error('Error assigning bay:', error);
      toast.error("Failed to assign bay");
      return false;
    }
  };

  return {
    handleAssignUser,
    handleAssignBay,
  };
}
