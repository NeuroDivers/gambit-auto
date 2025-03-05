
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

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
  const { data: currentUserRole, isLoading: isRoleLoading, error: roleError } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      try {
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
          
          // Check if this is a "not found" error, which means the profile exists but role may be null
          if (error.code === 'PGRST116') {
            // If profile exists but role is null, we'll try to assign a default client role
            await assignDefaultRoleIfNeeded(user.id);
            
            // Retry the query after attempting to assign a default role
            const { data: retryData, error: retryError } = await supabase
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
              
            if (retryError) {
              console.error('Error on retry after assigning role:', retryError);
              return null;
            }
            
            if (retryData?.role) {
              const roleData = Array.isArray(retryData.role) ? retryData.role[0] : retryData.role;
              const userRole: UserRole = {
                id: String(roleData.id),
                name: String(roleData.name),
                nicename: String(roleData.nicename),
                default_dashboard: roleData.default_dashboard
              };
              return userRole;
            }
          }
          
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
          return userRole;
        }
        
        // If we get here, it means the profile exists but has no role assigned
        console.log('Profile found but no role assigned, attempting to assign default role');
        await assignDefaultRoleIfNeeded(user.id);
        
        // Retry the query after attempting to assign a default role
        const { data: retryData, error: retryError } = await supabase
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
          
        if (retryError) {
          console.error('Error on retry after assigning role:', retryError);
          return null;
        }
        
        if (retryData?.role) {
          const roleData = Array.isArray(retryData.role) ? retryData.role[0] : retryData.role;
          const userRole: UserRole = {
            id: String(roleData.id),
            name: String(roleData.name),
            nicename: String(roleData.nicename),
            default_dashboard: roleData.default_dashboard
          };
          return userRole;
        }
        
        return null;
      } catch (error) {
        console.error('Fatal error in usePermissions:', error);
        return null;
      }
    },
    staleTime: 300000, // Cache for 5 minutes
    retry: 1
  });

  // Get all permissions and cache them
  const { data: permissions } = useQuery({
    queryKey: ["permissions", currentUserRole?.id],
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
    staleTime: 300000, // Cache for 5 minutes
  });

  const checkPermission = useCallback(async (
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
        return true;
      }

      // Find the specific permission
      const hasPermission = permissions?.some(
        perm => perm.resource_name === resource && 
                perm.permission_type === type && 
                perm.is_active
      );

      return hasPermission || false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }, [permissions, currentUserRole]);

  // Helper function to assign a default client role if needed
  const assignDefaultRoleIfNeeded = async (userId: string) => {
    try {
      // First, check if the client role exists
      const { data: clientRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'client')
        .single();
        
      if (roleError) {
        console.error('Error fetching client role:', roleError);
        return;
      }
      
      if (!clientRole) {
        console.error('Client role not found, cannot assign default role');
        return;
      }
      
      // Update the profile with the client role
      console.log('Assigning default client role to user:', userId);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role_id: clientRole.id })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error assigning default role:', updateError);
        return;
      }
      
      console.log('Successfully assigned default client role');
    } catch (error) {
      console.error('Error in assignDefaultRoleIfNeeded:', error);
    }
  };

  return {
    permissions,
    checkPermission,
    currentUserRole,
    isLoading: isRoleLoading,
    error: roleError
  };
};
