
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Permission } from "../types/permissions";

export const useRolePermissions = (roleId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return null;
      
      console.log("Fetching permissions for role:", roleId);
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId)
        .order("resource_name");
      
      if (error) {
        console.error("Error fetching permissions:", error);
        throw error;
      }
      
      console.log("Fetched permissions:", data);
      return data as Permission[];
    },
    enabled: !!roleId,
  });

  const { data: role } = useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      if (!roleId) return null;
      
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!roleId,
  });

  const handlePermissionToggle = async (permission: Permission, newValue: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    console.log("Updating permission:", permission.id, "to value:", newValue);
    
    try {
      // Optimistically update the UI
      queryClient.setQueryData(["role-permissions", roleId], (oldData: Permission[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(p => p.id === permission.id ? { ...p, is_active: newValue } : p);
      });

      // Perform the update
      const { error: updateError } = await supabase
        .from("role_permissions")
        .update({ 
          is_active: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", permission.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      // Toast success message
      const resourceName = permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const permissionType = permission.permission_type.toLowerCase().replace(/_/g, ' ');
      const action = newValue ? "enabled" : "disabled";
      
      toast({
        title: `Permission ${action}`,
        description: `${resourceName} permission has been ${action} for ${permissionType} operations.`,
      });

    } catch (error: any) {
      console.error("Permission update error:", error);
      
      // Revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: ["role-permissions", roleId]
      });
      
      toast({
        title: "Error updating permission",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignmentToggle = async (type: 'bay' | 'work_orders', newValue: boolean) => {
    if (!roleId || isUpdating) return;

    setIsUpdating(true);
    try {
      const updateData = type === 'bay' 
        ? { can_be_assigned_to_bay: newValue }
        : { can_be_assigned_work_orders: newValue };

      // Optimistically update the UI
      queryClient.setQueryData(["role", roleId], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updateData };
      });

      // Perform the update
      const { error: updateError } = await supabase
        .from("roles")
        .update({ 
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq("id", roleId);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      const feature = type === 'bay' ? 'service bays' : 'work orders';
      const action = newValue ? "enabled" : "disabled";
      toast({
        title: `Assignment permission updated`,
        description: `This role ${newValue ? "can now" : "can no longer"} be assigned to ${feature}.`,
      });
    } catch (error: any) {
      console.error("Assignment update error:", error);
      
      // Revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: ["role", roleId]
      });
      
      toast({
        title: "Error updating assignment permission",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    permissions,
    isLoading,
    isUpdating,
    role,
    handlePermissionToggle,
    handleAssignmentToggle
  };
};
