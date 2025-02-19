
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type RoleResponse = {
  role: {
    name: string;
  } | null;
}

export const useAdminStatus = () => {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          role:roles!role_id (
            name
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      return (profile as RoleResponse)?.role?.name?.toLowerCase() === 'admin';
    },
  });

  return { isAdmin: !!isAdmin, isLoading };
};
