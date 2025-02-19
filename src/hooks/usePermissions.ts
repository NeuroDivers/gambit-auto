
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RolePermission } from "@/types/permissions";

interface Role {
  id: string;
  name: string;
}

interface ProfileResponse {
  role_id: string;
  role: Role;
}

export const usePermissions = () => {
  const { data: currentUserRole, isLoading: isRoleLoading } = useQuery<Role | null>({
    queryKey: ["current-user-role"],
    queryFn: async (): Promise<Role | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return null;
      }

      console.log("Fetching role for user:", user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          role_id,
          role:roles (
            id,
            name
          )
        `)
        .eq('id', user.id)
        .returns<ProfileResponse>()
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      // Handle case where no profile or role is found
      if (!data || !data.role) {
        console.warn("No role found for user:", user.id);
        return null;
      }

      console.log("Found role:", data.role);
      return data.role;
    },
  });

  const { data: permissions = [], isLoading: isPermissionsLoading } = useQuery<RolePermission[]>({
    queryKey: ["role-permissions", currentUserRole?.id],
    enabled: !!currentUserRole?.id,
    queryFn: async (): Promise<RolePermission[]> => {
      if (!currentUserRole?.id) {
        console.log("No role ID available for permissions query");
        return [];
      }
      
      console.log("Fetching permissions for role:", currentUserRole.id);
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', currentUserRole.id)
        .returns<RolePermission[]>();

      if (error) {
        console.error("Error fetching permissions:", error);
        return [];
      }
        
      console.log("Found permissions:", data);
      return data || [];
    },
  });

  const checkPermission = async (resource: string, type: 'page_access' | 'feature_access') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // If user has admin role, grant all permissions
    if (currentUserRole?.name === 'admin') {
      console.log("User is admin, granting all permissions");
      return true;
    }

    // Check specific permissions
    const hasPermission = permissions.some(p => 
      p.resource_name === resource && 
      p.permission_type === type && 
      p.is_active
    );
    console.log(`Checking permission for ${resource} (${type}):`, hasPermission);
    return hasPermission;
  };

  return { 
    checkPermission, 
    permissions, 
    currentUserRole,
    isLoading: isRoleLoading || isPermissionsLoading 
  };
};
