
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePermissions = () => {
  const { data: currentUserRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roles } = await supabase.from('available_roles')
        .select('*')
        .eq('name', user.app_metadata?.role)
        .single();

      return roles;
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

    // Admin has all permissions
    if (user.app_metadata?.role === 'admin') return true;

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
