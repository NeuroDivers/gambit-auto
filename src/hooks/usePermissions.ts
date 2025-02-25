
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RolePermission {
  id: string;
  role_id: string;
  resource_name: string;
  permission_type: 'page_access' | 'feature_access';
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    id: string;
    name: string;
    nicename: string;
    default_dashboard?: 'admin' | 'staff' | 'client';
  };
}

interface UserRole {
  id: string;
  name: string;
  nicename: string;
  default_dashboard?: 'admin' | 'staff' | 'client';
}

export const usePermissions = () => {
  // Get current user's role and cache it
  const { data: currentUserRole, isLoading: isRoleLoading } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in usePermissions');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          role:role_id (
            id,
            name,
            nicename,
            default_dashboard
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        throw error;
      }

      if (data?.role) {
        const roleData = Array.isArray(data.role) ? data.role[0] : data.role;
        const userRole: UserRole = {
          id: String(roleData.id),
          name: String(roleData.name),
          nicename: String(roleData.nicename),
          default_dashboard: roleData.default_dashboard
        };
        console.log('User role in usePermissions:', userRole);
        return userRole;
      }
      
      console.log('No role found in usePermissions');
      return null;
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 3
  });

  // Get all permissions and cache them
  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      if (!currentUserRole) return null;

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
        .eq('role_id', currentUserRole.id)
        .order('resource_name');

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }
      return data as RolePermission[];
    },
    enabled: !!currentUserRole,
    staleTime: 30000, // Cache for 30 seconds
    retry: 3
  });

  const checkPermission = async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in checkPermission');
        return false;
      }

      // Check if permissions have been loaded
      if (!permissions && currentUserRole?.name?.toLowerCase() !== 'administrator') {
        console.log('Permissions not loaded yet');
        return false;
      }

      // If user is administrator, grant access immediately
      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        console.log('User is administrator in checkPermission, granting access');
        return true;
      }

      // Find the specific permission
      const hasPermission = permissions?.some(
        perm => perm.resource_name === resource && 
                perm.permission_type === type && 
                perm.is_active
      );

      console.log(`Permission check for ${resource}: ${hasPermission}`);
      return hasPermission || false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  return {
    permissions,
    checkPermission,
    currentUserRole,
    isLoading: isRoleLoading
  };
};
