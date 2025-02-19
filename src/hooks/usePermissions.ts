
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
  role?: UserRole;
}

interface UserRole {
  id: string;
  name: string;
  nicename: string;
}

export const usePermissions = () => {
  const { data: currentUserRole } = useQuery<UserRole | null>({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return null;
        }

        // Try to get profile role first
        const { data: profiles } = await supabase
          .from('profiles')
          .select(`
            role:role_id (
              id,
              name,
              nicename
            )
          `)
          .eq('id', user.id);

        // Check if we have a valid profile with role
        if (profiles?.[0]?.role) {
          console.log('Found profile role:', profiles[0].role);
          return profiles[0].role as UserRole;
        }

        // Fallback to client role
        const { data: clients } = await supabase
          .from('clients')
          .select(`
            role:role_id (
              id,
              name,
              nicename
            )
          `)
          .eq('user_id', user.id);

        // Check if we have a valid client with role
        if (clients?.[0]?.role) {
          console.log('Found client role:', clients[0].role);
          return clients[0].role as UserRole;
        }

        console.log('No role found in either profiles or clients table');
        return null;
      } catch (error) {
        console.error('Error in role fetch process:', error);
        return null;
      }
    },
    staleTime: Infinity,
    retry: 1,
  });

  const { data: permissions = [] } = useQuery<RolePermission[]>({
    queryKey: ["permissions", currentUserRole?.id],
    queryFn: async () => {
      if (!currentUserRole?.id) {
        console.log('No role ID available for permissions query');
        return [];
      }

      const { data, error } = await supabase
        .from("role_permissions")
        .select(`
          *,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq('role_id', currentUserRole.id)
        .order('resource_name');

      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      return data || [];
    },
    staleTime: Infinity,
    enabled: !!currentUserRole?.id,
  });

  const checkPermission = async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found during permission check');
        return false;
      }

      // Administrator check
      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        console.log('User is administrator, granting access');
        return true;
      }

      // RPC permission check
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
      console.error('Error in permission check:', error);
      return false;
    }
  };

  return {
    permissions,
    checkPermission,
    currentUserRole,
  };
};
