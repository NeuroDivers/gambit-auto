
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [assigningDefaultRole, setAssigningDefaultRole] = useState(false);
  const [noProfileFound, setNoProfileFound] = useState(false);
  const [authUserMissing, setAuthUserMissing] = useState(false);

  // Helper function for signing out users
  const forceSignOut = async (errorMessage: string) => {
    try {
      toast.error('Authentication error', {
        description: errorMessage,
      });
      
      console.log('Force signing out user due to:', errorMessage);
      
      await supabase.auth.signOut();
      // Clear all Supabase related tokens
      localStorage.removeItem('sb-yxssuhzzmxwtnaodgpoq-auth-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase-auth-token');
      
      // Force a page reload to clear any cached state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during forced sign out:', error);
      window.location.href = '/auth';
    }
  };

  // Get current user's role and cache it
  const { data: currentUserRole, isLoading: isRoleLoading, error: roleError, refetch: refetchRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching auth user:', userError);
          setAuthUserMissing(true);
          throw new Error('Authentication error - please sign in again');
        }
        
        if (!user) {
          console.log('No user found in usePermissions');
          setAuthUserMissing(true);
          return null;
        }

        // Verify the user token is valid with the Supabase auth API
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error('Session verification failed:', sessionError || 'No session');
          setAuthUserMissing(true);
          throw new Error('Your session has expired - please sign in again');
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
          
          // Check if this is a "not found" error, which means the profile doesn't exist
          if (error.code === 'PGRST116') {
            setNoProfileFound(true);
            console.log('Profile not found for authenticated user - possible deleted profile');
            throw new Error('User profile not found - account may have been deleted');
          }
          
          throw error;
        }

        if (!data?.role) {
          // Profile exists but has no role assigned
          console.log('Profile found but no role assigned, attempting to assign default role');
          if (!assigningDefaultRole) {
            setAssigningDefaultRole(true);
            await assignDefaultRoleIfNeeded(user.id);
            setAssigningDefaultRole(false);
          
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
          return null;
        }

        const roleData = Array.isArray(data.role) ? data.role[0] : data.role;
        const userRole: UserRole = {
          id: String(roleData.id),
          name: String(roleData.name),
          nicename: String(roleData.nicename),
          default_dashboard: roleData.default_dashboard
        };
        return userRole;
        
      } catch (error) {
        console.error('Fatal error in usePermissions:', error);
        throw error;
      }
    },
    staleTime: 60000, // Reduced cache time to 1 minute so we recheck more frequently
    retry: 1,
    retryDelay: 1000
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
    staleTime: 60000, // Reduced cache time to 1 minute
  });

  const checkPermission = useCallback(async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
      // First check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting auth user in checkPermission:', userError);
        return false;
      }

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

  // Check for auth user missing
  useEffect(() => {
    if (authUserMissing) {
      forceSignOut('Your session is invalid. Please sign in again.');
    }
  }, [authUserMissing]);

  // Check for profile not found (deleted account)
  useEffect(() => {
    if (noProfileFound) {
      forceSignOut('Your account may have been deleted. Please contact support.');
    }
  }, [noProfileFound]);

  // Check and assign default role if needed
  useEffect(() => {
    if (!isRoleLoading && !assigningDefaultRole && !currentUserRole && !noProfileFound && !authUserMissing) {
      const checkAndAssignRole = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await assignDefaultRoleIfNeeded(user.id);
            refetchRole();
          }
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      };
      
      checkAndAssignRole();
    }
  }, [isRoleLoading, currentUserRole, assigningDefaultRole, refetchRole, noProfileFound, authUserMissing]);

  return {
    permissions,
    checkPermission,
    currentUserRole,
    isLoading: isRoleLoading || assigningDefaultRole,
    error: roleError || (noProfileFound ? new Error('User profile not found') : null)
  };
};
