
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RolePermission } from "@/types/permissions";

interface Role {
  id: string;
  name: string;
}

interface Profile {
  role_id: string;
  role: Role;
}

export const usePermissions = () => {
  const { data: currentUserRole, isLoading: isRoleLoading } = useQuery<Role | null>({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return null;
      }

      console.log("Fetching role for user:", user.id);
      
      // Get role from profiles table instead of app_metadata
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role_id,
          role:roles (
            id,
            name
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching user role:", profileError);
        return null;
      }

      // Handle case where no profile or role is found
      if (!profile || !profile.role) {
        console.warn("No role found for user:", user.id);
        return null;
      }

      console.log("Found role:", profile.role);
      return profile.role;
    },
  });

  const { data: permissions, isLoading: isPermissionsLoading } = useQuery<RolePermission[]>({
    queryKey: ["role-permissions", currentUserRole?.id],
    enabled: !!currentUserRole?.id,
    queryFn: async () => {
      if (!currentUserRole?.id) {
        console.log("No role ID available for permissions query");
        return [];
      }
      
      console.log("Fetching permissions for role:", currentUserRole.id);
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', currentUserRole.id);

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
    if (permissions) {
      const hasPermission = permissions.some(p => 
        p.resource_name === resource && 
        p.permission_type === type && 
        p.is_active
      );
      console.log(`Checking permission for ${resource} (${type}):`, hasPermission);
      return hasPermission;
    }

    return false;
  };

  return { 
    checkPermission, 
    permissions, 
    currentUserRole,
    isLoading: isRoleLoading || isPermissionsLoading 
  };
};
