
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PermissionType } from "@/types/permissions";

interface Role {
  id: string;
  name: string;
  nicename: string;
}

interface ProfileData {
  role: Role | null;
}

export const usePermissions = () => {
  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
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

      // First get the user's role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return false;
      }

      const userRole = (profileData as ProfileData)?.role?.name?.toLowerCase();
      console.log("Current user role:", userRole);

      // Full access roles - administrator and king should always have full access
      if (userRole === 'administrator' || userRole === 'king') {
        console.log("User has full access role (administrator/king), granting access");
        return true;
      }

      // For other roles, check specific permissions
      const { data: hasPermission, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        resource: resource,
        perm_type: type
      });

      if (error) {
        console.error('Permission check error:', error);
        return false;
      }

      console.log(`Permission check for ${resource} (${type}):`, hasPermission);
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
