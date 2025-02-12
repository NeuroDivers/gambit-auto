
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
}

interface Role {
  id: string;
  name: string;
  nicename: string;
}

interface ProfileResponse {
  role: Role;
}

export const usePermissions = () => {
  // Cache permissions data with React Query, setting staleTime to Infinity
  // This means the data will never go stale and will remain cached until explicitly invalidated
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
    staleTime: Infinity, // Never mark the data as stale
    gcTime: Infinity, // Never remove from cache
  });

  const checkPermission = async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get the user's role from the profile table
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
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return false;
      }

      const userRole = (profileData as unknown as ProfileResponse)?.role?.name?.toLowerCase();
      
      // Full access roles - administrator and king should always have full access
      if (userRole === 'administrator' || userRole === 'king') {
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
