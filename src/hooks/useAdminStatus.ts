
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          role:roles (
            name
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      return profile?.role?.name?.toLowerCase() === 'admin';
    },
  });

  return { isAdmin: !!isAdmin, isLoading };
};
