
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PermissionType } from "@/types/permissions";

interface Role {
  id: string;
  name: string;
  nicename: string;
}

interface ProfileWithRole {
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role:role_id (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return false;
      }

      // Full access roles - add 'king' to this list
      const fullAccessRoles = ['administrator', 'king'];
      
      // Check if user has a full access role (case insensitive)
      if (profile?.role?.name && 
          fullAccessRoles.some(role => 
            role.toLowerCase() === profile.role.name.toLowerCase()
          )) {
        console.log("User has full access role, granting access");
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
