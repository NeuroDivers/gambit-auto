
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PermissionType } from "@/types/permissions";

export const usePermissions = () => {
  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("role_permissions")
        .select(`
          *,
          roles:role_id (
            id,
            name,
            nicename
          )
        `)
        .order('resource_name');

      if (error) throw error;
      return data;
    },
  });

  const checkPermission = async (
    resource: string,
    type: PermissionType
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // First check if user's role is administrator
      const { data } = await supabase
        .from('profiles')
        .select(`
          role:role_id (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      // Administrator has all permissions
      if (data?.role && typeof data.role === 'object' && 'name' in data.role) {
        const roleName = data.role.name.toLowerCase();
        if (roleName === 'administrator' || roleName === 'admin') {
          console.log("User is administrator, granting access");
          return true;
        }
      }

      // For non-administrators, check specific permissions
      const { data: hasPermission, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        resource: resource,
        perm_type: type
      });

      if (error) {
        console.error('Permission check error:', error);
        return false;
      }

      return hasPermission || false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  return {
    permissions,
    checkPermission,
  };
};
