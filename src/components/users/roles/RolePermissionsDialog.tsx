
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { PermissionType } from "@/types/permissions";

interface RolePermissionsDialogProps {
  roleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RolePermissionsDialog = ({
  roleId,
  open,
  onOpenChange,
}: RolePermissionsDialogProps) => {
  const [activeTab, setActiveTab] = useState<PermissionType>("page_access");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      return data;
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
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!roleId,
  });

  const handlePermissionToggle = async (permissionId: string, newValue: boolean) => {
    console.log("Updating permission:", permissionId, "to value:", newValue);
    try {
      const { error } = await supabase
        .from("role_permissions")
        .update({ 
          is_active: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", permissionId);

      if (error) {
        console.error("Error updating permission:", error);
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      
      toast({
        title: "Permission updated",
        description: "The permission has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Permission update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBayAssignmentToggle = async (newValue: boolean) => {
    if (!roleId) return;

    try {
      const { error } = await supabase
        .from("roles")
        .update({ 
          can_be_assigned_to_bay: newValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", roleId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      
      toast({
        title: "Bay assignment updated",
        description: `This role ${newValue ? "can now" : "can no longer"} be assigned to service bays.`,
      });
    } catch (error: any) {
      console.error("Bay assignment update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pagePermissions = permissions?.filter(p => p.permission_type === 'page_access') || [];
  const featurePermissions = permissions?.filter(p => p.permission_type === 'feature_access') || [];

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
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
              checked={role?.can_be_assigned_to_bay || false}
              onCheckedChange={handleBayAssignmentToggle}
            />
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value: string) => setActiveTab(value as PermissionType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="page_access">Page Access</TabsTrigger>
            <TabsTrigger value="feature_access">Feature Access</TabsTrigger>
          </TabsList>

          <TabsContent value="page_access" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {pagePermissions.map((permission) => (
                <div key={permission.id} className="flex items-start justify-between space-x-4 p-4 rounded-lg bg-muted/50">
                  <Label htmlFor={permission.id} className="flex-1">
                    <span className="font-medium">{permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    {permission.description && (
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    )}
                  </Label>
                  <Switch
                    id={permission.id}
                    checked={permission.is_active}
                    onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feature_access" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {featurePermissions.map((permission) => (
                <div key={permission.id} className="flex items-start justify-between space-x-4 p-4 rounded-lg bg-muted/50">
                  <Label htmlFor={permission.id} className="flex-1">
                    <span className="font-medium">{permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    {permission.description && (
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    )}
                  </Label>
                  <Switch
                    id={permission.id}
                    checked={permission.is_active}
                    onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
