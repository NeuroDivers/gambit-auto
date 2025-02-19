
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePermissions = () => {
  const { data: currentUserRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get role from profiles table instead of app_metadata
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role_id,
          role:role_id (
            id,
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user role:", profileError);
        return null;
      }

      return profile?.role;
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ["role-permissions", currentUserRole?.id],
    enabled: !!currentUserRole?.id,
    queryFn: async () => {
      if (!currentUserRole?.id) return [];
      
      const { data } = await supabase.from('role_permissions')
        .select('*')
        .eq('role_id', currentUserRole.id);
        
      return data || [];
    },
  });

  const checkPermission = async (resource: string, type: 'page_access' | 'feature_access') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // If user has admin role, grant all permissions
    if (currentUserRole?.name === 'admin') return true;

    // Check specific permissions
    if (permissions) {
      return permissions.some(p => 
        p.resource_name === resource && 
        p.permission_type === type && 
        p.is_active
      );
    }

    return false;
  };

  return { checkPermission, permissions, currentUserRole };
};
