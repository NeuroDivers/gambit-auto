
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
  const [activeTab, setActiveTab] = useState<string>("page_access");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return null;
      
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId)
        .order("resource_name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!roleId,
  });

  const handlePermissionToggle = async (permissionId: string, newValue: boolean) => {
    try {
      const { error } = await supabase
        .from("role_permissions")
        .update({ is_active: newValue })
        .eq("id", permissionId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      
      toast({
        title: "Permission updated",
        description: "The permission has been updated successfully.",
      });
    } catch (error: any) {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Role Permissions</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="page_access">Page Access</TabsTrigger>
            <TabsTrigger value="feature_access">Feature Access</TabsTrigger>
          </TabsList>

          <TabsContent value="page_access" className="space-y-4">
            {pagePermissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between space-x-4">
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
          </TabsContent>

          <TabsContent value="feature_access" className="space-y-4">
            {featurePermissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between space-x-4">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
