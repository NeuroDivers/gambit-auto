
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      return user.app_metadata?.role === 'admin';
    },
  });

  return { isAdmin: !!isAdmin, isLoading };
};
