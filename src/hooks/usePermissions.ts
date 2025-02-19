
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

// Define the response type from Supabase
interface RoleResponse {
  role: {
    id: string;
    name: string;
    nicename: string;
  };
}

export const usePermissions = () => {
  const { data: currentUserRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check profiles table first
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

      if (!profileError && profileData?.role) {
        const role = profileData.role as unknown as UserRole;
        return {
          id: role.id,
          name: role.name,
          nicename: role.nicename
        };
      }

      // If no profile found or no role, check clients table
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (!clientError && clientData?.role) {
        const role = clientData.role as unknown as UserRole;
        return {
          id: role.id,
          name: role.name,
          nicename: role.nicename
        };
      }

      console.log('No role found in either profiles or clients table');
      return null;
    },
    staleTime: Infinity,
  });

  // Get all permissions
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
    staleTime: Infinity,
  });

  const checkPermission = async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
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
  };
};
