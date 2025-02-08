
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PermissionType } from "@/types/permissions";

interface RolePermissionsDialogProps {
  roleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Permission = {
  id: string;
  role_id: string;
  resource_name: string;
  permission_type: PermissionType;
  is_active: boolean;
  description?: string;
};

type GroupedPermissions = Record<string, Permission[]>;

export const RolePermissionsDialog = ({
  roleId,
  open,
  onOpenChange,
}: RolePermissionsDialogProps) => {
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

  const handleBayAssignmentToggle = async (newValue: boolean) => {
    if (!roleId || isUpdating) return;

    setIsUpdating(true);
    try {
      // Optimistically update the UI
      queryClient.setQueryData(["role", roleId], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, can_be_assigned_to_bay: newValue };
      });

      // Perform the update
      const { error: updateError } = await supabase
        .from("roles")
        .update({ 
          can_be_assigned_to_bay: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", roleId);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      const action = newValue ? "enabled" : "disabled";
      toast({
        title: "Bay assignment updated",
        description: `This role ${newValue ? "can now" : "can no longer"} be assigned to service bays. Bay assignment has been ${action}.`,
      });
    } catch (error: any) {
      console.error("Bay assignment update error:", error);
      
      // Revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: ["role", roleId]
      });
      
      toast({
        title: "Error updating bay assignment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return null;
  }

  const groupedPermissions = permissions?.reduce((acc: GroupedPermissions, permission) => {
    const section = permission.permission_type;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(permission);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Manage Role Permissions</DialogTitle>
        </DialogHeader>

        <div className="mb-6 pb-6 border-b">
          <div className="flex items-start justify-between space-x-4">
            <Label htmlFor="bay-assignment" className="flex-1">
              <span className="font-medium">Bay Assignment</span>
              <p className="text-sm text-muted-foreground">
                Allow this role to be assigned to service bays
              </p>
            </Label>
            <Switch
              id="bay-assignment"
              name="bay-assignment"
              checked={role?.can_be_assigned_to_bay || false}
              onCheckedChange={handleBayAssignmentToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {groupedPermissions && Object.entries(groupedPermissions).map(([section, sectionPermissions]) => (
            <div key={section} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                {section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {sectionPermissions.map((permission) => {
                  const switchId = `permission-${permission.id}`;
                  return (
                    <div key={permission.id} className="flex items-start justify-between space-x-4 p-4 rounded-lg bg-muted/50">
                      <Label htmlFor={switchId} className="flex-1">
                        <span className="font-medium">{permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        {permission.description && (
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        )}
                      </Label>
                      <Switch
                        id={switchId}
                        name={switchId}
                        checked={permission.is_active}
                        onCheckedChange={(checked) => handlePermissionToggle(permission, checked)}
                        disabled={isUpdating}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
