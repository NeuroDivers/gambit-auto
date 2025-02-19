
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: role } = await supabase.from('available_roles')
        .select('*')
        .eq('name', user.app_metadata?.role)
        .single();
        
      return role?.name === 'admin';
    },
  });

  return { isAdmin: !!isAdmin, isLoading };
};
