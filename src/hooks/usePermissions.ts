
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
  };
}

interface UserRole {
  id: string;
  name: string;
  nicename: string;
}

export const usePermissions = () => {
  // Get current user's role and cache it
  const { data: currentUserRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
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

      if (error) throw error;

      // Transform the data to match UserRole interface
      if (data?.role) {
        // Explicitly type the role data and ensure we're handling a single object
        const roleData = Array.isArray(data.role) ? data.role[0] : data.role;
        
        // Now create a properly typed UserRole object
        const userRole: UserRole = {
          id: String(roleData.id),
          name: String(roleData.name),
          nicename: String(roleData.nicename)
        };
        
        console.log('Processed user role:', userRole);
        return userRole;
      }
      
      return null;
    },
    staleTime: Infinity, // Cache the role indefinitely until explicitly invalidated
  });

  // Get all permissions and cache them
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
      return data as RolePermission[];
    },
    staleTime: Infinity, // Cache permissions indefinitely until explicitly invalidated
  });

  const checkPermission = async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return false;
      }

      // If user is administrator, grant access immediately
      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        console.log('User is administrator, granting access');
        return true;
      }

      // Use the cached permissions to check access
      const hasPermission = await supabase.rpc('has_permission', {
        user_id: user.id,
        resource: resource,
        perm_type: type
      });

      console.log(`Permission check for ${resource}: ${hasPermission.data}`);
      return hasPermission.data || false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  return {
    permissions,
    checkPermission,
    currentUserRole,
  };
};
