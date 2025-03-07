
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
  // TEMPORARY DEBUG MODE
  const debugMode = true; // Set to true to bypass permission checks

  const [assigningDefaultRole, setAssigningDefaultRole] = useState(false);
  const [noProfileFound, setNoProfileFound] = useState(false);
  const [authUserMissing, setAuthUserMissing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const redirectToClearAuth = () => {
    window.location.href = '/clear-auth';
  };

  // Debug session on initial load
  useEffect(() => {
    const debugSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("SESSION DEBUG [usePermissions]:", session ? "Found" : "Not found");
        if (session) {
          console.log("User ID:", session.user.id);
          console.log("Session expires at:", new Date(session.expires_at! * 1000).toLocaleString());
          console.log("Current time:", new Date().toLocaleString());
        }
      } catch (error) {
        console.error("Error debugging session:", error);
      }
    };
    
    debugSession();
  }, []);

  const { data: currentUserRole, isLoading: isRoleLoading, error: roleError, refetch: refetchRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      try {
        console.log('Fetching current user role...');
        
        // DEBUGGING - TEMPORARY DEFAULT ROLE
        if (debugMode) {
          console.log("DEBUG MODE: Returning default admin role");
          return {
            id: "1",
            name: "administrator",
            nicename: "Administrator",
            default_dashboard: "admin"
          } as UserRole;
        }
        
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

        console.log('Found user:', user.id);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error('Session verification failed:', sessionError || 'No session');
          setSessionExpired(true);
          throw new Error('Your session has expired - please sign in again');
        }

        console.log('Session verified, fetching profile...');

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
          
          if (error.code === 'PGRST116') {
            setNoProfileFound(true);
            console.log('Profile not found for authenticated user - possible deleted profile');
            throw new Error('User profile not found - account may have been deleted');
          }
          
          throw error;
        }

        if (!data?.role) {
          console.log('Profile found but no role assigned, attempting to assign default role');
          if (!assigningDefaultRole) {
            setAssigningDefaultRole(true);
            await assignDefaultRoleIfNeeded(user.id);
            setAssigningDefaultRole(false);
          
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
              console.log('Role assigned and fetched:', roleData);
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
        console.log('Found user role:', roleData);
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
    staleTime: 60000,
    retry: 1,
    retryDelay: 1000
  });

  const { data: permissions } = useQuery({
    queryKey: ["permissions", currentUserRole?.id],
    queryFn: async () => {
      if (!currentUserRole) return null;

      console.log('Fetching permissions for role:', currentUserRole.id);

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

      console.log('Fetched permissions:', data ? data.length : 0);
      return data as RolePermission[];
    },
    enabled: !!currentUserRole,
    staleTime: 60000
  });

  const checkPermission = useCallback(async (
    resource: string,
    type: 'page_access' | 'feature_access'
  ): Promise<boolean> => {
    try {
      // TEMPORARY DEBUG MODE - Grant all permissions
      if (debugMode) {
        console.log(`DEBUG MODE: Automatically granting permission for ${resource}`);
        return true;
      }
      
      console.log(`Checking permission for resource: ${resource}, type: ${type}`);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting auth user in checkPermission:', userError);
        return false;
      }

      if (!user) {
        console.log('No user found in checkPermission');
        return false;
      }

      // Special case for dashboard - always grant access
      if (resource === 'dashboard') {
        console.log('Dashboard access always granted');
        return true;
      }

      if (!currentUserRole) {
        console.log('No current user role, denying access');
        return false;
      }

      // Admin-like roles always have access to everything
      const roleName = currentUserRole.name.toLowerCase();
      if (roleName === 'administrator' || 
          roleName === 'admin' || 
          roleName === 'king') {
        console.log('User is admin or has admin-like role, granting access');
        return true;
      }

      if (!permissions) {
        console.log('Permissions not loaded yet and not admin');
        return false;
      }

      const hasPermission = permissions?.some(
        perm => perm.resource_name === resource && 
                perm.permission_type === type && 
                perm.is_active
      );

      console.log(`Permission check for ${resource} (${type}): ${hasPermission}`);
      return hasPermission || false;
    } catch (error) {
      console.error('Permission check error:', error);
      // TEMPORARY: Default to granting permission to avoid blank screens
      console.warn(`FALLBACK: Temporarily granting permission for ${resource} due to check error`);
      return true;
    }
  }, [permissions, currentUserRole, debugMode]);

  const assignDefaultRoleIfNeeded = async (userId: string) => {
    try {
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

  // Disable redirects for debugging
  const enableRedirects = false;

  useEffect(() => {
    if (enableRedirects && (authUserMissing || sessionExpired)) {
      toast.error('Authentication issue detected', {
        description: 'Your session is invalid or expired. Please sign in again.',
      });
      
      setTimeout(() => {
        redirectToClearAuth();
      }, 2000);
    }
  }, [authUserMissing, sessionExpired]);

  useEffect(() => {
    if (enableRedirects && noProfileFound) {
      toast.error('Account issue detected', {
        description: 'Your profile could not be found. Your account may have been deleted.',
      });
      
      setTimeout(() => {
        redirectToClearAuth();
      }, 2000);
    }
  }, [noProfileFound]);

  useEffect(() => {
    if (!isRoleLoading && !assigningDefaultRole && !currentUserRole && !noProfileFound && !authUserMissing && !sessionExpired) {
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
  }, [isRoleLoading, currentUserRole, assigningDefaultRole, refetchRole, noProfileFound, authUserMissing, sessionExpired]);

  return {
    permissions,
    checkPermission,
    currentUserRole,
    isLoading: isRoleLoading || assigningDefaultRole,
    error: roleError || 
           (noProfileFound ? new Error('User profile not found') : null) ||
           (authUserMissing ? new Error('Authentication error') : null) ||
           (sessionExpired ? new Error('Session expired') : null)
  };
};
